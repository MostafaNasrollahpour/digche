# Production Deployment

This document describes the deployment structure represented in the repository.

## Backend

Production uses the base Compose file together with the production override:

```bash
cd Backend

docker compose \
  -f docker-compose.yml \
  -f docker-compose.prod.yml \
  up -d --build
```

Production environment files should contain real deployment values and remain outside committed source files.

## Frontend

Typical production build:

```bash
cd frontend
npm ci
npm run build
```

The repository deployment workflow runs the Next.js application with PM2.

## Nginx

Host-level Nginx configuration is stored under:

```text
deploy/nginx/
```

It proxies frontend traffic to Next.js and backend traffic to the Dockerized API gateway.

## GitHub Actions

Production deployment workflow:

```text
.github/workflows/deploy-production.yml
```

The workflow handles release upload, backend restart, frontend build/restart, Nginx reload, and health validation.

## Production Configuration

Before deploying, confirm:

- database credentials;
- JWT configuration;
- internal service keys;
- OTP provider configuration;
- object-storage credentials;
- CORS origins;
- frontend backend URL;
- Nginx host configuration;
- server-side environment files.

## Health Checks

Backend services expose health endpoints that can be checked through the gateway.

Frontend availability can be checked directly through the Next.js process or public Nginx route.
