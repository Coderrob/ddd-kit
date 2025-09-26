import chalk from 'chalk';

import { ICommand } from '../interfaces/ICommand';
import { getLogger } from '../utils/logger';
import { ILogger } from '../interfaces/ILogger';

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
    console.error(chalk.red(message));
    this.logger.error(message);
  }

  abstract execute(args?: Record<string, unknown>): Promise<void>;
}
