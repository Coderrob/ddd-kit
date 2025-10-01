import { Command } from 'commander';

import { container } from '../../core/system/container';
import { SERVICE_KEYS } from '../../types/core';
import { RenderCommandOptions } from '../../types/rendering';
import { ILogger } from '../../types/observability';
import { IRenderOptions } from '../../types/tasks';
import { CommandName, ITaskRenderUseCase } from '../../types';
import { BaseCommand } from '../shared/base.command';

/**
 * Command for rendering a specific task.
 */
export class RenderCommand extends BaseCommand {
  override name = CommandName.RENDER;
  override description = 'Re-render guidance for a specific task';

  /**
   * Executes the render command.
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
