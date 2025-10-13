import { isObject } from '../helpers/type-guards';

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
