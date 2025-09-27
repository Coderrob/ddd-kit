import fs from 'fs';
import path from 'path';

import { ILogger } from '../../types/ILogger';
import { ITask } from '../../types/ITask';
import { getLogger } from '../system/logger';
import { isNullOrUndefined } from '../helpers/type-guards';
import {
  addYamlBlockFromFile,
  parseYamlBlocksFromFile,
  updateYamlBlockById,
  removeYamlBlockById,
  UpdateYamlBlockOptions,
} from '../parsers/yaml.parser';

import { FileManager } from './file-manager';

const ROOT = path.resolve(process.cwd());
const TODO_PATH = path.join(ROOT, 'TODO.md');
const CHANGELOG_PATH = path.join(ROOT, 'CHANGELOG.md');

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
  const content = FileManager.readFileSync(CHANGELOG_PATH);
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
  const fileManager = new FileManager();
  return addYamlBlockFromFile(filePath, TODO_PATH, fileManager, logger);
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
  const fileManager = new FileManager();
  const tasks = parseYamlBlocksFromFile(TODO_PATH, fileManager, log) as ITask[];
  log.debug('listTasks extracted', { count: tasks.length });
  return tasks;
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
  if (isNullOrUndefined(task)) return `Task ${id} not found`;
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
  const fileManager = new FileManager();
  const options: UpdateYamlBlockOptions = {
    filePath: TODO_PATH,
    fileSystem: fileManager,
    id,
    updatedData: updatedTask,
  };
  if (logger) {
    options.logger = logger;
  }
  return updateYamlBlockById(options);
}

/**
 * Removes a task by ID from the TODO.md file.
 * @param id - The task ID to remove.
 * @param logger - Optional logger instance for debugging.
 * @returns True if the task was removed successfully, false otherwise.
 */
export function removeTaskById(id: string, logger?: ILogger): boolean {
  const fileManager = new FileManager();
  return removeYamlBlockById(TODO_PATH, id, fileManager, logger);
}
