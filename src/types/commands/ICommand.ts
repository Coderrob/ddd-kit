import { CommandName } from './CommandName';

export interface ICommand<TArgs = unknown, TResult = void> {
  readonly name: CommandName;
  readonly description: string;

  execute(args: TArgs): Promise<TResult>;
}
