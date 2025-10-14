import { FixRecord, ITask } from '../../types/tasks';

import { setIfChangedImmutable } from './fixer-utils';

/**
 * Normalizes and fixes the 'owner' field of a task.
 *
 * This function trims whitespace, collapses multiple spaces, and capitalizes
 * each word in the 'owner' field of the given task object. If the normalized
 * value differs from the original, it returns a new task object with the updated field
 * and records the change in the provided fixes array.
 *
 * @param asObj - The original task object (not modified).
 * @param fixes - Array to record any changes made.
 * @param id - The ID of the task being modified (for logging purposes).
 * @returns A new task object with the fixed owner field, or the original object if no change was needed.
 */
export function fixOwner(asObj: ITask, fixes: FixRecord[], id: string): ITask {
  const raw = String((asObj as Record<string, unknown>)['owner'] ?? '');
  const trimmed = raw.trim();
  if (trimmed === '') return asObj;

  const collapsed = trimmed.replace(/\s+/g, ' ');
  const title = collapsed
    .split(' ')
    .filter(Boolean)
    .map((s) => s.charAt(0).toUpperCase() + s.slice(1).toLowerCase())
    .join(' ');

  if (title === raw) return asObj;
  return setIfChangedImmutable({ asObj, field: 'owner', next: title, fixes, id });
}
