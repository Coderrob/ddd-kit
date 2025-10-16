/* eslint-disable no-undefined */
import { Command } from 'commander';

import { container } from '../core/system/container';
import { CommandName, ILogger, IUIdSupersedeUseCase, SERVICE_KEYS } from '../types';

import { SupersedeCommand } from './supersede.command';

jest.mock('../../core/system/container');
jest.mock('commander');

describe('SupersedeCommand', () => {
  let mockLogger: jest.Mocked<ILogger>;
  let mockService: jest.Mocked<IUIdSupersedeUseCase>;
  let command: SupersedeCommand;

  beforeEach(() => {
    mockLogger = {
      info: jest.fn(),
      error: jest.fn(),
      warn: jest.fn(),
      debug: jest.fn(),
    } as unknown as jest.Mocked<ILogger>;

    mockService = {
      execute: jest.fn().mockResolvedValue(undefined),
    } as jest.Mocked<IUIdSupersedeUseCase>;

    (container.resolve as jest.Mock).mockReturnValue(mockService);

    command = new SupersedeCommand(mockLogger);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('execute', () => {
    it.each([
      {
        oldUid: 'OLD123',
        newUid: 'NEW456',
        description: 'valid UIDs',
      },
      {
        oldUid: 'ABC',
        newUid: 'XYZ',
        description: 'short UIDs',
      },
      {
        oldUid: 'old-uid-123',
        newUid: 'new-uid-456',
        description: 'dashed UIDs',
      },
    ])('should execute supersede successfully with $description', async ({ oldUid, newUid }) => {
      await command.execute({ oldUid, newUid });

      expect(mockLogger.info).toHaveBeenCalledWith('Executing supersede command', {
        newUid,
        oldUid,
      });
      expect(container.resolve).toHaveBeenCalledWith(SERVICE_KEYS.UID_SUPERSEDE);
      expect(mockService.execute).toHaveBeenCalledWith(oldUid, newUid);
      expect(mockLogger.info).toHaveBeenCalledWith(
        `Supersede command executed: ${oldUid} -> ${newUid}`,
        { newUid, oldUid },
      );
    });

    it('should handle service execution error', async () => {
      const error = new Error('Service error');
      mockService.execute.mockRejectedValue(error);

      await expect(command.execute({ oldUid: 'OLD123', newUid: 'NEW456' })).rejects.toThrow(
        'Service error',
      );

      expect(mockLogger.info).toHaveBeenCalledWith('Executing supersede command', {
        newUid: 'NEW456',
        oldUid: 'OLD123',
      });
      expect(mockService.execute).toHaveBeenCalledWith('OLD123', 'NEW456');
    });
  });

  describe('configure', () => {
    it('should configure the command correctly', () => {
      const mockParent = new Command();
      const mockCommand = {
        command: jest.fn().mockReturnThis(),
        argument: jest.fn().mockReturnThis(),
        description: jest.fn().mockReturnThis(),
        action: jest.fn().mockReturnThis(),
      };
      mockParent.command = jest.fn().mockReturnValue(mockCommand);

      SupersedeCommand.configure(mockParent, mockLogger);

      expect(mockParent.command).toHaveBeenCalledWith(CommandName.SUPERSEDE);
      expect(mockCommand.argument).toHaveBeenCalledWith('<oldUid>', 'Old UID');
      expect(mockCommand.argument).toHaveBeenCalledWith('<newUid>', 'New UID');
      expect(mockCommand.description).toHaveBeenCalledWith('Supersede an old UID with a new one');
      expect(mockCommand.action).toHaveBeenCalledWith(expect.any(Function));
    });
  });

  describe('properties', () => {
    it('should have correct name and description', () => {
      expect(command.name).toBe(CommandName.SUPERSEDE);
      expect(command.description).toBe('Supersede an old UID with a new one');
    });
  });
});
