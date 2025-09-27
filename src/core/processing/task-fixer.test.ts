import { IFixerOptions } from '../../types/IFixerOptions';
import { ILogger } from '../../types/ILogger';

import { TaskFixer } from './task-fixer';

const mockLogger: ILogger = {
  child: () => mockLogger,
  debug: jest.fn(),
  error: jest.fn(),
  info: jest.fn(),
  warn: jest.fn(),
};

const fixedToday = '2024-01-01';

function createFixer(options?: Partial<IFixerOptions>) {
  return new TaskFixer({ today: fixedToday, ...options });
}

describe('Fixer', () => {
  let fixer: TaskFixer;

  beforeEach(() => {
    fixer = createFixer();
    jest.clearAllMocks();
  });

  it('should fix missing priority to P2', () => {
    const obj: Record<string, unknown> = {
      created: fixedToday,
      id: '1',
      owner: 'John Doe',
      priority: void 0,
      status: 'open',
      updated: fixedToday,
      validations: [],
    };
    const fixes = fixer.applyBasicFixes(obj);
    expect(obj['priority']).toBe('P2');
    expect(fixes).toContainEqual({ field: 'priority', id: '1', new: 'P2', old: void 0 });
  });

  it('should fix invalid priority to P2', () => {
    const obj: Record<string, unknown> = {
      created: fixedToday,
      id: '2',
      owner: 'John Doe',
      priority: 'HIGH',
      status: 'open',
      updated: fixedToday,
      validations: [],
    };
    const fixes = fixer.applyBasicFixes(obj);
    expect(obj['priority']).toBe('P2');
    expect(fixes).toContainEqual({ field: 'priority', id: '2', new: 'P2', old: 'HIGH' });
  });

  it('should fix missing status to open', () => {
    const obj: Record<string, unknown> = {
      created: fixedToday,
      id: '3',
      owner: 'John Doe',
      priority: 'P2',
      status: void 0,
      updated: fixedToday,
      validations: [],
    };
    const fixes = fixer.applyBasicFixes(obj);
    expect(obj['status']).toBe('open');
    expect(fixes).toContainEqual({ field: 'status', id: '3', new: 'open', old: void 0 });
  });

  it('should fix invalid status to open', () => {
    const obj: Record<string, unknown> = {
      created: fixedToday,
      id: '4',
      owner: 'John Doe',
      priority: 'P2',
      status: 'closed',
      updated: fixedToday,
      validations: [],
    };
    const fixes = fixer.applyBasicFixes(obj);
    expect(obj['status']).toBe('open');
    expect(fixes).toContainEqual({ field: 'status', id: '4', new: 'open', old: 'closed' });
  });

  it('should fix missing created date to today', () => {
    const obj: Record<string, unknown> = {
      created: void 0,
      id: '5',
      owner: 'John Doe',
      priority: 'P2',
      status: 'open',
      updated: fixedToday,
      validations: [],
    };
    const fixes = fixer.applyBasicFixes(obj);
    expect(obj['created']).toBe(fixedToday);
    expect(fixes).toContainEqual({ field: 'created', id: '5', new: fixedToday, old: void 0 });
  });

  it('should fix invalid created date to today', () => {
    const obj: Record<string, unknown> = {
      created: 'not-a-date',
      id: '6',
      owner: 'John Doe',
      priority: 'P2',
      status: 'open',
      updated: fixedToday,
      validations: [],
    };
    const fixes = fixer.applyBasicFixes(obj);
    expect(obj['created']).toBe(fixedToday);
    expect(fixes).toContainEqual({ field: 'created', id: '6', new: fixedToday, old: 'not-a-date' });
  });

  it('should normalize created date to YYYY-MM-DD', () => {
    const obj: Record<string, unknown> = {
      created: '2024-01-01T12:00:00.000Z',
      id: '7',
      owner: 'John Doe',
      priority: 'P2',
      status: 'open',
      updated: fixedToday,
      validations: [],
    };
    const fixes = fixer.applyBasicFixes(obj);
    expect(obj['created']).toBe('2024-01-01');
    expect(fixes).toContainEqual({
      field: 'created',
      id: '7',
      new: '2024-01-01',
      old: '2024-01-01T12:00:00.000Z',
    });
  });
});
