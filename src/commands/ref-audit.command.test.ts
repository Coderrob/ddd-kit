/* eslint-disable no-undefined */
import { Command } from 'commander';

import { container } from '../core/system/container';
import { CommandName, ILogger, IReferenceAuditUseCase, SERVICE_KEYS } from '../types';

import { RefAuditCommand } from './ref-audit.command';

jest.mock('../../core/system/container');
jest.mock('commander');

describe('RefAuditCommand', () => {
  let mockLogger: jest.Mocked<ILogger>;
  let mockService: jest.Mocked<IReferenceAuditUseCase>;
  let mockParentCommand: jest.Mocked<Command>;

  beforeEach(() => {
    mockLogger = {
      info: jest.fn(),
    } as unknown as jest.Mocked<ILogger>;

    mockService = {
      execute: jest.fn().mockResolvedValue(undefined),
    } as jest.Mocked<IReferenceAuditUseCase>;

    mockParentCommand = {
      command: jest.fn().mockReturnThis(),
      description: jest.fn().mockReturnThis(),
      action: jest.fn().mockReturnThis(),
    } as unknown as jest.Mocked<Command>;

    (container.resolve as jest.Mock).mockReturnValue(mockService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('execute', () => {
    it('should execute the command successfully', async () => {
      const cmd = new RefAuditCommand(mockLogger);
      await cmd.execute();

      expect(mockLogger.info).toHaveBeenCalledWith('Executing ref audit command');
      expect(container.resolve).toHaveBeenCalledWith(SERVICE_KEYS.REFERENCE_AUDIT);
      expect(mockService.execute).toHaveBeenCalled();
      expect(mockLogger.info).toHaveBeenCalledWith('Ref audit command executed');
    });

    it('should handle service execution error', async () => {
      const error = new Error('Service error');
      mockService.execute.mockRejectedValue(error);

      const cmd = new RefAuditCommand(mockLogger);

      await expect(cmd.execute()).rejects.toThrow('Service error');
      expect(mockLogger.info).toHaveBeenCalledWith('Executing ref audit command');
      expect(mockLogger.info).not.toHaveBeenCalledWith('Ref audit command executed');
    });
  });

  describe('configure', () => {
    it('should configure the command on parent', () => {
      RefAuditCommand.configure(mockParentCommand, mockLogger);

      expect(mockParentCommand.command).toHaveBeenCalledWith(CommandName.AUDIT);
      expect(mockParentCommand.description).toHaveBeenCalledWith(
        'Audit references across repo & tasks',
      );
      expect(mockParentCommand.action).toHaveBeenCalledWith(expect.any(Function));
    });
  });

  describe('properties', () => {
    it.each([
      { property: 'name', expected: CommandName.AUDIT },
      { property: 'description', expected: 'Audit references across repo & tasks' },
    ])('should have correct $property', ({ property, expected }) => {
      const cmd = new RefAuditCommand(mockLogger);
      expect(cmd[property as keyof RefAuditCommand]).toBe(expected);
    });
  });
});
