import { ITask, TaskState, TaskStatus } from '../../types/tasks';
import { ITaskRepository } from '../../types/repository';
import { ILogger } from '../../types/observability';
import { formatJson } from '../parsers/json.parser';
import { isNonEmptyString } from '../helpers/type.helper';

import { ProjectV2Item, GraphQLResponse, GitHubProjectIssue, hasContent } from './projects.types';

/**
 * GitHub Projects provider for task management.
 * Integrates with GitHub Projects (v2) API using GraphQL.
 */
export class ProjectsProvider implements ITaskRepository {
  private readonly githubToken: string;
  private readonly projectId: string;
  private readonly projectOwner: string;
  private readonly graphqlUrl = 'https://api.github.com/graphql';

  constructor(private readonly logger: ILogger) {
    this.githubToken = process.env['GITHUB_TOKEN'] ?? '';
    this.projectId = process.env['GITHUB_PROJECT_ID'] ?? '';
    this.projectOwner = process.env['GITHUB_PROJECT_OWNER'] ?? '';

    if (!this.githubToken || !this.projectId || !this.projectOwner) {
      throw new Error('GitHub environment variables are required for Projects provider');
    }
  }

  async findById(id: string): Promise<ITask | null> {
    try {
      const query = this.buildFindByIdQuery();
      const response = await this.executeGraphQL(query, { itemId: id });

      if (!response.data?.node) {
        return null;
      }

      return this.mapProjectItemToTask(response.data.node);
    } catch (error) {
      this.logger.error('Error finding project item by ID', { id, error });
      return null;
    }
  }

  async findNextEligible(filters?: string[]): Promise<ITask | null> {
    try {
      const query = this.buildProjectItemsQuery();
      const response = await this.executeGraphQL(query, {
        owner: this.projectOwner,
        projectId: this.projectId,
      });

      const items = response.data?.user?.projectV2?.items?.nodes ?? [];
      const eligibleItems = this.filterEligibleItems(items, filters);

      if (eligibleItems.length > 0) {
        const firstItem = eligibleItems[0];
        if (firstItem) {
          return this.mapProjectItemToTask(firstItem);
        }
      }
      return null;
    } catch (error) {
      this.logger.error('Error finding next eligible task', { error });
      return null;
    }
  }

  update(task: ITask): Promise<void> {
    this.logger.warn('Update not implemented for Projects provider', { taskId: task.id });
    return Promise.resolve();
  }

  async findAll(): Promise<ITask[]> {
    try {
      const query = this.buildProjectItemsQuery();
      const response = await this.executeGraphQL(query, { owner: this.projectOwner });

      const items = response.data?.user?.projectV2?.items?.nodes ?? [];

      return items.filter(hasContent).map((item) => this.mapProjectItemToTask(item));
    } catch (error) {
      this.logger.error('Error fetching all project items', { error });
      return [];
    }
  }

  private async executeGraphQL(
    query: string,
    variables: Record<string, string>,
  ): Promise<GraphQLResponse> {
    const response = await fetch(this.graphqlUrl, {
      body: formatJson({ query, variables }),
      headers: {
        Authorization: `Bearer ${this.githubToken}`,
        'Content-Type': 'application/json',
      },
      method: 'POST',
    });

    const result: GraphQLResponse = (await response.json()) as GraphQLResponse;

    if (Array.isArray(result.errors) && result.errors.length > 0) {
      throw new Error(`GraphQL error: ${result.errors[0]?.message ?? 'Unknown error'}`);
    }

    return result;
  }

  private buildFindByIdQuery(): string {
    return `
      query($itemId: ID!) {
        node(id: $itemId) {
          ... on ProjectV2Item {
            id
            content {
              ... on Issue {
                id
                number
                title
                body
                state
                createdAt
                updatedAt
                assignees(first: 1) {
                  nodes {
                    login
                  }
                }
              }
            }
          }
        }
      }
    `;
  }

  private buildProjectItemsQuery(): string {
    return `query($owner: String!) { user(login: $owner) { projectV2(number: ${this.projectId}) { items(first: 100) { nodes { id content { ... on Issue { id number title body state createdAt updatedAt assignees(first: 1) { nodes { login } } labels(first: 10) { nodes { name } } milestone { dueOn } } } fieldValues(first: 10) { nodes { ... on ProjectV2ItemFieldTextValue { text field { ... on ProjectV2FieldCommon { name } } } ... on ProjectV2ItemFieldSingleSelectValue { name field { ... on ProjectV2FieldCommon { name } } } } } } } } } }`;
  }

  private filterEligibleItems(items: ProjectV2Item[], filters?: string[]): ProjectV2Item[] {
    return items.filter((item) => {
      if (!hasContent(item)) return false;

      if (filters && filters.length > 0) {
        const labels = item.content.labels;
        const nodes = labels?.nodes;
        const itemLabels = nodes?.map((l) => l.name) ?? [];
        return filters.some((filter) => Boolean(itemLabels.includes(filter)));
      }

      return true;
    });
  }

  private mapProjectItemToTask(item: ProjectV2Item): ITask {
    if (!hasContent(item)) {
      throw new Error('Project item has no content');
    }

    const content = item.content;
    const fieldValues = this.extractFieldValues(item);

    return {
      branch: `feature/project-item-${content.number}`,
      created: content.createdAt,
      ...(isNonEmptyString(content.milestone?.dueOn) ? { due: content.milestone.dueOn } : {}),
      id: item.id,
      issueNumber: content.number,
      owner: (() => {
        const assignees = content.assignees;
        const nodes = assignees?.nodes;
        const firstAssignee = nodes?.[0];
        return firstAssignee?.login ?? 'Unassigned';
      })(),
      projectItemId: item.id,
      references: this.extractReferences(content.body ?? ''),
      repo: this.extractRepoFromContent(content),
      resolvedReferences: [],
      state: this.mapIssueStateToTaskState(content.state),
      status: content.state === 'CLOSED' ? TaskStatus.Closed : TaskStatus.Open,
      title: content.title,
      updated: content.updatedAt,
      ...fieldValues,
    };
  }

  private extractFieldValues(item: ProjectV2Item): Record<string, string> {
    const fieldValues: Record<string, string> = {};

    if (item.fieldValues?.nodes) {
      for (const fieldValue of item.fieldValues.nodes) {
        if (isNonEmptyString(fieldValue.field?.name)) {
          fieldValues[fieldValue.field.name] = fieldValue.text ?? fieldValue.name ?? '';
        }
      }
    }

    return fieldValues;
  }

  private mapIssueStateToTaskState(issueState: string): TaskState {
    return issueState === 'CLOSED' ? TaskState.Completed : TaskState.Pending;
  }

  private extractReferences(body: string): string[] {
    return body.match(/\b(tech|doc|standard):[a-zA-Z0-9/@.-]+/g) ?? [];
  }

  private extractRepoFromContent(_content: GitHubProjectIssue): string {
    return this.projectOwner;
  }
}
