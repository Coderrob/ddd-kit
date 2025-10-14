import * as path from 'path';

import { load, dump, JSON_SCHEMA } from 'js-yaml';

import { ILogger } from '../../types/observability';
import { IFileManager } from '../../types/core';
import { getLogger } from '../system/logger';
import { isNonEmptyString, isObject } from '../helpers/type.helper';

/**
 * Extracts YAML blocks from markdown content.
 * @param md - The markdown content to parse.
 * @returns An array of YAML block contents.
 */
function extractYamlBlocks(md: string): string[] {
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
function parseYamlBlock<T extends Record<string, unknown>>(
  block: string,
  logger?: ILogger,
): T | null {
  const log = logger ?? getLogger();
  try {
    // Configure js-yaml to NOT parse timestamps as Date objects, keep them as strings
    const parsed = load(block, {
      schema: JSON_SCHEMA, // Use JSON schema which doesn't auto-convert dates
    });
    if (isObject(parsed)) {
      return parsed as T;
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
function dumpYaml(obj: Record<string, unknown>): string {
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
  if (!fileSystem.existsSync(abs)) {
    return false;
  }

  const content = fileSystem.readFileSync(abs);
  // find first YAML block in file
  const pattern = /---\r?\n([\s\S]*?)\r?\n---/;
  const m = content.match(pattern);
  if (!m) {
    return false;
  }

  const block = m[0];
  // append to target file with proper document separator
  const targetContent = fileSystem.readFileSync(targetFilePath);
  // Ensure target content ends with document separator
  const separator = '\n---\n';
  let newContent: string;
  if (targetContent.endsWith('\n')) {
    // Target already ends with newline, just add the block
    newContent = targetContent + block + '\n';
  } else {
    // Target doesn't end with newline, add separator
    newContent = targetContent + separator + block + '\n';
  }
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
interface UpdateYamlBlockOptions {
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
  fileSystem: IFileManager,
  id: string,
  logger?: ILogger,
): boolean {
  const log = logger ?? getLogger();
  try {
    const content = fileSystem.readFileSync(filePath);

    // Find the YAML block with the matching ID
    const blockPattern = /---\r?\n([\s\S]*?)\r?\n---/g;
    let match;
    let newContent = content;
    let found = false;

    while ((match = blockPattern.exec(content)) !== null) {
      const fullBlock = match[0]; // The complete ---YAML--- block
      const yamlContent = match[1]; // Just the YAML content

      if (isNonEmptyString(yamlContent)) {
        const parsed = parseYamlBlock(yamlContent, log);
        if (parsed && parsed['id'] === id) {
          // Remove the entire block including markers and surrounding whitespace
          newContent = newContent.replace(fullBlock, '');
          // Clean up extra newlines
          newContent = newContent.replace(/\n{3,}/g, '\n\n');
          found = true;
          break;
        }
      }
    }

    if (!found) {
      log.warn(`YAML block with ID ${id} not found for removal`);
      return false;
    }

    fileSystem.writeFileSync(filePath, newContent);
    log.info(`Removed YAML block with ID ${id}`);
    return true;
  } catch (e) {
    log.error(`Failed to remove YAML block with ID ${id}`, { error: String(e) });
    return false;
  }
}
