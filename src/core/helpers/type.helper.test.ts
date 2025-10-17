/* eslint-disable no-undefined */
import {
  isString,
  isObject,
  isEmptyString,
  isNonEmptyString,
  isNullOrUndefined,
  isTask,
} from './type.helper';

describe('type.helper', () => {
  describe('isString', () => {
    it.each([
      ['hello', true],
      ['', true],
      ['  ', true],
      [123, false],
      [null, false],
      [undefined, false],
      [{}, false],
      [[], false],
      [true, false],
      [new Date(), false],
    ])('should return %s for %p', (value, expected) => {
      expect(isString(value)).toBe(expected);
    });
  });

  describe('isObject', () => {
    it.each([
      [{}, true],
      [{ key: 'value' }, true],
      [{ nested: { obj: true } }, true],
      [null, false],
      [undefined, false],
      ['string', false],
      [123, false],
      [[], false],
      [new Date(), true],
      [true, false],
      [() => {}, false],
    ])('should return %s for %p', (value, expected) => {
      expect(isObject(value)).toBe(expected);
    });
  });

  describe('isEmptyString', () => {
    it.each([
      ['', true],
      ['a', false],
      [' ', false],
      [null, false],
      [undefined, false],
      [123, false],
      [{}, false],
      [[], false],
      [true, false],
    ])('should return %s for %p', (value, expected) => {
      expect(isEmptyString(value)).toBe(expected);
    });
  });

  describe('isNonEmptyString', () => {
    it.each([
      ['hello', true],
      ['  hello  ', true],
      ['a', true],
      ['   x   ', true],
      ['', false],
      ['   ', false],
      [null, false],
      [undefined, false],
      [123, false],
      [{}, false],
      [[], false],
      [true, false],
    ])('should return %s for %p', (value, expected) => {
      expect(isNonEmptyString(value)).toBe(expected);
    });
  });

  describe('isNullOrUndefined', () => {
    it.each([
      [null, true],
      [undefined, true],
      ['', false],
      [0, false],
      [false, false],
      [{}, false],
      [[], false],
      ['string', false],
      [123, false],
    ])('should return %s for %p', (value, expected) => {
      expect(isNullOrUndefined(value)).toBe(expected);
    });
  });

  describe('isTask', () => {
    it.each([
      [{ id: '123', title: 'Test Task' }, true],
      [{ id: 'abc', description: 'Another task' }, true],
      [{ id: '  valid  ', other: 'prop' }, true],
      [null, false],
      [undefined, false],
      ['string', false],
      [{}, false],
      [{ id: '' }, false],
      [{ id: '   ' }, false],
      [{ id: 123 }, false],
      [{ id: null }, false],
      [{ id: undefined }, false],
      [{ title: 'No id' }, false],
      [[], false],
      [true, false],
    ])('should return %s for %p', (value, expected) => {
      expect(isTask(value)).toBe(expected);
    });
  });
});
