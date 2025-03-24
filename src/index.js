#!/usr/bin/env node
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const commander_1 = require("commander");
commander_1.program
    .version('1.0.0')
    .option('-n, --name <name>', 'specify a name')
    .parse(process.argv);
const options = commander_1.program.opts();
console.log(`Hello, ${options.name || 'world'}!`);
