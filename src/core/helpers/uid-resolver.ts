import path from 'path';

import type { IResolver } from '../../types/IResolver';
import { FileManager } from '../storage/file-manager';
import { parseJsonFile } from '../parsers/json.parser';

import { safeGet } from './type-guards';

export interface RegistryEntry {
  path: string;
  status: string;
  sha: string;
  aliases: string[];
  requires: string[];
}

export class Resolver implements IResolver {
  private registry: Record<string, RegistryEntry | undefined> = {};
  private aliases: Record<string, string> = {};
  private readonly dddKitPath: string;

  constructor(dddKitPath: string) {
    this.dddKitPath = dddKitPath;
    this.loadCatalogs();
  }

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

  resolve(uid: string): { path: string; content: string; status: string } | null {
    const actualUidRaw = safeGet(this.aliases, uid);
    const actualUid = typeof actualUidRaw === 'string' ? actualUidRaw : uid;
    const entry = safeGet<RegistryEntry>(this.registry, actualUid);
    if (!entry) return null;
    const fullPath = path.join(this.dddKitPath, entry.path);
    if (!FileManager.existsSync(fullPath)) return null;
    const content = FileManager.readFileSync(fullPath);
    return { content, path: entry.path, status: entry.status };
  }

  getRequires(uid: string): string[] {
    const entry = safeGet<RegistryEntry>(this.registry, uid);
    if (!entry) return [];
    return entry.requires;
  }

  getAllUids(): string[] {
    return Object.keys(this.registry);
  }

  getRegistry(): Record<string, { status: string; requires: string[] } | undefined> {
    const result: Record<string, { status: string; requires: string[] } | undefined> = {};
    for (const [uid, entry] of Object.entries(this.registry)) {
      if (entry) {
        // eslint-disable-next-line security/detect-object-injection
        result[uid] = { requires: entry.requires, status: entry.status };
      }
    }
    return result;
  }

  updateAlias(oldUid: string, newUid: string): void {
    // eslint-disable-next-line security/detect-object-injection
    this.aliases[oldUid] = newUid;
  }
}
