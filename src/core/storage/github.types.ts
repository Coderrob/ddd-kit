/**
 * GitHub API types for type safety
 */
export interface GitHubUser {
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

export interface GitHubMilestone {
  id: number;
  title: string;
  due_on: string | null;
  state: 'open' | 'closed';
}

export interface GitHubIssue {
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
    typeof value === 'object' &&
    value !== null &&
    'number' in value &&
    'title' in value &&
    'state' in value &&
    'created_at' in value &&
    'updated_at' in value
  );
}

/**
 * Type guard to check if an unknown value is a GitHub label
 */
export function isGitHubLabel(value: unknown): value is GitHubLabel {
  return (
    typeof value === 'object' &&
    value !== null &&
    'id' in value &&
    'name' in value &&
    'color' in value
  );
}
