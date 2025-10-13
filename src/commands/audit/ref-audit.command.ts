import { Command } from 'commander';

import { container } from '../../core/system/container';
import { SERVICE_KEYS } from '../../types/core';
import { ILogger } from '../../types/observability';
import { CommandName, IReferenceAuditUseCase } from '../../types';
import { BaseCommand } from '../shared/base.command';

/**
 * Command for auditing references.
 */
export class RefAuditCommand extends BaseCommand {
  override name = CommandName.AUDIT;
  override description = 'Audit references across repo & tasks';

  /**
   * Executes the ref audit command.
   */
  async execute(): Promise<void> {
    this.logger.info('Executing ref audit command');
    const svc = container.resolve<IReferenceAuditUseCase>(SERVICE_KEYS.REFERENCE_AUDIT);
    await svc.execute();
    this.logger.info('Ref audit command executed');
  }

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
