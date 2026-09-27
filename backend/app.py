from fastapi import FastAPI
from pydantic import BaseModel

from fastapi.middleware.cors import CORSMiddleware

from recommender import recommend_events, recommend_from_events_list, TOPIC_KEYWORDS

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

class RecommendationRequest(BaseModel):
    interests: list[str]
    top_n: int = 5

class DBRecommendationRequest(BaseModel):
    interests: list[str]
    events: list[dict]
    top_n: int = 5

@app.get("/")
def home():
    return {
        "message": "Backend Running"
    }


@app.get("/health")
def health():
    return {"status": "ok"}

@app.post("/recommend")
def recommend(data: RecommendationRequest):

    recommendations = recommend_events(
        data.interests,
        data.top_n
    )

    return {
        "recommendations": recommendations
    }

@app.post("/recommend-from-db")
def recommend_from_db(data: DBRecommendationRequest):
    recommendations = recommend_from_events_list(
        data.interests,
        data.events,
        data.top_n
    )
    return {
        "recommendations": recommendations
    }


@app.get("/model/topics")
def model_topics():
    return {"topics": TOPIC_KEYWORDS}

# Reload trigger
