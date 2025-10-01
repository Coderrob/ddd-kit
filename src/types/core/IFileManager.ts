export interface IFileManager {
  existsSync(path: string): boolean;
  isReadable(path: string): boolean;
  mkdir(path: string, options?: { recursive?: boolean }): Promise<void>;
  mkdirSync(path: string, options?: { recursive?: boolean }): void;
  readFile(path: string): Promise<string>;
  readFileSync(path: string): string;
  statSync(path: string): { isFile(): boolean; isDirectory(): boolean };
  writeFile(path: string, content: string): Promise<void>;
  writeFileSync(path: string, content: string): void;
}
