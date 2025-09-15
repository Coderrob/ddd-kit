import { getLogger, ILogger } from '../lib/logger';
import { IFixerOptions, FixRecord } from '../types';

/**
 * Class responsible for applying automatic fixes to task objects that have validation issues.
 */
export class TaskFixer {
  private log: ILogger;
  private today: string;

  /**
   * Creates a new Fixer instance.
   * @param logger - Optional logger instance for debugging.
   * @param options - Optional configuration options for the fixer.
   */
  constructor(logger?: ILogger, options?: IFixerOptions) {
    this.log = logger ?? getLogger();
    this.today = options?.today ?? new Date().toISOString().slice(0, 10);
  }

  /**
   * Applies basic automatic fixes to common validation issues in a task object.
   * @param asObj - The task object to fix (as a record).
   * @returns An array of FixRecord objects describing the fixes applied.
   */
  applyBasicFixes(asObj: Record<string, unknown>): FixRecord[] {
    const fixes: FixRecord[] = [];
    const id = String(asObj.id ?? '');
    // priority
    const priority = String(asObj.priority ?? '');
    if (!priority || !['P0', 'P1', 'P2', 'P3'].includes(priority)) {
      fixes.push({ id, field: 'priority', old: asObj.priority, new: 'P2' });
      asObj.priority = 'P2';
    }
    // status
    const status = String(asObj.status ?? '');
    if (!status || !['open', 'in-progress', 'blocked', 'done'].includes(status)) {
      fixes.push({ id, field: 'status', old: asObj.status, new: 'open' });
      asObj.status = 'open';
    }
    // dates
    const createdRaw = String(asObj.created ?? '');
    if (!createdRaw || isNaN(Date.parse(createdRaw))) {
      fixes.push({ id, field: 'created', old: asObj.created, new: this.today });
      asObj.created = this.today;
    } else {
      const norm = new Date(createdRaw).toISOString().slice(0, 10);
      if (norm !== createdRaw) {
        fixes.push({ id, field: 'created', old: asObj.created, new: norm });
        asObj.created = norm;
      }
    }
    const updatedRaw = String(asObj.updated ?? '');
    if (!updatedRaw || isNaN(Date.parse(updatedRaw))) {
      fixes.push({ id, field: 'updated', old: asObj.updated, new: this.today });
      asObj.updated = this.today;
    } else {
      const norm2 = new Date(updatedRaw).toISOString().slice(0, 10);
      if (norm2 !== updatedRaw) {
        fixes.push({ id, field: 'updated', old: asObj.updated, new: norm2 });
        asObj.updated = norm2;
      }
    }
    // owner canonicalization
    const ownerRaw = String(asObj.owner ?? '').trim();
    if (ownerRaw) {
      const collapsed = ownerRaw.replace(/\s+/g, ' ');
      const title = collapsed
        .split(' ')
        .map((s) => s.charAt(0).toUpperCase() + s.slice(1).toLowerCase())
        .join(' ');
      if (title !== ownerRaw) {
        fixes.push({ id, field: 'owner', old: asObj.owner, new: title });
        asObj.owner = title;
      }
    }
    // validations default
    if (!asObj.validations) {
      fixes.push({ id, field: 'validations', old: asObj.validations, new: [] });
      asObj.validations = [];
    }
    return fixes;
  }
}
