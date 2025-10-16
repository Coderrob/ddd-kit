import chalk from 'chalk';

import { IOutputWriter, OutputFormat } from '../../types/rendering';
import { isNullOrUndefined, isObject } from '../helpers/type.helper';
import { formatJson } from '../parsers/json.parser';

/**
 * Console-based implementation of IOutputWriter.
 *
 * Provides colored output, structured formatting, and different message types
 * for CLI applications.
 */
export class ConsoleOutputWriter implements IOutputWriter {
  /**
   * Writes a success message with green coloring.
   */
  success(message: string): void {
    console.log(chalk.green(message));
  }

  /**
   * Writes an informational message.
   */
  info(message: string): void {
    console.log(message);
  }

  /**
   * Writes a warning message with yellow coloring.
   */
  warning(message: string): void {
    console.log(chalk.yellow(message));
  }

  /**
   * Writes an error message with red coloring.
   */
  error(message: string): void {
    console.log(chalk.red(message));
  }

  /**
   * Writes a plain message without any formatting.
   */
  write(message: string): void {
    console.log(message);
  }

  /**
   * Writes a line break.
   */
  newline(): void {
    console.log();
  }

  /**
   * Writes structured data in the specified format.
   */
  writeFormatted(data: unknown, format: OutputFormat): void {
    switch (format) {
      case OutputFormat.JSON:
        console.log(formatJson(data));
        break;
      case OutputFormat.CSV:
        this.writeCsv(data);
        break;
      case OutputFormat.TABLE:
        this.writeTable(data);
        break;
      default:
        console.log(String(data));
    }
  }

  /**
   * Writes a section header with bold formatting.
   */
  section(title: string): void {
    console.log(chalk.bold(title));
  }

  /**
   * Writes a key-value pair with aligned formatting.
   */
  keyValue(key: string, value: string): void {
    console.log(`${key}: ${value}`);
  }

  /**
   * Writes data in CSV format.
   */
  private writeCsv(data: unknown): void {
    if (Array.isArray(data)) {
      this.writeCsvArray(data);
    } else {
      console.log(String(data));
    }
  }

  /**
   * Writes an array of objects in CSV format.
   */
  private writeCsvArray(data: unknown[]): void {
    if (data.length === 0) return;

    // Get headers from first object
    const firstItem = data[0];
    if (!isObject(firstItem) || isNullOrUndefined(firstItem)) {
      data.forEach((item) => {
        console.log(String(item));
      });
      return;
    }

    const headers = Object.keys(firstItem);
    console.log(headers.join(','));

    // Write data rows
    data.forEach((item) => {
      if (isObject(item)) {
        const values = headers.map((header) => {
          const value = Reflect.get(item, header) ?? null;
          // Escape quotes and wrap in quotes if contains comma
          const stringValue = String(value ?? '');
          return stringValue.includes(',') ? `"${stringValue.replace(/"/g, '""')}"` : stringValue;
        });
        console.log(values.join(','));
      }
    });
  }

  /**
   * Writes data in table format (simplified).
   */
  private writeTable(data: unknown): void {
    if (Array.isArray(data)) {
      data.forEach((item) => {
        console.log(`- ${String(item)}`);
      });
    } else {
      console.log(String(data));
    }
  }
}
