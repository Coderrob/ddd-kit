# Command Option Type Definitions

This document describes the type definitions for Commander.js options and arguments for each command type in the DDD-Kit CLI.

## Overview

The `command-options.ts` file provides TypeScript interfaces that define the schema for command-line options and arguments. This improves type safety, provides better IDE support, and makes the CLI more maintainable.

## Available Command Option Types

### Core Commands

#### `NextCommandOptions`

Options for the `next` command that hydrates the next eligible task.

```typescript
interface NextCommandOptions {
  provider?: string; // Task provider: todo, issues, projects
  filters?: string[]; // Filters for task selection
  branchPrefix?: string; // Branch prefix
  pin?: string; // Pin to specific ddd-kit commit/tag
  openPr?: boolean; // Open PR after hydration
}
```

#### `RenderCommandOptions`

Options for the `render` command that re-renders guidance for a specific task.

```typescript
interface RenderCommandOptions {
  pin?: string; // Pin to specific ddd-kit commit/tag
}
```

#### `SupersedeCommandOptions`

Options for the `supersede` command (currently no options defined).

### Reference Commands

#### `RefAuditCommandOptions`

Options for the `ref audit` command (currently no options defined).

### Todo Commands

#### `TodoAddCommandOptions`

Options for the `todo add` command (currently no options defined).

#### `TodoCompleteCommandOptions`

Options for the `todo complete` command.

```typescript
interface TodoCompleteCommandOptions {
  message?: string; // Completion message
  dryRun?: boolean; // Perform dry run without making changes
}
```

#### `TodoListCommandOptions`

Options for the `todo list` command (currently no options defined).

#### `TodoShowCommandOptions`

Options for the `todo show` command (currently no options defined).

### Validation Commands

#### `ValidateTasksCommandOptions`

Options for the `validate tasks` command (currently no options defined).

#### `ValidateFixCommandOptions`

Options for the `validate fix` command.

```typescript
interface ValidateFixCommandOptions {
  fix?: boolean; // Apply fixes automatically
  dryRun?: boolean; // Perform dry run without making changes
  format?: 'json' | 'csv'; // Output format
  exclude?: string; // Pattern to exclude tasks
}
```

## Benefits

1. **Type Safety**: TypeScript compiler catches type errors at compile time
2. **IDE Support**: Better intellisense and autocomplete in IDEs
3. **Documentation**: Interface definitions serve as documentation
4. **Maintainability**: Changes to command options are tracked by the type system
5. **Consistency**: Ensures consistent option handling across commands

## Usage in Commands

Each command's `configure` method now uses typed parameters:

```typescript
.action(async (options: NextCommandOptions) => {
  // TypeScript knows exactly what properties are available
  const cmd = new NextCommand();
  await cmd.execute(options);
});
```

This provides compile-time validation that the correct options are being passed to each command.
