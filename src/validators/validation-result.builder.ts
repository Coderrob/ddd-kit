import { IValidationResultBuilder } from '../types/IValidationResultBuilder';
import { FixRecord } from '../types/FixRecord';

import { ValidationResult } from './validation.result';

/**
 * Builder for ValidationResult objects.
 */

export class ValidationResultBuilder implements IValidationResultBuilder {
  private readonly errors: string[] = [];
  private readonly fixes: FixRecord[] = [];
  private fixesApplied = 0;

  /**
   * Adds a validation error message to the result.
   * @param error - The error message to add.
   */
  addError(error: string): void {
    this.errors.push(error);
  }

  /**
   * Adds an array of fix records to the result.
   * @param fixes - Array of FixRecord objects describing the fixes applied.
   */
  addFixes(fixes: FixRecord[]): void {
    this.fixes.push(...fixes);
  }

  /**
   * Increments the count of fixes that were successfully applied.
   */
  incrementFixesApplied(): void {
    this.fixesApplied++;
  }

  /**
   * Builds and returns a ValidationResult object with all accumulated data.
   * @returns A ValidationResult object containing validation outcome and fix details.
   */
  build(): ValidationResult {
    return new ValidationResult(
      this.errors.length === 0,
      this.errors.length > 0 ? this.errors : void 0,
      this.fixesApplied > 0 ? this.fixesApplied : void 0,
      this.fixes.length > 0 ? this.fixes : void 0,
    );
  }
}
