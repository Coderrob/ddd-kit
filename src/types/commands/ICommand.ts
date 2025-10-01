export interface ICommand<TArgs = unknown, TResult = void> {
  readonly name: string;
  readonly description: string;

  execute(args: TArgs): Promise<TResult>;
}
