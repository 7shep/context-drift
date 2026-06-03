# Context Drift Examples

The `nextjs-clean` example shows established project patterns:

- API helpers live in `src/lib/api`.
- React components use PascalCase filenames in `src/components`.
- Date helpers live in `src/lib/date`.

The `nextjs-drifted` example keeps those baseline files and adds drifted files:

- `src/utils/apiClient.ts`
- `src/components/user_profile_card.tsx`
- `src/utils/dateFormat.ts`

After building the CLI, run the drifted demo from the repository root:

```bash
node dist/index.js check --changed "examples/nextjs-drifted/src/utils/apiClient.ts,examples/nextjs-drifted/src/components/user_profile_card.tsx,examples/nextjs-drifted/src/utils/dateFormat.ts"
```
