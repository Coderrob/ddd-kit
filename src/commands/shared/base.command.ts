import { ICommand, ILogger } from '../../types';

export abstract class BaseCommand implements ICommand {
  abstract name: string;
  abstract description: string;

  constructor(protected readonly logger: ILogger) {}

  protected logInfo(message: string): void {
    console.log(message);
    this.logger.info(message);
  }

  protected logError(message: string): void {
    this.logger.error(message);
  }

  abstract execute(args?: unknown): Promise<void>;
}
