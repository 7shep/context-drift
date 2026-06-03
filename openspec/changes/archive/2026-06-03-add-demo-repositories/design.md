# Design

The examples are source-only fixtures rather than full applications. This keeps the repository small and avoids extra dependencies while still giving the scanner and analyzers realistic TypeScript and TSX files.

`nextjs-clean` establishes API helpers under `src/lib/api`, PascalCase component filenames under `src/components`, date helpers under `src/lib/date`, and hooks under `src/hooks`.

`nextjs-drifted` preserves the same baseline and adds:

- `src/utils/apiClient.ts`
- `src/components/user_profile_card.tsx`
- `src/utils/dateFormat.ts`

The README includes a `check --changed` command so users can run the demo without creating git commits.
