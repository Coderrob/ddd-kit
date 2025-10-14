import { FixRecord, ITask } from '../../types/tasks';
import { normalizeToIso } from '../helpers/date.helper';

import { setIfChangedImmutable } from './fixer-utils';

/**
 * Fixes a date field ('created' or 'updated') on a task object to ensure it is in ISO format.
 * If the current value is not in ISO format, it will be normalized to ISO using the provided current time as reference.
 * Records any changes made in the fixes array.
 *
 * @param params - Parameters for fixing the date field
 * @param params.nowIso - The current time in ISO format to use as reference for normalization
 * @param params.asObj - The task object containing the date field to fix
 * @param params.field - The specific date field to fix ('created' or 'updated')
 * @param params.fixes - Array to record any fixes made
 * @param params.id - The ID of the task being fixed (for logging purposes)
 * @returns A new task object with the fixed date field, or the original object if no change was needed
 */
export function fixDateField(params: {
  nowIso: string;
  asObj: ITask;
  field: 'created' | 'updated';
  fixes: FixRecord[];
  id: string;
}): ITask {
  const { nowIso, asObj, field, fixes, id } = params;
  // eslint-disable-next-line security/detect-object-injection
  const current = String((asObj as Record<string, unknown>)[field] ?? '');
  const normalized = normalizeToIso(nowIso, current);
  if (current === normalized) return asObj;
  return setIfChangedImmutable({ asObj, field, next: normalized, fixes, id });
}
