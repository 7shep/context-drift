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
  content?: string;
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

export type DriftFinding = {
  type: "naming-drift" | "location-drift" | "duplicate-utility";
  severity: "low" | "medium" | "high";
  confidence: number;
  file: string;
  title: string;
  message: string;
  suggestion?: string;
  relatedFiles?: string[];
};

export type ScanOptions = {
  cwd?: string;
  changedFiles?: string[];
};

export type CheckOptions = {
  format: OutputFormat;
  base?: string;
  changed: string[];
  minConfidence: number;
};

export type FindingSummary = {
  findings: number;
  high: number;
  medium: number;
  low: number;
};

export type CheckReport = {
  summary: FindingSummary & {
    filesScanned: number;
    changedFiles: number;
  };
  naming: NamingStyleSummary;
  findings: DriftFinding[];
};
