export type TaskState = 'pending' | 'in-progress' | 'completed' | 'cancelled';

export interface IResolvedReference {
  uid: string;
  contentHash: string;
  resolvedAt: string;
}

export interface ITask {
  [key: string]: unknown;
  id: string;
  title?: string;
  state?: TaskState;
  references?: string[];
  owner?: string;
  due?: string;
  repo?: string;
  language?: string;
  library?: string;
  dddKitCommit?: string;
  resolvedReferences?: IResolvedReference[];
  branch?: string;
}

export interface IProvenance {
  cliVersion: string;
  dddKitCommit: string;
  actionRunId: string;
  timestamp: string;
}

export interface IHydrationOptions {
  pin?: string;
  branchPrefix?: string;
  openPr?: boolean;
  provider?: string;
  filters?: string[];
}

export interface IRenderOptions {
  pin?: string;
}

export interface IResolvedRef {
  uid: string;
  content: string;
  section?: string;
  contentHash?: string;
}
