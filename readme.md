# URLShortenerV3

Acortador de URLs con cuenta de usuario, panel de control, analytics de clics y soporte para enlaces anónimos con reclamo por secreto.

## Qué hace la aplicación

- Crear enlaces cortos (usuarios autenticados o invitados).
- Gestionar títulos, descripción y tags desde el dashboard.
- Ver estadísticas (clics totales, últimas 24 h, dispositivos, países, referrers).
- Ranking y caché auxiliar con Redis; persistencia en PostgreSQL.

## Arquitectura del monorepo

| Carpeta | Rol |
|---------|-----|
| `apps/frontend` | UI (React + Vite): login, acortador, dashboard, stats. |
| `apps/backend` | API NestJS: auth, URLs, tags, analytics, redirect `/:shortCode`. |

| Servicio | Rol |
|----------|-----|
| **PostgreSQL** | Usuarios, URLs, tags, stats por click, secretos anónimos. |
| **Redis** | Contadores/ranking y operaciones rápidas en caliente. |

## Flujo: usuario → frontend → backend → DB / Redis

1. **Usuario** usa el navegador (login, crear link, filtrar dashboard, abrir stats).
2. **Frontend** llama al API (`fetch` contra `VITE_API_BASE_URL`) con JSON y, si aplica, `Authorization: Bearer …`.
3. **Backend** valida JWT, ejecuta lógica de negocio y:
   - **escribe/lee en PostgreSQL** (URLs, usuarios, `url_stats`, etc.);
   - **actualiza Redis** (clicks, ranking, limpieza de caché cuando toca).
4. **Click en un short link**: el cliente pide `GET https://<host-backend>/<shortCode>`; el backend resuelve el código, registra el evento (async + DB), incrementa contadores y responde **redirect 301** a la URL destino.

```text
Usuario
  │
  ▼
Frontend (Vite / Nginx estático)
  │  HTTPS/HTTP + JSON + JWT
  ▼
Backend (NestJS)
  ├──► PostgreSQL (datos duraderos)
  └──► Redis (ranking / caché / contadores)
```

## Arranque con Docker (recomendado en local)

Desde la **raíz del repo** (`URLShortenerV3`).

### 1) Backend + PostgreSQL + Redis

```powershell
docker compose -f .\docker-compose.backend.yml up -d --build
```

Por defecto queda:

- API: `http://localhost:3000`
- Postgres: `localhost:5432` (usuario/contraseña `postgres` / `postgres`, DB `url_shortener`)
- Redis: `localhost:6379`

Variables relevantes en `docker-compose.backend.yml` (puedes sobreescribirlas en el mismo archivo o con un `.env` al lado del compose):

| Variable | Uso |
|----------|-----|
| `PORT` | Puerto del API (3000 en el compose). |
| `DB_HOST`, `DB_PORT`, `DB_USERNAME`, `DB_PASSWORD`, `DB_NAME` | Conexión a Postgres. |
| `REDIS_HOST`, `REDIS_PORT` | Conexión a Redis. |
| `JWT_SECRET` | Firma de tokens JWT. |
| `SHORT_URL_BASE` | Base pública de los short links (ej. `http://localhost:3000`). |
| `CORS_ORIGIN` | Orígenes permitidos del frontend (coma-separados). Debe coincidir con la URL desde la que abres la UI. |
| `FRONTEND_BASE_URL` | Base del front para redirects (ej. 404); por defecto en código suele ser `http://localhost:8080`. |

**Importante:** si sirves el front en Docker en el puerto **8080**, ajusta en el compose del backend algo como:

```yaml
CORS_ORIGIN: http://localhost:8080
```

(El ejemplo del repo a veces trae `http://localhost:5173`; eso es para otro flujo de dev.)

### 2) Frontend (Nginx + estáticos)

```powershell
docker compose -f .\docker-compose.frontend.yml up -d --build
```

- Puerto por defecto: **8080** → `http://localhost:8080`
- El build inyecta la URL del API con build-arg:

| Variable | Uso |
|----------|-----|
| `VITE_API_BASE_URL` | URL base del backend que el bundle usará (default en compose: `http://localhost:3000`). |
| `FRONTEND_PORT` | Puerto publicado del contenedor (default `8080`). |

Ejemplo explícito:

```powershell
$env:VITE_API_BASE_URL="http://localhost:3000"
$env:FRONTEND_PORT="8080"
docker compose -f .\docker-compose.frontend.yml up -d --build
```

El `Dockerfile` del frontend copia `changelog.md` en la raíz del contexto de build; el contexto debe ser la raíz del monorepo (ya está así en el compose).

## Desarrollo sin Docker (resumen)

- Instalar dependencias con **pnpm** en la raíz del monorepo.
- Backend: variables de entorno alineadas con `docker-compose.backend.yml` pero con `DB_HOST=localhost` y `REDIS_HOST=localhost` si Postgres/Redis los tienes locales.
- Frontend: `pnpm` en `apps/frontend`; en dev Vite usa puerto **8080** (`vite.config.ts`). Define `VITE_API_BASE_URL=http://localhost:3000` (o `.env` en frontend).

## Notas de producción

- Coloca **HTTPS** y un reverse proxy que reenvíe la IP real del cliente (`X-Forwarded-For`, etc.) para geolocalización fiable en stats.
- Alinea `SHORT_URL_BASE` con el dominio público de los short links y `CORS_ORIGIN` / `FRONTEND_BASE_URL` con el dominio real del front.

## Documentación adicional

- Resumen orientado a producto: `changelog.md`.
