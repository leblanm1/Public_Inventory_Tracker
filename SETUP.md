# Setup Guide — New Lab Installation

This guide walks a brand-new lab through setting up their own copy of the
Lab Inventory Tracker from scratch: creating the GitHub repo, installing
prerequisites, running the tracker, adding a desktop icon, and turning on
automated backups. It assumes **no existing data** — the app will prompt you
to add your lab members the first time you open it.

If you're on Windows, most of this is a single script (Step 4). macOS/Linux
users should follow the manual steps in each section instead.

---

## 0. For the maintainer: preparing a clean template repo (do this once)

This working repo currently contains **real lab data** that must not ship in
the public/shared template: `data/inventory.json` and its `.bak` files, and
the one-off spreadsheet exports and patch files at the repo root (e.g.
`lab_inventory_*.csv/json`, `non_plasmid_*.csv`, `plasmid_upload_*.csv`,
`*.patch`, `metadata.json`). Before creating the sister repo:

1. Create the new repo (Step 1 below) from a copy of this codebase, **or**
   push a filtered copy that excludes those files.
2. In the new repo, delete: `data/`, every `*.patch` file, every root-level
   `.csv`/`.json` export, and `metadata.json`. Keep `assets/import-templates/`
   (that's a generic template file, not real data).
3. Double-check `.gitignore` in the new repo also ignores `data/` and
   `backups/git-archives/` going forward, so no lab's real data or backup
   archives ever land back in the template's history:
   ```
   data/
   backups/
   ```
4. Commit and push. The new repo's `main` branch should now contain only
   application code, scripts, and docs — no inventory data.

Everything below this point is written for a **new lab** setting up their own
copy of that clean template repo.

---

## 1. Create your own copy of the GitHub repository

1. Go to the template repository on GitHub and click **"Use this template" →
   "Create a new repository"** (or, if it isn't marked as a template, click
   **Fork**).
2. Name it something like `my-lab-inventory-tracker` and choose **Private**
   (recommended — inventory data and any offsite backups will live in this
   repo's history).
3. Copy the repo's HTTPS or SSH clone URL for the next step.

> **No GitHub account yet?** Create a free account at
> [github.com/join](https://github.com/join) first. Ask a lab member with
> some Git experience to help with this one-time step if needed.

## 2. Install prerequisites

- **[Node.js](https://nodejs.org/)** 20 or later. Choose the LTS release.
- **[Git](https://git-scm.com/downloads)**, unless you download the repository
  as a ZIP instead of cloning it.

### Windows

1. Download and run the **Node.js LTS Windows Installer** from
   [nodejs.org](https://nodejs.org/en/download/). Keep the default settings and
   leave **Add to PATH** enabled.
2. Download and run **Git for Windows** from
   [git-scm.com/download/win](https://git-scm.com/download/win). The default
   installer settings are suitable for this project.
3. Close and reopen PowerShell, then verify:

   ```powershell
   node --version
   npm --version
   git --version
   ```

   Node must be version 20 or later. If a command is not recognized, open a
   new PowerShell window or restart Windows so the updated `PATH` is loaded.

### macOS

1. Install the Node.js LTS macOS package from
   [nodejs.org](https://nodejs.org/en/download/).
2. Install Git through Apple's Command Line Tools:

   ```bash
   xcode-select --install
   ```

   Accept the macOS dialog. If the tools are already installed, continue.
3. Open a new Terminal window and run:

   ```bash
   node --version
   npm --version
   git --version
   ```

### Ubuntu or Debian-based Linux

Install Git with:

```bash
sudo apt update
sudo apt install git
```

Install Node.js 20 or later from the
[official Node.js downloads](https://nodejs.org/en/download/), then verify
`node`, `npm`, and `git` as shown above.

Verify both installed correctly by opening a terminal (PowerShell on
Windows, Terminal on macOS) and running:

```bash
node --version
git --version
```

### Option without Git

On the repository's GitHub page, choose **Code → Download ZIP**, extract the
folder, and continue with Step 4. This removes the Git requirement, but Node.js
is still required for the local server.

### Option without local installation

A browser-only version is possible if an administrator deploys this app on a
private server. Users then open the server URL and do not install Git or
Node.js. The deployment administrator must configure `LAB_PASSPHRASE`, HTTPS,
persistent storage, and backups. The current repository does not include a
hosted service or a packaged desktop executable.

## 3. Clone the repository

```bash
git clone <the URL you copied in Step 1>
cd my-lab-inventory-tracker
```

## 4. Run the automated setup (Windows)

From the repo folder, right-click and choose **"Open in Terminal"**, or open
PowerShell and `cd` into the folder, then run:

```powershell
powershell -ExecutionPolicy Bypass -File scripts\setup.ps1
```

This single script:

1. Confirms Node.js and Git are installed.
2. Runs `npm install`.
3. Creates a `.env` file from the template.
4. Creates a **Desktop shortcut** ("Lab Inventory Tracker") that starts the
   server and opens the app.
5. Registers a **daily scheduled task** (default 7:00 AM) that creates
   backups and pushes them to a dedicated Git branch.
6. Starts the tracker and checks that it responds at
   `http://localhost:3000`.

When it finishes, double-click the new Desktop shortcut (or open
`http://localhost:3000`) to open the app for the first time.

### Manual setup (macOS/Linux, or if you prefer to do it by hand)

```bash
npm install
cp .env.example .env      # optional: edit PORT or LAB_PASSPHRASE
npm run dev
```

Open `http://localhost:3000` in your browser. To create a clickable launch
icon on macOS, create a small `.command` file next to the repo:

```bash
#!/bin/bash
cd "$(dirname "$0")/my-lab-inventory-tracker" && npm run dev
```

Save it as `Start Lab Tracker.command`, run `chmod +x "Start Lab Tracker.command"`,
and drag it to the Dock or Desktop. For automated daily backups, add a `cron`
entry (`crontab -e`) that runs `npm run backup:git` in the repo directory
every morning.

## 5. First launch: the setup wizard

The very first time you open the app, since there is no data yet, a
**"Welcome — Set Up Your Lab"** wizard appears. Enter the name of every lab
member who will use the tracker (you can add more later from the toolbar's
"Manage users" button). Once submitted, the wizard won't appear again — the
tracker is ready for real inventory.

Use **Bulk Import** (toolbar) to load your existing spreadsheet inventory, or
add storage units, shelves, boxes, and samples manually. See the template at
[assets/import-templates/freezer-box-sample-import-template.csv](assets/import-templates/freezer-box-sample-import-template.csv).

## 6. Confirm it's running correctly

- The Desktop shortcut opens `http://localhost:3000` and shows the app.
- The system tray (bottom-right of the taskbar) has a flask/app icon; right-click
  it to see **"Status: Running"** and to Open/Restart/Stop the server.
- The footer of the app shows "Database Synced" in green.
- Run `npm run backup:now` from the repo folder any time to confirm backups
  can be created without errors.

## 7. Automated backups — what's already turned on

`scripts/setup.ps1` registered two Windows Scheduled Tasks for you:

| Task | Runs | Purpose |
|---|---|---|
| `InventoryDailyImmutableBackupGit` | Daily at 7:00 AM | Creates a JSON+Excel backup, commits a compressed archive, and pushes it to the `backup-archives` branch of your GitHub repo. Also makes sure the server is running. |
| `InventoryDailyEnsureRunning` | Daily at 7:05 AM | Fallback check — starts the server if it isn't already running. |

Additionally, the app itself creates an **immutable daily backup** (read-only,
tamper-evident) on the local machine every time it starts and every hour
after that — independent of the scheduled task.

To change the backup time, re-run:

```powershell
powershell -ExecutionPolicy Bypass -File scripts\register-daily-backup-task.ps1 -Time 06:30
```

### Push permission for offsite (GitHub) backups

The scheduled backup task pushes to your repo's `backup-archives` branch, so
the machine running the tracker needs Git push access to the repo:

- Easiest: install [GitHub CLI](https://cli.github.com/) and run `gh auth login`
  once on the tracker machine, or configure a Git credential manager so `git
  push` doesn't prompt for a password.
- In the GitHub repo settings, consider protecting `backup-archives` (disallow
  force pushes and deletions) so backups can't be accidentally overwritten.

If you'd rather not push data to GitHub at all, run `scripts\setup.ps1
-SkipScheduledTask` and rely on the local immutable backups only (or write
them to a shared network/OneDrive folder via `INVENTORY_DATA_DIR`).

## 8. Moving the repo later

If you move the folder or set it up on a new machine, re-run the scheduled
task registration so Task Scheduler points at the new path:

```powershell
powershell -ExecutionPolicy Bypass -File scripts\register-daily-backup-task.ps1 -RepoPath (Get-Location).Path
```

---

## Packaging suggestions for distributing this to other labs

A few ways to make onboarding new labs even smoother, roughly in order of
effort vs. payoff:

1. **Mark the repo as a GitHub Template repository** (Settings → Template
   repository). This is what Step 1 above assumes — it gives new labs a clean
   "Use this template" button instead of forking (forks stay linked to the
   original repo, which you likely don't want for private lab data).
2. **One-line bootstrap installer.** Host `scripts/setup.ps1` at a stable raw
   GitHub URL and let people run:
   ```powershell
   irm https://raw.githubusercontent.com/<org>/<template-repo>/main/scripts/setup.ps1 | iex
   ```
   This still requires `git clone` first (or extend the script to clone too),
   but removes a manual download step.
3. **A short screen-recording / GIF** embedded at the top of this file showing
   the whole flow (clone → setup.ps1 → wizard) — most labs will skim, not read.
4. **Avoid Electron/packaged-executable repackaging.** This app is intentionally
   a zero-install local web server (`npm run dev`), which keeps the codebase
   identical across labs and easy to patch centrally. Wrapping it in Electron
   would add build/signing complexity without solving a real problem here,
   since the tray launcher already gives a no-terminal experience on Windows.
5. **Keep the sister repo's `main` branch data-free.** Don't merge real
   inventory data or `.env` secrets into it; `.gitignore` already excludes
   `data/` and `.env`. Only ship code, templates, and this guide.
