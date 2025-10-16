import { normalizeToIso } from './date.helper';

describe('date.helper', () => {
  const validDateInputs = [
    ['2023-01-01'],
    ['2023-01-01T00:00:00Z'],
    ['2023-12-31T23:59:59.999Z'],
    ['2020-02-29'], // Leap year
  ] as const;

  const invalidDateInputs = [
    [void 0],
    [''],
    ['invalid-date'],
    ['2023-13-01'], // Invalid month
    ['2023-01-32'], // Invalid day
    ['not-a-date'],
    ['123'], // Number string
  ] as const;

  it.each(validDateInputs)('isValidDate returns true for %s', (value) => {
    const result = !Number.isNaN(Date.parse(value));
    expect(result).toBe(true);
  });

  it.each(invalidDateInputs)('isValidDate returns false for %s', (value) => {
    const result =
      value === void 0 ||
      value === '' ||
      (typeof value === 'string' && Number.isNaN(Date.parse(value)));
    expect(result).toBe(true);
  });

  describe('normalizeToIso', () => {
    const nowIso = '2023-01-01T00:00:00.000Z';

    const normalizePositiveCases = [
      ['2023-01-01', '2023-01-01T00:00:00.000Z'],
      ['2023-01-01T12:30:45Z', '2023-01-01T12:30:45.000Z'],
      ['2023-12-31T23:59:59.999Z', '2023-12-31T23:59:59.999Z'],
      ['2020-02-29', '2020-02-29T00:00:00.000Z'], // Leap year
    ] as const;

    const normalizeNegativeCases = invalidDateInputs;

    it.each(normalizePositiveCases)('normalizeToIso converts %s to %s', (value, expected) => {
      const result = normalizeToIso(nowIso, value);
      expect(result).toBe(expected);
    });

    it.each(normalizeNegativeCases)('normalizeToIso falls back to nowIso for %s', (value) => {
      const result = normalizeToIso(nowIso, value);
      expect(result).toBe(nowIso);
    });
  });
});
