import { CommandCategory } from './CommandCategory';

export interface ICommandMetadata {
  readonly name: string;
  readonly description: string;
  readonly category: CommandCategory;
  readonly aliases?: readonly string[];
}
