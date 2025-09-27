import { ILogger } from '../../types/ILogger';
import { IFileManager } from '../../types/IFileManager';
import { getLogger } from '../system/logger';

/**
 * Parses a JSON file and returns the parsed object.
 * @param filePath - The path to the JSON file.
 * @param fileManager - The file manager to use for file operations.
 * @param logger - Optional logger instance.
 * @returns The parsed JSON object or null if parsing failed.
 */
export function parseJsonFile<T = Record<string, unknown>>(
  filePath: string,
  fileManager: IFileManager,
  logger?: ILogger,
): T | null {
  const log = logger ?? getLogger();
  try {
    const content = fileManager.readFileSync(filePath);
    const parsed = JSON.parse(content) as T;
    log.debug('Parsed JSON file', { filePath });
    return parsed;
  } catch (e) {
    log.error('Failed to parse JSON file', { error: String(e), filePath });
    return null;
  }
}

/**
 * Writes an object to a JSON file.
 * @param filePath - The path to the JSON file.
 * @param data - The data to write.
 * @param fileManager - The file manager to use for file operations.
 * @param logger - Optional logger instance.
 * @returns True if the write was successful, false otherwise.
 */
export function writeJsonFile<T = Record<string, unknown>>(
  filePath: string,
  data: T,
  fileManager: IFileManager,
  logger?: ILogger,
): boolean {
  const log = logger ?? getLogger();
  try {
    const jsonString = JSON.stringify(data, null, 2);
    fileManager.writeFileSync(filePath, jsonString);
    log.debug('Wrote JSON file', { filePath });
    return true;
  } catch (e) {
    log.error('Failed to write JSON file', { error: String(e), filePath });
    return false;
  }
}

/**
 * Safely parses a JSON string.
 * @param jsonString - The JSON string to parse.
 * @param logger - Optional logger instance.
 * @returns The parsed object or null if parsing failed.
 */
export function safeJsonParse<T = Record<string, unknown>>(
  jsonString: string,
  logger?: ILogger,
): T | null {
  const log = logger ?? getLogger();
  try {
    return JSON.parse(jsonString) as T;
  } catch (e) {
    log.warn('Failed to parse JSON string', { error: String(e) });
    return null;
  }
}

/**
 * Formats an object as a pretty-printed JSON string.
 * @param obj - The object to format.
 * @param indent - The number of spaces for indentation (default: 2).
 * @returns The formatted JSON string.
 */
export function formatJson(obj: unknown, indent: number = 2): string {
  return JSON.stringify(obj, null, indent);
}
