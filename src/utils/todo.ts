import fs from 'fs';
import path from 'path';

import { load, dump } from 'js-yaml';

import { ILogger } from '../interfaces/ILogger';
import { ITask } from '../interfaces/ITask';

import { FileManager } from './file-manager';
import { getLogger } from './logger';
import { isNonEmptyString, safeGet } from './type-guards';

const ROOT = path.resolve(process.cwd());
const TODO_PATH = path.join(ROOT, 'TODO.md');
const CHANGELOG_PATH = path.join(ROOT, 'CHANGELOG.md');

/**
 * Reads the contents of a file synchronously.
 * @param filePath - The path to the file to read.
 * @returns The file contents as a string.
 */
function readFile(filePath: string): string {
  return FileManager.readFileSync(filePath);
}

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
function parseYamlBlock(block: string, logger?: ILogger): Record<string, unknown> | null {
  const log = logger ?? getLogger();
  try {
    const parsed = load(block);
    if (parsed != null && typeof parsed === 'object') {
      return parsed as Record<string, unknown>;
    }
  } catch (e) {
    log.warn('Failed to parse YAML block', { error: String(e) });
  }
  return null;
}

/**
 * Appends an entry to the CHANGELOG.md file under the "Unreleased" section.
 * @param entry - The changelog entry to append.
 * @param logger - Optional logger instance for debugging.
 */
export function appendToChangelog(entry: string, logger?: ILogger): void {
  const log = logger ?? getLogger();
  if (!fs.existsSync(CHANGELOG_PATH)) {
    fs.writeFileSync(CHANGELOG_PATH, '# Changelog\n\nUnreleased\n\n' + entry + '\n', 'utf8');
    log.info('Created CHANGELOG.md and appended entry', { entry });
    return;
  }
  const content = readFile(CHANGELOG_PATH);
  const idx = content.indexOf('Unreleased');
  if (idx === -1) {
    // append at top
    const newContent = '# Changelog\n\nUnreleased\n\n' + entry + '\n\n' + content;
    fs.writeFileSync(CHANGELOG_PATH, newContent, 'utf8');
    return;
  }
  // find end of line after Unreleased heading
  const after = content.indexOf('\n', idx);
  const insertPos = after + 1;
  const newContent = content.slice(0, insertPos) + '- ' + entry + '\n' + content.slice(insertPos);
  fs.writeFileSync(CHANGELOG_PATH, newContent, 'utf8');
  log.info('Appended entry to CHANGELOG.md', { entry });
}

/**
 * Adds a task from a file to the TODO.md file by extracting the first YAML block.
 * @param filePath - The path to the file containing the task YAML block.
 * @param logger - Optional logger instance for debugging.
 * @returns True if the task was successfully added, false otherwise.
 */
export function addTaskFromFile(filePath: string, logger?: ILogger): boolean {
  const log = logger ?? getLogger();
  const abs = path.isAbsolute(filePath) ? filePath : path.join(process.cwd(), filePath);
  if (!FileManager.existsSync(abs)) return false;
  const content = FileManager.readFileSync(abs);
  // find first YAML block in file
  const pattern = /---\r?\n([\s\S]*?)\r?\n---/;
  const m = content.match(pattern);
  if (!m) return false;
  const block = m[0];
  // append to TODO.md with a blank line separator
  const todoContent = readFile(TODO_PATH);
  const newContent = todoContent + '\n' + block + '\n';
  fs.writeFileSync(TODO_PATH, newContent, 'utf8');
  log.info('Appended task block to TODO.md', { src: filePath });
  return true;
}

/**
 * Lists all tasks from the TODO.md file by parsing YAML blocks.
 *
 * This function reads the TODO.md file, extracts all YAML frontmatter blocks,
 * and parses them into Task objects. It handles malformed YAML gracefully by
 * logging warnings and skipping invalid blocks.
 *
 * @param logger - Optional logger instance for debugging and error reporting
 * @returns An array of Task objects parsed from the TODO.md file
 * @throws Will not throw but logs warnings for malformed YAML blocks
 */
export function listTasks(logger?: ILogger): ITask[] {
  const log = logger ?? getLogger();
  const content = readFile(TODO_PATH);
  const blocks = extractYamlBlocks(content);
  const out: ITask[] = [];
  for (const b of blocks) {
    const parsed = parseYamlBlock(b, log);
    if (parsed) out.push(parsed as ITask);
  }
  log.debug('listTasks extracted', { count: out.length });
  return out;
}

/**
 * Finds a task by its ID from the TODO.md file.
 *
 * Searches through all YAML blocks in the TODO.md file to find a task
 * with the specified ID. Returns the first matching task or null if not found.
 *
 * @param id - The unique task ID to search for (e.g., "T-001")
 * @param logger - Optional logger instance for debugging
 * @returns The Task object if found, null if no task with the given ID exists
 */
export function findTaskById(id: string, logger?: ILogger): ITask | null {
  const log = logger ?? getLogger();
  const tasks = listTasks(log);
  const found = tasks.find((t) => String((t as Record<string, unknown>)['id'] ?? '') === id);
  log.debug('findTaskById', { found: Boolean(found), id });
  return found ?? null;
}

/**
 * Previews the completion of a task without actually performing the action.
 * @param id - The task ID to preview completion for.
 * @param logger - Optional logger instance for debugging.
 * @returns A string describing what would happen when completing the task.
 */
export function previewComplete(id: string, logger?: ILogger): string {
  const log = logger ?? getLogger();
  const task = findTaskById(id, log);
  if (task == null) return `Task ${id} not found`;
  const lines = [] as string[];
  lines.push(`Will remove task ${id} from TODO.md`);
  lines.push(`Will append to CHANGELOG.md Unreleased: ${task['id']} — ${task['summary']}`);
  return lines.join('\n');
}

/**
 * Updates a task by ID in the TODO.md file.
 * @param id - The task ID to update.
 * @param updatedTask - The updated task object.
 * @param logger - Optional logger instance for debugging.
 * @returns True if the task was updated successfully, false otherwise.
 */
export function updateTaskById(id: string, updatedTask: ITask, logger?: ILogger): boolean {
  const log = logger ?? getLogger();
  try {
    const content = readFile(TODO_PATH);
    const parts = content.split(/---\r?\n/);
    let found = false;

    for (let i = 1; i < parts.length; i += 2) {
      // eslint-disable-next-line security/detect-object-injection
      const yamlContent = parts[i];
      if (isNonEmptyString(yamlContent)) {
        const task = parseYamlBlock(yamlContent, log);
        if (task && safeGet(task, 'id') === id) {
          // eslint-disable-next-line security/detect-object-injection
          parts[i] = dump({ ...task, ...updatedTask });
          found = true;
          break;
        }
      }
    }

    if (!found) {
      log.warn(`Task ${id} not found for update`);
      return false;
    }

    const newContent = parts.join('---\n');
    fs.writeFileSync(TODO_PATH, newContent, 'utf8');
    log.info(`Updated task ${id}`);
    return true;
  } catch (e) {
    log.error(`Failed to update task ${id}`, { error: String(e) });
    return false;
  }
}

/**
 * Removes a task by ID from the TODO.md file.
 * @param id - The task ID to remove.
 * @param logger - Optional logger instance for debugging.
 * @returns True if the task was removed successfully, false otherwise.
 */
export function removeTaskById(id: string, logger?: ILogger): boolean {
  const log = logger ?? getLogger();
  try {
    const content = readFile(TODO_PATH);
    const parts = content.split(/---\r?\n/);
    let found = false;

    for (let i = 1; i < parts.length; i += 2) {
      // eslint-disable-next-line security/detect-object-injection
      const yamlContent = parts[i];
      // eslint-disable-next-line @typescript-eslint/strict-boolean-expressions
      if (yamlContent) {
        const task = parseYamlBlock(yamlContent, log);
        if (task && task['id'] === id) {
          // Remove this block and its closing ---
          parts.splice(i - 1, 3);
          found = true;
          break;
        }
      }
    }

    if (!found) {
      log.warn(`Task ${id} not found for removal`);
      return false;
    }

    const newContent = parts.join('---\n');
    fs.writeFileSync(TODO_PATH, newContent, 'utf8');
    log.info(`Removed task ${id}`);
    return true;
  } catch (e) {
    log.error(`Failed to remove task ${id}`, { error: String(e) });
    return false;
  }
}
