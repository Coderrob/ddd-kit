import { IObservabilityLogger } from '../observability';

export interface IOperationContext {
  operationLogger: IObservabilityLogger;
  startTime: Date;
  stopTimer: () => void;
}
