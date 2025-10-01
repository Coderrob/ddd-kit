import type { FixRecord } from '../tasks/FixRecord';

export interface IValidationResult {
  readonly isValid: boolean;
  readonly errors?: string[] | undefined;
  readonly fixesApplied?: number | undefined;
  readonly fixes?: FixRecord[] | undefined;
}
