# Digche Backend

The Digche backend is a set of services behind an Nginx API gateway.

## Services

```text
Backend/
├── gateway/
├── docs/api/
├── scripts/
└── services/
    ├── auth/
    ├── chat/
    ├── core/
    ├── media/
    └── ticket/
```

## Stack

| Service | Main Technology |
| --- | --- |
| Auth | Node.js / Express |
| Core | .NET 9 / ASP.NET Core |
| Chat | Node.js / Fastify |
| Media | Node.js / Express |
| Ticket | Node.js / Express |
| Gateway | Nginx |

## Local Development

Create the service environment files:

```bash
cp services/auth/.env.example services/auth/.env
cp services/chat/.env.example services/chat/.env
cp services/media/.env.example services/media/.env
cp services/ticket/.env.example services/ticket/.env
```

Then start:

```bash
docker compose up -d --build
```

Gateway:

```text
http://localhost:8081
```

## Documentation

- [Architecture Overview](../docs/architecture/overview.md)
- [Getting Started](../docs/development/getting-started.md)
- [Environment Variables](../docs/development/environment.md)
- [Production Deployment](../docs/deployment/production.md)
- [API Documentation](../docs/api/README.md)
