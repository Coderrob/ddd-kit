import { Command } from 'commander';

import { ILogger } from '../interfaces/ILogger';
import { getLogger } from '../utils/logger';
import { container, SERVICE_KEYS } from '../utils/container';

/**
 * Command for superseding UIDs.
 */
export class SupersedeCommand {
  constructor(private readonly logger: ILogger) {}

  /**
   * Executes the supersede command.
   */
  execute(oldUid: string, newUid: string): Promise<void> {
    this.logger.info('Executing supersede command', { newUid, oldUid });
    const svc = container.resolve(SERVICE_KEYS.UID_SUPERSEDE) as unknown as {
      execute(oldUid: string, newUid: string): Promise<void>;
    };
    return svc.execute(oldUid, newUid).then(() => {
      console.log('Supersede command executed:', oldUid, '->', newUid);
      this.logger.info('Supersede command completed', { newUid, oldUid });
    });
  }

  static configure(parent: Command): void {
    parent
      .command('supersede')
      .argument('<oldUid>', 'Old UID')
      .argument('<newUid>', 'New UID')
      .description('Supersede an old UID with a new one')
      .action(async (oldUid: string, newUid: string) => {
        const cmd = new SupersedeCommand(getLogger());
        await cmd.execute(oldUid, newUid);
      });
  }
}
