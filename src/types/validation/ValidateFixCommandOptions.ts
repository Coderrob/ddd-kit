/**
 * Options for the 'validate fix' command
 */
export interface ValidateFixCommandOptions {
  /** Apply fixes automatically */
  fix?: boolean;
  /** Perform dry run without making changes */
  dryRun?: boolean;
  /** Output format: json, csv */
  format?: 'json' | 'csv';
  /** Pattern to exclude tasks */
  exclude?: string;
}
