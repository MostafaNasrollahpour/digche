# Getting Started

This guide covers the standard local development setup.

## Prerequisites

Install:

- Git
- Docker
- Docker Compose
- Node.js
- npm

Install .NET 9 SDK if you want to run or build the Core Service outside Docker.

## Backend

```bash
cd Backend
```

Create service environment files:

```bash
cp services/auth/.env.example services/auth/.env
cp services/chat/.env.example services/chat/.env
cp services/media/.env.example services/media/.env
cp services/ticket/.env.example services/ticket/.env
```

Create `Backend/.env` with the values required by Docker Compose.

Shared authentication values such as the JWT secret and internal Auth API key must be consistent between services that use them.

The Media Service also requires valid S3-compatible object-storage configuration.

Start the backend:

```bash
docker compose up -d --build
```

Check containers:

```bash
docker compose ps
```

Local API gateway:

```text
http://localhost:8081
```

Health endpoints include:

```text
/health
/auth/health
/media/health
/chat/health
/tickets/health
/core/health
```

## Frontend

```bash
cd frontend
npm ci
```

Create `frontend/.env.local`:

```env
NEXT_PUBLIC_API_BASE_URL=http://localhost:8081
NEXT_BACKEND_API_BASE_URL=http://localhost:8081
```

Run:

```bash
npm run dev
```

Open:

```text
http://localhost:3000
```

## Useful Commands

Frontend:

```bash
(cd frontend && npm run lint && npm run build)
```

Auth:

```bash
(cd Backend/services/auth && npm test)
```

Core:

```bash
(cd Backend/services/core/FoodOrdering && dotnet build)
```

## Stop Backend

```bash
cd Backend
docker compose down
```
