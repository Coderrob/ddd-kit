#!/usr/bin/env node
import { Command } from 'commander';

import {
  AddTaskCommand,
  CompleteTaskCommand,
  ListTasksCommand,
  ShowTaskCommand,
  ValidateAndFixCommand,
  ValidateTasksCommand,
} from './commands';
import { getLogger } from './lib/logger';
import { CommandRegistry } from './core';

/**
 * Main CLI entry point for the Documentation-Driven Development toolkit.
 * Sets up the Commander.js CLI interface with all available commands.
 */

// Create the main CLI program
const program = new Command();
program.name('ddd').description('Documentation-Driven Development CLI').version('0.1.0');

// Create the todo command group
const todo = program.command('todo').description('Manage TODO tasks');

todo
  .command('list')
  .description('List active tasks in TODO.md')
  .action(async () => {
    const cmd = new ListTasksCommand();
    await cmd.execute();
  });

todo
  .command('add')
  .argument('<file>', 'Markdown file containing task block or path to task template')
  .description('Add a task to TODO.md by copying the given markdown block')
  .action(async (file: string) => {
    const cmd = new AddTaskCommand(file);
    await cmd.execute({ file });
  });

todo
  .command('show')
  .argument('<id>', 'Task id to show (e.g. T-001)')
  .description('Show a single task')
  .action(async (id: string) => {
    const cmd = new ShowTaskCommand(id);
    await cmd.execute({ id });
  });

todo
  .command('complete')
  .argument('<id>', 'Task id to mark complete and move to CHANGELOG.md')
  .option('-m, --message <message>', 'Short message or PR link to add to changelog')
  .option('--dry-run', 'Preview changes without writing files')
  .description('Complete a task: remove from TODO.md and add to CHANGELOG.md Unreleased')
  .action(async (id: string, opts: { message?: string; dryRun?: boolean }) => {
    const cmd = new CompleteTaskCommand(id, {
      message: opts?.message,
      dryRun: Boolean(opts?.dryRun),
    });
    await cmd.execute({ id, opts });
  });

todo
  .command('validate')
  .description('Validate tasks in TODO.md against the task schema')
  .option('--fix', 'Attempt to safely auto-fix common validation issues and write changes')
  .option('--dry-run', 'Show fixes that would be applied without writing files')
  .option(
    '--exclude <pattern>',
    'Exclude tasks matching the given pattern (glob-like) from validation/fixes',
  )
  .option('--summary <format>', "Output a summary of fixes in 'json' or 'csv' format")
  .action(async (opts: { fix?: boolean; dryRun?: boolean; exclude?: string; summary?: string }) => {
    if (opts.fix) {
      const cmd = new ValidateAndFixCommand({
        fix: true,
        dryRun: Boolean(opts.dryRun),
        summary: opts.summary ? { format: opts.summary as 'json' | 'csv' } : undefined,
        exclude: opts.exclude,
      });
      await cmd.execute({
        fix: true,
        dryRun: Boolean(opts.dryRun),
        summary: opts.summary ? { format: opts.summary as 'json' | 'csv' } : undefined,
        exclude: opts.exclude,
      });
      return;
    }
    const cmd = new ValidateTasksCommand();
    await cmd.execute();
  });

try {
  const logger = getLogger();
  logger.debug('CLI start', { argv: process.argv.slice(2) });

  // Register all commands in a registry for programmatic use
  const registry = new CommandRegistry();
  registry.register(new ListTasksCommand());
  registry.register(new ShowTaskCommand());
  registry.register(new CompleteTaskCommand());
  registry.register(new AddTaskCommand());
  registry.register(new ValidateTasksCommand());
  registry.register(new ValidateAndFixCommand());

  // Parse command line arguments and execute the appropriate command
  program.parse(process.argv);
} catch (e) {
  const logger = getLogger();
  logger.error('Unhandled CLI error', { error: String(e) });
  // Re-throw after logging so process exits with non-zero
  throw e;
}
