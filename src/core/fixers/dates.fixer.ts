import { FixRecord, ITask } from '../../types/tasks';

import { normalizeToIso, setIfChanged } from './fixer-utils';

export function fixDateField(params: {
  nowIso: string;
  asObj: ITask;
  field: 'created' | 'updated';
  fixes: FixRecord[];
  id: string;
}): void {
  const { nowIso, asObj, field, fixes, id } = params;
  // eslint-disable-next-line security/detect-object-injection
  const current = String((asObj as Record<string, unknown>)[field] ?? '');
  const normalized = normalizeToIso(nowIso, current);
  if (current === normalized) return;
  setIfChanged({ asObj, field, next: normalized, fixes, id });
}
