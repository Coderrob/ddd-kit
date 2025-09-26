import fs from 'fs';

import type { IFileManager } from '../interfaces/IFileManager';

export class FileManager implements IFileManager {
  static readFileSync(path: string): string {
    // eslint-disable-next-line security/detect-non-literal-fs-filename
    return fs.readFileSync(path, 'utf8');
  }

  static writeFileSync(path: string, content: string): void {
    // eslint-disable-next-line security/detect-non-literal-fs-filename
    fs.writeFileSync(path, content);
  }

  static existsSync(path: string): boolean {
    // eslint-disable-next-line security/detect-non-literal-fs-filename
    return fs.existsSync(path);
  }

  static mkdirSync(path: string, options?: { recursive?: boolean }): void {
    // eslint-disable-next-line security/detect-non-literal-fs-filename
    fs.mkdirSync(path, options);
  }

  // Instance wrappers delegating to static implementations (satisfy IFileManager)
  readFileSync(path: string): string {
    return FileManager.readFileSync(path);
  }

  writeFileSync(path: string, content: string): void {
    FileManager.writeFileSync(path, content);
  }

  existsSync(path: string): boolean {
    return FileManager.existsSync(path);
  }

  mkdirSync(path: string, options?: { recursive?: boolean }): void {
    FileManager.mkdirSync(path, options);
  }

  // Async implementations
  readFile(path: string): Promise<string> {
    return new Promise<string>((resolve, reject) => {
      // eslint-disable-next-line security/detect-non-literal-fs-filename
      fs.readFile(path, 'utf8', (err, data) => {
        if (err) {
          reject(err);
          return;
        }
        resolve(data);
      });
    });
  }

  writeFile(path: string, content: string): Promise<void> {
    return new Promise<void>((resolve, reject) => {
      // eslint-disable-next-line security/detect-non-literal-fs-filename
      fs.writeFile(path, content, (err) => {
        if (err) {
          reject(err);
          return;
        }
        resolve();
      });
    });
  }

  mkdir(path: string, options?: { recursive?: boolean }): Promise<void> {
    return new Promise<void>((resolve, reject) => {
      // eslint-disable-next-line security/detect-non-literal-fs-filename
      fs.mkdir(path, options ?? {}, (err) => {
        if (err) {
          reject(err);
          return;
        }
        resolve();
      });
    });
  }
}
