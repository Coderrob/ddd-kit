/* eslint-disable no-undefined */
import {
  CommandName,
  IHydrationOptions,
  IObservabilityLogger,
  IOperationContext,
  TaskProviderType,
} from '../types';

import { NextCommandTelemetry } from './next.command.telemetry';

describe('NextCommandTelemetry', () => {
  let telemetry: NextCommandTelemetry;
  let mockObs: jest.Mocked<IObservabilityLogger>;
  let mockOperationLogger: jest.Mocked<IObservabilityLogger>;

  beforeEach(() => {
    telemetry = new NextCommandTelemetry();
    mockOperationLogger = {
      startTimer: jest.fn().mockReturnValue(jest.fn()),
      info: jest.fn(),
      counter: jest.fn(),
      event: jest.fn(),
      warn: jest.fn(),
      error: jest.fn(),
      span: jest.fn(),
    } as unknown as jest.Mocked<IObservabilityLogger>;

    mockObs = {
      createCorrelationId: jest.fn().mockReturnValue('test-correlation-id'),
      withCorrelation: jest.fn().mockReturnValue(mockOperationLogger),
    } as unknown as jest.Mocked<IObservabilityLogger>;
  });

  describe('recordStart', () => {
    it('should create correlation id, operation logger, and record start events', () => {
      const options: IHydrationOptions = { provider: 'test-provider', filters: ['filter1'] };
      const result = telemetry.recordStart(mockObs, options);

      expect(mockObs.createCorrelationId).toHaveBeenCalled();
      expect(mockObs.withCorrelation).toHaveBeenCalledWith(
        'test-correlation-id',
        'next_command_execution',
        {
          provider: 'test-provider',
          filters: ['filter1'],
        },
      );
      expect(mockOperationLogger.startTimer).toHaveBeenCalledWith(
        'next_command.execution_duration',
      );
      expect(mockOperationLogger.info).toHaveBeenCalledWith('Executing next command', {
        correlationId: 'test-correlation-id',
        ...options,
        operationId: 'next_command_execution',
      });
      expect(mockOperationLogger.counter).toHaveBeenCalledWith('commands.next.executions', {
        provider: 'test-provider',
      });
      expect(mockOperationLogger.event).toHaveBeenCalledWith('command_execution_started', {
        command: CommandName.NEXT,
        provider: 'test-provider',
        hasFilters: true,
        filterCount: 1,
      });
      expect(result).toEqual({
        operationLogger: mockOperationLogger,
        startTime: expect.any(Date),
        stopTimer: expect.any(Function),
      });
    });

    it('should handle undefined provider and filters', () => {
      const options: IHydrationOptions = {};
      telemetry.recordStart(mockObs, options);

      expect(mockOperationLogger.counter).toHaveBeenCalledWith('commands.next.executions', {
        provider: 'task',
      });
      expect(mockOperationLogger.event).toHaveBeenCalledWith('command_execution_started', {
        command: CommandName.NEXT,
        provider: TaskProviderType.TASK,
        hasFilters: false,
        filterCount: 0,
      });
    });
  });

  describe('noTaskFound', () => {
    it('should log warning, counter, and event for no tasks found', () => {
      const op: IOperationContext = {
        operationLogger: mockOperationLogger,
        startTime: new Date(),
        stopTimer: jest.fn(),
      };
      const options: IHydrationOptions = { provider: 'test-provider', filters: ['filter1'] };

      telemetry.noTaskFound(op, options);

      expect(mockOperationLogger.warn).toHaveBeenCalledWith(
        'No eligible tasks found for next command',
        {
          provider: 'test-provider',
          filters: ['filter1'],
        },
      );
      expect(mockOperationLogger.counter).toHaveBeenCalledWith('commands.next.no_tasks_found', {
        provider: 'test-provider',
      });
      expect(mockOperationLogger.event).toHaveBeenCalledWith('command_execution_completed', {
        command: CommandName.NEXT,
        success: false,
        reason: 'no_eligible_tasks',
      });
    });

    it('should handle undefined provider', () => {
      const op: IOperationContext = {
        operationLogger: mockOperationLogger,
        startTime: new Date(),
        stopTimer: jest.fn(),
      };
      const options: IHydrationOptions = {};

      telemetry.noTaskFound(op, options);

      expect(mockOperationLogger.warn).toHaveBeenCalledWith(
        'No eligible tasks found for next command',
        {
          provider: TaskProviderType.TASK,
          filters: undefined,
        },
      );
      expect(mockOperationLogger.counter).toHaveBeenCalledWith('commands.next.no_tasks_found', {
        provider: TaskProviderType.TASK,
      });
    });
  });

  describe('success', () => {
    it('should log success span, info, counter, and event', () => {
      const startTime = new Date();
      const op: IOperationContext = {
        operationLogger: mockOperationLogger,
        startTime,
        stopTimer: jest.fn(),
      };
      const taskId = 'test-task-id';
      const provider = 'test-provider';

      telemetry.success(op, taskId, provider);

      expect(mockOperationLogger.span).toHaveBeenCalledWith(
        'next_command_execution',
        startTime,
        expect.any(Date),
        {
          taskId,
          provider,
          success: true,
        },
      );
      expect(mockOperationLogger.info).toHaveBeenCalledWith(
        'Task hydrated and updated successfully',
        {
          taskId,
          duration: expect.any(Number),
        },
      );
      expect(mockOperationLogger.counter).toHaveBeenCalledWith('commands.next.success', {
        provider,
      });
      expect(mockOperationLogger.event).toHaveBeenCalledWith('command_execution_completed', {
        command: CommandName.NEXT,
        success: true,
        taskId,
        duration: expect.any(Number),
      });
      expect(op.stopTimer).toHaveBeenCalled();
    });

    it('should handle undefined provider', () => {
      const op: IOperationContext = {
        operationLogger: mockOperationLogger,
        startTime: new Date(),
        stopTimer: jest.fn(),
      };

      telemetry.success(op, 'task-id', undefined);

      expect(mockOperationLogger.span).toHaveBeenCalledWith(
        'next_command_execution',
        expect.any(Date),
        expect.any(Date),
        {
          taskId: 'task-id',
          provider: TaskProviderType.TASK,
          success: true,
        },
      );
      expect(mockOperationLogger.counter).toHaveBeenCalledWith('commands.next.success', {
        provider: TaskProviderType.TASK,
      });
    });
  });

  describe('error', () => {
    it('should log error span, error, counter, and event for Error instance', () => {
      const startTime = new Date();
      const op: IOperationContext = {
        operationLogger: mockOperationLogger,
        startTime,
        stopTimer: jest.fn(),
      };
      const err = new Error('test error');
      const provider = 'test-provider';

      telemetry.error(op, err, provider);

      expect(mockOperationLogger.error).toHaveBeenCalledWith('Failed to execute next command', {
        error: 'test error',
        stack: expect.any(String),
        duration: expect.any(Number),
      });
      expect(mockOperationLogger.counter).toHaveBeenCalledWith('commands.next.errors', {
        provider,
        error_type: 'Error',
      });
      expect(mockOperationLogger.span).toHaveBeenCalledWith(
        'next_command_execution',
        startTime,
        expect.any(Date),
        {
          provider,
          success: false,
          error: 'test error',
        },
      );
      expect(mockOperationLogger.event).toHaveBeenCalledWith('command_execution_completed', {
        command: CommandName.NEXT,
        success: false,
        error: 'test error',
        duration: expect.any(Number),
      });
      expect(op.stopTimer).toHaveBeenCalled();
    });

    it('should handle non-Error err', () => {
      const op: IOperationContext = {
        operationLogger: mockOperationLogger,
        startTime: new Date(),
        stopTimer: jest.fn(),
      };
      const err = 'string error';

      telemetry.error(op, err, undefined);

      expect(mockOperationLogger.error).toHaveBeenCalledWith('Failed to execute next command', {
        error: 'string error',
        stack: null,
        duration: expect.any(Number),
      });
      expect(mockOperationLogger.counter).toHaveBeenCalledWith('commands.next.errors', {
        provider: TaskProviderType.TASK,
        error_type: 'unknown',
      });
      expect(mockOperationLogger.span).toHaveBeenCalledWith(
        'next_command_execution',
        expect.any(Date),
        expect.any(Date),
        {
          provider: TaskProviderType.TASK,
          success: false,
          error: 'string error',
        },
      );
    });
  });
});
