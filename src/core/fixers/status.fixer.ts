import { FixRecord, ITask, TaskStatus } from '../../types/tasks';

import { setIfChangedImmutable } from './fixer-utils';

const VALID: TaskStatus[] = [TaskStatus.Open, TaskStatus.Closed, TaskStatus.InReview];

/**
 * Ensures the task has a valid status; returns a new task with 'open' if missing or invalid.
 *
 * @param asObj - The original task object (not modified).
 * @param fixes - Array to record any fixes made.
 * @param id - The ID of the task (for logging purposes).
 * @returns A new task object with the fixed status field, or the original object if no change was needed.
 */
export function fixStatus(asObj: ITask, fixes: FixRecord[], id: string): ITask {
  const raw = String((asObj as Record<string, unknown>)['status'] ?? '');
  const isValid = raw !== '' && (VALID as string[]).includes(raw);
  if (isValid) return asObj;
  return setIfChangedImmutable({ asObj, field: 'status', next: TaskStatus.Open, fixes, id });
}
