#!/usr/bin/env node

import { program } from 'commander';

program
  .version('1.0.0')
  .option('-n, --name <name>', 'specify a name')
  .parse(process.argv);

const options = program.opts();
console.log(`Hello, ${options.name || 'world'}!`);
