export type OutputFormat = "markdown" | "json";

export type RepoFile = {
  path: string;
  name: string;
  extension: string;
  directory: string;
  isChanged?: boolean;
};

export type ScanOptions = {
  cwd?: string;
  changedFiles?: string[];
};

export type CheckOptions = {
  format: OutputFormat;
  base?: string;
  changed: string[];
};
