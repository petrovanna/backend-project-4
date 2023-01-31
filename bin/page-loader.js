#!/usr/bin/env node

import { program } from 'commander';
import getFullFilePath from '../src/get_full_file_path.js';
import pageLoader from '../src/index.js';

const currentDir = process.cwd();

program
  .description('Page loader utility')
  .option('-V, --version', 'output the version number')
  .option('-o, --output [dir]', 'output dir', currentDir)
  .argument('<url>')
  .action((url) => {
    pageLoader(url, program.opts().output)
      .then(() => console.log(`Page was successfully downloaded into '${getFullFilePath(url, program.opts().output)}'`))
      .catch((error) => {
        console.error(error.message);
        process.exit(1);
      });
  });

program.parse();
