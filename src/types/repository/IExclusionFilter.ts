import { ITask } from '../tasks/ITask';

/**
 * Interface for filtering tasks based on exclusion patterns.
 */
export interface IExclusionFilter {
  shouldExclude(task: ITask): boolean;
}
