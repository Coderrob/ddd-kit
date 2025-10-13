/* eslint-disable no-undefined */
import { Command } from 'commander';

import { container } from '../../core/system/container';
import { SERVICE_KEYS } from '../../types/core';
import { RenderCommandOptions } from '../../types/rendering';
import { ILogger } from '../../types/observability';
import { IRenderOptions } from '../../types/tasks';
import { CommandName, ITaskRenderUseCase } from '../../types';

import { RenderCommand } from './render.command';

jest.mock('../../core/system/container');
jest.mock('commander');

describe('RenderCommand', () => {
  let mockLogger: jest.Mocked<ILogger>;
  let mockService: jest.Mocked<ITaskRenderUseCase>;
  let mockProgram: jest.Mocked<Command>;

  beforeEach(() => {
    mockLogger = {
      info: jest.fn(),
      error: jest.fn(),
    } as unknown as jest.Mocked<ILogger>;

    mockService = {
      execute: jest.fn(),
    } as jest.Mocked<ITaskRenderUseCase>;

    (container.resolve as jest.Mock).mockReturnValue(mockService);

    mockProgram = {
      command: jest.fn().mockReturnThis(),
      argument: jest.fn().mockReturnThis(),
      description: jest.fn().mockReturnThis(),
      option: jest.fn().mockReturnThis(),
      action: jest.fn(),
    } as unknown as jest.Mocked<Command>;
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('execute', () => {
    it('should execute render command successfully', async () => {
      const command = new RenderCommand(mockLogger);
      const options: IRenderOptions & { taskId: string } = {
        taskId: 'task-123',
        pin: 'abc123',
      };

      mockService.execute.mockResolvedValue(undefined);

      await command.execute(options);

      expect(mockLogger.info).toHaveBeenCalledWith('Executing render command', {
        taskId: 'task-123',
        pin: 'abc123',
      });
      expect(container.resolve).toHaveBeenCalledWith(SERVICE_KEYS.TASK_RENDERER);
      expect(mockService.execute).toHaveBeenCalledWith('task-123', { pin: 'abc123' });
      expect(mockLogger.info).toHaveBeenCalledWith('Task rendered successfully', {
        taskId: 'task-123',
      });
      expect(mockLogger.error).not.toHaveBeenCalled();
    });

    it('should handle errors during execution', async () => {
      const command = new RenderCommand(mockLogger);
      const options: IRenderOptions & { taskId: string } = {
        taskId: 'task-123',
      };
      const error = new Error('Render failed');

      mockService.execute.mockRejectedValue(error);

      await expect(command.execute(options)).rejects.toThrow(error);

      expect(mockLogger.info).toHaveBeenCalledWith('Executing render command', {
        taskId: 'task-123',
      });
      expect(container.resolve).toHaveBeenCalledWith(SERVICE_KEYS.TASK_RENDERER);
      expect(mockService.execute).toHaveBeenCalledWith('task-123', {});
      expect(mockLogger.error).toHaveBeenCalledWith('Failed to execute render command', {
        error: 'Error: Render failed',
        taskId: 'task-123',
      });
      expect(mockLogger.info).toHaveBeenCalledTimes(1); // Only the initial log
    });
  });

  describe('configure', () => {
    it('should configure the command correctly', () => {
      RenderCommand.configure(mockProgram, mockLogger);

      expect(mockProgram.command).toHaveBeenCalledWith(CommandName.RENDER);
      expect(mockProgram.argument).toHaveBeenCalledWith('<task>', 'Task ID to render');
      expect(mockProgram.description).toHaveBeenCalledWith(
        'Re-render guidance for a specific task',
      );
      expect(mockProgram.option).toHaveBeenCalledWith(
        '--pin <sha>',
        'Pin to specific ddd-kit commit/tag',
      );
      expect(mockProgram.action).toHaveBeenCalledWith(expect.any(Function));

      // Test the action function
      const actionFn = mockProgram.action.mock.calls[0]?.[0];
      const mockOptions: RenderCommandOptions = { pin: 'def456' };
      expect(actionFn).toBeInstanceOf(Function);
      actionFn?.('task-456', mockOptions);

      expect(container.resolve).toHaveBeenCalledWith(SERVICE_KEYS.TASK_RENDERER);
      expect(mockService.execute).toHaveBeenCalledWith('task-456', mockOptions);
    });
  });
});
