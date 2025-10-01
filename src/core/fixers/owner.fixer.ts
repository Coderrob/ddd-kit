import { FixRecord, ITask } from '../../types/tasks';

import { setIfChanged } from './fixer-utils';

export function fixOwner(asObj: ITask, fixes: FixRecord[], id: string): void {
  const raw = String((asObj as Record<string, unknown>)['owner'] ?? '');
  const trimmed = raw.trim();
  if (trimmed === '') return;

  const collapsed = trimmed.replace(/\s+/g, ' ');
  const title = collapsed
    .split(' ')
    .filter(Boolean)
    .map((s) => s.charAt(0).toUpperCase() + s.slice(1).toLowerCase())
    .join(' ');

  if (title === raw) return;
  setIfChanged({ asObj, field: 'owner', next: title, fixes, id });
}
