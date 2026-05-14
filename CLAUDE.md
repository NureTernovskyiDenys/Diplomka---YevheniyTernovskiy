# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project overview

GymAnalysis (Ukrainian-language [README.md](README.md), called "FitnessApp" in the Postman collection) is a fitness platform with **four** subprojects, not the two suggested by the README:

- [backend/](backend/) — NestJS 11 + TypeScript + MongoDB/Mongoose REST API. All routes mount under global prefix `api/nest` (set in [backend/src/main.ts:20](backend/src/main.ts#L20)).
- [frontend/](frontend/) — React 19 + Vite 7 SPA (Tailwind, Zustand, React Router 7).
- [mobile/](mobile/) — Expo 55 + React Native 0.81 + expo-router app, sharing the same REST API.
- [api/](api/) — Python 3.10 + FastAPI single-file ([api/index.py](api/index.py)) doing MediaPipe pose detection / rep counting on uploaded video chunks.

Domain: workout tracking, exercise library (1300+ via RapidAPI ExerciseDB, Redis-cached), AI-generated blog (Google Gemini 2.5 Flash, cached), and live-video rep counting via MediaPipe.

## Commands

All `npm` commands run from each subproject's directory.

### Backend ([backend/](backend/))
- `npm run start:dev` — watch mode, base URL `http://localhost:3000/api/nest`
- `npm run start:prod` — runs `dist/main`
- `npm run build` — `nest build`
- `npm run lint` — ESLint with `--fix`
- `npm test` — Jest unit tests; also `test:watch`, `test:cov`, `test:e2e`
- Run a single test: `npx jest path/to/file.spec.ts` or `npx jest -t "test name"`. Jest config in [backend/package.json](backend/package.json) sets `rootDir: src` and `testRegex: ".*\\.spec\\.ts$"`.

### Frontend ([frontend/](frontend/))
- `npm run dev` — Tailwind watcher + Vite together via `concurrently`, port 5173
- `npm run build` — Vite production build into `dist/`
- `npm run lint` — ESLint
- `npm run preview` — preview built bundle

### Mobile ([mobile/](mobile/))
- `npm run dev` / `npm start` — `expo start`
- `npm run android` / `ios` / `web` — platform-specific Expo dev clients

### Live-analysis Python service (project root, code in [api/](api/))
- Local Windows dev: [start-ai.bat](start-ai.bat) — runs `uvicorn api.index:app` on port 8000 with reload via `live-analysis\venv\Scripts\uvicorn.exe`. The venv is not committed; create it first with `python -m venv live-analysis/venv` and `pip install -r requirements.txt`.
- Docker (matches Render deploy): `docker build -t live-ai . && docker run -p 10000:10000 live-ai` — runs `uvicorn api.index:app --host 0.0.0.0 --port 10000`.

## Architecture & runtime topology

### Vercel routing is the load-bearing config

[vercel.json](vercel.json) ties all three deployable subprojects together at one origin:
- `/api/nest/*` → `backend/api/index.ts` (NestJS via `@vercel/node`)
- `/live/*` → `api/index.py` (Python via `@vercel/python`, 1 GB memory, 250 MB max lambda)
- `/*` → `frontend/index.html` (Vite static build)

Same-origin routing means clients hit a single host and CORS isn't a concern in production.

### Render runs only the Python service

[render.yaml](render.yaml) + [Dockerfile](Dockerfile) build the Python service on port 10000. The Node backend and frontend do **not** ship via Render — they ship via Vercel.

### Auth flow

JWT-only, no sessions. `POST /api/nest/auth/login` returns `access_token`; clients send `Authorization: Bearer <token>`. NestJS guards (`@Roles`, JWT strategy under [backend/src/auth/](backend/src/auth/)) enforce protection. Frontend stores in `localStorage.token`; mobile uses `expo-secure-store`. JWT shape: `{ sub, email, role, exp }` — both clients decode with `jwt-decode`.

### NestJS module layout

Under [backend/src/](backend/src/): `auth`, `users`, `workouts`, `exercises`, `subscriptions`, `analytics`, `admin`, `blog`. Each follows controller → service → Mongoose schema. The global `ValidationPipe` ([backend/src/main.ts:13-18](backend/src/main.ts#L13-L18)) is set with `whitelist: true, forbidNonWhitelisted: true` — any field on a request body that isn't declared on the DTO class returns 400, so adding a new request field requires updating the DTO first.

### Caching

`cache-manager-redis-yet` if `REDIS_URL` is set, otherwise an in-memory fallback (so Vercel cold starts work). Used heavily by the `exercises` module (RapidAPI responses) and the `blog` module (Gemini-generated articles). Gemini is the slow/expensive path — don't bypass the cache without a reason.

### Live-analysis pipeline

Clients record a video chunk and POST it to `/live/analyze/chunk`. The Python service decodes frames via OpenCV, runs MediaPipe Pose, computes shoulder–elbow–wrist angles, and uses a 2-state machine (extended >150° → flexed <50° = +1 rep). Threading is intentionally avoided to stay compatible with Vercel Lambda.

### Client API shape

Frontend calls Axios directly inline in pages — there is no shared HTTP client. Mobile has a proper service layer: `ApiRegistry` configures a shared `HttpClient` and individual services (`AuthService`, `WorkoutsService`, `ExercisesService`, etc.) under [mobile/src/services/](mobile/src/services/). When adding a new endpoint, prefer extending the mobile service layer; the frontend will likely need its own duplicate call.

## Environment variables

Backend (per [README.md](README.md)):
- `MONGODB_URI` — Mongo connection string (required)
- `JWT_SECRET` — JWT signing key (required)
- `GEMINI_API_KEY` — Google Generative AI key (required for `/blog`)
- `RAPIDAPI_KEY` — ExerciseDB on RapidAPI (required for `/exercises`)
- `REDIS_URL` — optional; falls back to in-memory cache when absent
- `PORT` — defaults to 3000

Mobile uses `EXPO_PUBLIC_API_URL` (defaults to `http://localhost:3000/api/nest`, also overridable via `extra.apiUrl` in [mobile/app.json](mobile/app.json)).

## Gotchas

- **Mobile defaults to a mock backend.** [mobile/src/config.ts:20-25](mobile/src/config.ts#L20-L25) sets `USE_MOCK = true` whenever `extra.useMock` is `undefined` in `app.json`, which it currently is. The `EXPO_PUBLIC_USE_MOCK` env var only *enables* mock mode (it checks for `'1'`/`'true'`) — there is no env-var path to disable it. To hit a real backend, add `"useMock": false` under `extra` in [mobile/app.json](mobile/app.json).
- **Route prefix mismatch in API docs.** [API_DOCUMENTATION.md](API_DOCUMENTATION.md) writes routes as `/auth/login`, `/workouts`, etc. The real routes are `/api/nest/auth/login`, `/api/nest/workouts` — the doc omits the global prefix. Trust [backend/src/main.ts:20](backend/src/main.ts#L20).
- **README is in Ukrainian.** It's real documentation, not placeholder. Translate when needed but don't rewrite without the user asking.
- **`live-analysis/` is not where the Python code lives.** It only holds `.python-version` and a near-empty `pyproject.toml` (a uv/pyenv stub for IDE tooling). All Python code is in [api/](api/).
- **`forbidNonWhitelisted: true`** on the global pipe means an unexpected field anywhere in a request body returns 400 — easy to trip when adding a field to a DTO on only one side.
- **Workout edit authorization** is enforced in the workouts controller via JWT user-id check — only the workout's author can mutate it. Don't loosen this without an explicit admin path.
- **Test coverage outside backend is zero.** Frontend, mobile, and the Python service have no test suite configured. Backend has Jest set up but actual `.spec.ts` coverage is sparse — verify before claiming a test exists.
