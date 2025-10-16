import { Command } from 'commander';

import { ILogger, IOutputWriter } from '../types';

import { AddTaskCommand } from './add-task.command';
import { CommandFactory } from './command.factory';
import { CompleteTaskCommand } from './complete-task.command';
import { ListTasksCommand } from './list-tasks.command';
import { NextCommand } from './next.command';
import { RefAuditCommand } from './ref-audit.command';
import { RenderCommand } from './render.command';
import { ShowTaskCommand } from './show-task.command';
import { SupersedeCommand } from './supersede.command';
import { ValidateAndFixCommand } from './validate-and-fix.command';
import { ValidateTasksCommand } from './validate-tasks.command';

// Mock chalk to handle ES module import issues
jest.mock('chalk', () => ({
  default: {
    green: jest.fn((text) => text),
    yellow: jest.fn((text) => text),
    red: jest.fn((text) => text),
    blue: jest.fn((text) => text),
    bold: jest.fn((text) => text),
    dim: jest.fn((text) => text),
  },
  green: jest.fn((text) => text),
  yellow: jest.fn((text) => text),
  red: jest.fn((text) => text),
  blue: jest.fn((text) => text),
  bold: jest.fn((text) => text),
  dim: jest.fn((text) => text),
}));

// Mock all command modules
jest.mock('./add-task.command');
jest.mock('./complete-task.command');
jest.mock('./list-tasks.command');
jest.mock('./show-task.command');
jest.mock('./validate-and-fix.command');
jest.mock('./validate-tasks.command');
jest.mock('./next.command');
jest.mock('./render.command');
jest.mock('./ref-audit.command');
jest.mock('./supersede.command');

// Import mocked command classes

describe('CommandFactory', () => {
  let mockLogger: ILogger;
  let mockOutputWriter: IOutputWriter;
  let mockProgram: jest.Mocked<Command>;
  let mockRefCommand: jest.Mocked<Command>;
  let mockTaskCommand: jest.Mocked<Command>;
  let mockValidateCommand: jest.Mocked<Command>;

  beforeEach(() => {
    mockLogger = {} as ILogger; // Mock logger, assuming it's just passed through
    mockOutputWriter = {} as IOutputWriter; // Mock output writer

    mockRefCommand = {
      description: jest.fn().mockReturnThis(),
    } as unknown as jest.Mocked<Command>;

    mockTaskCommand = {
      description: jest.fn().mockReturnThis(),
    } as unknown as jest.Mocked<Command>;

    mockValidateCommand = {
      description: jest.fn().mockReturnThis(),
    } as unknown as jest.Mocked<Command>;

    mockProgram = {
      command: jest.fn(),
    } as unknown as jest.Mocked<Command>;

    // Mock the command method to return appropriate subcommands
    mockProgram.command.mockImplementation((name: string) => {
      if (name === 'ref') return mockRefCommand;
      if (name === 'task') return mockTaskCommand;
      if (name === 'validate') return mockValidateCommand;
      return mockProgram;
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('configureProgram', () => {
    it('should configure all commands correctly', () => {
      CommandFactory.configureProgram(mockProgram, mockLogger, mockOutputWriter);

      // Verify core commands are configured
      expect(NextCommand.configure).toHaveBeenCalledWith(mockProgram, mockLogger);
      expect(RenderCommand.configure).toHaveBeenCalledWith(mockProgram, mockLogger);
      expect(SupersedeCommand.configure).toHaveBeenCalledWith(mockProgram, mockLogger);

      // Verify ref subcommand is created and configured
      expect(mockProgram.command).toHaveBeenCalledWith('ref');
      expect(mockRefCommand.description).toHaveBeenCalledWith('Reference management');
      expect(RefAuditCommand.configure).toHaveBeenCalledWith(mockRefCommand, mockLogger);

      // Verify task subcommand is created and configured
      expect(mockProgram.command).toHaveBeenCalledWith('task');
      expect(mockTaskCommand.description).toHaveBeenCalledWith('Task management commands');
      expect(AddTaskCommand.configure).toHaveBeenCalledWith(
        mockTaskCommand,
        mockLogger,
        mockOutputWriter,
      );
      expect(CompleteTaskCommand.configure).toHaveBeenCalledWith(
        mockTaskCommand,
        mockLogger,
        mockOutputWriter,
      );
      expect(ListTasksCommand.configure).toHaveBeenCalledWith(
        mockTaskCommand,
        mockLogger,
        mockOutputWriter,
      );
      expect(ShowTaskCommand.configure).toHaveBeenCalledWith(
        mockTaskCommand,
        mockLogger,
        mockOutputWriter,
      );

      // Verify validate subcommand is created and configured
      expect(mockProgram.command).toHaveBeenCalledWith('validate');
      expect(mockValidateCommand.description).toHaveBeenCalledWith('Validation commands');
      expect(ValidateTasksCommand.configure).toHaveBeenCalledWith(mockValidateCommand, mockLogger);
      expect(ValidateAndFixCommand.configure).toHaveBeenCalledWith(
        mockValidateCommand,
        mockLogger,
        mockOutputWriter,
      );
    });
  });

  it('should handle missing output writer gracefully', () => {
    expect(() => {
      CommandFactory.configureProgram(mockProgram, mockLogger, null as any);
    }).not.toThrow();
  });

  it('should handle missing logger gracefully', () => {
    expect(() => {
      CommandFactory.configureProgram(mockProgram, null as any, mockOutputWriter);
    }).not.toThrow();
  });

  it('should configure task commands with output writer', () => {
    CommandFactory.configureProgram(mockProgram, mockLogger, mockOutputWriter);

    expect(AddTaskCommand.configure).toHaveBeenCalledWith(
      mockTaskCommand,
      mockLogger,
      mockOutputWriter,
    );
    expect(CompleteTaskCommand.configure).toHaveBeenCalledWith(
      mockTaskCommand,
      mockLogger,
      mockOutputWriter,
    );
  });

  it('should configure validation commands appropriately', () => {
    CommandFactory.configureProgram(mockProgram, mockLogger, mockOutputWriter);

    expect(ValidateTasksCommand.configure).toHaveBeenCalledWith(mockValidateCommand, mockLogger);
    expect(ValidateAndFixCommand.configure).toHaveBeenCalledWith(
      mockValidateCommand,
      mockLogger,
      mockOutputWriter,
    );
  });
});
