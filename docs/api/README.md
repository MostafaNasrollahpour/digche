# API Documentation

The Node.js services use committed OpenAPI specifications.

## OpenAPI Files

```text
Backend/docs/api/
├── auth.openapi.yaml
├── chat.openapi.yaml
├── media.openapi.yaml
└── ticket.openapi.yaml
```

These files remain under `Backend/docs/api/` because the corresponding services load them from that location.

## Swagger

When Swagger is enabled in development, the services expose Swagger UI through their gateway routes.

Typical local endpoints:

```text
http://localhost:8081/auth/docs
http://localhost:8081/chat/docs
http://localhost:8081/media/docs
http://localhost:8081/tickets/docs
```

## Core

The Core Service uses ASP.NET Core Swagger configuration in Development mode.

See:

- [Core Service](../services/core.md)

## Updating API Documentation

When an API contract changes:

1. update the implementation;
2. update the related OpenAPI definition where one is committed;
3. update the service documentation if the behavior or authorization model changed.
