import type { FixRecord } from './FixRecord';

export interface IValidationResult {
  readonly valid: boolean;
  readonly errors?: string[];
  readonly fixesApplied?: number;
  readonly fixes?: FixRecord[];
}
