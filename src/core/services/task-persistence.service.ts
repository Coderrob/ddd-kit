import { ITaskStore, ILogger, ITask } from '../../types';

/**
 * Service responsible for persisting task changes.
 * Follows Single Responsibility Principle (SRP).
 */
export class TaskPersistenceService {
  constructor(
    private readonly taskStore: ITaskStore,
    private readonly logger: ILogger,
  ) {}

  /**
   * Persists task fixes to the task store.
   * @param taskId - The unique identifier of the task to update
   * @param taskObj - The updated task object with applied fixes
   * @returns Promise that resolves to true if the update was successful
   */
  async persistTask(taskId: string, taskObj: ITask): Promise<boolean> {
    try {
      const result = await Promise.resolve(this.taskStore.updateTaskById(taskId, taskObj));
      if (result) {
        this.logger.info('Task persisted successfully', { taskId });
      } else {
        this.logger.warn('Failed to persist task', { taskId });
      }
      return result;
    } catch (error) {
      this.logger.error('Error persisting task', { taskId, error });
      return false;
    }
  }
}
