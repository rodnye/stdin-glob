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
- Copy output directly to clipboard with `--copy` flag
- Support for absolute or relative paths
- Option to show only file paths without content
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

| Option          | Description                                                 |
| --------------- | ----------------------------------------------------------- |
| `--no-content`  | Do not show file contents, only list matching paths         |
| `--absolute`    | Show absolute paths for entries                             |
| `-c, --copy`    | Copy the output to clipboard instead of printing to console |
| `-V, --version` | Output the version number                                   |
| `-h, --help`    | Display help information                                    |

### Arguments

| Argument   | Description                                |
| ---------- | ------------------------------------------ |
| `patterns` | Glob patterns to match files (one or more) |

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
