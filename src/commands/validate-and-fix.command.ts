import chalk from 'chalk';
import { Command } from 'commander';

import { ValidateFixCommandOptions } from '../interfaces/command-options';
import { FixRecord } from '../interfaces/FixRecord';
import { ILogger } from '../interfaces/ILogger';
import { OutputFormat } from '../interfaces/OutputFormat';
import { getLogger } from '../utils/logger';
import { listTasks } from '../utils/todo';
import { validateAndFixTasks } from '../validators/validator';

/**
 * Modern command for validating tasks and optionally applying automatic fixes.
 *
 * This command provides comprehensive task validation and automated fixing capabilities
 * for the DDD-Kit task management system. It can validate tasks against the schema,
 * apply automatic fixes for common issues, and provide detailed reporting in various formats.
 */
export class ValidateAndFixCommand {
  constructor(private readonly logger: ILogger) {}
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
    const validationOptions: Parameters<typeof validateAndFixTasks>[1] = {
      applyFixes: Boolean(options.fix) && options.dryRun !== true,
    };
    if (typeof options.exclude === 'string' && options.exclude.length > 0) {
      validationOptions.excludePattern = options.exclude;
    }
    return validateAndFixTasks(listTasks(), validationOptions);
  }

  /**
   * Handles the validation result and produces output.
   */
  private handleValidationResult(
    options: ValidateFixCommandOptions,
    res: {
      valid: boolean;
      errors?: string[];
      fixesApplied?: number;
      fixes?: FixRecord[];
    },
  ): void {
    // Early return for successful validation with no fixes
    if (res.valid && (res.fixesApplied ?? 0) === 0) {
      const taskCount = listTasks().length;
      console.log(chalk.green(`All ${taskCount} tasks validate against schema`));
      this.logger.info('All tasks validated successfully', { taskCount });
      return;
    }

    // Output fixes if any exist
    if (res.fixes && res.fixes.length > 0) {
      this.outputFixes(options, { ...res, fixes: res.fixes });
    }

    // Handle validation errors
    if (res.errors && res.errors.length > 0) {
      this.handleValidationErrors(res.errors);
      return;
    }

    // Output completion message
    this.outputCompletionMessage(res.fixes, res.fixesApplied, options.dryRun);
  }

  /**
   * Outputs fixes based on the configured format.
   */
  private outputFixes(
    options: ValidateFixCommandOptions,
    res: { fixes: FixRecord[]; errors?: string[]; fixesApplied?: number },
  ): void {
    const format =
      options.format === 'json'
        ? OutputFormat.JSON
        : options.format === 'csv'
          ? OutputFormat.CSV
          : null;

    if (format === OutputFormat.JSON) {
      this.outputJsonSummary(res.fixes, res.errors ?? []);
      return;
    }

    if (format === OutputFormat.CSV) {
      this.outputCsvSummary(res.fixes);
      return;
    }

    // Default console output
    this.outputConsoleSummary(res.fixes, res.fixesApplied, options.dryRun);
  }

  /**
   * Outputs validation results in JSON format.
   */
  private outputJsonSummary(fixes: FixRecord[], errors: string[]): void {
    const summary = { errors, fixes };
    console.log(JSON.stringify(summary, null, 2));
    this.logger.info('JSON summary generated', {
      errorCount: errors.length,
      fixCount: fixes.length,
    });
  }

  /**
   * Outputs validation results in CSV format.
   */
  private outputCsvSummary(fixes: FixRecord[]): void {
    console.log('id,field,old,new');
    for (const f of fixes) {
      console.log(`"${f.id}","${f.field}","${String(f.old ?? '')}","${String(f.new)}"`);
    }
    this.logger.info('CSV summary generated', { fixCount: fixes.length });
  }

  /**
   * Outputs validation results in human-readable console format.
   */
  private outputConsoleSummary(
    fixes: FixRecord[],
    fixesApplied: number | undefined,
    isDryRun: boolean | undefined,
  ): void {
    if (isDryRun === true) {
      console.log(chalk.yellow(`Planned ${fixes.length} fixes (dry-run):`));
      for (const m of fixes) console.log(`- ${m.id}: ${m.field} -> ${m.new}`);
      this.logger.info('Dry-run fixes displayed', { plannedFixes: fixes.length });
    } else {
      console.log(chalk.yellow(`Applied ${fixesApplied ?? 0} fixes:`));
      for (const m of fixes) console.log(`- ${m.id}: ${m.field} -> ${m.new}`);
      this.logger.info('Applied fixes displayed', { appliedFixes: fixesApplied ?? 0 });
    }
  }

  /**
   * Handles validation errors by logging them and setting exit code.
   */
  private handleValidationErrors(errors: string[]): void {
    console.error(chalk.red('Remaining validation errors:'));
    for (const e of errors) console.error(`- ${e}`);
    this.logger.error('Validation errors remain after fixes', { errorCount: errors.length });
    process.exitCode = 5;
  }

  /**
   * Outputs the final completion message.
   */
  private outputCompletionMessage(
    fixes: FixRecord[] | undefined,
    fixesApplied: number | undefined,
    isDryRun: boolean | undefined,
  ): void {
    if (isDryRun === true) {
      const plannedFixes = fixes?.length ?? 0;
      console.log(chalk.green(`Dry-run complete; ${plannedFixes} fixes would have been applied.`));
      this.logger.info('Dry-run completed', { plannedFixes });
    } else {
      const appliedFixes = fixesApplied ?? 0;
      console.log(chalk.green(`Validation and fixes completed; ${appliedFixes} changes written.`));
      this.logger.info('Validation and fixes completed', { appliedFixes });
    }
  }

  static configure(parent: Command): void {
    parent
      .command('fix')
      .description('Validate and fix tasks')
      .option('--fix', 'Apply fixes automatically')
      .option('--dry-run', 'Perform dry run without making changes')
      .option('--format <format>', 'Output format: json, csv', 'json')
      .option('--exclude <pattern>', 'Pattern to exclude tasks')
      .action(async (options: ValidateFixCommandOptions) => {
        const cmd = new ValidateAndFixCommand(getLogger());
        await cmd.execute(options);
      });
  }
}
