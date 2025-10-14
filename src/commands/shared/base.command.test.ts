import { ILogger } from '../../types';
import { IOutputWriter } from '../../types/rendering';

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
  let mockOutputWriter: jest.Mocked<IOutputWriter>;
  let testCommand: TestCommand;

  beforeEach(() => {
    mockLogger = {
      info: jest.fn(),
      error: jest.fn(),
    } as unknown as jest.Mocked<ILogger>;

    mockOutputWriter = {
      info: jest.fn(),
      error: jest.fn(),
      success: jest.fn(),
      warning: jest.fn(),
      write: jest.fn(),
      newline: jest.fn(),
      writeFormatted: jest.fn(),
      section: jest.fn(),
      keyValue: jest.fn(),
    } as unknown as jest.Mocked<IOutputWriter>;

    testCommand = new TestCommand(mockLogger, mockOutputWriter);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('constructor', () => {
    it('should initialize with a logger and output writer', () => {
      expect(testCommand).toBeInstanceOf(BaseCommand);
    });

    it('should use default ConsoleOutputWriter when no output writer provided', () => {
      const commandWithDefaultWriter = new TestCommand(mockLogger);
      expect(commandWithDefaultWriter).toBeInstanceOf(BaseCommand);
    });
  });

  describe('logInfo', () => {
    it.each([
      { message: 'Simple info message', description: 'simple message' },
      { message: 'Complex info message with details', description: 'complex message' },
      { message: '', description: 'empty message' },
      { message: 'Message with\nnewlines', description: 'message with newlines' },
    ])('should call outputWriter.info and logger.info for $description', ({ message }) => {
      testCommand['logInfo'](message);

      expect(mockOutputWriter.info).toHaveBeenCalledWith(message);
      expect(mockOutputWriter.info).toHaveBeenCalledTimes(1);
      expect(mockLogger.info).toHaveBeenCalledWith(message);
      expect(mockLogger.info).toHaveBeenCalledTimes(1);
    });

    it('should handle multiple calls correctly', () => {
      const messages = ['First message', 'Second message', 'Third message'];

      messages.forEach((message) => {
        testCommand['logInfo'](message);
      });

      expect(mockOutputWriter.info).toHaveBeenCalledTimes(3);
      expect(mockLogger.info).toHaveBeenCalledTimes(3);
      messages.forEach((message, index) => {
        expect(mockOutputWriter.info).toHaveBeenNthCalledWith(index + 1, message);
        expect(mockLogger.info).toHaveBeenNthCalledWith(index + 1, message);
      });
    });
  });

  describe('logError', () => {
    it.each([
      { message: 'Simple error message', description: 'simple message' },
      { message: 'Complex error message with details', description: 'complex message' },
      { message: '', description: 'empty message' },
      { message: 'Error with\nstack trace', description: 'message with newlines' },
    ])('should call outputWriter.error and logger.error for $description', ({ message }) => {
      testCommand['logError'](message);

      expect(mockOutputWriter.error).toHaveBeenCalledWith(message);
      expect(mockOutputWriter.error).toHaveBeenCalledTimes(1);
      expect(mockLogger.error).toHaveBeenCalledWith(message);
      expect(mockLogger.error).toHaveBeenCalledTimes(1);
    });

    it('should handle multiple calls correctly', () => {
      const messages = ['First error', 'Second error', 'Third error'];

      messages.forEach((message) => {
        testCommand['logError'](message);
      });

      expect(mockOutputWriter.error).toHaveBeenCalledTimes(3);
      expect(mockLogger.error).toHaveBeenCalledTimes(3);
      messages.forEach((message, index) => {
        expect(mockOutputWriter.error).toHaveBeenNthCalledWith(index + 1, message);
        expect(mockLogger.error).toHaveBeenNthCalledWith(index + 1, message);
      });
    });
  });

  describe('integration with output writer methods', () => {
    it('should properly integrate with output writer for success messages', () => {
      const message = 'Task completed successfully';
      testCommand['logInfo'](message);

      expect(mockOutputWriter.info).toHaveBeenCalledWith(message);
    });

    it('should properly integrate with output writer for error messages', () => {
      const message = 'Operation failed';
      testCommand['logError'](message);

      expect(mockOutputWriter.error).toHaveBeenCalledWith(message);
    });
  });
});
