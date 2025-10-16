import { FixRecord, ITask, TaskPriority } from '../../types/tasks';

import { setIfChangedImmutable } from './fixer-utils';

const VALID: string[] = Object.values(TaskPriority);

/**
 * Ensures the task has a valid priority; returns a new task with P2 if missing or invalid.
 *
 * @param task - The original task object (not modified).
 * @param fixes - Array to record any fixes made.
 * @param id - The ID of the task (for logging purposes).
 * @returns A new task object with the fixed priority field, or the original object if no change was needed.
 */
export function fixPriority(task: ITask, fixes: FixRecord[], id: string): ITask {
  const raw = String(task.priority ?? '');
  const isValid = raw !== '' && VALID.includes(raw);
  if (isValid) return task;
  return setIfChangedImmutable({ task, field: 'priority', next: TaskPriority.P2, fixes, id });
}
