#!/usr/bin/env node

import { program } from 'commander';
import pageLoader from '../src/index.js';

const currentDir = process.cwd();

program
  .description('Page loader utility')
  .option('-V, --version', 'output the version number')
  .option('-o, --output [dir]', 'output dir', currentDir)
  .argument('<url>')
  .action((url) => {
    console.log(pageLoader(url, program.opts().output));
  });

program.parse();
