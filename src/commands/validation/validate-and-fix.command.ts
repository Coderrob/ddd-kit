import { Command } from 'commander';

import { IValidationResult, ValidateFixCommandOptions } from '../../types/validation';
import { ILogger } from '../../types/observability';
import { TaskManager } from '../../core/storage/task.manager';
import { validateAndFixTasks } from '../../validators/validator';
import { ValidationResultRenderer } from '../../core/rendering/validation-result.renderer';
import { isEmptyArray, isNonEmptyString } from '../../core/helpers/type-guards';
import { EXIT_CODES } from '../../constants/exit-codes';
import { BaseCommand } from '../shared/base.command';

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
   * @param args - Optional runtime arguments that override constructor defaults
   * @param args.fix - Whether to automatically apply fixes (overrides constructor option)
   * @param args.dryRun - Whether to simulate fixes without applying them (overrides constructor option)
   * @param args.summary - Output format configuration (overrides constructor option)
   * @param args.summary.format - The output format: 'json' or 'csv'
   * @param args.exclude - Glob pattern to exclude tasks from validation (overrides constructor option)
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
   */
  private performValidation(options: ValidateFixCommandOptions) {
    const todoManager = new TaskManager(this.logger);
    const validationOptions: Parameters<typeof validateAndFixTasks>[1] = {
      applyFixes: Boolean(options.fix) && options.dryRun !== true,
    };
    if (isNonEmptyString(options.exclude)) {
      validationOptions.excludePattern = options.exclude;
    }
    return validateAndFixTasks(todoManager.listTasks(), validationOptions);
  }

  /**
   * Handles the validation result and produces output.
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
   */
  private handleValidationErrors(errors: string[]): void {
    this.logger.error('Remaining validation errors:');
    for (const e of errors) this.logger.error(`- ${e}`);
    this.logger.error('Validation errors remain after fixes', { errorCount: errors.length });
    process.exitCode = EXIT_CODES.FIX_FAILED;
  }

  static configure(parent: Command, logger: ILogger): void {
    parent
      .command('fix')
      .description('Validate and fix tasks')
      .option('--fix', 'Apply fixes automatically')
      .option('--dry-run', 'Perform dry run without making changes')
      .option('--format <format>', 'Output format: json, csv', 'json')
      .option('--exclude <pattern>', 'Pattern to exclude tasks')
      .action(async (options: ValidateFixCommandOptions) => {
        const renderer = new ValidationResultRenderer(logger);
        const cmd = new ValidateAndFixCommand(logger, renderer);
        await cmd.execute(options);
      });
  }
}
