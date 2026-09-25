# Digche Core Service

The Core Service contains the main food-ordering domain of Digche.

## Stack

- .NET 9
- ASP.NET Core
- MediatR
- Entity Framework Core
- PostgreSQL

## Projects

```text
FoodOrdering.Core.API
FoodOrdering.Core.Application
FoodOrdering.Core.Domain
FoodOrdering.Core.Infrastructure
FoodOrdering.Core.Tests
```

The service follows a layered, Clean Architecture-inspired structure that separates HTTP concerns, application use cases, domain models, and persistence.

My primary contribution to Digche focused on this service, including its domain model, MediatR use cases, persistence layer, API controllers, database migrations, and Auth integration.

For the full technical documentation, see:

[Core Service Documentation](../../../../docs/services/core.md)
