import { ElectronAPI } from '@electron-toolkit/preload'

export interface IApi {
  getDb: () => Promise<any>
  saveDb: (db: any) => Promise<void>
  verifyProfileLock: (profileId: string, code: string) => Promise<boolean>
  encryptPassword: (password: string, key: string) => Promise<string>
  decryptPassword: (encrypted: string, key: string) => Promise<string>
  openDevTools: (profileId: string) => void
  onAdBlocked: (callback: (event: any, data: { count: number; url: string }) => void) => () => void
  onDownloadProgress: (
    callback: (
      event: any,
      data: {
        id: string
        filename?: string
        progress: number
        speed: string
        received: number
        total: number
      }
    ) => void
  ) => () => void
  onDownloadFinished: (
    callback: (
      event: any,
      data: { id: string; status: 'completed' | 'failed' | 'cancelled'; path?: string }
    ) => void
  ) => () => void
  cancelDownload: (id: string) => void
  pauseDownload: (id: string) => void
  resumeDownload: (id: string) => void
  triggerDownload: (url: string, profileId: string) => void
  onShortcut: (channel: string, callback: (event: any, ...args: any[]) => void) => () => void
}

declare global {
  interface Window {
    electron: ElectronAPI
    api: IApi
  }
}
