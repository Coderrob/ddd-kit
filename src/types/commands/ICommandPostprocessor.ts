export interface ICommandPostprocessor<TResult = unknown, TOutput = unknown> {
  postprocess(result: TResult): Promise<TOutput>;
}
