# backend/train_ranker.py
import pickle
from pathlib import Path
import numpy as np
import pandas as pd
from sklearn.model_selection import train_test_split
from lightgbm import LGBMRanker
from features import user_event_features, load_tfidf_vectorizer

BASE = Path(__file__).resolve().parent
MODELS_DIR = BASE / "models"
MODELS_DIR.mkdir(parents=True, exist_ok=True)

# Config
CANDIDATE_SIZE = 200  # number of candidate events per user (sample)
RANDOM_STATE = 42

print("Loading data...")
# Load data and models
events = pd.read_csv(BASE / "data" / "processed_events.csv")
interactions = pd.read_csv(BASE / "data" / "raw" / "Interactions_updated.csv")

print(f"Events shape: {events.shape}")
print(f"Interactions shape: {interactions.shape}")
print(f"Events columns: {events.columns.tolist()}")
print(f"Interactions columns: {interactions.columns.tolist()}")

# Ensure id column exists in events (used for matching with event_id in interactions)
if "id" not in events.columns:
    raise ValueError("Events must have 'id' column")

# Rename for consistency in features.py
if "cleaned_text" not in events.columns and "cleaned" in events.columns:
    events = events.rename(columns={"cleaned": "cleaned_text"})

# Load LDA + CountVectorizer
print("Loading LDA model and vectorizer...")
with open(MODELS_DIR / "lda_model.pkl", "rb") as f:
    lda_model = pickle.load(f)
with open(MODELS_DIR / "vectorizer.pkl", "rb") as f:
    count_vectorizer = pickle.load(f)

tfidf_vec = load_tfidf_vectorizer()  # may be None

# Map actions to labels
label_map = {"joined": 5, "interested": 3}
interactions["label"] = interactions["action"].map(label_map).fillna(0).astype(int)

print("Building training dataset from interactions...")
# Build per-user training groups
users = interactions["user_id"].unique()
X_rows = []
y_rows = []
group = []
users_processed = 0
users_skipped = 0

for uid in users:
    u_actions = interactions[interactions["user_id"] == uid]
    if u_actions.empty:
        users_skipped += 1
        continue

    # Sample candidate events (positives plus random negatives)
    pos_event_ids = u_actions["event_id"].unique().tolist()

    # Get events matching positive interactions
    pos_events = events[events["id"].isin(pos_event_ids)]

    # Sample negatives from events not interacted by user
    neg_pool = events[~events["id"].isin(pos_event_ids)]
    if len(neg_pool) <= 0:
        users_skipped += 1
        continue

    neg_count = min(CANDIDATE_SIZE - len(pos_events), len(neg_pool))
    if neg_count <= 0:
        neg_count = min(CANDIDATE_SIZE, len(neg_pool))

    neg_sample = neg_pool.sample(n=neg_count, random_state=RANDOM_STATE)
    candidates = pd.concat([pos_events, neg_sample], ignore_index=True)
    # Ensure deterministic order
    candidates = candidates.reset_index(drop=True)

    if len(candidates) < 2:
        users_skipped += 1
        continue

    # Build labels aligned with candidates order
    labels = []
    for _, erow in candidates.iterrows():
        eid = erow["id"]
        match = u_actions[u_actions["event_id"] == eid]
        if not match.empty:
            labels.append(int(match.iloc[0]["label"]))
        else:
            labels.append(0)

    # Skip if no label variance
    if len(set(labels)) <= 1:
        users_skipped += 1
        continue

    # For user interests, use action types or tag text as proxy
    # Better: use the event tags/types they interacted with
    interest_proxy = " ".join(candidates[candidates["id"].isin(pos_event_ids)]["type"].fillna("").unique())
    if not interest_proxy.strip():
        interest_proxy = "event interest"

    # Generate features for this user over candidate events
    try:
        feats, feat_names, tfidf_vec = user_event_features(
            interest_proxy,
            candidates,
            lda_model,
            count_vectorizer,
            tfidf_vectorizer=tfidf_vec
        )
    except Exception as e:
        print(f"Error generating features for user {uid}: {e}")
        users_skipped += 1
        continue

    X_rows.append(feats)
    y_rows.extend(labels)
    group.append(len(labels))
    users_processed += 1

print(f"Users processed: {users_processed}, skipped: {users_skipped}")

# Combine rows
if not X_rows:
    raise SystemExit("No training data created — check interactions and events data")

X = np.vstack(X_rows)
y = np.array(y_rows)

print(f"Training set shape: X={X.shape}, y={y.shape}")
print(f"Number of groups: {len(group)}")

# Split groups into train/val at user level
group_idx = np.arange(len(group))
train_idx, val_idx = train_test_split(group_idx, test_size=0.15, random_state=RANDOM_STATE)

def subset_by_group(X_rows_list, idx_list):
    rows = []
    for idx in idx_list:
        rows.append(X_rows_list[idx])
    return np.vstack(rows) if rows else np.array([]).reshape(0, X_rows_list[0].shape[1])

# Build train/val sets
train_groups = [group[i] for i in train_idx]
val_groups = [group[i] for i in val_idx]

X_train = subset_by_group(X_rows, train_idx)
X_val = subset_by_group(X_rows, val_idx)

# Build y arrays aligned with groups
y_train_list = []
y_val_list = []
y_pos = 0
for i, g_size in enumerate(group):
    if i in train_idx:
        y_train_list.extend(y[y_pos:y_pos+g_size])
    else:
        y_val_list.extend(y[y_pos:y_pos+g_size])
    y_pos += g_size

y_train = np.array(y_train_list)
y_val = np.array(y_val_list)

print(f"Train set: X={X_train.shape}, y={y_train.shape}, groups={len(train_groups)}")
print(f"Val set: X={X_val.shape}, y={y_val.shape}, groups={len(val_groups)}")

# Train LGBMRanker
print("Training LambdaMART (LGBMRanker)...")
ranker = LGBMRanker(objective="lambdarank", metric="ndcg", random_state=RANDOM_STATE,
                    n_estimators=200, learning_rate=0.05, num_leaves=31, verbose=10)
ranker.fit(X_train, y_train, group=train_groups, eval_set=[(X_val, y_val)], eval_group=[val_groups])

print("Training complete!")

# Save models
print("Saving models...")
with open(MODELS_DIR / "ranker.pkl", "wb") as f:
    pickle.dump(ranker, f)
if tfidf_vec is not None:
    with open(MODELS_DIR / "tfidf_vectorizer.pkl", "wb") as f:
        pickle.dump(tfidf_vec, f)

print(f"[OK] Ranker saved to {MODELS_DIR / 'ranker.pkl'}")
print(f"[OK] TF-IDF vectorizer saved to {MODELS_DIR / 'tfidf_vectorizer.pkl'}")

