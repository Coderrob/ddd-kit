import path from 'path';

import { FileManager } from '../utils/file-manager';

/**
 * Class responsible for loading JSON schema files from the filesystem.
 */
export class SchemaLoader {
  private readonly schemaPath: string;

  /**
   * Creates a new SchemaLoader instance.
   * @param schemaPath - Optional path to the schema file. Defaults to 'docs/templates/task-schema.json'.
   */
  constructor(schemaPath?: string) {
    const root = process.cwd();
    this.schemaPath = schemaPath ?? path.join(root, 'docs', 'templates', 'task-schema.json');
  }

  /**
   * Loads and parses the JSON schema file.
   * @returns The parsed JSON schema object.
   * @throws Error if the schema file is not found or cannot be parsed.
   */
  load(): unknown {
    if (!FileManager.existsSync(this.schemaPath))
      throw new Error('Schema file not found: ' + this.schemaPath);
    const raw = FileManager.readFileSync(this.schemaPath);
    return JSON.parse(raw);
  }
}
