import { Command } from 'commander';

import { container } from '../core/system/container';
import { CommandName, ILogger, IReferenceAuditUseCase, SERVICE_KEYS } from '../types';

import { BaseCommand } from './base.command';

/**
 * Command for auditing references.
 */
export class RefAuditCommand extends BaseCommand {
  override name = CommandName.AUDIT;
  override description = 'Audit references across repo & tasks';

  /**
   * Executes the ref audit command.
   * @returns Promise that resolves when the operation is complete
   *
   * @example
   * ```typescript
   * await command.execute();
   * ```
   */
  async execute(): Promise<void> {
    this.logger.info('Executing ref audit command');
    const svc = container.resolve<IReferenceAuditUseCase>(SERVICE_KEYS.REFERENCE_AUDIT);
    await svc.execute();
    this.logger.info('Ref audit command executed');
  }

  /**
   * Configures the command within the parent command.
   * @param parent - The parent Command instance
   * @param logger - Logger instance for logging
   */
  static configure(parent: Command, logger: ILogger): void {
    parent
      .command(CommandName.AUDIT)
      .description('Audit references across repo & tasks')
      .action(async () => {
        const cmd = new RefAuditCommand(logger);
        await cmd.execute();
      });
  }
}
