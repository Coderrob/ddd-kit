/**
 * Task management command types
 */

export interface TaskDetails {
  detailed_requirements?: unknown;
  validations?: unknown;
}

export interface TodoShowCommandArgs {
  /** Task ID to show */
  id: string;
}
