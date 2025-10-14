import { FixRecord, IFixerOptions, ITask, TaskFixResult } from '../../types/tasks';

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
   * @param task - The original task object (not modified).
   * @returns An object containing the fixed task and an array of FixRecord objects describing the fixes applied.
   */
  applyBasicFixes(task: ITask): TaskFixResult {
    const fixes: FixRecord[] = [];
    const id = String(task.id);

    // Chain the immutable fixes
    let fixedTask = fixPriority(task, fixes, id);
    fixedTask = fixStatus(fixedTask, fixes, id);
    fixedTask = fixDateField({
      nowIso: this.nowIso,
      asObj: fixedTask,
      field: 'created',
      fixes,
      id,
    });
    fixedTask = fixDateField({
      nowIso: this.nowIso,
      asObj: fixedTask,
      field: 'updated',
      fixes,
      id,
    });
    fixedTask = fixOwner(fixedTask, fixes, id);

    return { fixedTask, fixes };
  }
}
