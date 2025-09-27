/* eslint-disable sort-keys */
/**
 * Shared exit codes for CLI commands
 * Following standard Unix exit code conventions
 */
export enum EXIT_CODES {
  /** Success */
  SUCCESS = 0,

  /** General error */
  GENERAL_ERROR = 1,

  /** Resource not found (e.g., task not found) */
  NOT_FOUND = 2,

  /** Operation failed (e.g., task completion failed) */
  OPERATION_FAILED = 3,

  /** Validation failed */
  VALIDATION_FAILED = 4,

  /** Fix operation failed */
  FIX_FAILED = 5,
}

export type ExitCode = (typeof EXIT_CODES)[keyof typeof EXIT_CODES];
