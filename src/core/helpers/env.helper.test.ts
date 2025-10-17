/* eslint-disable max-nested-callbacks */
/* eslint-disable no-undefined */
import { ProcessEnvironmentAccessor } from './env.helper';

describe('ProcessEnvironmentAccessor', () => {
  let accessor: ProcessEnvironmentAccessor;

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('constructor', () => {
    it('should use provided env object', () => {
      const mockEnv: Record<string, string | undefined> = { TEST_KEY: 'test_value' };
      accessor = new ProcessEnvironmentAccessor(mockEnv);
      expect(accessor.get('TEST_KEY')).toBe('test_value');
    });

    it('should default to process.env if no env provided', () => {
      accessor = new ProcessEnvironmentAccessor();
      expect(accessor).toBeInstanceOf(ProcessEnvironmentAccessor);
    });
  });

  describe('get', () => {
    beforeEach(() => {
      const mockEnv: Record<string, string | undefined> = {
        EXISTING_KEY: 'value',
        EMPTY_KEY: '',
        UNDEFINED_KEY: undefined as string | undefined,
      };
      accessor = new ProcessEnvironmentAccessor(mockEnv);
    });

    it('should return the value if key exists and is non-empty string', () => {
      expect(accessor.get('EXISTING_KEY')).toBe('value');
    });

    it('should return undefined if key exists but value is empty string', () => {
      expect(accessor.get('EMPTY_KEY')).toBeUndefined();
    });

    it('should return undefined if key does not exist', () => {
      expect(accessor.get('NON_EXISTING_KEY')).toBeUndefined();
    });

    it('should return undefined if key exists but value is undefined', () => {
      expect(accessor.get('UNDEFINED_KEY')).toBeUndefined();
    });
  });

  describe('getOrDefault', () => {
    beforeEach(() => {
      const mockEnv: Record<string, string | undefined> = {
        EXISTING_KEY: 'value',
        EMPTY_KEY: '',
      };
      accessor = new ProcessEnvironmentAccessor(mockEnv);
    });

    it('should return the value if key exists and is non-empty', () => {
      expect(accessor.getOrDefault('EXISTING_KEY', 'default')).toBe('value');
    });

    it('should return default if key exists but value is empty', () => {
      expect(accessor.getOrDefault('EMPTY_KEY', 'default')).toBe('default');
    });

    it('should return default if key does not exist', () => {
      expect(accessor.getOrDefault('NON_EXISTING_KEY', 'default')).toBe('default');
    });
  });

  describe('require', () => {
    beforeEach(() => {
      const mockEnv: Record<string, string | undefined> = {
        EXISTING_KEY: 'value',
        EMPTY_KEY: '',
      };
      accessor = new ProcessEnvironmentAccessor(mockEnv);
    });

    it('should return the value if key exists and is non-empty', () => {
      expect(accessor.require('EXISTING_KEY')).toBe('value');
    });

    it('should return default if key exists but value is empty and default is provided', () => {
      expect(accessor.require('EMPTY_KEY', 'default')).toBe('default');
    });

    it('should return default if key does not exist and default is provided', () => {
      expect(accessor.require('NON_EXISTING_KEY', 'default')).toBe('default');
    });

    it('should throw error if key exists but value is empty and no default provided', () => {
      expect(() => accessor.require('EMPTY_KEY')).toThrow(
        "Environment variable 'EMPTY_KEY' is not set or empty",
      );
    });

    it('should throw error if key does not exist and no default provided', () => {
      expect(() => accessor.require('NON_EXISTING_KEY')).toThrow(
        "Environment variable 'NON_EXISTING_KEY' is not set or empty",
      );
    });
  });
});
