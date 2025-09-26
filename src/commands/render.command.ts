import { getLogger } from '../utils/logger';
import { IRenderOptions } from '../interfaces/ITask';
import { container, SERVICE_KEYS } from '../utils/container';

/**
 * The command now resolves `ITaskRenderUseCase` from the container so the business logic
 * is kept in a testable service (`TaskRenderService`).
 */

/**
 * Command for rendering a specific task.
 * Refactored to follow Clean Architecture and SOLID principles:
 * - SRP: Focuses only on command execution
 * - DIP: Uses dependency injection for services
 * - ISP: Specific options interface
 */
export class RenderCommand {
  /**
   * Executes the render command.
   */
  async execute(taskId: string, options: IRenderOptions): Promise<void> {
    const log = getLogger();
    log.info('Executing render command', { taskId, ...options });

    try {
      const service = container.resolve(SERVICE_KEYS.TASK_RENDERER) as unknown as {
        execute(taskId: string, options: IRenderOptions): Promise<void>;
      };

      await service.execute(taskId, options);
      console.log(`Rendered task ${taskId}`);
    } catch (error) {
      log.error('Failed to execute render command', { error: String(error), taskId });
      throw error;
    }
  }
}
