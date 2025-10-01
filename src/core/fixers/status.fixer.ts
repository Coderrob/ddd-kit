import { FixRecord, ITask, TaskStatus } from '../../types/tasks';

import { setIfChanged } from './fixer-utils';

const VALID: TaskStatus[] = [TaskStatus.Open, TaskStatus.Closed, TaskStatus.InReview];

export function fixStatus(asObj: ITask, fixes: FixRecord[], id: string): void {
  const raw = String((asObj as Record<string, unknown>)['status'] ?? '');
  const isValid = raw !== '' && (VALID as string[]).includes(raw);
  if (isValid) return;
  setIfChanged({ asObj, field: 'status', next: TaskStatus.Open, fixes, id });
}
