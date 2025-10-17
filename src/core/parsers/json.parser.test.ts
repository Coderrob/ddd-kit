import { IFileManager, ILogger } from '../../types';

import { formatJson, parseJsonFile, writeJsonFile, safeJsonParse } from './json.parser';

describe('json.parser', () => {
  let mockFileManager: jest.Mocked<IFileManager>;
  let mockLogger: jest.Mocked<ILogger>;

  afterEach(() => {
    jest.clearAllMocks();
  });

  beforeEach(() => {
    mockFileManager = {
      existsSync: jest.fn(),
      isReadable: jest.fn(),
      mkdir: jest.fn(),
      mkdirSync: jest.fn(),
      readFile: jest.fn(),
      readFileSync: jest.fn(),
      statSync: jest.fn(),
      writeFile: jest.fn(),
      writeFileSync: jest.fn(),
    } as unknown as jest.Mocked<IFileManager>;
    mockLogger = {
      debug: jest.fn(),
      error: jest.fn(),
      info: jest.fn(),
      warn: jest.fn(),
      child: jest.fn(),
    } as unknown as jest.Mocked<ILogger>;
  });

  describe('formatJson', () => {
    it('should format object as JSON string with default indent', () => {
      const obj = { key: 'value' };
      const result = formatJson(obj);
      expect(result).toBe('{"key":"value"}');
    });

    it('should format object as JSON string with specified indent', () => {
      const obj = { key: 'value' };
      const result = formatJson(obj, 2);
      expect(result).toBe('{\n  "key": "value"\n}');
    });
  });

  describe('parseJsonFile', () => {
    it('should parse valid JSON file and return object', () => {
      const filePath = 'test.json';
      const content = '{"key":"value"}';
      mockFileManager.readFileSync.mockReturnValue(content);
      const result = parseJsonFile(filePath, mockFileManager, mockLogger);
      expect(result).toEqual({ key: 'value' });
      expect(mockLogger.debug).toHaveBeenCalledWith('Parsed JSON file', { filePath });
    });

    it('should return null on invalid JSON and log error', () => {
      const filePath = 'test.json';
      const content = 'invalid json';
      mockFileManager.readFileSync.mockReturnValue(content);
      const result = parseJsonFile(filePath, mockFileManager, mockLogger);
      expect(result).toBeNull();
      expect(mockLogger.error).toHaveBeenCalledWith('Failed to parse JSON file', {
        error: expect.any(String),
        filePath,
      });
    });

    it('should use default logger if none provided', () => {
      const filePath = 'test.json';
      const content = '{"key":"value"}';
      mockFileManager.readFileSync.mockReturnValue(content);
      const result = parseJsonFile(filePath, mockFileManager);
      expect(result).toEqual({ key: 'value' });
    });
  });

  const writeError = () => {
    throw new Error('Write failed');
  };

  describe('writeJsonFile', () => {
    it('should write object to JSON file and return true', () => {
      const filePath = 'test.json';
      const data = { key: 'value' };
      const result = writeJsonFile(filePath, data, mockFileManager, mockLogger);
      expect(result).toBe(true);
      expect(mockFileManager.writeFileSync).toHaveBeenCalledWith(filePath, '{"key":"value"}');
      expect(mockLogger.debug).toHaveBeenCalledWith('Wrote JSON file', { filePath });
    });

    it('should return false on write error and log error', () => {
      const filePath = 'test.json';
      const data = { key: 'value' };
      mockFileManager.writeFileSync.mockImplementation(writeError);
      const result = writeJsonFile(filePath, data, mockFileManager, mockLogger);
      expect(result).toBe(false);
      expect(mockLogger.error).toHaveBeenCalledWith('Failed to write JSON file', {
        error: 'Error: Write failed',
        filePath,
      });
    });

    it('should use default logger if none provided', () => {
      const filePath = 'test.json';
      const data = { key: 'value' };
      const result = writeJsonFile(filePath, data, mockFileManager);
      expect(result).toBe(true);
      expect(mockFileManager.writeFileSync).toHaveBeenCalledWith(filePath, '{"key":"value"}');
    });
  });

  describe('safeJsonParse', () => {
    it('should parse valid JSON string and return object', () => {
      const jsonString = '{"key":"value"}';
      const result = safeJsonParse(jsonString, mockLogger);
      expect(result).toEqual({ key: 'value' });
    });

    it('should return null on invalid JSON and log warning', () => {
      const jsonString = 'invalid json';
      const result = safeJsonParse(jsonString, mockLogger);
      expect(result).toBeNull();
      expect(mockLogger.warn).toHaveBeenCalledWith('Failed to parse JSON string', {
        error: expect.any(String),
      });
    });

    it('should use default logger if none provided', () => {
      const jsonString = '{"key":"value"}';
      const result = safeJsonParse(jsonString);
      expect(result).toEqual({ key: 'value' });
    });
  });
});
