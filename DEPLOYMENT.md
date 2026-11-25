# Deployment Guide

Spec2Test AI is two independent apps in one repo, deployed as **two separate Vercel projects**:

| App | Folder | Stack |
|---|---|---|
| Frontend | `frontend/` | React + Vite |
| Backend | `backend/` | FastAPI (`main.py` exports `app`) |

AI behaviour is **mocked by default** (`AI_MODE=mock`): no API key, no network calls, no cost. Keep it that way for deployments.

---

## 1. Local setup

Tested with Node 22 and Python 3.12.

```bash
# Backend
cd backend
python -m venv .venv
source .venv/bin/activate        # Windows: .venv\Scripts\activate
pip install -r requirements.txt

# Frontend (second terminal)
cd frontend
npm install
```

No `.env` files are needed locally; the defaults work. To override, copy `backend/.env.example` to `backend/.env` and/or `frontend/.env.example` to `frontend/.env.local`.

## 2. Start the apps

```bash
# Backend  -> http://localhost:8000   (API docs: http://localhost:8000/docs)
cd backend
uvicorn main:app --reload --port 8000

# Frontend -> http://localhost:5173
cd frontend
npm run dev
```

Quick check: open http://localhost:8000/health. It should return `"status": "healthy"` and `"ai_mode": "mock"`.

## 3. Environment variables

| Variable | Project | Value | Required |
|---|---|---|---|
| `VITE_API_BASE_URL` | **Frontend** | Backend URL, e.g. `https://spec2test-api.vercel.app` (no trailing slash) | Yes (production) |
| `ALLOWED_ORIGINS` | **Backend** | Frontend URL(s), comma-separated, e.g. `https://spec2test.vercel.app` | Yes (production) |
| `AI_MODE` | Backend | `mock` (default). Leave unset or `mock`. | No |
| `ALLOWED_ORIGIN_REGEX` | Backend | Optional, to allow frontend preview URLs | No |
| `GEMINI_API_KEY` | Backend | Only for `AI_MODE=live`. **Do not set in deployments.** | No |

Set them in Vercel under **Project > Settings > Environment Variables** of the *matching* project. Changes only apply to **new deployments**, so redeploy after editing. `VITE_*` values are baked in at build time.

Never commit `.env` files (they are git-ignored; only `.env.example` files are tracked).

## 4. Deploy the backend (Vercel project 1)

1. Vercel dashboard > **Add New > Project** > import this GitHub repo.
2. **Root Directory:** `backend`.
3. **Framework Preset:** FastAPI (auto-detected from `requirements.txt` and `main.py`). No build command or output directory.
4. Add environment variable `ALLOWED_ORIGINS`. The frontend URL does not exist yet, so use a placeholder for now (`https://placeholder.vercel.app`); you will update it in step 6.
5. **Deploy**, then note the URL (e.g. `https://spec2test-api.vercel.app`).
6. Check `https://<backend-url>/health` and `https://<backend-url>/docs`.

## 5. Deploy the frontend (Vercel project 2)

1. **Add New > Project** > import the **same** repo again.
2. **Root Directory:** `frontend`.
3. **Framework Preset:** Vite. **Build Command:** `npm run build`. **Output Directory:** `dist`.
4. Add environment variable `VITE_API_BASE_URL` = the backend URL from step 4.
5. **Deploy**, then note the frontend URL.

`frontend/vercel.json` rewrites all paths to `index.html`, so refreshing routes like `/dashboard` works.

## 6. Connect the two

1. Backend project > Settings > Environment Variables > set `ALLOWED_ORIGINS` to the **frontend URL** (exact origin, `https://`, no trailing slash, no path).
2. Backend project > Deployments > **Redeploy** the latest deployment.
3. If you change the backend URL later, update `VITE_API_BASE_URL` in the frontend project and redeploy it too.

## 7. Production verification checklist

- [ ] `https://<backend>/health` returns `healthy` and `"ai_mode": "mock"`
- [ ] `https://<backend>/docs` loads
- [ ] Frontend loads; refreshing `/dashboard` does not 404
- [ ] Create a project, open it, run analysis: results appear
- [ ] Browser DevTools > Network: calls go to the backend URL, status 200, no CORS errors in Console
- [ ] Dashboard, Test Cases, Execution and Reports pages show the analysed project
- [ ] No `GEMINI_API_KEY` is set on either Vercel project

## Troubleshooting

- **"Cannot reach the backend" in the UI:** check `VITE_API_BASE_URL`, then that `ALLOWED_ORIGINS` exactly matches the frontend origin. Redeploy after changing either.
- **CORS error in console:** `ALLOWED_ORIGINS` is missing or has a typo, or the backend was not redeployed after editing it.
- **"backend URL is not configured":** `VITE_API_BASE_URL` was not set before the frontend build; set it and redeploy.
- **Preview deployments of the frontend:** add `ALLOWED_ORIGIN_REGEX`, e.g. `^https://spec2test-.*\.vercel\.app$`.
