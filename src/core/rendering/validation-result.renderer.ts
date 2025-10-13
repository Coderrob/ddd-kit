import chalk from 'chalk';

import {
  ILogger,
  ValidateFixCommandOptions,
  FixRecord,
  OutputFormat,
  IValidationResult,
} from '../../types';
import { formatJson } from '../parsers/json.parser';
import { isEmptyArray } from '../helpers/type-guards';

/**
 * Handles rendering of validation results in different output formats.
 * Responsible for formatting and displaying validation results, fixes, and completion messages.
 */
export class ValidationResultRenderer {
  constructor(private readonly logger: ILogger) {}

  /**
   * Renders validation results based on the specified format.
   */
  render(options: ValidateFixCommandOptions, result: IValidationResult, taskCount?: number): void {
    // Early return for successful validation with no fixes
    if (result.isValid && (result.fixesApplied ?? 0) === 0) {
      const count = taskCount ?? this.getTaskCount();
      console.log(chalk.green(`All ${count} tasks validate against schema`));
      this.logger.info('All tasks validated successfully', { taskCount: count });
      return;
    }

    // Output fixes if any exist
    if (result.fixes && !isEmptyArray(result.fixes)) {
      this.renderFixes(options, result.fixes, result.fixesApplied, options.dryRun);
    }

    // Output completion message for successful fixes
    if (!result.errors || isEmptyArray(result.errors)) {
      this.renderCompletionMessage(result.fixes, result.fixesApplied, options.dryRun);
    }
  }

  /**
   * Renders fixes in the appropriate format.
   */
  private renderFixes(
    options: ValidateFixCommandOptions,
    fixes: FixRecord[],
    fixesApplied?: number,
    isDryRun?: boolean,
  ): void {
    if (options.format === OutputFormat.JSON) {
      this.renderJsonSummary(fixes, []);
      return;
    }

    if (options.format === OutputFormat.CSV) {
      this.renderCsvSummary(fixes);
      return;
    }

    // Default console output
    this.renderConsoleSummary(fixes, fixesApplied, isDryRun);
  }

  /**
   * Renders validation results in JSON format.
   */
  private renderJsonSummary(fixes: FixRecord[], errors: string[]): void {
    const summary = { errors, fixes };
    console.log(formatJson(summary));
    this.logger.info('JSON summary generated', {
      errorCount: errors.length,
      fixCount: fixes.length,
    });
  }

  /**
   * Renders validation results in CSV format.
   */
  private renderCsvSummary(fixes: FixRecord[]): void {
    console.log('id,field,old,new');
    for (const f of fixes) {
      console.log(`"${f.id}","${f.field}","${String(f.old ?? '')}","${String(f.new)}"`);
    }
    this.logger.info('CSV summary generated', { fixCount: fixes.length });
  }

  /**
   * Renders validation results in human-readable console format.
   */
  private renderConsoleSummary(
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
   * Renders the final completion message.
   */
  private renderCompletionMessage(
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

  /**
   * Gets the current task count (placeholder - would need to be injected or passed in).
   */
  private getTaskCount(): number {
    // This would need to be injected or passed as a parameter
    // For now, returning a placeholder
    return 0;
  }
}
