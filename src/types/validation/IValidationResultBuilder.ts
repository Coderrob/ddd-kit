import { FixRecord } from '../tasks/FixRecord';

import { IValidationResult } from './IValidationResult';

export interface IValidationResultBuilder {
  addError(error: string): void;
  addFixes(fixes: FixRecord[]): void;
  incrementFixesApplied(): void;
  build(): IValidationResult;
}
