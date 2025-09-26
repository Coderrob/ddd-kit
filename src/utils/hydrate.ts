import type { ITask, IResolvedRef, IHydrationOptions } from '../interfaces/ITask';
import { UidStatusError } from '../errors/uid-status.error';
import { UidResolutionError } from '../errors/uid-resolution.error';
import type { ITaskHydrationUseCase } from '../interfaces/ITaskHydrationUseCase';

import { getLogger } from './logger';
import { Resolver } from './uid-resolver';
import { Renderer } from './renderer';
import { TaskProviderFactory } from './task-provider.factory';

export class TaskHydrationService implements ITaskHydrationUseCase {
  constructor(
    private readonly resolver: Resolver,
    private readonly renderer: Renderer,
  ) {}

  hydrateTask(task: ITask, _dddKitPath: string, _targetPath: string, pin?: string): Promise<void> {
    const log = getLogger();
    log.info('Hydrating task', { taskId: task.id });

    const resolvedRefs: IResolvedRef[] = [];

    const references = (task as Record<string, unknown>)['references'] as string[] | undefined;
    if (references) {
      for (const ref of references) {
        try {
          const resolved = this.resolver.resolve(ref);
          if (!resolved) {
            throw new UidResolutionError(ref);
          }
          if (resolved.status !== 'active') {
            throw new UidStatusError(ref, resolved.status);
          }
          resolvedRefs.push({
            content: resolved.content,
            contentHash: this.generateContentHash(resolved.content),
            uid: ref,
          });
        } catch (error) {
          log.error(`Failed to resolve ${ref}`, { error: String(error) });
          throw error;
        }
      }
    }

    const provenance = {
      actionRunId: process.env['GITHUB_RUN_ID'] ?? 'manual-run',
      dddKit: pin ?? 'latest',
    };

    this.renderer.render(task.id, resolvedRefs, provenance);
    return Promise.resolve();
  }

  /**
   * Implements ITaskHydrationUseCase.execute - hydrate the next eligible task if available
   */
  async execute(options: IHydrationOptions): Promise<ITask> {
    const provider = TaskProviderFactory.create(options.provider ?? 'todo');
    const next = await provider.findNextEligible(options.filters);
    if (!next) {
      throw new Error('No eligible task found to hydrate');
    }
    await this.hydrateTask(next, options.pin ?? '.', options.branchPrefix ?? '.', options.pin);
    return next;
  }

  private generateContentHash(content: string): string {
    // Simple hash for content integrity - in production, use crypto.createHash
    let hash = 0;
    for (let i = 0; i < content.length; i++) {
      const char = content.charCodeAt(i);
      hash = (hash * 31 + char) % 0x100000000; // Simple polynomial hash
    }
    return Math.abs(hash).toString(16);
  }
}

/**
 * Legacy function for backward compatibility.
 * TODO: Refactor callers to use TaskHydrationService directly.
 */
export function hydrateTask(
  task: ITask,
  dddKitPath: string,
  targetPath: string,
  pin?: string,
): Promise<void> {
  const resolver = new Resolver(dddKitPath);
  const renderer = new Renderer(targetPath);
  const service = new TaskHydrationService(resolver, renderer);

  service.hydrateTask(task, dddKitPath, targetPath, pin);
  return Promise.resolve();
}
