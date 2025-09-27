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
import { ILogger } from '../../types/ILogger';

/**
 * Factory for creating and configuring CLI commands following Command pattern.
 * Centralizes command registration and configuration.
 */
export class CommandFactory {
  /**
   * Configures all commands on the given Commander program instance.
   * @param program The Commander program instance to configure commands on.
   */
  static configureProgram(program: Command, logger: ILogger): void {
    // Core commands
    NextCommand.configure(program, logger);
    RenderCommand.configure(program, logger);
    SupersedeCommand.configure(program, logger);

    // Reference commands
    const ref = program.command('ref').description('Reference management');
    RefAuditCommand.configure(ref, logger);

    // Todo commands
    const todo = program.command('todo').description('Task management commands');
    AddTaskCommand.configure(todo, logger);
    CompleteTaskCommand.configure(todo, logger);
    ListTasksCommand.configure(todo, logger);
    ShowTaskCommand.configure(todo, logger);

    // Validate commands
    const validate = program.command('validate').description('Validation commands');
    ValidateTasksCommand.configure(validate, logger);
    ValidateAndFixCommand.configure(validate, logger);
  }
}
