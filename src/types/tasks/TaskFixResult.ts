import type { FixRecord } from './FixRecord';
import { ITask } from './ITask';

/**
 * Result of applying fixes to a task object.
 *
 * Contains both the corrected task and a record of what fixes were applied.
 */
export interface TaskFixResult {
  /**
   * The task object with fixes applied.
   */
  fixedTask: ITask;

  /**
   * Array of records describing what fixes were applied to the task.
   */
  fixes: FixRecord[];
}
