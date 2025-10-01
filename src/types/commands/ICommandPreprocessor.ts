export interface ICommandPreprocessor<TArgs = unknown, TContext = unknown> {
  preprocess(args: TArgs): Promise<TContext>;
}
