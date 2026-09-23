param(
  [string]$RepoPath = (Resolve-Path (Join-Path $PSScriptRoot "..")).Path,
  [string]$ShortcutName = "Lab Inventory Tracker",
  [string]$DesktopPath = [Environment]::GetFolderPath("Desktop")
)

# Creates a Desktop shortcut that launches Start_Lab_Tracker.cmd (which starts
# the hidden background server via the tray launcher and opens the browser).

$ErrorActionPreference = "Stop"

$resolvedRepoPath = (Resolve-Path $RepoPath).Path
$targetCmd = Join-Path $resolvedRepoPath "Start_Lab_Tracker.cmd"

if (-not (Test-Path $targetCmd)) {
  Write-Error "Could not find $targetCmd. Run this script from inside the repo."
  exit 1
}

$shortcutPath = Join-Path $DesktopPath "$ShortcutName.lnk"

$shell = New-Object -ComObject WScript.Shell
$shortcut = $shell.CreateShortcut($shortcutPath)
$shortcut.TargetPath = $targetCmd
$shortcut.WorkingDirectory = $resolvedRepoPath
$shortcut.WindowStyle = 7 # Minimized
$shortcut.IconLocation = "$env:SystemRoot\System32\shell32.dll,13"
$shortcut.Description = "Start the Lab Inventory Tracker"
$shortcut.Save()

Write-Host "Desktop shortcut created: $shortcutPath"
