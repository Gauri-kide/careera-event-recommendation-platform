import pandas as pd
import pickle
from pathlib import Path
import numpy as np

from sklearn.decomposition import LatentDirichletAllocation
from sklearn.feature_extraction.text import CountVectorizer
from sklearn.metrics.pairwise import cosine_similarity

BASE_DIR = Path(__file__).resolve().parent
MODELS_DIR = BASE_DIR / "models"

events_df = pd.read_csv(BASE_DIR / "data" / "processed_events.csv")

# Import features module for ranker-based recommendations
try:
    from features import user_event_features, load_tfidf_vectorizer
    ranker_available = True
except ImportError:
    ranker_available = False

def train_models():
    texts = events_df["cleaned_text"].fillna("")

    vectorizer = CountVectorizer(stop_words="english")
    X = vectorizer.fit_transform(texts)

    lda_model = LatentDirichletAllocation(
        n_components=5,
        random_state=42,
    )
    lda_model.fit(X)

    MODELS_DIR.mkdir(parents=True, exist_ok=True)
    with open(MODELS_DIR / "lda_model.pkl", "wb") as f:
        pickle.dump(lda_model, f)
    with open(MODELS_DIR / "vectorizer.pkl", "wb") as f:
        pickle.dump(vectorizer, f)

    return lda_model, vectorizer

try:
    with open(MODELS_DIR / "lda_model.pkl", "rb") as f:
        lda_model = pickle.load(f)

    with open(MODELS_DIR / "vectorizer.pkl", "rb") as f:
        vectorizer = pickle.load(f)

    X = vectorizer.transform(events_df["cleaned_text"].fillna(""))
    event_vectors = lda_model.transform(X)
except Exception:
    lda_model, vectorizer = train_models()
    X = vectorizer.transform(events_df["cleaned_text"].fillna(""))
    event_vectors = lda_model.transform(X)
# Precompute topic keywords for frontend display
def get_topic_keywords(lda_model, vectorizer, top_n=8):
    try:
        feature_names = vectorizer.get_feature_names_out()
    except Exception:
        feature_names = vectorizer.get_feature_names()
    topics = []
    components = lda_model.components_
    for t_idx, comp in enumerate(components):
        top_indices = np.argsort(comp)[::-1][:top_n]
        top_words = [feature_names[i] for i in top_indices]
        topics.append({"id": int(t_idx), "keywords": top_words})
    return topics

TOPIC_KEYWORDS = get_topic_keywords(lda_model, vectorizer)

# Load ranker and TF-IDF vectorizer for LambdaMART-based recommendations
ranker = None
tfidf_vectorizer = None
if ranker_available:
    try:
        with open(MODELS_DIR / "ranker.pkl", "rb") as f:
            ranker = pickle.load(f)
        tfidf_vectorizer = load_tfidf_vectorizer()
        print("[recommender.py] Loaded LambdaMART ranker and TF-IDF vectorizer")
    except Exception as e:
        ranker = None
        tfidf_vectorizer = None
        print(f"[recommender.py] Warning: Could not load ranker ({e}); will use LDA-based fallback")

def recommend_events(interests, top_n=5):

    user_text = " ".join(interests)

    user_vector = vectorizer.transform(
        [user_text]
    )

    user_topic_vector = lda_model.transform(
        user_vector
    )

    similarity_scores = cosine_similarity(
        user_topic_vector,
        event_vectors
    ).flatten()

    events_df["score"] = similarity_scores

    # compute dominant topic per event
    dominant_topics = np.argmax(event_vectors, axis=1)

    recommendations = events_df.sort_values(by="score", ascending=False)

    results = []
    for _, row in recommendations.head(top_n).iterrows():
        idx = int(row.name)
        topic_id = int(dominant_topics[idx])
        results.append({
            "event_name": row.get("event_name"),
            "location": row.get("location"),
            "type": row.get("type"),
            "score": float(row.get("score", 0)),
            "topic": topic_id,
            "topic_keywords": TOPIC_KEYWORDS[topic_id]["keywords"],
        })

    return results


def recommend_from_events_list(interests, events_list, top_n=5):
    if not events_list or not interests:
        return []

    # Try ranker-based scoring if available
    if ranker is not None and ranker_available:
        try:
            df = pd.DataFrame(events_list)
            # Normalize cleaned_text column name if needed
            if "cleaned_text" not in df.columns and "cleaned" in df.columns:
                df = df.rename(columns={"cleaned": "cleaned_text"})
            elif "cleaned_text" not in df.columns:
                # Fallback: use description or other fields to build cleaned_text
                df["cleaned_text"] = (
                    df.get("description", "").fillna("") + " " +
                    df.get("title", "").fillna("") + " " +
                    df.get("tags", "").fillna("")
                )

            X, feature_names, _ = user_event_features(
                interests, df, lda_model, vectorizer,
                tfidf_vectorizer=tfidf_vectorizer
            )
            scores = ranker.predict(X)

            for i, s in enumerate(scores):
                events_list[i]["score"] = float(s)
            # attach dominant topic + keywords using vectorizer + lda_model
            try:
                texts = [
                    e.get("cleaned_text", "") or (
                        " ".join(filter(None, [e.get("description", ""), e.get("title", "")]))
                    )
                    for e in events_list
                ]
                ev_X = vectorizer.transform(texts)
                ev_topics = lda_model.transform(ev_X)
                for i, e in enumerate(events_list):
                    tid = int(np.argmax(ev_topics[i]))
                    e["topic"] = tid
                    e["topic_keywords"] = TOPIC_KEYWORDS[tid]["keywords"]
            except Exception:
                pass
            events_list.sort(key=lambda e: e.get("score", 0), reverse=True)
            return events_list[:top_n]
        except Exception as e:
            # Fallback to LDA cosine if ranker fails
            print(f"[recommend_from_events_list] Ranker prediction failed ({e}); using LDA fallback")

    # Fallback: existing LDA cosine scorer
    user_text = " ".join(interests)
    user_vector = vectorizer.transform([user_text])
    user_topic_vector = lda_model.transform(user_vector)

    for event in events_list:
        text = " ".join(filter(None, [
            event.get("title", ""),
            event.get("description", ""),
            event.get("type", ""),
            " ".join(event.get("tags", []) if isinstance(event.get("tags"), list) else [])
        ]))
        ev_vector = vectorizer.transform([text])
        ev_topic = lda_model.transform(ev_vector)
        score = float(cosine_similarity(user_topic_vector, ev_topic).flatten()[0])
        tid = int(np.argmax(ev_topic))
        event["score"] = round(score, 4)
        event["topic"] = tid
        event["topic_keywords"] = TOPIC_KEYWORDS[tid]["keywords"]

    events_list.sort(key=lambda e: e.get("score", 0), reverse=True)
    return events_list[:top_n]