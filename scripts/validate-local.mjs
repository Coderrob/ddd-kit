#!/usr/bin/env node

import { TaskManager } from '../dist/core/storage/task.manager.js';
import { getLogger } from '../dist/core/system/logger.js';
import { validateTasks } from '../dist/validators/validator.js';

/**
 * Local validation script for tasks in TODO.md
 *
 * This script provides a lightweight way to validate all tasks in the TODO.md file
 * without going through the full CLI interface. It directly uses the underlying
 * validation logic and provides clean console output.
 *
 * Usage:
 *   node scripts/validate-local.mjs
 *   npm run validate-local
 *
 * This is equivalent to running: `npm run cli -- validate tasks`
 * but with simpler output formatting and faster execution.
 */
async function main() {
  try {
    const taskManager = new TaskManager(getLogger());
    const tasks = taskManager.listTasks();
    const res = validateTasks(tasks);

    if (res.isValid) {
      console.log(`✅ All ${tasks.length} tasks validate successfully.`);
      process.exitCode = 0;
    } else {
      console.error('❌ Validation errors found:');
      for (const e of res.errors || []) {
        console.error(`  • ${e}`);
      }
      process.exitCode = 1;
    }
  } catch (error) {
    console.error('❌ Error during validation:', error.message);
    process.exitCode = 1;
  }
}

main();
