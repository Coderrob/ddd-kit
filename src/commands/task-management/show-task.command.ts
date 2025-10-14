import { Command } from 'commander';

import { ILogger } from '../../types/observability';
import { TaskManager } from '../../core/storage/task.manager';
import { EXIT_CODES } from '../../constants/exit-codes';
import { BaseCommand } from '../shared/base.command';
import { CommandName } from '../../types';
import { IOutputWriter } from '../../types/rendering';
import { ConsoleOutputWriter } from '../../core/rendering/console-output.writer';

interface TaskDetails {
  detailed_requirements?: unknown;
  validations?: unknown;
}

/**
 * Arguments for the 'todo show' command
 */
interface TodoShowCommandArgs {
  /** Task ID to show */
  id: string;
}

/**
 * Modern command for showing detailed information about a specific task.
 */
export class ShowTaskCommand extends BaseCommand {
  readonly name = CommandName.SHOW;
  readonly description = 'Show details of a specific task';

  constructor(
    logger: ILogger,
    protected override readonly outputWriter: IOutputWriter = new ConsoleOutputWriter(),
  ) {
    super(logger, outputWriter);
  }

  /**
   * Executes the show task command that displays detailed information about
   * a task including its status, owner, requirements, and validations.
   * @param args - Command arguments containing the task ID
   * @returns Promise that resolves when the command execution is complete
   */
  execute(args: TodoShowCommandArgs): Promise<void> {
    const todoManager = new TaskManager(this.logger);
    const task = todoManager.findTaskById(args.id);

    if (!task) {
      const message = `Task ${args.id} not found`;
      this.logger.error(message, { id: args.id });
      process.exitCode = EXIT_CODES.NOT_FOUND;
      return Promise.reject(message);
    }

    this.logger.info('Task details displayed', { id: args.id, title: task.title });
    this.outputWriter.section(`${task.id} — ${task.title ?? 'Untitled'}`);
    this.outputWriter.keyValue('Status', task.state ?? 'Unknown');
    this.outputWriter.keyValue('Owner', task.owner ?? 'Unassigned');
    this.outputWriter.newline();
    this.outputWriter.write('Detailed requirements:');
    this.outputWriter.newline();

    try {
      this.outputWriter.writeFormatted((task as TaskDetails).detailed_requirements ?? {}, 'json');
    } catch {
      this.outputWriter.warning('(invalid or missing detailed_requirements)');
      this.logger.warn('Invalid detailed_requirements in task', { id: args.id });
    }

    this.outputWriter.newline();
    this.outputWriter.write('Validations:');
    this.outputWriter.newline();
    try {
      this.outputWriter.writeFormatted((task as TaskDetails).validations ?? {}, 'json');
    } catch {
      this.outputWriter.warning('(invalid or missing validations)');
      this.logger.warn('Invalid validations in task', { id: args.id });
    }
    return Promise.resolve();
  }

  /**
   * Configures the show task command in the CLI program.
   * @param parent The parent Commander command to attach this command to.
   * @param logger Logger instance for command logging.
   * @param outputWriter Optional output writer for command output.
   */
  static configure(parent: Command, logger: ILogger, outputWriter?: IOutputWriter): void {
    parent
      .command(CommandName.SHOW)
      .argument('<id>', 'Task ID to show')
      .description('Show details of a specific task')
      .action(async (id: string) => {
        const cmd = new ShowTaskCommand(logger, outputWriter);
        await cmd.execute({ id });
      });
  }
}
