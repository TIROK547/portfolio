# New npm dependencies required

Two packages need to be added to `package.json`:

```bash
npm install archiver adm-zip
npm install --save-dev @types/archiver @types/adm-zip
```

## Why

| Package | Used in | Purpose |
|---|---|---|
| `archiver` | `app/api/admin/backup/route.ts` | Streams a zip of `site.db` + `uploads/` as a download |
| `adm-zip` | `app/api/admin/restore/route.ts` | Reads an uploaded zip and extracts it synchronously |
| `@types/archiver` | dev | TypeScript types for archiver |
| `@types/adm-zip` | dev | TypeScript types for adm-zip |

Both are pure-JS, no native bindings — they work fine inside the Docker image without any extra build steps.
