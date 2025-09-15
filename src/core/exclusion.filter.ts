import { IExclusionFilter } from '../types';

/**
 * Handles exclusion pattern matching for tasks.
 */
export class ExclusionFilter implements IExclusionFilter {
  private readonly excludeRegex: RegExp | null;

  /**
   * Creates a new ExclusionFilter instance.
   * @param excludePattern - Optional glob-like pattern for excluding tasks (e.g., "T-001" or "*test*").
   */
  constructor(excludePattern?: string) {
    this.excludeRegex = excludePattern ? this.createRegex(excludePattern) : null;
  }

  /**
   * Determines if a task should be excluded from validation/fixes based on the configured pattern.
   * @param task - The task object to check for exclusion.
   * @returns True if the task should be excluded, false otherwise.
   */
  shouldExclude(task: Record<string, unknown>): boolean {
    if (!this.excludeRegex) return false;

    const id = String(task.id ?? '');
    const owner = String(task.owner ?? '');
    const summary = String(task.summary ?? '');

    return (
      this.excludeRegex.test(id) || this.excludeRegex.test(owner) || this.excludeRegex.test(summary)
    );
  }

  /**
   * Creates a case-insensitive regex pattern from a glob-like string.
   * @param pattern - The glob-like pattern to convert (e.g., "*test*" becomes ".*test.*").
   * @returns A RegExp object for pattern matching.
   * @private
   */
  private createRegex(pattern: string): RegExp {
    const escaped = pattern.replace(/[.+^${}()|[\\]\\]/g, '\\$&').replace(/\\\*/g, '.*');
    return new RegExp(`^${escaped}$`, 'i');
  }
}
