import { isNullOrUndefined } from '../core/helpers/type.helper';
import { IReferenceAuditResult, IReferenceAuditUseCase, IResolver, UidStatus } from '../types';

export class ReferenceAuditService implements IReferenceAuditUseCase {
  /**
   * Creates a new ReferenceAuditService instance.
   * @param resolver - The resolver instance for accessing the UID registry
   */
  constructor(private readonly resolver: IResolver) {}

  /**
   * Executes the reference audit operation to analyze UID status and references.
   * @returns Promise that resolves to the audit result containing statistics and categorized UIDs
   */
  execute(): Promise<IReferenceAuditResult> {
    const registry = this.resolver.getRegistry();
    let totalReferences = 0;
    const unresolvedUids: string[] = [];
    const deprecatedUids: string[] = [];
    const archivedUids: string[] = [];

    for (const uid in registry) {
      // Safe object access since uid comes from for...in loop over registry keys
      // eslint-disable-next-line security/detect-object-injection
      const entry = registry[uid];
      if (isNullOrUndefined(entry)) {
        unresolvedUids.push(uid);
        continue;
      }
      totalReferences += entry.requires.length;
      if (entry.status === UidStatus.DEPRECATED) {
        deprecatedUids.push(uid);
      } else if (entry.status === UidStatus.ARCHIVED) {
        archivedUids.push(uid);
      }
    }

    const summary = `Audited ${Object.keys(registry).length} UIDs: ${totalReferences} references, ${unresolvedUids.length} unresolved, ${deprecatedUids.length} deprecated, ${archivedUids.length} archived.`;

    return Promise.resolve({
      archivedUids,
      deprecatedUids,
      summary,
      totalReferences,
      unresolvedUids,
    });
  }
}
