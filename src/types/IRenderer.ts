import type { IResolvedRef } from './ITask';

export interface IRenderer {
  render(
    taskId: string,
    resolvedRefs: IResolvedRef[],
    provenance: { dddKit: string; actionRunId: string },
  ): void;
}
