# Requirements: btar

**Defined:** 2025-05-15
**Core Value:** Make archive operations effortless — users can zip multiple files or unzip archives without memorizing tar flags or worrying about file clutter.

## v1 Requirements

### CLI Core

- [ ] **CORE-01**: btar runs as standalone npm command `btar`
- [ ] **CORE-02**: btar accepts files as arguments (no flags needed for basic use)
- [ ] **CORE-03**: btar auto-detects whether files are to be zipped or unzipped based on input

### Interactive File Picker (Zip Mode)

- [x] **PICK-01**: Display files in current directory in 2-column grid layout
- [x] **PICK-02**: Search/filter input at top of picker
- [x] **PICK-03**: Allow multiselect of files via keyboard (arrow keys + space)
- [x] **PICK-04**: Show maximum ~5 lines of files (10 files visible)
- [x] **PICK-05**: Arrow keys navigate, Enter confirms, Escape cancels

### Compression

- [x] **COMP-01**: After file selection, prompt "Compress?" with Yes/No
- [x] **COMP-02**: If Yes, prompt "Format: gz or xz?" (two options)
- [x] **COMP-03**: If No, create plain .tar file
- [x] **COMP-04**: Create correct extension: .tar, .tar.gz (xz removed - no native Node.js support)

### Extraction (Unzip Mode)

- [x] **UNZIP-01**: Accept .tar, .tar.gz, .gz files as input (xz removed - no native support)
- [x] **UNZIP-02**: List archive contents before extracting
- [x] **UNZIP-03**: Detect if files have common top-level prefix (e.g., "myproject/")
- [x] **UNZIP-04**: If no common prefix, extract to new folder named after archive
- [x] **UNZIP-05**: If common prefix exists, extract normally to current directory

### Error Handling

- [ ] **ERR-01**: Show helpful error if no files provided
- [ ] **ERR-02**: Handle non-existent files gracefully
- [ ] **ERR-03**: Handle invalid archive files gracefully

## v2 Requirements

- **PICK-06**: Directory support for recursive file selection
- **UNZIP-06**: Password-protected archive detection (reject with message)

## Out of Scope

| Feature | Reason |
|---------|--------|
| Zip to non-tar formats | tar-only for v1 |
| Recursive directory zipping | Files only for v1 |
| Password-protected archives | Future consideration |

## Traceability

| Requirement | Phase | Status |
|-------------|-------|--------|
| CORE-01 | Phase 1 | Pending |
| CORE-02 | Phase 1 | Pending |
| CORE-03 | Phase 1 | Pending |
| PICK-01 | Phase 2 | ✓ Complete |
| PICK-02 | Phase 2 | ✓ Complete |
| PICK-03 | Phase 2 | ✓ Complete |
| PICK-04 | Phase 2 | ✓ Complete |
| PICK-05 | Phase 2 | ✓ Complete |
| COMP-01 | Phase 2 | ✓ Complete |
| COMP-02 | Phase 2 | ✓ Complete |
| COMP-03 | Phase 2 | ✓ Complete |
| COMP-04 | Phase 2 | ✓ Complete |
| UNZIP-01 | Phase 3 | ✓ Complete |
| UNZIP-02 | Phase 3 | ✓ Complete |
| UNZIP-03 | Phase 3 | ✓ Complete |
| UNZIP-04 | Phase 3 | ✓ Complete |
| UNZIP-05 | Phase 3 | ✓ Complete |
| ERR-01 | Phase 1 | Pending |
| ERR-02 | Phase 1 | Pending |
| ERR-03 | Phase 1 | Pending |

**Coverage:**
- v1 requirements: 19 total
- Mapped to phases: 19
- Unmapped: 0 ✓

---
*Requirements defined: 2025-05-15*
*Last updated: 2025-05-15 after initial definition*