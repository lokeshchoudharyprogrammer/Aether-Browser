import { create } from 'zustand'
import CryptoJS from 'crypto-js'

export interface Tab {
  id: string
  workspaceId: string
  title: string
  url: string
  isPinned: boolean
  active: boolean
}

export interface Bookmark {
  id: string
  profileId: string
  title: string
  url: string
}

export interface HistoryItem {
  id: string
  profileId: string
  title: string
  url: string
  timestamp: number
}

export interface Note {
  id: string
  profileId: string
  title: string
  content: string
  timestamp: number
}

export interface SavedCredential {
  id: string
  profileId: string
  url: string
  username: string
  passwordEncrypted: string
  passwordDecrypted?: string // Temporary decrypted in memory
}

export interface AdBlockRule {
  domain: string
  adBlockAction: 'block' | 'allow'
}

export interface Profile {
  id: string
  name: string
  avatar: string
  lockType: 'none' | 'password' | 'pin'
  lockHash?: string
  themeId: string
  activeWorkspaceId: string
}

export interface Workspace {
  id: string
  profileId: string
  name: string
}

export interface DownloadItem {
  id: string
  filename: string
  progress: number
  speed: string
  received: number
  total: number
  status: 'downloading' | 'completed' | 'failed' | 'paused'
}

interface BrowserStore {
  db: any | null
  activeProfileId: string | null
  activeWorkspaceId: string | null
  activeTabId: string | null
  activeSidebarTab:
    | 'none'
    | 'notes'
    | 'bookmarks'
    | 'downloads'
    | 'history'
    | 'passwords'
    | 'theme'
    | 'adblock'
    | 'profile'
  searchQuery: string
  adBlockedCount: number
  downloads: DownloadItem[]

  // Custom View overlays
  readingModeActive: boolean
  readingModeContent: { title: string; body: string } | null
  viewSourceActive: boolean
  viewJsonActive: boolean
  jsonContent: any | null

  // Core functions
  init: () => Promise<void>
  syncDb: () => Promise<void>
  setActiveProfile: (profileId: string | null) => void
  setActiveWorkspace: (workspaceId: string) => void
  setActiveTab: (tabId: string) => void
  setSidebarTab: (
    tab:
      | 'none'
      | 'notes'
      | 'bookmarks'
      | 'downloads'
      | 'history'
      | 'passwords'
      | 'theme'
      | 'adblock'
      | 'profile'
  ) => void

  // Profile CRUD
  createProfile: (
    name: string,
    avatar: string,
    lockType: 'none' | 'password' | 'pin',
    code?: string
  ) => Promise<void>
  deleteProfile: (profileId: string) => Promise<void>
  updateProfile: (
    profileId: string,
    name: string,
    avatar: string,
    lockType: 'none' | 'password' | 'pin',
    code?: string
  ) => Promise<void>
  updateProfileTheme: (themeId: string) => Promise<void>

  // Workspace CRUD
  createWorkspace: (name: string) => Promise<void>
  deleteWorkspace: (id: string) => Promise<void>

  // Tab CRUD
  addTab: (title: string, url: string) => void
  closeTab: (tabId: string) => void
  updateTabUrl: (tabId: string, url: string, title?: string) => void
  togglePinTab: (tabId: string) => void

  // Bookmark CRUD
  addBookmark: (title: string, url: string) => void
  deleteBookmark: (id: string) => void

  // History CRUD
  addHistory: (title: string, url: string) => void
  clearHistory: () => void

  // Notes CRUD
  addNote: (title: string, content: string) => void
  updateNote: (id: string, title: string, content: string) => void
  deleteNote: (id: string) => void

  // Password Vault CRUD
  addCredential: (url: string, username: string, plainText: string) => Promise<void>
  deleteCredential: (id: string) => Promise<void>
  decryptCredential: (id: string) => Promise<string>

  // Ad blocker site rules
  addAdBlockRule: (domain: string, action: 'block' | 'allow') => void
  deleteAdBlockRule: (domain: string) => void

  // Overlays toggle
  setReadingMode: (active: boolean, content?: { title: string; body: string }) => void
  setViewSource: (active: boolean) => void
  setViewJson: (active: boolean, content?: any) => void

  // Downloads updates
  updateDownload: (id: string, updates: Partial<DownloadItem>) => void
}

export const useBrowserStore = create<BrowserStore>((set, get) => ({
  db: null,
  activeProfileId: null,
  activeWorkspaceId: null,
  activeTabId: null,
  activeSidebarTab: 'none',
  searchQuery: '',
  adBlockedCount: 0,
  downloads: [],
  readingModeActive: false,
  readingModeContent: null,
  viewSourceActive: false,
  viewJsonActive: false,
  jsonContent: null,

  init: async () => {
    const db = await window.api.getDb()
    set({ db })

    // Auto-select first unlocked profile if any
    const firstUnlocked = db.profiles.find((p: Profile) => p.lockType === 'none')
    if (firstUnlocked) {
      get().setActiveProfile(firstUnlocked.id)
    }
  },

  syncDb: async () => {
    const { db } = get()
    if (db) {
      await window.api.saveDb(db)
    }
  },

  setActiveProfile: (profileId: string | null) => {
    const { db } = get()
    if (!profileId || !db) {
      set({
        activeProfileId: null,
        activeWorkspaceId: null,
        activeTabId: null,
        adBlockedCount: 0,
        readingModeActive: false,
        viewSourceActive: false,
        viewJsonActive: false
      })
      return
    }

    const profile = db.profiles.find((p: Profile) => p.id === profileId)
    if (!profile) return

    // Find active workspace
    let activeWId = profile.activeWorkspaceId
    const workspaceExists = db.workspaces.some(
      (w: Workspace) => w.id === activeWId && w.profileId === profileId
    )

    if (!workspaceExists) {
      const userWorkspaces = db.workspaces.filter((w: Workspace) => w.profileId === profileId)
      if (userWorkspaces.length > 0) {
        activeWId = userWorkspaces[0].id
      } else {
        // Create default workspace
        activeWId = 'workspace-' + Math.random().toString(36).substring(7)
        db.workspaces.push({
          id: activeWId,
          profileId: profileId,
          name: 'My Workspace'
        })
      }
    }

    profile.activeWorkspaceId = activeWId

    // Find active tab for this workspace
    const workspaceTabs = db.tabs.filter((t: Tab) => t.workspaceId === activeWId)
    let activeTabId: string | null = null
    const activeTab = workspaceTabs.find((t: Tab) => t.active)

    if (activeTab) {
      activeTabId = activeTab.id
    } else if (workspaceTabs.length > 0) {
      activeTabId = workspaceTabs[0].id
      workspaceTabs[0].active = true
    } else {
      // Create default tab
      activeTabId = 'tab-' + Math.random().toString(36).substring(7)
      db.tabs.push({
        id: activeTabId,
        workspaceId: activeWId,
        title: 'New Tab',
        url: 'aether://home',
        isPinned: false,
        active: true
      })
    }

    set({
      activeProfileId: profileId,
      activeWorkspaceId: activeWId,
      activeTabId,
      adBlockedCount: db.stats?.adsBlockedPerProfile?.[profileId] || 0,
      readingModeActive: false,
      viewSourceActive: false,
      viewJsonActive: false,
      db: { ...db }
    })
    get().syncDb()
  },

  setActiveWorkspace: (workspaceId: string) => {
    const { db, activeProfileId } = get()
    if (!db || !activeProfileId) return

    const profile = db.profiles.find((p: Profile) => p.id === activeProfileId)
    if (profile) {
      profile.activeWorkspaceId = workspaceId
    }

    // Find active tab for new workspace
    const workspaceTabs = db.tabs.filter((t: Tab) => t.workspaceId === workspaceId)
    let activeTabId: string | null = null
    const activeTab = workspaceTabs.find((t: Tab) => t.active)

    if (activeTab) {
      activeTabId = activeTab.id
    } else if (workspaceTabs.length > 0) {
      activeTabId = workspaceTabs[0].id
      workspaceTabs[0].active = true
    } else {
      activeTabId = 'tab-' + Math.random().toString(36).substring(7)
      db.tabs.push({
        id: activeTabId,
        workspaceId,
        title: 'New Tab',
        url: 'aether://home',
        isPinned: false,
        active: true
      })
    }

    set({ activeWorkspaceId: workspaceId, activeTabId, db: { ...db } })
    get().syncDb()
  },

  setActiveTab: (tabId: string) => {
    const { db, activeWorkspaceId } = get()
    if (!db || !activeWorkspaceId) return

    db.tabs.forEach((t: Tab) => {
      if (t.workspaceId === activeWorkspaceId) {
        t.active = t.id === tabId
      }
    })

    set({
      activeTabId: tabId,
      readingModeActive: false,
      viewSourceActive: false,
      viewJsonActive: false,
      db: { ...db }
    })
    get().syncDb()
  },

  setSidebarTab: (tab) => {
    set({ activeSidebarTab: tab })
  },

  // Profiles
  createProfile: async (name, avatar, lockType, code) => {
    const { db } = get()
    if (!db) return

    const profileId = 'profile-' + Math.random().toString(36).substring(7)
    let lockHash: string | undefined = undefined

    if (lockType !== 'none' && code) {
      // derive lock hash in main process
      lockHash = CryptoJS.SHA256(code).toString()
    }

    const newProfile: Profile = {
      id: profileId,
      name,
      avatar,
      lockType,
      lockHash,
      themeId: 'dark',
      activeWorkspaceId: 'workspace-' + profileId
    }

    db.profiles.push(newProfile)

    // Create default workspace and tab
    const defaultWorkspaceId = 'workspace-' + profileId
    db.workspaces.push({
      id: defaultWorkspaceId,
      profileId: profileId,
      name: 'Primary Space'
    })

    db.tabs.push({
      id: 'tab-' + Math.random().toString(36).substring(7),
      workspaceId: defaultWorkspaceId,
      title: 'New Tab',
      url: 'aether://home',
      isPinned: false,
      active: true
    })

    set({ db: { ...db } })
    await get().syncDb()
    get().setActiveProfile(profileId)
  },

  deleteProfile: async (profileId) => {
    const { db, activeProfileId } = get()
    if (!db || profileId === 'default') return // Keep default profile

    // Clean up tabs of the deleted profile's workspaces first
    const deletedWorkspaceIds = db.workspaces
      .filter((w: Workspace) => w.profileId === profileId)
      .map((w: Workspace) => w.id)
    db.tabs = db.tabs.filter((t: Tab) => !deletedWorkspaceIds.includes(t.workspaceId))

    db.profiles = db.profiles.filter((p: Profile) => p.id !== profileId)
    db.workspaces = db.workspaces.filter((w: Workspace) => w.profileId !== profileId)
    db.bookmarks = db.bookmarks.filter((b: Bookmark) => b.profileId !== profileId)
    db.history = db.history.filter((h: HistoryItem) => h.profileId !== profileId)
    db.notes = db.notes.filter((n: Note) => n.profileId !== profileId)
    db.credentials = db.credentials.filter((c: SavedCredential) => c.profileId !== profileId)

    if (db.adBlockRules[profileId]) {
      delete db.adBlockRules[profileId]
    }

    set({ db: { ...db } })
    await get().syncDb()

    if (activeProfileId === profileId) {
      get().setActiveProfile(null)
    }
  },

  updateProfile: async (profileId, name, avatar, lockType, code) => {
    const { db } = get()
    if (!db) return

    const profile = db.profiles.find((p: Profile) => p.id === profileId)
    if (profile) {
      profile.name = name
      profile.avatar = avatar
      profile.lockType = lockType
      if (code) {
        profile.lockHash = CryptoJS.SHA256(code).toString()
      } else if (lockType === 'none') {
        profile.lockHash = undefined
      }

      set({ db: { ...db } })
      await get().syncDb()

      // If updating current profile, trigger re-render
      const currentActiveId = get().activeProfileId
      if (currentActiveId === profileId) {
        get().setActiveProfile(profileId)
      }
    }
  },

  updateProfileTheme: async (themeId) => {
    const { db, activeProfileId } = get()
    if (!db || !activeProfileId) return

    const profile = db.profiles.find((p: Profile) => p.id === activeProfileId)
    if (profile) {
      profile.themeId = themeId
      set({ db: { ...db } })
      await get().syncDb()
    }
  },

  // Workspaces
  createWorkspace: async (name) => {
    const { db, activeProfileId } = get()
    if (!db || !activeProfileId) return

    const id = 'workspace-' + Math.random().toString(36).substring(7)
    db.workspaces.push({ id, profileId: activeProfileId, name })

    // Add first tab
    db.tabs.push({
      id: 'tab-' + Math.random().toString(36).substring(7),
      workspaceId: id,
      title: 'New Tab',
      url: 'aether://home',
      isPinned: false,
      active: true
    })

    set({ db: { ...db } })
    await get().syncDb()
    get().setActiveWorkspace(id)
  },

  deleteWorkspace: async (id) => {
    const { db, activeProfileId, activeWorkspaceId } = get()
    if (!db || !activeProfileId) return

    const userWorkspaces = db.workspaces.filter((w: Workspace) => w.profileId === activeProfileId)
    if (userWorkspaces.length <= 1) return // Keep at least one workspace

    db.workspaces = db.workspaces.filter((w: Workspace) => w.id !== id)
    db.tabs = db.tabs.filter((t: Tab) => t.workspaceId !== id)

    set({ db: { ...db } })
    await get().syncDb()

    if (activeWorkspaceId === id) {
      const remaining = db.workspaces.filter((w: Workspace) => w.profileId === activeProfileId)
      get().setActiveWorkspace(remaining[0].id)
    }
  },

  // Tabs
  addTab: (title, url) => {
    const { db, activeWorkspaceId } = get()
    if (!db || !activeWorkspaceId) return

    // Deactivate current active tabs in workspace
    db.tabs.forEach((t: Tab) => {
      if (t.workspaceId === activeWorkspaceId) {
        t.active = false
      }
    })

    const id = 'tab-' + Math.random().toString(36).substring(7)
    db.tabs.push({
      id,
      workspaceId: activeWorkspaceId,
      title,
      url,
      isPinned: false,
      active: true
    })

    set({ activeTabId: id, db: { ...db } })
    get().syncDb()
  },

  closeTab: (tabId) => {
    const { db, activeWorkspaceId, activeTabId } = get()
    if (!db || !activeWorkspaceId) return

    const workspaceTabs = db.tabs.filter((t: Tab) => t.workspaceId === activeWorkspaceId)
    if (workspaceTabs.length <= 1) {
      // Just reset the last tab to Home
      const tab = workspaceTabs[0]
      tab.title = 'New Tab'
      tab.url = 'aether://home'
      set({ db: { ...db } })
      get().syncDb()
      return
    }

    db.tabs = db.tabs.filter((t: Tab) => t.id !== tabId)

    let nextActiveTabId = activeTabId
    if (activeTabId === tabId) {
      const closedIndex = workspaceTabs.findIndex((t: Tab) => t.id === tabId)
      const nextTab = workspaceTabs[closedIndex + 1] || workspaceTabs[closedIndex - 1]
      if (nextTab) {
        nextActiveTabId = nextTab.id
        db.tabs.forEach((t: Tab) => {
          if (t.id === nextActiveTabId) t.active = true
        })
      }
    }

    set({ activeTabId: nextActiveTabId, db: { ...db } })
    get().syncDb()
  },

  updateTabUrl: (tabId, url, title) => {
    const { db } = get()
    if (!db) return

    const tab = db.tabs.find((t: Tab) => t.id === tabId)
    if (tab) {
      tab.url = url
      if (title) tab.title = title
      set({ db: { ...db } })
      get().syncDb()
    }
  },

  togglePinTab: (tabId) => {
    const { db } = get()
    if (!db) return

    const tab = db.tabs.find((t: Tab) => t.id === tabId)
    if (tab) {
      tab.isPinned = !tab.isPinned
      set({ db: { ...db } })
      get().syncDb()
    }
  },

  // Bookmarks
  addBookmark: (title, url) => {
    const { db, activeProfileId } = get()
    if (!db || !activeProfileId) return

    // Avoid duplicates
    if (db.bookmarks.some((b: Bookmark) => b.profileId === activeProfileId && b.url === url)) return

    db.bookmarks.push({
      id: 'bookmark-' + Math.random().toString(36).substring(7),
      profileId: activeProfileId,
      title,
      url
    })

    set({ db: { ...db } })
    get().syncDb()
  },

  deleteBookmark: (id) => {
    const { db } = get()
    if (!db) return

    db.bookmarks = db.bookmarks.filter((b: Bookmark) => b.id !== id)
    set({ db: { ...db } })
    get().syncDb()
  },

  // History
  addHistory: (title, url) => {
    const { db, activeProfileId } = get()
    if (!db || !activeProfileId) return

    db.history.unshift({
      id: 'hist-' + Math.random().toString(36).substring(7),
      profileId: activeProfileId,
      title,
      url,
      timestamp: Date.now()
    })

    // Keep history at a maximum of 500 items to conserve memory
    if (db.history.length > 500) {
      db.history = db.history.slice(0, 500)
    }

    set({ db: { ...db } })
    get().syncDb()
  },

  clearHistory: () => {
    const { db, activeProfileId } = get()
    if (!db || !activeProfileId) return

    db.history = db.history.filter((h: HistoryItem) => h.profileId !== activeProfileId)
    set({ db: { ...db } })
    get().syncDb()
  },

  // Notes
  addNote: (title, content) => {
    const { db, activeProfileId } = get()
    if (!db || !activeProfileId) return

    db.notes.unshift({
      id: 'note-' + Math.random().toString(36).substring(7),
      profileId: activeProfileId,
      title,
      content,
      timestamp: Date.now()
    })

    set({ db: { ...db } })
    get().syncDb()
  },

  updateNote: (id, title, content) => {
    const { db } = get()
    if (!db) return

    const note = db.notes.find((n: Note) => n.id === id)
    if (note) {
      note.title = title
      note.content = content
      note.timestamp = Date.now()
      set({ db: { ...db } })
      get().syncDb()
    }
  },

  deleteNote: (id) => {
    const { db } = get()
    if (!db) return

    db.notes = db.notes.filter((n: Note) => n.id !== id)
    set({ db: { ...db } })
    get().syncDb()
  },

  // Credentials
  addCredential: async (url, username, plainText) => {
    const { db, activeProfileId } = get()
    if (!db || !activeProfileId) return

    // Encrypt password via IPC
    const passwordEncrypted = await window.api.encryptPassword(plainText, activeProfileId)

    db.credentials.push({
      id: 'cred-' + Math.random().toString(36).substring(7),
      profileId: activeProfileId,
      url,
      username,
      passwordEncrypted
    })

    set({ db: { ...db } })
    await get().syncDb()
  },

  deleteCredential: async (id) => {
    const { db } = get()
    if (!db) return

    db.credentials = db.credentials.filter((c: SavedCredential) => c.id !== id)
    set({ db: { ...db } })
    await get().syncDb()
  },

  decryptCredential: async (id) => {
    const { db, activeProfileId } = get()
    if (!db || !activeProfileId) return ''

    const cred = db.credentials.find((c: SavedCredential) => c.id === id)
    if (!cred) return ''

    return await window.api.decryptPassword(cred.passwordEncrypted, activeProfileId)
  },

  // Ad blocking rules
  addAdBlockRule: (domain, action) => {
    const { db, activeProfileId } = get()
    if (!db || !activeProfileId) return

    if (!db.adBlockRules[activeProfileId]) {
      db.adBlockRules[activeProfileId] = []
    }

    // Remove existing rule for this domain
    db.adBlockRules[activeProfileId] = db.adBlockRules[activeProfileId].filter(
      (r: AdBlockRule) => r.domain !== domain
    )

    db.adBlockRules[activeProfileId].push({
      domain,
      adBlockAction: action
    })

    set({ db: { ...db } })
    get().syncDb()
  },

  deleteAdBlockRule: (domain) => {
    const { db, activeProfileId } = get()
    if (!db || !activeProfileId || !db.adBlockRules[activeProfileId]) return

    db.adBlockRules[activeProfileId] = db.adBlockRules[activeProfileId].filter(
      (r: AdBlockRule) => r.domain !== domain
    )

    set({ db: { ...db } })
    get().syncDb()
  },

  // Overlays
  setReadingMode: (active, content) => {
    set({
      readingModeActive: active,
      readingModeContent: active && content ? content : null
    })
  },

  setViewSource: (active) => {
    set({ viewSourceActive: active })
  },

  setViewJson: (active, content) => {
    set({
      viewJsonActive: active,
      jsonContent: active && content ? content : null
    })
  },

  // Downloads tracking
  updateDownload: (id, updates) => {
    const { downloads } = get()
    const itemIdx = downloads.findIndex((d) => d.id === id)

    if (itemIdx > -1) {
      const updated = [...downloads]
      updated[itemIdx] = { ...updated[itemIdx], ...updates }
      set({ downloads: updated })
    } else {
      // Add new download
      set({
        downloads: [
          ...downloads,
          {
            id,
            filename: updates.filename || 'Unknown File',
            progress: updates.progress || 0,
            speed: updates.speed || '0 KB/s',
            received: updates.received || 0,
            total: updates.total || 0,
            status: (updates.status as any) || 'downloading'
          }
        ]
      })
    }
  }
}))
