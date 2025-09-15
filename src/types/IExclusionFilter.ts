/**
 * Interface for filtering tasks based on exclusion patterns.
 */

export interface IExclusionFilter {
  shouldExclude(task: Record<string, unknown>): boolean;
}
