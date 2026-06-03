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

export type FileCategory =
  | "component"
  | "hook"
  | "api"
  | "service"
  | "utility"
  | "route"
  | "test"
  | "unknown";

export type ExportedFunction = {
  name: string;
  filePath: string;
};

export type ConventionProfile = {
  filesScanned: number;
  naming: NamingStyleSummary;
  folders: {
    components: string[];
    hooks: string[];
    api: string[];
    services: string[];
    utilities: string[];
    routes: string[];
    tests: string[];
  };
  exportedFunctions: ExportedFunction[];
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
