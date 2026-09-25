# Service Communication

Digche uses HTTP for synchronous service-to-service communication and WebSocket for realtime chat delivery.

## Public Request Flow

```mermaid
sequenceDiagram
    participant C as Client
    participant E as Host Nginx
    participant G as API Gateway
    participant S as Service

    C->>E: HTTP request
    E->>G: Proxy backend route
    G->>S: Route request
    S-->>G: Response
    G-->>E: Response
    E-->>C: Response
```

## Internal Auth Communication

Core, Chat, Media, and Ticket depend on identity owned by Auth.

```mermaid
flowchart LR
    Core --> Auth
    Chat --> Auth
    Media --> Auth
    Ticket --> Auth
```

These calls use protected internal Auth endpoints and an internal API key.

## Chat

Chat supports REST for conversation/history operations and WebSocket for realtime communication.

```text
Client -> Nginx -> Gateway -> Chat Service
```

Both proxy layers must preserve WebSocket upgrade headers.

## Media

The Media Service creates presigned upload information.

The client then uploads directly to object storage:

```mermaid
sequenceDiagram
    participant C as Client
    participant M as Media Service
    participant S as Object Storage

    C->>M: Request presigned upload
    M-->>C: Upload URL + fields + public URL
    C->>S: Direct image upload
    S-->>C: Upload result
```

## Data Ownership

Cross-service communication should use service APIs rather than direct database access.

The service that owns a domain remains the authoritative source for that domain's data.
