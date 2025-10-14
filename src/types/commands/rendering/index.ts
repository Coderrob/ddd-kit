import type { IObservabilityLogger } from '../../observability';

/**
 * Rendering command types
 */

export interface OperationContext {
  operationLogger: IObservabilityLogger;
  startTime: Date;
  stopTimer: () => void;
}
