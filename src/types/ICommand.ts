export interface ICommand {
  name: string;
  description?: string;
  execute(args?: unknown): Promise<void> | void; // eslint-disable-line no-unused-vars
}
