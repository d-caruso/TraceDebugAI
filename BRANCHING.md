# TraceDebugAI — Branching Strategy

## Model

**Gitflow-lite with a permanent `develop` branch.**

`main` holds production-ready code only. `develop` is the integration branch where all feature work lands. Feature branches are cut from `develop` and merged back into `develop` via pull requests. When `develop` is stable and all acceptance criteria pass, it is merged into `main` as a release.

Branches are numbered (`feat/01-...`, `feat/02-...`) to make the recommended execution order immediately clear.

```
main        ← production releases only
  └── develop   ← integration; all feature PRs target this
        ├── feat/01-backend-scaffold
        ├── feat/02-backend-validation
        ├── feat/03-backend-ai-service
        ├── feat/04-backend-controller
        ├── feat/05-frontend-scaffold
        ├── feat/06-frontend-api-client
        ├── feat/07-frontend-components
        ├── feat/08-frontend-wiring
        ├── feat/09-copy-button
        ├── feat/10-severity-badge
        ├── feat/11-dark-mode
        ├── feat/12-typescript-backend
        ├── feat/13-typescript-frontend
        ├── feat/14-backend-tests
        ├── feat/15-ci
        ├── feat/16-root-scripts
        └── feat/17-cd
```

---

## Branch Naming Convention

```
feat/<NN>-<short-kebab-description>
```

The two-digit prefix (`01`, `02`, …) encodes the recommended merge order. Parallel branches share adjacent numbers.

| Type     | When to use                                           |
|----------|-------------------------------------------------------|
| `feat/`  | New functionality                                     |
| `fix/`   | Bug fix on an existing feature                        |
| `chore/` | Non-functional: config, tooling, dependency updates   |
| `docs/`  | Documentation only                                    |

`fix/`, `chore/`, and `docs/` branches are not numbered — they are ad-hoc and always merge into `develop`.

---

## Branch Dependency Map

### Phase 1 — Backend

#### `feat/01-backend-scaffold`
**Branches from:** `develop`  
**Merges into:** `develop`  
**Prerequisite:** none — start here  
**Scope:**
- `shared/constants.js` — `MIN_INPUT_LENGTH = 10`, `MAX_INPUT_LENGTH = 8000`; imported by both backend and frontend
- `backend/package.json` — Express, openai, dotenv, cors
- `backend/server.js` — Express app, CORS, JSON body parser, port config
- `backend/.gitignore` — excludes `.env`, `node_modules`
- `backend/.env.example` — placeholder documenting required vars
- Empty directory stubs: `routes/`, `controllers/`, `services/`, `middleware/`

**Merge criteria:** `node server.js` starts without errors; responds to GET `/` with 200.

---

#### `feat/02-backend-validation`
**Branches from:** `develop` (after `feat/01-backend-scaffold` is merged)  
**Merges into:** `develop`  
**Prerequisite:** `feat/01-backend-scaffold` merged  
**Scope:**
- `backend/middleware/validate.js` — checks `error` field: required, string, min 10 chars, max 8 000 chars after trim; returns 400 with a descriptive message on failure

**Merge criteria:** Middleware rejects invalid inputs with correct status codes and messages; passes valid input to `next()`.

---

#### `feat/03-backend-ai-service`
**Branches from:** `develop` (after `feat/01-backend-scaffold` is merged)  
**Merges into:** `develop`  
**Prerequisite:** `feat/01-backend-scaffold` merged  
**Scope:**
- `backend/services/aiService.js` — OpenAI client init, prompt construction, API call with 15 s timeout, JSON parse, required-field validation (`explanation`, `rootCause`, `fixSteps`)

**Merge criteria:** Called directly with a sample error string, returns `{ explanation, rootCause, fixSteps, severity }`.

> `feat/02-backend-validation` and `feat/03-backend-ai-service` are independent of each other and can be developed in parallel. Both branch off the `feat/01-backend-scaffold` merge commit on `develop`. Whichever finishes first merges; the second rebases onto the updated `develop` before its PR.

---

#### `feat/04-backend-controller`
**Branches from:** `develop` (after both 02 and 03 are merged)  
**Merges into:** `develop`  
**Prerequisite:** `feat/02-backend-validation` and `feat/03-backend-ai-service` both merged  
**Scope:**
- `backend/controllers/analyzeController.js` — calls validate middleware, calls aiService, returns JSON; maps errors to 400 / 422 / 503
- `backend/routes/analyze.js` — registers `POST /api/analyze-error`
- Wire route into `server.js`

**Merge criteria:** `curl -X POST /api/analyze-error` with a valid payload returns structured JSON; invalid payloads return correct error codes.

---

### Phase 2 — Frontend

#### `feat/05-frontend-scaffold`
**Branches from:** `develop`  
**Merges into:** `develop`  
**Prerequisite:** none — can run in parallel with backend branches  
**Scope:**
- `frontend/` — Vite + React project init
- `frontend/package.json` — react, react-dom, axios, @mui/material, @emotion/react, @emotion/styled
- `frontend/vite.config.js` — proxy `/api` → `http://localhost:3001`
- `frontend/index.html` — page title "AI Error Explainer"
- `frontend/src/main.jsx` — React root mount
- `frontend/src/App.jsx` — empty shell

**Merge criteria:** `npm run dev` starts; blank page loads without console errors.

---

#### `feat/06-frontend-api-client`
**Branches from:** `develop` (after `feat/05-frontend-scaffold` is merged)  
**Merges into:** `develop`  
**Prerequisite:** `feat/05-frontend-scaffold` merged  
**Scope:**
- `frontend/src/api/analyzeError.js` — axios POST to `/api/analyze-error`, 20 s timeout, maps HTTP error codes to user-facing message strings

**Merge criteria:** Function importable; throws correctly shaped errors on non-200 responses.

---

#### `feat/07-frontend-components`
**Branches from:** `develop` (after `feat/05-frontend-scaffold` is merged)  
**Merges into:** `develop`  
**Prerequisite:** `feat/05-frontend-scaffold` merged  
**Scope:**
- `frontend/src/components/ErrorInput.jsx` — controlled textarea (label, min/max, multiline), Analyze button (default / loading / disabled states), inline validation message
- `frontend/src/components/AnalysisResult.jsx` — Explanation block, Root Cause block, Fix Steps ordered list, Severity badge

**Merge criteria:** Components render in isolation with hardcoded props; no runtime errors.

> `feat/06-frontend-api-client` and `feat/07-frontend-components` are independent of each other and can be developed in parallel off the same `feat/05-frontend-scaffold` merge commit on `develop`.

---

#### `feat/08-frontend-wiring`
**Branches from:** `develop` (after both 06 and 07 are merged)  
**Merges into:** `develop`  
**Prerequisite:** `feat/06-frontend-api-client` and `feat/07-frontend-components` both merged  
**Scope:**
- `frontend/src/App.jsx` — full state model (`inputText`, `isLoading`, `result`, `errorMessage`), event handlers, conditional rendering of result card and error banner
- Header markup (title + subtitle)
- Layout: header + input card + result card

**Merge criteria:** Full UI renders; happy path works end-to-end with the backend running locally; all error states display the correct user-facing message.

---

### Phase 3 — Nice-to-Haves (post-MVP)

Each nice-to-have is its own branch. All branch from `develop` after `feat/08-frontend-wiring` is merged, and are independent of each other.

#### `feat/09-copy-button`
**Scope:** "Copy result" button on the result card; copies formatted analysis to clipboard using the Clipboard API.

#### `feat/10-severity-badge`
**Scope:** Color-coded severity badge on `AnalysisResult` — green (low), yellow (medium), red (high).

#### `feat/11-dark-mode`
**Scope:** Dark mode via MUI `createTheme` with `paletteMode: 'dark'`; toggle controlled by `useState` in `App.jsx`; respects the OS `prefers-color-scheme` media query as the initial value.

---

### Phase 4 — TypeScript Migration

#### `feat/12-typescript-backend`
**Branches from:** `develop` (after `feat/11-dark-mode` is merged)  
**Merges into:** `develop`  
**Prerequisite:** `feat/11-dark-mode` merged  
**Scope:**
- `shared/constants.js` → `shared/constants.ts` (named ES exports)
- All backend files moved to `src/` and renamed `.js` → `.ts`
- `backend/tsconfig.json` + `backend/tsconfig.build.json`
- `backend/src/types/index.ts` — `AnalysisResult` interface
- Type annotations on all middleware, controller, and service functions
- `package.json` scripts: `dev` (ts-node), `build` (tsc), `build:check` (tsc --noEmit)
- New dev deps: `typescript`, `ts-node`, `@types/node`, `@types/express`, `@types/cors`
- `backend/.gitignore` — add `dist/`

**Merge criteria:** `npm run build:check` passes with no errors; `npm run dev` starts; `GET /` → 200.

---

#### `feat/13-typescript-frontend`
**Branches from:** `develop` (after `feat/12-typescript-backend` is merged)  
**Merges into:** `develop`  
**Prerequisite:** `feat/12-typescript-backend` merged  
**Scope:**
- All frontend files renamed `.jsx` → `.tsx`, `.js` → `.ts` (including `vite.config.ts`)
- `frontend/tsconfig.json` — strict, noEmit (Vite handles bundling)
- `frontend/src/types/index.ts` — `AnalysisResult` interface (mirrors backend)
- Prop interfaces for `ErrorInput`, `AnalysisResult`, `SeverityBadge`
- New dev deps: `@types/react`, `@types/react-dom`

**Merge criteria:** `npm run build` (Vite) completes with no TypeScript errors; `npm run dev` starts cleanly.

---

### Phase 5 — Tests

#### `feat/14-backend-tests`
**Branches from:** `develop` (after `feat/13-typescript-frontend` is merged)  
**Merges into:** `develop`  
**Prerequisite:** `feat/13-typescript-frontend` merged  
**Scope:**
- New dev deps: `jest`, `ts-jest`, `supertest`, `@types/jest`, `@types/supertest`
- `backend/jest.config.js`
- `backend/tests/middleware/validate.test.ts` — unit tests (5 cases)
- `backend/tests/services/aiService.test.ts` — unit tests with mocked OpenAI
- `backend/tests/routes/analyze.test.ts` — integration tests via Supertest (5 cases)
- `package.json` — add `"test": "jest"` script

**Merge criteria:** `npm test` runs all suites green with no skipped tests.

---

### Phase 6 — CI/CD

#### `feat/15-ci`
**Branches from:** `develop` (after `feat/14-backend-tests` is merged)  
**Merges into:** `develop`  
**Prerequisite:** `feat/14-backend-tests` merged  
**Scope:**
- `.github/workflows/ci.yml` — three parallel jobs:
  - `backend-check`: `npm ci` + `npm run build:check`
  - `backend-test`: `npm ci` + `npm test`
  - `frontend-build`: `npm ci` + `npm run build`
- Triggers on push to `develop` and `main`
- No secrets required — tests mock OpenAI

**Merge criteria:** All three jobs pass green on GitHub Actions.

---

#### `feat/17-cd`
**Branches from:** `develop` (after `feat/15-ci` is merged)  
**Merges into:** `develop`  
**Prerequisite:** `feat/15-ci` merged  
**Scope:**
- Frontend deployment config for Vercel or Netlify (root: `frontend/`, build: `npm run build`)
- Backend deployment config for Railway or Render (root: `backend/`, start: `node dist/server.js`)
- `OPENAI_API_KEY` added as a platform secret — never in the repo
- Any platform-specific config files (e.g. `vercel.json`, `render.yaml`) if required

**Merge criteria:** Push to `main` triggers auto-deploy; live app calls OpenAI successfully.

---

## Merge Rules

No pull requests. The workflow for each feature branch is:

```
git checkout develop
git checkout -b feat/NN-name
# write code, commit
git push -u origin feat/NN-name
git checkout develop
git merge --squash feat/NN-name
git commit -m "[feat] short description"
git push origin develop
```

| Rule | Detail |
|------|--------|
| Always branch from `develop` | Never branch from another feature branch |
| Squash merge into `develop` | One squash commit per feature keeps `develop` history readable |
| Push `develop` after every merge | Remote `develop` stays in sync |
| Keep branches after merge | Feature branches are preserved for reference |
| `develop` → `main` is a merge commit | Preserves the release boundary clearly |

---

## Handling Parallel Work

Two pairs of branches overlap in development:

**Backend parallel pair** (both depend on `feat/01-backend-scaffold`):
- `feat/02-backend-validation`
- `feat/03-backend-ai-service`

**Frontend parallel pair** (both depend on `feat/05-frontend-scaffold`):
- `feat/06-frontend-api-client`
- `feat/07-frontend-components`

In both cases: whichever finishes first merges into `develop`; the second rebases onto the updated `develop` before merging. File ownership is non-overlapping by design, so rebases produce no conflicts in normal circumstances.

---

## Environment Variables

`.env` is never committed. `backend/.env.example` is committed and documents every required variable:

```
OPENAI_API_KEY=your-key-here
PORT=3001
```

Each developer copies `.env.example` to `.env` and fills in real values. Verified in the `feat/01-backend-scaffold` PR.

---

## Branch Lifecycle Summary

```
develop
│
├─► feat/01-backend-scaffold ──────────────────────────────────────► merged into develop
│        │
│        ├─► feat/02-backend-validation ───────────────────────────► merged into develop
│        │                                                               │
│        └─► feat/03-backend-ai-service ───────────────────────────► merged into develop
│                                                                        │
│                                       feat/04-backend-controller ◄─────┘ ► merged into develop
│
├─► feat/05-frontend-scaffold ──────────────────────────────────────► merged into develop
│        │
│        ├─► feat/06-frontend-api-client ──────────────────────────► merged into develop
│        │                                                               │
│        └─► feat/07-frontend-components ──────────────────────────► merged into develop
│                                                                        │
│                                        feat/08-frontend-wiring ◄───────┘ ► merged into develop
│
├─► feat/09-copy-button ────────────────────────────────────────────► merged into develop
├─► feat/10-severity-badge ─────────────────────────────────────────► merged into develop
├─► feat/11-dark-mode ──────────────────────────────────────────────► merged into develop
│
├─► feat/12-typescript-backend ─────────────────────────────────────► merged into develop
├─► feat/13-typescript-frontend ────────────────────────────────────► merged into develop
├─► feat/14-backend-tests ──────────────────────────────────────────► merged into develop
│
├─► feat/15-ci ─────────────────────────────────────────────────────► merged into develop
├─► feat/16-root-scripts ───────────────────────────────────────────► merged into develop
└─► feat/17-cd ─────────────────────────────────────────────────────► merged into develop

develop ────────────────────────────────────────────────────────────► merged into main (release)
```
