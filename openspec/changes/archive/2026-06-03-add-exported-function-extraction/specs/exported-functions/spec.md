# exported-functions Specification

## Purpose

Extract exported function names from supported source files for use by duplicate utility drift analysis.

## Requirements

### Requirement: Source files carry content after scanning

The scanner SHALL populate `RepoFile.content` for supported files it discovers.

#### Scenario: Supported file content is loaded

- **WHEN** `scanRepo` discovers a supported source file
- **THEN** the returned `RepoFile` SHALL include the file's UTF-8 content

### Requirement: Extract exported function names

The system SHALL extract exported function declarations, named default function declarations, and exported const arrow functions into `{ name, filePath }` entries.

#### Scenario: Function declarations are extracted

- **WHEN** a source file contains `export function formatDate() {}`
- **THEN** the extractor SHALL include `formatDate`

#### Scenario: Const arrow functions are extracted

- **WHEN** a source file contains `export const parseDate = () => {}`
- **THEN** the extractor SHALL include `parseDate`

### Requirement: Profile remains pure

`buildConventionProfile` SHALL derive `exportedFunctions` only from the `RepoFile[]` input and SHALL NOT perform I/O.

#### Scenario: Files without content keep empty exports

- **WHEN** profile input files omit content
- **THEN** `exportedFunctions` SHALL be empty
