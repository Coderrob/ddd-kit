import {
  ILogger,
  ValidateFixCommandOptions,
  FixRecord,
  OutputFormat,
  IValidationResult,
} from '../../types';
import { IOutputWriter } from '../../types/rendering';

import { ConsoleOutputWriter } from './console-output.writer';

/**
 * Handles rendering of validation results in different output formats.
 * Responsible for formatting and displaying validation results, fixes, and completion messages.
 */
export class ValidationResultRenderer {
  constructor(
    private readonly logger: ILogger,
    private readonly outputWriter: IOutputWriter = new ConsoleOutputWriter(),
  ) {}

  /**
   * Renders validation results based on the specified format.
   */
  render(options: ValidateFixCommandOptions, result: IValidationResult, taskCount?: number): void {
    // Early return for successful validation with no fixes
    if (result.isValid && (result.fixesApplied ?? 0) === 0) {
      const count = taskCount ?? this.getTaskCount();
      this.outputWriter.success(`All ${count} tasks validate against schema`);
      this.logger.info('All tasks validated successfully', { taskCount: count });
      return;
    }

    // Output fixes if any exist
    if (result.fixes && result.fixes.length > 0) {
      this.renderFixes(options, result.fixes, result.fixesApplied, options.dryRun);
    }

    // Output completion message for successful fixes
    if (!result.errors || result.errors.length === 0) {
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
    this.outputWriter.writeFormatted(summary, OutputFormat.JSON);
    this.logger.info('JSON summary generated', {
      errorCount: errors.length,
      fixCount: fixes.length,
    });
  }

  /**
   * Renders validation results in CSV format.
   */
  private renderCsvSummary(fixes: FixRecord[]): void {
    this.outputWriter.writeFormatted(fixes, OutputFormat.CSV);
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
      this.outputWriter.warning(`Planned ${fixes.length} fixes (dry-run):`);
      for (const m of fixes) this.outputWriter.write(`- ${m.id}: ${m.field} -> ${m.new}`);
      this.logger.info('Dry-run fixes displayed', { plannedFixes: fixes.length });
    } else {
      this.outputWriter.warning(`Applied ${fixesApplied ?? 0} fixes:`);
      for (const m of fixes) this.outputWriter.write(`- ${m.id}: ${m.field} -> ${m.new}`);
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
      this.outputWriter.success(`Dry-run complete; ${plannedFixes} fixes would have been applied.`);
      this.logger.info('Dry-run completed', { plannedFixes });
    } else {
      const appliedFixes = fixesApplied ?? 0;
      this.outputWriter.success(`Validation and fixes completed; ${appliedFixes} changes written.`);
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
