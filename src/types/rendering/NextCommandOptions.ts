/**
 * Options for the 'next' command
 */
export interface NextCommandOptions {
  /** Task provider: todo, issues, projects */
  provider?: string;
  /** Filters for task selection */
  filters?: string[];
  /** Branch prefix */
  branchPrefix?: string;
  /** Pin to specific ddd-kit commit/tag */
  pin?: string;
  /** Open PR after hydration */
  openPr?: boolean;
}
