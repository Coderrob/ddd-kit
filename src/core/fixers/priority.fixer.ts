import { FixRecord, ITask, TaskPriority } from '../../types/tasks';

import { setIfChangedImmutable } from './fixer-utils';

/**
 * Ensures the task has a valid priority; returns a new task with P2 if missing or invalid.
 *
 * @param asObj - The original task object (not modified).
 * @param fixes - Array to record any fixes made.
 * @param id - The ID of the task (for logging purposes).
 * @returns A new task object with the fixed priority field, or the original object if no change was needed.
 */
export function fixPriority(asObj: ITask, fixes: FixRecord[], id: string): ITask {
  const raw = String((asObj as Record<string, unknown>)['priority'] ?? '');
  const valid = Object.values(TaskPriority) as string[];
  const isValid = raw !== '' && valid.includes(raw);
  if (isValid) return asObj;
  return setIfChangedImmutable({ asObj, field: 'priority', next: TaskPriority.P2, fixes, id });
}
