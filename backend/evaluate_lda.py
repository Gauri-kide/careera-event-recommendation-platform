# backend/evaluate_lda.py
import sys
from pathlib import Path
import pickle
import numpy as np
import pandas as pd
from sklearn.feature_extraction.text import CountVectorizer
from sklearn.decomposition import LatentDirichletAllocation
from sklearn.metrics import accuracy_score, confusion_matrix
from sklearn.metrics.pairwise import cosine_similarity

BASE = Path(__file__).resolve().parent
events = pd.read_csv(BASE / "data" / "processed_events.csv")

# Ensure cleaned_text exists
if "cleaned_text" not in events.columns and "cleaned" in events.columns:
    events = events.rename(columns={"cleaned": "cleaned_text"})

texts = events["cleaned_text"].fillna("")

# Load existing models if present, else train fresh
MODELS_DIR = BASE / "models"
try:
    with open(MODELS_DIR / "lda_model.pkl", "rb") as f:
        lda_model = pickle.load(f)
    with open(MODELS_DIR / "vectorizer.pkl", "rb") as f:
        vectorizer = pickle.load(f)
    print("[OK] Loaded saved LDA model & vectorizer")
except Exception as e:
    print(f"Could not load saved models ({e}), training fresh...")
    vectorizer = CountVectorizer(stop_words="english")
    X = vectorizer.fit_transform(texts)
    lda_model = LatentDirichletAllocation(n_components=5, random_state=42)
    lda_model.fit(X)
    MODELS_DIR.mkdir(parents=True, exist_ok=True)
    with open(MODELS_DIR / "lda_model.pkl", "wb") as f:
        pickle.dump(lda_model, f)
    with open(MODELS_DIR / "vectorizer.pkl", "wb") as f:
        pickle.dump(vectorizer, f)
    print("[OK] Trained and saved LDA model & vectorizer")

print("\n" + "="*80)
print("LDA MODEL EVALUATION REPORT")
print("="*80)

X = vectorizer.transform(texts)
perplexity = lda_model.perplexity(X)
log_likelihood = lda_model.score(X)

print(f"\n📊 LDA Model Metrics:")
print(f"   Perplexity (lower is better):           {perplexity:.4f}")
print(f"   Log-likelihood (higher is better):      {log_likelihood:.4f}")
print(f"   Number of topics:                       {lda_model.n_components}")
print(f"   Number of events:                       {len(events)}")

# Topic words
print(f"\n📌 Top 10 Words per Topic:")
print("-" * 80)
feature_names = vectorizer.get_feature_names_out()
for i, topic in enumerate(lda_model.components_):
    top = [feature_names[idx] for idx in topic.argsort()[:-11:-1]]
    print(f"   Topic {i}: {', '.join(top)}")

# Topic assignment per event
event_topics = lda_model.transform(X)  # (n_events, n_topics)
pred_topics = event_topics.argmax(axis=1)

print(f"\n📍 Topic Distribution per Event:")
print("-" * 80)
for i in range(min(10, len(events))):
    row = events.iloc[i]
    dominant_topic = pred_topics[i]
    confidence = event_topics[i].max()
    print(f"   [{row.get('event_name', 'N/A')[:40]:<40}] Topic {dominant_topic} (conf: {confidence:.4f})")

# If type column exists, map topics -> type via majority vote and compute accuracy/confusion matrix
if "type" in events.columns:
    print(f"\n🎯 Classification Accuracy (LDA → Event Type Mapping):")
    print("-" * 80)
    df = events.copy()
    df["pred_topic"] = pred_topics

    # Create topic -> type mapping via majority vote
    topic_to_type = {}
    for t in range(lda_model.n_components):
        mode = df[df["pred_topic"] == t]["type"].mode()
        topic_to_type[t] = mode.iloc[0] if not mode.empty else "UNKNOWN"

    print(f"   Topic → Type Mapping:")
    for t, ev_type in topic_to_type.items():
        print(f"      Topic {t} → {ev_type}")

    predicted_types = [topic_to_type[t] for t in pred_topics]
    true_types = df["type"].fillna("UNKNOWN").tolist()

    acc = accuracy_score(true_types, predicted_types)
    unique_types = sorted(df["type"].fillna("UNKNOWN").unique())

    print(f"\n   Overall Accuracy: {acc:.4f}")
    print(f"\n   Confusion Matrix ({len(unique_types)} event types):")
    print(f"   {'':30s} {'Predicted (Event Types)':50s}")

    cm = confusion_matrix(true_types, predicted_types, labels=unique_types)

    # Pretty print confusion matrix
    print(f"\n   Actual\\Predicted | " + " | ".join([f"{t[:8]:>8s}" for t in unique_types[:5]]))
    print(f"   {'-'*80}")
    for i, actual_type in enumerate(unique_types[:5]):
        row_str = f"   {actual_type[:15]:15s} | "
        row_str += " | ".join([f"{cm[i,j]:>8d}" for j in range(min(5, len(unique_types)))])
        print(row_str)

    if len(unique_types) > 5:
        print(f"   ... ({len(unique_types)} total event types)")

    print(f"\n   Full Confusion Matrix Shape: {cm.shape}")
    np.set_printoptions(threshold=1000, linewidth=120)
    print(f"   {cm}")
else:
    print(f"\n⚠️  No 'type' column in events; skipping type-based accuracy/confusion matrix")

# Optional: compute simple topic coherence (pairwise word co-occurrence score)
print(f"\n🔗 Topic Coherence (Pairwise Word Co-occurrence):")
print("-" * 80)
word_doc = X.T  # word x docs
for t, comp in enumerate(lda_model.components_):
    top_idx = comp.argsort()[:-11:-1]
    scores = []
    for i in range(len(top_idx)):
        for j in range(i+1, len(top_idx)):
            vi = word_doc[top_idx[i]].toarray().ravel()
            vj = word_doc[top_idx[j]].toarray().ravel()
            # cosine similarity for word vectors across documents
            norm_vi = np.linalg.norm(vi)
            norm_vj = np.linalg.norm(vj)
            if norm_vi == 0 or norm_vj == 0:
                sim = 0
            else:
                sim = np.dot(vi, vj) / (norm_vi * norm_vj)
            scores.append(sim)
    mean_sim = np.mean(scores) if scores else 0.0
    print(f"   Topic {t}: {mean_sim:.4f}")

print("\n" + "="*80)
print("[OK] Evaluation complete!")
print("="*80)

