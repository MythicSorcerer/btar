---
phase: 03-smart-extraction
uat_date: 2026-05-15
status: partial - xz not working
---

# Phase 3 UAT: Smart Extraction

## Test Results Summary

| Test Case | Archive Type | Expected Behavior | Actual Behavior | Status |
|-----------|-------------|-------------------|-----------------|--------|
| 1 - No prefix | .tar | Creates subfolder | Creates subfolder | PASS |
| 2 - With prefix | .tar | Extract to current dir | Extract to current dir | PASS |
| 3 - No prefix | .tar.gz | Creates subfolder | Creates subfolder | PASS |
| 4 - No prefix | .tar.xz | Creates subfolder | Decompression failed | FAIL |
| 5 - Multi-file with prefix | .tar | Extract to current dir | Extract to current dir | PASS |

## Feature Verification

### UNZIP-01: Extract .tar, .tar.gz, .tar.xz, .gz archives

- .tar: PASS
- .tar.gz: PASS
- .tar.xz: FAIL (decompression error)
- .gz: NOT TESTED

### UNZIP-02: Archive contents listed before extraction

**Evidence:**
```
Contents of /tmp/btar-test/no-prefix.tar:
        12 2026-05-15 file1.txt
        12 2026-05-15 file2.txt

Extracting...
Creating folder: no-prefix/
```

**Status:** PASS

### UNZIP-03: Common prefix detected correctly

**Test cases:**
- `['proj/file1.txt', 'proj/file2.txt']` → returns "proj" ✓
- `['file1.txt', 'file2.txt']` → returns null ✓
- `['dir/a.txt', 'other/b.txt']` → returns null ✓
- `['proj/file.txt', 'file2.txt']` → returns null ✓

**Status:** PASS

### UNZIP-04: No prefix → creates subfolder

**Evidence:**
```
Creating folder: no-prefix/
Extracted 2 file(s) to no-prefix
```

**Status:** PASS

### UNZIP-05: Has prefix → extracts to current directory

**Evidence:**
```
Extracting to current directory (common prefix detected)
Extracted 1 file(s) to .
```

**Status:** PASS

## Known Issues

### Issue 1: .tar.xz decompression not working

**Problem:** Extracting .tar.xz archives fails with "Decompression failed"

**Root cause:** In lib/archive.js line 187-192, the code uses `createBrotliDecompress` for .xz files, which is incorrect. XZ compression requires different decompression (or a library like xz-wasm).

**Impact:** UNZIP-01 requirement not fully met for .tar.xz format

**Suggested fix:** Either:
1. Add proper XZ support using a third-party library (e.g., `xz-wasm`)
2. Document .tar.xz as unsupported and remove from requirements
3. Check for available Node.js APIs for XZ

## Verification Commands Run

```bash
# Test 1: No prefix - creates subfolder
cd /tmp/btar-test
echo "test" > file1.txt && echo "test" > file2.txt
tar -cf no-prefix.tar file1.txt file2.txt
node /home/xt/projects/btar/btar.js no-prefix.tar

# Test 2: With prefix - extract to current dir
mkdir myproject && echo "test" > myproject/project.txt
tar -cf with-prefix.tar myproject
node /home/xt/projects/btar/btar.js with-prefix.tar

# Test 3: .tar.gz - no prefix
echo "gz1" > gz1.txt && echo "gz2" > gz2.txt
tar -czf gz-test.tar.gz gz1.txt gz2.txt
node /home/xt/projects/btar/btar.js gz-test.tar.gz

# Test 4: .tar.xz - no prefix
echo "xz1" > xz1.txt && echo "xz2" > xz2.txt
tar -cJf xz-test.tar.xz xz1.txt xz2.txt
node /home/xt/projects/btar/btar.js xz-test.tar.xz
```

## Decision Required

The Phase 3 features work correctly for .tar and .tar.gz, but .tar.xz has a bug. Should we:
1. Fix the .tar.xz issue (requires adding a dependency or using built-in APIs)
2. Accept current state and document .tar.xz as unsupported

**Recommendation:** Fix .tar.xz as it's listed in requirements, but if Node.js doesn't support it natively, we may need to add a dependency.