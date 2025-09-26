import chalk from 'chalk';

import { ICommand } from '../interfaces/ICommand';
import { FixRecord } from '../interfaces/FixRecord';
import { OutputFormat } from '../interfaces/OutputFormat';
import { listTasks } from '../utils/todo';
import { validateAndFixTasks } from '../validators/validator';

/**
 * Command for validating tasks and optionally applying automatic fixes.
 *
 * This command provides comprehensive task validation and automated fixing capabilities
 * for the DDD-Kit task management system. It can validate tasks against the schema,
 * apply automatic fixes for common issues, and provide detailed reporting in various formats.
 */
export class ValidateAndFixCommand implements ICommand {
  /** The command name used in the CLI */
  name = 'todo:validate:fix';

  /** Human-readable description of the command */
  description = 'Validate and optionally fix tasks';

  /**
   * Creates a new ValidateAndFixCommand instance.
   *
   * @param options - Optional default configuration options for validation and fixing.
   * @param options.fix - Whether to automatically apply fixes (default: false)
   * @param options.dryRun - Whether to simulate fixes without actually applying them (default: false)
   * @param options.summary - Output format configuration for fix summaries
   * @param options.summary.format - The output format: 'json' for JSON output, 'csv' for CSV output
   * @param options.exclude - Optional glob pattern to exclude certain tasks from validation/fixes
   */
  constructor(
    private readonly options?: {
      fix?: boolean;
      dryRun?: boolean;
      summary?: { format?: OutputFormat };
      exclude?: string;
    },
  ) {}

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
  async execute(args?: {
    fix?: boolean;
    dryRun?: boolean;
    summary?: { format?: OutputFormat };
    exclude?: string;
  }): Promise<void> {
    const opts = args ?? this.options ?? {};

    const res = await this.performValidation(opts);

    this.handleValidationResult(opts, res);
  }

  /**
   * Performs the validation and fixing operation.
   */
  private performValidation(opts: { fix?: boolean; dryRun?: boolean; exclude?: string }) {
    const options: Parameters<typeof validateAndFixTasks>[1] = {
      applyFixes: Boolean(opts.fix) && opts.dryRun !== true,
    };
    if (opts.exclude != null) {
      options.excludePattern = opts.exclude;
    }
    return validateAndFixTasks(listTasks(), options);
  }

  /**
   * Handles the validation result and produces output.
   */
  private handleValidationResult(
    opts: {
      summary?: { format?: OutputFormat };
      dryRun?: boolean;
    },
    res: {
      valid: boolean;
      errors?: string[];
      fixesApplied?: number;
      fixes?: FixRecord[];
    },
  ): void {
    // Early return for successful validation with no fixes
    if (res.valid && (res.fixesApplied == null || res.fixesApplied === 0)) {
      console.log(chalk.green(`All ${listTasks().length} tasks validate against schema`));
      return;
    }

    // Output fixes if any exist
    if (res.fixes && res.fixes.length > 0) {
      this.outputFixes(opts, { ...res, fixes: res.fixes });
    }

    // Handle validation errors
    if (res.errors && res.errors.length > 0) {
      this.handleValidationErrors(res.errors);
      return;
    }

    // Output completion message
    this.outputCompletionMessage(res.fixes, res.fixesApplied, opts.dryRun);
  }

  /**
   * Outputs fixes based on the configured format.
   */
  private outputFixes(
    opts: { summary?: { format?: OutputFormat }; dryRun?: boolean },
    res: { fixes: FixRecord[]; errors?: string[]; fixesApplied?: number },
  ): void {
    const format = opts.summary?.format;

    if (format === OutputFormat.JSON) {
      this.outputJsonSummary(res.fixes, res.errors ?? []);
      return;
    }

    if (format === OutputFormat.CSV) {
      this.outputCsvSummary(res.fixes);
      return;
    }

    // Default console output
    this.outputConsoleSummary(res.fixes, res.fixesApplied, opts.dryRun);
  }

  /**
   * Outputs validation results in JSON format.
   */
  private outputJsonSummary(fixes: FixRecord[], errors: string[]): void {
    console.log(JSON.stringify({ errors, fixes }, null, 2));
  }

  /**
   * Outputs validation results in CSV format.
   */
  private outputCsvSummary(fixes: FixRecord[]): void {
    console.log('id,field,old,new');
    for (const f of fixes) {
      console.log(`"${f.id}","${f.field}","${String(f.old ?? '')}","${String(f.new)}"`);
    }
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
    } else {
      console.log(chalk.yellow(`Applied ${fixesApplied ?? 0} fixes:`));
      for (const m of fixes) console.log(`- ${m.id}: ${m.field} -> ${m.new}`);
    }
  }

  /**
   * Handles validation errors by logging them and setting exit code.
   */
  private handleValidationErrors(errors: string[]): void {
    console.error(chalk.red('Remaining validation errors:'));
    for (const e of errors) console.error(`- ${e}`);
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
      console.log(
        chalk.green(`Dry-run complete; ${fixes?.length ?? 0} fixes would have been applied.`),
      );
    } else {
      console.log(
        chalk.green(`Validation and fixes completed; ${fixesApplied ?? 0} changes written.`),
      );
    }
  }
}
