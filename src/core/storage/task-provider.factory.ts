import { ITaskRepository, TaskProviderType } from '../../types';

import { TodoProvider } from './todo.provider';

/**
 * Factory for creating task providers following Factory pattern and OCP.
 * Allows extension for new provider types without modifying existing code.
 */
export class TaskProviderFactory {
  static create(providerType: TaskProviderType): ITaskRepository {
    switch (providerType) {
      case TaskProviderType.TODO:
        return new TodoProvider();

      case TaskProviderType.ISSUES:
        // TODO: Implement GitHub Issues provider
        throw new Error('GitHub Issues provider not yet implemented');

      case TaskProviderType.PROJECTS:
        // TODO: Implement GitHub Projects provider
        throw new Error('GitHub Projects provider not yet implemented');

      default:
        throw new Error(`Unknown provider type: ${providerType}`);
    }
  }

  static getAvailableProviders(): TaskProviderType[] {
    return [TaskProviderType.TODO, TaskProviderType.ISSUES, TaskProviderType.PROJECTS];
  }
}
