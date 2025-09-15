import type { FixRecord } from '.';

/**
 * Interface for task fixing operations.
 */

export interface ITaskFixer {
  applyBasicFixes(task: Record<string, unknown>): FixRecord[];
}
