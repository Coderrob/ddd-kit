/* eslint-disable max-nested-callbacks */
import { safeGet, safeGetRequired } from './object.helper';

describe('object.helper', () => {
  describe('safeGet', () => {
    const negativeCases: ReadonlyArray<{ description: string; obj: unknown; key: string }> = [
      { description: 'null object', obj: null, key: 'key' },
      { description: 'undefined object', obj: void 0, key: 'key' },
      { description: 'string input', obj: 'string', key: 'key' },
      { description: 'number input', obj: 42, key: 'key' },
      { description: 'array input', obj: [], key: 'key' },
      { description: 'missing key', obj: { a: 1 }, key: 'b' },
    ];

    const positiveCases: ReadonlyArray<{
      description: string;
      obj: Record<string, unknown>;
      key: string;
      expected: unknown;
    }> = [
      {
        description: 'existing numeric property',
        obj: { a: 1, b: 'test' },
        key: 'a',
        expected: 1,
      },
      {
        description: 'existing string property',
        obj: { a: 1, b: 'test' },
        key: 'b',
        expected: 'test',
      },
      {
        description: 'nested object property',
        obj: { nested: { value: 'deep' } },
        key: 'nested',
        expected: { value: 'deep' },
      },
    ];

    it.each(negativeCases)('returns undefined for $description', ({ obj, key }) => {
      expect(safeGet(obj as Record<string, unknown> | null | undefined, key)).toBeUndefined();
    });

    it.each(positiveCases)('returns expected value for $description', ({ obj, key, expected }) => {
      expect(safeGet(obj, key)).toEqual(expected);
    });
  });

  describe('safeGetRequired', () => {
    const negativeCases: ReadonlyArray<{
      description: string;
      obj: unknown;
      key: string;
      message?: string;
    }> = [
      { description: 'null object', obj: null, key: 'key' },
      { description: 'undefined object', obj: void 0, key: 'key' },
      { description: 'non-object input', obj: 'string', key: 'key' },
      { description: 'missing key with default message', obj: { a: 1 }, key: 'b' },
      {
        description: 'missing key with custom message',
        obj: { a: 1 },
        key: 'b',
        message: 'Custom error',
      },
    ];

    const positiveCases: ReadonlyArray<{
      description: string;
      obj: Record<string, unknown>;
      key: string;
      expected: unknown;
    }> = [
      {
        description: 'existing numeric property',
        obj: { a: 1, b: 'test' },
        key: 'a',
        expected: 1,
      },
      {
        description: 'existing string property',
        obj: { a: 1, b: 'test' },
        key: 'b',
        expected: 'test',
      },
      {
        description: 'nested object property',
        obj: { nested: { value: 'deep' } },
        key: 'nested',
        expected: { value: 'deep' },
      },
    ];

    it.each(negativeCases)('throws when $description', ({ obj, key, message }) => {
      const expectedMessage = message ?? `Required property '${key}' is missing`;
      expect(() =>
        safeGetRequired(obj as Record<string, unknown> | null | undefined, key, message),
      ).toThrow(expectedMessage);
    });

    it.each(positiveCases)('returns expected value when $description', ({ obj, key, expected }) => {
      expect(safeGetRequired(obj, key)).toEqual(expected);
    });
  });
});
