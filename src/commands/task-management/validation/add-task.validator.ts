import * as path from 'path';

import { ICommandValidator, ValidationResult } from '../../../types/commands';
import { AddTaskArgs } from '../../../types';
import { IFileManager } from '../../../types/core';

/**
 * Validator for the AddTaskCommand.
 *
 * Validates that the file exists and is accessible before attempting
 * to add it as a task.
 */
export class AddTaskValidator implements ICommandValidator<AddTaskArgs> {
  constructor(private readonly fileManager: IFileManager) {}
  /**
   * Validates the arguments for adding a task from a file.
   * Each check is decomposed into a tiny, single-purpose method to reduce nesting
   * and keep cyclomatic complexity very low.
   */
  validate(args: AddTaskArgs): ValidationResult {
    const fileProvided = this.ensureFileProvided(args);
    if (!fileProvided.isValid) return fileProvided;

    const filePath = this.resolvePath(args.file as string);

    const exists = this.ensureExists(filePath);
    if (!exists.isValid) return exists;

    const isFile = this.ensureIsFile(filePath);
    if (!isFile.isValid) return isFile;

    const readable = this.ensureReadable(filePath);
    if (!readable.isValid) return readable;

    return this.ok();
  }

  private ok(): ValidationResult {
    return { errors: [], isValid: true };
  }

  private fail(message: string): ValidationResult {
    return { errors: [message], isValid: false };
  }

  private resolvePath(p: string): string {
    return path.resolve(p);
  }

  private hasValue(s: string | undefined | null): s is string {
    return typeof s === 'string' && s.trim().length > 0;
  }

  private ensureFileProvided(args: AddTaskArgs): ValidationResult {
    return this.hasValue(args.file) ? this.ok() : this.fail('File path is required');
  }

  private ensureExists(filePath: string): ValidationResult {
    return this.fileManager.existsSync(filePath)
      ? this.ok()
      : this.fail(`File does not exist: ${filePath}`);
  }

  private ensureIsFile(filePath: string): ValidationResult {
    const stats = this.fileManager.statSync(filePath);
    return stats.isFile() ? this.ok() : this.fail(`Path is not a file: ${filePath}`);
  }

  private ensureReadable(filePath: string): ValidationResult {
    return this.fileManager.isReadable(filePath)
      ? this.ok()
      : this.fail(`File is not readable: ${filePath}`);
  }
}
