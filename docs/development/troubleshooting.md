# Troubleshooting

## Backend gateway is unavailable

```bash
cd Backend
docker compose ps
docker compose logs gateway
```

Expected local gateway:

```text
http://localhost:8081
```

## A service exits during startup

Inspect its logs:

```bash
docker compose logs auth-service
docker compose logs chat-service
docker compose logs media-service
docker compose logs ticket-service
docker compose logs core-service
```

Common causes include missing environment configuration or unavailable dependencies.

## Frontend cannot reach the backend

Check:

```env
NEXT_PUBLIC_API_BASE_URL=http://localhost:8081
NEXT_BACKEND_API_BASE_URL=http://localhost:8081
```

Restart the frontend after changing environment values.

## Authentication differs between services

Verify that services which validate Auth-issued tokens use the same JWT configuration.

Also verify the internal Auth API key where service-to-service calls are used.

## Database connectivity

Inside Docker, services should use Docker service names and container ports.

Host-mapped development ports are intended for tools running outside Docker.

## Reset local backend data

Warning: this removes local Docker volumes.

```bash
cd Backend
docker compose down -v
docker compose up -d --build
```

## View logs

```bash
docker compose logs --tail=200
docker compose logs -f <service-name>
```
