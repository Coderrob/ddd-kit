import path from 'path';

import { load, dump } from 'js-yaml';

import { ILogger } from '../../types/ILogger';
import { IFileManager } from '../../types/IFileManager';
import { getLogger } from '../system/logger';
import { isNonEmptyString, isNullOrUndefined } from '../helpers/type-guards';

/**
 * Extracts YAML blocks from markdown content.
 * @param md - The markdown content to parse.
 * @returns An array of YAML block contents.
 */
export function extractYamlBlocks(md: string): string[] {
  const blocks: string[] = [];
  const pattern = /---\r?\n([\s\S]*?)\r?\n---/g;
  let match: RegExpExecArray | null;
  while ((match = pattern.exec(md)) !== null) {
    if (isNonEmptyString(match[1])) {
      blocks.push(match[1]);
    }
  }
  return blocks;
}

/**
 * Parses a YAML block string into an object.
 * @param block - The YAML block string.
 * @param logger - Optional logger.
 * @returns The parsed object or null if failed.
 */
export function parseYamlBlock(block: string, logger?: ILogger): Record<string, unknown> | null {
  const log = logger ?? getLogger();
  try {
    const parsed = load(block);
    if (!isNullOrUndefined(parsed) && typeof parsed === 'object') {
      return parsed as Record<string, unknown>;
    }
  } catch (e) {
    log.warn('Failed to parse YAML block', { error: String(e) });
  }
  return null;
}

/**
 * Dumps an object to a YAML string.
 * @param obj - The object to dump.
 * @returns The YAML string representation.
 */
export function dumpYaml(obj: Record<string, unknown>): string {
  return dump(obj);
}

/**
 * Adds a task from a file to the target file by extracting the first YAML block.
 * @param sourceFilePath - The path to the file containing the task YAML block.
 * @param targetFilePath - The path to the file to append the YAML block to.
 * @param fileSystem - The file system provider to use for file operations.
 * @param logger - Optional logger instance for debugging.
 * @returns True if the task was successfully added, false otherwise.
 */
export function addYamlBlockFromFile(
  sourceFilePath: string,
  targetFilePath: string,
  fileSystem: IFileManager,
  logger?: ILogger,
): boolean {
  const log = logger ?? getLogger();
  const abs = path.isAbsolute(sourceFilePath)
    ? sourceFilePath
    : path.join(process.cwd(), sourceFilePath);
  if (!fileSystem.existsSync(abs)) return false;

  const content = fileSystem.readFileSync(abs);
  // find first YAML block in file
  const pattern = /---\r?\n([\s\S]*?)\r?\n---/;
  const m = content.match(pattern);
  if (!m) return false;

  const block = m[0];
  // append to target file with a blank line separator
  const targetContent = fileSystem.readFileSync(targetFilePath);
  const newContent = targetContent + '\n' + block + '\n';
  fileSystem.writeFileSync(targetFilePath, newContent);
  log.info('Appended YAML block to file', { src: sourceFilePath, target: targetFilePath });
  return true;
}

/**
 * Parses all YAML blocks from a markdown file.
 * @param filePath - The path to the markdown file.
 * @param fileSystem - The file system provider to use for file operations.
 * @param logger - Optional logger instance.
 * @returns An array of parsed objects from YAML blocks.
 */
export function parseYamlBlocksFromFile(
  filePath: string,
  fileSystem: IFileManager,
  logger?: ILogger,
): Record<string, unknown>[] {
  const log = logger ?? getLogger();
  const content = fileSystem.readFileSync(filePath);
  const blocks = extractYamlBlocks(content);
  const out: Record<string, unknown>[] = [];
  for (const b of blocks) {
    const parsed = parseYamlBlock(b, log);
    if (parsed) out.push(parsed);
  }
  log.debug('Parsed YAML blocks from file', { count: out.length, filePath });
  return out;
}

/**
 * Options for updating a YAML block by ID.
 */
export interface UpdateYamlBlockOptions {
  filePath: string;
  id: string;
  updatedData: Record<string, unknown>;
  fileSystem: IFileManager;
  logger?: ILogger;
}

/**
 * Updates a YAML block in a markdown file by ID.
 * @param options - The options for updating the YAML block.
 * @returns True if the block was updated successfully, false otherwise.
 */
export function updateYamlBlockById(options: UpdateYamlBlockOptions): boolean {
  const { filePath, id, updatedData, fileSystem, logger } = options;
  const log = logger ?? getLogger();
  try {
    const content = fileSystem.readFileSync(filePath);
    const parts = content.split(/---\r?\n/);
    let found = false;

    for (let i = 1; i < parts.length; i += 2) {
      // eslint-disable-next-line security/detect-object-injection
      const yamlContent = parts[i];
      if (isNonEmptyString(yamlContent)) {
        const parsed = parseYamlBlock(yamlContent, log);
        if (parsed && parsed['id'] === id) {
          // eslint-disable-next-line security/detect-object-injection
          parts[i] = dumpYaml({ ...parsed, ...updatedData });
          found = true;
          break;
        }
      }
    }

    if (!found) {
      log.warn(`YAML block with ID ${id} not found for update`);
      return false;
    }

    const newContent = parts.join('---\n');
    fileSystem.writeFileSync(filePath, newContent);
    log.info(`Updated YAML block with ID ${id}`);
    return true;
  } catch (e) {
    log.error(`Failed to update YAML block with ID ${id}`, { error: String(e) });
    return false;
  }
}

/**
 * Removes a YAML block from a markdown file by ID.
 * @param filePath - The path to the markdown file.
 * @param id - The ID of the block to remove.
 * @param fileSystem - The file system provider to use for file operations.
 * @param logger - Optional logger instance.
 * @returns True if the block was removed successfully, false otherwise.
 */
export function removeYamlBlockById(
  filePath: string,
  id: string,
  fileSystem: IFileManager,
  logger?: ILogger,
): boolean {
  const log = logger ?? getLogger();
  try {
    const content = fileSystem.readFileSync(filePath);
    const parts = content.split(/---\r?\n/);
    let found = false;

    for (let i = 1; i < parts.length; i += 2) {
      // eslint-disable-next-line security/detect-object-injection
      const yamlContent = parts[i];
      // eslint-disable-next-line @typescript-eslint/strict-boolean-expressions
      if (yamlContent) {
        const parsed = parseYamlBlock(yamlContent, log);
        if (parsed && parsed['id'] === id) {
          // Remove this block and its closing ---
          parts.splice(i - 1, 3);
          found = true;
          break;
        }
      }
    }

    if (!found) {
      log.warn(`YAML block with ID ${id} not found for removal`);
      return false;
    }

    const newContent = parts.join('---\n');
    fileSystem.writeFileSync(filePath, newContent);
    log.info(`Removed YAML block with ID ${id}`);
    return true;
  } catch (e) {
    log.error(`Failed to remove YAML block with ID ${id}`, { error: String(e) });
    return false;
  }
}
