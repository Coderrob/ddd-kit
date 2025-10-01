import { Command } from 'commander';

import { TaskProviderType } from '../../types';
import { ILogger, IObservabilityLogger } from '../../types/observability';
import { NextCommandOptions } from '../../types/rendering';
import { ITaskRepository } from '../../types/repository';
import { IHydrationOptions, ITask, TaskState } from '../../types/tasks';
import { TaskProviderFactory } from '../../core/storage/task-provider.factory';
import { isNullOrUndefined } from '../../core/helpers/type-guards';
import { TaskHydrationService } from '../../core/processing/hydrate';
import { Resolver } from '../../core/helpers/uid-resolver';
import { Renderer } from '../../core/rendering/renderer';
import { ObservabilityLoggerAdapter } from '../../core/system/observability-logger.adapter';
import { BaseCommand } from '../shared/base.command';

import { NextCommandTelemetry, OperationContext } from './next.command.telemetry';

/**
 * Command for hydrating the next task.
 * Refactored to follow Clean Architecture and SOLID principles:
 * - SRP: Focuses only on command execution orchestration
 * - DIP: Uses factory for provider creation
 * - ISP: Specific options interface instead of generic object
 * Enhanced with comprehensive observability and diagnostics.
 */
export class NextCommand extends BaseCommand {
  override name = 'next';
  override description = 'Hydrate the next eligible task';
  private readonly hydrationService: TaskHydrationService;
  private readonly observabilityLogger: IObservabilityLogger;
  private readonly telemetry: NextCommandTelemetry;

  constructor(logger: ILogger, observabilityLogger?: IObservabilityLogger) {
    super(logger);
    const dddKitPath = process.env['DDDKIT_PATH'] ?? '.';
    const targetPath = process.env['TARGET_REPO_PATH'] ?? '.';
    const resolver = new Resolver(dddKitPath);
    const renderer = new Renderer(targetPath);
    this.hydrationService = new TaskHydrationService(resolver, renderer, logger);

    // Use provided observability logger or create a fallback adapter
    this.observabilityLogger = observabilityLogger ?? new ObservabilityLoggerAdapter(logger);
    this.telemetry = new NextCommandTelemetry();
  }

  /**
   * Executes the next command with comprehensive observability.
   */
  async execute(options: IHydrationOptions): Promise<void> {
    const op: OperationContext = this.telemetry.recordStart(this.observabilityLogger, options);

    try {
      const provider = this.createProvider(options.provider ?? 'todo');
      const task = await this.findNextTask(provider, options);

      if (!task) {
        this.telemetry.noTaskFound(op, options);
        return;
      }

      await this.hydrateAndUpdateTask(task, options, provider);
      this.telemetry.success(op, task.id, options.provider);
    } catch (error) {
      this.telemetry.error(op, error, options.provider);
      throw error;
    }
  }

  /**
   * Records the start of command execution with metrics and events.
   */

  /**
   * Creates a task provider based on the provider type.
   */
  private createProvider(providerType: string): ITaskRepository {
    let taskProviderType: TaskProviderType;
    switch (providerType) {
      case TaskProviderType.ISSUES:
      case TaskProviderType.PROJECTS:
        taskProviderType = providerType;
        break;
      default:
        taskProviderType = TaskProviderType.TODO;
    }
    return TaskProviderFactory.create(taskProviderType, this.logger);
  }

  /**
   * Finds the next eligible task.
   */
  private async findNextTask(
    provider: ITaskRepository,
    options: IHydrationOptions,
  ): Promise<ITask | null> {
    const task = await provider.findNextEligible(options.filters);
    if (!isNullOrUndefined(task)) {
      this.logger.info('Selected task', { taskId: task.id });
    }
    return task;
  }

  /**
   * Hydrates and updates the task.
   */
  private async hydrateAndUpdateTask(
    task: ITask,
    options: IHydrationOptions,
    provider: ITaskRepository,
  ): Promise<void> {
    // Get environment configuration
    const dddKitPath = process.env['DDDKIT_PATH'] ?? '.';
    const targetPath = process.env['TARGET_REPO_PATH'] ?? '.';

    // Hydrate the task using the injected service
    await this.hydrationService.hydrateTask(task, dddKitPath, targetPath, options.pin);

    // Update task status
    const updatedTask: ITask = {
      ...task,
      branch: `${options.branchPrefix ?? 'feature/'}${task.id}`,
      resolvedReferences: task.resolvedReferences || [], // Now set by hydrate
      state: TaskState.InProgress,
    };

    if (!isNullOrUndefined(options.pin)) {
      updatedTask.dddKitCommit = options.pin;
    }

    await provider.update(updatedTask);
  }

  static configure(program: Command, logger: ILogger): void {
    program
      .command('next')
      .description('Hydrate the next eligible task')
      .option('--provider <provider>', 'Task provider: todo, issues, projects', 'todo')
      .option('--filters <filters...>', 'Filters for task selection')
      .option('--branch-prefix <prefix>', 'Branch prefix', 'feature/')
      .option('--pin <sha>', 'Pin to specific ddd-kit commit/tag')
      .option('--open-pr', 'Open PR after hydration')
      .action(async (options: NextCommandOptions) => {
        const cmd = new NextCommand(logger);
        await cmd.execute(options);
      });
  }
}
