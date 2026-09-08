# Verification

## Completed in the migration workspace

- Migrated application TypeScript/TSX files were syntax-checked with TypeScript.
- Internal import paths were checked for missing mapped files.
- No React Router, Vite runtime, `import.meta.env`, or `VITE_*` application references remain.
- The migrated unit/service suite passed: **43/43 tests**.

## Run locally after dependency installation

```bash
npm install
npm run typecheck
npm test
npm run build
```

A full dependency-aware Next.js build could not be executed in the packaging environment because the Next/React packages are not installed there. The project is configured for a normal `npm install` on the target machine.
