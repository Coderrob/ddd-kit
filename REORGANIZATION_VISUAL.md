# Visual Reorganization Guide

## Current Structure (Confusing)

```text
🏠 ddd-kit/
├── 🔧 src/                    ← Toolkit code
├── 📊 coverage/               ← Build artifact
├── 📘 docs/                   ← Says it contains everything
│   ├── guides/
│   ├── templates/
│   └── requirements/
├── 📚 standards/              ← Why is this separate from docs?
│   ├── business/
│   ├── compliance/
│   └── ... (18+ subdirs)
├── 💻 tech/                   ← Why is this separate too?
│   ├── java/
│   ├── python/
│   └── typescript/
├── 🔍 schemas/                ← And this?
├── 🛠️ tools/                  ← What's the difference from scripts?
├── 📝 scripts/
└── 🎨 public/

Problem: "Where do I find information about X?"
- Standards? Check docs/ or standards/?
- Schemas? Check docs/ or schemas/?
- Tech guides? Check docs/ or tech/?
```

## Proposed Structure (Clear)

```text
🏠 ddd-kit/
├── 📖 README.md               ← Clear overview
│
├── 🔧 toolkit/                ← "I want to USE the tool"
│   ├── README.md              ← Installation & usage
│   ├── src/                   ← Source code
│   ├── dist/                  ← Compiled code
│   ├── coverage/              ← Test coverage
│   └── __tests__/             ← Tests
│
├── 📚 reference/              ← "I want REFERENCE information"
│   ├── README.md              ← What's in the library
│   ├── standards/             ← Process standards
│   ├── tech/                  ← Technology guides
│   └── schemas/               ← Validation schemas
│
├── 📘 docs/                   ← "I want to LEARN about DDDK"
│   ├── getting-started.md
│   ├── architecture.md
│   ├── cli-reference.md
│   ├── guides/                ← How-to guides
│   ├── templates/             ← Document templates
│   └── requirements/          ← System requirements
│
├── 💡 examples/               ← "I want to SEE examples"
│   ├── basic-workflow/
│   └── enterprise-setup/
│
├── 🛠️ scripts/                ← "I need to RUN a script"
│   ├── integration-test.sh
│   └── validate-local.mjs
│
└── 🎨 public/                 ← Static assets
    └── img/

Benefit: "Where do I find information about X?"
✅ Want to use the tool? → toolkit/
✅ Want standards/tech docs? → reference/
✅ Want to learn DDDK? → docs/
✅ Want examples? → examples/
```

## Cognitive Load Comparison

### Before: 🤯 High Cognitive Load

**Question:** "Where do I find the JSON schema for tasks?"

**Mental Process:**

1. Check `docs/` (seems like docs go there?) → Not found
2. Check `schemas/` (ah, there's a schemas dir) → Found!
3. But wait, `docs/README.md` says schemas are in docs too?
4. Confusion...

**Question:** "Where are the TypeScript standards?"

**Mental Process:**

1. Check `standards/` → Not found
2. Check `tech/typescript/` → Found!
3. But `docs/` mentions tech guides too?
4. More confusion...

### After: 😌 Low Cognitive Load

**Question:** "Where do I find the JSON schema for tasks?"

**Mental Process:**

1. Is it reference documentation? → Yes
2. Go to `reference/schemas/` → Found!

**Question:** "Where are the TypeScript standards?"

**Mental Process:**

1. Is it reference documentation? → Yes
2. Is it tech-specific? → Yes
3. Go to `reference/tech/typescript/` → Found!

## Decision Tree

```text
START: "What am I looking for?"
│
├─ "I want to INSTALL/USE the toolkit"
│  └─ Go to: toolkit/
│     ├─ README.md (installation)
│     └─ See docs/ for guides
│
├─ "I want REFERENCE documentation"
│  └─ Go to: reference/
│     ├─ Process standards? → reference/standards/
│     ├─ Tech guides? → reference/tech/
│     └─ Schemas? → reference/schemas/
│
├─ "I want to LEARN how to use DDDK"
│  └─ Go to: docs/
│     ├─ Getting started → getting-started.md
│     ├─ How-to guides → guides/
│     └─ CLI reference → cli-reference.md
│
├─ "I want to SEE examples"
│  └─ Go to: examples/
│
└─ "I want to CONTRIBUTE/DEVELOP"
   ├─ Code → toolkit/src/
   ├─ Tests → toolkit/__tests__/
   ├─ Build → scripts/
   └─ See CONTRIBUTING.md
```

## Key Principles Applied

### 1. **Single Source of Truth**

❌ Before: Schemas mentioned in docs/, but stored in schemas/
✅ After: Schemas in reference/schemas/, docs/ only links to them

### 2. **Clear Domain Boundaries**

❌ Before: Mixed concerns at root level
✅ After: Each top-level directory = one clear purpose

### 3. **Predictable Locations**

❌ Before: "Could be in docs/ or its own folder"
✅ After: "Type of content determines location"

### 4. **Reduced Context Switching**

❌ Before: Jump between 5+ directories to understand standards
✅ After: All reference materials in one place

### 5. **Progressive Disclosure**

✅ Root README → High-level overview
✅ Subdirectory README → Specific details
✅ Files → Implementation

## Migration Impact

### Low Impact ✅

- Moving reference materials (`standards/`, `tech/`, `schemas/`)
- Adding `examples/` directory
- Consolidating `tools/` into `scripts/`

### Medium Impact ⚠️

- Moving `src/` into `toolkit/src/`
  - Need to update imports
  - Need to update build configs
  - Need to update CI/CD

### High Impact 🚨

- Splitting into separate repositories
  - Would require separate versioning
  - Would require separate deployment
  - NOT RECOMMENDED initially

## Recommended First Steps

### Step 1: Create Wrapper (No breaking changes)

```bash
# Create new directories
mkdir toolkit reference examples

# Create README files
touch toolkit/README.md reference/README.md examples/README.md

# Update root README to explain new structure
```

### Step 2: Move Reference Materials (Low risk)

```bash
# Use git mv to preserve history
git mv standards reference/standards
git mv tech reference/tech
git mv schemas reference/schemas

# Update docs/README.md references
```

### Step 3: Update Documentation (Medium risk)

```bash
# Fix any broken links
# Update import paths in code
# Update CI/CD paths
```

### Step 4: Move Toolkit Code (Higher risk - do last)

```bash
# Move source code
git mv src toolkit/src
git mv coverage toolkit/coverage

# Update all configs
# Update imports
# Test thoroughly
```

## Success Metrics

After reorganization, we should be able to answer:

✅ "New user wants to install the tool" → Takes < 30 seconds to find instructions
✅ "Developer wants to add a feature" → Knows exactly which directory
✅ "User wants Spring Boot standards" → Finds in < 10 seconds
✅ "Contributor wants to run tests" → Clear path in one directory

## Conclusion

The proposed structure:

- **Reduces cognitive load** by eliminating ambiguity
- **Improves discoverability** through clear categorization
- **Scales better** as the project grows
- **Follows industry standards** for monorepo structure
- **Maintains flexibility** for future evolution

Next: Review this proposal and decide on implementation timeline.
