import * as path from 'path';

import { IRegistryEntry, IResolver, RegistryEntryDetails } from '../../types';
import { parseJsonFile } from '../parsers/json.parser';
import { FileManager } from '../storage';

import { safeGet } from './object.helper';
import { isString } from './type.helper';

export class Resolver implements IResolver {
  private registry: Record<string, IRegistryEntry | undefined> = {};
  private aliases: Record<string, string> = {};
  private readonly dddKitPath: string;

  /**
   * Creates a new Resolver instance.
   * @param dddKitPath - The path to the DDD-Kit standards directory
   */
  constructor(dddKitPath: string) {
    this.dddKitPath = dddKitPath;
    this.loadCatalogs();
  }

  /**
   * Loads the registry and aliases catalogs from the file system.
   */
  private loadCatalogs() {
    const fileManager = new FileManager();
    const registryPath = path.join(this.dddKitPath, 'standards', 'catalogs', 'registry.json');
    const aliasesPath = path.join(this.dddKitPath, 'standards', 'catalogs', 'aliases.json');
    if (fileManager.existsSync(registryPath)) {
      this.registry = parseJsonFile(registryPath, fileManager) || {};
    }
    if (fileManager.existsSync(aliasesPath)) {
      this.aliases = parseJsonFile(aliasesPath, fileManager) || {};
    }
  }

  /**
   * Resolves a UID to its content and metadata.
   * @param uid - The UID to resolve
   * @returns The resolved content and metadata, or null if not found
   */
  resolve(uid: string): { path: string; content: string; status: string } | null {
    const actualUidRaw = safeGet(this.aliases, uid);
    const actualUid = isString(actualUidRaw) ? actualUidRaw : uid;
    const entry = safeGet<IRegistryEntry>(this.registry, actualUid);
    if (!entry) {
      return null;
    }
    const fullPath = path.join(this.dddKitPath, entry.path);
    if (!FileManager.existsSync(fullPath)) {
      return null;
    }
    const content = FileManager.readFileSync(fullPath);
    return { content, path: entry.path, status: entry.status };
  }

  /**
   * Gets the requirements (dependencies) for a UID.
   * @param uid - The UID to get requirements for
   * @returns Array of required UIDs
   */
  getRequires(uid: string): string[] {
    const entry = safeGet<IRegistryEntry>(this.registry, uid);
    if (!entry) {
      return [];
    }
    return entry.requires;
  }

  /**
   * Gets all available UIDs in the registry.
   * @returns Array of all UID strings
   */
  getAllUids(): string[] {
    return Object.keys(this.registry);
  }

  /**
   * Gets the complete registry with status and requirements for each UID.
   * @returns Registry object with UID details
   */
  getRegistry(): Record<string, RegistryEntryDetails | undefined> {
    const result: Record<string, RegistryEntryDetails | undefined> = {};
    for (const [uid, entry] of Object.entries(this.registry)) {
      if (entry) {
        // eslint-disable-next-line security/detect-object-injection
        result[uid] = { requires: entry.requires, status: entry.status };
      }
    }
    return result;
  }

  /**
   * Updates an alias mapping from old UID to new UID.
   * @param oldUid - The old UID to be aliased
   * @param newUid - The new UID to map to
   */
  updateAlias(oldUid: string, newUid: string): void {
    // eslint-disable-next-line security/detect-object-injection
    this.aliases[oldUid] = newUid;
  }
}
