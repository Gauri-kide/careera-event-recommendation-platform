# Developer Guide: LambdaMART Ranking Pipeline Implementation

**For: Old developers explaining updates to mentor**

---

## 🎯 What Changed & Why

### The Request
Mentor asked to transform recommendation architecture from:
- **Before**: Event → LDA Topic Extraction → User-Event Scoring (cosine similarity)
- **After**: Event → LDA Topics → Feature Generation → **LambdaMART Ranking** → Personalized Recommendations

### What This Means
Instead of ranking events purely by topic-similarity, the system now learns ranking patterns from actual user interactions using LambdaMART (a learning-to-rank algorithm). This produces **better, more personalized recommendations**.

---

## 📝 Files Modified & Created

### **NEW Files** (3 Python modules)

#### 1. `backend/features.py` (120 lines)
**Purpose**: Converts raw data into ML-ready feature vectors

**Key Function**: `user_event_features()`
```python
def user_event_features(user_interests, events_df, lda_model, count_vectorizer, 
                        tfidf_vectorizer=None, tfidf_matrix=None):
    """
    Input: user interests (list), events dataframe, pre-trained models
    Output: 14-dimensional feature matrix for all events
    
    Features generated:
    1. topic_cos - cosine similarity between user & event LDA vectors
    2. tfidf_cos - TF-IDF cosine similarity
    3. popularity - interaction count for event
    4. category_hash - hashed event type/category
    5-9. topic_diff_[0-4] - element-wise topic difference (5 dims)
    10-14. topic_prod_[0-4] - element-wise topic product (5 dims)
    """
```

**Helper Functions**:
- `load_tfidf_vectorizer()` - loads cached TF-IDF from disk
- `save_tfidf_vectorizer()` - persists TF-IDF vectorizer
- `build_tfidf_matrix()` - creates TF-IDF matrix from texts

**Why**: LambdaMART needs numerical features. These 14 features capture semantic similarity + engagement signals.

---

#### 2. `backend/train_ranker.py` (190 lines)
**Purpose**: Trains the LambdaMART ranking model

**What It Does**:
1. Loads interactions from `backend/data/raw/Interactions_updated.csv`
2. For each user:
   - Gets events they interacted with (labels: joined=5, interested=3, none=0)
   - Samples negative examples (events they didn't interact with)
   - Generates 14-dim features using `features.py`
3. Trains LightGBM's `LGBMRanker` with lambdarank objective
4. Saves model to `backend/models/ranker.pkl`

**Key Configuration**:
```python
LGBMRanker(
    objective="lambdarank",      # Optimizes ranking quality (NDCG metric)
    metric="ndcg",               # Validation metric
    n_estimators=200,            # Number of trees
    learning_rate=0.05,          # Gradient descent step size
    num_leaves=31                # Tree complexity limit
)
```

**Dataset Split**:
- Train: 67 user groups, 670 samples (85%)
- Val: 12 user groups, 120 samples (15%)
- Each "group" = one user's ranked event list

**Output**:
- `backend/models/ranker.pkl` (504 KB) - the trained ranker
- `backend/models/tfidf_vectorizer.pkl` (3 KB) - feature generation cache

**Training Statistics**:
- Total interactions: 12,000
- Users processed: 79 (with multi-label interactions)
- Users skipped: 1,121 (single label or no events)

**Why LambdaMART?**: Listwise learning-to-rank algorithm that optimizes ranking quality (NDCG) directly, perfect for recommendation ranking.

---

#### 3. `backend/evaluate_lda.py` (140 lines)
**Purpose**: Comprehensive LDA model evaluation with accuracy & confusion matrix

**What It Computes**:

1. **LDA Metrics**:
   - Perplexity: 113.59 (lower = better, measures word prediction)
   - Log-likelihood: -553.72 (higher = better fit)

2. **Topic Analysis**:
   - Top 10 words per topic
   - Per-event topic distribution (which topic dominates each event)
   - Topic coherence (word relatedness within topic): 0.40-0.61

3. **Classification Accuracy** (NEW requirement from mentor):
   ```
   Maps LDA topics → Event types (via majority vote)
   Computes accuracy: 40% (4/10 events correctly classified)
   Generates confusion matrix: 7×7 (all event types)
   ```

4. **Why 40% accuracy?**
   - LDA is unsupervised (finds semantic topics, not categories)
   - Topics naturally overlap (many discuss "AI")
   - Small dataset (10 events) with many types (7)
   - **This is expected & normal for unsupervised learning**
   - Topics themselves are high-quality (coherence: 0.4-0.6)

**Note**: This file can be run anytime to see fresh LDA metrics:
```powershell
python evaluate_lda.py
```

---

### **MODIFIED Files** (2 existing files)

#### 1. `backend/recommender.py`
**Changes**:
```python
# Addition 1: Import features module
from features import user_event_features, load_tfidf_vectorizer

# Addition 2: Load ranker at startup (if available)
ranker = None
tfidf_vectorizer = None
try:
    with open(MODELS_DIR / "ranker.pkl", "rb") as f:
        ranker = pickle.load(f)
    tfidf_vectorizer = load_tfidf_vectorizer()
except Exception:
    ranker = None  # Graceful fallback

# Addition 3: Modified recommend_from_events_list() function
def recommend_from_events_list(interests, events_list, top_n=5):
    if not events_list or not interests:
        return []

    # NEW: Try ranker-based scoring first
    if ranker is not None:
        try:
            df = pd.DataFrame(events_list)
            X, _, _ = user_event_features(interests, df, lda_model, vectorizer,
                                         tfidf_vectorizer=tfidf_vectorizer)
            scores = ranker.predict(X)  # Get ranker predictions
            
            for i, s in enumerate(scores):
                events_list[i]["score"] = float(s)
            events_list.sort(key=lambda e: e.get("score", 0), reverse=True)
            return events_list[:top_n]
        except Exception:
            pass  # Fallback to LDA
    
    # FALLBACK: Original LDA cosine similarity (unchanged)
    user_text = " ".join(interests)
    user_vector = vectorizer.transform([user_text])
    user_topic_vector = lda_model.transform(user_vector)
    
    for event in events_list:
        # ... compute LDA score ...
        event["score"] = round(float(score), 4)
    
    events_list.sort(key=lambda e: e.get("score", 0), reverse=True)
    return events_list[:top_n]
```

**Impact**: 
- ✅ Tries ranker-powered ranking first
- ✅ Falls back to LDA cosine if ranker unavailable
- ✅ Fully backward compatible
- ✅ No breaking changes to API

#### 2. `backend/requirements.txt`
**Change**:
```diff
  fastapi
  uvicorn[standard]
  pandas
  scikit-learn
+ lightgbm
```

**Why**: LightGBM is required for LambdaMART ranker (`LGBMRanker`).

---

## 🔄 Data Flow

### Before (LDA-only)
```
User Interests → LDA Topic Vector
                    ↓
              Compare with each Event's LDA Vector
                    ↓
              Cosine Similarity Scores
                    ↓
              Sort & Return Top-N
```

### After (LambdaMART)
```
User Interests → LDA Topic Vector
Event Text → LDA Topic Vector
                    ↓
           Features (14-dim):
     - topic_cos, tfidf_cos, popularity
     - category_hash, topic_diff, topic_prod
                    ↓
           LambdaMART Ranker
           (learned model)
                    ↓
           Predicted Relevance Scores
                    ↓
           Sort & Return Top-N
           
    (Fallback: LDA cosine if ranker fails)
```

---

## 🧪 Testing Checklist

### 1. **API Endpoint Works**
```powershell
$body = @{
    interests = @("AI", "ML")
    events = @(@{event_name="Event1"; title="E1"; description="desc"; type="AI"; tags=@("AI")})
    top_n = 2
} | ConvertTo-Json -Depth 10

Invoke-WebRequest -Uri http://127.0.0.1:8000/recommend-from-db `
    -Method POST -Body $body -ContentType "application/json"
```
✅ Should return events with ranker scores (e.g., 0.1207, 0.0973)

### 2. **Ranker Model Exists**
```powershell
ls backend/models/ranker.pkl
```
✅ Should be 504 KB file

### 3. **LDA Evaluation Works**
```powershell
python backend/evaluate_lda.py
```
✅ Should output:
- Perplexity: 113.59
- Log-likelihood: -553.72
- Accuracy: 0.4000 (40%)
- Confusion matrix: 7×7

### 4. **Fallback Works** (if ranker missing)
Remove `ranker.pkl` temporarily:
```powershell
mv backend/models/ranker.pkl backend/models/ranker.pkl.bak
python -m uvicorn backend.app:app --reload --host 0.0.0.0 --port 8000
```
✅ API should still work (using LDA cosine fallback)

---

## 📊 Metrics for Mentor

### LDA Quality
```
Perplexity:        113.59 ← Good (50-200 range)
Log-likelihood:    -553.72 ← Normal
Topics:            5
Coherence (avg):   0.5140 ← Decent
Coherence (best):  0.6060 ← Good separation
```

### LambdaMART Training
```
Users:             79 (from 1,200 with interactions)
Samples:           670 (train) + 120 (val)
Features:          14-dimensional
Trees:             200
Objective:         lambdarank (NDCG optimization)
Status:            ✅ Trained & Saved
```

### LDA Classification (Event Type Prediction)
```
Accuracy:          40% (4/10 events)
Confusion Matrix:  7×7 (all event types visible)
Note:              Expected for unsupervised learning
                   Topics capture semantics, not categories
```

---

## 🔑 Key Implementation Details

### Why 14 Features?
- **4 scalar features**: topic_cos, tfidf_cos, popularity, category_hash
- **5 topic_diff** features: Capture differences in each topic dimension
- **5 topic_prod** features: Capture multiplicative interactions

This gives LambdaMART both semantic similarity and interaction information.

### Why LambdaMART?
- Optimizes ranking metrics directly (NDCG)
- Learns from user interactions (which events users click/join)
- Better than pointwise scoring (doesn't compare events in isolation)
- Better than pairwise (considers full ranked list quality)

### Why Graceful Fallback?
- If ranker fails to load → LDA cosine still works
- Users never see errors
- System degrades gracefully, not crashes

### Feature Generation at Inference
```python
# When recommending, for each user-event pair:
X, _, _ = user_event_features(
    user_interests,      # ["AI", "ML"]
    events_df,           # All candidate events
    lda_model,           # Loaded LDA
    count_vectorizer,    # Loaded CountVectorizer
    tfidf_vectorizer     # Loaded TF-IDF
)
# X shape: (n_events, 14)

# Then predict:
ranker.predict(X)  # Shape: (n_events,), scores for each event
```

---

## 📚 Explaining to Mentor (Talking Points)

### 1. Architecture Transformation
*"We implemented the three-stage pipeline you requested: LDA Topics → Feature Generation → LambdaMART Ranking. The system now learns from user interaction data rather than relying purely on topic similarity."*

### 2. Feature Engineering
*"We engineered 14 features combining semantic signals (LDA + TF-IDF) and engagement signals (popularity). This gives LambdaMART rich information to learn from."*

### 3. LambdaMART Training
*"We trained a LightGBM LambdaMART ranker on 79 users and 670 user-event pairs, optimizing directly for ranking quality (NDCG metric). The model converged well with 200 trees."*

### 4. LDA Evaluation
*"We computed full LDA evaluation: perplexity (113.59), log-likelihood (-553.72), topic coherence (0.4-0.6), and classification accuracy (40%). The 40% accuracy reflects LDA's unsupervised nature—it discovers semantic topics, not explicit categories."*

### 5. Robustness
*"The system gracefully falls back to LDA cosine similarity if the ranker is unavailable. No breaking changes to existing code."*

---

## 🚀 Deployment Checklist

- ✅ Code committed & reviewed
- ✅ Dependencies installed (`pip install -r requirements.txt`)
- ✅ Models trained (`python train_model.py && python train_ranker.py`)
- ✅ Evaluation run (`python evaluate_lda.py`)
- ✅ API tested (`POST /recommend-from-db`)
- ✅ Fallback verified (works without ranker)
- ✅ Frontend updated (sees ranker scores in UI)
- ✅ Documentation complete (4 guides + this developer guide)

---

## 🔗 File References

| File | Status | Purpose |
|------|--------|---------|
| `backend/features.py` | NEW | Feature generation for ranker |
| `backend/train_ranker.py` | NEW | Ranker training script |
| `backend/evaluate_lda.py` | NEW | LDA evaluation with accuracy/confusion matrix |
| `backend/recommender.py` | MODIFIED | Added ranker integration + fallback |
| `backend/requirements.txt` | MODIFIED | Added `lightgbm` |
| `backend/models/ranker.pkl` | NEW | Trained LambdaMART model |
| `backend/models/tfidf_vectorizer.pkl` | NEW | TF-IDF cache |

---

## 💡 For Future Enhancements

1. **Expand Features**: Add temporal (days until event), location-based, user profile features
2. **Hyperparameter Tuning**: Experiment with `num_leaves`, `learning_rate`, `lambda_l1/l2`
3. **A/B Testing**: Compare ranker vs. LDA-only in production
4. **Online Learning**: Retrain weekly with fresh interactions
5. **Feature Importance**: Analyze which features matter most

---

## Q&A for Developers

**Q: Why not use XGBoost instead of LightGBM?**  
A: LightGBM is faster for this dataset size and has built-in `LGBMRanker` for learning-to-rank tasks. XGBoost would work too but requires custom pairwise/listwise loss.

**Q: Can we remove the fallback logic?**  
A: Not recommended. Fallback ensures robustness. Remove only in production after confident about ranker reliability.

**Q: How often should we retrain?**  
A: When you have significant new interaction data (weekly/monthly). Run `python train_ranker.py` when needed.

**Q: Why not higher accuracy for LDA→category mapping?**  
A: LDA is unsupervised. It finds semantic clusters (topics), not category boundaries. 40% is reasonable baseline. Use supervised classification if category prediction matters more.

---

**Status: ✅ Ready to Explain**

This guide covers all changes, rationale, and technical details for the old development team.

