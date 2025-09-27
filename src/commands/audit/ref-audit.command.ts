import { Command } from 'commander';

import { container, SERVICE_KEYS } from '../../core/system/container';
import { ILogger } from '../../types/ILogger';

/**
 * Command for auditing references.
 */
export class RefAuditCommand {
  constructor(private readonly logger: ILogger) {}

  /**
   * Executes the ref audit command.
   */
  async execute(): Promise<void> {
    this.logger.info('Executing ref audit command');
    const svc = container.resolve(SERVICE_KEYS.REFERENCE_AUDIT) as unknown as {
      execute(): Promise<unknown>;
    };
    await svc.execute();
    console.log('Ref audit command executed');
    this.logger.info('Reference audit completed');
  }

  static configure(parent: Command, logger: ILogger): void {
    parent
      .command('audit')
      .description('Audit references across repo & tasks')
      .action(async () => {
        const cmd = new RefAuditCommand(logger);
        await cmd.execute();
      });
  }
}
