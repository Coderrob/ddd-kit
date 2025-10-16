import * as path from 'path';

import { parseJsonFile } from '../parsers/json.parser';
import { FileManager } from '../storage';

import { safeGet } from './object.helper';
import { Resolver } from './uid-resolver';
import { isString } from './type.helper';

// Mock dependencies
jest.mock('../storage');
jest.mock('../parsers/json.parser');
jest.mock('./object.helper');
jest.mock('./type.helper');

describe('Resolver', () => {
  let resolver: Resolver;

  const dddKitPath = '/path/to/ddd-kit';
  const mockFileManager = FileManager as jest.MockedClass<typeof FileManager>;
  const mockParseJsonFile = parseJsonFile as jest.MockedFunction<typeof parseJsonFile>;
  const mockSafeGet = safeGet as jest.MockedFunction<typeof safeGet>;
  const mockIsString = isString as jest.MockedFunction<typeof isString>;

  afterEach(() => {
    jest.clearAllMocks();
  });

  beforeEach(() => {
    mockFileManager.prototype.existsSync.mockReturnValue(true);
    mockFileManager.prototype.readFileSync.mockReturnValue('content');
    mockParseJsonFile.mockReturnValue({});
    mockSafeGet.mockReturnValue(void 0);
    mockIsString.mockReturnValue(false);
  });

  describe('constructor', () => {
    it('should initialize and load catalogs', () => {
      const registryPath = path.join(dddKitPath, 'standards', 'catalogs', 'registry.json');
      const aliasesPath = path.join(dddKitPath, 'standards', 'catalogs', 'aliases.json');

      new Resolver(dddKitPath);

      expect(mockFileManager.prototype.existsSync).toHaveBeenCalledWith(registryPath);
      expect(mockFileManager.prototype.existsSync).toHaveBeenCalledWith(aliasesPath);
      expect(mockParseJsonFile).toHaveBeenCalledWith(registryPath, expect.any(FileManager));
      expect(mockParseJsonFile).toHaveBeenCalledWith(aliasesPath, expect.any(FileManager));
    });
  });

  describe('resolve', () => {
    beforeEach(() => {
      resolver = new Resolver(dddKitPath);
    });

    it('should return null if UID not in registry', () => {
      mockSafeGet.mockReturnValueOnce(void 0); // for aliases
      mockSafeGet.mockReturnValueOnce(void 0); // for registry

      const result = resolver.resolve('nonexistent');

      expect(result).toBeNull();
    });

    it('should resolve UID with alias', () => {
      const entry = { path: 'some/path', status: 'active', requires: [] };
      mockSafeGet.mockReturnValueOnce('actualUid'); // alias
      mockIsString.mockReturnValueOnce(true);
      mockSafeGet.mockReturnValueOnce(entry); // registry
      mockFileManager.prototype.existsSync.mockReturnValue(true);

      const result = resolver.resolve('aliasUid');

      expect(result).toEqual({ content: 'content', path: 'some/path', status: 'active' });
    });

    it('should resolve UID without alias', () => {
      const entry = { path: 'some/path', status: 'active', requires: [] };
      mockSafeGet.mockReturnValueOnce(void 0); // no alias
      mockSafeGet.mockReturnValueOnce(entry); // registry

      const result = resolver.resolve('directUid');

      expect(result).toEqual({ content: 'content', path: 'some/path', status: 'active' });
    });

    it('should return null if file does not exist', () => {
      const entry = { path: 'some/path', status: 'active', requires: [] };
      mockSafeGet.mockReturnValueOnce(void 0);
      mockSafeGet.mockReturnValueOnce(entry);
      mockFileManager.prototype.existsSync.mockReturnValue(false);

      const result = resolver.resolve('uid');

      expect(result).toBeNull();
    });
  });

  describe('getRequires', () => {
    beforeEach(() => {
      resolver = new Resolver(dddKitPath);
    });

    it('should return empty array if UID not found', () => {
      mockSafeGet.mockReturnValue(void 0);

      const result = resolver.getRequires('nonexistent');

      expect(result).toEqual([]);
    });

    it('should return requires for UID', () => {
      const entry = { path: 'path', status: 'active', requires: ['req1', 'req2'] };
      mockSafeGet.mockReturnValue(entry);

      const result = resolver.getRequires('uid');

      expect(result).toEqual(['req1', 'req2']);
    });
  });

  describe('getAllUids', () => {
    it('should return all UIDs from registry', () => {
      const registry = { uid1: {}, uid2: {} };
      mockParseJsonFile.mockReturnValueOnce(registry);
      resolver = new Resolver(dddKitPath);

      const result = resolver.getAllUids();

      expect(result).toEqual(['uid1', 'uid2']);
    });
  });

  describe('getRegistry', () => {
    it('should return registry with details', () => {
      const registry = {
        uid1: { path: 'path1', status: 'active', requires: ['req1'] },
        uid2: { path: 'path2', status: 'inactive', requires: [] },
      };
      mockParseJsonFile.mockReturnValueOnce(registry);
      resolver = new Resolver(dddKitPath);

      const result = resolver.getRegistry();

      expect(result).toEqual({
        uid1: { requires: ['req1'], status: 'active' },
        uid2: { requires: [], status: 'inactive' },
      });
    });
  });

  describe('updateAlias', () => {
    it('should update alias mapping', () => {
      resolver = new Resolver(dddKitPath);

      resolver.updateAlias('oldUid', 'newUid');

      expect(resolver['aliases']['oldUid']).toBe('newUid');
    });
  });
});
