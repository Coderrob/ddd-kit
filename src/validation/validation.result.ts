import type { FixRecord, IValidationResult } from '../types';
import { ValidationResultBuilder } from './validation-result.builder';

/**
 * Represents the result of a validation and fix operation.
 */
export class ValidationResult implements IValidationResult {
  /**
   * Creates a new ValidationResult instance.
   * @param valid - Whether all tasks passed validation without errors.
   * @param errors - Optional array of validation error messages.
   * @param fixesApplied - Optional number of fixes that were successfully applied.
   * @param fixes - Optional array of FixRecord objects describing the fixes applied.
   */
  constructor(
    public readonly valid: boolean,
    public readonly errors?: string[],
    public readonly fixesApplied?: number,
    public readonly fixes?: FixRecord[],
  ) {}

  /**
   * Creates a new ValidationResultBuilder instance for building validation results.
   * @returns A new ValidationResultBuilder instance.
   */
  static create(): ValidationResultBuilder {
    return new ValidationResultBuilder();
  }
}
