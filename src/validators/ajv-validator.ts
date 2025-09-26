import Ajv, { AnySchema, ValidateFunction } from 'ajv';
import addFormats from 'ajv-formats';

import { SchemaLoader } from './schema-loader';

/**
 * Validator class that uses AJV to validate objects against a JSON schema.
 */
export class AjvValidator {
  private readonly ajv: Ajv;
  private validateFn: ValidateFunction<unknown> | null = null;

  /**
   * Creates a new AjvValidator instance.
   * @param loader - The schema loader to use for loading the validation schema.
   */
  constructor(private readonly loader: SchemaLoader = new SchemaLoader()) {
    this.ajv = new Ajv({ allErrors: true, strict: false });
    addFormats(this.ajv);
  }

  /**
   * Compiles the validation schema for use in validation.
   */
  compile(): void {
    const schema = this.loader.load();
    this.validateFn = this.ajv.compile(schema as AnySchema);
  }

  /**
   * Validates an object against the compiled schema.
   * @param obj - The object to validate.
   * @returns An object containing validation result and any errors.
   */
  validate(obj: unknown): { ok: boolean; errors?: unknown[] } {
    if (!this.validateFn) this.compile();
    if (!this.validateFn) throw new Error('Failed to compile validator');
    const ok = Boolean(this.validateFn(obj));
    const result: { ok: boolean; errors?: unknown[] } = { ok };
    if (this.validateFn.errors) {
      result.errors = [...this.validateFn.errors];
    }
    return result;
  }
}
