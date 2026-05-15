/**
 * Compression prompts for archive format selection
 */

import { createInterface } from 'node:readline';

/**
 * Prompt user for compression decision
 * @param {string[]} selectedFiles - Array of selected files (for context)
 * @returns {Promise<boolean>} true for compress, false for no compress
 */
export async function promptCompression(selectedFiles) {
  const fileCount = selectedFiles.length;
  const fileName = fileCount > 0 ? selectedFiles[0] : 'archive';
  
  const rl = createInterface({
    input: process.stdin,
    output: process.stdout,
    terminal: true
  });

  return new Promise((resolve) => {
    const ask = () => {
      rl.question(`Compress? (y/n) `, (answer) => {
        const trimmed = answer.trim().toLowerCase();
        if (trimmed === 'y' || trimmed === 'yes') {
          rl.close();
          resolve(true);
        } else if (trimmed === 'n' || trimmed === 'no') {
          rl.close();
          resolve(false);
        } else {
          console.log('Please enter y or n');
          ask();
        }
      });
    };
    ask();
  });
}

/**
 * Prompt user for compression format
 * @returns {Promise<string>} 'gz' or 'xz'
 */
export async function promptFormat() {
  const rl = createInterface({
    input: process.stdin,
    output: process.stdout,
    terminal: true
  });

  return new Promise((resolve) => {
    const ask = () => {
      rl.question(`Format: (g)z or (x)z? `, (answer) => {
        const trimmed = answer.trim().toLowerCase();
        if (trimmed === 'g' || trimmed === 'gz') {
          rl.close();
          resolve('gz');
        } else if (trimmed === 'x' || trimmed === 'xz') {
          rl.close();
          resolve('xz');
        } else {
          console.log('Please enter g or x');
          ask();
        }
      });
    };
    ask();
  });
}

/**
 * Determine the correct file extension based on compression settings
 * @param {boolean} compressed - Whether to compress
 * @param {string} format - Compression format ('gz' or 'xz')
 * @returns {string} File extension (.tar, .tar.gz, .tar.xz)
 */
export function determineExtension(compressed, format) {
  if (!compressed) {
    return '.tar';
  }
  if (format === 'gz') {
    return '.tar.gz';
  }
  if (format === 'xz') {
    return '.tar.xz';
  }
  // Default fallback
  return '.tar';
}

/**
 * Generate output path based on selected files
 * @param {string[]} selectedFiles - Array of selected files
 * @param {string} extension - File extension to use
 * @returns {string} Output path
 */
export function getOutputPath(selectedFiles, extension) {
  if (!selectedFiles || selectedFiles.length === 0) {
    return `archive${extension}`;
  }
  
  // Use the first selected file's name (without extension if present)
  const firstFile = selectedFiles[0];
  const baseName = firstFile.replace(/\.[^.]+$/, '');
  
  return `${baseName}${extension}`;
}