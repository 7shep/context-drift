export type OutputFormat = "markdown" | "json";

export type NamingStyle =
  | "pascal-case"
  | "kebab-case"
  | "camel-case"
  | "snake-case"
  | "lower-case"
  | "upper-case"
  | "unknown";

export type NamingStyleSummary = {
  pascalCasePercent: number;
  kebabCasePercent: number;
  camelCasePercent: number;
  snakeCasePercent: number;
  lowerCasePercent: number;
  upperCasePercent: number;
  unknownPercent: number;
};

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
