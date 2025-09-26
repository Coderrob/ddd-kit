export interface IResolver {
  resolve(uid: string): { path: string; content: string; status: string } | null;
  getRequires(uid: string): string[];
  getAllUids(): string[];
  getRegistry(): Record<string, { status: string; requires: string[] } | undefined>;
  updateAlias(oldUid: string, newUid: string): void;
}
