import { CommandName } from '../../types';
import { IObservabilityLogger } from '../../types/observability';
import { IHydrationOptions, TaskProviderType } from '../../types/tasks';

export interface OperationContext {
  operationLogger: IObservabilityLogger;
  startTime: Date;
  stopTimer: () => void;
}

export class NextCommandTelemetry {
  recordStart(obs: IObservabilityLogger, options: IHydrationOptions): OperationContext {
    const correlationId = obs.createCorrelationId();
    const operationLogger = obs.withCorrelation(correlationId, 'next_command_execution', {
      provider: options.provider,
      filters: options.filters,
    });

    const startTime = new Date();
    const stopTimer = operationLogger.startTimer('next_command.execution_duration');

    operationLogger.info('Executing next command', {
      correlationId,
      ...options,
      operationId: 'next_command_execution',
    });

    operationLogger.counter('commands.next.executions', { provider: options.provider ?? 'task' });
    operationLogger.event('command_execution_started', {
      command: CommandName.NEXT,
      provider: options.provider ?? TaskProviderType.TASK,
      hasFilters: Boolean(options.filters?.length),
      filterCount: options.filters?.length ?? 0,
    });

    return { operationLogger, startTime, stopTimer };
  }

  noTaskFound(op: OperationContext, options: IHydrationOptions): void {
    op.operationLogger.warn('No eligible tasks found for next command', {
      provider: options.provider ?? TaskProviderType.TASK,
      filters: options.filters,
    });
    op.operationLogger.counter('commands.next.no_tasks_found', {
      provider: options.provider ?? TaskProviderType.TASK,
    });
    op.operationLogger.event('command_execution_completed', {
      command: CommandName.NEXT,
      success: false,
      reason: 'no_eligible_tasks',
    });
  }

  success(op: OperationContext, taskId: string, provider: string | undefined): void {
    const endTime = new Date();
    const duration = endTime.getTime() - op.startTime.getTime();
    op.stopTimer();

    op.operationLogger.span('next_command_execution', op.startTime, endTime, {
      taskId,
      provider: provider ?? TaskProviderType.TASK,
      success: true,
    });

    op.operationLogger.info('Task hydrated and updated successfully', {
      taskId,
      duration,
    });

    op.operationLogger.counter('commands.next.success', {
      provider: provider ?? TaskProviderType.TASK,
    });
    op.operationLogger.event('command_execution_completed', {
      command: CommandName.NEXT,
      success: true,
      taskId,
      duration,
    });
  }

  error(op: OperationContext, err: unknown, provider: string | undefined): void {
    const endTime = new Date();
    const duration = endTime.getTime() - op.startTime.getTime();
    op.stopTimer();

    const message = err instanceof Error ? err.message : String(err);
    const errorType = err instanceof Error ? err.constructor.name : 'unknown';
    const stack = err instanceof Error ? err.stack : null;

    op.operationLogger.error('Failed to execute next command', {
      error: message,
      stack,
      duration,
    });

    op.operationLogger.counter('commands.next.errors', {
      provider: provider ?? TaskProviderType.TASK,
      error_type: errorType,
    });

    op.operationLogger.span('next_command_execution', op.startTime, endTime, {
      provider: provider ?? TaskProviderType.TASK,
      success: false,
      error: message,
    });

    op.operationLogger.event('command_execution_completed', {
      command: CommandName.NEXT,
      success: false,
      error: message,
      duration,
    });
  }
}
