import sys
import numpy as np
import pandas as pd
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent / "backend"
sys.path.insert(0, str(BASE_DIR))
from recommender import recommend_events

from sklearn.feature_extraction.text import CountVectorizer
from sklearn.decomposition import LatentDirichletAllocation
from sklearn.metrics.pairwise import cosine_similarity

np.set_printoptions(precision=4, suppress=True)

print("=" * 72)
print("  CAREERA RECOMMENDER SYSTEM — ML EVALUATION REPORT")
print("=" * 72)

events_df = pd.read_csv(BASE_DIR / "data" / "processed_events.csv")
raw_events = pd.read_csv(BASE_DIR / "data" / "raw" / "Events_updated.csv")
interactions = pd.read_csv(BASE_DIR / "data" / "raw" / "Interactions_updated.csv")

# ──────────────────────────────────────────────
# 1. LDA TOPIC MODEL EVALUATION
# ──────────────────────────────────────────────
print("\n" + "-" * 72)
print("  1. LDA TOPIC MODEL EVALUATION")
print("-" * 72)

texts = events_df["cleaned_text"].fillna("")

vectorizer = CountVectorizer(stop_words="english")
X = vectorizer.fit_transform(texts)

lda_model = LatentDirichletAllocation(n_components=5, random_state=42)
lda_model.fit(X)

perplexity = lda_model.perplexity(X)
log_likelihood = lda_model.score(X)
print(f"\n  Perplexity (lower is better):          {perplexity:.2f}")
print(f"  Log-likelihood (higher is better):     {log_likelihood:.2f}")

feature_names = vectorizer.get_feature_names_out()
print("\n  Top 10 terms per topic:\n")
for topic_idx, topic in enumerate(lda_model.components_):
    top_words = [feature_names[i] for i in topic.argsort()[:-11:-1]]
    print(f"    Topic {topic_idx + 1}: {', '.join(top_words)}")

print("\n  Topic distribution per event:\n")
event_topics = lda_model.transform(X)
for i, row in events_df.iterrows():
    dominant = event_topics[i].argmax() + 1
    conf = event_topics[i].max()
    print(f"    [{row['event_name'][:35]:<35}] Topic {dominant} (confidence: {conf:.2f})")

print("\n  Topic coherence (avg pairwise word-doc similarity):\n")
word_vectors = X.T
for topic_idx, topic in enumerate(lda_model.components_):
    top_idx = topic.argsort()[:-11:-1]
    scores = []
    for i in range(len(top_idx)):
        for j in range(i + 1, len(top_idx)):
            vi = word_vectors[top_idx[i]].toarray().ravel()
            vj = word_vectors[top_idx[j]].toarray().ravel()
            scores.append(cosine_similarity([vi], [vj])[0][0])
    avg = np.mean(scores) if scores else 0
    print(f"    Topic {topic_idx + 1}: {avg:.4f}")

# ──────────────────────────────────────────────
# 2. RECOMMENDATION QUALITY (QUERY-BASED)
# ──────────────────────────────────────────────
print("\n" + "-" * 72)
print("  2. RECOMMENDATION QUALITY — TEST QUERIES")
print("-" * 72)

test_cases = [
    (["AI", "Machine Learning"], True),
    (["Cricket", "Sports"], True),
    (["Music", "Concert"], True),
    (["Hackathon", "Coding"], True),
    (["Startup", "Entrepreneurship"], True),
]

print(f"\n  {'Query':<35} {'Top-5 Recommendations':<60}")
print("  " + "-" * 93)
for interests, _ in test_cases:
    recs = recommend_events(interests, top_n=5)
    line = ", ".join(interests)
    names = [f"({r['score']:.2f}) {r['event_name'][:25]}" for r in recs]
    print(f"  {line:<35} {'  |  '.join(names):<60}")

# ──────────────────────────────────────────────
# 3. HISTORICAL INTERACTION EVALUATION
# ──────────────────────────────────────────────
print("\n" + "-" * 72)
print("  3. HISTORICAL INTERACTION EVALUATION")
print("-" * 72)
print("\n  Building evaluation model on full event dataset...")

raw = raw_events.dropna(subset=["event_name", "description", "type"]).copy()
raw["cleaned"] = (
    raw["event_name"].fillna("") + " " +
    raw["description"].fillna("") + " " +
    raw["type"].fillna("")
).str.lower().str.replace(r"[^a-z0-9\s]", "", regex=True)

ev_vectorizer = CountVectorizer(stop_words="english", max_features=1000)
ev_X = ev_vectorizer.fit_transform(raw["cleaned"])
ev_lda = LatentDirichletAllocation(n_components=10, random_state=42)
ev_lda.fit(ev_X)
ev_vectors = ev_lda.transform(ev_X)
raw["event_vector"] = list(ev_vectors)

merged = interactions.merge(raw[["event_id", "event_name", "cleaned", "event_vector"]],
                             on="event_id", how="inner")
merged["rating"] = merged["action"].map({"joined": 5, "interested": 3}).fillna(1)

user_groups = merged.groupby("user_id")
active_users = user_groups.filter(lambda x: len(x) >= 3)["user_id"].unique()[:200]

hit_at = {1: 0, 5: 0, 10: 0}
reciprocal_ranks = []
trial_count = 0

for uid in active_users:
    user_data = merged[merged["user_id"] == uid].reset_index(drop=True)
    for hold in range(len(user_data)):
        train = user_data.drop(index=hold).reset_index(drop=True)
        held = user_data.loc[hold]

        if train["event_vector"].isnull().any():
            continue

        query_vec = np.mean(np.stack(train["event_vector"].values), axis=0).reshape(1, -1)
        held_vec = held["event_vector"].reshape(1, -1)

        sims = cosine_similarity(query_vec, ev_vectors).flatten()
        ranked = np.argsort(sims)[::-1]

        trial_count += 1
        for rank_pos, idx in enumerate(ranked[:10], 1):
            if raw.iloc[idx]["event_id"] == held["event_id"]:
                for k in hit_at:
                    if rank_pos <= k:
                        hit_at[k] += 1
                reciprocal_ranks.append(1.0 / rank_pos)
                break
        else:
            reciprocal_ranks.append(0.0)

n = trial_count if trial_count else 1
print(f"\n  Users sampled:        {len(active_users)}")
print(f"  Holdout trials:        {n}")
print(f"\n  Hit Rate @1:           {hit_at[1] / n:.4f}")
print(f"  Hit Rate @5:           {hit_at[5] / n:.4f}")
print(f"  Hit Rate @10:          {hit_at[10] / n:.4f}")
print(f"  MRR:                   {np.mean(reciprocal_ranks):.4f}")

# ──────────────────────────────────────────────
# 4. SELF-SIMILARITY EVALUATION
# ──────────────────────────────────────────────
print("\n" + "-" * 72)
print("  4. RECOMMENDATION DIVERSITY / SELF-SIMILARITY")
print("-" * 72)

print("\n  Avg pairwise similarity among top-5 recs per query:\n")
for interests, _ in test_cases:
    recs = recommend_events(interests, top_n=5)
    texts_list = [r["event_name"] for r in recs]
    if len(texts_list) < 2:
        continue
    tv = vectorizer.transform(texts_list)
    sim_matrix = cosine_similarity(tv)
    mask = np.ones(sim_matrix.shape) - np.eye(sim_matrix.shape[0])
    avg_sim = sim_matrix[mask.astype(bool)].mean()
    print(f"  {str(interests):<35} avg pairwise similarity: {avg_sim:.4f}")

# ──────────────────────────────────────────────
# 5. SUMMARY
# ──────────────────────────────────────────────
print("\n" + "-" * 72)
print("  5. SUMMARY")
print("-" * 72)
print(f"""
  LDA MODEL
    Perplexity:                          {perplexity:.2f}
    Log-likelihood:                      {log_likelihood:.2f}
    Topics:                              5

  RECOMMENDATIONS
    Test queries:                        {len(test_cases)}
    Events in catalog:                   {len(events_df)}

  INTERACTION EVALUATION
    Users evaluated:                     {len(active_users)}
    Holdout trials:                      {n}
    Hit Rate @1:                         {hit_at[1] / n:.4f}
    Hit Rate @5:                         {hit_at[5] / n:.4f}
    Hit Rate @10:                        {hit_at[10] / n:.4f}
    MRR:                                 {np.mean(reciprocal_ranks):.4f}
""")
print("=" * 72)
