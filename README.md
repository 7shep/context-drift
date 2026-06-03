# Context Drift

Stop AI-generated code from making your repo weird.

Context Drift is an open-source CLI and GitHub Action that detects when new code does not match your existing codebase conventions.

## Usage

```bash
npx context-drift check
```

Example output:

```txt
Context Drift

Files scanned: 142
Changed files: 3
Format: markdown
```

## Local Development

```bash
npm install
npm run build
npm run check
```

The first milestone scans JavaScript and TypeScript source files:

- `**/*.ts`
- `**/*.tsx`
- `**/*.js`
- `**/*.jsx`

It ignores common generated or vendor folders:

- `node_modules`
- `.git`
- `.next`
- `dist`
- `build`
- `coverage`
