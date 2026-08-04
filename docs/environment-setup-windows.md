# Environment Setup — Windows (Node 24)

ClaimRadar India pins Node to `>=24 <25` (see `engines` in the root
`package.json`, plus `.nvmrc` and `.node-version`, both containing `24`).
CI workflows (`.github/workflows/*.yml`) also run on `node-version: '24'`.
Local development on Windows must use a Node 24.x runtime — do **not**
develop against Node 26.x, and do not introduce Node 26-only APIs.

## Option A — pnpm-managed Node (no extra tools; verified on this machine)

pnpm can install and manage Node itself. This is the path that was
verified working on this Windows machine during the Phase 4B preflight.

```powershell
# 1. Ensure pnpm's global bin dir is on PATH for the session
#    (run `pnpm setup` once to make this permanent, then restart the shell)
$env:PATH = "$env:LOCALAPPDATA\pnpm\bin;" + $env:PATH

# 2. Install Node 24 globally via pnpm
pnpm env use --global 24
#    Newer pnpm versions prefer:  pnpm runtime set node 24 -g

# 3. Verify
node --version        # expect v24.x.x (v24.18.0 at time of writing)
(Get-Command node).Source   # expect ...\AppData\Local\pnpm\bin\node.EXE
```

Note: if a system-wide Node (e.g. `C:\Program Files\nodejs`) appears
earlier in PATH, it wins. Run `pnpm setup` so the pnpm bin dir is
prepended permanently, or move it above `C:\Program Files\nodejs` in
_System Properties → Environment Variables_.

## Option B — nvm-windows

```powershell
# Install nvm-windows from https://github.com/coreybutler/nvm-windows/releases
# (nvm-setup.exe), then in a NEW PowerShell window:

nvm install 24        # installs latest 24.x
nvm use 24            # requires an elevated (Administrator) shell
node --version        # expect v24.x.x
```

nvm-windows does **not** read `.nvmrc` automatically — run `nvm use 24`
per machine (the selection persists globally until changed).

## Option C — fnm (Fast Node Manager)

```powershell
# Install via winget:
winget install Schniz.fnm

# Add to your PowerShell profile ($PROFILE) so fnm activates per session
# and honors the repo's .node-version / .nvmrc automatically:
fnm env --use-on-cd --shell powershell | Out-String | Invoke-Expression

# Then, from the repo root:
fnm install 24
fnm use 24
node --version        # expect v24.x.x
```

## Verification checklist (run from repo root)

```powershell
node --version    # must print v24.x.x
pnpm --version    # must print >= 9
pnpm exec node --version   # confirms child processes also get Node 24
pnpm install      # must not print an engines warning
pnpm lint; pnpm typecheck; pnpm test; pnpm build
```

## Rules

- The engines pin `>=24 <25` is a hard constraint, not cosmetic. Running
  under Node 26 masks compatibility drift and is not a valid verification
  environment.
- Do not use Node 26-only APIs anywhere in the codebase; CI and
  production (GitHub Actions workflows) run Node 24.
- `pnpm >= 9` is required (`packageManager`/engines). pnpm 11.x works.
