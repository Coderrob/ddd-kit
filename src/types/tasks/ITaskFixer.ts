import { ITask } from './ITask';
import { TaskFixResult } from './TaskFixResult';

/**
 * Interface for automatically fixing common task validation issues.
 *
 * Provides functionality to detect and automatically correct common
 * problems in task objects, such as formatting issues, missing fields,
 * or invalid values that can be safely corrected.
 *
 * @example
 * ```typescript
 * const fixer = container.resolve<ITaskFixer>('TaskFixer');
 * const fixes = fixer.applyBasicFixes(invalidTask);
 *
 * fixes.forEach(fix => {
 *   console.log(`Applied fix: ${fix.description}`);
 * });
 * ```
 */
export interface ITaskFixer {
  /**
   * Applies basic automatic fixes to a task object.
   *
   * Analyzes the task for common issues and applies safe corrections
   * that don't require user intervention. Examples include formatting
   * dates, normalizing status values, or adding required default fields.
   *
   * @param task - The task object to analyze and fix
   * @returns Object containing the fixed task and array of FixRecord objects describing what fixes were applied
   *
   * @example
   * ```typescript
   * const brokenTask = {
   *   title: '  fix spacing  ',
   *   status: 'PENDING', // Should be lowercase
   *   priority: '', // Empty string should be null
   * };
   *
   * const result = fixer.applyBasicFixes(brokenTask);
   * // result.fixedTask has the corrected task
   * // result.fixes contains descriptions of applied fixes
   * ```
   */
  applyBasicFixes(task: ITask): TaskFixResult;
}
