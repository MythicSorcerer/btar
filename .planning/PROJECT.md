# btar

## What This Is

A user-friendly CLI tool for creating and extracting archive files. Makes tar/zip intuitive with interactive file selection, smart compression options, and safe extraction that prevents "exploding" files into the current directory.

## Core Value

Make archive operations effortless — users can zip multiple files or unzip archives without memorizing tar flags or worrying about file clutter.

## Requirements

### Validated

(None yet — ship to validate)

### Active

- [ ] btar CLI tool runs as standalone command
- [ ] Interactive file picker UI for zip mode (2-column grid, search, multiselect)
- [x] Compression prompt: none / gz (xz removed - no native Node.js support)
- [x] Create .tar, .tar.gz archives
- [x] Extract .tar, .tar.gz, .gz files
- [ ] Smart extraction: detect common top-level prefix, extract to folder if missing

### Out of Scope

- [Zip to other formats] — tar-only for v1
- [Recursive directory zipping] — files only
- [Password-protected archives] — future consideration

## Context

Node.js CLI using a modern UI library for interactive prompts. Target users: developers, system admins, anyone who uses tar frequently but finds flags confusing.

## Constraints

- **Tech**: Node.js, npm distributable
- **Platform**: macOS/Linux (cross-platform nice to have)

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| Interactive UI over flags | Primary goal is intuitiveness | — Pending |
| Compression: ask every time | Users may want different formats | — Pending |
| Extract-to-folder on no-prefix | Prevents file clutter | — Pending |

## Evolution

This document evolves at phase transitions and milestone boundaries.

**After each phase transition** (via `/gsd-transition`):
1. Requirements invalidated? → Move to Out of Scope with reason
2. Requirements validated? → Move to Validated with phase reference
3. New requirements emerged? → Add to Active
4. Decisions to log? → Add to Key Decisions
5. "What This Is" still accurate? → Update if drifted

**After each milestone** (via `/gsd-complete-milestone`):
1. Full review of all sections
2. Core Value check — still the right priority?
3. Audit Out of Scope — reasons still valid?
4. Update Context with current state

---
*Last updated: 2025-05-15 after initialization*