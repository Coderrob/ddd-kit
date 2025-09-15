export interface ILogger {
  info(message: string, meta?: Record<string, unknown>): void; // eslint-disable-line no-unused-vars
  warn(message: string, meta?: Record<string, unknown>): void; // eslint-disable-line no-unused-vars
  error(message: string, meta?: Record<string, unknown>): void; // eslint-disable-line no-unused-vars
  debug(message: string, meta?: Record<string, unknown>): void; // eslint-disable-line no-unused-vars
  child(bindings: Record<string, unknown>): ILogger; // eslint-disable-line no-unused-vars
}
