import { createHash } from 'crypto';

import type {
  ITask,
  IResolvedRef,
  IHydrationOptions,
  ITaskHydrationUseCase,
} from '../../types/tasks';
import { ILogger, TaskProviderType } from '../../types';
import { UidStatusError } from '../../errors/uid-status.error';
import { UidResolutionError } from '../../errors/uid-resolution.error';
import { Resolver } from '../helpers/uid-resolver';
import { Renderer } from '../rendering/renderer';
import { TaskProviderFactory } from '../storage/task-provider.factory';

export class TaskHydrationService implements ITaskHydrationUseCase {
  constructor(
    private readonly resolver: Resolver,
    private readonly renderer: Renderer,
    private readonly logger: ILogger,
  ) {}

  hydrateTask(task: ITask, _dddKitPath: string, _targetPath: string, pin?: string): Promise<ITask> {
    this.logger.info('Hydrating task', { taskId: task.id });

    const resolvedRefs = this.resolveReferences(task);

    const provenance = {
      actionRunId: process.env['GITHUB_RUN_ID'] ?? 'manual-run',
      dddKit: pin ?? 'latest',
    };

    this.renderer.render(task.id, resolvedRefs, provenance);

    // Set resolved references on the task
    task.resolvedReferences = resolvedRefs.map((ref) => ({
      contentHash: ref.contentHash ?? '',
      resolvedAt: new Date().toISOString(),
      uid: ref.uid,
    }));

    return Promise.resolve(task);
  }

  private resolveReferences(task: ITask): IResolvedRef[] {
    const resolvedRefs: IResolvedRef[] = [];

    const references = task.references;
    if (!references) {
      return resolvedRefs;
    }

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
        this.logger.error(`Failed to resolve ${ref}`, { error: String(error) });
        throw error;
      }
    }

    return resolvedRefs;
  }

  /**
   * Hydrates the next eligible task based on the provided options.
   * @param options - hydration options
   * @returns the hydrated task
   * @throws Error if no eligible task is found to hydrate
   */
  async execute(options: IHydrationOptions): Promise<ITask> {
    const provider = this.createProvider(options.provider);
    const next = await provider.findNextEligible(options.filters);
    if (!next) {
      throw new Error('No eligible task found to hydrate');
    }
    await this.hydrateTask(next, options.pin ?? '.', options.branchPrefix ?? '.', options.pin);
    return next;
  }

  /**
   * Creates a task provider based on the specified type.
   * @param providerType - optional provider type to create, defaults to TASK
   * @returns the created provider instance
   */
  private createProvider(providerType?: string) {
    switch (providerType) {
      case TaskProviderType.ISSUES:
      case TaskProviderType.PROJECTS:
        return TaskProviderFactory.create(providerType, this.logger);

      default:
        return TaskProviderFactory.create(TaskProviderType.TASK, this.logger);
    }
  }

  /**
   * Generates a SHA-256 hash of the given content.
   * @param content - The content to hash.
   * @returns The SHA-256 hash as a hex string.
   */
  private generateContentHash(content: string): string {
    // Use crypto.createHash for production content integrity
    return createHash('sha256').update(content).digest('hex');
  }
}
