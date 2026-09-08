# Run & Deploy Instructions

Two parts:

1. **This project** — exact commands to run and deploy the Tech Stack Quiz.
2. **Other projects** — a reusable playbook for any Flask + Vite/React (or similar) app.

---

## Part 1 — This project (Tech Stack Quiz)

Architecture: a Python **Flask** API (`quiz_backend.py`) on port `5000`, and a
**Vite + React** frontend (`frontend/`) on port `5173` that calls the API through
a dev proxy.

### 1.1 Prerequisites

- Python 3.8+ (`python3 --version`)
- Node.js 18+ and npm (`node --version`)

### 1.2 Run locally

Open **two terminals**.

**Terminal A — backend:**

```bash
cd "/home/kenn/Documents/Cloned Projects/quiz"
python3 -m venv .venv            # first time only
.venv/bin/pip install -r requirements.txt   # first time / when requirements change
.venv/bin/python quiz_backend.py
```

Expected output:

```
🚀 Starting Tech Stack Quiz Expert System Backend
🔗 API running on http://localhost:5000
```

**Terminal B — frontend:**

```bash
cd "/home/kenn/Documents/Cloned Projects/quiz/frontend"
npm install                     # first time / when package.json changes
npm run dev
```

Open the printed URL (default <http://localhost:5173>). Requests to `/api/*` are
proxied to the backend by `frontend/vite.config.js`, so the backend must be running.

### 1.3 Quick verification

```bash
curl http://localhost:5000/api/health
curl http://localhost:5000/api/quiz-questions
curl -X POST http://localhost:5000/api/analyze \
  -H "Content-Type: application/json" \
  -d '{"name":"Kenn","responses":[5,4,1,1,3,3,4,2,4,3,4,2,3,5,4,2]}'
```

In the browser: enter a name → answer all 16 statements on the 1–5 scale →
results screen shows a recommendation, confidence, a roadmap, and a short
"How we got here" reasoning trace. Stop the backend and reload to confirm the
inline "Connection Error".

### 1.4 Production build (frontend)

```bash
cd "/home/kenn/Documents/Cloned Projects/quiz/frontend"
VITE_API_BASE="https://your-backend-url" npm run build   # outputs to frontend/dist/
npm run preview                                          # serve the build locally to check
```

`src/api.js` reads `VITE_API_BASE`; if unset it uses a same-origin `/api` path
(useful when the frontend and backend are served from the same domain).

### 1.5 Deploy to Vercel (frontend + API, one project)

The repo has a `vercel.json` that builds the React app as a static site **and**
runs `quiz_backend.py` as a Python serverless function at `/api/*` — same
domain, so no CORS and no `VITE_API_BASE` needed.

```bash
cd "/home/kenn/Documents/Cloned Projects/quiz"
npm i -g vercel
vercel            # first run links/creates the project — accept the defaults
vercel --prod
```

Or import the Git repo at vercel.com → **New Project**; leave every build
setting on default (`vercel.json` supplies them). Pieces involved:

- `vercel.json` — `@vercel/static-build` on `frontend/package.json` (output
  `frontend/dist`) + `@vercel/python` on `api/index.py`; routes send `/api/*`
  to the function and everything else to the static build.
- `api/index.py` — imports the Flask `app` from `quiz_backend.py` (bundled via
  `includeFiles`).
- `requirements.txt` — installed for the function automatically.

Deploying elsewhere? Use the split setup below (1.6–1.7).

### 1.6 Deploy the backend (non-Vercel)

Any host that runs a WSGI app works. Use **gunicorn** (already in
`requirements.txt`):

```bash
gunicorn quiz_backend:app --bind 0.0.0.0:$PORT
```

- **Render / Railway / Fly.io:** new Web Service from the repo, build command
  `pip install -r requirements.txt`, start command
  `gunicorn quiz_backend:app --bind 0.0.0.0:$PORT`.
- **Heroku:** add a `Procfile` containing `web: gunicorn quiz_backend:app`, then
  `git push heroku main`.
- **Plain VM:** run the gunicorn command under `systemd` and put nginx in front.

CORS is already enabled app-wide (`flask_cors.CORS(app)`), so a separately-hosted
frontend can call it. Note the backend's public URL for the next step.

### 1.7 Deploy the frontend (non-Vercel)

Static host (Netlify, Cloudflare Pages, GitHub Pages, S3+CloudFront):

- **Root / project directory:** `frontend`
- **Build command:** `npm run build`
- **Output directory:** `dist`
- **Environment variable:** `VITE_API_BASE = https://your-backend-url` (from 1.6)

### 1.8 Common issues

| Symptom | Fix |
|---|---|
| Frontend shows "Connection Error" | Backend not running, wrong proxy target in `vite.config.js`, or `VITE_API_BASE` wrong in the build |
| `ModuleNotFoundError: flask` | Activate/point at the venv: `.venv/bin/python ...`, re-run `pip install -r requirements.txt` |
| Port 5000 in use | `lsof -i :5000` then kill it, or change the port in `quiz_backend.py` **and** `vite.config.js` |
| 400 from `/api/analyze` | `responses` must be exactly 16 items, each int `1`–`5` |
| Blank page after deploy | Set the static host's output dir to `dist`; for a sub-path deploy set Vite `base` |

---

## Part 2 — Other projects (reusable playbook)

Use this to figure out how to run and deploy an unfamiliar project in this folder.

### 2.1 Identify the stack

Look for these files in the project root:

| File(s) | Stack | Run | Build | Deploy target |
|---|---|---|---|---|
| `requirements.txt`, `*.py`, `app.py`/`main.py`/`wsgi.py` | Python (Flask/FastAPI/Django) | `python -m venv .venv && .venv/bin/pip install -r requirements.txt && .venv/bin/python app.py` | — | gunicorn/uvicorn on Render, Railway, Fly, Heroku, or a VM |
| `pyproject.toml` | Python (Poetry/uv/PEP 621) | `pip install .` or `poetry install` / `uv sync` | — | same as above |
| `package.json` with `vite` | Vite + React/Vue/Svelte | `npm install && npm run dev` | `npm run build` → `dist/` | static host (Vercel/Netlify/Pages) |
| `package.json` with `next` | Next.js | `npm install && npm run dev` | `npm run build` | Vercel, or `npm start` on a Node host |
| `package.json` with `react-scripts` | Create React App | `npm install && npm start` | `npm run build` → `build/` | static host |
| `package.json` with `express`/`fastify` and no bundler | Node API | `npm install && npm start` (check `scripts.start`) | — | Node host (Render/Railway/Fly) |
| `Cargo.toml` | Rust | `cargo run` | `cargo build --release` | binary on a VM/container |
| `go.mod` | Go | `go run .` | `go build` | binary on a VM/container |
| `Gemfile` | Ruby | `bundle install && bundle exec ...` | — | Render/Heroku/VM |
| `docker-compose.yml` | Multi-service | `docker compose up` | `docker compose build` | any container host |
| `Dockerfile` only | Containerized | `docker build -t app . && docker run -p 8080:8080 app` | `docker build` | any container host |

Also check, in order: `README.md`, `CONTRIBUTING.md`, `Makefile` (`make help`),
`package.json` `"scripts"`, `.env.example`, CI files (`.github/workflows/*.yml`) —
CI almost always shows the real build/test/deploy commands.

### 2.2 General run procedure

1. Read `README.md` and `.env.example`. Copy `.env.example` to `.env` and fill values.
2. Install dependencies with the stack's package manager (table above).
3. Start backend/API services first, then frontends (frontends usually expect an API).
4. Note the ports. If a frontend talks to a backend, find where the base URL is set
   (a proxy config, a `VITE_*` / `REACT_APP_*` / `NEXT_PUBLIC_*` env var, or a
   hardcoded constant) and point it at the running backend.

### 2.3 General deploy procedure

1. **Split by type:** static frontends → static host; servers/APIs → app host or
   container host; anything with a `Dockerfile` → container host.
2. **Backend:**
   - Provide the production start command (`gunicorn app:app`, `uvicorn app:app`,
     `node server.js`, `./binary`, …).
   - Bind to `0.0.0.0` and the host-provided `$PORT`.
   - Set env vars / secrets in the host dashboard, never commit them.
   - Run DB migrations as a release/pre-deploy step if the project has them.
3. **Frontend:**
   - Set the API base URL env var at **build time** for bundled apps
     (Vite/CRA inline env vars into the build).
   - Build command + output dir from the table above.
   - Configure SPA fallback (rewrite all routes to `index.html`) so client-side
     routing works.
4. **Wire them together:** put the deployed backend URL into the frontend's env,
   and make sure the backend's CORS allowlist includes the frontend's domain.
5. **Smoke test** the deployed URLs with `curl` and a real browser run before
   calling it done.

### 2.4 Deploy checklist

- [ ] `.env` values set in the host, not in git
- [ ] Backend binds `0.0.0.0:$PORT`, uses a production server (not the dev server)
- [ ] Frontend built with the correct API base URL
- [ ] CORS on the backend allows the frontend origin
- [ ] SPA route fallback configured (frontend)
- [ ] Migrations run (if any)
- [ ] `curl` health check + browser smoke test pass against production
