/* eslint-disable no-undefined */
import { isEmptyArray } from './array.helper';

describe('array.helper', () => {
  describe('isEmptyArray', () => {
    const cases: ReadonlyArray<{ value: unknown; expected: boolean; description: string }> = [
      { value: [], expected: true, description: 'an empty array' },
      { value: [1, 2, 3], expected: false, description: 'a non-empty array' },
      { value: '', expected: false, description: 'a string' },
      { value: {}, expected: false, description: 'an object' },
      { value: null, expected: false, description: 'null' },
      { value: undefined, expected: false, description: 'undefined' },
      { value: 0, expected: false, description: 'a number' },
    ];

    it.each(cases)('returns $expected for $description', ({ value, expected }) => {
      expect(isEmptyArray(value)).toBe(expected);
    });
  });
});
