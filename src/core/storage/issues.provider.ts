import { ITask, TaskState, TaskStatus } from '../../types/tasks';
import { ITaskRepository } from '../../types/repository';
import { ILogger } from '../../types/observability';

import { GitHubLabel, isGitHubIssue } from './github.types';

/**
 * GitHub Issues provider for task management.
 *
 * This provider integrates with GitHub Issues API to fetch and manage tasks
 * from GitHub repository issues. It follows the ITaskRepository interface
 * for consistent task operations across different providers.
 *
 * Features:
 * - Fetches issues from configured GitHub repository
 * - Maps GitHub issue fields to task properties
 * - Supports filtering by labels and milestones
 * - Handles GitHub API authentication and rate limiting
 *
 * Configuration through environment variables:
 * - GITHUB_TOKEN: Personal access token for GitHub API
 * - GITHUB_REPO: Repository in format "owner/repo"
 * - GITHUB_LABELS: Comma-separated list of labels to filter
 */
export class IssuesProvider implements ITaskRepository {
  private readonly githubToken: string;
  private readonly githubRepo: string;
  private readonly baseUrl: string = 'https://api.github.com';

  constructor(private readonly logger: ILogger) {
    this.githubToken = process.env['GITHUB_TOKEN'] ?? '';
    this.githubRepo = process.env['GITHUB_REPO'] ?? '';

    if (!this.githubToken) {
      throw new Error('GITHUB_TOKEN environment variable is required for Issues provider');
    }
    if (!this.githubRepo) {
      throw new Error('GITHUB_REPO environment variable is required for Issues provider');
    }
  }

  /**
   * Finds a task by its GitHub issue number.
   * @param id - The GitHub issue number as string
   * @returns Promise resolving to the task or null if not found
   */
  async findById(id: string): Promise<ITask | null> {
    try {
      const response: Response = await this.fetchFromGitHub(
        `/repos/${this.githubRepo}/issues/${id}`,
      );

      if (!response.ok) {
        if (response.status === 404) {
          return null;
        }
        throw new Error(`GitHub API error: ${response.status} ${response.statusText}`);
      }

      const issue: unknown = await response.json();
      return this.mapIssueToTask(issue);
    } catch (error) {
      this.logger.error(`Failed to fetch issue ${id}`, { error: String(error) });
      return null;
    }
  }

  /**
   * Finds the next eligible task from GitHub issues.
   * @param filters - Optional array of label filters
   * @returns Promise resolving to the next eligible task or null
   */
  async findNextEligible(filters?: string[]): Promise<ITask | null> {
    try {
      const params = new URLSearchParams({
        direction: 'asc',
        per_page: '10',
        sort: 'created',
        state: 'open',
      });

      if (filters && filters.length > 0) {
        params.set('labels', filters.join(','));
      }

      const response = await this.fetchFromGitHub(`/repos/${this.githubRepo}/issues?${params}`);

      if (!response.ok) {
        throw new Error(`GitHub API error: ${response.status} ${response.statusText}`);
      }

      const issues: unknown = await response.json();

      // Filter out pull requests (GitHub treats PRs as issues)
      if (!Array.isArray(issues)) {
        throw new Error('Invalid response format from GitHub API');
      }
      const actualIssues: unknown[] = issues.filter((issue: unknown) => {
        if (!isGitHubIssue(issue)) return false;
        return !issue.pull_request;
      });

      if (actualIssues.length === 0) {
        return null;
      }

      // Return the first (oldest) eligible issue
      return this.mapIssueToTask(actualIssues[0]);
    } catch (error) {
      this.logger.error('Failed to find next eligible issue', { error: String(error) });
      return null;
    }
  }

  /**
   * Updates a GitHub issue with task data.
   * @param task - The task to update
   */
  async update(task: ITask): Promise<void> {
    try {
      const updateData = {
        body: this.formatTaskBody(task),
        labels: this.extractLabels(task),
        state: this.mapTaskStateToIssueState(task.state),
        title: task.title ?? task.id,
      };

      const response = await this.fetchFromGitHub(`/repos/${this.githubRepo}/issues/${task.id}`, {
        body: JSON.stringify(updateData),
        method: 'PATCH',
      });

      if (!response.ok) {
        throw new Error(`GitHub API error: ${response.status} ${response.statusText}`);
      }

      this.logger.info(`Updated GitHub issue ${task.id}`, { state: task.state });
    } catch (error) {
      this.logger.error(`Failed to update issue ${task.id}`, { error: String(error) });
      throw error;
    }
  }

  /**
   * Finds all open issues in the repository.
   * @returns Promise resolving to array of all tasks
   */
  async findAll(): Promise<ITask[]> {
    try {
      const params = new URLSearchParams({
        direction: 'desc',
        per_page: '100', // GitHub API limit
        sort: 'created',
        state: 'open',
      });

      const response = await this.fetchFromGitHub(`/repos/${this.githubRepo}/issues?${params}`);

      if (!response.ok) {
        throw new Error(`GitHub API error: ${response.status} ${response.statusText}`);
      }

      const issues: unknown = await response.json();

      if (!Array.isArray(issues)) {
        throw new Error('Invalid response format from GitHub API');
      }

      return issues
        .filter((issue: unknown) => isGitHubIssue(issue) && !issue.pull_request)
        .map((issue: unknown) => this.mapIssueToTask(issue));
    } catch (error) {
      this.logger.error('Failed to fetch all issues', { error: String(error) });
      return [];
    }
  }

  /**
   * Makes authenticated requests to GitHub API.
   */
  private fetchFromGitHub(endpoint: string, options: RequestInit = {}): Promise<Response> {
    const url: string = `${this.baseUrl}${endpoint}`;
    const headers: Record<string, string> = {
      Accept: 'application/vnd.github.v3+json',
      Authorization: `Bearer ${this.githubToken}`,
      'User-Agent': 'ddd-kit-cli',
      ...(options.headers as Record<string, string>),
    };

    if (typeof options.body === 'string') {
      headers['Content-Type'] = 'application/json';
    }

    return fetch(url, { ...options, headers });
  }

  /**
   * Maps a GitHub issue to our task interface.
   */
  private mapIssueToTask(issue: unknown): ITask {
    if (!isGitHubIssue(issue)) {
      throw new Error('Invalid GitHub issue format received from API');
    }

    const task: ITask = {
      branch: `feature/issue-${issue.number}`,
      created: issue.created_at,
      id: String(issue.number),
      labels: issue.labels.map((label: GitHubLabel): string => label.name),
      owner: issue.assignee?.login ?? 'Unassigned',
      references: this.extractReferences(issue.body ?? ''),
      repo: this.githubRepo,
      resolvedReferences: [],
      state: this.mapIssueStateToTaskState(issue.state),
      status: issue.state === 'closed' ? TaskStatus.Closed : TaskStatus.Open,
      title: issue.title,
      updated: issue.updated_at,
    };

    if (
      issue.milestone !== null &&
      issue.milestone.due_on !== null &&
      issue.milestone.due_on !== ''
    ) {
      task.due = issue.milestone.due_on;
    }

    return task;
  }

  private mapIssueStateToTaskState(issueState: string): TaskState {
    return issueState === 'closed' ? TaskState.Completed : TaskState.Pending;
  }

  private mapTaskStateToIssueState(taskState?: TaskState): 'open' | 'closed' {
    return taskState === TaskState.Completed || taskState === TaskState.Cancelled
      ? 'closed'
      : 'open';
  }

  private formatTaskBody(task: ITask): string {
    const parts: string[] = [`# ${task.title ?? task.id}\n`];
    if (typeof task.owner === 'string' && task.owner !== '' && task.owner !== 'Unassigned') {
      parts.push(`**Assignee:** @${task.owner}`);
    }
    if (typeof task.due === 'string' && task.due !== '') parts.push(`**Due Date:** ${task.due}`);
    if (task.state != null) parts.push(`**State:** ${task.state}`);
    if (Array.isArray(task.references) && task.references.length > 0) {
      parts.push(`\n**References:**\n${task.references.map((ref) => `- ${ref}`).join('\n')}`);
    }
    return parts.join('\n') + '\n';
  }

  private extractLabels(task: ITask): string[] {
    const labels: string[] = [];
    if (typeof task.language === 'string' && task.language !== '') {
      labels.push(`lang:${task.language}`);
    }
    if (task.state != null) labels.push(`state:${task.state}`);
    if (Array.isArray(task['labels'])) labels.push(...(task['labels'] as string[]));
    return labels;
  }

  private extractReferences(body: string): string[] {
    return body.match(/\b(tech|doc|standard):[a-zA-Z0-9/@.-]+/g) ?? [];
  }
}
