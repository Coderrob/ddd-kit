import { validateAndFixTasks } from './validator';
import { DefaultTaskStore } from '../core/default-task.store';

jest.mock('../core/default-task.store');

describe('validator module', () => {
  const mockUpdateTaskById = jest.fn();

  beforeEach(() => {
    mockUpdateTaskById.mockReset();
    mockUpdateTaskById.mockResolvedValue(true);

    // Mock the DefaultTaskStore constructor
    jest.mocked(DefaultTaskStore).mockImplementation(
      () =>
        ({
          updateTaskById: mockUpdateTaskById,
        }) as unknown as DefaultTaskStore,
    );
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  test.each([
    ['missing fields', { id: 'T-100', summary: 'missing fields' }],
    [
      'invalid dates',
      { id: 'T-101', summary: 'bad dates', created: 'not-a-date', updated: 'also-bad' },
    ],
  ])(
    'positive: %s triggers planned fixes',
    async (_name: string, task: Record<string, unknown>) => {
      const tasks = [Object.freeze(task) as unknown as Record<string, unknown>];
      const res = await validateAndFixTasks(tasks, false);
      expect(res.fixes).toBeDefined();
      expect(res.fixes!.length).toBeGreaterThanOrEqual(1);
      // ensure no writes in dry-run
      expect(mockUpdateTaskById).not.toHaveBeenCalled();
    },
  );

  test.each([
    ['no id', { summary: 'no id here' }],
    [
      'already valid',
      {
        id: 'T-200',
        summary: 'ok',
        priority: 'P1',
        status: 'open',
        created: '2020-01-01',
        updated: '2020-01-01',
      },
    ],
  ])('negative: %s', async (_name: string, task: Record<string, unknown>) => {
    const tasks = [Object.freeze(task) as unknown as Record<string, unknown>];
    const res = await validateAndFixTasks(tasks, false);
    if (!_name.includes('no id')) {
      // already valid should have no fixes
      expect(res.fixes).toBeUndefined();
    } else {
      // no id cannot be auto-fixed, an error should be present
      expect(res.errors).toBeDefined();
    }
  });

  test('applyFixes actually writes when not dry-run', async () => {
    const task = Object.freeze({ id: 'T-300', summary: 'apply writes' }) as Record<string, unknown>;
    const res = await validateAndFixTasks([task], true);
    expect(res.fixes).toBeDefined();
    expect(mockUpdateTaskById).toHaveBeenCalled();
  });
});
