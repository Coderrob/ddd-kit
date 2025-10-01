/**
 * GitHub Projects v2 API types for type safety
 */
export interface GitHubProjectUser {
  login: string;
}

export interface GitHubProjectLabel {
  name: string;
}

export interface GitHubProjectIssue {
  id: string;
  number: number;
  title: string;
  body?: string;
  state: 'OPEN' | 'CLOSED';
  createdAt: string;
  updatedAt: string;
  assignees?: {
    nodes: GitHubProjectUser[];
  };
  labels?: {
    nodes: GitHubProjectLabel[];
  };
  milestone?: {
    dueOn?: string;
  };
}

export interface ProjectV2FieldValue {
  field?: { name: string };
  text?: string;
  name?: string;
}

export interface ProjectV2Item {
  id: string;
  content?: GitHubProjectIssue;
  fieldValues?: {
    nodes: ProjectV2FieldValue[];
  };
}

export interface ProjectV2Response {
  items?: {
    nodes: ProjectV2Item[];
  };
}

export interface ProjectV2User {
  projectV2?: ProjectV2Response;
}

export interface GraphQLData {
  node?: ProjectV2Item;
  user?: ProjectV2User;
}

export interface GraphQLResponse {
  data?: GraphQLData;
  errors?: Array<{ message: string }>;
}

export function isProjectV2Item(value: unknown): value is ProjectV2Item {
  return typeof value === 'object' && value !== null && 'id' in value;
}

export function hasContent(
  item: ProjectV2Item,
): item is ProjectV2Item & { content: GitHubProjectIssue } {
  return Boolean(item.content);
}
