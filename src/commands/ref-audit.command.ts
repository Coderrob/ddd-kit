import { Command } from 'commander';

import { ILogger } from '../interfaces/ILogger';
import { getLogger } from '../utils/logger';
import { container, SERVICE_KEYS } from '../utils/container';

/**
 * Command for auditing references.
 */
export class RefAuditCommand {
  constructor(private readonly logger: ILogger) {}

  /**
   * Executes the ref audit command.
   */
  execute(): Promise<void> {
    this.logger.info('Executing ref audit command');
    const svc = container.resolve(SERVICE_KEYS.REFERENCE_AUDIT) as unknown as {
      execute(): Promise<unknown>;
    };
    return svc.execute().then(() => {
      console.log('Ref audit command executed');
      this.logger.info('Reference audit completed');
    });
  }

  static configure(parent: Command): void {
    parent
      .command('audit')
      .description('Audit references across repo & tasks')
      .action(async () => {
        const cmd = new RefAuditCommand(getLogger());
        await cmd.execute();
      });
  }
}
