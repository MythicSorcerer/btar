# better-tar

User-friendly CLI tool for creating and extracting archive files.

## Installation

```bash
npm install -g better-tar
```

Or use without installation:

```bash
npx better-tar <archive>
```

## Usage

### Create an archive

```bash
better-tar file1.txt file2.txt
```

### Extract an archive

```bash
better-tar archive.tar.gz
```

### List archive contents

```bash
better-tar -l archive.tar.gz
```

## Supported Formats

- `.tar` - Plain tar archives
- `.tar.gz` / `.tgz` - Gzip-compressed tar archives

## Features

- Simple, intuitive CLI
- Automatic directory detection during extraction
- Lists archive contents before extraction
- Written in pure JavaScript with no external dependencies