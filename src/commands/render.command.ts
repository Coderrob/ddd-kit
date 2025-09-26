import { Command } from 'commander';

import { ILogger } from '../interfaces/ILogger';
import { getLogger } from '../utils/logger';
import { IRenderOptions } from '../interfaces/ITask';
import { RenderCommandOptions } from '../interfaces/command-options';
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
  constructor(private readonly logger: ILogger) {}

  /**
   * Executes the render command.
   */
  async execute(taskId: string, options: IRenderOptions): Promise<void> {
    this.logger.info('Executing render command', { taskId, ...options });

    try {
      const service = container.resolve(SERVICE_KEYS.TASK_RENDERER) as unknown as {
        execute(taskId: string, options: IRenderOptions): Promise<void>;
      };

      await service.execute(taskId, options);
      console.log(`Rendered task ${taskId}`);
      this.logger.info('Task rendered successfully', { taskId });
    } catch (error) {
      this.logger.error('Failed to execute render command', { error: String(error), taskId });
      throw error;
    }
  }

  static configure(program: Command): void {
    program
      .command('render')
      .argument('<task>', 'Task ID to render')
      .description('Re-render guidance for a specific task')
      .option('--pin <sha>', 'Pin to specific ddd-kit commit/tag')
      .action(async (taskId: string, options: RenderCommandOptions) => {
        const cmd = new RenderCommand(getLogger());
        await cmd.execute(taskId, options);
      });
  }
}
