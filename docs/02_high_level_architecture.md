# High-Level Architecture - Process and IPC Design

## 1. Process Model Architecture

Project Atlas utilizes Electron's multi-process model to achieve security, stability, and UI responsiveness. The system is split into three primary process types:

1. **Main Process (Node.js Environment)**: Serves as the system orchestrator. It manages native window creation, handles direct file and database I/O, configures network request interception (Ad blocker), and manages cryptographic operations.
2. **Renderer Process (Web Environment)**: Displays the browser shell UI (address bar, tab strips, sidebar, settings panels). Built using React, Zustand, and TypeScript, it is sandboxed and runs without direct access to Node.js APIs.
3. **WebView Processes (Chromium WebContents)**: Individual isolated sandboxed instances that render untrusted third-party web pages. They are structurally isolated from the Renderer UI process to prevent malicious web scripts from accessing the application control interfaces.

```mermaid
graph TD
    subgraph OS Boundary
        Main[Main Process <br> Node.js Core]
    end

    subgraph Renderer Sandbox
        UI[Renderer Process <br> React UI Shell]
    end

    subgraph Web Sandboxes
        WV1[WebView 1 - WebContents]
        WV2[WebView 2 - WebContents]
    end

    Main -->|Creates & Configures| UI
    UI -->|Embeds & Controls| WV1
    UI -->|Embeds & Controls| WV2

    UI <-->|Secure IPC via preload contextBridge| Main
    WV1 <-->|Preload script channel isolation| Main
    WV2 <-->|Preload script channel isolation| Main
```

---

## 2. Main Process Responsibilities

The Main process acts as the supervisor with full operating system access. Its responsibilities are scoped strictly to security-critical and OS-level operations:

- **Lifecycle Management**: Creation, resizing, positioning, and destruction of application windows.
- **Storage and Persistence**: Interacting with SQLite databases (saving history, bookmarks, notes, and profiles).
- **Cryptographic Engine**: Deriving encryption keys via Argon2id and executing AES-256 decryption/encryption for the password manager and database files.
- **Network & Session Isolation**: Constructing Electron sessions for different profiles and intercepting web requests for the ad-blocking engine.
- **System Menus & Shortcuts**: Binding keyboard shortcuts globally and registering native menus.

---

## 3. Renderer Process & Preload Integration

The Renderer process manages the visual interface. It executes in a highly restricted sandbox with:

- `nodeIntegration` set to `false`.
- `contextIsolation` set to `true`.
- `sandbox` enabled.

To communicate with the Main process safely, the Renderer utilizes a **Preload Script** (`preload.js`). The preload script runs in an intermediate context, utilizing `contextBridge.exposeInMainWorld` to expose a curated, type-safe API to the React application.

### Secure Context Bridge Definition

```typescript
// src/preload/index.ts
import { contextBridge, ipcRenderer } from 'electron'

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
  
  // Live autocomplete search suggestions channel
  getSearchSuggestions: (query: string) => ipcRenderer.invoke('get-search-suggestions', query)
}

if (process.contextIsolated) {
  contextBridge.exposeInMainWorld('api', api)
}
```

---

## 4. IPC Flow: Opening a New Tab

This sequence diagram illustrates the secure data flow when a user clicks the "New Tab" button in the React UI, triggering IPC messaging and WebView lifecycle orchestration.

```mermaid
sequenceDiagram
    autonumber
    actor User
    participant React as React UI Shell (Renderer)
    participant Preload as Preload API (Context Bridge)
    participant Main as Electron Core (Main Process)
    participant WebView as WebView (Tab Engine)

    User->>React: Clicks "New Tab" button or types URL
    React->>Preload: atlasAPI.send('toMain:open-tab', { url: 'https://example.com' })
    Preload->>Main: ipcRenderer.send('toMain:open-tab', data)

    Note over Main: Validate URL & enforce Profile isolation policies
    Main->>Main: Generate tab identifier & load session preferences

    Main-->>React: Send confirmation & session details (via IPC)
    React->>React: Update Zustand state & append <webview> element to DOM

    Note over React: WebView starts mounting in Renderer window
    React->>WebView: Mount <webview src="https://example.com" partition="persist:profile1">

    WebView->>Main: Session request interception matches EasyList rules
    Main-->>WebView: Allow/Block scripts
    WebView->>User: Render web page content
```
