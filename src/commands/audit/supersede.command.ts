import { Command } from 'commander';

import { container } from '../../core/system/container';
import { SERVICE_KEYS } from '../../types/core';
import { ILogger } from '../../types/observability';
import { CommandName, IUIdSupersedeUseCase } from '../../types';
import { BaseCommand } from '../shared/base.command';

export interface ISupersedeOptions {
  oldUid: string;
  newUid: string;
}

/**
 * Command for superseding UIDs.
 */
export class SupersedeCommand extends BaseCommand {
  override name = CommandName.SUPERSEDE;
  override description = 'Supersede an old UID with a new one';

  /**
   * Executes the supersede command.
   * @param param0 - Object containing oldUid and newUid
   * @returns Promise that resolves when the operation is complete
   *
   * @example
   * ```typescript
   * await command.execute({ oldUid: 'OLD123', newUid: 'NEW456' });
   * ```
   */
  async execute({ oldUid, newUid }: ISupersedeOptions): Promise<void> {
    this.logger.info('Executing supersede command', { newUid, oldUid });
    const svc = container.resolve<IUIdSupersedeUseCase>(SERVICE_KEYS.UID_SUPERSEDE);
    await svc.execute(oldUid, newUid);
    this.logger.info(`Supersede command executed: ${oldUid} -> ${newUid}`, { newUid, oldUid });
  }

  static configure(parent: Command, logger: ILogger): void {
    parent
      .command(CommandName.SUPERSEDE)
      .argument('<oldUid>', 'Old UID')
      .argument('<newUid>', 'New UID')
      .description('Supersede an old UID with a new one')
      .action(async (oldUid: string, newUid: string) => {
        const cmd = new SupersedeCommand(logger);
        await cmd.execute({ oldUid, newUid });
      });
  }
}
