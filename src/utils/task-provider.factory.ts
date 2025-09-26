import { ITaskRepository } from '../interfaces/ITaskRepository';

import { TodoProvider } from './todo.provider';

/**
 * Factory for creating task providers following Factory pattern and OCP.
 * Allows extension for new provider types without modifying existing code.
 */
export class TaskProviderFactory {
  static create(providerType: string): ITaskRepository {
    switch (providerType.toLowerCase()) {
      case 'todo':
        return new TodoProvider();
      case 'issues':
        // TODO: Implement GitHub Issues provider
        throw new Error('GitHub Issues provider not yet implemented');
      case 'projects':
        // TODO: Implement GitHub Projects provider
        throw new Error('GitHub Projects provider not yet implemented');
      default:
        throw new Error(`Unknown provider type: ${providerType}`);
    }
  }

  static getAvailableProviders(): string[] {
    return ['todo', 'issues', 'projects'];
  }
}
