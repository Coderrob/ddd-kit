import { ILogger } from '../observability';
import { ITaskStore } from '../tasks';

/**
 * Options for validating and fixing tasks.
 */
export interface IValidationOptions {
  applyFixes: boolean;
  excludePattern?: string;
  store?: ITaskStore;
  logger?: ILogger;
}
