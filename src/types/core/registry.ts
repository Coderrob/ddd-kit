/**
 * Registry-related types for UID resolution and dependency management
 */

export interface IRegistryEntry {
  path: string;
  status: string;
  sha: string;
  aliases: string[];
  requires: string[];
}

export interface RegistryEntryDetails {
  status: string;
  requires: string[];
}
