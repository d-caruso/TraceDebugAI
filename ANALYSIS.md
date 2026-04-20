# TraceDebugAI — MVP Analysis

## Context

TraceDebugAI is a greenfield MVP. The goal is a focused, single-page web app that accepts an error message or stack trace, sends it to OpenAI, and returns a structured analysis (explanation, root cause, fix steps, severity). The project demonstrates real AI integration with a clean separation of concerns on the backend and a minimal but usable frontend.

---

## Architecture Overview

```
Browser (React + Vite)
    │
    │  POST /api/analyze-error  { error: "..." }
    ▼
Express Server (Node.js)
    ├── routes/analyze.js                 → maps POST /api/analyze-error
    ├── controllers/analyzeController.js  → validates input, calls service, returns JSON
    ├── services/aiService.js             → builds prompt, calls OpenAI, parses structured response
    └── middleware/validate.js            → input validation (length, type)
```

Four directories under one repo:

```
TraceDebugAI/
├── .github/
│   └── workflows/
│       └── ci.yml     ← build check on every push to develop and main
├── shared/
│   └── constants.js   ← MIN_INPUT_LENGTH = 10, MAX_INPUT_LENGTH = 8000
├── backend/
└── frontend/
```

---

## Tech Stack Decisions

| Layer       | Choice            | Rationale                                              |
|-------------|-------------------|--------------------------------------------------------|
| Backend     | Node.js + Express | Minimal setup, fits JSON REST API well                |
| AI client   | openai npm SDK    | Official SDK, handles auth and retries cleanly        |
| Frontend    | React + Vite      | Fast dev experience, no SSR overhead for an SPA       |
| Styling     | MUI (@mui/material) | Pre-built components (TextField, Button, Card, Chip, Alert) map 1:1 to spec; imported individually by path to minimise bundle size |
| HTTP client | axios             | Explicit timeout and error handling                   |
| Env mgmt    | dotenv            | Standard; keeps API key server-side only              |
| Language    | TypeScript        | Full type safety on backend and frontend; matches existing project conventions |
| Testing     | Jest + ts-jest + Supertest | Unit and integration tests for the backend |
| CI/CD       | GitHub Actions    | Native GitHub integration, free for public repos      |

---

## Backend Structure

### Directory layout

```
backend/
├── package.json
├── .env                        ← OPENAI_API_KEY (never committed)
├── .gitignore
├── server.js                   ← entry point, Express app setup, CORS, port
├── routes/
│   └── analyze.js              ← POST /api/analyze-error
├── controllers/
│   └── analyzeController.js
├── services/
│   └── aiService.js
└── middleware/
    └── validate.js
```

### API Contract

**POST `/api/analyze-error`**

Request body:
```json
{ "error": "TypeError: Cannot read property 'map' of undefined" }
```

Success response (200):
```json
{
  "explanation": "...",
  "rootCause": "...",
  "fixSteps": ["Step 1", "Step 2", "Step 3"],
  "severity": "medium"
}
```

Error responses:
- `400` — validation failure (missing input, too short/long, non-string)
- `503` — OpenAI API unreachable or timeout
- `422` — OpenAI returned a response that could not be parsed into the required structure

### Validation Rules (`middleware/validate.js`)

- `error` field: required, string, trimmed
- Minimum length: `MIN_INPUT_LENGTH` (10) characters after trim
- Maximum length: `MAX_INPUT_LENGTH` (8,000) characters

Both limits are imported from `shared/constants.js` and reused by the frontend components — single source of truth.

### AI Service Behavior (`services/aiService.js`)

1. Receive the validated error string
2. Build a system + user prompt requesting JSON output with fields `explanation`, `rootCause`, `fixSteps`, `severity`
3. Call OpenAI (`gpt-4o-mini`) with `response_format: { type: "json_object" }` to guarantee JSON output
4. Parse the JSON response
5. Validate that required fields (`explanation`, `rootCause`, `fixSteps`) are present
6. Return the parsed object, or throw a structured error

**Prompt design:**

```
System:
  You are a debugging assistant. Analyze errors and return only valid JSON.

User:
  Analyze the following error. Return a JSON object with:
  - "explanation": a brief technical explanation (1–3 sentences)
  - "rootCause": the most probable root cause (1–2 sentences)
  - "fixSteps": an array of 2–5 concrete action steps
  - "severity": one of "low", "medium", or "high"

  Error:
  <error text>
```

**Timeout:** 15 seconds. If exceeded, return 503 with "The analysis service is temporarily unavailable."

---

## Frontend Structure

### Directory layout

MUI dependencies: `@mui/material`, `@emotion/react`, `@emotion/styled`. Components imported individually by path (e.g. `import Button from '@mui/material/Button'`) to avoid pulling the full package into the bundle.

```
frontend/
├── package.json
├── vite.config.js              ← proxy /api → backend on port 3001
├── index.html
└── src/
    ├── main.jsx
    ├── App.jsx                 ← root component, state management
    ├── api/
    │   └── analyzeError.js    ← axios call to POST /api/analyze-error
    └── components/
        ├── ErrorInput.jsx     ← MUI TextField + Button
        └── AnalysisResult.jsx ← MUI Card, Typography, Chip (severity badge)
```

### UI Layout (single page)

```
┌──────────────────────────────────────────┐
│  Header                                  │
│  Title:    AI Error Explainer            │
│  Subtitle: Paste an error message or     │
│            stack trace and get a         │
│            structured explanation.       │
├──────────────────────────────────────────┤
│  Card: Input                             │
│  ┌────────────────────────────────────┐  │
│  │ Label: Error message or stack trace│  │
│  │ <textarea rows=8>                  │  │
│  └────────────────────────────────────┘  │
│  [Analyze] / [Analyzing...] button       │
├──────────────────────────────────────────┤
│  Card: Result (hidden until ready)       │
│  Explanation block                       │
│  Root Cause block                        │
│  Fix Steps list                          │
│  Severity badge (low / medium / high)    │
└──────────────────────────────────────────┘
```

### State Model (`App.jsx`)

| State field    | Type    | Description                                                |
|----------------|---------|------------------------------------------------------------|
| `inputText`    | string  | Controlled textarea value                                  |
| `isLoading`    | boolean | Disables button, shows "Analyzing..."                      |
| `result`       | object  | `{ explanation, rootCause, fixSteps, severity }` or null  |
| `errorMessage` | string  | User-facing error string or null                           |

### User-Facing Error Messages

| Condition                         | Message                                                        |
|-----------------------------------|----------------------------------------------------------------|
| Input empty or < 10 chars         | "Please enter an error message or stack trace."               |
| OpenAI API error / timeout        | "The analysis service is temporarily unavailable."            |
| Malformed / unparseable response  | "Unable to generate a valid analysis. Please try again."      |

### Nice-to-Haves (post-MVP)

- Copy result to clipboard button
- Severity badge colors: green (low), yellow (medium), red (high)
- Dark mode via MUI `createTheme` with `paletteMode: 'dark'`

---

## Security

- `OPENAI_API_KEY` lives exclusively in `backend/.env`, loaded via `dotenv`
- `.env` is listed in `.gitignore` — never committed
- The React frontend never sees or requests the API key
- Input validation on both frontend (immediate UX feedback) and backend (authoritative gate)
- CORS configured to allow only the Vite dev origin in development

---

## Implementation Sequence

1. **Backend scaffold** — `npm init`, Express, folder structure, `server.js`
2. **Validation middleware** — `validate.js`
3. **AI service** — `aiService.js`, prompt, OpenAI call, response parsing
4. **Controller + route** — wire validation → service → JSON response
5. **Frontend scaffold** — Vite + React + MUI, Vite proxy config
6. **`analyzeError.js`** — axios call with timeout and error mapping
7. **`ErrorInput` component** — textarea, button states
8. **`AnalysisResult` component** — result blocks, severity badge
9. **`App.jsx`** — state wiring, error display
10. **End-to-end smoke test** — happy path + each error case
11. **TypeScript — backend** — migrate to `.ts`, add `tsconfig.json`, `src/` structure, type annotations
12. **TypeScript — frontend** — migrate to `.tsx`, add `tsconfig.json`, prop interfaces
13. **Backend tests** — Jest + ts-jest + Supertest; unit tests for middleware and service, integration tests for route
14. **CI workflow** — `.github/workflows/ci.yml`; type-check, test, and build jobs
15. **CD setup** — platform deployment (Vercel for frontend, Railway/Render for backend), `OPENAI_API_KEY` as platform secret

---

## Acceptance Criteria

| # | Criterion                                              | Verified by                                   |
|---|--------------------------------------------------------|-----------------------------------------------|
| 1 | User can paste error into frontend textarea            | Manual UI test                                |
| 2 | Frontend sends POST to `/api/analyze-error`            | Browser DevTools Network tab                  |
| 3 | Backend calls OpenAI with correct prompt               | Server log                                    |
| 4 | Backend returns structured JSON with required fields   | curl / Postman                                |
| 5 | Frontend displays Explanation, Root Cause, Fix Steps   | Manual UI test                                |
| 6 | Empty, too-short, and too-long inputs are rejected     | Manual UI test + curl with bad payloads       |
| 7 | API key not present in frontend bundle or network tab  | DevTools Sources + Network inspection         |

---

---

## CI/CD

### CI — `.github/workflows/ci.yml`

Triggers on every push to `develop` and `main`. Two parallel jobs:

| Job | Steps |
|-----|-------|
| `backend-check` | `npm ci` in `backend/`; `npm run build:check` (TypeScript type check) |
| `backend-test` | `npm ci` in `backend/`; `npm test` |
| `frontend-build` | `npm ci` in `frontend/`; `npm run build` |

`OPENAI_API_KEY` is not required for CI — the OpenAI client is lazy-initialised and never called during a build.

### CD — Recommended platform targets

| Layer | Platform | How |
|-------|----------|-----|
| Frontend | Vercel or Netlify | Connect repo; set root to `frontend/`; build command `npm run build`; auto-deploys on push to `main` |
| Backend | Railway or Render | Connect repo; set root to `backend/`; start command `node server.js`; add `OPENAI_API_KEY` as a platform secret env var |

`OPENAI_API_KEY` is added in the platform dashboard — never in the repo. No code changes required; `dotenv` falls back to real env vars when `.env` is absent.

---

## Out of Scope (MVP)

Authentication, database, history, file upload, multi-language, multiple AI providers, billing, syntax highlighting, OCR, image support.
