/**
 * Interactive file picker with 2-column grid, search filter, and multiselect
 */

import { readdirSync, statSync } from 'node:fs';
import { join, basename } from 'node:path';
import { createInterface } from 'node:readline';

/**
 * Filter files to show only regular files (not directories, hidden files, etc.)
 * @param {string[]} files - Array of file names
 * @returns {string[]} Filtered files
 */
function filterValidFiles(files) {
  return files.filter(file => {
    // Skip hidden files
    if (file.startsWith('.')) return false;
    // Skip node_modules
    if (file === 'node_modules') return false;
    // Skip common build artifacts
    if (file === 'dist' || file === 'build') return false;
    // Only include regular files
    try {
      return statSync(file).isFile();
    } catch {
      return false;
    }
  });
}

/**
 * Apply case-insensitive filter to file list
 * @param {string[]} files - Array of file names
 * @param {string} filter - Filter string
 * @returns {string[]} Filtered files
 */
export function filterFiles(files, filter) {
  if (!filter || filter.trim() === '') {
    return files;
  }
  const lowerFilter = filter.toLowerCase();
  return files.filter(file => file.toLowerCase().includes(lowerFilter));
}

/**
 * Display the file grid in 2-column layout
 * @param {string[]} files - All files
 * @param {Set} selected - Set of selected file indices
 * @param {number} cursor - Current cursor position
 * @param {string} filter - Current filter string
 */
export function displayGrid(files, selected, cursor, filter) {
  // Clear screen and move to top
  process.stdout.write('\x1b[2J\x1b[H');
  
  // Show filter at top
  console.log('\n=== FILE PICKER ===');
  console.log(`Filter: ${filter || '(none)'}`);
  console.log('-------------------');
  console.log('Use Arrow keys to move, Space to select, Enter to confirm, Escape to cancel');
  console.log('-------------------\n');

  // Get visible files (filtered)
  const visibleFiles = filterFiles(files, filter);
  
  if (visibleFiles.length === 0) {
    console.log('No matching files found.\n');
    return;
  }

  // Display in 2-column grid (max 5 rows = 10 files)
  const maxRows = 5;
  const visibleCount = Math.min(visibleFiles.length, maxRows * 2);
  
  for (let i = 0; i < maxRows; i++) {
    const leftIdx = i * 2;
    const rightIdx = i * 2 + 1;
    
    let left = '';
    let right = '';
    
    if (leftIdx < visibleCount) {
      const file = visibleFiles[leftIdx];
      const isSelected = selected.has(leftIdx);
      const isCursor = cursor === leftIdx;
      const marker = isSelected ? '[*]' : '[ ]';
      const cursorMark = isCursor ? '>' : ' ';
      left = `${cursorMark}${marker} ${file}`;
    }
    
    if (rightIdx < visibleCount) {
      const file = visibleFiles[rightIdx];
      const isSelected = selected.has(rightIdx);
      const isCursor = cursor === rightIdx;
      const marker = isSelected ? '[*]' : '[ ]';
      const cursorMark = isCursor ? '>' : ' ';
      right = `${cursorMark}${marker} ${file}`;
    }
    
    // Pad left column to align with right
    const leftPad = left ? left.padEnd(40) : '';
    console.log(leftPad + right);
  }
  
  console.log(`\nSelected: ${selected.size} file(s)`);
}

/**
 * Handle keyboard input for navigation and selection
 * @param {string} key - Key pressed
 * @param {Object} state - Current state (files, selected, cursor, filter)
 * @returns {Object} Updated state or null to cancel
 */
export function handleKeyInput(key, state) {
  const { files, selected, cursor, filter } = state;
  const visibleFiles = filterFiles(files, filter);
  
  // Handle special keys
  if (key === 'arrowup') {
    // Move cursor up (to previous row's same column)
    const col = cursor % 2;
    const row = Math.floor(cursor / 2);
    const newRow = Math.max(0, row - 1);
    const newCursor = newRow * 2 + col;
    if (newCursor < visibleFiles.length) {
      return { ...state, cursor: newCursor };
    }
  } else if (key === 'arrowdown') {
    // Move cursor down (to next row's same column)
    const col = cursor % 2;
    const row = Math.floor(cursor / 2);
    const newRow = row + 1;
    const newCursor = newRow * 2 + col;
    if (newCursor < visibleFiles.length) {
      return { ...state, cursor: newCursor };
    }
  } else if (key === 'arrowleft') {
    // Move to left column
    if (cursor % 2 === 1) {
      return { ...state, cursor: cursor - 1 };
    }
  } else if (key === 'arrowright') {
    // Move to right column
    if (cursor % 2 === 0) {
      const newCursor = cursor + 1;
      if (newCursor < visibleFiles.length) {
        return { ...state, cursor: newCursor };
      }
    }
  } else if (key === ' ') {
    // Toggle selection
    const newSelected = new Set(selected);
    if (newSelected.has(cursor)) {
      newSelected.delete(cursor);
    } else {
      newSelected.add(cursor);
    }
    return { ...state, selected: newSelected };
  } else if (key === 'enter') {
    // Confirm selection - convert visible indices to real file indices
    const result = [];
    const visibleFilesList = visibleFiles;
    for (const visIdx of selected) {
      if (visIdx < visibleFilesList.length) {
        result.push(visibleFilesList[visIdx]);
      }
    }
    return { done: true, selected: result };
  } else if (key === 'escape') {
    // Cancel
    return { done: true, selected: null };
  } else if (key === 'backspace') {
    // Remove last character from filter
    const newFilter = filter.slice(0, -1);
    return { ...state, filter: newFilter, cursor: 0 };
  } else if (key.length === 1) {
    // Add character to filter
    const newFilter = filter + key;
    return { ...state, filter: newFilter, cursor: 0 };
  }
  
  return state;
}

/**
 * Convert readline key sequence to simple key name
 * @param {string} sequence - Key sequence from readline
 * @returns {string} Simple key name
 */
function parseKey(sequence) {
  if (sequence === '\r' || sequence === '\n') return 'enter';
  if (sequence === '\u001b') return 'escape';
  if (sequence === ' ') return ' ';
  if (sequence === '\u007f') return 'backspace'; // DEL/Backspace
  if (sequence === '\x1b[A') return 'arrowup';
  if (sequence === '\x1b[B') return 'arrowdown';
  if (sequence === '\x1b[D') return 'arrowleft';
  if (sequence === '\x1b[C') return 'arrowright';
  if (sequence.length === 1) return sequence;
  return null;
}

/**
 * Main entry point for the interactive file picker
 * @returns {Promise<string[]|null>} Array of selected files or null if cancelled
 */
export async function runPicker() {
  // Check if stdin is a TTY
  if (!process.stdin.isTTY) {
    console.log('Interactive mode requires a terminal.');
    console.log('Run with file arguments to create an archive.');
    return null;
  }

  // Read current directory
  let files;
  try {
    files = readdirSync('.');
  } catch (err) {
    console.error('Error reading directory:', err.message);
    return null;
  }

  // Filter to valid files
  files = filterValidFiles(files).sort();

  if (files.length === 0) {
    console.log('No files found in current directory.');
    return null;
  }

  // Initialize state
  const state = {
    files,
    selected: new Set(),
    cursor: 0,
    filter: ''
  };

  // Set up readline for raw mode
  const rl = createInterface({
    input: process.stdin,
    output: process.stdout,
    terminal: true
  });

  // Enable raw mode for key handling
  process.stdin.setRawMode(true);

  // Initial display
  displayGrid(files, state.selected, state.cursor, state.filter);

  return new Promise((resolve) => {
    rl.on('line', (line) => {
      // Not used - we handle keys in 'keypress'
    });

    process.stdin.on('keypress', (chunk, key) => {
      if (key && key.ctrl && key.name === 'c') {
        process.stdin.setRawMode(false);
        rl.close();
        resolve(null);
        return;
      }

      let keyName = null;
      
      // Handle special keys
      if (key) {
        if (key.name === 'up') keyName = 'arrowup';
        else if (key.name === 'down') keyName = 'arrowdown';
        else if (key.name === 'left') keyName = 'arrowleft';
        else if (key.name === 'right') keyName = 'arrowright';
        else if (key.name === 'return') keyName = 'enter';
        else if (key.name === 'escape') keyName = 'escape';
        else if (key.name === 'space') keyName = ' ';
        else if (key.name === 'backspace') keyName = 'backspace';
      }
      
      // Handle regular characters
      if (!keyName && chunk && chunk.length === 1) {
        const code = chunk.charCodeAt(0);
        // Only allow printable ASCII
        if (code >= 32 && code <= 126) {
          keyName = chunk;
        }
      }

      if (!keyName) return;

      // Handle the key
      const result = handleKeyInput(keyName, state);
      
      if (result === null) {
        process.stdin.setRawMode(false);
        rl.close();
        resolve(null);
        return;
      }

      // Check if done
      if (result.done) {
        process.stdin.setRawMode(false);
        rl.close();
        resolve(result.selected);
        return;
      }

      // Update state and redisplay
      state.selected = result.selected;
      state.cursor = result.cursor;
      state.filter = result.filter;
      displayGrid(files, state.selected, state.cursor, state.filter);
    });
  });
}