import { IResolvedUid } from '../repository/IResolvedUid';
import { IProvenance } from '../tasks/IProvenance';

/**
 * Repository interface for rendering content to files.
 */
export interface IContentRenderer {
  render(taskId: string, references: IResolvedUid[], provenance: IProvenance): Promise<void>;
}
