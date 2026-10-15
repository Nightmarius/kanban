const { contextBridge, ipcRenderer } = require('electron')

contextBridge.exposeInMainWorld('electronAPI', {
  openFileDialog: () => ipcRenderer.invoke('open-file-dialog'),
  readFile: (path) => ipcRenderer.invoke('read-file', path),
  onFileOpened: (callback) => ipcRenderer.on('file-opened', (_event, data) => callback(data))
})
