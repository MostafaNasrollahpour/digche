# Environment Variables

Digche uses environment variables for database connections, authentication secrets, internal service authentication, CORS configuration, logging, and external storage/provider credentials.

Do not commit real production credentials.

## Shared Authentication Configuration

Services that validate Auth-issued tokens use the same JWT configuration.

Internal calls to Auth use a shared internal API key.

## Backend Compose Environment

The root backend environment provides values used by Docker Compose, including database passwords and shared service configuration.

Typical variables include:

```text
AUTH_DB_PASSWORD
CHAT_DB_PASSWORD
TICKET_DB_PASSWORD
CORE_DB_PASSWORD
JWT_SECRET
AUTH_INTERNAL_API_KEY
```

## Auth

Main configuration areas:

```text
Database
JWT
Refresh tokens
OTP provider
Redis
Internal API key
CORS
Swagger
Logging
```

See:

```text
Backend/services/auth/.env.example
Backend/services/auth/.env.production.example
```

## Chat

Main configuration areas:

```text
Database
JWT
Auth internal base URL
Auth internal API key
Auth request timeouts
Message/history limits
CORS
Swagger
Logging
```

See:

```text
Backend/services/chat/.env.example
Backend/services/chat/.env.production.example
```

## Media

Main configuration areas:

```text
JWT
Auth internal API
Media internal API key
S3-compatible storage endpoint
Access credentials
Bucket
Public storage URL
Upload size limits
CORS
Swagger
Logging
```

See:

```text
Backend/services/media/.env.example
Backend/services/media/.env.production.example
```

## Ticket

Main configuration areas:

```text
Database
JWT
Auth internal API
CORS
Swagger
Logging
```

See:

```text
Backend/services/ticket/.env.example
Backend/services/ticket/.env.production.example
```

## Core

Core uses ASP.NET Core configuration and environment variables.

Important configuration areas:

```text
ConnectionStrings__DefaultConnection
Jwt__Secret
AuthService__BaseUrl
AuthService__ApiKey
ASPNETCORE_ENVIRONMENT
ASPNETCORE_URLS
```

## Frontend

Important variables:

```text
NEXT_PUBLIC_API_BASE_URL
NEXT_BACKEND_API_BASE_URL
```

Recommended local file:

```text
frontend/.env.local
```

## Secret Hygiene

Never commit real:

- JWT secrets;
- internal API keys;
- database passwords;
- OTP provider credentials;
- object-storage access keys;
- SSH private keys;
- production environment files.
