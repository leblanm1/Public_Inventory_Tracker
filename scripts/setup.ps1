param(
  [string]$RepoPath = (Resolve-Path (Join-Path $PSScriptRoot "..")).Path,
  [string]$BackupTime = "07:00",
  [switch]$SkipScheduledTask,
  [switch]$SkipShortcut,
  [switch]$SkipStart
)

# One-command setup for a brand-new lab installation on Windows.
# Run this once, from an elevated-or-normal PowerShell window, after cloning
# the repo and installing Node.js + Git.
#
#   powershell -ExecutionPolicy Bypass -File scripts\setup.ps1
#
# It will:
#   1. Verify Node.js and Git are installed.
#   2. Run `npm install`.
#   3. Create a .env file from .env.example if one doesn't exist yet.
#   4. Create a Desktop shortcut that launches the tracker.
#   5. Register the daily automated-backup scheduled task.
#   6. Start the tracker and verify it responds on http://localhost:3000.

$ErrorActionPreference = "Stop"
$resolvedRepoPath = (Resolve-Path $RepoPath).Path
Set-Location $resolvedRepoPath

function Write-Step($text) {
  Write-Host ""
  Write-Host "==> $text" -ForegroundColor Cyan
}

function Require-Command($name, $installUrl) {
  if (-not (Get-Command $name -ErrorAction SilentlyContinue)) {
    Write-Error "$name was not found on PATH. Install it from $installUrl, then re-run this script."
    exit 1
  }
}

Write-Step "Checking prerequisites"
Require-Command "node" "https://nodejs.org/"
Require-Command "git" "https://git-scm.com/downloads"
Write-Host "Node: $(node --version)"
Write-Host "Git:  $(git --version)"

Write-Step "Installing npm dependencies (this can take a minute)"
cmd.exe /d /s /c "npm install"
if ($LASTEXITCODE -ne 0) {
  Write-Error "npm install failed. Fix the error above and re-run this script."
  exit 1
}

Write-Step "Checking .env file"
$envPath = Join-Path $resolvedRepoPath ".env"
$envExamplePath = Join-Path $resolvedRepoPath ".env.example"
if (-not (Test-Path $envPath) -and (Test-Path $envExamplePath)) {
  Copy-Item $envExamplePath $envPath
  Write-Host "Created .env from .env.example. Edit it later if you need a custom PORT or LAB_PASSPHRASE."
} else {
  Write-Host ".env already exists or no template found; leaving it as-is."
}

if (-not $SkipShortcut) {
  Write-Step "Creating Desktop shortcut"
  powershell -NoProfile -ExecutionPolicy Bypass -File (Join-Path $resolvedRepoPath "scripts\create-desktop-shortcut.ps1") -RepoPath $resolvedRepoPath
}

if (-not $SkipScheduledTask) {
  Write-Step "Registering daily automated-backup scheduled task (runs at $BackupTime)"
  powershell -NoProfile -ExecutionPolicy Bypass -File (Join-Path $resolvedRepoPath "scripts\register-daily-backup-task.ps1") -RepoPath $resolvedRepoPath -Time $BackupTime
}

if (-not $SkipStart) {
  Write-Step "Starting the tracker and checking that it responds"
  & (Join-Path $resolvedRepoPath "Start_Lab_Tracker.cmd")

  $healthy = $false
  for ($i = 0; $i -lt 20; $i++) {
    Start-Sleep -Seconds 1
    try {
      $response = Invoke-WebRequest -Uri "http://localhost:3000" -UseBasicParsing -TimeoutSec 2
      if ($response.StatusCode -eq 200) { $healthy = $true; break }
    } catch {
      # Server still starting up; keep retrying.
    }
  }

  if ($healthy) {
    Write-Host "Tracker is running at http://localhost:3000" -ForegroundColor Green
  } else {
    Write-Warning "Could not confirm the tracker is running yet. Give it a few more seconds, then open http://localhost:3000 manually, or check the tray icon in your system tray for a 'Status: Stopped' message."
  }
}

Write-Step "Setup complete"
Write-Host "Next steps:"
Write-Host "  1. Open http://localhost:3000 (or double-click the new Desktop shortcut)."
Write-Host "  2. Follow the first-run setup wizard to add your lab members."
Write-Host "  3. See SETUP.md for GitHub-based offsite backup configuration."
