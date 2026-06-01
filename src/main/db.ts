import { app } from 'electron'
import { join } from 'path'
import { writeFileSync, readFileSync, existsSync } from 'fs'
import CryptoJS from 'crypto-js'

const DB_FILE = join(app.getPath('userData'), 'kitkat_browser_db.json')
const MASTER_KEY = 'kitkat-browser-secure-key-2026' // System seed

export interface Profile {
  id: string
  name: string
  avatar: string
  lockType: 'none' | 'password' | 'pin'
  lockHash?: string // SHA256 hashed lock code
  themeId: string
  activeWorkspaceId: string
}

export interface Workspace {
  id: string
  profileId: string
  name: string
}

export interface TabState {
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
  passwordEncrypted: string // Encrypted with master + profile-specific hash
}

export interface AdBlockRule {
  domain: string
  adBlockAction: 'block' | 'allow'
}

export interface DatabaseSchema {
  profiles: Profile[]
  workspaces: Workspace[]
  tabs: TabState[]
  bookmarks: Bookmark[]
  history: HistoryItem[]
  notes: Note[]
  credentials: SavedCredential[]
  adBlockRules: Record<string, AdBlockRule[]> // profileId -> rules
  stats: {
    adsBlockedTotal: number
    adsBlockedPerProfile: Record<string, number>
  }
}

const DEFAULT_DB: DatabaseSchema = {
  profiles: [
    {
      id: 'default',
      name: 'Personal',
      avatar: 'User',
      lockType: 'none',
      themeId: 'dark',
      activeWorkspaceId: 'workspace-default'
    }
  ],
  workspaces: [
    {
      id: 'workspace-default',
      profileId: 'default',
      name: 'My Workspace'
    }
  ],
  tabs: [
    {
      id: 'tab-default',
      workspaceId: 'workspace-default',
      title: 'New Tab',
      url: 'aether://home',
      isPinned: false,
      active: true
    }
  ],
  bookmarks: [],
  history: [],
  notes: [],
  credentials: [],
  adBlockRules: {},
  stats: {
    adsBlockedTotal: 0,
    adsBlockedPerProfile: {}
  }
}

let cachedDb: DatabaseSchema | null = null

export function getDb(): DatabaseSchema {
  if (cachedDb) return cachedDb

  try {
    if (!existsSync(DB_FILE)) {
      saveDb(DEFAULT_DB)
      cachedDb = DEFAULT_DB
      return DEFAULT_DB
    }

    const encryptedData = readFileSync(DB_FILE, 'utf-8')
    if (!encryptedData.trim()) {
      saveDb(DEFAULT_DB)
      cachedDb = DEFAULT_DB
      return DEFAULT_DB
    }

    const bytes = CryptoJS.AES.decrypt(encryptedData, MASTER_KEY)
    const decryptedData = bytes.toString(CryptoJS.enc.Utf8)
    cachedDb = JSON.parse(decryptedData)

    // Migration: Update existing tabs that point to old domains back to aether://home start page
    let migrated = false
    if (cachedDb && cachedDb.tabs) {
      cachedDb.tabs.forEach((t: any) => {
        if (
          t.url === 'https://github.com' ||
          t.url === 'aether://home' ||
          t.url === 'aether://home'
        ) {
          t.url = 'aether://home'
          t.title = 'New Tab'
          migrated = true
        }
      })
    }
    // Migration: Update default profile avatar if it is old emoji
    if (cachedDb && cachedDb.profiles) {
      cachedDb.profiles.forEach((p: any) => {
        if (p.avatar === '😊') {
          p.avatar = 'User'
          migrated = true
        }
      })
    }
    if (migrated) {
      saveDb(cachedDb!)
    }

    return cachedDb!
  } catch (error) {
    console.error('Error reading/decrypting database, resetting to default:', error)
    saveDb(DEFAULT_DB)
    cachedDb = DEFAULT_DB
    return DEFAULT_DB
  }
}

export function saveDb(db: DatabaseSchema): void {
  try {
    cachedDb = db
    const jsonString = JSON.stringify(db, null, 2)
    const encrypted = CryptoJS.AES.encrypt(jsonString, MASTER_KEY).toString()
    writeFileSync(DB_FILE, encrypted, 'utf-8')
  } catch (error) {
    console.error('Failed to save database:', error)
  }
}

// Cryptography helper for passwords
export function hashText(text: string): string {
  return CryptoJS.SHA256(text).toString()
}

export function encryptPassword(password: string, key: string): string {
  return CryptoJS.AES.encrypt(password, MASTER_KEY + key).toString()
}

export function decryptPassword(encrypted: string, key: string): string {
  const bytes = CryptoJS.AES.decrypt(encrypted, MASTER_KEY + key)
  return bytes.toString(CryptoJS.enc.Utf8)
}
