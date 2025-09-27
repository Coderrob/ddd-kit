import { ICommand } from '../../types/ICommand';
import { ILogger } from '../../types/ILogger';
import { getLogger } from '../../core/system/logger';

export abstract class BaseCommand implements ICommand {
  abstract name: string;

  protected logger: ILogger;

  constructor(logger?: ILogger) {
    this.logger = logger ?? getLogger();
  }

  protected logInfo(message: string): void {
    console.log(message);
    this.logger.info(message);
  }

  protected logError(message: string): void {
    this.logger.error(message);
  }

  abstract execute(args?: Record<string, unknown>): Promise<void>;
}
