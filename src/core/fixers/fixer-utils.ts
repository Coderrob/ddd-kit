import { FixRecord, ITask } from '../../types/tasks';

/**
 * Creates a new task object with a field updated if the new value is different from the current value.
 * Records the change in the fixes array.
 * @param params - Parameters for the operation.
 * @param params.asObj - The original task object (not modified).
 * @param params.field - The field of the task to potentially update.
 * @param params.next - The new value to set.
 * @param params.fixes - Array to record any changes made.
 * @param params.id - The ID of the task being modified (for logging purposes).
 * @returns A new task object with the field updated, or the original object if no change was needed.
 */
export function setIfChangedImmutable(params: {
  asObj: ITask;
  field: keyof ITask;
  next: unknown;
  fixes: FixRecord[];
  id: string;
}): ITask {
  const { asObj, field, next, fixes, id } = params;
  // eslint-disable-next-line security/detect-object-injection
  const current = asObj[field];
  if (current === next) return asObj;
  fixes.push({ field: String(field), id, new: next as string, old: current as string });
  // Create a new object with the updated field
  return { ...asObj, [field]: next };
}
