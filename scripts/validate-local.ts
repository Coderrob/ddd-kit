#!/usr/bin/env ts-node

import { listTasks } from '../src/core/todo';
import { validateTasks } from '../src/core/validator';

/**
 * Main function that validates all tasks in the TODO.md file.
 * Lists all tasks, validates them against the schema, and reports the results.
 */
async function main() {
  const tasks = listTasks();
  const res = validateTasks(tasks as unknown[]);
  if (res.valid) {
    console.log(`All ${tasks.length} tasks validate.`);
    process.exitCode = 0;
  } else {
    console.error('Validation errors:');
    for (const e of res.errors || []) console.error(`- ${e}`);
    process.exitCode = 1;
  }
}

main();
