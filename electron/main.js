const { app, BrowserWindow, Menu } = require('electron');
const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');

let mainWindow;
let serverProcess;
const PORT = 3000;

// Check if .env exists, if not create from .env.local
function ensureEnvFile() {
  const envPath = path.join(__dirname, '..', '.env');
  const envLocalPath = path.join(__dirname, '..', '.env.local');
  
  if (!fs.existsSync(envPath) && fs.existsSync(envLocalPath)) {
    fs.copyFileSync(envLocalPath, envPath);
  }
}

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1400,
    height: 900,
    minWidth: 1200,
    minHeight: 700,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
    },
    icon: path.join(__dirname, '../public/favicon.ico'),
    title: 'GE Customer Management',
    backgroundColor: '#ffffff',
    show: false, // Don't show until ready
  });

  // Remove default menu
  Menu.setApplicationMenu(null);

  // Show window when ready
  mainWindow.once('ready-to-show', () => {
    mainWindow.show();
  });

  // Start Next.js server
  startServer();

  mainWindow.on('closed', () => {
    mainWindow = null;
    stopServer();
  });
}

function startServer() {
  console.log('Starting Next.js server...');
  
  // Ensure .env file exists
  ensureEnvFile();
  
  const serverPath = path.join(__dirname, '..', '.next', 'standalone', 'server.js');
  
  if (!fs.existsSync(serverPath)) {
    console.error('Server file not found:', serverPath);
    console.error('Please run: npm run build');
    app.quit();
    return;
  }

  serverProcess = spawn('node', [serverPath], {
    env: { 
      ...process.env, 
      PORT: PORT.toString(),
      NODE_ENV: 'production'
    },
    cwd: path.join(__dirname, '..', '.next', 'standalone')
  });

  serverProcess.stdout.on('data', (data) => {
    console.log(`Server: ${data}`);
  });

  serverProcess.stderr.on('data', (data) => {
    console.error(`Server Error: ${data}`);
  });

  serverProcess.on('close', (code) => {
    console.log(`Server process exited with code ${code}`);
  });

  // Wait for server to start, then load URL
  setTimeout(() => {
    if (mainWindow) {
      mainWindow.loadURL(`http://localhost:${PORT}`);
    }
  }, 3000);
}

function stopServer() {
  if (serverProcess) {
    console.log('Stopping server...');
    serverProcess.kill();
    serverProcess = null;
  }
}

app.on('ready', createWindow);

app.on('window-all-closed', () => {
  stopServer();
  app.quit();
});

app.on('activate', () => {
  if (mainWindow === null) {
    createWindow();
  }
});

// Handle app quit
app.on('before-quit', () => {
  stopServer();
});

// Prevent multiple instances
const gotTheLock = app.requestSingleInstanceLock();

if (!gotTheLock) {
  app.quit();
} else {
  app.on('second-instance', () => {
    if (mainWindow) {
      if (mainWindow.isMinimized()) mainWindow.restore();
      mainWindow.focus();
    }
  });
}

