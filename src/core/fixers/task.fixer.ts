import { FixRecord, IFixerOptions, ITask } from '../../types/tasks';

import { fixPriority } from './priority.fixer';
import { fixStatus } from './status.fixer';
import { fixDateField } from './dates.fixer';
import { fixOwner } from './owner.fixer';

/**
 * Class responsible for applying automatic fixes to task objects that have validation issues.
 */
export class TaskFixer {
  private readonly nowIso: string;

  /**
   * Creates a new Fixer instance.
   * @param options - Optional configuration options for the fixer.
   */
  constructor(options?: IFixerOptions) {
    // Use full RFC3339 to satisfy "date-time" schema (not just YYYY-MM-DD)
    this.nowIso = options?.today ?? new Date().toISOString();
  }

  /**
   * Applies basic automatic fixes to common validation issues in a task object.
   * @param asObj - The task object to fix (as a record).
   * @returns An array of FixRecord objects describing the fixes applied.
   */
  applyBasicFixes(asObj: ITask): FixRecord[] {
    const fixes: FixRecord[] = [];
    const id = String(asObj.id);

    fixPriority(asObj, fixes, id);
    fixStatus(asObj, fixes, id);
    fixDateField({ nowIso: this.nowIso, asObj, field: 'created', fixes, id });
    fixDateField({ nowIso: this.nowIso, asObj, field: 'updated', fixes, id });
    fixOwner(asObj, fixes, id);

    return fixes;
  }
}
