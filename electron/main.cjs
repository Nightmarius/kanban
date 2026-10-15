const { app, BrowserWindow, ipcMain, dialog } = require('electron')
const path = require('path')
const url = require('url')

let mainWindow

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    title: 'Kanban Editor',
    webPreferences: {
      preload: path.join(__dirname, 'preload.cjs'),
      contextIsolation: true,
      nodeIntegration: false
    }
  })

  if (app.isPackaged) {
    const indexPath = url.pathToFileURL(
      path.join(process.resourcesPath, 'app', 'dist', 'index.html')
    ).href
    mainWindow.loadURL(indexPath)
  } else {
    mainWindow.loadURL('http://localhost:8787')
    mainWindow.webContents.openDevTools()
  }

  mainWindow.on('closed', () => {
    mainWindow = null
  })
}

app.whenReady().then(createWindow)

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit()
})

app.on('activate', () => {
  if (mainWindow === null) createWindow()
})

// IPC Handler for Open File Dialog
ipcMain.handle('open-file-dialog', async () => {
  const result = await dialog.showOpenDialog({
    properties: ['openFile'],
    filters: [{ name: 'Markdown Files', extensions: ['md'] }],
    title: 'Open Markdown Board'
  })
  return result.filePaths?.[0] || null
})

// IPC Handler for Reading File
ipcMain.handle('read-file', async (_event, filePath) => {
  const fs = require('fs')
  try {
    return fs.readFileSync(filePath, 'utf-8')
  } catch (error) {
    throw new Error(`Failed to read file: ${filePath}`)
  }
})

// Handle OS-level file open events for production builds
app.on('open-file', (_event, filePath) => {
  if (mainWindow && !mainWindow.isDestroyed()) {
    mainWindow.webContents.send('file-opened', { path: filePath })
  }
})
