import { Command } from 'commander';
import { version } from '../package.json';
import { readFile } from 'fs/promises';
import glob from 'fast-glob';
import path from 'path';

interface Options {
  content?: boolean;
  absolute?: boolean;
}

const program = new Command();

program
  .name('stdin-glob')
  .description('Expand glob patterns and output file contents and paths')
  .version(version)
  .option('--no-content', 'Do not show file contents, only list matching paths')
  .option('--absolute', 'Show the absolute path for entries')
  .argument('[patterns...]', 'Glob patterns to match files')
  .action(async (patterns: string[], options: Options) => {
    if (patterns.length === 0) {
      console.error('Error: No patterns provided.');
      process.exit(1);
    }

    //expand glob
    const files = await glob(patterns, {
      onlyFiles: true,
      absolute: options.absolute ?? false,
    });

    if (files.length === 0) {
      console.error('No files matched the given patterns.');
      process.exit(1);
    }

    for (const file of files) {
      if (options.content) await printFileWithFormat(file);
      else console.log(file);
    }
  });

program.parse(process.argv);

/**
 * Print files with format markdown
 */
const printFileWithFormat = async (filePath: string) => {
  try {
    const content = await readFile(filePath, 'utf-8');
    console.log('```' + path.extname(filePath).replace('.', ''));
    console.log(`// ${filePath}`);
    console.log();
    console.log(content);
    console.log('```');
    console.log();
  } catch (e) {
    console.error(`Error reading file ${filePath}:`, e);
  }
};
