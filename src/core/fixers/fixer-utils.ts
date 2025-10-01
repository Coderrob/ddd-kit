import { FixRecord, ITask } from '../../types/tasks';
import { isEmptyString, isNullOrUndefined, isString } from '../helpers/type-guards';

/** Safely set a field if it changed and push a fix record. */
export function setIfChanged(params: {
  asObj: ITask;
  field: keyof ITask;
  next: unknown;
  fixes: FixRecord[];
  id: string;
}): void {
  const { asObj, field, next, fixes, id } = params;
  // eslint-disable-next-line security/detect-object-injection
  const current = asObj[field];
  if (current === next) return;
  fixes.push({ field: String(field), id, new: next as string, old: current as string });
  // eslint-disable-next-line security/detect-object-injection
  asObj[field] = next;
}

function isValidDate(value: string | undefined): boolean {
  if (isNullOrUndefined(value) || isEmptyString(value)) return false;
  const t = Date.parse(value);
  return !Number.isNaN(t);
}

export function normalizeToIso(nowIso: string, value: string | undefined): string {
  if (!isString(value) || !isValidDate(value)) return nowIso;
  return new Date(value).toISOString();
}
