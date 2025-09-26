import { TaskProviderFactory } from '../utils/task-provider.factory';
import { hydrateTask } from '../utils/task-hydration';
import type { IRenderOptions } from '../interfaces/ITask';

import { TaskRenderService } from './task-render.service';

jest.mock('../utils/task-provider.factory');
jest.mock('../utils/task-hydration');

describe('TaskRenderService', () => {
  let service: TaskRenderService;
  const mockProvider = {
    findById: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
    (TaskProviderFactory.create as jest.Mock).mockReturnValue(mockProvider);
    (hydrateTask as jest.Mock).mockResolvedValue(void 0);
    service = new TaskRenderService();
  });

  it('should render task if found', async () => {
    const task = { id: 'test-task' };
    mockProvider.findById.mockResolvedValue(task);

    await service.execute('test-task', {} as IRenderOptions);

    expect(TaskProviderFactory.create).toHaveBeenCalledWith('todo');
    expect(mockProvider.findById).toHaveBeenCalledWith('test-task');
    expect(hydrateTask).toHaveBeenCalledWith(task, '.', '.', void 0);
  });

  it('should throw if task not found', async () => {
    mockProvider.findById.mockResolvedValue(null);

    await expect(service.execute('missing-task', {} as IRenderOptions)).rejects.toThrow(
      'Task missing-task not found',
    );
  });
});
