/**
 * Error handling for btar CLI
 */

import { existsSync, accessSync, constants } from 'node:fs';

/**
 * File not found error
 */
export class FileNotFoundError extends Error {
  constructor(filename) {
    super(`File not found: ${filename}`);
    this.name = 'FileNotFoundError';
    this.filename = filename;
  }
}

/**
 * Archive corruption or invalid format error
 */
export class ArchiveError extends Error {
  constructor(filename, message = 'Invalid or corrupted archive') {
    super(`${message}: ${filename}`);
    this.name = 'ArchiveError';
    this.filename = filename;
  }
}

/**
 * Permission denied error
 */
export class PermissionError extends Error {
  constructor(filename, operation = 'access') {
    super(`Permission denied: ${filename} (${operation})`);
    this.name = 'PermissionError';
    this.filename = filename;
    this.operation = operation;
  }
}

/**
 * Validate that a file exists
 * @param {string} path - File path to validate
 * @returns {Promise<void>} Resolves if file exists
 * @throws {FileNotFoundError} If file doesn't exist
 */
export async function validateFileExists(path) {
  if (!existsSync(path)) {
    throw new FileNotFoundError(path);
  }
}

/**
 * Validate that we have read access to a file
 * @param {string} path - File path to validate
 * @throws {PermissionError} If we can't read the file
 */
export function validateReadAccess(path) {
  try {
    accessSync(path, constants.R_OK);
  } catch (error) {
    throw new PermissionError(path, 'read');
  }
}

/**
 * Validate that we have write access to a directory
 * @param {string} path - Directory path to validate
 * @throws {PermissionError} If we can't write to the directory
 */
export function validateWriteAccess(path) {
  try {
    accessSync(path, constants.W_OK);
  } catch (error) {
    throw new PermissionError(path, 'write');
  }
}

/**
 * Validate that an archive file is valid (basic check)
 * @param {string} archivePath - Path to archive
 * @throws {ArchiveError} If archive appears invalid
 */
export function validateArchive(archivePath) {
  if (!existsSync(archivePath)) {
    throw new FileNotFoundError(archivePath);
  }

  // Check file extension
  const validExtensions = ['.tar', '.tar.gz', '.tgz', '.tar.xz', '.txz', '.gz'];
  const ext = archivePath.match(/\.tar\.|\.tgz|\.txz|\.gz/);

  if (!ext && !archivePath.endsWith('.tar') && !archivePath.endsWith('.tar.gz') && !archivePath.endsWith('.tar.xz') && !archivePath.endsWith('.gz')) {
    // Not a fatal error, just a warning - let the archive module handle it
  }

  // Basic size check - empty files are likely invalid
  const stats = require('fs').statSync(archivePath);
  if (stats.size === 0) {
    throw new ArchiveError(archivePath, 'Archive is empty');
  }

  return true;
}

/**
 * Handle and format errors for user display
 * @param {Error} error - Error to handle
 */
export function handleError(error) {
  if (error instanceof FileNotFoundError) {
    console.error(`Error: ${error.message}`);
    console.error('Please check that the file exists and try again.');
  } else if (error instanceof ArchiveError) {
    console.error(`Error: ${error.message}`);
    console.error('The archive may be corrupted or in an unsupported format.');
  } else if (error instanceof PermissionError) {
    console.error(`Error: ${error.message}`);
    console.error('Please check file permissions and try again.');
  } else {
    // Generic error
    console.error(`Error: ${error.message}`);
  }
}

/**
 * Wrap async functions with error handling
 * @param {Function} fn - Function to wrap
 * @returns {Function} Wrapped function
 */
export function withErrorHandling(fn) {
  return async (...args) => {
    try {
      return await fn(...args);
    } catch (error) {
      handleError(error);
      throw error;
    }
  };
}