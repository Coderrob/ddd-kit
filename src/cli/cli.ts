#!/usr/bin/env node
import { Command } from 'commander';

import { getLogger } from '../core/system/logger';
import { CommandFactory } from '../commands/shared/command.factory';

/**
 * Main CLI entry point for the Documentation-Driven Development toolkit.
 * Refactored to follow Clean Architecture and SOLID principles:
 * - DIP: Dependencies injected through factories
 * - SRP: CLI focuses only on command registration and execution
 * - OCP: New commands can be added without modifying this file
 */

// Create the main CLI program
const program = new Command();
program.name('dddctl').description('Documentation-Driven Development CLI').version('1.0.0');

// Create logger for command configuration
const logger = getLogger();

// Configure all commands through the factory
CommandFactory.configureProgram(program, logger);

// Error handling following clean architecture principles
try {
  logger.debug('CLI start', { argv: process.argv.slice(2) });

  // Parse command line arguments and execute the appropriate command
  program.parse(process.argv);
} catch (error) {
  // Log domain errors with appropriate level
  if (error instanceof Error && 'code' in error) {
    logger.error('Domain error occurred', {
      code: (error as Error & { code: string }).code,
      message: error.message,
      stack: error.stack,
    });
    process.exit(1);
  }

  // Log unexpected errors
  logger.error('Unexpected error occurred', {
    error: error instanceof Error ? error.message : String(error),
    stack: error instanceof Error ? error.stack : null,
  });
  process.exit(1);
}
