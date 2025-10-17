import { dump, load } from 'js-yaml';

import { IFileManager, ILogger, UpdateYamlBlockOptions } from '../../types';

import {
  addYamlBlockFromFile,
  dumpYaml,
  extractYamlBlocks,
  parseYamlBlock,
  parseYamlBlocksFromFile,
  removeYamlBlockById,
  updateYamlBlockById,
} from './yaml.parser';

// Mock dependencies
jest.mock('js-yaml', () => ({
  dump: jest.fn(),
  load: jest.fn(),
  JSON_SCHEMA: {},
}));

jest.mock('../system/logger', () => ({
  getLogger: jest.fn(() => ({
    warn: jest.fn(),
    info: jest.fn(),
    debug: jest.fn(),
    error: jest.fn(),
  })),
}));

const throwInvalidYaml = (): never => {
  throw new Error('Invalid YAML');
};

describe('yaml.parser', () => {
  let mockFileSystem: jest.Mocked<IFileManager>;
  let mockLogger: jest.Mocked<ILogger>;

  afterEach(() => {
    jest.clearAllMocks();
  });

  beforeEach(() => {
    mockFileSystem = {
      existsSync: jest.fn(),
      readFileSync: jest.fn(),
      writeFileSync: jest.fn(),
    } as unknown as jest.Mocked<IFileManager>;

    mockLogger = {
      warn: jest.fn(),
      info: jest.fn(),
      debug: jest.fn(),
      error: jest.fn(),
    } as unknown as jest.Mocked<ILogger>;
  });

  describe('extractYamlBlocks', () => {
    it('should extract YAML blocks from markdown', () => {
      const md = `---
key: value
---
Some text
---
key2: value2
---`;
      const result = extractYamlBlocks(md);
      expect(result).toEqual(['key: value', 'key2: value2']);
    });

    it('should return empty array if no blocks', () => {
      const md = 'No YAML here';
      const result = extractYamlBlocks(md);
      expect(result).toEqual([]);
    });

    it('should handle CRLF', () => {
      const md = '---\r\nkey: value\r\n---';
      const result = extractYamlBlocks(md);
      expect(result).toEqual(['key: value']);
    });
  });

  describe('parseYamlBlock', () => {
    it('should parse valid YAML block', () => {
      (load as jest.Mock).mockReturnValue({ key: 'value' });
      const result = parseYamlBlock('key: value', mockLogger);
      expect(result).toEqual({ key: 'value' });
      expect(load).toHaveBeenCalledWith('key: value', { schema: {} });
    });

    it('should return null for invalid YAML', () => {
      (load as jest.Mock).mockImplementation(throwInvalidYaml);
      const result = parseYamlBlock('invalid: yaml: :', mockLogger);
      expect(result).toBeNull();
      expect(mockLogger.warn).toHaveBeenCalled();
    });

    it('should return null if not an object', () => {
      (load as jest.Mock).mockReturnValue('string');
      const result = parseYamlBlock('string', mockLogger);
      expect(result).toBeNull();
    });
  });

  describe('dumpYaml', () => {
    it('should dump object to YAML string', () => {
      (dump as jest.Mock).mockReturnValue('key: value\n');
      const result = dumpYaml({ key: 'value' });
      expect(result).toBe('key: value\n');
      expect(dump).toHaveBeenCalledWith({ key: 'value' });
    });
  });

  describe('addYamlBlockFromFile', () => {
    it('should add YAML block from source to target', () => {
      mockFileSystem.existsSync.mockReturnValue(true);
      mockFileSystem.readFileSync
        .mockReturnValueOnce('---\nkey: value\n---')
        .mockReturnValueOnce('existing content\n');
      const result = addYamlBlockFromFile('source.md', 'target.md', mockFileSystem, mockLogger);
      expect(result).toBe(true);
      expect(mockFileSystem.writeFileSync).toHaveBeenCalledWith(
        'target.md',
        'existing content\n---\nkey: value\n---\n',
      );
      expect(mockLogger.info).toHaveBeenCalled();
    });

    it('should return false if source file does not exist', () => {
      mockFileSystem.existsSync.mockReturnValue(false);
      const result = addYamlBlockFromFile('source.md', 'target.md', mockFileSystem, mockLogger);
      expect(result).toBe(false);
    });

    it('should return false if no YAML block in source', () => {
      mockFileSystem.existsSync.mockReturnValue(true);
      mockFileSystem.readFileSync.mockReturnValue('no yaml');
      const result = addYamlBlockFromFile('source.md', 'target.md', mockFileSystem, mockLogger);
      expect(result).toBe(false);
    });
  });

  describe('parseYamlBlocksFromFile', () => {
    it('should parse all YAML blocks from file', () => {
      mockFileSystem.readFileSync.mockReturnValue('---\nkey: value\n---\n---\nkey2: value2\n---');
      (load as jest.Mock)
        .mockReturnValueOnce({ key: 'value' })
        .mockReturnValueOnce({ key2: 'value2' });
      const result = parseYamlBlocksFromFile('file.md', mockFileSystem, mockLogger);
      expect(result).toEqual([{ key: 'value' }, { key2: 'value2' }]);
      expect(mockLogger.debug).toHaveBeenCalled();
    });

    it('should skip invalid blocks', () => {
      mockFileSystem.readFileSync.mockReturnValue('---\nkey: value\n---\n---\ninvalid\n---');
      (load as jest.Mock).mockReturnValueOnce({ key: 'value' }).mockReturnValueOnce(null);
      const result = parseYamlBlocksFromFile('file.md', mockFileSystem, mockLogger);
      expect(result).toEqual([{ key: 'value' }]);
    });
  });

  describe('updateYamlBlockById', () => {
    it('should update YAML block by ID', () => {
      mockFileSystem.readFileSync.mockReturnValue(
        '---\n---\nid: 1\nkey: old\n---\n---\nid: 2\n---',
      );
      (load as jest.Mock).mockReturnValue({ id: '1', key: 'old' });
      (dump as jest.Mock).mockReturnValue('id: 1\nkey: new\n');
      const options: UpdateYamlBlockOptions = {
        filePath: 'file.md',
        id: '1',
        updatedData: { key: 'new' },
        fileSystem: mockFileSystem,
        logger: mockLogger,
      };
      const result = updateYamlBlockById(options);
      expect(result).toBe(true);
      expect(mockFileSystem.writeFileSync).toHaveBeenCalled();
      expect(mockLogger.info).toHaveBeenCalled();
    });

    it('should return false if ID not found', () => {
      mockFileSystem.readFileSync.mockReturnValue('---\n---\nid: 1\n---');
      const options: UpdateYamlBlockOptions = {
        filePath: 'file.md',
        id: '2',
        updatedData: { key: 'new' },
        fileSystem: mockFileSystem,
        logger: mockLogger,
      };
      const result = updateYamlBlockById(options);
      expect(result).toBe(false);
      expect(mockLogger.warn).toHaveBeenCalled();
    });
  });

  describe('removeYamlBlockById', () => {
    it('should remove YAML block by ID', () => {
      mockFileSystem.readFileSync.mockReturnValue(
        '---\n---\nid: 1\nkey: value\n---\n---\nid: 2\n---',
      );
      (load as jest.Mock).mockReturnValue({ id: '1' });
      const result = removeYamlBlockById('file.md', mockFileSystem, '1', mockLogger);
      expect(result).toBe(true);
      expect(mockFileSystem.writeFileSync).toHaveBeenCalled();
      expect(mockLogger.info).toHaveBeenCalled();
    });

    it('should return false if ID not found', () => {
      mockFileSystem.readFileSync.mockReturnValue('---\n---\nid: 1\n---');
      (load as jest.Mock).mockReturnValue({ id: '1' });
      const result = removeYamlBlockById('file.md', mockFileSystem, '2', mockLogger);
      expect(result).toBe(false);
      expect(mockLogger.warn).toHaveBeenCalled();
    });
  });
});
