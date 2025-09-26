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
  static createAddTaskCommand(): AddTaskCommand {
    return new AddTaskCommand();
  }

  static createCompleteTaskCommand(): CompleteTaskCommand {
    return new CompleteTaskCommand();
  }

  static createListTasksCommand(): ListTasksCommand {
    return new ListTasksCommand();
  }

  static createShowTaskCommand(): ShowTaskCommand {
    return new ShowTaskCommand();
  }

  static createValidateTasksCommand(): ValidateTasksCommand {
    return new ValidateTasksCommand();
  }

  static createValidateAndFixCommand(): ValidateAndFixCommand {
    return new ValidateAndFixCommand();
  }

  static createNextCommand(): NextCommand {
    return new NextCommand();
  }

  static createRenderCommand(): RenderCommand {
    return new RenderCommand();
  }

  static createRefAuditCommand(): RefAuditCommand {
    return new RefAuditCommand();
  }

  static createSupersedeCommand(): SupersedeCommand {
    return new SupersedeCommand();
  }

  static configureProgram(program: Command): void {
    CommandFactory.configureCoreCommands(program);
    CommandFactory.configureTodoCommands(program);
    CommandFactory.configureValidateCommands(program);
  }

  private static configureCoreCommands(program: Command): void {
    // next command
    program
      .command('next')
      .description('Hydrate the next eligible task')
      .option('--provider <provider>', 'Task provider: todo, issues, projects', 'todo')
      .option('--filters <filters...>', 'Filters for task selection')
      .option('--branch-prefix <prefix>', 'Branch prefix', 'feature/')
      .option('--pin <sha>', 'Pin to specific ddd-kit commit/tag')
      .option('--open-pr', 'Open PR after hydration')
      .action(async (options) => {
        const cmd = CommandFactory.createNextCommand();
        await cmd.execute(options);
      });

    // render command
    program
      .command('render')
      .argument('<task>', 'Task ID to render')
      .description('Re-render guidance for a specific task')
      .option('--pin <sha>', 'Pin to specific ddd-kit commit/tag')
      .action(async (taskId, options) => {
        const cmd = CommandFactory.createRenderCommand();
        await cmd.execute(taskId, options);
      });

    // ref command
    const ref = program.command('ref').description('Reference management');
    ref
      .command('audit')
      .description('Audit references across repo & tasks')
      .action(async () => {
        const cmd = CommandFactory.createRefAuditCommand();
        await cmd.execute();
      });

    // supersede command
    program
      .command('supersede')
      .argument('<oldUid>', 'Old UID')
      .argument('<newUid>', 'New UID')
      .description('Supersede an old UID with a new one')
      .action(async (oldUid, newUid) => {
        const cmd = CommandFactory.createSupersedeCommand();
        await cmd.execute(oldUid, newUid);
      });
  }

  private static configureTodoCommands(program: Command): void {
    // todo commands
    const todo = program.command('todo').description('Task management commands');

    todo
      .command('add')
      .argument('<file>', 'File containing the task to add')
      .description('Add a new task from a file')
      .action(async (file) => {
        const cmd = CommandFactory.createAddTaskCommand();
        await cmd.execute({ file });
      });

    todo
      .command('complete')
      .argument('<id>', 'Task ID to complete')
      .option('--message <message>', 'Completion message')
      .option('--dry-run', 'Perform dry run without making changes')
      .description('Mark a task as completed')
      .action((id, options) => {
        const cmd = CommandFactory.createCompleteTaskCommand();
        cmd.execute({ id, opts: { dryRun: options.dryRun, message: options.message } });
      });

    todo
      .command('list')
      .description('List all tasks')
      .action(async () => {
        const cmd = CommandFactory.createListTasksCommand();
        await cmd.execute();
      });

    todo
      .command('show')
      .argument('<id>', 'Task ID to show')
      .description('Show details of a specific task')
      .action(async (id) => {
        const cmd = CommandFactory.createShowTaskCommand();
        await cmd.execute({ id });
      });
  }

  private static configureValidateCommands(program: Command): void {
    // validate commands
    const validate = program.command('validate').description('Validation commands');

    validate
      .command('tasks')
      .description('Validate all tasks')
      .action(async () => {
        const cmd = CommandFactory.createValidateTasksCommand();
        await cmd.execute();
      });

    validate
      .command('fix')
      .description('Validate and fix tasks')
      .option('--fix', 'Apply fixes automatically')
      .option('--dry-run', 'Perform dry run without making changes')
      .option('--format <format>', 'Output format: json, csv', 'json')
      .option('--exclude <pattern>', 'Pattern to exclude tasks')
      .action(async (options) => {
        const cmd = CommandFactory.createValidateAndFixCommand();
        await cmd.execute({
          dryRun: options.dryRun,
          exclude: options.exclude,
          fix: options.fix,
          summary: { format: options.format },
        });
      });
  }
}
