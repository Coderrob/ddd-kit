/* eslint-disable no-undefined */
import { Command } from 'commander';

import { TaskHydrationService } from '../core/processing/hydrate';
import { TaskProviderFactory } from '../core/storage';
import { ObservabilityLoggerAdapter } from '../core/system/observability-logger.adapter';
import {
  IHydrationOptions,
  ILogger,
  IObservabilityLogger,
  ITask,
  ITaskRepository,
  IOperationContext,
  TaskProviderType,
  TaskState,
} from '../types';

import { NextCommand } from './next.command';
import { NextCommandTelemetry } from './next.command.telemetry';

jest.mock('../core/storage/task-provider.factory');
jest.mock('../core/processing/hydrate');
jest.mock('../core/system/observability-logger.adapter');
jest.mock('./next.command.telemetry');

describe('NextCommand', () => {
  let logger: jest.Mocked<ILogger>;
  let observabilityLogger: jest.Mocked<IObservabilityLogger>;
  let hydrationService: jest.Mocked<TaskHydrationService>;
  let telemetry: jest.Mocked<NextCommandTelemetry>;
  let provider: jest.Mocked<ITaskRepository>;
  let task: ITask;
  let options: IHydrationOptions;

  beforeEach(() => {
    logger = {
      info: jest.fn(),
      error: jest.fn(),
      warn: jest.fn(),
      debug: jest.fn(),
    } as unknown as jest.Mocked<ILogger>;

    observabilityLogger = {
      log: jest.fn(),
      metric: jest.fn(),
    } as unknown as jest.Mocked<IObservabilityLogger>;

    hydrationService = {
      hydrateTask: jest.fn(),
    } as unknown as jest.Mocked<TaskHydrationService>;

    telemetry = {
      recordStart: jest.fn(),
      noTaskFound: jest.fn(),
      success: jest.fn(),
      error: jest.fn(),
    } as jest.Mocked<NextCommandTelemetry>;

    provider = {
      findNextEligible: jest.fn(),
      update: jest.fn(),
    } as unknown as jest.Mocked<ITaskRepository>;

    task = {
      id: 'task-1',
      state: TaskState.Pending,
      resolvedReferences: [],
    };

    options = {
      provider: TaskProviderType.TASK,
      filters: [],
      branchPrefix: 'feature/',
    };

    (TaskProviderFactory.create as jest.Mock).mockReturnValue(provider);
    (TaskHydrationService as jest.Mock).mockImplementation(() => hydrationService);
    (ObservabilityLoggerAdapter as jest.Mock).mockImplementation(() => observabilityLogger);
    (NextCommandTelemetry as jest.Mock).mockImplementation(() => telemetry);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('constructor', () => {
    it('should initialize with provided logger and observability logger', () => {
      const command = new NextCommand(logger, observabilityLogger);
      expect(command).toBeDefined();
    });

    it('should create fallback observability logger if not provided', () => {
      const command = new NextCommand(logger);
      expect(command).toBeDefined();
      expect(ObservabilityLoggerAdapter).toHaveBeenCalledWith(logger);
    });
  });

  describe('execute', () => {
    it('should handle no task found', async () => {
      provider.findNextEligible.mockResolvedValue(null);
      telemetry.recordStart.mockReturnValue({} as IOperationContext);

      const command = new NextCommand(logger, observabilityLogger);
      await command.execute(options);

      expect(telemetry.noTaskFound).toHaveBeenCalled();
      expect(hydrationService.hydrateTask).not.toHaveBeenCalled();
    });

    it('should hydrate and update task when found', async () => {
      provider.findNextEligible.mockResolvedValue(task);
      telemetry.recordStart.mockReturnValue({} as IOperationContext);
      hydrationService.hydrateTask.mockResolvedValue(task);

      const command = new NextCommand(logger, observabilityLogger);
      await command.execute(options);

      expect(hydrationService.hydrateTask).toHaveBeenCalledWith(task, '.', '.', undefined);
      expect(provider.update).toHaveBeenCalledWith({
        ...task,
        branch: 'feature/task-1',
        resolvedReferences: [],
        state: TaskState.InProgress,
      });
      expect(telemetry.success).toHaveBeenCalled();
    });

    it('should set dddKitCommit if pin is provided', async () => {
      options.pin = 'abc123';
      provider.findNextEligible.mockResolvedValue(task);
      telemetry.recordStart.mockReturnValue({} as IOperationContext);
      hydrationService.hydrateTask.mockResolvedValue(task);

      const command = new NextCommand(logger, observabilityLogger);
      await command.execute(options);

      expect(provider.update).toHaveBeenCalledWith(
        expect.objectContaining({ dddKitCommit: 'abc123' }),
      );
    });

    it('should throw error on failure', async () => {
      provider.findNextEligible.mockRejectedValue(new Error('Test error'));
      telemetry.recordStart.mockReturnValue({} as IOperationContext);

      const command = new NextCommand(logger, observabilityLogger);
      await expect(command.execute(options)).rejects.toThrow('Test error');
      expect(telemetry.error).toHaveBeenCalled();
    });
  });

  describe('createProvider', () => {
    it('should create task provider for default type', () => {
      const command = new NextCommand(logger, observabilityLogger);
      const result = (command as any).createProvider(TaskProviderType.TASK);
      expect(TaskProviderFactory.create).toHaveBeenCalledWith(TaskProviderType.TASK, logger);
      expect(result).toBe(provider);
    });

    it('should create issues provider', () => {
      const command = new NextCommand(logger, observabilityLogger);
      (command as any).createProvider(TaskProviderType.ISSUES);
      expect(TaskProviderFactory.create).toHaveBeenCalledWith(TaskProviderType.ISSUES, logger);
    });
  });

  describe('findNextTask', () => {
    it('should return task and log if found', async () => {
      provider.findNextEligible.mockResolvedValue(task);

      const command = new NextCommand(logger, observabilityLogger);
      const result = await (command as any).findNextTask(provider, options);

      expect(result).toBe(task);
      expect(logger.info).toHaveBeenCalledWith('Selected task', { taskId: 'task-1' });
    });

    it('should return null if no task', async () => {
      provider.findNextEligible.mockResolvedValue(null);

      const command = new NextCommand(logger, observabilityLogger);
      const result = await (command as any).findNextTask(provider, options);

      expect(result).toBeNull();
      expect(logger.info).not.toHaveBeenCalled();
    });
  });

  describe('hydrateAndUpdateTask', () => {
    it('should hydrate and update task', async () => {
      hydrationService.hydrateTask.mockResolvedValue(task);

      const command = new NextCommand(logger, observabilityLogger);
      await (command as any).hydrateAndUpdateTask(task, options, provider);

      expect(hydrationService.hydrateTask).toHaveBeenCalledWith(task, '.', '.', undefined);
      expect(provider.update).toHaveBeenCalledWith({
        ...task,
        branch: 'feature/task-1',
        resolvedReferences: [],
        state: TaskState.InProgress,
      });
    });
  });

  describe('configure', () => {
    it('should configure the command', () => {
      const program = new Command();
      NextCommand.configure(program, logger);
      expect(program.commands.length).toBe(1);
    });
  });
});
