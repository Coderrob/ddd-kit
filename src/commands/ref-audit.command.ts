import { getLogger } from '../utils/logger';
import { container, SERVICE_KEYS } from '../utils/container';

/**
 * Command for auditing references.
 */
export class RefAuditCommand {
  /**
   * Executes the ref audit command.
   */
  execute(): Promise<void> {
    const log = getLogger();
    log.info('Executing ref audit command');
    const svc = container.resolve(SERVICE_KEYS.REFERENCE_AUDIT) as unknown as {
      execute(): Promise<unknown>;
    };
    return svc.execute().then(() => {
      console.log('Ref audit command executed');
    });
  }
}
