import { ICommandPresenter } from './ICommandPresenter';

export interface IConsolePresenter extends ICommandPresenter {
  presentSuccess(message: string): Promise<void>;
  presentError(error: Error): Promise<void>;
  presentInfo(message: string): Promise<void>;
}
