import { ILogger } from '../lib/logger';
import { IFixerOptions } from '../types';
import { TaskFixer } from './task-fixer';

const mockLogger: ILogger = {
  debug: jest.fn(),
  info: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
  child: () => mockLogger,
};

const fixedToday = '2024-01-01';

function createFixer(options?: Partial<IFixerOptions>) {
  return new TaskFixer(mockLogger, { today: fixedToday, ...options });
}

describe('Fixer', () => {
  let fixer: TaskFixer;

  beforeEach(() => {
    fixer = createFixer();
    jest.clearAllMocks();
  });

  it('should fix missing priority to P2', () => {
    const obj: Record<string, unknown> = {
      id: 1,
      priority: undefined,
      status: 'open',
      created: fixedToday,
      updated: fixedToday,
      owner: 'John Doe',
      validations: [],
    };
    const fixes = fixer.applyBasicFixes(obj);
    expect(obj.priority).toBe('P2');
    expect(fixes).toContainEqual({ id: '1', field: 'priority', old: undefined, new: 'P2' });
  });

  it('should fix invalid priority to P2', () => {
    const obj: Record<string, unknown> = {
      id: 2,
      priority: 'HIGH',
      status: 'open',
      created: fixedToday,
      updated: fixedToday,
      owner: 'John Doe',
      validations: [],
    };
    const fixes = fixer.applyBasicFixes(obj);
    expect(obj.priority).toBe('P2');
    expect(fixes).toContainEqual({ id: '2', field: 'priority', old: 'HIGH', new: 'P2' });
  });

  it('should fix missing status to open', () => {
    const obj: Record<string, unknown> = {
      id: 3,
      priority: 'P1',
      status: undefined,
      created: fixedToday,
      updated: fixedToday,
      owner: 'John Doe',
      validations: [],
    };
    const fixes = fixer.applyBasicFixes(obj);
    expect(obj.status).toBe('open');
    expect(fixes).toContainEqual({ id: '3', field: 'status', old: undefined, new: 'open' });
  });

  it('should fix invalid status to open', () => {
    const obj: Record<string, unknown> = {
      id: 4,
      priority: 'P1',
      status: 'closed',
      created: fixedToday,
      updated: fixedToday,
      owner: 'John Doe',
      validations: [],
    };
    const fixes = fixer.applyBasicFixes(obj);
    expect(obj.status).toBe('open');
    expect(fixes).toContainEqual({ id: '4', field: 'status', old: 'closed', new: 'open' });
  });

  it('should fix missing created date to today', () => {
    const obj: Record<string, unknown> = {
      id: 5,
      priority: 'P1',
      status: 'open',
      created: undefined,
      updated: fixedToday,
      owner: 'John Doe',
      validations: [],
    };
    const fixes = fixer.applyBasicFixes(obj);
    expect(obj.created).toBe(fixedToday);
    expect(fixes).toContainEqual({ id: '5', field: 'created', old: undefined, new: fixedToday });
  });

  it('should fix invalid created date to today', () => {
    const obj: Record<string, unknown> = {
      id: 6,
      priority: 'P1',
      status: 'open',
      created: 'not-a-date',
      updated: fixedToday,
      owner: 'John Doe',
      validations: [],
    };
    const fixes = fixer.applyBasicFixes(obj);
    expect(obj.created).toBe(fixedToday);
    expect(fixes).toContainEqual({ id: '6', field: 'created', old: 'not-a-date', new: fixedToday });
  });

  it('should normalize created date to YYYY-MM-DD', () => {
    const obj: Record<string, unknown> = {
      id: 7,
      priority: 'P1',
      status: 'open',
      created: '2024-01-01T12:00:00.000Z',
      updated: fixedToday,
      owner: 'John Doe',
      validations: [],
    };
    const fixes = fixer.applyBasicFixes(obj);
    expect(obj.created).toBe('2024-01-01');
    expect(fixes).toContainEqual({
      id: '7',
      field: 'created',
      old: '2024-01-01T12:00:00.000Z',
      new: '2024-01-01',
    });
  });
});
