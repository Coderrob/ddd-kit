# Audit of `src` Folder

## Overview

This document provides a detailed audit of the `src` folder, focusing on interfaces, types, functions, enums, and constants. The goal is to ensure that the architecture is interface-driven, with all concrete implementations adhering to well-defined interfaces. Missing interfaces will be identified, and new ones will be proposed where necessary.

---

## Interfaces

### Existing Interfaces

- **`ICommand`**
  - Purpose: Defines the structure for command classes.
  - Methods:
    - `execute(args?: Record<string, unknown>): Promise<void>`

- **`ILogger`**
  - Purpose: Provides logging functionality.
  - Methods:
    - `info(message: string, meta?: Record<string, unknown>): void`
    - `error(message: string, meta?: Record<string, unknown>): void`

- **`IContentRenderer`**
  - Purpose: Renders content in various formats.
  - Methods:
    - `render(content: unknown): string`

- **`IExclusionFilter`**
  - Purpose: Filters out excluded items.
  - Methods:
    - `filter(items: unknown[]): unknown[]`

- **`ITaskFixer`**
  - Purpose: Fixes tasks based on specific criteria.
  - Methods:
    - `fix(task: Task): Task`

- **`ITaskValidator`**
  - Purpose: Validates tasks.
  - Methods:
    - `validate(task: Task): boolean`

- **`IUidRepository`**
  - Purpose: Manages UID-related operations.
  - Methods:
    - `resolve(uid: string): ResolvedUid`

Additional exported interfaces discovered in `src` (complete listing):

- **`Task`** (from `Task.ts`)
  - shape: `id`, optional `title`, `state`, `references`, `owner`, `due`, `repo`, `language`, `library`, `dddKitCommit`, `resolvedReferences`, `branch`, and index signature for extra properties.
- **`ResolvedReference`** (from `Task.ts`) - uid, contentHash, resolvedAt
- **`Provenance`, `HydrationOptions`, `RenderOptions`, `ResolvedRef`** (from `Task.ts`) - various helper interfaces used by hydration and rendering flows.
- **`ResolvedUid`** (from `ResolvedUid.ts`) - uid, content, status ('active'|'deprecated'|'archived'), contentHash, optional section.
- **`IValidationResult`** and **`IValidationResultBuilder`** - builder pattern for validation results.
- **`IUidRepository`** - repository contract for UID resolution (async methods present).
- **`ITaskRepository`, `ITaskStore`, `ITaskValidator`, `ITaskFixer`, `IReferenceAuditUseCase`, `IValidationResultBuilder`, `IUIdSupersedeUseCase`, `ITaskHydrationUseCase`, `ITaskRenderUseCase`** (various use-case and repository interfaces across `src`).

Notes:

- Many interfaces use Promises and async contracts; any sync-only concrete implementation must clearly document or provide async wrappers.
- `Task` is exported as an interface (not a class) in `Task.ts` — this aligns well with interface-driven design.

### Missing Interfaces

- **`BaseCommand`**
  - Current State: Abstract class without an interface.
  - Proposed Interface: `ICommand` already exists and aligns with `BaseCommand`.

- **`FileManager`**
  - Current State: Concrete implementation without an interface.
  - Proposed Interface:

    ```typescript
    interface IFileManager {
      readFile(path: string): Promise<string>;
      writeFile(path: string, content: string): Promise<void>;
      deleteFile(path: string): Promise<void>;
    }
    ```

Action taken: created `IFileManager.ts` with both sync and async method contracts and updated `FileManager.ts` to implement it. This addresses a common missing contract and enables mocking in tests.

- **`Task`**
  - Current State: Class without an interface.
  - Proposed Interface:

    ```typescript
    interface ITask {
      id: string;
      title: string;
      state: TaskStatus;
      owner?: string;
    }
    ```

Note: `Task` is actually exported as an interface in `Task.ts` (see `export interface Task`) — no action needed.

New interfaces added:

- `IContainer` (`src/IContainer.ts`) - contract for DI container (register, registerSingleton, resolve, has).
- `IRenderer` (`src/IRenderer.ts`) - contract for renderer implementations.

---

## Types

### Existing Types

- **`TaskDetails`**
  - Purpose: Provides detailed information about a task.
  - Properties:
    - `detailed_requirements?: unknown`
    - `validations?: unknown`

- **`ResolvedUid`**
  - Purpose: Represents a resolved UID.
  - Properties:
    - `uid: string`
    - `status: UidStatus`

### Missing Types

- **`ValidationResult`**
  - Proposed Type:

    ```typescript
    type ValidationResult = {
      isValid: boolean;
      errors: string[];
    };
    ```

---

## Enums

### Existing Enums

- **`TaskStatus`**
  - Values:
    - `Pending`
    - `InProgress`
    - `Completed`

- **`UidStatus`**
  - Values:
    - `Active`
    - `Superseded`

---

## Functions

### Existing Functions

- **`findTaskById`**
  - Purpose: Finds a task by its ID.
  - Parameters:
    - `id: string`
    - `logger: ILogger`
  - Returns: `Task | null`

- **`validateTask`**
  - Purpose: Validates a task.
  - Parameters:
    - `task: Task`
  - Returns: `boolean`

### Missing Functions

- **`logTaskDetails`**
  - Proposed Function:

    ```typescript
    function logTaskDetails(task: ITask, logger: ILogger): void {
      logger.info(`Task ID: ${task.id}`);
      logger.info(`Title: ${task.title}`);
      logger.info(`Status: ${task.state}`);
    }
    ```

---

## Architecture Recommendations

1. **Interface-Driven Development**
   - Ensure all concrete classes implement well-defined interfaces.
   - Use existing interfaces (`ICommand`, `ILogger`, etc.) wherever applicable.

2. **Consolidation of Related Functionality**
   - Group related functionality into cohesive modules.
   - Example: Task-related interfaces (`ITask`, `ITaskValidator`, `ITaskFixer`) should reside in a `task` module.

3. **Refactoring Plan**
   - Create missing interfaces for `FileManager`, `Task`, etc.
   - Refactor existing classes to adhere to these interfaces.
   - Update the architecture documentation to reflect these changes.

---

## Next Steps

1. Implement missing interfaces and types.
2. Refactor concrete classes to adhere to the new interfaces.
3. Update this document to reflect the changes.
4. Conduct a final review to ensure alignment with interface-driven development principles.

---

## Action Plan & Checklist

Below is a prioritized checklist tying interfaces to concrete implementations, tests/mocks to add, and edge cases to validate.

- IFileManager
  - Implementation: `src/FileManager.ts` (class `FileManager` implements sync + async methods)
  - Tests/mocks: create `__mocks__/IFileManager.mock.ts` returning predictable file content, and unit tests for `renderer` that use the mock.
  - Edge cases: permission errors, non-existent directories, path injection; ensure errors are surfaced as exceptions.

- IContainer
  - Implementation: `src/container.ts` (`ContainerImpl`) and exported `container` typed as `IContainer`.
  - Tests/mocks: test service registration, singleton behavior, missing service resolution error.
  - Edge cases: duplicate registrations, lazy factory exceptions, circular dependencies (note: container is simple and doesn't detect cycles).

- IRenderer
  - Implementation: `src/renderer.ts` (`Renderer` implements `IRenderer`).
  - Tests/mocks: mock `FileManager` and verify `implementation-notes.md` content and managed blocks.
  - Edge cases: extremely large resolved content, missing sections, invalid front-matter.

- IUidRepository
  - Implementations: various; ensure async contract is always preserved.
  - Edge cases: network failures, 404s for missing UIDs, malformed content.

- Task-related interfaces (`Task`, `ResolvedRef`, `HydrationOptions`)
  - Confirmed implemented in `src/Task.ts` and used across hydration/rendering flows.
  - Edge cases: unknown additional task properties (index signature handles extra keys), missing `id` should be validated earlier.

### Cross-cutting concerns

- Error handling policy: Prefer throwing domain-specific errors (e.g., `TaskNotFoundError`, `UidResolutionError`) rather than raw Error. Many domain errors already exist in `src`.
- Sync vs Async: Prefer async interfaces for IO-bound contracts (repositories, file system) to avoid blocking the event loop. `IFileManager` includes both to remain backward-compatible.
- Versioning & Compatibility: Add a small `INTERFACE_VERSION` file or constants for critical interfaces used by external consumers (e.g., container service keys).

### Low-risk Improvements (proactive)

- Add unit tests for `FileManager` wrappers and `Renderer.extractSection` behaviour.
- Add a small README under `src/interfaces/` documenting each interface intent and common usage patterns.
- Move related interfaces into logical subfolders (`src/interfaces/task.ts`, `src/interfaces/storage.ts`) once stabilized.

---

## Summary of Changes Made

- Created `src/IFileManager.ts`, `src/IContainer.ts`, `src/IRenderer.ts` to provide missing contracts.
- Updated `src/FileManager.ts` to implement `IFileManager` (added async wrappers and instance methods).
- Updated `src/container.ts` to implement `IContainer` and export the `container` typed as `IContainer`.
- Updated `src/renderer.ts` to implement `IRenderer`.
- Expanded `audit.md` with a comprehensive list of exported interfaces, types, enums, edge cases, and an action checklist.

If you'd like, I can now:

- Create a `src/interfaces/` index and move the new interfaces there (small refactor).
- Generate basic unit test stubs for `FileManager`, `Renderer`, and `Container` to start verifying contracts.
- Continue by implementing missing interface-driven refactors for other concrete classes (e.g., repositories).

What's next for you? Pick one and I'll implement it.
