// Electron main process (ES module: package.json declares "type": "module").
import { app, BrowserWindow, shell } from 'electron';
import express from 'express';
import http from 'http';
import path from 'path';
import { fileURLToPath } from 'url';
import { createAiRouter } from './api/aiRouter.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PORT = 32101;
const APP_ORIGIN = `http://127.0.0.1:${PORT}`;

let serverInstance;
let mainWindow;

// Embedded Express server so the packaged app serves the UI and AI APIs offline.
// No server-side key: the desktop user always supplies their own keys via the UI.
function startEmbeddedServer() {
  const expressApp = express();
  expressApp.disable('x-powered-by');
  expressApp.use('/api', createAiRouter());

  const distPath = path.join(__dirname, 'dist');
  expressApp.use(express.static(distPath));
  expressApp.get('*', (_req, res) => {
    res.sendFile(path.join(distPath, 'index.html'));
  });

  return new Promise((resolve, reject) => {
    const server = http.createServer(expressApp);
    server.once('error', reject);
    serverInstance = server.listen(PORT, '127.0.0.1', () => {
      console.log(`KitYar Desktop Server is running on ${APP_ORIGIN}`);
      resolve();
    });
  });
}

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1400,
    height: 900,
    title: 'کیت یار — اتوماسیون طراحی هوشمند',
    icon: path.join(__dirname, 'resources', 'icon.png'),
    autoHideMenuBar: true,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      sandbox: true,
    },
  });

  // Keep the app window on our origin; open external links in the system browser.
  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    if (url.startsWith('https://')) shell.openExternal(url);
    return { action: 'deny' };
  });
  mainWindow.webContents.on('will-navigate', (event, url) => {
    if (!url.startsWith(APP_ORIGIN)) event.preventDefault();
  });

  mainWindow.loadURL(APP_ORIGIN);

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

app.whenReady().then(async () => {
  try {
    await startEmbeddedServer();
  } catch (error) {
    console.error('Failed to start embedded server:', error);
    app.quit();
    return;
  }
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', () => {
  if (serverInstance) serverInstance.close();
  if (process.platform !== 'darwin') app.quit();
});
