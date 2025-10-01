import { FixRecord, ITask, TaskPriority } from '../../types/tasks';

import { setIfChanged } from './fixer-utils';

export function fixPriority(asObj: ITask, fixes: FixRecord[], id: string): void {
  const raw = String((asObj as Record<string, unknown>)['priority'] ?? '');
  const valid = Object.values(TaskPriority) as string[];
  const isValid = raw !== '' && valid.includes(raw);
  if (isValid) return;
  setIfChanged({ asObj, field: 'priority', next: TaskPriority.P2, fixes, id });
}
