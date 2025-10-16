import Ajv from 'ajv';
import addFormats from 'ajv-formats';

import { TaskValidationService } from '../services/task-validation.service';
import { IValidationOptions, IValidationResult, ITask } from '../types';

import { AjvValidator } from './ajv.validator';
import { SchemaLoader } from './schema.loader';

const ajv = new Ajv({ allErrors: true, strict: false });
addFormats(ajv);

/**
 * Validates an array of tasks against the task schema.
 *
 * Performs comprehensive validation of task objects against the JSON schema.
 * Checks each task for required fields, data types, and format compliance.
 * Collects all validation errors and returns a summary of the validation results.
 *
 * @param tasks - Array of task objects to validate (can be any type, will be validated)
 * @returns An object containing:
 *   - valid: boolean indicating if all tasks passed validation
 *   - errors: array of error messages (only present if valid is false)
 */
export function validateTasks(tasks: ITask[]): IValidationResult {
  const loader = new SchemaLoader();
  const validator = new AjvValidator(loader);
  const errors: string[] = [];
  for (let i = 0; i < tasks.length; i++) {
    const task = tasks.at(i);
    if (!task) {
      errors.push(`Task[${i}] is undefined`);
      continue;
    }
    const res = validator.validate(task);
    if (!res.isValid) {
      const msg = (res.errors || [])
        .map((e: unknown) => {
          const error = e as { instancePath?: string; message?: string };
          return `${error.instancePath ?? ''} ${error.message ?? ''}`;
        })
        .join('; ');
      errors.push(`Task[${i}] validation failed: ${msg}`);
    }
  }
  return { isValid: errors.length === 0, ...(errors.length ? { errors } : {}) };
}

/**
 * Validates tasks and attempts to apply fixes for common schema problems.
 *
 * This is the main entry point for task validation and fixing in the DDD-Kit system.
 * The function performs comprehensive validation of task objects and can automatically
 * apply fixes for common schema violations such as missing required fields, invalid
 * data types, and malformed dates.
 *
 * The validation and fixing process includes:
 * 1. Schema validation against the task JSON schema
 * 2. Automatic fixing of common issues (missing fields, type conversions, etc.)
 * 3. Optional persistence of fixes to the task store
 * 4. Detailed reporting of validation results and applied fixes
 *
 * @param tasks - Array of Task objects to validate and potentially fix
 * @param options - Options for the validation and fixing operation:
 *   - applyFixes: boolean indicating if fixes should be applied to the task store
 *   - excludePattern?: optional regex pattern to exclude certain tasks from validation/fixing
 *   - store?: optional ITaskStore instance to use for persisting fixes (defaults to in-memory store)
 *   - logger?: optional ILogger instance for logging (defaults to console logger)
 * @returns Promise resolving to an object containing:
 *   - valid: boolean indicating if all tasks passed validation (after fixes)
 *   - errors: array of remaining validation error messages (only present if valid is false)
 *   - fixesApplied: number of fixes that were actually applied to the task store
 *   - fixes: array of FixRecord objects describing all fixes that were applied or would be applied
 */
export async function validateAndFixTasks(
  tasks: ITask[],
  options: IValidationOptions,
): Promise<IValidationResult> {
  const service = new TaskValidationService();
  const result = await service.validateAndFixTasks(tasks, options);

  const returnValue: IValidationResult = {
    isValid: result.isValid,
    errors: result.errors,
    fixesApplied: result.fixesApplied,
    fixes: result.fixes,
  };

  return returnValue;
}
