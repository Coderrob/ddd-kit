/* eslint-disable no-unused-vars */
import Ajv, { AnySchema, ErrorObject, ValidateFunction } from 'ajv';
import addFormats from 'ajv-formats';

import { SchemaLoader } from '../schema.loader';

/**
 * Validator class that uses AJV to validate objects against a JSON schema.
 */
export class AjvValidator {
  private ajv: Ajv;
  private validateFn: ValidateFunction<unknown> | null = null;

  /**
   * Creates a new AjvValidator instance.
   * @param loader - The schema loader to use for loading the validation schema.
   */
  constructor(private loader: SchemaLoader = new SchemaLoader()) {
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
  validate(obj: unknown): { ok: boolean; errors?: ErrorObject[] } {
    if (!this.validateFn) this.compile();
    const ok = Boolean(this.validateFn!(obj));
    return { ok, errors: this.validateFn!.errors ?? undefined };
  }
}
