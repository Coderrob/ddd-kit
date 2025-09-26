import type { FixRecord } from './FixRecord';

export interface ITaskFixer {
  applyBasicFixes(task: Record<string, unknown>): FixRecord[];
}
