# Production Deployment Checklist

## 1) Prepare environment

1. Copy `deploy/.env.prod.example` to `.env.prod`.
2. Set real secrets and domains (`JWT_SECRET`, `SHORT_URL_BASE`, `CORS_ORIGIN`).
3. Keep `TYPEORM_SYNCHRONIZE=false` for normal operation.

## 2) First boot (schema bootstrap)

If database is empty, do one controlled bootstrap:

1. Temporarily set `TYPEORM_SYNCHRONIZE=true` in `.env.prod`.
2. Start backend once:
   - `docker compose -f deploy/docker-compose.prod.yml --env-file .env.prod up -d --build backend`
3. Verify tables exist in Postgres.
4. Set `TYPEORM_SYNCHRONIZE=false` again.
5. Restart backend:
   - `docker compose -f deploy/docker-compose.prod.yml --env-file .env.prod up -d backend`

## 3) Full stack

- `docker compose -f deploy/docker-compose.prod.yml --env-file .env.prod up -d --build`

## 4) Nginx

1. Copy `deploy/nginx.prod.conf` to server.
2. Replace `example.com` / `www.example.com` with your real domain.
3. Enable site and reload nginx.
4. Install `deploy/logrotate.loggy-nginx` as `/etc/logrotate.d/loggy-nginx`.

The Nginx format intentionally omits IP, user-agent, query strings, cookies and
authorization data. It forwards `X-Request-ID` to NestJS for correlation.

## 5) Loggy agent

1. Create `/var/log/url-shortener` and grant the backend/agent read access.
2. Copy `loggy-agent.production.example.yaml` from the separate `loggy-agent`
   repository to `/etc/loggy-agent/config.yaml`.
3. Provide `LOGGY_API_KEY` using the service manager or a secret store.
4. Run `loggy-agent run --config /etc/loggy-agent/config.yaml`.
5. Verify with `loggy-agent status --config /etc/loggy-agent/config.yaml`.

## 6) HTTPS

Use certbot:

- `certbot --nginx -d example.com -d www.example.com --redirect`

## 7) Smoke tests

- `https://www.example.com` serves frontend.
- `https://www.example.com/api/docs` returns API docs JSON.
- Register/login work via `/api/auth/*`.
- `https://example.com/<shortCode>` resolves short links.
- `/var/log/url-shortener/app.jsonl` and
  `/var/log/nginx/access.loggy.jsonl` grow without containing secrets.
