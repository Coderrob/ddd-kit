import { ITaskRepository, TaskProviderType } from '../../types';
import { ILogger } from '../../types/observability';

import { TaskProvider } from './task.provider';
import { IssuesProvider } from './issues.provider';
import { ProjectsProvider } from './projects.provider';

/**
 * Factory for creating task providers following Factory pattern and OCP.
 * Allows extension for new provider types without modifying existing code.
 */
export class TaskProviderFactory {
  static create(providerType: TaskProviderType, logger: ILogger): ITaskRepository {
    switch (providerType) {
      case TaskProviderType.TODO:
        return new TaskProvider(logger);

      case TaskProviderType.ISSUES:
        return new IssuesProvider(logger);

      case TaskProviderType.PROJECTS:
        return new ProjectsProvider(logger);

      default:
        throw new Error(`Unknown provider type: ${providerType}`);
    }
  }

  static getAvailableProviders(): TaskProviderType[] {
    return [TaskProviderType.TODO, TaskProviderType.ISSUES, TaskProviderType.PROJECTS];
  }
}
