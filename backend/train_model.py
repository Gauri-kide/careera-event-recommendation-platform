import pandas as pd
import pickle

from sklearn.feature_extraction.text import CountVectorizer
from sklearn.decomposition import LatentDirichletAllocation

# LOAD DATA
events_df = pd.read_csv(
    "data/processed_events.csv"
)

# TEXT COLUMN
texts = events_df["cleaned_text"]

# VECTORIZER
vectorizer = CountVectorizer(
    stop_words="english"
)

X = vectorizer.fit_transform(texts)

# TRAIN LDA MODEL
lda_model = LatentDirichletAllocation(
    n_components=5,
    random_state=42
)

lda_model.fit(X)

# SAVE MODEL
with open("models/lda_model.pkl", "wb") as f:
    pickle.dump(lda_model, f)

with open("models/vectorizer.pkl", "wb") as f:
    pickle.dump(vectorizer, f)

print("Model trained and saved successfully!")