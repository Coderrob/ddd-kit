import { Command } from 'commander';

import { container, SERVICE_KEYS } from '../../core/system/container';
import { ILogger } from '../../types/ILogger';

/**
 * Command for superseding UIDs.
 */
export class SupersedeCommand {
  constructor(private readonly logger: ILogger) {}

  /**
   * Executes the supersede command.
   */
  async execute(oldUid: string, newUid: string): Promise<void> {
    this.logger.info('Executing supersede command', { newUid, oldUid });
    const svc = container.resolve(SERVICE_KEYS.UID_SUPERSEDE) as unknown as {
      execute(oldUid: string, newUid: string): Promise<void>;
    };
    await svc.execute(oldUid, newUid);
    console.log('Supersede command executed:', oldUid, '->', newUid);
    this.logger.info('Supersede command completed', { newUid, oldUid });
  }

  static configure(parent: Command, logger: ILogger): void {
    parent
      .command('supersede')
      .argument('<oldUid>', 'Old UID')
      .argument('<newUid>', 'New UID')
      .description('Supersede an old UID with a new one')
      .action(async (oldUid: string, newUid: string) => {
        const cmd = new SupersedeCommand(logger);
        await cmd.execute(oldUid, newUid);
      });
  }
}
