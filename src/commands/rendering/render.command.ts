import { Command } from 'commander';

import { container, SERVICE_KEYS } from '../../core/system/container';
import { RenderCommandOptions } from '../../types/command-options';
import { ILogger } from '../../types/ILogger';
import { IRenderOptions } from '../../types/ITask';

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
      this.logger.info('Task rendered successfully', { taskId });
    } catch (error) {
      this.logger.error('Failed to execute render command', { error: String(error), taskId });
      throw error;
    }
  }

  static configure(program: Command, logger: ILogger): void {
    program
      .command('render')
      .argument('<task>', 'Task ID to render')
      .description('Re-render guidance for a specific task')
      .option('--pin <sha>', 'Pin to specific ddd-kit commit/tag')
      .action(async (taskId: string, options: RenderCommandOptions) => {
        const cmd = new RenderCommand(logger);
        await cmd.execute(taskId, options);
      });
  }
}
