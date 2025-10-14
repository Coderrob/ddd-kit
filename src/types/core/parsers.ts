import type { ILogger } from '../observability';

import type { IFileManager } from './IFileManager';

/**
 * Parser-related types for file processing operations
 */

export interface UpdateYamlBlockOptions {
  filePath: string;
  id: string;
  updatedData: Record<string, unknown>;
  fileSystem: IFileManager;
  logger?: ILogger;
}
