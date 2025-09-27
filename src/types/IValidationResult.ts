import type { FixRecord } from './FixRecord';

export interface IValidationResult {
  readonly valid: boolean;
  readonly errors?: string[] | undefined;
  readonly fixesApplied?: number | undefined;
  readonly fixes?: FixRecord[] | undefined;
}
