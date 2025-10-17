#!/usr/bin/env node
import { Command } from 'commander';
import pino from 'pino';

import { ConsoleOutputWriter } from './core/rendering/console-output.writer';
import { getLogger } from './core/system/logger';
import { ObservabilityLogger } from './core/system/observability.logger';
import { EXIT_CODES } from './types/core';
import { CommandFactory } from './commands/command.factory';

/**
 * Main CLI entry point for the Documentation-Driven Development toolkit.
 * Enhanced with comprehensive observability and diagnostic capabilities.
 * Refactored to follow Clean Architecture and SOLID principles:
 * - DIP: Dependencies injected through factories
 * - SRP: CLI focuses only on command registration and execution
 * - OCP: New commands can be added without modifying this file
 */

// Create enhanced observability logger
const baseLogger = getLogger();
const pinoLogger = pino({
  level: process.env['LOG_LEVEL'] ?? 'warn',
  transport: {
    target: 'pino-pretty',
    options: {
      colorize: true,
      ignore: 'pid,hostname',
      messageFormat: '{msg}',
      translateTime: 'SYS:HH:MM:ss',
    },
  },
});
const observabilityLogger = new ObservabilityLogger(pinoLogger);

// Create the main CLI program
const program = new Command();
program.name('dddctl').description('Documentation-Driven Development CLI').version('1.0.0');

// Create output writer for CLI messaging
const outputWriter = new ConsoleOutputWriter();

// Configure all commands through the factory
CommandFactory.configureProgram(program, baseLogger, outputWriter);

// Helper function to get safe command name
function getCommandName(): string {
  const cmd = process.argv[2];
  return cmd ?? 'help';
}

// Start session logging
function startSession(): {
  correlationId: string;
  startTime: Date;
  timer: () => void;
} {
  const correlationId = observabilityLogger.createCorrelationId();
  const startTime = new Date();
  const timer = observabilityLogger.startTimer('cli.session_duration');

  observabilityLogger.info('CLI session started', {
    correlationId,
    version: '1.0.0',
    nodeVersion: process.version,
    platform: process.platform,
    argv: process.argv.slice(2),
  });

  observabilityLogger.counter('cli.sessions');
  observabilityLogger.event('cli_session_started', {
    version: '1.0.0',
    argumentCount: process.argv.slice(2).length,
    command: getCommandName(),
  });

  return { correlationId, startTime, timer };
}

// Handle successful execution
function handleSuccess(correlationId: string, startTime: Date, timer: () => void): void {
  const endTime = new Date();
  const duration = endTime.getTime() - startTime.getTime();
  timer();

  observabilityLogger.span('cli_session', startTime, endTime, {
    success: true,
    command: getCommandName(),
  });

  observabilityLogger.info('CLI session completed successfully', {
    correlationId,
    duration,
    command: getCommandName(),
  });

  observabilityLogger.counter('cli.sessions.success');
  observabilityLogger.event('cli_session_completed', {
    success: true,
    duration,
    command: getCommandName(),
  });
}

// Handle execution errors
function handleError(
  error: unknown,
  correlationId: string,
  startTime: Date,
  timer: () => void,
): void {
  const endTime = new Date();
  const duration = endTime.getTime() - startTime.getTime();
  timer();

  const errorMessage = error instanceof Error ? error.message : String(error);
  const errorType = error instanceof Error ? error.constructor.name : 'unknown';

  observabilityLogger.error('CLI session failed', {
    correlationId,
    error: errorMessage,
    errorType,
    stack: error instanceof Error ? error.stack : null,
    duration,
    command: getCommandName(),
  });

  observabilityLogger.counter('cli.sessions.errors', { error_type: errorType });
  observabilityLogger.span('cli_session', startTime, endTime, {
    success: false,
    error: errorMessage,
    command: getCommandName(),
  });

  observabilityLogger.event('cli_session_completed', {
    success: false,
    error: errorMessage,
    duration,
    command: getCommandName(),
  });
}

// Main execution
try {
  const { correlationId, startTime, timer } = startSession();

  try {
    program.parse(process.argv);
    handleSuccess(correlationId, startTime, timer);
  } catch (error) {
    handleError(error, correlationId, startTime, timer);

    // Determine exit code based on error type
    if (error instanceof Error && 'code' in error) {
      observabilityLogger.debug('Domain error details', {
        code: (error as Error & { code: string }).code,
        correlationId,
      });
    }

    process.exit(EXIT_CODES.GENERAL_ERROR);
  }
} catch (fatalError) {
  observabilityLogger.error('Fatal CLI error', {
    error: fatalError instanceof Error ? fatalError.message : String(fatalError),
    stack: fatalError instanceof Error ? fatalError.stack : null,
  });
  process.exit(EXIT_CODES.GENERAL_ERROR);
}
