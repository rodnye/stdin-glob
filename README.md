# ⚠️ DEPRECATION WARNING

**`stdin-glob` is deprecated.**

Please update your workflows to use [`codepicker-tool`](https://github.com/rodnye/codepicker) instead. All existing functionality has been migrated and improved in `codepicker`.

You can install the replacement via:

```bash
npm install -g codepicker-tool
# or
pnpm install -g codepicker-tool
```

# Original README for stdin-glob

*(Below is the original README content)*

# stdin-glob

[![npm version](https://img.shields.io/npm/v/stdin-glob.svg)](https://www.npmjs.com/package/stdin-glob)
[![npm license](https://img.shields.io/npm/l/stdin-glob.svg)](https://www.npmjs.com/package/stdin-glob)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.9+-blue.svg)](https://www.typescriptlang.org)  
[![GitHub stars](https://img.shields.io/github/stars/rodnye/stdin-glob.svg)](https://github.com/rodnye/stdin-glob)

A simple CLI tool that expands glob patterns and outputs file contents or paths. Perfect for quickly previewing multiple files matching a pattern.

## Why?

This tool solves a common pain point: **aggregating file contents into a single, coherent output**. Whether you're doing code reviews, documentation, or working with LLMs, having to manually copy-paste multiple files is tedious and error-prone.

I created this for my personal workflow when working with Large Language Models (LLMs). Combined with clipboard tools, it lets me instantly gather specific project context:

```bash
stdin-glob "src/**/*.ts" "src/**/*.tsx" | pbcopy  # On macOS
# or
stdin-glob "src/**/*.js" | xclip -selection clipboard  # On Linux
```

This pipes all relevant TypeScript/TSX files directly into my clipboard, ready to paste into ChatGPT, Claude, or any other LLM. Perfect for getting targeted, comprehensive context without the friction of opening and copying files one by one.

## Features

- Expand glob patterns to find matching files
- Output file contents with syntax highlighting markers
- **Limit output to a specific number of lines per file** with `--max-lines`
- **Show line numbers** with `--line-numbers` for better code reference
- **Auto-copy output** directly to clipboard with `--copy` flag
- Support for absolute or relative paths
- Option to show only file paths without content
- **Intelligent handling of binary files** - shows metadata instead of attempting to display unreadable content
- **Automatic .gitignore filtering** - respects your project's ignore rules by default
- **Reverse apply** - recreate files from a markdown document containing code blocks (inverse operation)
- Written in TypeScript

## Installation

```bash
npm install -g stdin-glob
```

## Usage

```bash
stdin-glob [options] [patterns...]
```

### Options

| Option                | Description                                                                 |
| --------------------- | --------------------------------------------------------------------------- |
| `--no-content`        | Do not show file contents, only list matching paths                         |
| `--absolute`          | Show absolute paths for entries                                             |
| `-c, --copy`          | Copy the output to clipboard instead of printing to console                 |
| `-m, --max-lines <n>` | Show only the first N lines of each file (shows full file if omitted)       |
| `-n, --line-numbers`  | Display line numbers next to each line, like in IDE sidebars                |
| `--no-gitignore`      | Disable .gitignore filtering (include files that would normally be ignored) |
| `-V, --version`       | Output the version number                                                   |
| `-h, --help`          | Display help information                                                    |

### Arguments

| Argument   | Description                                |
| ---------- | ------------------------------------------ |
| `patterns` | Glob patterns to match files (one or more) |

### Apply Command

The `apply` subcommand is the inverse operation: it reads a file containing code blocks in the format produced by `stdin-glob` and creates or updates the corresponding files on disk.

```bash
stdin-glob apply <input-file> [options]
```

#### Apply Options

| Option             | Description                                                |
| ------------------ | ---------------------------------------------------------- |
| `<input-file>`     | File containing code blocks in markdown format             |
| `-d, --dir <path>` | Base directory to apply files (default: current directory) |
| `--dry-run`        | Show what would be done without making any changes         |

#### How It Works

The `apply` command parses a document looking for code blocks that follow this structure:

````
```ext
// path/to/file.ext
file content here
```
````

It then creates or updates each file based on the extracted content. This is particularly useful when an LLM generates modified code—you can simply apply the output directly to your project.

Key behaviors:

- **Noise tolerance**: Ignores any text outside of code blocks (explanations, comments, etc.)
- **Matching backticks**: Only recognizes code blocks where the opening and closing have the exact same number of backticks
- **Binary file detection**: Files marked with `[BINARY FILE]` are automatically skipped
- **Truncation warnings**: Warns when the source content was truncated
- **Directory creation**: Automatically creates any necessary parent directories
- **Create vs. update**: Reports which files were created new and which were modified

## Pattern Syntax

This tool uses [fast-glob](https://github.com/mrmlnc/fast-glob) for pattern matching, which supports the feature set of [picomatch](https://github.com/micromatch/picomatch). For detailed information about available globbing features and syntax options, refer to the [picomatch globbing features documentation](https://github.com/micromatch/picomatch?tab=readme-ov-file#globbing-features).

## Examples

### Basic usage

Display contents of all JavaScript files with syntax highlighting markers:

```bash
stdin-glob "src/**/*.js" --content
# or
stdin-glob "src/**/*.js"
```

Output:

````
```js
// src/index.js

console.log('Hello, world!');
```

```js
// src/utils/helpers.js

function add(a, b) {
  return a + b;
}
```
````

### Limit lines per file

Show only the first 10 lines of each TypeScript file - perfect for quick overviews:

```bash
stdin-glob "src/**/*.ts" --max-lines 10
```

Output:

````
```ts
// src/index.ts

import { Command } from 'commander';
import { version } from '../package.json';
import { readFile } from 'fs/promises';
import glob from 'fast-glob';
import path from 'path';
import clipboard from 'clipboardy';
// ... (23 more lines truncated)
```
````

### Show line numbers

Display line numbers alongside the code, just like in your editor:

```bash
stdin-glob "src/**/*.js" --line-numbers
```

Output:

````
```js
// src/index.js

 1 | import { Command } from 'commander';
 2 | import { version } from '../package.json';
 3 | import { readFile } from 'fs/promises';
 4 | import glob from 'fast-glob';
 5 | import path from 'path';
```
````

### Combine with line limits

Get a preview with line numbers for better context:

```bash
stdin-glob "src/**/*.ts" --max-lines 5 --line-numbers
```

Output:

````
```ts
// src/index.ts

 1 | import { Command } from 'commander';
 2 | import { version } from '../package.json';
 3 | import { readFile } from 'fs/promises';
 4 | import glob from 'fast-glob';
 5 | import path from 'path';
// ... (23 more lines truncated)
```
````

### Copy to clipboard

Copy all TypeScript file contents directly to clipboard:

```bash
stdin-glob "src/**/*.ts" --copy
```

This will copy the formatted output to your clipboard without printing to console. You'll see a confirmation message:

```
-> Output copied to clipboard successfully!
```

Now you can paste (Ctrl+V or Cmd+V) anywhere - perfect for sharing code in pull requests, documentation, or with LLMs.

### Only list files

List all TypeScript files in the src directory without content:

```bash
stdin-glob "src/**/*.ts" --no-content
```

Output:

```text
src/index.ts
src/utils/helpers.ts
src/types/index.ts
```

### Multiple patterns

Match files with different extensions:

```bash
stdin-glob "src/**/*.ts" "src/**/*.js" --content
```

### Absolute paths

Show absolute paths instead of relative ones:

```bash
stdin-glob "src/**/*.ts" --absolute --no-content
```

Output:

```
/home/pedrito/project/src/index.ts
/home/pedrito/project/src/utils/helpers.ts
/home/pedrito/project/src/types/index.ts
```

### Binary file handling

When encountering binary files (like images, compiled binaries, etc.), the tool safely displays metadata instead of attempting to show unreadable content:

````
```png
// assets/logo.png
// [BINARY FILE] - Size: 0.024 MB
```
````

### Integration with other commands

Use with grep to search for specific content:

```bash
stdin-glob "src/**/*.ts" | grep "function"
```

Or combine with other clipboard tools for maximum flexibility:

```bash
# Copy without the confirmation message
stdin-glob "src/**/*.ts" --no-content | pbcopy

# Preview first, then copy if it looks good
stdin-glob "src/**/*.ts" --content
stdin-glob "src/**/*.ts" --copy
```

### .gitignore Support

By default, `stdin-glob` automatically respects your project's `.gitignore` rules. This means files and directories listed in `.gitignore` won't appear in the output. This is especially useful when you want to avoid including build artifacts, dependencies, or environment files in your context.

The gitignore pattern matching implementation is based on the official [gitignore pattern format documentation](https://git-scm.com/docs/gitignore#_pattern_format), ensuring compatibility with how git itself handles ignore rules.

#### Including ignored files

If you need to include files that would normally be ignored, use the `--no-gitignore` flag:

```bash
stdin-glob "dist/**/*.js" --no-gitignore
```

This disables all `.gitignore` filtering and includes every file matching your patterns.

### Apply files from markdown output

Apply code blocks from a file directly to your project:

```bash
stdin-glob apply output.md
```

This reads `output.md`, finds all code blocks with file paths, and creates or updates the corresponding files.

#### Apply to a specific directory

Target a different directory than the current one:

```bash
stdin-glob apply output.md --dir ./my-project
```

#### Dry run

Preview what would happen without making any changes:

```bash
stdin-glob apply output.md --dry-run
```

Output:

```
Found 3 file(s) to process:

  [OK] src/index.ts
  [OK] src/utils/helpers.ts
  [WARN - truncated] src/types/index.ts

[Dry run] No files were modified.
```

#### Handling noisy input

The `apply` command is designed to work with real LLM output, which often includes explanations between code blocks:

````
Here are the updated files:

The main index file has been modified to add error handling:

```ts
// src/index.ts
console.log('Hello!');
```

I also created a new utility:

```js
// src/utils/new.js
export const helper = () => true;
```

Let me know if you need anything else!
````

Running `stdin-glob apply response.md` on the above will correctly extract and apply only the two code blocks, ignoring all the surrounding text.

#### Full workflow example

A typical workflow when working with LLMs:

```bash
# 1. Gather context from your project
stdin-glob "src/**/*.ts" --copy

# 2. Paste into your LLM and ask for modifications

# 3. Save the LLM response to a file
# (paste from clipboard)
# pbpaste > response.md

# 4. Preview what will change
stdin-glob apply response.md --dry-run

# 5. Apply the changes
stdin-glob apply response.md
```

Output after applying:

```
Found 2 file(s) to process:

  [OK] src/index.ts
  [OK] src/utils/new.js

Results:
  Created: 1
    + src/utils/new.js
  Updated: 1
    ~ src/index.ts
```
