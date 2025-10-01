import type { IResolvedRef } from '../tasks/IResolvedRef';

export interface IRenderer {
  render(
    taskId: string,
    resolvedRefs: IResolvedRef[],
    provenance: { dddKit: string; actionRunId: string },
  ): void;
}
