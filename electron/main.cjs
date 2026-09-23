const { app, BrowserWindow, dialog, utilityProcess } = require("electron");
const net = require("node:net");
const path = require("node:path");

let serverProcess = null;
let mainWindow = null;

function findAvailablePort() {
  return new Promise((resolve, reject) => {
    const tester = net.createServer();
    tester.once("error", reject);
    tester.listen(0, "127.0.0.1", () => {
      const address = tester.address();
      const port = typeof address === "object" && address ? address.port : null;
      tester.close(() => port ? resolve(port) : reject(new Error("Could not find an available port")));
    });
  });
}

async function waitForServer(url, attempts = 40) {
  for (let attempt = 0; attempt < attempts; attempt += 1) {
    try {
      const response = await fetch(url);
      if (response.ok) return;
    } catch {
      // The server is still starting.
    }
    await new Promise(resolve => setTimeout(resolve, 250));
  }
  throw new Error("The local inventory server did not start in time.");
}

async function startServer() {
  const port = await findAvailablePort();
  const dataDir = path.join(app.getPath("userData"), "data");
  const serverPath = path.join(app.getAppPath(), "dist", "server.cjs");

  serverProcess = utilityProcess.fork(serverPath, [], {
    cwd: app.getAppPath(),
    env: {
      ...process.env,
      NODE_ENV: "production",
      PORT: String(port),
      INVENTORY_DATA_DIR: dataDir,
      INVENTORY_IMMUTABLE_BACKUP_DIR: path.join(dataDir, "immutable-backups")
    }
  });

  serverProcess.on("exit", (code, signal) => {
    if (app.isReady() && !app.isQuitting && code !== 0) {
      dialog.showErrorBox("Lab Inventory Tracker stopped", `The local server stopped unexpectedly (${code ?? signal ?? "unknown error"}).`);
    }
  });

  const url = `http://127.0.0.1:${port}`;
  await waitForServer(url);
  return url;
}

async function createWindow() {
  const url = await startServer();
  mainWindow = new BrowserWindow({
    width: 1440,
    height: 960,
    minWidth: 960,
    minHeight: 640,
    webPreferences: {
      contextIsolation: true,
      nodeIntegration: false
    }
  });
  await mainWindow.loadURL(url);
  mainWindow.on("closed", () => {
    mainWindow = null;
  });
}

app.whenReady().then(() => createWindow()).catch(error => {
  dialog.showErrorBox("Lab Inventory Tracker could not start", error.message);
  app.quit();
});

app.on("before-quit", () => {
  app.isQuitting = true;
  if (serverProcess) serverProcess.kill();
});

app.on("window-all-closed", () => {
  app.quit();
});