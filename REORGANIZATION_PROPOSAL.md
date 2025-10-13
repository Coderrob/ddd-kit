# Repository Reorganization Proposal

## Executive Summary

This document proposes a reorganization of the ddd-kit repository to reduce cognitive load and improve discoverability. The current structure mixes different concerns (toolkit code, reference documentation, standards library, and project documentation) at the root level, creating confusion about what this repository actually is.

## Current Issues

### 1. **Mixed Concerns at Root Level**

The repository serves multiple purposes that are currently intermingled:

- **A TypeScript CLI toolkit** (`src/`, `dist/`, build configs)
- **A standards/reference library** (`standards/`, `tech/`)
- **Project documentation** (`docs/`)
- **Validation schemas** (`schemas/`)
- **Build artifacts** (`coverage/`, `tools/`)

### 2. **Unclear Primary Purpose**

When someone visits this repo, it's unclear whether they're looking at:

- A tool they can install and use
- A documentation framework
- A reference library of best practices
- All of the above

### 3. **Duplicate/Overlapping Directories**

- `docs/` mentions it contains standards, schemas, tech guides
- `standards/` exists separately at root
- `tech/` exists separately at root
- `schemas/` exists separately at root
- This creates confusion about where things should live

### 4. **Development vs. Reference Content Mixed**

- Build artifacts (`coverage/`, compiled code) mixed with reference content
- Test files mixed throughout
- No clear separation between "toolkit code" and "reference documentation"

## Proposed Structure

### Option A: Monorepo with Clear Domains (RECOMMENDED)

```text
ddd-kit/
├── README.md                          # Clear overview of entire project
├── package.json                       # Workspace configuration
├── .github/                           # GitHub configs
├── .husky/                           # Git hooks
│
├── toolkit/                          # The CLI tool itself
│   ├── README.md                     # How to use the toolkit
│   ├── package.json
│   ├── tsconfig.json
│   ├── jest.config.cjs
│   ├── src/                          # Source code
│   ├── dist/                         # Compiled output
│   ├── __tests__/                    # Tests
│   └── coverage/                     # Coverage reports
│
├── reference/                        # Reference documentation library
│   ├── README.md                     # Overview of reference materials
│   ├── standards/                    # Process standards & best practices
│   │   ├── business/
│   │   ├── compliance/
│   │   ├── governance/
│   │   ├── sdlc/
│   │   ├── security/
│   │   └── ...
│   ├── tech/                         # Technology-specific guides
│   │   ├── java/
│   │   ├── python/
│   │   ├── typescript/
│   │   └── _shared/
│   └── schemas/                      # JSON schemas for validation
│       ├── doc.standard.schema.json
│       ├── doc.tech.schema.json
│       ├── task.todo.schema.json
│       └── ...
│
├── docs/                             # Project & usage documentation
│   ├── README.md
│   ├── getting-started.md
│   ├── architecture.md
│   ├── cli-reference.md              # From current docs/cli.md
│   ├── guides/                       # How-to guides for using DDDK
│   │   ├── analysis/
│   │   ├── business/
│   │   ├── changes/
│   │   ├── planning/
│   │   └── testing/
│   ├── templates/                    # Document templates
│   │   ├── task-template.md
│   │   └── task-schema.json
│   └── requirements/
│       └── system.requirements.md
│
├── examples/                         # Example projects using DDDK
│   ├── basic-workflow/
│   ├── enterprise-setup/
│   └── ...
│
├── scripts/                          # Development scripts
│   ├── integration-test.sh
│   ├── validate-local.mjs
│   └── ...
│
└── public/                           # Static assets
    └── img/
```

### Option B: Simpler Flat Structure (If complexity is overkill)

```text
ddd-kit/
├── src/                              # Toolkit source code
├── reference-library/                # All reference docs together
│   ├── standards/
│   ├── tech/
│   └── schemas/
├── docs/                             # Usage documentation
├── examples/                         # Example projects
├── scripts/                          # Build/dev scripts
├── public/                           # Assets
└── [config files]
```

## Migration Plan

### Phase 1: Immediate Wins (Low Risk)

1. **Move build artifacts into toolkit/**
   - Move `src/` → `toolkit/src/`
   - Move `coverage/` → `toolkit/coverage/`
   - Update build configs

2. **Consolidate reference materials**
   - Move `standards/` → `reference/standards/`
   - Move `tech/` → `reference/tech/`
   - Move `schemas/` → `reference/schemas/`

3. **Update documentation references**
   - Update `docs/README.md` to reflect new structure
   - Fix any hardcoded paths in code

### Phase 2: Enhanced Organization

1. **Create examples directory**
   - Extract example TODO.md scenarios
   - Create minimal example projects

2. **Consolidate scripts**
   - Move `tools/` contents into `scripts/`
   - Organize by purpose (test, build, deploy)

### Phase 3: Documentation Cleanup

1. **Improve root README**
   - Add clear "What is this?" section
   - Add visual diagram of structure
   - Link to quick-start guides

2. **Create navigation aids**
   - Add README.md in each major directory
   - Create CONTRIBUTING.md with structure guide
   - Add index files where helpful

## Benefits

### For New Users

- **Clear entry point**: Root README explains what the project is
- **Obvious next steps**: "Want to use the tool?" → `/toolkit/`. "Want reference docs?" → `/reference/`
- **Less confusion**: No mixing of code, docs, and reference materials

### For Contributors

- **Clear boundaries**: Know where to add new features vs. new reference docs
- **Better IDE experience**: Smaller, focused directories to navigate
- **Easier testing**: Test setup scoped to relevant areas

### For Maintainers

- **Modular updates**: Can version toolkit separately from reference docs
- **Clearer ownership**: Can assign different maintainers to different domains
- **Better CI/CD**: Can run different pipelines for different parts

## Implementation Considerations

### Breaking Changes

- Need to update import paths in code (if moving `src/`)
- Need to update `package.json` paths
- Need to update CI/CD paths
- Documentation links will break temporarily

### Migration Strategy

1. Create new structure in a feature branch
2. Use git mv to preserve history
3. Update all configs and imports
4. Test thoroughly
5. Update documentation
6. Merge with clear communication

### Alternative: Incremental Approach

Instead of big bang, could:

1. First add toolkit/ wrapper around src/
2. Then move reference materials
3. Then update docs
4. Deprecate old locations with symlinks

## Recommendation

**Adopt Option A (Monorepo with Clear Domains)** for these reasons:

1. **Scalability**: As the project grows, clear domains prevent it from becoming unwieldy
2. **Clarity**: Each directory has a single, clear purpose
3. **Professional**: Matches structure of mature open-source projects
4. **Flexibility**: Easy to split into separate packages later if needed
5. **Reduced Cognitive Load**: Contributors immediately understand the structure

The cognitive load reduction comes from:

- **Clear boundaries**: "I'm working on X" → "I look in X directory"
- **Predictable locations**: Consistent patterns across the project
- **Single Responsibility**: Each directory serves one purpose
- **Visual hierarchy**: Depth indicates relationship/importance

## Next Steps

1. **Get feedback** on this proposal from key stakeholders
2. **Create detailed file mapping** (old location → new location)
3. **Set up test environment** to validate the migration
4. **Execute migration** in feature branch
5. **Update all documentation and scripts**
6. **Test thoroughly** with actual workflows
7. **Communicate changes** to users and contributors
8. **Merge** with release notes explaining new structure

---

**Questions to Consider:**

- Should `reference/` be a separate repo entirely?
- Should `toolkit/` eventually become a separate npm package?
- Do we want workspace monorepo support (lerna, nx, turborepo)?
- Should examples be in-repo or separate example repos?
