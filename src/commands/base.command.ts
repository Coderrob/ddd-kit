import chalk from 'chalk';

import { ICommand } from '../interfaces/ICommand';
import { getLogger } from '../utils/logger';
import { ILogger } from '../interfaces/ILogger';

export abstract class BaseCommand implements ICommand {
  abstract name: string;

  protected logger: ILogger;

  constructor() {
    this.logger = getLogger();
  }

  protected logInfo(message: string): void {
    console.log(message);
  }

  protected logError(message: string): void {
    console.error(chalk.red(message));
  }

  abstract execute(args?: Record<string, unknown>): Promise<void>;
}
