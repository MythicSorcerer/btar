# Phase 2: Interactive Picker & Compression - Context

**Gathered:** 2025-05-15
**Status:** Ready for planning

<domain>
## Phase Boundary

Phase 2 adds interactive UI layer on top of Phase 1's CLI core:
- When no file arguments provided → show interactive file picker
- After file selection → prompt for compression options
- Create archive with selected format

**Key assumption:** Uses existing `createArchive()` from Phase 1's lib/archive.js
</domain>

<decisions>
## Implementation Decisions

### UI Framework
- Use Node.js readline for TTY UI (no external deps for v1)
- Fallback: if not TTY, show help like Phase 1

### File Picker
- 2-column grid layout (PICK-01)
- Search filter at top (PICK-02)
- Arrow keys + space for multiselect (PICK-03)
- Max 10 files visible, scroll if more (PICK-04)
- Enter confirms, Escape cancels (PICK-05)

### Compression Flow
- After selection: "Compress? (y/n)" (COMP-01)
- If yes: "Format: (g)z or (x)z?" (COMP-02)
- Extension: .tar, .tar.gz, .tar.xz based on choice (COMP-03, COMP-04)

</decisions>

<canonical_refs>
## Canonical References

### From Phase 1
- `lib/archive.js` — contains createArchive() to reuse
- `package.json` — btar CLI entry point
- `btar.js` — main CLI handler

</canonical_refs>

---

*Phase: 02-interactive-picker*