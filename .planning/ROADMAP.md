# Roadmap: btar

**Phases:** 3 | **Requirements:** 19 | **Mode:** YOLO

## Phase 1: CLI Core

**Goal:** btar runs as standalone command with basic argument handling

**Requirements:** CORE-01, CORE-02, CORE-03, ERR-01, ERR-02, ERR-03

**Plans:**
- [x] 01-01-PLAN.md — Create working btar CLI tool with create/extract/list and error handling

**Success Criteria:**
1. `btar` command is executable from PATH
2. Running `btar file1 file2` creates archive
3. Running `btar archive.tar` extracts archive
4. Helpful error shown when no args provided
5. Non-existent files show clear error
6. Invalid archives show clear error

---

## Phase 2: Interactive Picker & Compression

**Goal:** User-friendly file selection UI and compression options

**Requirements:** PICK-01, PICK-02, PICK-03, PICK-04, PICK-05, COMP-01, COMP-02, COMP-03, COMP-04

**Success Criteria:**
1. Files displayed in 2-column grid when no args given
2. Search filter filters visible files
3. Arrow keys + space select multiple files
4. Enter confirms selection, Escape cancels
5. "Compress?" prompt appears after selection
6. "gz or xz?" prompt appears if compress = yes
7. Creates .tar, .tar.gz, or .tar.xz based on choice
8. Creates plain .tar if compress = no

---

## Phase 3: Smart Extraction

**Goal:** Intelligent extraction that prevents file explosion

**Requirements:** UNZIP-01, UNZIP-02, UNZIP-03, UNZIP-04, UNZIP-05

**Success Criteria:**
1. Lists archive contents before extracting
2. Detects common top-level prefix in archive
3. Creates subfolder if files have no common prefix
4. Extracts normally when common prefix exists
5. Handles .tar, .tar.gz, .tar.xz, .gz formats

---

## Phase Summary

| # | Phase | Goal | Requirements | Success Criteria |
|---|-------|------|--------------|------------------|
| 1 | CLI Core | Standalone command with basic handling | 6 | 6 |
| 2 | Interactive Picker & Compression | User-friendly UI + compression options | 9 | 8 |
| 3 | Smart Extraction | Intelligent extraction | 5 | 5 |

**Coverage:** 19/19 requirements mapped ✓