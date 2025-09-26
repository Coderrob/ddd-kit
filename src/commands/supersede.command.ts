import { getLogger } from '../utils/logger';
import { container, SERVICE_KEYS } from '../utils/container';

/**
 * Command for superseding UIDs.
 */
export class SupersedeCommand {
  /**
   * Executes the supersede command.
   */
  execute(oldUid: string, newUid: string): Promise<void> {
    const log = getLogger();
    log.info('Executing supersede command', { newUid, oldUid });
    const svc = container.resolve(SERVICE_KEYS.UID_SUPERSEDE) as unknown as {
      execute(oldUid: string, newUid: string): Promise<void>;
    };
    return svc.execute(oldUid, newUid).then(() => {
      console.log('Supersede command executed:', oldUid, '->', newUid);
    });
  }
}
