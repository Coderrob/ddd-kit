export interface ICommandExecutor<TArgs = unknown, TResult = void> {
  execute(args: TArgs): Promise<TResult>;
}
