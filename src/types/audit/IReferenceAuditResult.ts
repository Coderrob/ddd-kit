export interface IReferenceAuditResult {
  totalReferences: number;
  unresolvedUids: string[];
  deprecatedUids: string[];
  archivedUids: string[];
  summary: string;
}
