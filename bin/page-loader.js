#!/usr/bin/env node

import { program } from 'commander';

program
  .description('Page loader utility')
  .option('-V, --version', 'output the version number')
  .option('-o, --output [dir]', 'output dir', '/home/petrovanna/backend-project-4')
  .arguments('<url>');
/* .action((filepath1, filepath2) => {
    console.log(gendiff(filepath1, filepath2, program.opts().format));
  }); */

program.parse();
