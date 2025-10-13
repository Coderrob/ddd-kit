# Basic Workflow Example

This example demonstrates a simple task workflow using DDDK.

## Structure

- `tasks.md` - Example task definitions
- `docs/` - Supporting documentation

## Usage

1. Review the task definitions in `tasks.md`
2. Run DDDK commands to process tasks:

```bash
# Validate tasks
dddctl validate tasks.md

# Get next task
dddctl next

# Complete a task
dddctl complete t-001
```

## Learning Objectives

- Understand task structure
- Learn DDDK CLI commands
- See task workflow in action
