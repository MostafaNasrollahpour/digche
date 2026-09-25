# Digche Documentation

This directory contains the project-level documentation for Digche.

The root `README.md` gives a high-level overview. The files here document the architecture, services, development setup, and deployment structure in more detail.

## Architecture

- [Architecture Overview](architecture/overview.md)
- [Authentication Architecture](architecture/authentication.md)
- [Service Communication](architecture/communication.md)

## Services

- [Auth Service](services/auth.md)
- [Core Service](services/core.md)
- [Chat Service](services/chat.md)
- [Media Service](services/media.md)
- [Ticket Service](services/ticket.md)

## Development

- [Getting Started](development/getting-started.md)
- [Environment Variables](development/environment.md)
- [Testing](development/testing.md)
- [Troubleshooting](development/troubleshooting.md)

## API

- [API Documentation](api/README.md)

## Deployment

- [Deployment Overview](deployment/overview.md)
- [Production Deployment](deployment/production.md)
- [Backup and Restore](deployment/backup-restore.md)

## Documentation Guidelines

- Keep implementation details close to the service that owns them.
- Keep the root README focused on project-level information.
- Update documentation when routes, architecture, environment variables, or deployment behavior change.
- Prefer Mermaid diagrams for architecture that should evolve with the repository.
- Do not place real credentials, tokens, passwords, or private keys in documentation.
