# Auth Service

Path:

```text
Backend/services/auth
```

## Responsibility

Auth is the identity and authentication service of Digche.

It handles:

- OTP login;
- registration;
- access and refresh tokens;
- public user profiles;
- client and chef roles;
- admin and manager authentication;
- administrative user management;
- internal token verification;
- internal profile resolution.

## Technology

- Node.js
- Express
- Sequelize
- PostgreSQL
- Redis
- JWT
- OTP provider integration
- OpenAPI / Swagger

## Persistence

```text
PostgreSQL
Redis
```

PostgreSQL stores persistent identity data. Redis is used for temporary authentication-related state such as OTP/rate-limit/cache data.

## Main API Areas

```text
/auth/*
/admin/auth/*
/admin/admin-users*
/admin/chefs*
/internal/auth/*
```

## Internal API

Other backend services use protected Auth endpoints for identity-related operations.

This keeps Auth as the source of truth for user identity and profile information.

## Documentation

OpenAPI source:

```text
Backend/docs/api/auth.openapi.yaml
```
