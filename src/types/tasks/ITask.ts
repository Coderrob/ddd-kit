import { IResolvedReference } from './IResolvedReference';
import { TaskPriority } from './TaskPriority';
import { TaskState } from './TaskState';
import { TaskStatus } from './TaskStatus';

export interface ITask {
  [key: string]: unknown;
  id: string;
  title?: string;
  state?: TaskState;
  status?: TaskStatus;
  priority?: TaskPriority;
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
