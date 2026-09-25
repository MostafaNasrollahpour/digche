# Contributing to Digche

Digche is a collaborative project. Keep changes focused, documented, and easy to review.

## Before Making Changes

Read:

- `README.md`
- `docs/architecture/overview.md`
- the relevant service documentation under `docs/services/`

## Branches

Use descriptive branch names such as:

```text
feature/order-history
fix/chat-reconnect
docs/core-architecture
refactor/media-upload
```

## Commit Messages

Prefer clear, scoped commit messages:

```text
feat(core): add customer order query
fix(auth): handle expired refresh token
docs(core): update architecture documentation
refactor(chat): simplify message mapping
```

## Pull Requests

A pull request should explain:

- what changed;
- why it changed;
- which service or area is affected;
- how the change was validated;
- whether configuration, API behavior, or documentation changed.

## Documentation

Update documentation in the same change when modifying:

- public API contracts;
- environment variables;
- service responsibilities;
- architecture;
- deployment behavior.

## Security

Do not commit real credentials, secrets, private keys, or production environment files.
