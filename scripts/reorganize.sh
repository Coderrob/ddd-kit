#!/bin/bash

# Repository Reorganization Script
# This script implements the proposed reorganization for ddd-kit
# Run with: ./reorganize.sh --dry-run (to see what would happen)
# Run with: ./reorganize.sh --execute (to actually perform the changes)

set -e  # Exit on error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

DRY_RUN=true

# Parse arguments
while [[ $# -gt 0 ]]; do
  case $1 in
    --execute)
      DRY_RUN=false
      shift
      ;;
    --dry-run)
      DRY_RUN=true
      shift
      ;;
    *)
      echo "Unknown option: $1"
      echo "Usage: $0 [--dry-run|--execute]"
      exit 1
      ;;
  esac
done

# Helper functions
info() {
  echo -e "${BLUE}[INFO]${NC} $1"
}

success() {
  echo -e "${GREEN}[SUCCESS]${NC} $1"
}

warning() {
  echo -e "${YELLOW}[WARNING]${NC} $1"
}

error() {
  echo -e "${RED}[ERROR]${NC} $1"
}

run_cmd() {
  local cmd="$1"
  local desc="$2"
  
  if [ "$DRY_RUN" = true ]; then
    echo -e "${YELLOW}[DRY-RUN]${NC} Would run: $cmd"
    echo "           Description: $desc"
  else
    info "Running: $desc"
    eval "$cmd"
    success "Completed: $desc"
  fi
}

# Print header
echo "================================================"
echo "  DDD-Kit Repository Reorganization Script"
echo "================================================"
echo ""

if [ "$DRY_RUN" = true ]; then
  warning "DRY RUN MODE - No changes will be made"
  echo ""
fi

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
  error "package.json not found. Are you in the ddd-kit root directory?"
  exit 1
fi

if ! grep -q "dddctl" package.json; then
  error "This doesn't appear to be the ddd-kit repository"
  exit 1
fi

success "Found ddd-kit repository"
echo ""

# ============================================================================
# PHASE 1: Create new directory structure
# ============================================================================
info "PHASE 1: Creating new directory structure"
echo ""

run_cmd "mkdir -p reference" "Create reference/ directory"
run_cmd "mkdir -p toolkit" "Create toolkit/ directory"
run_cmd "mkdir -p examples" "Create examples/ directory"

echo ""

# ============================================================================
# PHASE 2: Move reference materials
# ============================================================================
info "PHASE 2: Moving reference materials (preserves git history)"
echo ""

if [ -d "standards" ]; then
  run_cmd "git mv standards reference/standards" "Move standards/ to reference/standards/"
else
  warning "standards/ directory not found, skipping"
fi

if [ -d "tech" ]; then
  run_cmd "git mv tech reference/tech" "Move tech/ to reference/tech/"
else
  warning "tech/ directory not found, skipping"
fi

if [ -d "schemas" ]; then
  run_cmd "git mv schemas reference/schemas" "Move schemas/ to reference/schemas/"
else
  warning "schemas/ directory not found, skipping"
fi

echo ""

# ============================================================================
# PHASE 3: Create README files
# ============================================================================
info "PHASE 3: Creating README files for new directories"
echo ""

# Reference README
if [ ! -f "reference/README.md" ]; then
  run_cmd "cat > reference/README.md << 'EOF'
# Reference Library

This directory contains the comprehensive reference documentation library for Document Driven Development.

## Contents

- **standards/** - Process standards, best practices, and governance frameworks
- **tech/** - Technology-specific implementation guides and patterns
- **schemas/** - JSON schemas for document validation

## Purpose

This library serves as the authoritative reference for:
- Software development lifecycle (SDLC) processes
- Industry standards and compliance requirements
- Technology-specific best practices
- Document structure validation

## Usage

These materials are referenced by the DDDK toolkit and can be used independently as a reference library for any software development project.

For toolkit usage documentation, see ../docs/
EOF
" "Create reference/README.md"
fi

# Toolkit README
if [ ! -f "toolkit/README.md" ]; then
  run_cmd "cat > toolkit/README.md << 'EOF'
# DDDK Toolkit

This directory contains the Document Driven Development Kit CLI tool and its implementation.

## Contents

- **src/** - TypeScript source code
- **dist/** - Compiled JavaScript output
- **__tests__/** - Unit and integration tests
- **coverage/** - Test coverage reports

## Installation

From the repository root:

\`\`\`bash
npm install
npm run build
npm run cli -- --help
\`\`\`

## Development

\`\`\`bash
npm run dev    # Watch mode for development
npm test       # Run tests
npm run lint   # Run linting
\`\`\`

## Architecture

See ../docs/architecture.md for detailed information about the toolkit architecture.
EOF
" "Create toolkit/README.md"
fi

# Examples README
if [ ! -f "examples/README.md" ]; then
  run_cmd "cat > examples/README.md << 'EOF'
# DDDK Examples

This directory contains example projects and workflows demonstrating how to use the Document Driven Development Kit.

## Examples

- **basic-workflow/** - Simple task workflow example
- **enterprise-setup/** - Enterprise-scale configuration example

(More examples coming soon)

## Creating a New Example

1. Create a new directory for your example
2. Include a README.md explaining the example
3. Include all necessary files to run the example
4. Document any prerequisites or setup steps
EOF
" "Create examples/README.md"
fi

echo ""

# ============================================================================
# PHASE 4: Update documentation references
# ============================================================================
info "PHASE 4: Updating documentation references"
echo ""

# This is complex and depends on the actual content - we'll just flag it
warning "Manual step required: Update links in docs/ to reflect new structure"
warning "Manual step required: Update any hardcoded paths in source code"
warning "Manual step required: Update import paths if they reference moved files"

echo ""

# ============================================================================
# PHASE 5: Consolidate tools into scripts
# ============================================================================
info "PHASE 5: Consolidating tools/ into scripts/"
echo ""

if [ -d "tools" ]; then
  run_cmd "mkdir -p scripts" "Ensure scripts/ directory exists"
  
  if [ "$DRY_RUN" = false ]; then
    # Move contents of tools/ to scripts/ if not in dry-run mode
    for item in tools/*; do
      if [ -e "$item" ]; then
        basename=$(basename "$item")
        run_cmd "git mv '$item' 'scripts/$basename'" "Move $item to scripts/"
      fi
    done
    
    # Remove empty tools/ directory
    if [ -d "tools" ] && [ ! "$(ls -A tools)" ]; then
      run_cmd "rmdir tools" "Remove empty tools/ directory"
    fi
  else
    info "Would move contents of tools/ to scripts/"
  fi
else
  warning "tools/ directory not found, skipping"
fi

echo ""

# ============================================================================
# PHASE 6: Create basic example
# ============================================================================
info "PHASE 6: Creating basic example"
echo ""

run_cmd "mkdir -p examples/basic-workflow" "Create basic workflow example directory"

if [ ! -f "examples/basic-workflow/README.md" ]; then
  run_cmd "cat > examples/basic-workflow/README.md << 'EOF'
# Basic Workflow Example

This example demonstrates a simple task workflow using DDDK.

## Structure

- \`tasks.md\` - Example task definitions
- \`docs/\` - Supporting documentation

## Usage

1. Review the task definitions in \`tasks.md\`
2. Run DDDK commands to process tasks:

\`\`\`bash
# Validate tasks
dddctl validate tasks.md

# Get next task
dddctl next

# Complete a task
dddctl complete t-001
\`\`\`

## Learning Objectives

- Understand task structure
- Learn DDDK CLI commands
- See task workflow in action
EOF
" "Create basic example README"
fi

echo ""

# ============================================================================
# Summary
# ============================================================================
echo "================================================"
echo "  Summary"
echo "================================================"
echo ""

if [ "$DRY_RUN" = true ]; then
  info "This was a DRY RUN. No changes were made."
  echo ""
  info "To execute these changes, run:"
  echo "  ./reorganize.sh --execute"
else
  success "Reorganization complete!"
  echo ""
  warning "IMPORTANT: Next steps to complete manually:"
  echo ""
  echo "1. Review changes: git status"
  echo "2. Update import paths in source code (if any reference moved files)"
  echo "3. Update docs/README.md to reflect new structure"
  echo "4. Update any CI/CD scripts with new paths"
  echo "5. Test the build: npm run build"
  echo "6. Test the CLI: npm run cli -- --help"
  echo "7. Run tests: npm test"
  echo "8. Update main README.md with new structure explanation"
  echo "9. Commit changes: git commit -m 'Reorganize repository structure'"
  echo ""
  info "To move toolkit code (more invasive), see REORGANIZATION_PROPOSAL.md Phase 2"
fi

echo ""
success "Script completed successfully"
