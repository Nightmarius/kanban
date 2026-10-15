interface ElectronAPI {
  openFileDialog: () => Promise<string | null>
  readFile: (path: string) => Promise<string>
}

declare global {
  interface Window {
    electronAPI: ElectronAPI
  }
}

export {}
