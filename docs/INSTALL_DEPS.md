# Backup and restore dependencies

The backup and restore dependencies are declared in `package.json` and installed with the normal project setup:

```bash
npm install
```

## Why

| Package | Used in | Purpose |
|---|---|---|
| `archiver` | `app/api/admin/backup/route.ts` | Streams a zip of `site.db` + `uploads/` as a download |
| `adm-zip` | `app/api/admin/restore/route.ts` | Reads an uploaded zip and extracts it synchronously |
| `@types/archiver` | dev | TypeScript types for archiver |

Both runtime packages are pure JavaScript and need no extra native build steps in Docker.
