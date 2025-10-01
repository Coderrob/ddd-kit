import type { FixRecord } from '../tasks/FixRecord';

export interface IValidationResult {
  readonly valid: boolean;
  readonly errors?: string[] | undefined;
  readonly fixesApplied?: number | undefined;
  readonly fixes?: FixRecord[] | undefined;
}
