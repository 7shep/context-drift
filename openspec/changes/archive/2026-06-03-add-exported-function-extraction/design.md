# Design

The scanner now reads UTF-8 content for supported source files and stores it on `RepoFile.content`. This keeps I/O at the scanning boundary while allowing `buildConventionProfile` to stay pure.

The extractor is intentionally narrow and deterministic. It recognizes:

- `export function name()`
- `export async function name()`
- `export default function Name()`
- `export const name = (...) => ...`

The original milestone plan suggested `ts-morph`, but the current environment has a broken `npm` shim and no installed `ts-morph` dependency. To keep the milestone local and dependency-free, the implementation uses a small source-text extractor and records the same public behavior expected by downstream analyzers.
