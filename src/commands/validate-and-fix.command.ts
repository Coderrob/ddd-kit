import chalk from 'chalk';
import { listTasks } from '../core';
import { ICommand } from '../types';
import { validateAndFixTasks } from '../validation';

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
    private options?: {
      fix?: boolean;
      dryRun?: boolean;
      summary?: { format?: 'json' | 'csv' };
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
    summary?: { format?: 'json' | 'csv' };
    exclude?: string;
  }): Promise<void> {
    const opts = args ?? this.options ?? {};
    const tasks = listTasks();
    // If dryRun, we simulate applyFixes=false but still produce fix messages
    const res = await validateAndFixTasks(tasks, Boolean(opts.fix) && !opts.dryRun, opts.exclude);
    if (res.valid && (!res.fixesApplied || res.fixesApplied === 0)) {
      console.log(chalk.green(`All ${tasks.length} tasks validate against schema`));
      return;
    }
    if (res.fixes && res.fixes.length) {
      if (opts.summary && opts.summary.format === 'json') {
        console.log(JSON.stringify({ fixes: res.fixes, errors: res.errors ?? [] }, null, 2));
      } else if (opts.summary && opts.summary.format === 'csv') {
        console.log('id,field,old,new');
        for (const f of res.fixes)
          console.log(`"${f.id}","${f.field}","${String(f.old ?? '')}","${String(f.new)}"`);
      } else {
        if (opts.dryRun) {
          console.log(chalk.yellow(`Planned ${res.fixes.length} fixes (dry-run):`));
          for (const m of res.fixes) console.log(`- ${m.id}: ${m.field} -> ${m.new}`);
        } else {
          console.log(chalk.yellow(`Applied ${res.fixesApplied ?? 0} fixes:`));
          for (const m of res.fixes) console.log(`- ${m.id}: ${m.field} -> ${m.new}`);
        }
      }
    }
    if (res.errors && res.errors.length) {
      console.error(chalk.red('Remaining validation errors:'));
      for (const e of res.errors) console.error(`- ${e}`);
      process.exitCode = 5;
      return;
    }
    if (opts.dryRun) {
      console.log(
        chalk.green(`Dry-run complete; ${res.fixes?.length ?? 0} fixes would have been applied.`),
      );
    } else {
      console.log(
        chalk.green(`Validation and fixes completed; ${res.fixesApplied ?? 0} changes written.`),
      );
    }
  }
}
