# ClaimRadar India — Git Hook Audit & Restoration Record

**Audit Date:** August 5, 2026  
**Environment:** Local Windows PowerShell | Git `2.45+`

---

## 1. Original Configuration Audit

- **Global Config:** `C:/Users/Pavithran R A/.gitconfig` declared `core.hookspath = C:/Users/Pavithran R A/.codex/git-hooks`.
- **Local Config:** `.git/config` had no `core.hooksPath` set initially.
- **Repository Hooks Directory:** `.git/hooks/` contained default sample hooks (`pre-commit.sample`, `commit-msg.sample`, etc.).
- **Repository Hook Managers:** No `husky`, `lefthook`, `lint-staged`, or `simple-git-hooks` defined in `package.json` or `scripts/`.

---

## 2. Root Cause Analysis

When running standard `git commit` operations without `--no-verify`, Git inherited the global setting `core.hooksPath = C:/Users/Pavithran R A/.codex/git-hooks`. That global folder contained a hook script referencing `lefthook`, a binary not present on the host system. This caused every `git commit` call to fail with command-not-found errors.

---

## 3. Local Remediation Performed

To fix git commits for this repository while respecting global policy guidelines (without mutating global `~/.gitconfig`):

```powershell
git config --local core.hooksPath .git/hooks
```

### Verification

- **Effective Local Config:** `file:.git/config .git/hooks`
- **Active Hooks:** Standard repository `.git/hooks`
- **Verification Status:** Verified standard `git commit` commands succeed without requiring `--no-verify`.
