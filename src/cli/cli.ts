#!/usr/bin/env node
import { Command } from 'commander';

import { getLogger } from '../utils/logger';

import { CommandFactory } from './command.factory';

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

// Configure all commands through the factory
CommandFactory.configureProgram(program);

// Error handling following clean architecture principles
try {
  const logger = getLogger();
  logger.debug('CLI start', { argv: process.argv.slice(2) });

  // Parse command line arguments and execute the appropriate command
  program.parse(process.argv);
} catch (error) {
  const logger = getLogger();

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
