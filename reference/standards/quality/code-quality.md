# Code Quality Standards

## Architectural Rules

### Index File Encapsulation

**NEVER** allow index files to export from outside their directory tree.

**❌ WRONG - Breaks encapsulation:**

```typescript
// src/types/rendering/index.ts
export * from './IRenderer';
export * from './OutputFormat';
export { ConsoleOutputWriter } from '../../core/rendering/console-output.writer'; // ❌ BAD
```

**✅ CORRECT - Maintains encapsulation:**

```typescript
// src/types/rendering/index.ts
export * from './IRenderer';
export * from './OutputFormat';

// Add exports to the appropriate domain index file instead:
// src/core/rendering/index.ts
export { ConsoleOutputWriter } from './console-output.writer';
```

**Rationale:**

- Maintains clear module boundaries and encapsulation
- Prevents circular dependencies
- Makes dependencies explicit and traceable
- Follows domain-driven design principles
- Improves maintainability and refactoring safety

**Enforcement:**

- Code reviews must flag any index file reaching outside its directory
- Automated linting rules should be added to prevent this pattern
- Refactoring should move cross-domain exports to appropriate domain boundaries
