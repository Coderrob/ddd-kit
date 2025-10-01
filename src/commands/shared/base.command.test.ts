import { ILogger } from '../../types';

import { BaseCommand } from './base.command';

describe('BaseCommand', () => {
  class TestCommand extends BaseCommand {
    name = 'test';
    description = 'test command';

    async execute(_args?: unknown): Promise<void> {
      // Implementation for testing
    }
  }

  let mockLogger: jest.Mocked<ILogger>;
  let testCommand: TestCommand;

  beforeEach(() => {
    mockLogger = {
      info: jest.fn(),
      error: jest.fn(),
    } as unknown as jest.Mocked<ILogger>;
    testCommand = new TestCommand(mockLogger);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('constructor', () => {
    it('should initialize with a logger', () => {
      expect(testCommand).toBeInstanceOf(BaseCommand);
    });
  });

  describe('logInfo', () => {
    it('should log to console and call logger.info', () => {
      const message = 'Test info message';
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();

      testCommand['logInfo'](message);

      expect(consoleSpy).toHaveBeenCalledWith(message);
      expect(mockLogger.info).toHaveBeenCalledWith(message);

      consoleSpy.mockRestore();
    });
  });

  describe('logError', () => {
    it('should call logger.error', () => {
      const message = 'Test error message';

      testCommand['logError'](message);

      expect(mockLogger.error).toHaveBeenCalledWith(message);
    });
  });
});
