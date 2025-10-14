import { isObject } from '../../core/helpers/type.helper';

/**
 * GitHub API types for type safety
 */
interface GitHubUser {
  login: string;
  id: number;
  avatar_url: string;
}

export interface GitHubLabel {
  id: number;
  name: string;
  color: string;
  description: string | null;
}

interface GitHubMilestone {
  id: number;
  title: string;
  due_on: string | null;
  state: 'open' | 'closed';
}

interface GitHubIssue {
  id: number;
  number: number;
  title: string;
  body: string | null;
  state: 'open' | 'closed';
  created_at: string;
  updated_at: string;
  assignee: GitHubUser | null;
  assignees: GitHubUser[];
  labels: GitHubLabel[];
  milestone: GitHubMilestone | null;
  pull_request?: {
    url: string;
    html_url: string;
  };
}

/**
 * Type guard to check if an unknown value is a GitHub issue
 */
export function isGitHubIssue(value: unknown): value is GitHubIssue {
  return (
    isObject(value) &&
    'number' in value &&
    'title' in value &&
    'state' in value &&
    'created_at' in value &&
    'updated_at' in value
  );
}

/**
 * GitHub Projects v2 API types for type safety
 */
interface GitHubProjectUser {
  login: string;
}

interface GitHubProjectLabel {
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

interface ProjectV2FieldValue {
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

interface ProjectV2Response {
  items?: {
    nodes: ProjectV2Item[];
  };
}

interface ProjectV2User {
  projectV2?: ProjectV2Response;
}

interface GraphQLData {
  node?: ProjectV2Item;
  user?: ProjectV2User;
}

export interface GraphQLResponse {
  data?: GraphQLData;
  errors?: Array<{ message: string }>;
}

export function hasContent(
  item: ProjectV2Item,
): item is ProjectV2Item & { content: GitHubProjectIssue } {
  return Boolean(item.content);
}
