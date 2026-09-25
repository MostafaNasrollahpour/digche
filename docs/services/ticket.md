# Ticket Service

Path:

```text
Backend/services/ticket
```

## Responsibility

Ticket implements the support workflow between users and administrative users.

It handles:

- ticket creation;
- personal ticket history;
- administrative ticket listing;
- review state;
- administrative replies.

## Technology

- Node.js
- Express
- Sequelize
- PostgreSQL
- JWT
- OpenAPI / Swagger

## Persistence

```text
ticket_db
```

## API Areas

Public user operations:

```text
POST /tickets
GET  /tickets/me
```

Administrative operations include listing, viewing, reviewing, and replying to tickets.

## Documentation

OpenAPI source:

```text
Backend/docs/api/ticket.openapi.yaml
```
