# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Overview

A tech-career recommendation quiz. Two independently-deployed pieces:

- **Backend** — Flask API (`quiz_backend.py`), single file, port 5000.
- **Frontend** — Vite + React app (`frontend/`), port 5173, calls the API via a dev proxy.

`INSTRUCTIONS.md` has the full run/deploy walkthrough (and a generic playbook for other projects); `README.md` documents the API contract and expert-system logic.

## Commands

Backend (run from repo root):

```bash
python3 -m venv .venv                          # first time
.venv/bin/pip install -r requirements.txt
.venv/bin/python quiz_backend.py               # serves http://localhost:5000, debug=True
```

Frontend (run from `frontend/`):

```bash
npm install
npm run dev                                    # http://localhost:5173, proxies /api -> :5000
npm run build                                  # -> frontend/dist/
npm run preview
VITE_API_BASE="https://host" npm run build     # point a build at a deployed backend
```

Backend must be running before the frontend is useful. No test suite or linter is configured. Manual API check:

```bash
curl -X POST http://localhost:5000/api/analyze -H "Content-Type: application/json" \
  -d '{"name":"K","responses":[5,4,1,1,3,3,4,2,4,3]}'
```

## Architecture

**Scoring model (the core domain logic).** `ExpertSystem` in `quiz_backend.py` holds three parallel data structures that must stay consistent:

- `self.fields` — the 6 career fields (`data_science`, `web_development`, `devops`, `mobile_development`, `cybersecurity`, `game_development`), each `{name, description}`.
- `self.statements` — 10 quiz statements, each `{id, text, field, weight}` mapping to exactly one field id.
- `self.roadmaps` — one learning-steps list per field id.

`analyze(responses)` takes a list of 10 items (int `1`–`5`, `3` = neutral; `null` = skipped) and does `scores[statement.field] += (rating - 3) * weight`. Confidence is the clamped scaled spread between the top score and the mean of all field scores. Adding a field means touching all three structures plus at least one statement; changing question wording or weights is a `self.statements` edit only.

**API surface** (`/api/health`, `/api/quiz-questions`, `/api/analyze`). `/api/quiz-questions` is derived from `self.statements` and emits `type: "scale"` with a `{min:1, max:5, allow_no_opinion:false}` descriptor — the frontend renders the scale from this, not from hardcoded options. `/api/analyze` validates the responses array (length + value range) and returns 400 on bad input. CORS is enabled app-wide.

**Frontend flow.** `App.jsx` is a 3-screen state machine (`start | quiz | results`) holding all state; the screen components (`StartScreen`, `QuizScreen`, `ResultsScreen`) are presentational and receive props/callbacks. `src/api.js` is the only place that calls `fetch` — it prepends `VITE_API_BASE` (empty in dev, so the Vite proxy handles `/api`). All theming lives in the `theme` object at the top of `src/styles.js`; `styles` is a plain CSS-in-JS object, no CSS files.

**Backend/frontend coupling.** The response shape from `/api/analyze` (`primary_recommendation`, `alternative_recommendations`, `confidence`, `all_scores`, `recommendations`, `name`) is consumed field-by-field in `ResultsScreen.jsx`. Changing any key there requires a matching frontend change.
