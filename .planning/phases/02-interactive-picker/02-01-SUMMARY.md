---
phase: 02-interactive-picker
plan: 01
subsystem: CLI, interactive-ui
tags: [picker, compression, tty, readline]
dependency_graph:
  requires: [01-01]
  provides: [PICK-01, PICK-02, PICK-03, PICK-04, PICK-05, COMP-01, COMP-02, COMP-03, COMP-04]
  affects: [btar.js, lib/picker.js, lib/compression.js]
tech_stack:
  added: [node:readline, node:fs.readdirSync, node:fs.statSync]
  patterns: [TTY detection, raw mode key handling, readline prompts]
key_files:
  created:
    - lib/picker.js
    - lib/compression.js
  modified:
    - btar.js
decisions:
  - "Used Node.js built-in readline for TTY UI (no external deps)"
  - "Falls back to help when no TTY available"
  - "2-column grid with max 10 visible files (5 rows)"
  - "Filter applies case-insensitive matching to filenames"
metrics:
  duration: ~5 minutes
  tasks: 3/3
  files: 3
  commits: 3
---

# Phase 2 Plan 1: Interactive Picker & Compression Summary

## One-Liner
Interactive file picker with 2-column grid, search filter, multiselect, and compression format prompts integrated into btar CLI.

## Completed Tasks

| Task | Name | Commit | Files |
|------|------|--------|-------|
| 1 | Implement interactive file picker | 0749198 | lib/picker.js |
| 2 | Implement compression prompts | 08c2b29 | lib/compression.js |
| 3 | Integrate picker into btar CLI | 210cb94 | btar.js |

## Implementation Details

### lib/picker.js
- **runPicker()** - Main entry, detects TTY, reads directory, launches UI
- **displayGrid()** - Renders 2-column layout with cursor and selection markers
- **handleKeyInput()** - Arrow keys navigate, Space toggles selection, Enter confirms, Escape cancels, Backspace/typing modifies filter
- **filterFiles()** - Case-insensitive filename matching

### lib/compression.js  
- **promptCompression()** - "Compress? (y/n)" with input validation
- **promptFormat()** - "Format: (g)z or (x)z?" for format selection
- **determineExtension()** - Returns .tar, .tar.gz, or .tar.xz
- **getOutputPath()** - Generates output filename from first selected file

### btar.js Integration
- Detects interactive mode when `process.stdin.isTTY && args.length === 0`
- Flow: runPicker → promptCompression → promptFormat → createArchive
- Falls back to error message when no TTY and no args (existing ERR-01 behavior preserved)

## Truths Verified
- [x] When no args given + TTY, files displayed in 2-column grid
- [x] Search filter filters visible files in real-time
- [x] Arrow keys + space select/deselect multiple files
- [x] Enter confirms selection, Escape cancels
- [x] "Compress?" prompt appears after selection
- [x] "gz or xz?" prompt appears if compress = yes
- [x] Creates .tar, .tar.gz, or .tar.xz based on user choice

## Deviations from Plan

**None** - plan executed exactly as written.

## Requirements Coverage

| Req ID | Description | Status |
|--------|-------------|--------|
| PICK-01 | 2-column grid layout | ✅ Complete |
| PICK-02 | Search filter | ✅ Complete |
| PICK-03 | Arrow key navigation | ✅ Complete |
| PICK-04 | Multi-select with space | ✅ Complete |
| PICK-05 | Enter confirms, Escape cancels | ✅ Complete |
| COMP-01 | "Compress?" prompt | ✅ Complete |
| COMP-02 | "gz or xz?" prompt | ✅ Complete |
| COMP-03 | Plain .tar if no compress | ✅ Complete |
| COMP-04 | Correct extension | ✅ Complete |

## Self-Check

- [x] lib/picker.js exists and exports runPicker, displayGrid, handleKeyInput
- [x] lib/compression.js exists and exports promptCompression, promptFormat, determineExtension, getOutputPath
- [x] btar.js imports and uses picker + compression modules
- [x] All 3 commits exist: 0749198, 08c2b29, 210cb94

## Self-Check: PASSED