import { Argument, Command } from "commander";
import { version } from "../package.json";
import { readFile } from "fs/promises";
import glob from "fast-glob";
import path from "path";
import clipboard from "clipboardy";

interface Options {
  content?: boolean;
  absolute?: boolean;
  copy?: boolean;
  partial?: boolean;
  lines?: number;
}

const program = new Command();

program
  .name("stdin-glob")
  .description("Expand glob patterns and output file contents and paths")
  .version(version)
  .option("--no-content", "Do not show file contents, only list matching paths")
  .option("--absolute", "Show the absolute path for entries")
  .option(
    "-c, --copy",
    "Copy the output to clipboard instead of printing to console",
  )
  .option(
    "-l, --lines",
    "Show the number of lines in the file. If you not provide a number of lines it will show the full file content.",
    (value) => {
      if (isNaN(parseInt(value))) {
        throw new Error("Lines must be a number");
      }
      return parseInt(value);
    },
  )
  .argument("[patterns...]", "Glob patterns to match files")
  .action(
    async (patterns: string[], options: Options) => {
      if (patterns.length === 0) {
        console.error("Error: No patterns provided.");
        process.exit(1);
      }

      //expand glob
      const files = await glob(patterns, {
        onlyFiles: true,
        absolute: options.absolute ?? false,
      });

      if (files.length === 0) {
        console.error("No files matched the given patterns.");
        process.exit(1);
      }

      let output = "";

      for (const file of files) {
        if (options.content) {
          const fileOutput = await getFileContent(file, options.lines ?? undefined);
          output += fileOutput;
        } else {
          output += file + "\n";
        }
      }

      if (options.copy) {
        try {
          await clipboard.write(output.trim());
          console.log("-> Output copied to clipboard successfully!");
        } catch (error) {
          console.error("-X Error copying to clipboard:", error);
          process.exit(1);
        }
      } else {
        console.log(output.trim());
      }
    },
  );

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
 * Get file content with markdown format
 * @param filePath - The path to the file
 * @param lines - The number of lines to show. If you not provide a number of lines it will show the full file content.
 * @returns The file content with markdown format
 */
const getFileContent = async (
  filePath: string,
  lines?: number,
): Promise<string> => {
  try {
    const content = await readFile(filePath, "utf-8");
    const contentToShow = lines ? content.split("\n").slice(0, lines).join("\n") : content;
    const extension = path.extname(filePath).replace(".", "");
    const maxBackticks = findMaxConsecutiveBackticks(content);
    const wrapper = "`".repeat(Math.max(3, maxBackticks + 1));

    return (
      wrapper +
      extension +
      "\n" +
      `// ${filePath}\n\n` +
      contentToShow +
      "\n" +
      wrapper +
      "\n\n"
    );
  } catch (e) {
    console.error(`Error reading file ${filePath}:`, e);
    return "";
  }
};
