import { Command } from 'commander';

import { container } from '../core/system/container';
import {
  CommandName,
  IRenderOptions,
  ITaskRenderUseCase,
  SERVICE_KEYS,
  ILogger,
  RenderCommandOptions,
} from '../types';

import { BaseCommand } from './base.command';

/**
 * Command for rendering a specific task.
 */
export class RenderCommand extends BaseCommand {
  override name = CommandName.RENDER;
  override description = 'Re-render guidance for a specific task';

  /**
   * Executes the render command.
   * @param options - Object containing taskId and render options
   * @returns Promise that resolves when the operation is complete
   */
  async execute(options: IRenderOptions & { taskId: string }): Promise<void> {
    const { taskId, ...rest } = options;
    this.logger.info('Executing render command', { taskId, ...rest });

    try {
      const service = container.resolve<ITaskRenderUseCase>(SERVICE_KEYS.TASK_RENDERER);
      await service.execute(taskId, rest);
      this.logger.info('Task rendered successfully', { taskId });
    } catch (error) {
      this.logger.error('Failed to execute render command', { error: String(error), taskId });
      throw error;
    }
  }

  /**
   * Configures the render command in the CLI program.
   * @param program - The commander program instance
   * @param logger - The logger instance for command execution
   */
  static configure(program: Command, logger: ILogger): void {
    program
      .command(CommandName.RENDER)
      .argument('<task>', 'Task ID to render')
      .description('Re-render guidance for a specific task')
      .option('--pin <sha>', 'Pin to specific ddd-kit commit/tag')
      .action(async (taskId: string, options: RenderCommandOptions) => {
        const cmd = new RenderCommand(logger);
        await cmd.execute({ taskId, ...options });
      });
  }
}
