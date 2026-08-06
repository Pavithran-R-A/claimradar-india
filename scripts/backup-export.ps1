#Requires -Version 5.1
<#
.SYNOPSIS
  Creates an exportable timestamped backup of the ClaimRadar India project.

.DESCRIPTION
  Zips the chat-1 project root into C:\Users\LENOVO\Downloads\claimradar-backup-<yyyyMMdd-HHmm>.zip.
  Excludes: node_modules, .next, .temp, coverage, tsconfig.tsbuildinfo
  Includes: .git (so full history is exportable)

  Uses Windows 10+ built-in bsdtar (handles exclusions reliably).
  Idempotent: re-running within the same minute replaces the previous zip for that minute.

.EXAMPLE
  pwsh ./scripts/backup-export.ps1
#>

[CmdletBinding()]
param(
  [string]$ProjectRoot = '',
  [string]$DestinationDir = 'C:\Users\Pavithran R A\Downloads\ClaimRadar-Backups'
)

$ErrorActionPreference = 'Stop'

# Resolve project root: script's parent dir; fall back to explicit invocation path or cwd.
if ([string]::IsNullOrWhiteSpace($ProjectRoot)) {
  $scriptDir = $PSScriptRoot
  if ([string]::IsNullOrWhiteSpace($scriptDir) -and $MyInvocation.MyCommand.Path) {
    $scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
  }
  if ([string]::IsNullOrWhiteSpace($scriptDir)) {
    $scriptDir = Join-Path (Get-Location).Path 'scripts'
  }
  $ProjectRoot = (Resolve-Path (Join-Path $scriptDir '..')).Path
}

$stamp   = Get-Date -Format 'yyyyMMdd-HHmmss'
$zipName = "claimradar-source-backup-$stamp.zip"
$zipPath = Join-Path $DestinationDir $zipName

if (-not (Test-Path $DestinationDir)) {
  New-Item -ItemType Directory -Path $DestinationDir -Force | Out-Null
}

# Idempotency: if a backup for this exact minute already exists, replace it.
if (Test-Path $zipPath) {
  Remove-Item $zipPath -Force
  Write-Host "Existing backup for this minute removed: $zipPath"
}

if (-not (Get-Command tar -ErrorAction SilentlyContinue)) {
  throw 'tar not found. Windows 10+ ships bsdtar at C:\Windows\System32\tar.exe.'
}

Push-Location $ProjectRoot
try {
  Write-Host "Archiving $ProjectRoot -> $zipPath ..."
  & tar -a -c -f $zipPath `
    --exclude='node_modules' `
    --exclude='.next' `
    --exclude='.temp' `
    --exclude='coverage' `
    --exclude='dist' `
    --exclude='.env' `
    --exclude='.env.local' `
    --exclude='tsconfig.tsbuildinfo' `
    '.'
  if ($LASTEXITCODE -ne 0) { throw "tar exited with code $LASTEXITCODE" }
} finally {
  Pop-Location
}

# Report results
$zip   = Get-Item $zipPath
$count = (& tar -tf $zipPath | Measure-Object -Line).Lines
$sizeMb = [math]::Round($zip.Length / 1MB, 2)

Write-Host ''
Write-Host 'Backup complete.'
Write-Host "  Path       : $zipPath"
Write-Host "  Size       : $($zip.Length) bytes ($sizeMb MB)"
Write-Host "  Entries    : $count (files + directories)"
