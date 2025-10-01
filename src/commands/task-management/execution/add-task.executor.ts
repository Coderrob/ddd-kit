import { ICommandExecutor } from '../../../types/commands';
import { TodoManager } from '../../../core/storage/todo';
import { AddTaskContext } from '../preprocessing/add-task.preprocessor';

/**
 * Executor for the AddTaskCommand.
 *
 * Uses the TodoManager to add a task from a file to the TODO.md.
 */
export class AddTaskExecutor implements ICommandExecutor<AddTaskContext, boolean> {
  private readonly todoManager: TodoManager;

  constructor(todoManager?: TodoManager) {
    this.todoManager = todoManager ?? new TodoManager();
  }

  /**
   * Executes the task addition using the prepared context.
   *
   * @param context - The preprocessed context containing file information
   * @returns Promise resolving to true if the task was added successfully
   */
  execute(context: AddTaskContext): Promise<boolean> {
    return Promise.resolve(this.todoManager.addTaskFromFile(context.filePath));
  }
}
