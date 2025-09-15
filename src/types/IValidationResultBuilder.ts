/**
 * Interface for building validation results.
 */

import { FixRecord } from './FixRecord';
import { IValidationResult } from './IValidationResult';

export interface IValidationResultBuilder {
  addError(error: string): void;
  addFixes(fixes: FixRecord[]): void;
  incrementFixesApplied(): void;
  build(): IValidationResult;
}
