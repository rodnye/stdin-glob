import { Command } from 'commander';
import { version } from '../package.json';
import { readFile } from 'fs/promises';
import glob from 'fast-glob';
import path from 'path';
import clipboard from 'clipboardy';

interface Options {
  content?: boolean;
  absolute?: boolean;
  copy?: boolean;
  maxLines?: number;
  lineNumbers?: boolean; // Nueva opción
}

const program = new Command();

program
  .name('stdin-glob')
  .description('Expand glob patterns and output file contents and paths')
  .version(version)
  .option('--no-content', 'Do not show file contents, only list matching paths')
  .option('--absolute', 'Show the absolute path for entries', false)
  .option(
    '-c, --copy',
    'Copy the output to clipboard instead of printing to console',
    false,
  )
  .option(
    '-m, --max-lines <int>',
    'Show a limited number of lines in the file. If you not provide a number of lines it will show the full file content.',
    (value) => {
      if (isNaN(parseInt(value))) throw new Error('Lines must be a number');
      return parseInt(value);
    },
  )
  .option(
    '-n, --line-numbers',
    'Show line numbers next to each line, like in IDE sidebars',
    false,
  )
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

    let output = '';

    for (const file of files) {
      if (options.content) {
        const fileOutput = await getFileContent(
          file,
          options.maxLines ?? undefined,
          options.lineNumbers ?? false,
        );
        output += fileOutput;
      } else {
        output += file + '\n';
      }
    }

    if (options.copy) {
      try {
        await clipboard.write(output.trim());
        console.log('-> Output copied to clipboard successfully!');
      } catch (error) {
        console.error('-X Error copying to clipboard:', error);
        process.exit(1);
      }
    } else {
      console.log(output.trim());
    }
  });

program.parse(process.argv);

/**
 * Find the maximum number of consecutive backticks in a string
 */
const findMaxConsecutiveBackticks = (str: string): number => {
  const matches = str.match(/`+/g);
  if (!matches) return 0;
  return Math.max(...matches.map((m) => m.length));
};

/**
 * Add line numbers to content
 */
const addLineNumbers = (content: string, startLine: number = 1): string => {
  const lines = content.split('\n');

  // calculate width of bar
  const paddingWidth = (startLine + lines.length - 1).toString().length;

  return lines
    .map((line, index) => {
      const lineNumber = startLine + index;
      const paddedNumber = lineNumber.toString().padStart(paddingWidth, ' ');
      return `${paddedNumber} | ${line}`;
    })
    .join('\n');
};

/**
 * Get file content with markdown format
 * @param filePath - The path to the file
 * @param maxLines - The number of lines to show. If you not provide a number of lines it will show the full file content.
 * @param showLineNumbers - Whether to show line numbers
 * @returns The file content with markdown format
 */
const getFileContent = async (
  filePath: string,
  maxLines?: number,
  showLineNumbers?: boolean,
): Promise<string> => {
  try {
    const content = await readFile(filePath, 'utf-8');
    const lines = content.split('\n');

    // maxLines if exists
    const linesToShow = maxLines ? lines.slice(0, maxLines) : lines;
    let contentToShow = linesToShow.join('\n');

    if (showLineNumbers)
      contentToShow = addLineNumbers(linesToShow.join('\n'), 1);

    const extension = path.extname(filePath).replace('.', '');
    const maxBackticks = findMaxConsecutiveBackticks(content);
    const wrapper = '`'.repeat(Math.max(3, maxBackticks + 1));

    const truncation =
      maxLines && lines.length > maxLines
        ? `\n// ... (${lines.length - maxLines} more lines truncated)`
        : '';

    return (
      wrapper +
      extension +
      '\n' +
      `// ${filePath}\n\n` +
      contentToShow +
      truncation +
      '\n' +
      wrapper +
      '\n\n'
    );
  } catch (e) {
    console.error(`Error reading file ${filePath}:`, e);
    return '';
  }
};
