# Careera — Event Discovery & Recommendation Platform

A career-event discovery platform for college students, built with React + TanStack Start (SSR) on the frontend and FastAPI + scikit-learn (LDA topic model) on the backend. Users sign up as students, organizers, or admins — students discover and register for events, organizers publish and manage them, and admins oversee everything.

---

## Architecture / Workflow

```
User Browser
    │
    ▼
TanStack Router (file-based routes in src/routes/)
    │
    ├── AuthProvider (src/lib/auth.tsx) ──► Supabase Auth (session + role)
    │
    ├── TanStack Query (data fetching + caching)
    │       │
    │       ├── Supabase client ──► PostgreSQL (events, profiles, registrations, user_roles)
    │       │
    │       └── Backend API ──► http://127.0.0.1:8000 (recommendations)
    │
    └── Local fallback (src/lib/recommend.ts) — TF-IDF + cosine similarity
                  used when backend is unreachable or returns bad results
```

**Recommendation flow (3-tier):**
1. **ML API** — POST `/recommend-from-db` to FastAPI, LDA topic model scores events
2. **Local TF-IDF** — `recommendEventsLocally()` in the browser when API fails/returns empty
3. **Empty state** — shown when no interests are set or no events match (no unsorted fallback)

Both tiers pass through `filterRecommendations()`, which requires:
- Score ≥ `MIN_SCORE` (0.05)
- At least one stemmed interest keyword appears in the event's text (`hasKeywordMatch`)

---

## File Descriptions

### Frontend (`frontend/`)

| File | Purpose |
|------|---------|
| `src/lib/auth.tsx` | AuthContext — wraps Supabase auth, fetches `user_roles` table, exposes `user`, `session`, `role`, `signOut`, `refreshRole`. Roles: `student`, `organizer`, `admin`. |
| `src/lib/recommend.ts` | Client-side TF-IDF recommender engine with Porter-like stemmer. Exports `recommendEventsLocally()`, `filterRecommendations()`, and `hasKeywordMatch()`. |
| `src/lib/utils.ts` | General utility helpers. |
| `src/router.tsx` | TanStack Router + QueryClient setup. |
| `src/routeTree.gen.ts` | Auto-generated route tree from file-based routing. |
| `src/styles.css` | Tailwind v4 + custom CSS theme (indigo-blue palette, light/dark mode, glassmorphism). |
| `src/routes/__root.tsx` | Root layout — wraps everything in AuthProvider, renders 404, base HTML shell. |
| `src/routes/index.tsx` | Public landing page. |
| `src/routes/login.tsx` | Login form (email + password). |
| `src/routes/signup.tsx` | Registration form with role selection. |
| `src/routes/events.tsx` | Public event listing. |
| `src/routes/events.$eventId.tsx` | Public event detail page. |
| `src/routes/student.tsx` | Student dashboard layout — sidebar nav, wraps student pages. |
| `src/routes/student.index.tsx` | Student dashboard home — upcoming events, registration stats. "For you" recommendations removed (redirects to `/student/recommended`). |
| `src/routes/student.discover.tsx` | Browse/search all approved events. |
| `src/routes/student.discover.$eventId.tsx` | Event detail page for students (register button). |
| `src/routes/student.recommended.tsx` | Full "For you" page — all recommended events (up to 9), 3-tier fetch. |
| `src/routes/student.registered.tsx` | Events the student has registered for. |
| `src/routes/student.profile.tsx` | Profile editor — set comma-separated interests (saved as `text[]`), invalidates `for-you` cache. |
| `src/routes/organizer.tsx` | Organizer dashboard layout. |
| `src/routes/organizer.index.tsx` | Organizer home — their published events, stats. |
| `src/routes/organizer.events.tsx` | Manage events (edit, delete, view registrations). |
| `src/routes/organizer.new.tsx` | Create a new event form. |
| `src/routes/organizer.participants.tsx` | View registered participants for an event. |
| `src/routes/admin.tsx` | Admin dashboard layout. |
| `src/routes/admin.index.tsx` | Admin overview — platform stats. |
| `src/routes/admin.events.tsx` | Review/approve/reject events. |
| `src/routes/admin.all-events.tsx` | All events in the system. |
| `src/routes/admin.users.tsx` | User management. |
| `src/components/dashboard-shell.tsx` | Dashboard layout components — `PageHeader`, `StatCard`, sidebar. |
| `src/components/event-card.tsx` | `EventCard` component + `EventCardSkeleton` + `EmptyState`. Accepts optional `score` prop — renders a ★XX% badge (ML or TF-IDF score) on the card image when provided. |
| `src/components/ui/` | 40+ shadcn/ui primitives (button, card, dialog, form, input, select, sidebar, table, etc.). |
| `src/integrations/supabase/client.ts` | Supabase client singleton (from env vars). |
| `src/integrations/supabase/types.ts` | Auto-generated TypeScript types for all DB tables. |
| `supabase/migrations/` | SQL migration files — RLS policy fixes, `local_dev_bypass.sql` for development. |
| `.env` | Supabase URL, publishable key, backend API URL (`VITE_RECOMMENDER_API_URL`). |

### Backend (`backend/`)

| File | Purpose |
|------|---------|
| `app.py` | FastAPI server — 3 endpoints: `GET /` (health), `POST /recommend` (from CSV), `POST /recommend-from-db` (from provided event list). CORS wide open. |
| `recommender.py` | LDA topic model (5 components, scikit-learn). Loads pre-trained `lda_model.pkl` and `vectorizer.pkl` from `models/`. Falls back to training on startup if pickles don't exist. |
| `train_model.py` | Standalone script to (re)train the LDA model from `data/processed_events.csv`. |
| `requirements.txt` | Dependencies: `fastapi`, `uvicorn[standard]`, `pandas`, `scikit-learn`. |
| `data/processed_events.csv` | ~540K rows of processed event text used to train the LDA model. |
| `models/lda_model.pkl` | Pre-trained LDA model. |
| `models/vectorizer.pkl` | Pre-trained CountVectorizer. |
| `models/user_item_matrix.pkl` | Collaborative filtering matrix (unused by current endpoints). |
| `models/user_similarity.pkl` | User similarity matrix (unused by current endpoints). |

### Root SQL / Scripts

| File | Purpose |
|------|---------|
| `init_database_complete.sql` | Full schema — tables, RLS, seed data. |
| `seed_*.sql` | Seed scripts for organizers, events, test data. |
| `fix_*.sql` | RLS and permission fix patches. |
| `evaluate.py` | Evaluation script for recommendation quality. |
| `zip_project.py` | Utility to zip the project for deployment. |

---

## Running

### Prerequisites
- Node.js 18+ and npm
- Python 3.11+

### Backend (start first)

```bash
cd backend
pip install -r requirements.txt
uvicorn app:app --reload --host 0.0.0.0 --port 8000
```

Runs on `http://127.0.0.1:8000`. Check: `curl http://127.0.0.1:8000/health`

### Frontend

```bash
cd frontend
npm install --no-audit --no-fund
npm run dev -- --host 0.0.0.0 --port 8082
```

Runs on `http://localhost:8082`.

### `.env` (`frontend/.env`)

```
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=eyJ...
VITE_RECOMMENDER_API_URL=http://127.0.0.1:8000
```

### npm scripts (frontend)

| Command | Purpose |
|---------|---------|
| `npm run dev` | Start Vite dev server |
| `npm run build` | Production build |
| `npm run preview` | Preview production build |
| `npm run lint` | ESLint |
| `npm run format` | Prettier format |

---

## Key Design Decisions

- **3-tier recommendations:** ML API → local TF-IDF → empty (no unsorted fallback). Ensures only relevant events appear.
- **Keyword filter:** Even with ML, a stemmed interest keyword must literally appear in event text. Prevents LDA topic bleed (e.g. "gaming" matching ERP Expo).
- **Query key includes interests:** `["for-you", userId, interestsCsv]` — changing interests invalidates the cache automatically.
- **Theme:** Indigo-blue CSS variables (`oklch(0.54 0.22 265)`) with deep navy dark mode. No Tailwind config file — Tailwind v4 CSS-based configuration.
- **Role-based routing:** AuthProvider checks `user_roles` table; dashboards protected by route-level checks.
