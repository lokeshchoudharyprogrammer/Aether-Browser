import { app, shell, BrowserWindow, ipcMain, session, Menu } from 'electron'
import { join } from 'path'
import { readFileSync, existsSync } from 'fs'
import { electronApp, is } from '@electron-toolkit/utils'
import icon from '../../resources/icon.png?asset'
import { getDb, saveDb, hashText, encryptPassword, decryptPassword } from './db'

let mainWindow: BrowserWindow | null = null

// ──────────────────────────────────────────────
// REAL AD BLOCKER — 55k+ domains from EasyList
// ──────────────────────────────────────────────

interface Blocklist {
  domains: string[]
  patterns: string[]
}

// Lookup structures built once at startup
const blockedDomains = new Set<string>()
const blockedPatterns: string[] = []

function loadBlocklist(): void {
  const blocklistPath = join(__dirname, '../../resources/blocklist.json')

  // Fallback if bundled file is missing (dev mode path)
  const devPath = join(app.getAppPath(), 'resources/blocklist.json')

  const filePath = existsSync(blocklistPath) ? blocklistPath : existsSync(devPath) ? devPath : null

  if (filePath) {
    try {
      const raw = readFileSync(filePath, 'utf-8')
      const data: Blocklist = JSON.parse(raw)

      // Build domain Set for O(1) lookups
      data.domains.forEach((d) => blockedDomains.add(d))
      blockedPatterns.push(...data.patterns)

      console.log(
        `[AdBlocker] Loaded ${blockedDomains.size.toLocaleString()} domains + ${blockedPatterns.length} patterns`
      )
    } catch (e) {
      console.error('[AdBlocker] Failed to load blocklist:', e)
      loadFallbackPatterns()
    }
  } else {
    console.warn('[AdBlocker] blocklist.json not found, using fallback patterns')
    loadFallbackPatterns()
  }
}

function loadFallbackPatterns(): void {
  // Curated fallback (always loaded regardless)
  const fallback = [
    'googleads', 'doubleclick.net', 'pagead2', 'googlesyndication',
    'adservice.google', 'youtube.com/api/stats/ads', 'youtube.com/get_midroll_info',
    'analytics.google.com', 'google-analytics.com', 'mixpanel.com', 'segment.io',
    'adnxs', 'adsystem', 'taboola', 'outbrain', 'criteo', 'moatads',
    'amazon-adsystem', 'admob', 'demdex.net', 'omtrdc.net', 'scorecardresearch',
    'chartbeat', 'hotjar', 'quantserve', 'rubiconproject', 'pubmatic'
  ]
  blockedPatterns.push(...fallback)
}

/**
 * Returns true if the URL should be blocked.
 * Uses hostname lookup (O(1) Set) first, then keyword patterns as fallback.
 */
function isBlockedUrl(url: string): boolean {
  try {
    const parsed = new URL(url)
    const hostname = parsed.hostname.toLowerCase()

    // 1. Exact domain match (fast path)
    if (blockedDomains.has(hostname)) return true

    // 2. Parent-domain match (e.g. sub.ads.com → ads.com)
    const parts = hostname.split('.')
    for (let i = 1; i < parts.length - 1; i++) {
      if (blockedDomains.has(parts.slice(i).join('.'))) return true
    }

    // 3. Keyword patterns in full URL (slow fallback, small list)
    const lower = url.toLowerCase()
    return blockedPatterns.some((p) => lower.includes(p))
  } catch {
    return false
  }
}

// Map to hold running downloads to support cancel/pause actions
const activeDownloads = new Map<string, any>()

function configureSessionForProfile(profileId: string, win: BrowserWindow) {
  const sess = session.fromPartition(`persist:${profileId}`)

  // Raise listener limit to prevent MaxListenersExceededWarning
  sess.setMaxListeners(50)

  // Clean WebRequest listeners first to avoid duplicates
  sess.webRequest.onBeforeRequest(null)

  // ── Real Ad + Tracker Blocking ──────────────────────────────────────────
  sess.webRequest.onBeforeRequest({ urls: ['http://*/*', 'https://*/*'] }, (details, callback) => {
    const url = details.url

    // Always allow main frame navigation and essential localhost/extensions
    if (details.resourceType === 'mainFrame' || url.startsWith('chrome-extension://')) {
      callback({ cancel: false })
      return
    }

    if (isBlockedUrl(url)) {
      const db = getDb()
      const profileRules = db.adBlockRules[profileId] || []

      // Check per-site allow override
      let initiatorHost = ''
      try {
        const detailsAny = details as any
        if (detailsAny.initiator) {
          initiatorHost = new URL(detailsAny.initiator).hostname
        } else if (detailsAny.referrer) {
          initiatorHost = new URL(detailsAny.referrer).hostname
        }
      } catch {
        // Safe fallback
      }

      const isAllowed = profileRules.some(
        (rule: any) => initiatorHost.includes(rule.domain) && rule.adBlockAction === 'allow'
      )

      if (!isAllowed) {
        db.stats.adsBlockedTotal += 1
        if (!db.stats.adsBlockedPerProfile[profileId]) {
          db.stats.adsBlockedPerProfile[profileId] = 0
        }
        db.stats.adsBlockedPerProfile[profileId] += 1
        saveDb(db)

        if (win && !win.isDestroyed()) {
          win.webContents.send('ad-blocked', {
            count: db.stats.adsBlockedPerProfile[profileId],
            url: url
          })
        }

        callback({ cancel: true })
        return
      }
    }

    callback({ cancel: false })
  })



  // Download listener
  sess.on('will-download', (_, item) => {
    const downloadId = Math.random().toString(36).substring(7)
    const filename = item.getFilename()
    const totalBytes = item.getTotalBytes()

    activeDownloads.set(downloadId, item)

    // Notify renderer that a download started
    if (win && !win.isDestroyed()) {
      win.webContents.send('download-progress', {
        id: downloadId,
        filename,
        progress: 0,
        speed: '0 KB/s',
        received: 0,
        total: totalBytes
      })
    }

    item.on('updated', (_, state) => {
      if (state === 'interrupted') {
        if (win && !win.isDestroyed()) {
          win.webContents.send('download-finished', {
            id: downloadId,
            status: 'failed'
          })
        }
        activeDownloads.delete(downloadId)
      } else if (state === 'progressing') {
        if (!item.isPaused()) {
          const received = item.getReceivedBytes()
          const progress = totalBytes > 0 ? (received / totalBytes) * 100 : 0

          if (win && !win.isDestroyed()) {
            win.webContents.send('download-progress', {
              id: downloadId,
              filename,
              progress: Math.round(progress),
              speed: 'Downloading...',
              received,
              total: totalBytes
            })
          }
        }
      }
    })

    item.once('done', (_, state) => {
      if (win && !win.isDestroyed()) {
        win.webContents.send('download-finished', {
          id: downloadId,
          status: state === 'completed' ? 'completed' : 'failed',
          path: state === 'completed' ? item.getSavePath() : undefined
        })
      }
      activeDownloads.delete(downloadId)
    })
  })
}

function createAppMenu(): void {
  const template: any[] = [
    {
      label: 'Aether Browser',
      submenu: [
        { role: 'about' },
        { type: 'separator' },
        { role: 'services' },
        { type: 'separator' },
        { role: 'hide' },
        { role: 'hideOthers' },
        { role: 'unhide' },
        { type: 'separator' },
        { role: 'quit' }
      ]
    },
    {
      label: 'File',
      submenu: [
        {
          label: 'New Tab',
          accelerator: 'CmdOrCtrl+T',
          click: () => {
            mainWindow?.webContents.send('shortcut-new-tab')
          }
        },
        {
          label: 'Close Current Tab',
          accelerator: 'CmdOrCtrl+W',
          click: () => {
            mainWindow?.webContents.send('shortcut-close-tab')
          }
        },
        {
          label: 'New Private Window',
          accelerator: 'CmdOrCtrl+P',
          click: () => {
            mainWindow?.webContents.send('shortcut-new-private')
          }
        }
      ]
    },
    {
      label: 'Edit',
      submenu: [
        { role: 'undo' },
        { role: 'redo' },
        { type: 'separator' },
        { role: 'cut' },
        { role: 'copy' },
        { role: 'paste' },
        { role: 'selectAll' }
      ]
    },
    {
      label: 'View',
      submenu: [
        {
          label: 'Reload Active Tab',
          accelerator: 'CmdOrCtrl+R',
          click: () => {
            mainWindow?.webContents.send('shortcut-reload-tab')
          }
        },
        {
          label: 'Force Reload Active Tab',
          accelerator: 'CmdOrCtrl+Shift+R',
          click: () => {
            mainWindow?.webContents.send('shortcut-forcereload-tab')
          }
        },
        { role: 'toggleDevTools' },
        { type: 'separator' },
        {
          label: 'Toggle Sidebar',
          accelerator: 'CmdOrCtrl+B',
          click: () => {
            mainWindow?.webContents.send('shortcut-toggle-sidebar')
          }
        },
        {
          label: 'Focus Address Bar',
          accelerator: 'CmdOrCtrl+L',
          click: () => {
            mainWindow?.webContents.send('shortcut-focus-address')
          }
        },
        {
          label: 'Toggle Notes Panel',
          accelerator: 'CmdOrCtrl+N',
          click: () => {
            mainWindow?.webContents.send('shortcut-toggle-notes')
          }
        },
        { type: 'separator' },
        {
          label: 'Zoom In',
          accelerator: 'CmdOrCtrl+I',
          click: () => {
            mainWindow?.webContents.send('shortcut-zoom-in')
          }
        },
        {
          label: 'Zoom Out',
          accelerator: 'CmdOrCtrl+O',
          click: () => {
            mainWindow?.webContents.send('shortcut-zoom-out')
          }
        },
        {
          label: 'Reset Zoom',
          accelerator: 'CmdOrCtrl+E',
          click: () => {
            mainWindow?.webContents.send('shortcut-zoom-reset')
          }
        }
      ]
    },
    {
      label: 'Profile',
      submenu: [
        {
          label: 'Lock Profile',
          accelerator: 'CmdOrCtrl+K',
          click: () => {
            mainWindow?.webContents.send('shortcut-lock-profile')
          }
        },
        { type: 'separator' },
        {
          label: 'Cycle Workspaces',
          accelerator: 'CmdOrCtrl+G',
          click: () => {
            mainWindow?.webContents.send('shortcut-cycle-workspace')
          }
        }
      ]
    },
    {
      role: 'window',
      submenu: [
        { role: 'minimize' },
        { role: 'zoom' }
      ]
    }
  ]

  const menu = Menu.buildFromTemplate(template)
  Menu.setApplicationMenu(menu)
}

function createWindow(): void {
  // Create the browser window
  mainWindow = new BrowserWindow({
    width: 1280,
    height: 800,
    show: false,
    autoHideMenuBar: true,
    title: 'KitKat Browser',
    ...(process.platform === 'linux' ? { icon } : {}),
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      sandbox: false,
      webviewTag: true, // Critical for rendering custom tabs
      webSecurity: true
    }
  })

  // Register developer shortcuts menu
  createAppMenu()

  mainWindow.on('ready-to-show', () => {
    mainWindow?.show()

    // Configure default sessions on start
    const db = getDb()
    db.profiles.forEach((p) => {
      if (mainWindow) configureSessionForProfile(p.id, mainWindow)
    })
  })

  mainWindow.webContents.setWindowOpenHandler((details) => {
    // Open external link in external default browser
    shell.openExternal(details.url)
    return { action: 'deny' }
  })

  // HMR for renderer
  if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
    mainWindow.loadURL(process.env['ELECTRON_RENDERER_URL'])
  } else {
    mainWindow.loadFile(join(__dirname, '../renderer/index.html'))
  }
}

app.whenReady().then(() => {
  electronApp.setAppUserModelId('com.aether.browser')

  // Load real EasyList blocklist before any sessions start
  loadBlocklist()

  app.on('web-contents-created', (_, webContents) => {
    webContents.on('before-input-event', (event, input) => {
      if (input.type !== 'keyDown') return

      const isMod = input.meta || input.control

      // 1. Force reload: CmdOrCtrl+Shift+R
      if (isMod && input.shift && input.key.toLowerCase() === 'r') {
        event.preventDefault()
        if (webContents.getType() === 'webview') {
          webContents.reloadIgnoringCache()
        } else {
          mainWindow?.webContents.send('shortcut-forcereload-tab')
        }
        return
      }

      // 2. Standard reload: CmdOrCtrl+R or F5
      if ((isMod && input.key.toLowerCase() === 'r') || input.key === 'F5') {
        event.preventDefault()
        if (webContents.getType() === 'webview') {
          webContents.reload()
        } else {
          mainWindow?.webContents.send('shortcut-reload-tab')
        }
        return
      }
    })
  })

  // IPC Database operations
  ipcMain.handle('db-get', () => {
    return getDb()
  })

  ipcMain.handle('db-save', (_, dbData) => {
    saveDb(dbData)
    // Synchronize sessions if new profiles were added
    if (mainWindow) {
      dbData.profiles.forEach((p: any) => {
        configureSessionForProfile(p.id, mainWindow!)
      })
    }
  })

  // Authentication IPC
  ipcMain.handle('auth-profile', (_, profileId, code) => {
    const db = getDb()
    const profile = db.profiles.find((p) => p.id === profileId)
    if (!profile) return false
    if (profile.lockType === 'none') return true
    return profile.lockHash === hashText(code)
  })

  // Password encryption IPCs
  ipcMain.handle('encrypt-pwd', (_, pwd, key) => {
    return encryptPassword(pwd, key)
  })

  // Password decryption IPCs
  ipcMain.handle('decrypt-pwd', (_, encrypted, key) => {
    return decryptPassword(encrypted, key)
  })

  // Search suggestions IPC
  ipcMain.handle('get-search-suggestions', async (_, query: string, shield?: boolean) => {
    try {
      const url = shield
        ? `https://ac.duckduckgo.com/ac/?q=${encodeURIComponent(query)}&type=list`
        : `https://suggestqueries.google.com/complete/search?client=chrome&q=${encodeURIComponent(query)}`

      const response = await fetch(url, {
        headers: {
          // Send no identifying cookies or correlation headers
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
        }
      })
      if (!response.ok) return []
      const data = (await response.json()) as any
      return (data && data[1]) || []
    } catch (error) {
      console.error('Error fetching search suggestions:', error)
      return []
    }
  })

  // DevTools IPC
  ipcMain.on('open-devtools', (event) => {
    event.sender.openDevTools()
  })

  // Download Management IPCs
  ipcMain.on('cancel-download', (_, id) => {
    const download = activeDownloads.get(id)
    if (download) download.cancel()
  })

  ipcMain.on('pause-download', (_, id) => {
    const download = activeDownloads.get(id)
    if (download) download.pause()
  })

  ipcMain.on('resume-download', (_, id) => {
    const download = activeDownloads.get(id)
    if (download) download.resume()
  })

  ipcMain.on('trigger-download', (_, url, profileId) => {
    if (mainWindow) {
      const sess = session.fromPartition(`persist:${profileId}`)
      sess.downloadURL(url)
    }
  })

  createWindow()

  app.on('activate', function () {
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})
