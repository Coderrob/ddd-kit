import { Command } from 'commander';

import { TaskManager } from '../core/storage';
import { AddTaskArgs, CommandName, EXIT_CODES, ILogger, IOutputWriter } from '../types';

import { AddTaskCommand } from './add-task.command';

// Mock dependencies
jest.mock('../core/storage');
jest.mock('commander');

describe('AddTaskCommand', () => {
  let logger: jest.Mocked<ILogger>;
  let outputWriter: jest.Mocked<IOutputWriter>;
  let command: AddTaskCommand;
  let mockTaskManager: jest.Mocked<TaskManager>;

  beforeEach(() => {
    logger = {
      info: jest.fn(),
      error: jest.fn(),
      warn: jest.fn(),
      debug: jest.fn(),
      child: jest.fn(),
    } as jest.Mocked<ILogger>;

    outputWriter = {
      info: jest.fn(),
      error: jest.fn(),
      success: jest.fn(),
      warning: jest.fn(),
      write: jest.fn(),
      newline: jest.fn(),
      writeFormatted: jest.fn(),
      section: jest.fn(),
      keyValue: jest.fn(),
    } as jest.Mocked<IOutputWriter>;

    mockTaskManager = {
      addTaskFromFile: jest.fn(),
    } as unknown as jest.Mocked<TaskManager>;

    // Mock the TaskManager constructor
    (TaskManager as jest.MockedClass<typeof TaskManager>).mockImplementation(() => mockTaskManager);

    command = new AddTaskCommand(logger, outputWriter);
    jest.clearAllMocks();
  });

  describe('execute', () => {
    const args: AddTaskArgs = { file: 'test-task.md' };

    it('should handle successful task addition', async () => {
      mockTaskManager.addTaskFromFile.mockReturnValue(true);

      await command.execute(args);

      expect(mockTaskManager.addTaskFromFile).toHaveBeenCalledWith(args.file);
      expect(outputWriter.success).toHaveBeenCalledWith(`Task added to TODO.md from ${args.file}`);
      expect(logger.info).toHaveBeenCalledWith('Task added successfully', { file: args.file });
      expect(process.exitCode).toBeUndefined();
    });

    it('should handle failed task addition', async () => {
      mockTaskManager.addTaskFromFile.mockReturnValue(false);

      await command.execute(args);

      expect(mockTaskManager.addTaskFromFile).toHaveBeenCalledWith(args.file);
      expect(logger.error).toHaveBeenCalledWith(`Failed to add task from ${args.file}`, {
        file: args.file,
      });
      expect(process.exitCode).toBe(EXIT_CODES.GENERAL_ERROR);
    });

    it('should handle errors during task addition', async () => {
      const error = new Error('File not found');
      const mockImplementation = () => {
        throw error;
      };
      mockTaskManager.addTaskFromFile.mockImplementation(mockImplementation);

      await command.execute(args);

      expect(mockTaskManager.addTaskFromFile).toHaveBeenCalledWith(args.file);
      expect(logger.error).toHaveBeenCalledWith(`Error adding task: ${error.message}`, {
        error: error.message,
        file: args.file,
      });
      expect(process.exitCode).toBe(EXIT_CODES.NOT_FOUND);
    });

    it('should handle unknown errors during task addition', async () => {
      const error = 'Unknown error';
      const mockImplementation = () => {
        throw error;
      };
      mockTaskManager.addTaskFromFile.mockImplementation(mockImplementation);

      await command.execute(args);

      expect(mockTaskManager.addTaskFromFile).toHaveBeenCalledWith(args.file);
      expect(logger.error).toHaveBeenCalledWith(`Error adding task: ${error}`, {
        error: error,
        file: args.file,
      });
      expect(process.exitCode).toBe(EXIT_CODES.NOT_FOUND);
    });
  });

  describe('configure', () => {
    it('should configure the command with Commander.js', () => {
      const parent = {
        command: jest.fn().mockReturnValue({
          argument: jest.fn().mockReturnThis(),
          description: jest.fn().mockReturnThis(),
          action: jest.fn().mockReturnThis(),
        }),
      } as unknown as Command;

      AddTaskCommand.configure(parent, logger, outputWriter);

      expect(parent.command).toHaveBeenCalledWith(CommandName.ADD);
      // Additional assertions can be added if needed for argument and action setup
    });
  });
});
