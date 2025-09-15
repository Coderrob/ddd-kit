import fs from 'fs';
import yaml from 'js-yaml';
import path from 'path';

import { getLogger, ILogger } from '../lib/logger';
import { Task } from '../types';

const ROOT = path.resolve(__dirname, '..', '..');
const TODO_PATH = path.join(ROOT, 'TODO.md');
const CHANGELOG_PATH = path.join(ROOT, 'CHANGELOG.md');

/**
 * Reads the contents of a file synchronously.
 * @param filePath - The path to the file to read.
 * @returns The file contents as a string.
 */
function readFile(filePath: string): string {
  return fs.readFileSync(filePath, 'utf8');
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
export function listTasks(logger?: ILogger): Task[] {
  const log = logger ?? getLogger();
  const content = readFile(TODO_PATH);
  const blocks = extractYamlBlocks(content);
  const out: Task[] = [];
  for (const b of blocks) {
    try {
      const parsed = yaml.load(b);
      if (parsed && typeof parsed === 'object') out.push(parsed as Task);
    } catch (e) {
      log.warn('Failed to parse YAML block in TODO.md', { error: String(e) });
    }
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
export function findTaskById(id: string, logger?: ILogger): Task | null {
  const log = logger ?? getLogger();
  const tasks = listTasks(log);
  const found = tasks.find((t) => String((t as Record<string, unknown>).id ?? '') === id);
  log.debug('findTaskById', { id, found: Boolean(found) });
  return found || null;
}

/**
 * Removes a task by its ID from the TODO.md file.
 *
 * Searches for and removes the YAML block containing the task with the specified ID.
 * The task is completely removed from the TODO.md file. This operation is permanent
 * and cannot be undone.
 *
 * @param id - The unique task ID to remove (e.g., "T-001")
 * @param logger - Optional logger instance for debugging
 * @returns True if the task was found and successfully removed, false if the task was not found
 */
export function removeTaskById(id: string, logger?: ILogger): boolean {
  const log = logger ?? getLogger();
  const content = readFile(TODO_PATH);
  const pattern = /---\r?\n([\s\S]*?)\r?\n---/g;
  let match: RegExpExecArray | null;
  let newContent = content;
  while ((match = pattern.exec(content)) !== null) {
    const block = match[0];
    try {
      const inner = block.replace(/^---\r?\n|\r?\n---$/g, '');
      const data = yaml.load(inner);
      if (data && typeof data === 'object') {
        const asObj = data as Record<string, unknown>;
        const idVal = String(asObj.id ?? '');
        if (idVal === id) {
          newContent = newContent.replace(block, '');
          fs.writeFileSync(TODO_PATH, newContent, 'utf8');
          log.info('Removed task from TODO.md', { id });
          return true;
        }
      }
    } catch (e) {
      // skip parse errors
    }
  }
  return false;
}

/**
 * Updates a task by its ID in the TODO.md file.
 *
 * Finds the YAML block containing the task with the specified ID and replaces it
 * with the updated task data. The entire task block is replaced with the new data.
 *
 * @param id - The unique task ID to update (e.g., "T-001")
 * @param updated - The complete updated Task object with all required fields
 * @returns True if the task was found and successfully updated, false if the task was not found
 */
export function updateTaskById(id: string, updated: Task): boolean {
  const content = readFile(TODO_PATH);
  const pattern = /---\r?\n([\s\S]*?)\r?\n---/g;
  let match: RegExpExecArray | null;
  let newContent = content;
  let changed = false;
  while ((match = pattern.exec(content)) !== null) {
    const block = match[0];
    try {
      const inner = block.replace(/^---\r?\n|\r?\n---$/g, '');
      const data = yaml.load(inner);
      if (data && typeof data === 'object') {
        const asObj = data as Record<string, unknown>;
        const idVal = String(asObj.id ?? '');
        if (idVal === id) {
          const dumped = yaml.dump(updated as Record<string, unknown>);
          const replacement = `---\n${dumped}---`;
          newContent = newContent.replace(block, replacement);
          changed = true;
        }
      }
    } catch (e) {
      // skip invalid blocks
    }
  }
  if (changed) {
    fs.writeFileSync(TODO_PATH, newContent, 'utf8');
  }
  return changed;
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
 * Extracts YAML blocks from markdown content.
 * @param md - The markdown content to parse.
 * @returns An array of YAML block contents.
 */
function extractYamlBlocks(md: string): string[] {
  const blocks: string[] = [];
  const pattern = /---\r?\n([\s\S]*?)\r?\n---/g;
  let match: RegExpExecArray | null;
  while ((match = pattern.exec(md)) !== null) {
    blocks.push(match[1]);
  }
  return blocks;
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
  if (!fs.existsSync(abs)) return false;
  const content = fs.readFileSync(abs, 'utf8');
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
 * Previews the completion of a task without actually performing the action.
 * @param id - The task ID to preview completion for.
 * @param logger - Optional logger instance for debugging.
 * @returns A string describing what would happen when completing the task.
 */
export function previewComplete(id: string, logger?: ILogger): string {
  const log = logger ?? getLogger();
  const task = findTaskById(id, log);
  if (!task) return `Task ${id} not found`;
  const lines = [] as string[];
  lines.push(`Will remove task ${id} from TODO.md`);
  lines.push(`Will append to CHANGELOG.md Unreleased: ${task.id} — ${task.summary}`);
  return lines.join('\n');
}
