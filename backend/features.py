# backend/features.py
import numpy as np
import pandas as pd
import pickle
from pathlib import Path
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity

BASE_DIR = Path(__file__).resolve().parent
MODELS_DIR = BASE_DIR / "models"

def load_tfidf_vectorizer():
    p = MODELS_DIR / "tfidf_vectorizer.pkl"
    if p.exists():
        with open(p, "rb") as f:
            return pickle.load(f)
    return None

def save_tfidf_vectorizer(vec):
    MODELS_DIR.mkdir(parents=True, exist_ok=True)
    with open(MODELS_DIR / "tfidf_vectorizer.pkl", "wb") as f:
        pickle.dump(vec, f)

def build_event_topic_vectors(lda_model, vectorizer, texts):
    X = vectorizer.transform(texts.fillna(""))
    return lda_model.transform(X)  # shape (n_events, n_topics)

def build_tfidf_matrix(texts, max_features=5000):
    tfidf = TfidfVectorizer(stop_words="english", max_features=max_features)
    mat = tfidf.fit_transform(texts.fillna(""))
    return tfidf, mat

def user_event_features(user_interests, events_df, lda_model, count_vectorizer,
                        tfidf_vectorizer=None, tfidf_matrix=None):
    """
    Returns:
      X: numpy array shape (n_events, n_features)
      feature_names: list[str]
      tfidf_vectorizer: fitted vectorizer (returned if we fitted one)
    """
    # Prepare user text
    if isinstance(user_interests, (list, tuple)):
        user_text = " ".join([str(x) for x in user_interests])
    else:
        user_text = str(user_interests or "")

    # Topic vectors
    user_vec = count_vectorizer.transform([user_text])
    user_topic = lda_model.transform(user_vec)[0]  # (K,)

    ev_texts = events_df.get("cleaned_text") if "cleaned_text" in events_df.columns else events_df.get("cleaned")
    if ev_texts is None:
        raise ValueError("Events dataframe must have 'cleaned_text' or 'cleaned' column")
    
    ev_texts = ev_texts.fillna("")

    event_X = count_vectorizer.transform(ev_texts)
    event_topics = lda_model.transform(event_X)  # (n_events, K)

    # TF-IDF
    if tfidf_vectorizer is None:
        tfidf_vectorizer, tfidf_matrix = build_tfidf_matrix(ev_texts)
        save_tfidf_vectorizer(tfidf_vectorizer)
    else:
        if tfidf_matrix is None:
            tfidf_matrix = tfidf_vectorizer.transform(ev_texts)

    user_tfidf = tfidf_vectorizer.transform([user_text])
    n_events = len(events_df)
    K = user_topic.shape[0]

    rows = []
    for i, (_, row) in enumerate(events_df.reset_index(drop=True).iterrows()):
        ev_topic = event_topics[i]
        topic_cos = float(cosine_similarity([user_topic], [ev_topic])[0][0])
        topic_diff = np.abs(user_topic - ev_topic)   # K
        topic_prod = user_topic * ev_topic          # K

        tfidf_cos = float(cosine_similarity(user_tfidf, tfidf_matrix[i])[0][0])

        # Metadata/features - fallbacks if columns missing
        popularity = float(row.get("num_interactions", 0))
        cat_val = str(row.get("type", "") or row.get("category", "") or "")
        # simple hash-encoding for category
        cat_hash = (hash(cat_val) % 1000) / 1000.0

        base = [topic_cos, tfidf_cos, popularity, cat_hash]
        f = np.concatenate([base, topic_diff, topic_prod])
        rows.append(f)

    # Build feature names
    feature_names = ["topic_cos", "tfidf_cos", "popularity", "category_hash"] + \
                    [f"topic_diff_{i}" for i in range(K)] + \
                    [f"topic_prod_{i}" for i in range(K)]
    X = np.vstack(rows)
    return X, feature_names, tfidf_vectorizer

