import * as path from 'path';

import { ITaskStore, IChangelogStore, ILogger, ITask } from '../../types';
import {
  parseYamlBlocksFromFile,
  addYamlBlockFromFile,
  updateYamlBlockById,
  removeYamlBlockById,
} from '../parsers/yaml.parser';
import { getLogger } from '../system/logger';
import { isNullOrUndefined } from '../helpers/type.helper';

import { FileManager } from './file-manager';

const ROOT = path.resolve(process.cwd());
const TODO_PATH = path.join(ROOT, 'TODO.md');
const CHANGELOG_PATH = path.join(ROOT, 'CHANGELOG.md');

/**
 * Manages TODO tasks and changelog operations.
 *
 * This class encapsulates all operations related to managing TODO tasks
 * stored in markdown files and changelog entries. It provides a clean
 * interface for CRUD operations on tasks and changelog management.
 */
export class TaskManager implements ITaskStore, IChangelogStore {
  private readonly logger: ILogger;
  private readonly fileManager: FileManager;

  constructor(logger?: ILogger) {
    this.logger = logger ?? getLogger();
    this.fileManager = new FileManager();
  }

  /**
   * Lists all tasks from the TODO.md file.
   * @returns An array of tasks.
   */
  listTasks(): ITask[] {
    const tasks = parseYamlBlocksFromFile(TODO_PATH, this.fileManager, this.logger) as ITask[];
    this.logger.debug('listTasks extracted', { count: tasks.length });
    return tasks;
  }

  /**
   * Finds a task by its ID from the TODO.md file.
   * @param id The ID of the task to find.
   * @returns The task if found, otherwise null.
   */
  findTaskById(id: string): ITask | null {
    const tasks = this.listTasks();
    const found = tasks.find((task) => task.id === id);
    this.logger.debug('findTaskById', { found: !isNullOrUndefined(found), id });
    return found ?? null;
  }

  /**
   * Adds a task from a file to the TODO.md file.
   * @param filePath The path to the file containing the task in YAML format.
   * @returns True if the task was added successfully, false otherwise.
   */
  addTaskFromFile(filePath: string): boolean {
    return addYamlBlockFromFile(filePath, TODO_PATH, this.fileManager, this.logger);
  }

  /**
   * Updates a task by ID in the TODO.md file.
   * @param id The ID of the task to update.
   * @param updatedTask The updated task data.
   * @returns True if the task was updated successfully, false otherwise.
   */
  updateTaskById(id: string, updatedTask: ITask): boolean {
    return updateYamlBlockById({
      filePath: TODO_PATH,
      fileSystem: this.fileManager,
      id,
      logger: this.logger,
      updatedData: updatedTask,
    });
  }

  /**
   * Removes a task by ID from the TODO.md file.
   * @param id The ID of the task to remove.
   * @returns True if the task was removed successfully, false otherwise.
   */
  removeTaskById(id: string): boolean {
    return removeYamlBlockById(TODO_PATH, this.fileManager, id, this.logger);
  }

  /**
   * Appends an entry to the CHANGELOG.md file under the "Unreleased" section.
   * @param entry The changelog entry to add.
   */
  appendToChangelog(entry: string): void {
    if (!this.fileManager.existsSync(CHANGELOG_PATH)) {
      this.createInitialChangelog(entry);
      return;
    }

    this.appendToExistingChangelog(entry);
  }

  /**
   * Previews the completion of a task without actually performing the action.
   * @param id The ID of the task to preview completion for.
   * @returns A string describing the actions that would be taken.
   */
  previewComplete(id: string): string {
    const task = this.findTaskById(id);
    if (isNullOrUndefined(task)) {
      return `Task ${id} not found`;
    }
    const lines: string[] = [];
    lines.push(`Will remove task ${id} from TODO.md`);
    lines.push(
      `Will append to CHANGELOG.md Unreleased: ${task.id} — ${task['summary'] ?? 'No summary'}`,
    );
    return lines.join('\n');
  }

  /**
   * Creates the initial CHANGELOG.md file with the first entry.
   * @param entry The changelog entry to add.
   */
  private createInitialChangelog(entry: string): void {
    const content = `# Changelog\n\nUnreleased\n\n${entry}\n`;
    this.fileManager.writeFileSync(CHANGELOG_PATH, content);
    this.logger.info('Created CHANGELOG.md and appended entry', { entry });
  }

  /**
   * Appends an entry to an existing CHANGELOG.md file.
   * @param entry The changelog entry to add.
   */
  private appendToExistingChangelog(entry: string): void {
    const content = this.fileManager.readFileSync(CHANGELOG_PATH);
    const unreleasedIndex = content.indexOf('Unreleased');

    if (unreleasedIndex === -1) {
      this.appendAtTopOfChangelog(content, entry);
      return;
    }

    this.appendUnderUnreleasedSection(content, unreleasedIndex, entry);
  }

  /**
   * Appends entry at the top of changelog when no "Unreleased" section exists.
   * @param content The existing changelog content.
   * @param entry The changelog entry to add.
   */
  private appendAtTopOfChangelog(content: string, entry: string): void {
    const newContent = `# Changelog\n\nUnreleased\n\n${entry}\n\n${content}`;
    this.fileManager.writeFileSync(CHANGELOG_PATH, newContent);
  }

  /**
   * Appends entry under the existing "Unreleased" section.
   * @param content The existing changelog content.
   * @param unreleasedIndex The index of the "Unreleased" section.
   * @param entry The changelog entry to add.
   */
  private appendUnderUnreleasedSection(
    content: string,
    unreleasedIndex: number,
    entry: string,
  ): void {
    const afterUnreleasedIndex = content.indexOf('\n', unreleasedIndex);
    if (afterUnreleasedIndex === -1) {
      this.logger.warn('Could not append entry to CHANGELOG.md: no newline found after "Unreleased" section.', { entry });
      return;
    }

    const insertPos = afterUnreleasedIndex + 1;
    const newContent = `${content.slice(0, insertPos)}- ${entry}\n${content.slice(insertPos)}`;
    this.fileManager.writeFileSync(CHANGELOG_PATH, newContent);
    this.logger.info('Appended entry to CHANGELOG.md', { entry });
  }
}
