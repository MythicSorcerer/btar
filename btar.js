#!/usr/bin/env node

/**
 * btar - User-friendly CLI tool for creating and extracting archive files
 */

import { createArchive, extractArchive, listArchive } from './lib/archive.js';
import { FileNotFoundError, ArchiveError, PermissionError, handleError, validateFileExists } from './lib/errors.js';
import { createReadStream } from 'node:fs';
import { stat } from 'node:fs/promises';
import { runPicker } from './lib/picker.js';
import { promptCompression, promptFormat, determineExtension, getOutputPath } from './lib/compression.js';

const args = process.argv.slice(2);

/**
 * Display usage information
 */
function showHelp() {
  console.log(`btar - User-friendly archive tool

Usage:
  btar <files...>          Create archive from files
  btar <archive>          Extract archive contents
  btar -l <archive>       List archive contents
  btar --help             Show this help message

Examples:
  btar file1.txt file2.txt     Creates archive.tar
  btar archive.tar             Extracts archive
  btar -l archive.tar          Lists contents`);
  process.exit(0);
}

/**
 * Determine the operation mode based on arguments
 */
function detectMode(args) {
  // Handle help flag
  if (args.includes('--help') || args.includes('-h')) {
    return 'help';
  }

  // Handle list flag
  if (args[0] === '-l') {
    return 'list';
  }

  // No arguments - check for interactive mode
  if (args.length === 0) {
    // If stdin is a TTY, use interactive mode
    if (process.stdin.isTTY) {
      return 'interactive';
    }
    // Otherwise show error (ERR-01)
    return 'error:no-args';
  }

  // Single argument - could be extract or list
  if (args.length === 1) {
    return 'extract';
  }

  // Multiple arguments - create archive
  return 'create';
}

/**
 * Main CLI entry point
 */
async function main() {
  const mode = detectMode(args);

  // Handle help mode
  if (mode === 'help') {
    showHelp();
    return;
  }

  // Handle no arguments error (ERR-01)
  if (mode === 'error:no-args') {
    console.error('Error: No files or archive specified.');
    console.error('Run "btar --help" for usage information.');
    process.exit(1);
  }

  try {
    switch (mode) {
      case 'interactive': {
        // Run the interactive file picker
        const selectedFiles = await runPicker();
        
        // Handle cancellation
        if (!selectedFiles || selectedFiles.length === 0) {
          console.log('No files selected. Exiting.');
          process.exit(0);
        }

        console.log(`Selected ${selectedFiles.length} file(s)`);

        // Prompt for compression
        const compressed = await promptCompression(selectedFiles);
        
        let format = 'gz';
        if (compressed) {
          format = await promptFormat();
        }

        // Determine extension and output path
        const extension = determineExtension(compressed, format);
        const outputPath = getOutputPath(selectedFiles, extension);

        console.log(`Creating archive: ${outputPath}`);
        const result = await createArchive(selectedFiles, outputPath);
        console.log(result);
        break;
      }

      case 'create': {
        const files = args;
        const outputPath = 'archive.tar';

        // Validate all files exist (ERR-02)
        for (const file of files) {
          await validateFileExists(file);
        }

        console.log(`Creating archive: ${outputPath}`);
        const result = await createArchive(files, outputPath);
        console.log(result);
        break;
      }

      case 'extract': {
        const archivePath = args[0];

        // Validate archive exists
        await validateFileExists(archivePath);

        // List archive contents before extracting
        console.log(`Contents of ${archivePath}:`);
        const listResult = await listArchive(archivePath);
        console.log(listResult);

        console.log('\nExtracting...');
        const result = await extractArchive(archivePath);
        console.log(result);
        break;
      }

      case 'list': {
        const archivePath = args[1] || args[0];

        // Validate archive exists
        await validateFileExists(archivePath);

        console.log(`Listing: ${archivePath}`);
        const result = await listArchive(archivePath);
        console.log(result);
        break;
      }
    }
  } catch (error) {
    handleError(error);
    process.exit(1);
  }
}

// Export for testing
export { main };

// Run if executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}