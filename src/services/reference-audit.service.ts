import type { IReferenceAuditUseCase } from '../types/IReferenceAuditUseCase';
import type { IReferenceAuditResult } from '../types/IReferenceAuditResult';
import type { IResolver } from '../types/IResolver';
import { isNullOrUndefined } from '../core/helpers/type-guards';

export class ReferenceAuditService implements IReferenceAuditUseCase {
  constructor(private readonly resolver: IResolver) {}

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
      if (entry.status === 'deprecated') {
        deprecatedUids.push(uid);
      } else if (entry.status === 'archived') {
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
