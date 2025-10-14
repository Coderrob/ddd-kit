import { Command } from 'commander';

import { AddTaskCommand } from '../task-management/add-task.command';
import { CompleteTaskCommand } from '../task-management/complete-task.command';
import { ListTasksCommand } from '../task-management/list-tasks.command';
import { ShowTaskCommand } from '../task-management/show-task.command';
import { ValidateAndFixCommand } from '../validation/validate-and-fix.command';
import { ValidateTasksCommand } from '../validation/validate-tasks.command';
import { NextCommand } from '../rendering/next.command';
import { RenderCommand } from '../rendering/render.command';
import { RefAuditCommand } from '../audit/ref-audit.command';
import { SupersedeCommand } from '../audit/supersede.command';
import { ILogger } from '../../types/observability';
import { IOutputWriter } from '../../types/rendering';

/**
 * Factory for creating and configuring CLI commands following Command pattern.
 * Centralizes command registration and configuration.
 */
export class CommandFactory {
  /**
   * Configures all commands on the given Commander program instance.
   * @param program The Commander program instance to configure commands on.
   * @param logger Logger instance for command logging.
   * @param outputWriter Optional output writer for command output.
   */
  static configureProgram(program: Command, logger: ILogger, outputWriter?: IOutputWriter): void {
    // Core commands
    NextCommand.configure(program, logger);
    RenderCommand.configure(program, logger);
    SupersedeCommand.configure(program, logger);

    // Reference commands
    const ref = program.command('ref').description('Reference management');
    RefAuditCommand.configure(ref, logger);

    // Task commands
    const task = program.command('task').description('Task management commands');
    AddTaskCommand.configure(task, logger, outputWriter);
    CompleteTaskCommand.configure(task, logger, outputWriter);
    ListTasksCommand.configure(task, logger, outputWriter);
    ShowTaskCommand.configure(task, logger, outputWriter);

    // Validate commands
    const validate = program.command('validate').description('Validation commands');
    ValidateTasksCommand.configure(validate, logger);
    ValidateAndFixCommand.configure(validate, logger, outputWriter);
  }
}
