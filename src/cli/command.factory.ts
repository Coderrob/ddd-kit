import { Command } from 'commander';

import { AddTaskCommand } from '../commands/add-task.command';
import { CompleteTaskCommand } from '../commands/complete-task.command';
import { ListTasksCommand } from '../commands/list-tasks.command';
import { ShowTaskCommand } from '../commands/show-task.command';
import { ValidateAndFixCommand } from '../commands/validate-and-fix.command';
import { ValidateTasksCommand } from '../commands/validate-tasks.command';
import { NextCommand } from '../commands/next.command';
import { RenderCommand } from '../commands/render.command';
import { RefAuditCommand } from '../commands/ref-audit.command';
import { SupersedeCommand } from '../commands/supersede.command';

/**
 * Factory for creating and configuring CLI commands following Command pattern.
 * Centralizes command registration and configuration.
 */
export class CommandFactory {
  /**
   * Configures all commands on the given Commander program instance.
   * @param program The Commander program instance to configure commands on.
   */
  static configureProgram(program: Command): void {
    // Core commands
    NextCommand.configure(program);
    RenderCommand.configure(program);
    SupersedeCommand.configure(program);

    // Reference commands
    const ref = program.command('ref').description('Reference management');
    RefAuditCommand.configure(ref);

    // Todo commands
    const todo = program.command('todo').description('Task management commands');
    AddTaskCommand.configure(todo);
    CompleteTaskCommand.configure(todo);
    ListTasksCommand.configure(todo);
    ShowTaskCommand.configure(todo);

    // Validate commands
    const validate = program.command('validate').description('Validation commands');
    ValidateTasksCommand.configure(validate);
    ValidateAndFixCommand.configure(validate);
  }
}
