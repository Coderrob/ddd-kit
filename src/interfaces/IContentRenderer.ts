import { IResolvedUid } from './IResolvedUid';
import { IProvenance } from './ITask';

/**
 * Repository interface for rendering content to files.
 */
export interface IContentRenderer {
  render(taskId: string, references: IResolvedUid[], provenance: IProvenance): Promise<void>;
}
