import { Command } from 'commander';

import { isEmptyArray } from '../core/helpers/array.helper';
import { isNonEmptyString } from '../core/helpers/type.helper';
import { ValidationResultRenderer } from '../core/rendering/validation-result.renderer';
import { TaskManager } from '../core/storage';
import {
  EXIT_CODES,
  ILogger,
  IOutputWriter,
  IValidationOptions,
  IValidationResult,
  ValidateFixCommandOptions,
} from '../types';
import { validateAndFixTasks } from '../validators/validator';

import { BaseCommand } from './base.command';

/**
 * Modern command for validating tasks and optionally applying automatic fixes.
 *
 * This command provides comprehensive task validation and automated fixing capabilities
 * for the DDD-Kit task management system. It can validate tasks against the schema,
 * apply automatic fixes for common issues, and provide detailed reporting in various formats.
 */
export class ValidateAndFixCommand extends BaseCommand {
  override name = 'fix';
  override description = 'Validate and fix tasks';

  constructor(
    logger: ILogger,
    private readonly renderer: ValidationResultRenderer,
  ) {
    super(logger);
  }

  /**
   * Executes the validate and fix command.
   *
   * This method performs the core validation and fixing logic:
   * 1. Retrieves all tasks from the TODO.md file
   * 2. Validates tasks against the schema and applies fixes if enabled
   * 3. Generates appropriate output based on the results and configuration
   * 4. Handles different output formats (console, JSON, CSV)
   * 5. Provides detailed feedback about validation results and applied fixes
   *
   * @param options - Command options including fix, dryRun, format, and exclude
   *  - fix: boolean indicating if fixes should be applied
   *  - dryRun: boolean indicating if changes should be simulated without applying
   *  - format: output format (json, csv)
   *  - exclude: optional pattern to exclude certain tasks from validation/fixing
   * @returns Promise that resolves when the command execution is complete
   *
   * @throws Will set process.exitCode to 5 if validation errors remain after fixing
   */
  async execute(options: ValidateFixCommandOptions = {}): Promise<void> {
    const res = await this.performValidation(options);
    this.handleValidationResult(options, res);
  }

  /**
   * Performs the validation and fixing operation.
   * @param options - Command options including fix and dryRun flags
   * @returns The validation result containing errors and fix information
   */
  private performValidation(options: ValidateFixCommandOptions) {
    const todoManager = new TaskManager(this.logger);
    const validationOptions: IValidationOptions = {
      applyFixes: Boolean(options.fix) && options.dryRun !== true,
    };
    if (isNonEmptyString(options.exclude)) {
      validationOptions.excludePattern = options.exclude;
    }
    return validateAndFixTasks(todoManager.listTasks(), validationOptions);
  }

  /**
   * Handles the validation result and produces output.
   * @param options - Command options including output format
   * @param result - The validation result to handle
   *
   * @throws Will set process.exitCode to 5 if validation errors remain after fixing
   */
  private handleValidationResult(
    options: ValidateFixCommandOptions,
    result: IValidationResult,
  ): void {
    // Handle validation errors first
    if (result.errors && !isEmptyArray(result.errors)) {
      this.handleValidationErrors(result.errors);
      return;
    }

    // Use renderer for all output
    const todoManager = new TaskManager(this.logger);
    this.renderer.render(options, result, todoManager.listTasks().length);
  }

  /**
   * Handles validation errors by logging them and setting exit code.
   * @param errors - Array of validation error messages
   *
   * @throws Will set process.exitCode to 5 if validation errors remain after fixing
   */
  private handleValidationErrors(errors: string[]): void {
    this.logger.error('Remaining validation errors:');
    for (const e of errors) this.logger.error(`- ${e}`);
    this.logger.error('Validation errors remain after fixes', { errorCount: errors.length });
    process.exitCode = EXIT_CODES.FIX_FAILED;
  }

  /**
   * Configures the validate and fix command for Commander.js.
   *
   * Sets up the CLI interface for the validate and fix command, defining the
   * command name, description, options, and action handler. This static method is
   * called during application initialization to register the command.
   *
   * @param parent - The parent Commander.js command to attach this command to
   * @param logger - Logger instance for command logging
   * @param outputWriter - Optional output writer for command output
   *
   * @example
   * ```typescript
   * const program = new Command();
   * ValidateAndFixCommand.configure(program, logger, outputWriter);
   * ```
   */
  static configure(parent: Command, logger: ILogger, outputWriter?: IOutputWriter): void {
    parent
      .command('fix')
      .description('Validate and fix tasks')
      .option('--fix', 'Apply fixes automatically')
      .option('--dry-run', 'Perform dry run without making changes')
      .option('--format <format>', 'Output format: json, csv', 'json')
      .option('--exclude <pattern>', 'Pattern to exclude tasks')
      .action(async (options: ValidateFixCommandOptions) => {
        const renderer = new ValidationResultRenderer(logger, outputWriter);
        const cmd = new ValidateAndFixCommand(logger, renderer);
        await cmd.execute(options);
      });
  }
}
