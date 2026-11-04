# API Playground

A lightweight developer tool for composing HTTP requests, sending them through a local
backend, and inspecting the responses. Inspired by Postman and Insomnia, but intentionally
small. See [PROJECT.md](PROJECT.md) for the full specification.

> **Status:** Milestone 1 (project setup) complete. The app currently only shows whether the
> backend is reachable. Request building and execution arrive in Milestones 2–3.

## Architecture

```
Browser (React, Vite :5173) ──/api/*──▶ Vite dev proxy ──▶ Express (127.0.0.1:3001) ──▶ target API
```

The browser never calls target APIs directly. It sends a request description to the local
Express server, which validates it, applies safety checks, performs the request, and returns
a normalized result.

This is an npm workspaces monorepo:

| Workspace | Purpose                                                                     |
| --------- | --------------------------------------------------------------------------- |
| `client/` | React + TypeScript + Vite + Tailwind CSS frontend                           |
| `server/` | Express 5 + TypeScript backend (request executor, persistence)              |
| `shared/` | TypeScript types shared by client and server (type-only, erased at runtime) |

## Requirements

- Node.js 24 or newer (developed on Node 26)
- npm 10 or newer

## Getting started

```bash
npm install
cp .env.example .env    # optional: defaults work without it
npm run dev             # starts server (:3001) and client (:5173)
```

Open http://localhost:5173. You should see **Server: connected**.

## Scripts (run from the repo root)

| Command                           | What it does                                                          |
| --------------------------------- | --------------------------------------------------------------------- |
| `npm run dev`                     | Run server (auto-restarts on change) and client (hot reload) together |
| `npm run build`                   | Type-check and build all workspaces                                   |
| `npm test`                        | Run all tests (Vitest; Supertest for HTTP routes)                     |
| `npm run typecheck`               | Strict TypeScript check of every workspace                            |
| `npm run lint`                    | ESLint                                                                |
| `npm run format` / `format:check` | Prettier write / verify                                               |
| `npm run check`                   | typecheck + lint + format check + tests                               |

Each workspace can also be run on its own, e.g. `npm run dev -w server`.

## Configuration

Environment variables are read from a `.env` file in the repo root (see `.env.example`).

| Variable      | Default     | Description                                          |
| ------------- | ----------- | ---------------------------------------------------- |
| `SERVER_HOST` | `127.0.0.1` | Interface the backend binds to. Keep it on loopback. |
| `SERVER_PORT` | `3001`      | Backend port; the Vite proxy uses the same value.    |

## API

| Method | Path          | Response                 |
| ------ | ------------- | ------------------------ |
| `GET`  | `/api/health` | `200 { "status": "ok" }` |

Unknown routes return `404 { "error": { "code": "NOT_FOUND", "message": "..." } }`.
Unexpected server errors return `500` with a generic message; stack traces are never sent
to the browser.

## Security notes

The backend acts as an HTTP proxy, which creates server-side request forgery (SSRF) risk.
It binds to `127.0.0.1` by default and logs a warning if configured otherwise. Destination
validation (blocking private/loopback addresses, redirect checks, timeouts, size limits) is
implemented in Milestone 3. **Do not expose this server publicly.**

## Development decisions

- **Vitest for both client and server.** PROJECT.md suggests Node's test runner or Jest for
  the backend; Vitest was chosen instead so both workspaces share one runner and syntax, with
  native TypeScript/ESM support.
- **TypeScript 6.0**, not 7.x: `typescript-eslint` does not support TypeScript 7 yet.
- **No `dotenv`.** Node's built-in `process.loadEnvFile()` loads `.env`.
- **Vite proxy instead of CORS.** The browser only talks to its own origin in development.
- **LF line endings** are enforced via `.gitattributes` so Prettier checks are consistent on
  Windows.

## Known issues

- `npm audit` reports a moderate `minimatch` advisory in the ESLint toolchain (dev-only, not
  shipped). The automatic fix would downgrade ESLint to v4, so it is left until upstream
  updates.
