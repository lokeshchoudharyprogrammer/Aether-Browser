import { contextBridge, ipcRenderer } from 'electron'
import { electronAPI } from '@electron-toolkit/preload'

// Custom APIs for renderer
const api = {
  getDb: () => ipcRenderer.invoke('db-get'),
  saveDb: (db: any) => ipcRenderer.invoke('db-save', db),
  verifyProfileLock: (profileId: string, code: string) =>
    ipcRenderer.invoke('auth-profile', profileId, code),
  encryptPassword: (password: string, key: string) =>
    ipcRenderer.invoke('encrypt-pwd', password, key),
  decryptPassword: (encrypted: string, key: string) =>
    ipcRenderer.invoke('decrypt-pwd', encrypted, key),
  openDevTools: (profileId: string) => ipcRenderer.send('open-devtools', profileId),
  onAdBlocked: (callback: (event: any, data: { count: number; url: string }) => void) => {
    ipcRenderer.on('ad-blocked', callback)
    return () => ipcRenderer.removeListener('ad-blocked', callback)
  },
  onDownloadProgress: (
    callback: (
      event: any,
      data: { id: string; progress: number; speed: string; received: number; total: number }
    ) => void
  ) => {
    ipcRenderer.on('download-progress', callback)
    return () => ipcRenderer.removeListener('download-progress', callback)
  },
  onDownloadFinished: (
    callback: (
      event: any,
      data: { id: string; status: 'completed' | 'failed' | 'cancelled'; path?: string }
    ) => void
  ) => {
    ipcRenderer.on('download-finished', callback)
    return () => ipcRenderer.removeListener('download-finished', callback)
  },
  cancelDownload: (id: string) => ipcRenderer.send('cancel-download', id),
  pauseDownload: (id: string) => ipcRenderer.send('pause-download', id),
  resumeDownload: (id: string) => ipcRenderer.send('resume-download', id),
  triggerDownload: (url: string, profileId: string) =>
    ipcRenderer.send('trigger-download', url, profileId),
  onShortcut: (channel: string, callback: (event: any, ...args: any[]) => void) => {
    ipcRenderer.on(channel, callback)
    return () => ipcRenderer.removeListener(channel, callback)
  },
  getSearchSuggestions: (query: string) => ipcRenderer.invoke('get-search-suggestions', query)
}

if (process.contextIsolated) {
  try {
    contextBridge.exposeInMainWorld('electron', electronAPI)
    contextBridge.exposeInMainWorld('api', api)
  } catch (error) {
    console.error(error)
  }
} else {
  // @ts-ignore (define in dts)
  window.electron = electronAPI
  // @ts-ignore (define in dts)
  window.api = api
}
