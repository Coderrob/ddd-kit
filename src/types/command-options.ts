/**
 * Type definitions for Commander.js options and arguments for each command type.
 * These interfaces define the schema for command-line options and arguments.
 */

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

/**
 * Options for the 'render' command
 */
export interface RenderCommandOptions {
  /** Pin to specific ddd-kit commit/tag */
  pin?: string;
}

/**
 * Arguments for the 'render' command
 */
export interface RenderCommandArgs {
  /** Task ID to render */
  task: string;
}

/**
 * Options for the 'supersede' command
 */
export type SupersedeCommandOptions = Record<string, never>;

/**
 * Arguments for the 'supersede' command
 */
export interface SupersedeCommandArgs {
  /** Old UID */
  oldUid: string;
  /** New UID */
  newUid: string;
}

/**
 * Options for the 'ref audit' command
 */
export type RefAuditCommandOptions = Record<string, never>;

/**
 * Options for the 'todo add' command
 */
export type TodoAddCommandOptions = Record<string, never>;

/**
 * Arguments for the 'todo add' command
 */
export interface TodoAddCommandArgs {
  /** File containing the task to add */
  file: string;
}

/**
 * Options for the 'todo complete' command
 */
export interface TodoCompleteCommandOptions {
  /** Completion message */
  message?: string;
  /** Perform dry run without making changes */
  dryRun?: boolean;
}

/**
 * Arguments for the 'todo complete' command
 */
export interface TodoCompleteCommandArgs {
  /** Task ID to complete */
  id: string;
}

/**
 * Options for the 'todo list' command
 */
export type TodoListCommandOptions = Record<string, never>;

/**
 * Options for the 'todo show' command
 */
export type TodoShowCommandOptions = Record<string, never>;

/**
 * Arguments for the 'todo show' command
 */
export interface TodoShowCommandArgs {
  /** Task ID to show */
  id: string;
}

/**
 * Options for the 'validate tasks' command
 */
export type ValidateTasksCommandOptions = Record<string, never>;

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
