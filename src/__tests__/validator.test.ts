import { DefaultTaskStore } from '../utils/default-task.store';
import { validateAndFixTasks } from '../validators/validator';

jest.mock('../utils/default-task.store');

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
      {
        created: 'not-a-date',
        id: 'T-101',
        summary: 'bad dates',
        updated: 'also-bad',
      },
    ],
  ])(
    'positive: %s triggers planned fixes',
    async (_name: string, task: Record<string, unknown>) => {
      const tasks = [Object.freeze(task) as unknown as Record<string, unknown>];
      const res = await validateAndFixTasks(tasks, { applyFixes: false });
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
        created: '2020-01-01',
        id: 'T-200',
        priority: 'P1',
        status: 'open',
        summary: 'ok',
        updated: '2020-01-01',
      },
    ],
  ])('negative: %s', async (_name: string, task: Record<string, unknown>) => {
    const tasks = [Object.freeze(task) as unknown as Record<string, unknown>];
    const res = await validateAndFixTasks(tasks, { applyFixes: false });
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
    const res = await validateAndFixTasks([task], { applyFixes: true });
    expect(res.fixes).toBeDefined();
    expect(mockUpdateTaskById).toHaveBeenCalled();
  });
});
