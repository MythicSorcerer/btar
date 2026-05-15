/**
 * Core archive operations using Node.js built-in modules
 */

import { createReadStream, createWriteStream, existsSync, readdirSync, statSync, writeFileSync, readFileSync, openSync, readSync, closeSync, mkdirSync } from 'node:fs';
import { dirname, basename, join } from 'node:path';
import { createGzip, createGunzip, createBrotliDecompress } from 'node:zlib';
import { Readable, Transform } from 'node:stream';
import { pipeline } from 'node:stream/promises';

/**
 * Create a simple tar-format archive from files
 * Uses Node.js built-in modules only
 * @param {string[]} files - Array of file paths to include
 * @param {string} outputPath - Path to output archive file
 * @returns {Promise<string>} Success message
 */
export async function createArchive(files, outputPath) {
  if (!files || files.length === 0) {
    throw new Error('No files specified for archive');
  }

  // Create tar header + content for each file
  const tarBuffer = createTarFromFiles(files);

  // Check if output should be compressed (.tar.gz)
  if (outputPath.endsWith('.gz')) {
    const { createGzip } = await import('node:zlib');
    const gzip = createGzip();
    const out = createWriteStream(outputPath);
    const input = Readable.from(tarBuffer);
    await pipeline(input, gzip, out);
  } else {
    // Plain tar
    writeFileSync(outputPath, tarBuffer);
  }

  return `Created archive: ${outputPath} with ${files.length} file(s)`;
}

/**
 * Create a simple tar buffer from files
 * @param {string[]} files - Files to include
 * @returns {Buffer} Tar-format buffer
 */
function createTarFromFiles(files) {
  const blocks = [];

  for (const filePath of files) {
    if (!existsSync(filePath)) {
      throw new Error(`File not found: ${filePath}`);
    }

    const stats = statSync(filePath);
    const content = readFileSyncContents(filePath);
    const fileName = basename(filePath);

    // Create 512-byte header block
    const header = createTarHeader(fileName, content.length, Math.floor(stats.mtime.getTime() / 1000));
    blocks.push(header);

    // Add content padded to 512-byte boundary
    const paddedContent = padTo512(content);
    blocks.push(paddedContent);
  }

  // Add two empty 512-byte blocks at end (tar EOF)
  blocks.push(Buffer.alloc(512));
  blocks.push(Buffer.alloc(512));

  return Buffer.concat(blocks);
}

/**
 * Read file contents as buffer
 */
function readFileSyncContents(filePath) {
  return readFileSync(filePath);
}

/**
 * Create tar header block (512 bytes)
 */
function createTarHeader(fileName, fileSize, modTime) {
  const header = Buffer.alloc(512);

  // File name (100 bytes, null-terminated)
  const nameBytes = Buffer.from(fileName.slice(0, 100));
  nameBytes.copy(header, 0);

  // File mode (8 bytes, octal)
  const modeStr = '000644'.padStart(8, '0');
  Buffer.from(modeStr).copy(header, 100);

  // Owner UID (8 bytes, octal)
  Buffer.from('000000').copy(header, 108);

  // Group GID (8 bytes, octal)
  Buffer.from('000000').copy(header, 116);

  // File size (12 bytes, octal)
  const sizeStr = fileSize.toString(8).padStart(11, ' ');
  Buffer.from(sizeStr).copy(header, 124);

  // Modification time (12 bytes, octal)
  const timeStr = modTime.toString(8).padStart(11, ' ');
  Buffer.from(timeStr).copy(header, 136);

  // Checksum (8 bytes) - calculate after filling rest
  // Type flag (1 byte) - regular file
  header[156] = 0x30; // '0' for regular file

  // Link name (100 bytes) - empty for regular files
  // Magic "ustar" (6 bytes)
  Buffer.from('ustar').copy(header, 257);

  // Version "00" (2 bytes)
  Buffer.from('00').copy(header, 263);

  // Owner user name (32 bytes)
  // Owner group name (32 bytes)
  // Device major number (8 bytes)
  // Device minor number (8 bytes)
  // File name prefix (155 bytes)

  // Calculate checksum (sum of all 512 bytes with checksum field as spaces)
  let sum = 0;
  for (let i = 0; i < 512; i++) {
    if (i >= 148 && i < 156) {
      sum += 32; // space character
    } else {
      sum += header[i];
    }
  }

  // Write checksum at bytes 148-155 (octal)
  const checksumStr = sum.toString(8).padStart(7, '0');
  Buffer.from(checksumStr + '\0').copy(header, 148);

  return header;
}

/**
 * Pad content to 512-byte boundary
 */
function padTo512(content) {
  const remainder = content.length % 512;
  if (remainder === 0) return content;

  const padding = 512 - remainder;
  return Buffer.concat([content, Buffer.alloc(padding)]);
}

/**
 * Extract archive contents
 * @param {string} archivePath - Path to archive file
 * @param {string} outputDir - Optional output directory
 * @returns {Promise<string>} Extraction summary
 */
export async function extractArchive(archivePath, outputDir = '.') {
  if (!existsSync(archivePath)) {
    throw new Error(`Archive not found: ${archivePath}`);
  }

  const isCompressed = archivePath.endsWith('.gz') || archivePath.endsWith('.xz');
  const isGzipped = archivePath.endsWith('.gz');
  const isXz = archivePath.endsWith('.xz');

  // Read and parse tar file
  let tarData;

  if (isGzipped) {
    const { createGunzip } = await import('node:zlib');
    const chunks = [];
    for await (const chunk of createReadStream(archivePath).pipe(createGunzip())) {
      chunks.push(chunk);
    }
    tarData = Buffer.concat(chunks);
  } else if (isXz) {
    const { createBrotliDecompress } = await import('node:zlib');
    const chunks = [];
    for await (const chunk of createReadStream(archivePath).pipe(createBrotliDecompress())) {
      chunks.push(chunk);
    }
    tarData = Buffer.concat(chunks);
  } else {
    tarData = readFileSync(archivePath);
  }

  // Get file list for prefix detection
  const fileList = extractTarContents(tarData, null); // null to just get file list

  // Detect common prefix
  const commonPrefix = detectCommonPrefix(fileList);

  // Determine output directory
  let finalOutputDir;
  if (commonPrefix) {
    // Common prefix exists - extract to current directory
    finalOutputDir = '.';
    console.log('Extracting to current directory (common prefix detected)');
  } else {
    // No common prefix - create subfolder named after archive
    let archiveName = basename(archivePath);
    // Strip common extensions
    archiveName = archiveName.replace(/\.tar\.gz$/, '').replace(/\.tar\.xz$/, '').replace(/\.tar$/, '').replace(/\.gz$/, '').replace(/\.xz$/, '');
    finalOutputDir = archiveName;
    console.log(`Creating folder: ${archiveName}/`);
  }

  // Extract files to the determined directory
  const extracted = extractTarContents(tarData, finalOutputDir);
  return `Extracted ${extracted.length} file(s) to ${finalOutputDir}`;
}

/**
 * Extract files from tar buffer
 * @param {Buffer} tarData - Tar file buffer
 * @param {string|null} outputDir - Output directory, or null to just get file list
 * @returns {string[]} Array of file names extracted
 */
function extractTarContents(tarData, outputDir) {
  const files = [];
  let offset = 0;

  while (offset + 512 <= tarData.length) {
    const header = tarData.slice(offset, offset + 512);

    // Check for empty block (end of archive)
    if (header.every(b => b === 0)) {
      break;
    }

    // Parse header
    const fileName = header.slice(0, 100).toString('utf8').replace(/\0/g, '').trim();
    const fileSize = parseInt(header.slice(124, 136).toString('utf8').trim(), 8);

    if (fileName && fileSize > 0) {
      // If outputDir is null, just collect file names (for prefix detection)
      if (outputDir === null) {
        files.push(fileName);
      } else {
        // Read file content
        const contentStart = offset + 512;
        const contentEnd = contentStart + fileSize;
        const content = tarData.slice(contentStart, contentEnd);

        // Write file
        const outPath = join(outputDir, fileName);
        const dir = dirname(outPath);
        if (!existsSync(dir)) {
          mkdirSync(dir, { recursive: true });
        }
        writeFileSync(outPath, content);

        files.push(fileName);
      }
    }

    // Move to next block (header + content + padding)
    const blockCount = Math.ceil((512 + fileSize) / 512);
    offset += blockCount * 512;
  }

  return files;
}

/**
 * Detect common top-level prefix in file paths
 * @param {string[]} files - Array of file paths
 * @returns {string|null} Common prefix if all files share same top-level folder, null otherwise
 */
export function detectCommonPrefix(files) {
  if (!files || files.length === 0) {
    return null;
  }

  // Extract top-level folder from each path
  const prefixes = files.map(f => {
    const parts = f.split('/');
    return parts.length > 1 ? parts[0] : null;
  });

  // If any file has no folder (null), no common prefix
  if (prefixes.some(p => p === null)) {
    return null;
  }

  // Check if all prefixes are the same
  const firstPrefix = prefixes[0];
  const allSame = prefixes.every(p => p === firstPrefix);

  return allSame ? firstPrefix : null;
}

/**
 * List archive contents
 * @param {string} archivePath - Path to archive file
 * @returns {Promise<string>} Formatted file list
 */
export async function listArchive(archivePath) {
  if (!existsSync(archivePath)) {
    throw new Error(`Archive not found: ${archivePath}`);
  }

  const isCompressed = archivePath.endsWith('.gz') || archivePath.endsWith('.xz');
  const isGzipped = archivePath.endsWith('.gz');
  const isXz = archivePath.endsWith('.xz');

  // Read and parse tar file
  let tarData;

  if (isGzipped) {
    const { createGunzip } = await import('node:zlib');
    const chunks = [];
    for await (const chunk of createReadStream(archivePath).pipe(createGunzip())) {
      chunks.push(chunk);
    }
    tarData = Buffer.concat(chunks);
  } else if (isXz) {
    const { createBrotliDecompress } = await import('node:zlib');
    const chunks = [];
    for await (const chunk of createReadStream(archivePath).pipe(createBrotliDecompress())) {
      chunks.push(chunk);
    }
    tarData = Buffer.concat(chunks);
  } else {
    tarData = readFileSync(archivePath);
  }

  // List files from tar data
  return listTarContents(tarData);
}

/**
 * List files from tar buffer
 */
function listTarContents(tarData) {
  const files = [];
  let offset = 0;

  while (offset + 512 <= tarData.length) {
    const header = tarData.slice(offset, offset + 512);

    // Check for empty block
    if (header.every(b => b === 0)) {
      break;
    }

    // Parse header
    const fileName = header.slice(0, 100).toString('utf8').replace(/\0/g, '').trim();
    const fileSize = parseInt(header.slice(124, 136).toString('utf8').trim(), 8);
    const modTime = parseInt(header.slice(136, 148).toString('utf8').trim(), 8);

    if (fileName && fileSize > 0) {
      const date = new Date(modTime * 1000).toISOString().split('T')[0];
      files.push({ name: fileName, size: fileSize, date });
    }

    const blockCount = Math.ceil((512 + fileSize) / 512);
    offset += blockCount * 512;
  }

  if (files.length === 0) {
    return 'Archive is empty';
  }

  // Format output
  const lines = files.map(f => `${f.size.toString().padStart(10)} ${f.date} ${f.name}`);
  return lines.join('\n');
}