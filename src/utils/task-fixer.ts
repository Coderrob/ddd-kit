import { IFixerOptions } from '../interfaces/IFixerOptions';
import { FixRecord } from '../interfaces/FixRecord';
import { TaskPriority } from '../interfaces/TaskPriority';
import { TaskStatus } from '../interfaces/TaskStatus';

/**
 * Class responsible for applying automatic fixes to task objects that have validation issues.
 */
export class TaskFixer {
  private readonly today: string;

  /**
   * Creates a new Fixer instance.
   * @param options - Optional configuration options for the fixer.
   */
  constructor(options?: IFixerOptions) {
    this.today = options?.today ?? new Date().toISOString().slice(0, 10);
  }

  /**
   * Applies basic automatic fixes to common validation issues in a task object.
   * @param asObj - The task object to fix (as a record).
   * @returns An array of FixRecord objects describing the fixes applied.
   */
  applyBasicFixes(asObj: Record<string, unknown>): FixRecord[] {
    const fixes: FixRecord[] = [];
    const id = String(asObj['id'] ?? '');

    this.fixPriority(asObj, fixes, id);
    this.fixStatus(asObj, fixes, id);
    this.fixDates(asObj, fixes, id);
    this.fixOwnerCanonicalization(asObj, fixes, id);

    return fixes;
  }

  /**
   * Fixes the priority field if it's missing or invalid.
   */
  private fixPriority(asObj: Record<string, unknown>, fixes: FixRecord[], id: string): void {
    const priority = String(asObj['priority'] ?? '');
    const validPriorities = Object.values(TaskPriority);

    if (!priority || !validPriorities.includes(priority as TaskPriority)) {
      fixes.push({ field: 'priority', id, new: TaskPriority.P2, old: asObj['priority'] });
      asObj['priority'] = TaskPriority.P2;
    }
  }

  /**
   * Fixes the status field if it's missing or invalid.
   */
  private fixStatus(asObj: Record<string, unknown>, fixes: FixRecord[], id: string): void {
    const status = String(asObj['status'] ?? '');
    const validStatuses = Object.values(TaskStatus);

    if (!status || !validStatuses.includes(status as TaskStatus)) {
      fixes.push({ field: 'status', id, new: TaskStatus.OPEN, old: asObj['status'] });
      asObj['status'] = TaskStatus.OPEN;
    }
  }

  /**
   * Fixes date fields (created, updated) if they're missing or invalid.
   */
  private fixDates(asObj: Record<string, unknown>, fixes: FixRecord[], id: string): void {
    this.fixCreatedDate(asObj, fixes, id);
    this.fixUpdatedDate(asObj, fixes, id);
  }

  /**
   * Fixes the created date field.
   */
  private fixCreatedDate(asObj: Record<string, unknown>, fixes: FixRecord[], id: string): void {
    const createdRaw = String(asObj['created'] ?? '');
    if (!createdRaw || isNaN(Date.parse(createdRaw))) {
      fixes.push({ field: 'created', id, new: this.today, old: asObj['created'] });
      asObj['created'] = this.today;
    } else {
      const norm = new Date(createdRaw).toISOString().slice(0, 10);
      if (norm !== createdRaw) {
        fixes.push({ field: 'created', id, new: norm, old: asObj['created'] });
        asObj['created'] = norm;
      }
    }
  }

  /**
   * Fixes the updated date field.
   */
  private fixUpdatedDate(asObj: Record<string, unknown>, fixes: FixRecord[], id: string): void {
    const updatedRaw = String(asObj['updated'] ?? '');
    if (!updatedRaw || isNaN(Date.parse(updatedRaw))) {
      fixes.push({ field: 'updated', id, new: this.today, old: asObj['updated'] });
      asObj['updated'] = this.today;
    } else {
      const norm2 = new Date(updatedRaw).toISOString().slice(0, 10);
      if (norm2 !== updatedRaw) {
        fixes.push({ field: 'updated', id, new: norm2, old: asObj['updated'] });
        asObj['updated'] = norm2;
      }
    }
  }

  /**
   * Canonicalizes the owner field by trimming and title-casing.
   */
  private fixOwnerCanonicalization(
    asObj: Record<string, unknown>,
    fixes: FixRecord[],
    id: string,
  ): void {
    const ownerRaw = String(asObj['owner'] ?? '').trim();
    if (ownerRaw) {
      const collapsed = ownerRaw.replace(/\s+/g, ' ');
      const title = collapsed
        .split(' ')
        .map((s) => s.charAt(0).toUpperCase() + s.slice(1).toLowerCase())
        .join(' ');
      if (title !== ownerRaw) {
        fixes.push({ field: 'owner', id, new: title, old: asObj['owner'] });
        asObj['owner'] = title;
      }
    }
  }
}
