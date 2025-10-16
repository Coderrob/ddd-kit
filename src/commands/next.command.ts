import { Command } from 'commander';

import { EnvironmentAccessor, ProcessEnvironmentAccessor } from '../core/helpers/env.helper';
import { isNullOrUndefined } from '../core/helpers/type.helper';
import { Resolver } from '../core/helpers/uid-resolver';
import { TaskHydrationService } from '../core/processing/hydrate';
import { Renderer } from '../core/rendering/renderer';
import { TaskProviderFactory } from '../core/storage';
import { ObservabilityLoggerAdapter } from '../core/system/observability-logger.adapter';
import {
  CommandName,
  IHydrationOptions,
  ILogger,
  IObservabilityLogger,
  ITask,
  ITaskRepository,
  NextCommandOptions,
  OperationContext,
  TaskProviderType,
  TaskState,
} from '../types';

import { BaseCommand } from './base.command';
import { NextCommandTelemetry } from './next.command.telemetry';

/**
 * Command for hydrating the next task.
 * Refactored to follow Clean Architecture and SOLID principles:
 * - SRP: Focuses only on command execution orchestration
 * - DIP: Uses factory for provider creation
 * - ISP: Specific options interface instead of generic object
 * Enhanced with comprehensive observability and diagnostics.
 */
export class NextCommand extends BaseCommand {
  override name = CommandName.NEXT;
  override description = 'Hydrate the next eligible task';
  private readonly hydrationService: TaskHydrationService;
  private readonly observabilityLogger: IObservabilityLogger;
  private readonly telemetry: NextCommandTelemetry;
  private readonly environment: EnvironmentAccessor;

  constructor(
    logger: ILogger,
    observabilityLogger?: IObservabilityLogger,
    environment?: EnvironmentAccessor,
  ) {
    super(logger);
    this.environment = environment ?? new ProcessEnvironmentAccessor();
    const dddKitPath = this.environment.getOrDefault('DDDKIT_PATH', '.');
    const targetPath = this.environment.getOrDefault('TARGET_REPO_PATH', '.');
    const resolver = new Resolver(dddKitPath);
    const renderer = new Renderer(targetPath);
    this.hydrationService = new TaskHydrationService(resolver, renderer, logger);

    // Use provided observability logger or create a fallback adapter
    this.observabilityLogger = observabilityLogger ?? new ObservabilityLoggerAdapter(logger);
    this.telemetry = new NextCommandTelemetry();
  }

  /**
   * Executes the next command with comprehensive observability.
   * @param options - The hydration options
   * @returns Promise that resolves when the operation is complete
   *
   * @example
   * ```typescript
   * await command.execute({ provider: 'issues', filters: ['priority:high'], branchPrefix: 'feature/' });
   * ```
   */
  async execute(options: IHydrationOptions): Promise<void> {
    const op: OperationContext = this.telemetry.recordStart(this.observabilityLogger, options);

    try {
      const provider = this.createProvider(options.provider ?? TaskProviderType.TASK);
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
   * @param providerType - The type of provider to create
   * @returns the created provider instance
   */
  private createProvider(providerType: string): ITaskRepository {
    let taskProviderType: TaskProviderType;
    switch (providerType) {
      case TaskProviderType.ISSUES:
      case TaskProviderType.PROJECTS:
        taskProviderType = providerType;
        break;
      default:
        taskProviderType = TaskProviderType.TASK;
    }
    return TaskProviderFactory.create(taskProviderType, this.logger);
  }

  /**
   * Finds the next eligible task.
   * @param provider - The task repository provider
   * @param options - The hydration options containing filters
   * @returns The next eligible task or null if none found
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
   * @param task - The task to hydrate and update
   * @param options - The hydration options
   * @param provider - The task repository provider
   * @returns Promise that resolves when the task is hydrated and updated
   */
  private async hydrateAndUpdateTask(
    task: ITask,
    options: IHydrationOptions,
    provider: ITaskRepository,
  ): Promise<void> {
    // Get environment configuration
    const dddKitPath = this.environment.getOrDefault('DDDKIT_PATH', '.');
    const targetPath = this.environment.getOrDefault('TARGET_REPO_PATH', '.');

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

  /**
   * Configures the next command in the CLI program.
   * @param program - The commander program instance
   * @param logger - The logger instance for command execution
   */
  static configure(program: Command, logger: ILogger): void {
    program
      .command(CommandName.NEXT)
      .description('Hydrate the next eligible task')
      .option(
        '--provider <provider>',
        'Task provider: task, issues, projects',
        TaskProviderType.TASK,
      )
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
