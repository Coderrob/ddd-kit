import * as path from 'path';

import { ITaskStore, IChangelogStore, ILogger, ITask } from '../../types';
import {
  parseYamlBlocksFromFile,
  addYamlBlockFromFile,
  updateYamlBlockById,
  removeYamlBlockById,
} from '../parsers/yaml.parser';
import { getLogger } from '../system/logger';
import { isNullOrUndefined } from '../helpers/type-guards';

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
export class TodoManager implements ITaskStore, IChangelogStore {
  private readonly logger: ILogger;
  private readonly fileManager: FileManager;

  constructor(logger?: ILogger) {
    this.logger = logger ?? getLogger();
    this.fileManager = new FileManager();
  }

  /**
   * Lists all tasks from the TODO.md file.
   */
  listTasks(): ITask[] {
    const tasks = parseYamlBlocksFromFile(TODO_PATH, this.fileManager, this.logger) as ITask[];
    this.logger.debug('listTasks extracted', { count: tasks.length });
    return tasks;
  }

  /**
   * Finds a task by its ID from the TODO.md file.
   */
  findTaskById(id: string): ITask | null {
    const tasks = this.listTasks();
    const found = tasks.find((task) => task.id === id);
    this.logger.debug('findTaskById', { found: !isNullOrUndefined(found), id });
    return found ?? null;
  }

  /**
   * Adds a task from a file to the TODO.md file.
   */
  addTaskFromFile(filePath: string): boolean {
    return addYamlBlockFromFile(filePath, TODO_PATH, this.fileManager, this.logger);
  }

  /**
   * Updates a task by ID in the TODO.md file.
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
   */
  removeTaskById(id: string): boolean {
    return removeYamlBlockById(TODO_PATH, this.fileManager, id, this.logger);
  }

  /**
   * Appends an entry to the CHANGELOG.md file under the "Unreleased" section.
   */
  appendToChangelog(entry: string): void {
    if (!this.fileManager.existsSync(CHANGELOG_PATH)) {
      this.fileManager.writeFileSync(CHANGELOG_PATH, `# Changelog\n\nUnreleased\n\n${entry}\n`);
      this.logger.info('Created CHANGELOG.md and appended entry', { entry });
      return;
    }

    const content = this.fileManager.readFileSync(CHANGELOG_PATH);
    const idx = content.indexOf('Unreleased');
    if (idx === -1) {
      // append at top
      const newContent = `# Changelog\n\nUnreleased\n\n${entry}\n\n${content}`;
      this.fileManager.writeFileSync(CHANGELOG_PATH, newContent);
      return;
    }

    // find end of line after Unreleased heading
    const after = content.indexOf('\n', idx);
    const insertPos = after + 1;
    const newContent = `${content.slice(0, insertPos)}- ${entry}\n${content.slice(insertPos)}`;
    this.fileManager.writeFileSync(CHANGELOG_PATH, newContent);
    this.logger.info('Appended entry to CHANGELOG.md', { entry });
  }

  /**
   * Previews the completion of a task without actually performing the action.
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
}
