# Chat Service

Path:

```text
Backend/services/chat
```

## Responsibility

Chat provides persistent one-to-one conversations and realtime messaging.

It handles:

- conversations;
- participants;
- messages;
- unread state;
- realtime WebSocket events.

## Technology

- Node.js
- Fastify
- WebSocket
- Sequelize
- PostgreSQL
- JWT

## Persistence

```text
chat_db
```

## Communication

REST is used for conversation and message-history operations.

WebSocket is used for realtime delivery.

Chat also communicates with Auth for identity verification and profile resolution.

## Main API Areas

```text
/chat/conversations
/chat/conversations/{id}/messages
/chat/conversations/{id}/read
/chat/ws
```

## Documentation

OpenAPI source:

```text
Backend/docs/api/chat.openapi.yaml
```
