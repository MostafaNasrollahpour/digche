# Testing and Validation

Automated test coverage is not uniform across every service.

## Frontend

```bash
cd frontend
npm run lint
npm run build
```

## Auth Service

Auth contains automated tests.

```bash
cd Backend/services/auth
npm test
```

Additional Auth test scripts are defined in its `package.json`.

## Core Service

Core contains the xUnit test-project scaffold:

```text
FoodOrdering.Core.Tests
```

Build the Core solution:

```bash
cd Backend/services/core/FoodOrdering
dotnet build
```

## Other Services

Chat, Media, and Ticket should be validated through their service health endpoints and relevant API flows when making changes.

When automated tests are added, keep them close to the service they validate.
