# Security Policy

Digche handles authentication, user profiles, support data, and infrastructure credentials.

## Reporting Security Issues

Do not publish exploitable security details in a public issue.

Share security-sensitive findings with the project maintainers through a private team communication channel.

## Sensitive Information

Never commit:

- JWT secrets;
- internal service API keys;
- database passwords;
- OTP provider credentials;
- object-storage access keys;
- SSH private keys;
- production environment files.

If a real secret is exposed in Git history, rotate it.

## Authentication and Internal APIs

Internal service endpoints and credentials should only be accessible by services that require them.

Use strong secrets and restrict production access appropriately.

## Logs

Avoid logging:

- OTP values;
- refresh tokens;
- authorization headers;
- credentials;
- private keys.

## Production Access

Use least-privilege access for server accounts, CI/CD credentials, databases, backups, and external storage.
