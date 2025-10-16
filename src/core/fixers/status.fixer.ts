import { FixRecord, ITask, TaskStatus } from '../../types/tasks';

import { setIfChangedImmutable } from './fixer-utils';

const VALID: string[] = [TaskStatus.Open, TaskStatus.Closed, TaskStatus.InReview];

/**
 * Ensures the task has a valid status; returns a new task with 'open' if missing or invalid.
 *
 * @param task - The original task object (not modified).
 * @param fixes - Array to record any fixes made.
 * @param id - The ID of the task (for logging purposes).
 * @returns A new task object with the fixed status field, or the original object if no change was needed.
 */
export function fixStatus(task: ITask, fixes: FixRecord[], id: string): ITask {
  const raw = String(task.status ?? '');
  const isValid = raw !== '' && VALID.includes(raw);
  if (isValid) return task;
  return setIfChangedImmutable({ task, field: 'status', next: TaskStatus.Open, fixes, id });
}
