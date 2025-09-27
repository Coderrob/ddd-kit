import { IReferenceAuditResult } from './IReferenceAuditResult';

/**
 * Use case for auditing references across the repository.
 */
export interface IReferenceAuditUseCase {
  execute(): Promise<IReferenceAuditResult>;
}
