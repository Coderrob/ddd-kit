import * as fs from 'fs';

import { IFileManager } from '../../types';

export class FileManager implements IFileManager {
  /**
   * Synchronous file read
   * @param path The file path to read.
   * @returns The file content as a string.
   */
  static readFileSync(path: string): string {
    // eslint-disable-next-line security/detect-non-literal-fs-filename
    return fs.readFileSync(path, 'utf8');
  }

  /**
   * Synchronous file write
   * @param path The file path to write.
   * @param content The content to write to the file.
   */
  static writeFileSync(path: string, content: string): void {
    // eslint-disable-next-line security/detect-non-literal-fs-filename
    fs.writeFileSync(path, content);
  }

  /**
   * Synchronous existence check
   * @param path The file or directory path to check.
   * @returns True if the path exists, false otherwise.
   */
  static existsSync(path: string): boolean {
    // eslint-disable-next-line security/detect-non-literal-fs-filename
    return fs.existsSync(path);
  }

  /**
   * Synchronous directory creation
   * @param path The directory path to create.
   * @param options Optional options, e.g. { recursive: true }.
   */
  static mkdirSync(path: string, options?: { recursive?: boolean }): void {
    // eslint-disable-next-line security/detect-non-literal-fs-filename
    fs.mkdirSync(path, options);
  }

  /**
   * Synchronous stat retrieval
   * @param path The file or directory path to stat.
   * @returns The fs.Stats object with isFile() and isDirectory() methods.
   */
  static statSync(path: string): { isFile(): boolean; isDirectory(): boolean } {
    // eslint-disable-next-line security/detect-non-literal-fs-filename
    return fs.statSync(path);
  }

  /**
   * Check if a file or directory is readable
   * @param path The file or directory path to check.
   * @returns True if the path is readable, false otherwise.
   */
  static isReadable(path: string): boolean {
    try {
      // eslint-disable-next-line security/detect-non-literal-fs-filename
      fs.accessSync(path, fs.constants.R_OK);
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Instance wrappers delegating to static implementations (satisfy IFileManager)
   * @param path The file path to read.
   * @returns The file content as a string.
   */
  readFileSync(path: string): string {
    return FileManager.readFileSync(path);
  }

  /**
   * Instance wrappers delegating to static implementations (satisfy IFileManager)
   * @param path the file path to write.
   * @param content the content to write.
   */
  writeFileSync(path: string, content: string): void {
    FileManager.writeFileSync(path, content);
  }

  /**
   * Instance wrapper delegating to static implementation (satisfy IFileManager)
   * @param path The directory path to create.
   * @param options Optional options, e.g. { recursive: true }.
   */
  mkdirSync(path: string, options?: { recursive?: boolean }): void {
    FileManager.mkdirSync(path, options);
  }

  /**
   * Instance wrapper delegating to static implementation (satisfy IFileManager)
   * @param path The file or directory path to stat.
   * @returns The fs.Stats object with isFile() and isDirectory() methods.
   */
  statSync(path: string): { isFile(): boolean; isDirectory(): boolean } {
    return FileManager.statSync(path);
  }

  /**
   * Check if a file or directory is readable
   * @param path The file or directory path to check.
   * @returns True if the path is readable, false otherwise.
   */
  isReadable(path: string): boolean {
    return FileManager.isReadable(path);
  }

  /**
   * Instance wrapper delegating to static implementation (satisfy IFileManager)
   * @param path The file or directory path to check.
   * @returns True if the path exists, false otherwise.
   */
  existsSync(path: string): boolean {
    return FileManager.existsSync(path);
  }

  /**
   * Asynchronous file read
   * @param path The file path to read.
   * @returns Promise that resolves to the file content as a string.
   */
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

  /**
   * Asynchronous file write
   * @param path The file path to write.
   * @param content The content to write to the file.
   * @returns Promise that resolves when the write operation is complete.
   */
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

  /**
   * Asynchronous directory creation
   * @param path The directory path to create.
   * @param options Optional options, e.g. { recursive: true }.
   * @returns Promise that resolves when the directory creation is complete.
   */
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
