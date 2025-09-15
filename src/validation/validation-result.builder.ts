import { IValidationResultBuilder, FixRecord } from '../types';
import { ValidationResult } from './validation.result';

/**
 * Builder for ValidationResult objects.
 */

export class ValidationResultBuilder implements IValidationResultBuilder {
  private errors: string[] = [];
  private fixes: FixRecord[] = [];
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
      this.errors.length > 0 ? this.errors : undefined,
      this.fixesApplied > 0 ? this.fixesApplied : undefined,
      this.fixes.length > 0 ? this.fixes : undefined,
    );
  }
}
