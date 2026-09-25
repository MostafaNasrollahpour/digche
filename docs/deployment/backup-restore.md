# Backup and Restore

PostgreSQL backup and restore helper scripts live under:

```text
Backend/scripts/
```

## Backup

Run from `Backend/`:

```bash
./scripts/backup-postgres.sh
```

The script writes compressed PostgreSQL dumps to the configured backup directory.

## Restore

Use:

```bash
./scripts/restore-postgres.sh \
  <service> \
  <user> \
  <database> \
  <backup.sql.gz>
```

## Additional Storage

Database backups do not cover S3-compatible object storage.

Redis contains temporary Auth-related state and should be treated according to the recovery requirements of the deployment.

## Production Recommendations

- run backups on a schedule;
- keep copies outside the application host;
- protect backup storage;
- define retention;
- test restore procedures;
- monitor backup failures.
