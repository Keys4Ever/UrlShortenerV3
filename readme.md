# URLShortenerV3

URL shortener with user accounts, a control panel, click analytics, and support for anonymous links with secret-based claiming.

## What the app does

- Create short links (signed-in or guest users).
- Manage titles, descriptions, and tags from the dashboard.
- View statistics (total clicks, last 24 h, devices, countries, referrers).
- Ranking and auxiliary cache with Redis; persistence in PostgreSQL.

## Monorepo layout

| Path | Role |
|------|------|
| `apps/frontend` | UI (React + Vite): login, shortener, dashboard, stats. |
| `apps/backend` | NestJS API: auth, URLs, tags, analytics, `/:shortCode` redirect. |

| Service | Role |
|---------|------|
| **PostgreSQL** | Users, URLs, tags, per-click stats, anonymous secrets. |
| **Redis** | Counters/ranking and fast hot-path operations. |

## Flow: user → frontend → backend → DB / Redis

1. **User** uses the browser (login, create link, filter dashboard, open stats).
2. **Frontend** calls the API (`fetch` to `VITE_API_BASE_URL`) with JSON and, when applicable, `Authorization: Bearer …`.
3. **Backend** validates JWT, runs business logic and:
   - **reads/writes PostgreSQL** (URLs, users, `url_stats`, etc.);
   - **updates Redis** (clicks, ranking, cache invalidation when needed).
4. **Short-link click**: the client requests `GET https://<backend-host>/<shortCode>`; the backend resolves the code, records the event (async + DB), bumps counters, and returns a **301 redirect** to the destination URL.

```text
User
  │
  ▼
Frontend (Vite / static Nginx)
  │  HTTPS/HTTP + JSON + JWT
  ▼
Backend (NestJS)
  ├──► PostgreSQL (durable data)
  └──► Redis (ranking / cache / counters)
```

## Running with Docker (recommended locally)

From the **repository root** (`URLShortenerV3`).

### 1) Backend + PostgreSQL + Redis

```powershell
docker compose -f .\docker-compose.backend.yml up -d --build
```

Defaults:

- API: `http://localhost:3000`
- Postgres: `localhost:5432` (user/password `postgres` / `postgres`, DB `url_shortener`)
- Redis: `localhost:6379`

Relevant variables in `docker-compose.backend.yml` (override in that file or with a `.env` next to the compose file):

| Variable | Purpose |
|----------|---------|
| `PORT` | API port (3000 in compose). |
| `DB_HOST`, `DB_PORT`, `DB_USERNAME`, `DB_PASSWORD`, `DB_NAME` | Postgres connection. |
| `REDIS_HOST`, `REDIS_PORT` | Redis connection. |
| `JWT_SECRET` | JWT signing secret. |
| `SHORT_URL_BASE` | Public base for short links (e.g. `http://localhost:3000`). |
| `CORS_ORIGIN` | Allowed frontend origins (comma-separated). Must match the URL you use to open the UI. |
| `FRONTEND_BASE_URL` | Frontend base for redirects (e.g. 404); code default is often `http://localhost:8080`. |

**Important:** if you serve the frontend on Docker port **8080**, set something like this in the backend compose:

```yaml
CORS_ORIGIN: http://localhost:8080
```

(The repo example may still show `http://localhost:5173`; that targets a different dev workflow.)

### 2) Frontend (Nginx + static assets)

```powershell
docker compose -f .\docker-compose.frontend.yml up -d --build
```

- Default port: **8080** → `http://localhost:8080`
- The build injects the API URL via build-arg:

| Variable | Purpose |
|----------|---------|
| `VITE_API_BASE_URL` | Backend base URL baked into the bundle (compose default: `http://localhost:3000`). |
| `FRONTEND_PORT` | Published host port for the container (default `8080`). |

Explicit example:

```powershell
$env:VITE_API_BASE_URL="http://localhost:3000"
$env:FRONTEND_PORT="8080"
docker compose -f .\docker-compose.frontend.yml up -d --build
```

The frontend `Dockerfile` copies `changelog.md` at the root of the build context; the context must be the monorepo root (as in the compose file).

## Development without Docker (summary)

- Install dependencies with **pnpm** at the monorepo root.
- Backend: same env vars as `docker-compose.backend.yml`, but `DB_HOST=localhost` and `REDIS_HOST=localhost` if Postgres/Redis run locally.
- Frontend: `pnpm` in `apps/frontend`; dev Vite listens on **8080** (`vite.config.ts`). Set `VITE_API_BASE_URL=http://localhost:3000` (or a frontend `.env`).

## Production notes

- Use **HTTPS** and a reverse proxy that forwards the real client IP (`X-Forwarded-For`, etc.) for reliable geo in stats.
- Align `SHORT_URL_BASE` with the public short-link domain and `CORS_ORIGIN` / `FRONTEND_BASE_URL` with the real frontend domain.

## Additional documentation

- Product-oriented summary: `changelog.md`.
