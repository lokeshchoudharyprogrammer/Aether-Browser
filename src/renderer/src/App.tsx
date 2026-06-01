import React, { useEffect, useState, useRef } from 'react'
import { useBrowserStore, Tab } from './store/browserStore'
import { ProfilePortal } from './components/ProfilePortal'
import { SidebarPanel } from './components/SidebarPanel'
import { StartPage } from './components/StartPage'
import { AvatarIcon } from './components/AvatarIcon'
import {
  ArrowLeft,
  ArrowRight,
  RotateCw,
  Shield,
  FileText,
  Download,
  Key,
  Sun,
  Terminal,
  Plus,
  X,
  AlignLeft,
  AlignJustify,
  BookOpen,
  Code,
  LogOut,
  User,
  Trash2,
  Globe,
  Pin,
  PinOff,
  Columns2,
  Search,
  ChevronDown,
  RotateCcw,
  ArrowUpDown
} from 'lucide-react'

const getErrorPageHtml = (url: string, errorDescription: string, errorCode: number) => {
  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="utf-8">
      <title>This site can’t be reached</title>
      <meta name="viewport" content="width=device-width, initial-scale=1">
      <style>
        :root {
          --bg-color: #1f1f1f;
          --text-primary: #e3e3e3;
          --text-secondary: #9aa0a6;
          --accent-color: #8ab4f8;
          --accent-hover: #aecbfa;
          --border-color: #3c4043;
          --link-color: #8ab4f8;
        }
        @media (prefers-color-scheme: light) {
          :root {
            --bg-color: #ffffff;
            --text-primary: #202124;
            --text-secondary: #5f6368;
            --accent-color: #1a73e8;
            --accent-hover: #1557b0;
            --border-color: #dadce0;
            --link-color: #1a73e8;
          }
        }
        body {
          font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
          background-color: var(--bg-color);
          color: var(--text-primary);
          margin: 0;
          padding: 0;
          display: flex;
          justify-content: center;
          align-items: center;
          min-height: 100vh;
          box-sizing: border-box;
        }
        .main-container {
          max-width: 600px;
          width: 100%;
          padding: 40px 24px;
          animation: fadeIn 0.4s ease-out;
        }
        .icon {
          width: 64px;
          height: 64px;
          margin-bottom: 24px;
          color: var(--text-secondary);
          opacity: 0.8;
        }
        h1 {
          font-size: 22px;
          font-weight: 500;
          margin: 0 0 16px 0;
          line-height: 1.3;
        }
        p {
          font-size: 14px;
          line-height: 1.6;
          margin: 0 0 24px 0;
          color: var(--text-primary);
        }
        .suggestions {
          font-size: 14px;
          color: var(--text-secondary);
          margin-bottom: 32px;
        }
        .suggestions p {
          color: var(--text-secondary);
          margin-bottom: 8px;
          font-weight: 500;
        }
        .suggestions ul {
          margin: 0;
          padding-left: 20px;
        }
        .suggestions li {
          margin-bottom: 8px;
          line-height: 1.5;
        }
        .actions {
          display: flex;
          gap: 12px;
          align-items: center;
          border-bottom: 1px solid var(--border-color);
          padding-bottom: 24px;
          margin-bottom: 20px;
        }
        .btn-blue {
          background-color: var(--accent-color);
          color: var(--bg-color);
          border: none;
          padding: 10px 24px;
          border-radius: 4px;
          font-size: 14px;
          font-weight: 500;
          cursor: pointer;
          transition: background-color 0.15s ease, box-shadow 0.15s ease;
          font-family: inherit;
        }
        .btn-blue:hover {
          background-color: var(--accent-hover);
          box-shadow: 0 1px 3px rgba(0,0,0,0.2);
        }
        .details-toggle {
          font-size: 14px;
          color: var(--link-color);
          text-decoration: none;
          cursor: pointer;
          font-weight: 500;
          border: none;
          background: none;
          padding: 0;
        }
        .details-toggle:hover {
          text-decoration: underline;
        }
        .error-code {
          font-size: 12px;
          color: var(--text-secondary);
          font-family: monospace;
          margin-top: 12px;
        }
        .details-panel {
          display: none;
          font-size: 13px;
          color: var(--text-secondary);
          line-height: 1.6;
          background: rgba(0,0,0,0.03);
          border-left: 3px solid var(--border-color);
          padding: 12px 16px;
          margin-top: 16px;
          border-radius: 0 4px 4px 0;
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
      </style>
      <script>
        function toggleDetails() {
          const panel = document.getElementById('details-panel');
          const btn = document.getElementById('details-btn');
          if (panel.style.display === 'block') {
            panel.style.display = 'none';
            btn.textContent = 'Details';
          } else {
            panel.style.display = 'block';
            btn.textContent = 'Hide details';
          }
        }
      </script>
    </head>
    <body>
      <div class="main-container">
        <svg class="icon" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/>
        </svg>
        <h1>This site can’t be reached</h1>
        <p>
          The connection to <strong>${url}</strong> was refused or the server's IP address could not be found.
        </p>
        
        <div class="suggestions">
          <p>Try:</p>
          <ul>
            <li>Checking the connection</li>
            <li>Checking the proxy and the firewall</li>
            <li>Checking the spelling of the address</li>
          </ul>
        </div>

        <div class="actions">
          <button class="btn-blue" onclick="window.location.href='${url}'">Reload</button>
          <button id="details-btn" class="details-toggle" onclick="toggleDetails()">Details</button>
        </div>

        <div id="details-panel" class="details-panel">
          Error description: ${errorDescription}<br>
          Error code: ${errorCode}
        </div>

        <div class="error-code">${errorDescription}</div>
      </div>
    </body>
    </html>
  `;
};

function App(): React.JSX.Element {
  const store = useBrowserStore()
  const {
    db,
    activeProfileId,
    activeWorkspaceId,
    activeTabId,
    activeSidebarTab,
    tabZoom,
    setSidebarTab,
    setActiveProfile,
    setActiveWorkspace,
    setActiveTab,
    addTab,
    closeTab,
    updateTabUrl,
    updateTabFavicon,
    setTabZoom,
    addHistory,
    updateDownload
  } = store

  const [addressInput, setAddressInput] = useState('')
  const [tabLayout, setTabLayout] = useState<'horizontal' | 'vertical'>('horizontal')

  // State for top address bar search suggestions
  const [topSuggestions, setTopSuggestions] = useState<string[]>([])
  const [topSelectedIndex, setTopSelectedIndex] = useState<number>(-1)
  const [showTopSuggestions, setShowTopSuggestions] = useState<boolean>(false)

  // Debounced search suggestions fetch for top bar
  useEffect(() => {
    const trimmed = addressInput.trim()

    // Skip if empty or looks like a URL/domain name
    if (
      !trimmed ||
      trimmed.startsWith('http://') ||
      trimmed.startsWith('https://') ||
      (trimmed.includes('.') && !trimmed.includes(' '))
    ) {
      setTopSuggestions([])
      setTopSelectedIndex(-1)
      return
    }

    const handler = setTimeout(async () => {
      try {
        if (window.api && typeof window.api.getSearchSuggestions === 'function') {
          const res = await window.api.getSearchSuggestions(trimmed, store.searchShieldEnabled)
          setTopSuggestions((res || []).slice(0, 5))
        } else {
          const response = await fetch(
            store.searchShieldEnabled
              ? `https://ac.duckduckgo.com/ac/?q=${encodeURIComponent(trimmed)}&type=list`
              : `https://suggestqueries.google.com/complete/search?client=chrome&q=${encodeURIComponent(trimmed)}`
          )
          if (response.ok) {
            const data = await response.json()
            setTopSuggestions((data[1] || []).slice(0, 5))
          }
        }
        setTopSelectedIndex(-1)
      } catch (err) {
        console.error('Failed to get top suggestions:', err)
        setTopSuggestions([])
      }
    }, 150) // 150ms debounce

    return () => clearTimeout(handler)
  }, [addressInput])

  const handleTopKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (showTopSuggestions && topSuggestions.length > 0) {
      if (e.key === 'ArrowDown') {
        e.preventDefault()
        setTopSelectedIndex((prev) => (prev < topSuggestions.length - 1 ? prev + 1 : 0))
      } else if (e.key === 'ArrowUp') {
        e.preventDefault()
        setTopSelectedIndex((prev) => (prev > 0 ? prev - 1 : topSuggestions.length - 1))
      } else if (e.key === 'Escape') {
        setShowTopSuggestions(false)
      } else if (e.key === 'Enter') {
        if (topSelectedIndex >= 0 && topSelectedIndex < topSuggestions.length) {
          e.preventDefault()
          const suggestion = topSuggestions[topSelectedIndex]
          setAddressInput(suggestion)

          let url = suggestion.trim()
          if (!url.startsWith('http://') && !url.startsWith('https://')) {
            if (url.includes('.') && !url.includes(' ')) {
              url = 'https://' + url
            } else {
              url = store.searchShieldEnabled
                ? 'https://www.startpage.com/sp/search?query=' + encodeURIComponent(url)
                : 'https://www.google.com/search?q=' + encodeURIComponent(url)
            }
          }

          updateTabUrl(activeTabId || '', url, url)
          setAddressInput(url)

          const webview = webviewRefs.current[activeTabId || '']
          if (webview) {
            webview.src = url
          }
          setShowTopSuggestions(false)
        }
      }
    }
  }

  const [loadedTabIds, setLoadedTabIds] = useState<string[]>([])

  // Find in Page state
  const [showFindBar, setShowFindBar] = useState(false)
  const [findQuery, setFindQuery] = useState('')
  const [findInfo, setFindInfo] = useState('')

  // Custom views states
  const [sourceCode, setSourceCode] = useState('')
  const [showWorkspaceMenu, setShowWorkspaceMenu] = useState(false)
  const [newWorkspaceName, setNewWorkspaceName] = useState('')
  const [splitTabId, setSplitTabId] = useState<string | null>(null)
  const [showSplitSelector, setShowSplitSelector] = useState(false)

  const activeTabIdRef = useRef(activeTabId)
  const splitTabIdRef = useRef(splitTabId)

  useEffect(() => {
    activeTabIdRef.current = activeTabId
  }, [activeTabId])

  useEffect(() => {
    splitTabIdRef.current = splitTabId
  }, [splitTabId])

  const workspaceTabs = db ? db.tabs.filter((t: any) => t.workspaceId === activeWorkspaceId) : []

  // Auto-close split if the split tab is closed
  useEffect(() => {
    if (splitTabId && !workspaceTabs.some((t: any) => t.id === splitTabId)) {
      setSplitTabId(null)
    }
  }, [workspaceTabs, splitTabId])

  // Close split selector if workspace changes
  useEffect(() => {
    setShowSplitSelector(false)
  }, [activeWorkspaceId])

  const [splitRatio, setSplitRatio] = useState<number>(0.5)
  const [isResizing, setIsResizing] = useState<boolean>(false)
  const containerRef = useRef<HTMLDivElement>(null)

  const handleResizeMouseDown = (e: React.MouseEvent) => {
    e.preventDefault()
    setIsResizing(true)

    const onMouseMove = (moveEvent: MouseEvent) => {
      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect()
        const newRatio = (moveEvent.clientX - rect.left) / rect.width
        const constrainedRatio = Math.max(0.15, Math.min(0.85, newRatio))
        setSplitRatio(constrainedRatio)
      }
    }

    const onMouseUp = () => {
      setIsResizing(false)
      window.removeEventListener('mousemove', onMouseMove)
      window.removeEventListener('mouseup', onMouseUp)
    }

    window.addEventListener('mousemove', onMouseMove)
    window.addEventListener('mouseup', onMouseUp)
  }

  // Reset split ratio when split view is deactivated
  useEffect(() => {
    if (!splitTabId) {
      setSplitRatio(0.5)
    }
  }, [splitTabId])

  // Tab toolbar states
  const [lastClosedTabs, setLastClosedTabs] = useState<{ title: string; url: string; isPrivate: boolean }[]>([])
  const [showTabSearch, setShowTabSearch] = useState(false)
  const [tabSearchQuery, setTabSearchQuery] = useState('')
  const [showTabMenu, setShowTabMenu] = useState(false)

  const handleCloseTab = (tabId: string) => {
    if (!db) return
    const tabObj = db.tabs.find((t: any) => t.id === tabId)
    if (tabObj) {
      setLastClosedTabs((prev) => [
        { title: tabObj.title, url: tabObj.url, isPrivate: !!tabObj.isPrivate },
        ...prev
      ].slice(0, 15))
    }
    closeTab(tabId)
  }

  const handleReopenLastClosedTab = () => {
    if (lastClosedTabs.length > 0) {
      const [last, ...remaining] = lastClosedTabs
      addTab(last.title, last.url, last.isPrivate)
      setLastClosedTabs(remaining)
    }
  }

  const handleCloseOtherTabs = () => {
    workspaceTabs.forEach((t: Tab) => {
      if (t.id !== activeTabId) {
        closeTab(t.id)
      }
    })
  }

  const handleCloseAllTabs = () => {
    addTab('New Tab', 'aether://home')
    workspaceTabs.forEach((t: Tab) => {
      closeTab(t.id)
    })
  }

  const handleSortTabs = (type: 'title' | 'url') => {
    if (!db) return
    const sorted = [...workspaceTabs].sort((a: Tab, b: Tab) => {
      const valA = type === 'title' ? a.title : a.url
      const valB = type === 'title' ? b.title : b.url
      return valA.localeCompare(valB)
    })

    const otherWorkspaceTabs = db.tabs.filter((t: Tab) => t.workspaceId !== activeWorkspaceId)
    db.tabs = [...otherWorkspaceTabs, ...sorted]
    store.syncDb()
  }

  const webviewRefs = useRef<Record<string, any>>({})

  useEffect(() => {
    store.init()

    // Register ad blocked IPC event listeners
    const cleanAdBlock = window.api.onAdBlocked((_, _data) => {
      // Increment count on frontend
      const activeProfId = useBrowserStore.getState().activeProfileId
      if (activeProfId) {
        useBrowserStore.setState((state) => {
          if (!state.db) return {}
          const currentCount = (state.db.stats.adsBlockedPerProfile[activeProfId] || 0) + 1
          state.db.stats.adsBlockedTotal += 1
          state.db.stats.adsBlockedPerProfile[activeProfId] = currentCount
          return {
            adBlockedCount: currentCount,
            db: { ...state.db }
          }
        })
      }
    })

    // Register download IPC event listeners
    const cleanDlProgress = window.api.onDownloadProgress((_, data: any) => {
      updateDownload(data.id, {
        filename: data.filename,
        progress: data.progress,
        speed: data.speed,
        received: data.received,
        total: data.total,
        status: 'downloading'
      })
      // Open downloads panel automatically
      setSidebarTab('downloads')
    })

    const cleanDlFinished = window.api.onDownloadFinished((_, data) => {
      updateDownload(data.id, {
        status: data.status === 'completed' ? 'completed' : 'failed'
      })
    })

    return () => {
      cleanAdBlock()
      cleanDlProgress()
      cleanDlFinished()
    }
  }, [])

  // Manage lazy loading tabs
  useEffect(() => {
    const toLoad: string[] = []
    if (activeTabId && !loadedTabIds.includes(activeTabId)) {
      toLoad.push(activeTabId)
    }
    const isSplit = splitTabId !== null && splitTabId !== activeTabId && (db?.tabs.some((t: any) => t.id === splitTabId) ?? false)
    if (isSplit && splitTabId && !loadedTabIds.includes(splitTabId)) {
      toLoad.push(splitTabId)
    }
    if (toLoad.length > 0) {
      setLoadedTabIds((prev) => [...prev, ...toLoad])
    }

    if (activeTabId && db) {
      const activeTab = db.tabs.find((t: any) => t.id === activeTabId)
      if (activeTab) {
        setAddressInput(activeTab.url)
      }
    }
  }, [activeTabId, splitTabId, db])

  // Register global shortcuts and window event listeners
  useEffect(() => {
    // 1. New Tab
    const cleanNewTab = window.api.onShortcut('shortcut-new-tab', () => {
      addTab('New Tab', 'aether://home')
    })

    // 2. Close Current Tab
    const cleanCloseTab = window.api.onShortcut('shortcut-close-tab', () => {
      if (activeTabId) {
        handleCloseTab(activeTabId)
      }
    })

    // 3. Toggle Sidebar
    const cleanToggleSidebar = window.api.onShortcut('shortcut-toggle-sidebar', () => {
      setSidebarTab(activeSidebarTab && activeSidebarTab !== 'none' ? 'none' : 'bookmarks')
    })

    // 4. Focus Address Bar
    const cleanFocusAddress = window.api.onShortcut('shortcut-focus-address', () => {
      const addressInputEl = document.getElementById('address-bar')
      if (addressInputEl) {
        addressInputEl.focus()
        ;(addressInputEl as HTMLInputElement).select()
      }
    })

    // 5. Lock Profile
    const cleanLockProfile = window.api.onShortcut('shortcut-lock-profile', () => {
      setActiveProfile(null)
    })

    // 6. Cycle Workspaces
    const cleanCycleWorkspace = window.api.onShortcut('shortcut-cycle-workspace', () => {
      const workspaces = db?.workspaces.filter((w: any) => w.profileId === activeProfileId) || []
      if (workspaces.length > 0) {
        const currentIndex = workspaces.findIndex((w: any) => w.id === activeWorkspaceId)
        const nextIndex = (currentIndex + 1) % workspaces.length
        setActiveWorkspace(workspaces[nextIndex].id)
      }
    })

    // 7. Zoom In
    const cleanZoomIn = window.api.onShortcut('shortcut-zoom-in', () => {
      if (activeTabId) {
        const current = tabZoom[activeTabId] ?? 1
        const next = Math.min(3, Math.round((current + 0.1) * 10) / 10)
        setTabZoom(activeTabId, next)
        const webview = webviewRefs.current[activeTabId]
        if (webview) webview.setZoomFactor(next)
      }
    })

    // 8. Zoom Out
    const cleanZoomOut = window.api.onShortcut('shortcut-zoom-out', () => {
      if (activeTabId) {
        const current = tabZoom[activeTabId] ?? 1
        const next = Math.max(0.3, Math.round((current - 0.1) * 10) / 10)
        setTabZoom(activeTabId, next)
        const webview = webviewRefs.current[activeTabId]
        if (webview) webview.setZoomFactor(next)
      }
    })

    // 9. Zoom Reset
    const cleanZoomReset = window.api.onShortcut('shortcut-zoom-reset', () => {
      if (activeTabId) {
        setTabZoom(activeTabId, 1)
        const webview = webviewRefs.current[activeTabId]
        if (webview) webview.setZoomFactor(1)
      }
    })

    // 10. New Private Window
    const cleanNewPrivate = window.api.onShortcut('shortcut-new-private', () => {
      addTab('Private Tab', 'aether://home', true)
    })

    // 11. Toggle Notes Panel
    const cleanToggleNotes = window.api.onShortcut('shortcut-toggle-notes', () => {
      setSidebarTab(activeSidebarTab === 'notes' ? 'none' : 'notes')
    })

    // 12. Reload Tab
    const cleanReloadTab = window.api.onShortcut('shortcut-reload-tab', () => {
      handleReload()
    })

    // 13. Force Reload Tab
    const cleanForceReloadTab = window.api.onShortcut('shortcut-forcereload-tab', () => {
      const webview = webviewRefs.current[activeTabId || '']
      if (webview) {
        webview.reloadIgnoringCache()
      }
    })

    // Local keydown listener for the chrome frame
    const handleKeyDown = (e: KeyboardEvent) => {
      const isMod = e.metaKey || e.ctrlKey

      // Force Reload: Ctrl/Cmd + Shift + R
      if (isMod && e.shiftKey && e.key.toLowerCase() === 'r') {
        e.preventDefault()
        const webview = webviewRefs.current[activeTabId || '']
        if (webview) {
          webview.reloadIgnoringCache()
        }
        return
      }

      // Reload: Ctrl/Cmd + R or F5
      if ((isMod && e.key.toLowerCase() === 'r') || e.key === 'F5') {
        e.preventDefault()
        handleReload()
        return
      }

      // Lock Profile: Ctrl/Cmd + K
      if (isMod && e.key.toLowerCase() === 'k') {
        e.preventDefault()
        setActiveProfile(null)
        return
      }

      // Toggle Sidebar: Ctrl/Cmd + B
      if (isMod && e.key.toLowerCase() === 'b') {
        e.preventDefault()
        setSidebarTab(activeSidebarTab && activeSidebarTab !== 'none' ? 'none' : 'bookmarks')
        return
      }

      // Focus Address Bar: Ctrl/Cmd + L
      if (isMod && e.key.toLowerCase() === 'l') {
        e.preventDefault()
        const addressInputEl = document.getElementById('address-bar')
        if (addressInputEl) {
          addressInputEl.focus()
          ;(addressInputEl as HTMLInputElement).select()
        }
        return
      }

      // New Tab: Ctrl/Cmd + T
      if (isMod && e.key.toLowerCase() === 't') {
        e.preventDefault()
        addTab('New Tab', 'aether://home')
        return
      }

      // Close Current Tab: Ctrl/Cmd + W
      if (isMod && e.key.toLowerCase() === 'w') {
        e.preventDefault()
        if (activeTabId) {
          handleCloseTab(activeTabId)
        }
        return
      }

      // Cycle Workspaces: Ctrl/Cmd + G
      if (isMod && e.key.toLowerCase() === 'g') {
        e.preventDefault()
        const workspaces = db?.workspaces.filter((w: any) => w.profileId === activeProfileId) || []
        if (workspaces.length > 0) {
          const currentIndex = workspaces.findIndex((w: any) => w.id === activeWorkspaceId)
          const nextIndex = (currentIndex + 1) % workspaces.length
          setActiveWorkspace(workspaces[nextIndex].id)
        }
        return
      }

      // Zoom: Cmd+I (zoom in)
      if (isMod && e.key.toLowerCase() === 'i') {
        e.preventDefault()
        if (activeTabId) {
          const current = tabZoom[activeTabId] ?? 1
          const next = Math.min(3, Math.round((current + 0.1) * 10) / 10)
          setTabZoom(activeTabId, next)
          const webview = webviewRefs.current[activeTabId]
          if (webview) webview.setZoomFactor(next)
        }
        return
      }

      // Zoom: Cmd+O (zoom out)
      if (isMod && e.key.toLowerCase() === 'o') {
        e.preventDefault()
        if (activeTabId) {
          const current = tabZoom[activeTabId] ?? 1
          const next = Math.max(0.3, Math.round((current - 0.1) * 10) / 10)
          setTabZoom(activeTabId, next)
          const webview = webviewRefs.current[activeTabId]
          if (webview) webview.setZoomFactor(next)
        }
        return
      }

      // Zoom: Cmd+E (reset)
      if (isMod && e.key.toLowerCase() === 'e') {
        e.preventDefault()
        if (activeTabId) {
          setTabZoom(activeTabId, 1)
          const webview = webviewRefs.current[activeTabId]
          if (webview) webview.setZoomFactor(1)
        }
        return
      }

      // New Private Tab: Cmd+P
      if (isMod && e.key.toLowerCase() === 'p') {
        e.preventDefault()
        addTab('Private Tab', 'aether://home', true)
        return
      }

      // Toggle Notes Panel: Cmd+N
      if (isMod && e.key.toLowerCase() === 'n') {
        e.preventDefault()
        setSidebarTab(activeSidebarTab === 'notes' ? 'none' : 'notes')
        return
      }

      // Find in Page: Cmd+F
      if (isMod && e.key.toLowerCase() === 'f') {
        e.preventDefault()
        setShowFindBar((prev) => !prev)
        if (!showFindBar) {
          setTimeout(() => document.getElementById('find-bar-input')?.focus(), 60)
        } else {
          const webview = webviewRefs.current[activeTabId || '']
          if (webview) webview.stopFindInPage('clearSelection')
          setFindQuery('')
          setFindInfo('')
        }
        return
      }

      // Escape closes find bar
      if (e.key === 'Escape' && showFindBar) {
        e.preventDefault()
        setShowFindBar(false)
        const webview = webviewRefs.current[activeTabId || '']
        if (webview) webview.stopFindInPage('clearSelection')
        setFindQuery('')
        setFindInfo('')
        return
      }
    }

    window.addEventListener('keydown', handleKeyDown)

    return () => {
      cleanNewTab()
      cleanCloseTab()
      cleanToggleSidebar()
      cleanFocusAddress()
      cleanLockProfile()
      cleanCycleWorkspace()
      cleanZoomIn()
      cleanZoomOut()
      cleanZoomReset()
      cleanNewPrivate()
      cleanToggleNotes()
      cleanReloadTab()
      cleanForceReloadTab()
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [
    activeProfileId,
    activeWorkspaceId,
    activeTabId,
    activeSidebarTab,
    showFindBar,
    tabZoom,
    db,
    setActiveProfile,
    setSidebarTab,
    addTab,
    closeTab,
    setActiveWorkspace,
    setTabZoom
  ])

  if (!db) {
    return (
      <div
        style={{
          display: 'flex',
          height: '100vh',
          width: '100vw',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: '#0f111a',
          color: '#ffffff'
        }}
      >
        Loading database...
      </div>
    )
  }

  // Handle profile locks
  if (activeProfileId === null) {
    return <ProfilePortal />
  }

  const activeProfile = db.profiles.find((p: any) => p.id === activeProfileId)
  const userWorkspaces = db.workspaces.filter((w: any) => w.profileId === activeProfileId)
  const activeTabObj = workspaceTabs.find((t: any) => t.id === activeTabId)
  const isSplitActive = splitTabId !== null && splitTabId !== activeTabId && workspaceTabs.some((t: any) => t.id === splitTabId)

  const themeClass = activeProfile ? `theme-${activeProfile.themeId}` : 'theme-dark'

  // Sort: pinned tabs first
  const sortedWorkspaceTabs = [
    ...workspaceTabs.filter((t: any) => t.isPinned),
    ...workspaceTabs.filter((t: any) => !t.isPinned)
  ]

  // Current zoom for active tab
  const currentZoom = activeTabId ? (tabZoom[activeTabId] ?? 1) : 1
  const zoomPct = Math.round(currentZoom * 100)
  const handleGoBack = () => {
    const webview = webviewRefs.current[activeTabId || '']
    if (webview && webview.canGoBack()) {
      webview.goBack()
    }
  }

  const handleGoForward = () => {
    const webview = webviewRefs.current[activeTabId || '']
    if (webview && webview.canGoForward()) {
      webview.goForward()
    }
  }

  const handleReload = () => {
    const webview = webviewRefs.current[activeTabId || '']
    if (webview) {
      webview.reload()
    }
  }

  const handleToggleSplit = () => {
    setShowSplitSelector((prev) => !prev)
  }

  // Address submission
  const handleAddressSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    let url = addressInput.trim()
    if (!url) return

    if (!url.startsWith('http://') && !url.startsWith('https://')) {
      if (url.includes('.') && !url.includes(' ')) {
        url = 'https://' + url
      } else {
        url = store.searchShieldEnabled
          ? 'https://www.startpage.com/sp/search?query=' + encodeURIComponent(url)
          : 'https://www.google.com/search?q=' + encodeURIComponent(url)
      }
    }

    updateTabUrl(activeTabId || '', url, url)
    setAddressInput(url)

    const webview = webviewRefs.current[activeTabId || '']
    if (webview) {
      webview.src = url
    }
  }

  // Initialize webview event listeners
  const setupWebviewListeners = (id: string, webview: any) => {
    if (!webview) return
    webviewRefs.current[id] = webview

    if (webview.__listenersAttached) return
    webview.__listenersAttached = true

    webview.addEventListener('focus', () => {
      const currentActiveId = activeTabIdRef.current
      const currentSplitId = splitTabIdRef.current
      const isSplit = currentSplitId !== null && currentSplitId !== currentActiveId
      if (isSplit && id === currentSplitId) {
        store.setActiveTab(id)
        setSplitTabId(currentActiveId)
      }
    })

    webview.addEventListener('dom-ready', () => {
      try {
        const url = webview.getURL()
        if (url.startsWith('data:text/html')) {
          // Skip updating address bar/history/URLs for our custom HTML error page
          return
        }
        const title = webview.getTitle()
        updateTabUrl(id, url, title)
        addHistory(title, url)
        
        const currentActiveId = useBrowserStore.getState().activeTabId
        if (id === currentActiveId) {
          setAddressInput(url)
        }

        // Apply saved zoom
        const zoom = useBrowserStore.getState().tabZoom[id]
        if (zoom && zoom !== 1) webview.setZoomFactor(zoom)

        // Extract favicon
        webview
          .executeJavaScript(
            `(function() {
              const icons = [
                document.querySelector('link[rel="icon"]'),
                document.querySelector('link[rel="shortcut icon"]'),
                document.querySelector('link[rel="apple-touch-icon"]')
              ].filter(Boolean);
              if (icons.length > 0) return icons[0].href;
              return window.location.origin + '/favicon.ico';
            })()`
          )
          .then((faviconUrl: string) => {
            if (faviconUrl) updateTabFavicon(id, faviconUrl)
          })
          .catch(() => {})

        // Inject cosmetic ad blocker and YouTube skipper
        webview
          .executeJavaScript(
            `
          (function() {
            function skipYTAds() {
              if (!window.location.hostname.includes('youtube.com')) return;
              
              // 1. Hide ad overlay elements
              const adSelectors = [
                '.video-ads', '.ytp-ad-module', '#player-ads', 
                'ytd-ad-slot-renderer', '#masthead-ad', '.ytp-ad-overlay-container',
                'ytd-promoted-sparkles-web-renderer', 'ytd-statement-banner-renderer'
              ];
              adSelectors.forEach(sel => {
                const el = document.querySelector(sel);
                if (el) {
                  el.style.setProperty('display', 'none', 'important');
                  el.style.setProperty('height', '0px', 'important');
                  el.style.setProperty('opacity', '0', 'important');
                }
              });

              // 2. Fast forward video ads and click skip
              const video = document.querySelector('video');
              const adShowing = document.querySelector('.ad-showing, .ad-interrupting');
              if (adShowing && video) {
                video.muted = true;
                video.playbackRate = 16.0;
                
                const skipBtn = document.querySelector('.ytp-ad-skip-button, .ytp-ad-skip-button-modern, .ytp-ad-skip-button-slot');
                if (skipBtn) {
                  skipBtn.click();
                } else if (!isNaN(video.duration) && video.currentTime < video.duration - 0.5) {
                  video.currentTime = video.duration - 0.1;
                }
              }
            }

            function cosmeticBlock() {
              const selectors = [
                '[id*="google_ads_iframe"]', '[class*="adsbygoogle"]', 
                '.ad-container', '.banner-ad', '.ad-box', '.ad-wrapper'
              ];
              selectors.forEach(sel => {
                document.querySelectorAll(sel).forEach(el => {
                  el.style.setProperty('display', 'none', 'important');
                  el.style.setProperty('height', '0px', 'important');
                  el.style.setProperty('opacity', '0', 'important');
                });
              });
            }

            setInterval(() => {
              skipYTAds();
              cosmeticBlock();
            }, 250);
          })()
        `
          )
          .catch((err) => console.error('Ad blocker script injection failed:', err))
      } catch (e) {
        // Suppress errors
      }
    })

    webview.addEventListener('did-fail-load', (e: any) => {
      if (e.isMainFrame) {
        // -3 is ERR_ABORTED (user aborted loading, ignore)
        if (e.errorCode === -3) return

        const errorHtml = getErrorPageHtml(e.validatedURL, e.errorDescription, e.errorCode)
        const dataUrl = `data:text/html;charset=utf-8,${encodeURIComponent(errorHtml)}`
        webview.loadURL(dataUrl)
      }
    })
  }

  // Trigger Reading Mode
  const handleToggleReadingMode = async () => {
    if (store.readingModeActive) {
      store.setReadingMode(false)
      return
    }

    const webview = webviewRefs.current[activeTabId || '']
    if (webview) {
      try {
        // Inject JS to fetch page content heuristics
        const parsed = await webview.executeJavaScript(`
          (function() {
            const title = document.title;
            
            // Look for common text nodes
            const article = document.querySelector('article') || document.querySelector('[role="main"]') || document.querySelector('.main') || document.body;
            const paragraphs = Array.from(article.querySelectorAll('p')).map(p => p.innerText.trim()).filter(t => t.length > 30);
            
            return {
              title: title,
              body: paragraphs.slice(0, 15).join('\\n\\n')
            };
          })()
        `)

        if (parsed && parsed.body) {
          store.setReadingMode(true, parsed)
        } else {
          alert('Could not parse clean reading text from this page.')
        }
      } catch (e) {
        console.error('Reading mode JS injection failure:', e)
      }
    }
  }

  // Source code viewer
  const handleViewSource = async () => {
    if (store.viewSourceActive) {
      store.setViewSource(false)
      return
    }

    const webview = webviewRefs.current[activeTabId || '']
    if (webview) {
      try {
        const src = await webview.executeJavaScript(`document.documentElement.outerHTML`)
        setSourceCode(src)
        store.setViewSource(true)
      } catch (e) {
        setSourceCode('Failed to fetch page source code.')
        store.setViewSource(true)
      }
    }
  }

  // Handle Workspace creation
  const handleCreateWorkspace = (e: React.FormEvent) => {
    e.preventDefault()
    if (!newWorkspaceName.trim()) return
    store.createWorkspace(newWorkspaceName)
    setNewWorkspaceName('')
    setShowWorkspaceMenu(false)
  }

  return (
    <div className={`app-container ${themeClass}`}>
      {/* ============================================================== */}
      {/* 1. SIDEBAR SWITCH STRIP                                        */}
      {/* ============================================================== */}
      <div className="sidebar-switch-strip">
        {/* Profile Lock Avatar */}
        <div
          className="sidebar-switch-btn"
          title="Switch / Lock Profile"
          onClick={() => setActiveProfile(null)}
        >
          <AvatarIcon name={activeProfile?.avatar || 'User'} size={20} />
          <div
            style={{
              position: 'absolute',
              bottom: 2,
              right: 2,
              width: 8,
              height: 8,
              borderRadius: '50%',
              backgroundColor: '#ef233c',
              border: '1.5px solid var(--bg-secondary)'
            }}
          />
        </div>

        <div
          style={{
            width: '60%',
            height: 1,
            backgroundColor: 'var(--border-color)',
            margin: '4px 0'
          }}
        />

        {/* Workspace Quick Switch */}
        <div
          className={`sidebar-switch-btn ${showWorkspaceMenu ? 'active' : ''}`}
          title="Workspaces"
          onClick={() => setShowWorkspaceMenu(!showWorkspaceMenu)}
        >
          <Terminal size={20} />
        </div>

        {/* Navigation Sidebar Panel Switches */}
        {[
          { id: 'notes', name: 'Markdown Notes', icon: FileText },
          { id: 'bookmarks', name: 'Bookmarks', icon: BookOpen },
          { id: 'downloads', name: 'Download Manager', icon: Download },
          { id: 'history', name: 'History Logs', icon: RotateCw },
          { id: 'passwords', name: 'Encrypted Passwords', icon: Key },
          { id: 'adblock', name: 'Shield AdBlocker', icon: Shield },
          { id: 'theme', name: 'Theme Engine Studio', icon: Sun },
          { id: 'profile', name: 'Profile Settings', icon: User }
        ].map((item: any) => {
          const Icon = item.icon
          const isActive = activeSidebarTab === item.id

          return (
            <div
              key={item.id}
              className={`sidebar-switch-btn ${isActive ? 'active' : ''}`}
              title={item.name}
              onClick={() => setSidebarTab(isActive ? 'none' : item.id)}
            >
              <Icon size={20} />
              {item.id === 'adblock' && store.adBlockedCount > 0 && (
                <span
                  style={{
                    position: 'absolute',
                    top: -4,
                    right: -4,
                    background: '#ef233c',
                    color: '#ffffff',
                    borderRadius: 10,
                    padding: '1px 5px',
                    fontSize: 9,
                    fontWeight: 700
                  }}
                >
                  {store.adBlockedCount}
                </span>
              )}
            </div>
          )
        })}

        <div style={{ flex: 1 }} />

        {/* devtools and log out */}
        <div
          className="sidebar-switch-btn"
          title="Inspect UI DevTools"
          onClick={() => window.api.openDevTools(activeProfileId || 'default')}
        >
          <Code size={18} />
        </div>
        <div
          className="sidebar-switch-btn"
          title="Log Out Profile"
          style={{ color: '#ef233c' }}
          onClick={() => setActiveProfile(null)}
        >
          <LogOut size={18} />
        </div>
      </div>

      {/* ============================================================== */}
      {/* 2. SIDEBAR WORKSPACE DROPDOWN POPUP                            */}
      {/* ============================================================== */}
      {showWorkspaceMenu && (
        <div
          className="sidebar-panel"
          style={{ width: 250, position: 'absolute', left: 64, top: 0, height: '100%', zIndex: 20 }}
        >
          <div className="sidebar-header">
            <h4
              style={{
                fontSize: 13,
                fontWeight: 700,
                letterSpacing: 0.5,
                textTransform: 'uppercase',
                color: 'var(--text-secondary)',
                fontFamily: 'var(--font-mono)'
              }}
            >
              Workspaces
            </h4>
            <button className="nav-circle-btn" onClick={() => setShowWorkspaceMenu(false)}>
              <X size={14} />
            </button>
          </div>
          <div
            className="sidebar-content scroller"
            style={{ display: 'flex', flexDirection: 'column', gap: 10 }}
          >
            {userWorkspaces.map((w: any) => {
              const activeTabsCount = db.tabs.filter((t: any) => t.workspaceId === w.id).length
              return (
                <div
                  key={w.id}
                  onClick={() => {
                    setActiveWorkspace(w.id)
                    setShowWorkspaceMenu(false)
                  }}
                  style={{
                    padding: '10px 12px',
                    borderRadius: 8,
                    cursor: 'pointer',
                    backgroundColor:
                      activeWorkspaceId === w.id ? 'var(--bg-accent)' : 'var(--bg-tertiary)',
                    color:
                      activeWorkspaceId === w.id ? 'var(--text-accent)' : 'var(--text-primary)',
                    fontWeight: activeWorkspaceId === w.id ? 600 : 400,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 10,
                    fontSize: 13,
                    border: '1px solid var(--border-color)',
                    transition: 'all 0.2s',
                    position: 'relative'
                  }}
                  className="notes-list-item"
                >
                  <span
                    style={{
                      fontSize: 12,
                      fontFamily: 'var(--font-mono)',
                      color: activeWorkspaceId === w.id ? 'var(--text-accent)' : 'var(--bg-accent)',
                      fontWeight: 700
                    }}
                  >
                    &gt;_
                  </span>

                  <span
                    style={{
                      flex: 1,
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis'
                    }}
                  >
                    {w.name}
                  </span>

                  <span
                    style={{
                      fontSize: 9,
                      fontFamily: 'var(--font-mono)',
                      backgroundColor:
                        activeWorkspaceId === w.id
                          ? 'rgba(255,255,255,0.2)'
                          : 'var(--bg-secondary)',
                      color: activeWorkspaceId === w.id ? '#ffffff' : 'var(--text-secondary)',
                      padding: '2px 6px',
                      borderRadius: 4,
                      fontWeight: 600
                    }}
                  >
                    {activeTabsCount} {activeTabsCount === 1 ? 'tab' : 'tabs'}
                  </span>

                  {userWorkspaces.length > 1 && (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation()
                        if (
                          confirm(
                            `Are you sure you want to delete workspace "${w.name}"? This will close all its tabs!`
                          )
                        ) {
                          store.deleteWorkspace(w.id)
                        }
                      }}
                      style={{
                        background: 'none',
                        border: 'none',
                        color: activeWorkspaceId === w.id ? '#ffffff' : '#ef233c',
                        cursor: 'pointer',
                        padding: 2,
                        display: 'flex',
                        alignItems: 'center',
                        opacity: 0.7,
                        transition: 'all 0.2s'
                      }}
                      className="tab-close-btn"
                      title="Delete Workspace"
                    >
                      <Trash2 size={12} />
                    </button>
                  )}
                </div>
              )
            })}

            <form
              onSubmit={handleCreateWorkspace}
              style={{
                borderTop: '1px solid var(--border-color)',
                paddingTop: 12,
                marginTop: 10,
                display: 'flex',
                flexDirection: 'column',
                gap: 8
              }}
            >
              <input
                type="text"
                placeholder="New workspace name..."
                className="premium-input"
                style={{ height: 32, fontSize: 12 }}
                value={newWorkspaceName}
                onChange={(e) => setNewWorkspaceName(e.target.value)}
              />
              <button
                type="submit"
                className="premium-btn"
                style={{ padding: '8px 12px', fontSize: 11, fontWeight: 700 }}
              >
                Create Space
              </button>
            </form>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* 3. SIDEBAR DETAILS ACTIVE PANEL                                */}
      {/* ============================================================== */}
      <SidebarPanel
        currentTabUrl={activeTabObj?.url || ''}
        currentTabTitle={activeTabObj?.title || ''}
      />

      {/* ============================================================== */}
      {/* 4. MAIN BROWSER VIEWPORT CONTAINER                            */}
      {/* ============================================================== */}
      <div className="main-browser-area">
        {showSplitSelector && (
          <div
            style={{
              position: 'absolute',
              right: 16,
              top: 54,
              width: 320,
              background: 'var(--bg-secondary)',
              border: '1px solid var(--border-color)',
              borderRadius: 12,
              boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.4), 0 8px 10px -6px rgba(0, 0, 0, 0.4)',
              zIndex: 100,
              display: 'flex',
              flexDirection: 'column',
              overflow: 'hidden',
              backdropFilter: 'blur(12px)',
            }}
          >
            {/* Panel Header */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 16px', borderBottom: '1px solid var(--border-color)' }}>
              <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: 0.5, textTransform: 'uppercase', fontFamily: 'var(--font-mono)', color: 'var(--text-secondary)' }}>
                Split Screen View Setup
              </span>
              <button
                onClick={() => setShowSplitSelector(false)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)', display: 'flex', padding: 4, borderRadius: '50%' }}
                className="tab-close-btn"
              >
                <X size={14} />
              </button>
            </div>

            {/* Panel Content / Tab List */}
            <div style={{ padding: '6px 0', maxHeight: 260, overflowY: 'auto' }} className="scroller">
              {workspaceTabs.filter((t: Tab) => t.id !== activeTabId).length === 0 ? (
                <div style={{ padding: '20px 16px', textAlign: 'center', fontSize: 11, color: 'var(--text-secondary)', fontFamily: 'var(--font-sans)' }}>
                  No other open tabs in this workspace to pair.
                </div>
              ) : (
                workspaceTabs
                  .filter((t: Tab) => t.id !== activeTabId)
                  .map((tab: Tab) => {
                    const isCurrentlySplit = splitTabId === tab.id
                    return (
                      <div
                        key={tab.id}
                        onClick={() => {
                          setSplitTabId(tab.id)
                          setShowSplitSelector(false)
                        }}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: 10,
                          padding: '10px 16px',
                          cursor: 'pointer',
                          backgroundColor: isCurrentlySplit ? 'rgba(131,56,236,0.1)' : 'transparent',
                          transition: 'background 0.2s',
                        }}
                        className="notes-list-item"
                      >
                        {/* Tab Icon */}
                        {tab.isPrivate ? (
                          <Shield size={14} style={{ color: '#2ec4b6', flexShrink: 0 }} />
                        ) : (
                          <Globe size={14} style={{ color: 'var(--text-secondary)', flexShrink: 0 }} />
                        )}
                        {/* Title & URL */}
                        <div style={{ display: 'flex', flexDirection: 'column', flex: 1, overflow: 'hidden' }}>
                          <span style={{ fontSize: 12, fontWeight: isCurrentlySplit ? 600 : 400, color: 'var(--text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                            {tab.title || 'Untitled Tab'}
                          </span>
                          <span style={{ fontSize: 9, color: 'var(--text-secondary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', opacity: 0.8 }}>
                            {tab.url}
                          </span>
                        </div>
                        {/* Active check / badge */}
                        {isCurrentlySplit && (
                          <span style={{ fontSize: 8, fontWeight: 800, color: 'var(--bg-accent)', background: 'rgba(131,56,236,0.15)', padding: '2px 6px', borderRadius: 4, fontFamily: 'var(--font-mono)' }}>
                            SPLIT
                          </span>
                        )}
                      </div>
                    )
                  })
              )}
            </div>

            {/* Actions Footer */}
            <div style={{ padding: 12, display: 'flex', flexDirection: 'column', gap: 8, borderTop: '1px solid var(--border-color)', backgroundColor: 'var(--bg-tertiary)' }}>
              <button
                onClick={() => {
                  const prevActive = activeTabId
                  addTab('New Tab', 'aether://home')
                  if (prevActive) {
                    setSplitTabId(prevActive)
                  }
                  setShowSplitSelector(false)
                }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 6,
                  padding: '8px 12px',
                  borderRadius: 8,
                  border: '1px dashed var(--border-color)',
                  background: 'var(--bg-secondary)',
                  color: 'var(--text-primary)',
                  fontSize: 11,
                  fontWeight: 600,
                  cursor: 'pointer',
                  width: '100%',
                  transition: 'all 0.2s',
                }}
                className="notes-list-item"
              >
                <Plus size={12} />
                Split with a New Tab
              </button>

              {isSplitActive && (
                <button
                  onClick={() => {
                    setSplitTabId(null)
                    setShowSplitSelector(false)
                  }}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 6,
                    padding: '8px 12px',
                    borderRadius: 8,
                    border: 'none',
                    background: 'rgba(239, 35, 60, 0.12)',
                    color: '#ef233c',
                    fontSize: 11,
                    fontWeight: 700,
                    cursor: 'pointer',
                    width: '100%',
                    transition: 'background 0.2s',
                  }}
                >
                  <X size={12} />
                  Exit Split View
                </button>
              )}
            </div>
          </div>
        )}
        {/* Top Navbar */}
        <div className="top-navigation-bar" style={{ zIndex: 100 }}>
          <button className="nav-circle-btn" onClick={handleGoBack} title="Back">
            <ArrowLeft size={16} />
          </button>
          <button className="nav-circle-btn" onClick={handleGoForward} title="Forward">
            <ArrowRight size={16} />
          </button>
          <button className="nav-circle-btn" onClick={handleReload} title="Reload">
            <RotateCw size={15} />
          </button>

          <form onSubmit={handleAddressSubmit} className="address-bar-container" style={{ position: 'relative' }}>
            <Shield
              size={14}
              style={{ color: store.adBlockedCount > 0 ? '#2ec4b6' : 'var(--text-secondary)' }}
            />
            <input
              id="address-bar"
              type="text"
              className="address-input"
              value={addressInput}
              onChange={(e) => {
                setAddressInput(e.target.value)
                setShowTopSuggestions(true)
              }}
              onFocus={(e) => {
                e.target.select()
                setShowTopSuggestions(true)
              }}
              onBlur={() => {
                // Short delay to allow clicking on the suggestions
                setTimeout(() => setShowTopSuggestions(false), 200)
              }}
              onKeyDown={handleTopKeyDown}
            />

            {/* Top Search Suggestions Dropdown Overlay */}
            {showTopSuggestions && topSuggestions.length > 0 && (
              <div
                style={{
                  position: 'absolute',
                  top: 40,
                  left: 0,
                  right: 0,
                  backgroundColor: 'rgba(30, 30, 32, 0.95)',
                  backdropFilter: 'blur(16px)',
                  border: '1px solid rgba(255, 255, 255, 0.08)',
                  borderRadius: 10,
                  boxShadow: '0 12px 40px rgba(0, 0, 0, 0.6), inset 0 1px 0 rgba(255, 255, 255, 0.05)',
                  zIndex: 99999,
                  overflow: 'hidden',
                  display: 'flex',
                  flexDirection: 'column',
                  padding: '6px 0'
                }}
              >
                {/* Header Section */}
                <div
                  style={{
                    padding: '8px 16px 4px 16px',
                    fontSize: 9,
                    fontWeight: 700,
                    color: 'var(--text-secondary)',
                    letterSpacing: 1.2,
                    fontFamily: 'var(--font-mono)',
                    textTransform: 'uppercase',
                    opacity: 0.6,
                    borderBottom: '1px solid rgba(255, 255, 255, 0.04)',
                    marginBottom: 4,
                    textAlign: 'left'
                  }}
                >
                  Search Suggestions
                </div>

                {topSuggestions.map((suggestion, index) => {
                  const isSelected = topSelectedIndex === index
                  return (
                    <div
                      key={suggestion}
                      onClick={() => {
                        setAddressInput(suggestion)
                        let url = suggestion.trim()
                        if (!url.startsWith('http://') && !url.startsWith('https://')) {
                          if (url.includes('.') && !url.includes(' ')) {
                            url = 'https://' + url
                          } else {
                            url = store.searchShieldEnabled
                              ? 'https://www.startpage.com/sp/search?query=' + encodeURIComponent(url)
                              : 'https://www.google.com/search?q=' + encodeURIComponent(url)
                          }
                        }
                        updateTabUrl(activeTabId || '', url, url)
                        setAddressInput(url)
                        const webview = webviewRefs.current[activeTabId || '']
                        if (webview) {
                          webview.src = url
                        }
                        setShowTopSuggestions(false)
                      }}
                      style={{
                        padding: '10px 16px',
                        cursor: 'pointer',
                        fontSize: 12.5,
                        fontFamily: 'var(--font-mono)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        gap: 12,
                        backgroundColor: isSelected ? 'rgba(131, 56, 236, 0.15)' : 'transparent',
                        color: isSelected ? 'var(--bg-accent)' : 'var(--text-primary)',
                        transition: 'all 0.15s cubic-bezier(0.4, 0, 0.2, 1)',
                        position: 'relative',
                        borderLeft: isSelected ? '3px solid var(--bg-accent)' : '3px solid transparent',
                        textAlign: 'left'
                      }}
                      onMouseEnter={() => setTopSelectedIndex(index)}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <Search
                          size={13}
                          style={{
                            color: isSelected ? 'var(--bg-accent)' : 'var(--text-secondary)',
                            opacity: isSelected ? 1 : 0.6,
                            transition: 'color 0.15s'
                          }}
                        />
                        <span>{suggestion}</span>
                      </div>

                      {/* Interactive hint on selection */}
                      {isSelected && (
                        <span
                          style={{
                            fontSize: 9,
                            fontFamily: 'var(--font-mono)',
                            color: 'rgba(255, 255, 255, 0.35)',
                            background: 'rgba(255, 255, 255, 0.05)',
                            padding: '2px 6px',
                            borderRadius: 4,
                            pointerEvents: 'none'
                          }}
                        >
                          enter ↵
                        </span>
                      )}
                    </div>
                  )
                })}

                {/* Footer Controls */}
                <div
                  style={{
                    padding: '8px 16px 4px 16px',
                    fontSize: 8.5,
                    fontFamily: 'var(--font-mono)',
                    color: 'rgba(255, 255, 255, 0.3)',
                    display: 'flex',
                    justifyContent: 'space-between',
                    borderTop: '1px solid rgba(255, 255, 255, 0.04)',
                    marginTop: 4,
                    paddingTop: 8
                  }}
                >
                  <span>↑↓ Navigate</span>
                  <span>Esc Close</span>
                </div>
              </div>
            )}
            {activeTabObj?.url.startsWith('https://') && (
              <span
                style={{
                  fontSize: 10,
                  color: '#2ec4b6',
                  padding: '2px 4px',
                  background: 'rgba(46, 196, 182, 0.15)',
                  borderRadius: 3,
                  fontWeight: 700,
                  flexShrink: 0
                }}
              >
                SSL
              </span>
            )}
            {/* Zoom level badge */}
            {currentZoom !== 1 && (
              <button
                type="button"
                title="Reset zoom (Cmd+E)"
                onClick={() => {
                  if (activeTabId) {
                    setTabZoom(activeTabId, 1)
                    const webview = webviewRefs.current[activeTabId]
                    if (webview) webview.setZoomFactor(1)
                  }
                }}
                style={{
                  fontSize: 10,
                  color: 'var(--bg-accent)',
                  padding: '2px 6px',
                  background: 'rgba(131,56,236,0.15)',
                  borderRadius: 3,
                  fontWeight: 700,
                  border: 'none',
                  cursor: 'pointer',
                  flexShrink: 0,
                  fontFamily: 'var(--font-mono)'
                }}
              >
                {zoomPct}%
              </button>
            )}
          </form>

          {/* Search Shield (Anonymous Search) */}
          <button
            className="nav-circle-btn"
            title={store.searchShieldEnabled ? "Search Shield: ACTIVE (Google results via anonymous proxy)" : "Search Shield: INACTIVE"}
            style={{
              color: store.searchShieldEnabled ? '#2ec4b6' : 'var(--text-secondary)',
              position: 'relative'
            }}
            onClick={store.toggleSearchShield}
          >
            <Shield size={16} />
            {store.searchShieldEnabled && (
              <span style={{
                position: 'absolute',
                top: 4,
                right: 4,
                width: 6,
                height: 6,
                borderRadius: '50%',
                backgroundColor: '#2ec4b6',
                boxShadow: '0 0 8px #2ec4b6'
              }} />
            )}
          </button>

          {/* Reading mode controls */}
          <button
            className="nav-circle-btn"
            title="Reading Mode"
            style={{ color: store.readingModeActive ? 'var(--bg-accent)' : 'inherit' }}
            onClick={handleToggleReadingMode}
          >
            <BookOpen size={16} />
          </button>

          {/* Raw source viewer */}
          <button
            className="nav-circle-btn"
            title="View HTML Source Code"
            style={{ color: store.viewSourceActive ? 'var(--bg-accent)' : 'inherit' }}
            onClick={handleViewSource}
          >
            <Code size={16} />
          </button>

          {/* Split screen viewer */}
          <button
            className="nav-circle-btn"
            title={isSplitActive ? "Exit Split View" : "Split View Tabs"}
            style={{ color: isSplitActive ? 'var(--bg-accent)' : 'inherit' }}
            onClick={handleToggleSplit}
          >
            <Columns2 size={16} />
          </button>

          <div style={{ width: 1, height: 20, backgroundColor: 'var(--border-color)' }} />

          {/* Find in Page Bar */}
          {showFindBar && (
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                padding: '6px 12px',
                background: 'var(--bg-secondary)',
                borderBottom: '1px solid var(--border-color)'
              }}
            >
              <input
                id="find-bar-input"
                type="text"
                placeholder="Find in page…"
                className="address-input"
                style={{ flex: 1, height: 30, fontSize: 13, maxWidth: 320 }}
                value={findQuery}
                onChange={(e) => {
                  const q = e.target.value
                  setFindQuery(q)
                  const webview = webviewRefs.current[activeTabId || '']
                  if (webview && q) {
                    webview.findInPage(q, { findNext: false })
                    webview.addEventListener('found-in-page', (_ev: any, result: any) => {
                      setFindInfo(`${result.activeMatchOrdinal} / ${result.matches}`)
                    }, { once: true })
                  } else if (webview) {
                    webview.stopFindInPage('clearSelection')
                    setFindInfo('')
                  }
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    const webview = webviewRefs.current[activeTabId || '']
                    if (webview && findQuery) webview.findInPage(findQuery, { findNext: true })
                  }
                }}
              />
              {findInfo && (
                <span style={{ fontSize: 11, color: 'var(--text-secondary)', fontFamily: 'var(--font-mono)', whiteSpace: 'nowrap' }}>
                  {findInfo}
                </span>
              )}
              <button className="nav-circle-btn" style={{ width: 26, height: 26 }}
                title="Previous match"
                onClick={() => {
                  const webview = webviewRefs.current[activeTabId || '']
                  if (webview && findQuery) webview.findInPage(findQuery, { forward: false, findNext: true })
                }}
              >
                <ArrowLeft size={13} />
              </button>
              <button className="nav-circle-btn" style={{ width: 26, height: 26 }}
                title="Next match"
                onClick={() => {
                  const webview = webviewRefs.current[activeTabId || '']
                  if (webview && findQuery) webview.findInPage(findQuery, { forward: true, findNext: true })
                }}
              >
                <ArrowRight size={13} />
              </button>
              <button className="nav-circle-btn" style={{ width: 26, height: 26, color: '#ef233c' }}
                title="Close"
                onClick={() => {
                  setShowFindBar(false)
                  const webview = webviewRefs.current[activeTabId || '']
                  if (webview) webview.stopFindInPage('clearSelection')
                  setFindQuery('')
                  setFindInfo('')
                }}
              >
                <X size={13} />
              </button>
            </div>
          )}

          {/* Layout horizontal/vertical tabs selector */}

          <button
            className="nav-circle-btn"
            title="Toggle Tab Bar Layout"
            onClick={() => setTabLayout(tabLayout === 'horizontal' ? 'vertical' : 'horizontal')}
          >
            {tabLayout === 'horizontal' ? <AlignJustify size={16} /> : <AlignLeft size={16} />}
          </button>
        </div>

        {/* Tab layouts and Webviews wrapper */}
        <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
          {/* Vertical Tabs Strip (Option) */}
          {tabLayout === 'vertical' && (
            <div className="tab-bar-vertical scroller">
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  marginBottom: 8
                }}
              >
                <span
                  style={{
                    fontSize: 11,
                    fontWeight: 600,
                    color: 'var(--text-secondary)',
                    textTransform: 'uppercase'
                  }}
                >
                  Vertical Tabs
                </span>
                <button
                  className="nav-circle-btn"
                  style={{ width: 24, height: 24 }}
                  onClick={() => addTab('New Tab', 'aether://home')}
                >
                  <Plus size={14} />
                </button>
              </div>
              {sortedWorkspaceTabs.map((tab: any) => (
                <div
                  key={tab.id}
                  className={`vertical-tab ${tab.active ? 'active' : ''}`}
                  onClick={() => setActiveTab(tab.id)}
                  style={{ paddingRight: 4 }}
                >
                  {/* Favicon */}
                  {tab.isPrivate ? (
                    <Shield size={12} style={{ color: '#ff006e', flexShrink: 0 }} />
                  ) : tab.favicon ? (
                    <img
                      src={tab.favicon}
                      alt=""
                      width={12}
                      height={12}
                      style={{ borderRadius: 2, flexShrink: 0, objectFit: 'contain' }}
                      onError={(e) => { (e.target as HTMLImageElement).style.display = 'none' }}
                    />
                  ) : (
                    <Globe size={12} style={{ flexShrink: 0, opacity: 0.8 }} />
                  )}
                  {tab.isPinned && <Pin size={10} style={{ opacity: 0.8, flexShrink: 0, marginLeft: 4 }} />}
                  <span className="tab-title-text" style={{ marginLeft: 6 }}>{tab.title}</span>
                  <button
                    className="tab-close-btn"
                    title={tab.isPinned ? 'Unpin' : 'Pin'}
                    style={{ marginLeft: 'auto', opacity: 0.5, display: 'flex', alignItems: 'center' }}
                    onClick={(e) => { e.stopPropagation(); store.togglePinTab(tab.id) }}
                  >
                    {tab.isPinned ? <PinOff size={10} /> : <Pin size={10} />}
                  </button>
                  <button
                    className="tab-close-btn"
                    onClick={(e) => {
                      e.stopPropagation()
                      handleCloseTab(tab.id)
                    }}
                  >
                    <X size={10} />
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* WebView and Horizontal Bar Grid */}
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
            {/* Horizontal Tabs Strip with actions toolbar (Default) */}
            {tabLayout === 'horizontal' && (
              <div style={{ display: 'flex', alignItems: 'center', background: 'var(--bg-secondary)', borderBottom: '1px solid var(--border-color)', height: 'var(--tabbar-h)', position: 'relative', zIndex: 15 }}>
                <div className="tab-bar-horizontal" style={{ flex: 1, borderBottom: 'none', padding: '0 0 0 16px' }}>
                  {sortedWorkspaceTabs.map((tab: any) => {
                    const isPinned = tab.isPinned
                    return (
                      <div
                        key={tab.id}
                        className={`horizontal-tab ${tab.active ? 'active' : ''} ${isPinned ? 'pinned' : ''}`}
                        onClick={() => setActiveTab(tab.id)}
                        style={{
                          width: isPinned ? '36px' : 'auto',
                          minWidth: isPinned ? '36px' : '110px',
                          maxWidth: isPinned ? '36px' : '180px',
                          justifyContent: isPinned ? 'center' : 'flex-start',
                          padding: isPinned ? '0' : '0 10px 0 12px'
                        }}
                        title={tab.title}
                      >
                        {/* Favicon / Hover Unpin Container */}
                        <div
                          style={{
                            position: 'relative',
                            width: 13,
                            height: 13,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            flexShrink: 0
                          }}
                          className="tab-favicon-container"
                        >
                          {tab.isPrivate ? (
                            <Shield size={13} className="tab-favicon-img" style={{ color: '#ff006e', flexShrink: 0 }} />
                          ) : tab.favicon ? (
                            <img
                              src={tab.favicon}
                              alt=""
                              width={13}
                              height={13}
                              className="tab-favicon-img"
                              style={{ borderRadius: 2, flexShrink: 0, objectFit: 'contain' }}
                              onError={(e) => {
                                ;(e.target as HTMLImageElement).style.display = 'none'
                              }}
                            />
                          ) : (
                            <Globe size={13} className="tab-favicon-img" style={{ flexShrink: 0, opacity: 0.8 }} />
                          )}
                          {isPinned && (
                            <button
                              className="tab-pinned-unpin-btn"
                              title="Unpin Tab"
                              onClick={(e) => {
                                e.stopPropagation()
                                store.togglePinTab(tab.id)
                              }}
                              style={{
                                position: 'absolute',
                                top: 0,
                                left: 0,
                                width: '100%',
                                height: '100%',
                                background: 'var(--bg-tertiary)',
                                border: 'none',
                                borderRadius: 2,
                                display: 'none',
                                alignItems: 'center',
                                justifyContent: 'center',
                                cursor: 'pointer',
                                color: 'var(--bg-accent)',
                                padding: 0
                              }}
                            >
                              <PinOff size={10} />
                            </button>
                          )}
                        </div>

                        {/* Title text - Hidden on pinned tabs */}
                        {!isPinned && (
                          <span className="tab-title-text" style={{ marginLeft: 6 }}>
                            {tab.title}
                          </span>
                        )}

                        {/* Action buttons (only for unpinned tabs) */}
                        {!isPinned && (
                          <>
                            {/* Pin Button */}
                            <button
                              className="tab-action-btn"
                              title="Pin Tab"
                              style={{ marginLeft: 'auto', marginRight: 2 }}
                              onClick={(e) => {
                                e.stopPropagation()
                                store.togglePinTab(tab.id)
                              }}
                            >
                              <Pin size={10} />
                            </button>

                            {/* Close Button */}
                            <button
                              className="tab-action-btn"
                              title="Close Tab"
                              onClick={(e) => {
                                e.stopPropagation()
                                handleCloseTab(tab.id)
                              }}
                            >
                              <X size={10} />
                            </button>
                          </>
                        )}
                      </div>
                    )
                  })}

                  <button
                    className="nav-circle-btn"
                    style={{ width: 24, height: 24, alignSelf: 'center', marginLeft: 4, flexShrink: 0 }}
                    onClick={() => addTab('New Tab', 'aether://home')}
                  >
                    <Plus size={14} />
                  </button>
                </div>

                {/* Fixed Tabs Toolbar */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '0 16px 0 8px', height: '100%', flexShrink: 0, position: 'relative' }}>
                  {/* Search Open Tabs Button */}
                  <button
                    className="nav-circle-btn"
                    style={{ width: 26, height: 26 }}
                    title="Search Open Tabs"
                    onClick={() => {
                      setShowTabSearch(!showTabSearch)
                      setShowTabMenu(false)
                      setTabSearchQuery('')
                    }}
                  >
                    <Search size={14} />
                  </button>

                  {/* Quick Private Tab Button */}
                  <button
                    className="nav-circle-btn"
                    style={{ width: 26, height: 26 }}
                    title="New Private Tab"
                    onClick={() => addTab('Private Tab', 'aether://home', true)}
                  >
                    <Shield size={14} style={{ color: '#2ec4b6' }} />
                  </button>

                  {/* Tab Actions Menu Button */}
                  <button
                    className="nav-circle-btn"
                    style={{ width: 26, height: 26 }}
                    title="Tab Actions"
                    onClick={() => {
                      setShowTabMenu(!showTabMenu)
                      setShowTabSearch(false)
                    }}
                  >
                    <ChevronDown size={14} />
                  </button>

                  {/* Tab Search Overlay Popover */}
                  {showTabSearch && (
                    <div
                      style={{
                        position: 'absolute',
                        right: 16,
                        top: 36,
                        width: 280,
                        background: 'var(--bg-secondary)',
                        border: '1px solid var(--border-color)',
                        borderRadius: 8,
                        boxShadow: '0 8px 20px rgba(0,0,0,0.4)',
                        zIndex: 110,
                        padding: 8,
                        backdropFilter: 'blur(8px)',
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6, borderBottom: '1px solid var(--border-color)', paddingBottom: 6, marginBottom: 6 }}>
                        <Search size={12} style={{ color: 'var(--text-secondary)' }} />
                        <input
                          type="text"
                          placeholder="Search open tabs..."
                          style={{
                            flex: 1,
                            border: 'none',
                            background: 'transparent',
                            color: 'var(--text-primary)',
                            fontSize: 12,
                            outline: 'none',
                          }}
                          value={tabSearchQuery}
                          onChange={(e) => setTabSearchQuery(e.target.value)}
                          autoFocus
                        />
                        <button
                          onClick={() => setShowTabSearch(false)}
                          style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', padding: 2 }}
                        >
                          <X size={12} />
                        </button>
                      </div>
                      <div style={{ maxHeight: 200, overflowY: 'auto' }} className="scroller">
                        {workspaceTabs
                          .filter((t: Tab) => t.title.toLowerCase().includes(tabSearchQuery.toLowerCase()) || t.url.toLowerCase().includes(tabSearchQuery.toLowerCase()))
                          .map((t: Tab) => (
                            <div
                              key={t.id}
                              onClick={() => {
                                setActiveTab(t.id)
                                setShowTabSearch(false)
                              }}
                              style={{
                                padding: '6px 8px',
                                borderRadius: 4,
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                gap: 8,
                              }}
                              className="notes-list-item"
                            >
                              {t.isPrivate ? <Shield size={11} style={{ color: '#2ec4b6' }} /> : <Globe size={11} />}
                              <div style={{ display: 'flex', flexDirection: 'column', overflow: 'hidden', flex: 1 }}>
                                <span style={{ fontSize: 11, fontWeight: t.active ? 600 : 400, color: 'var(--text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                  {t.title}
                                </span>
                                <span style={{ fontSize: 9, color: 'var(--text-secondary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                  {t.url}
                                </span>
                              </div>
                            </div>
                          ))}
                        {workspaceTabs.filter((t: Tab) => t.title.toLowerCase().includes(tabSearchQuery.toLowerCase()) || t.url.toLowerCase().includes(tabSearchQuery.toLowerCase())).length === 0 && (
                          <div style={{ padding: '12px 8px', textAlign: 'center', fontSize: 11, color: 'var(--text-secondary)' }}>
                            No matching tabs
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Tab Actions Dropdown Menu */}
                  {showTabMenu && (
                    <div
                      style={{
                        position: 'absolute',
                        right: 16,
                        top: 36,
                        width: 240,
                        background: 'var(--bg-secondary)',
                        border: '1px solid var(--border-color)',
                        borderRadius: 12,
                        boxShadow: '0 10px 30px rgba(0,0,0,0.35)',
                        zIndex: 110,
                        padding: 6,
                        backdropFilter: 'blur(16px)',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: 2
                      }}
                    >
                      {/* 1. Reopen last closed tab */}
                      <div
                        onClick={() => {
                          if (lastClosedTabs.length > 0) {
                            handleReopenLastClosedTab()
                            setShowTabMenu(false)
                          }
                        }}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: 10,
                          padding: '8px 12px',
                          borderRadius: 8,
                          cursor: lastClosedTabs.length > 0 ? 'pointer' : 'not-allowed',
                          opacity: lastClosedTabs.length > 0 ? 1 : 0.45,
                          transition: 'all 0.2s',
                        }}
                        className={lastClosedTabs.length > 0 ? "notes-list-item" : ""}
                      >
                        <RotateCcw size={14} style={{ color: 'var(--text-secondary)', flexShrink: 0 }} />
                        <div style={{ display: 'flex', flexDirection: 'column', flex: 1, overflow: 'hidden' }}>
                          <span style={{ fontSize: 12, fontWeight: 500, color: 'var(--text-primary)' }}>Reopen Closed Tab</span>
                          {lastClosedTabs.length > 0 && (
                            <span style={{ fontSize: 9, color: 'var(--text-secondary)', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap', marginTop: 1 }}>
                              {lastClosedTabs[0].title}
                            </span>
                          )}
                        </div>
                        <span style={{ fontSize: 9, fontFamily: 'var(--font-mono)', color: 'var(--text-secondary)', opacity: 0.7, padding: '1px 4px', background: 'var(--bg-tertiary)', borderRadius: 4 }}>
                          ⌘⇧T
                        </span>
                      </div>

                      <div style={{ height: 1, backgroundColor: 'var(--border-color)', margin: '4px 6px' }} />

                      {/* 2. Close Other Tabs */}
                      <div
                        onClick={() => {
                          handleCloseOtherTabs()
                          setShowTabMenu(false)
                        }}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: 10,
                          padding: '8px 12px',
                          borderRadius: 8,
                          cursor: 'pointer',
                          transition: 'all 0.2s',
                        }}
                        className="notes-list-item"
                      >
                        <X size={14} style={{ color: 'var(--text-secondary)', flexShrink: 0 }} />
                        <span style={{ fontSize: 12, fontWeight: 500, color: 'var(--text-primary)', flex: 1 }}>
                          Close Other Tabs
                        </span>
                      </div>

                      {/* 3. Close All Tabs */}
                      <div
                        onClick={() => {
                          handleCloseAllTabs()
                          setShowTabMenu(false)
                        }}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: 10,
                          padding: '8px 12px',
                          borderRadius: 8,
                          cursor: 'pointer',
                          transition: 'all 0.2s',
                        }}
                        className="notes-list-item"
                      >
                        <Trash2 size={14} style={{ color: '#ef233c', flexShrink: 0 }} />
                        <span style={{ fontSize: 12, fontWeight: 500, color: '#ef233c', flex: 1 }}>
                          Close All Tabs
                        </span>
                      </div>

                      <div style={{ height: 1, backgroundColor: 'var(--border-color)', margin: '4px 6px' }} />

                      {/* 4. Sort Tabs by Title */}
                      <div
                        onClick={() => {
                          handleSortTabs('title')
                          setShowTabMenu(false)
                        }}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: 10,
                          padding: '8px 12px',
                          borderRadius: 8,
                          cursor: 'pointer',
                          transition: 'all 0.2s',
                        }}
                        className="notes-list-item"
                      >
                        <ArrowUpDown size={14} style={{ color: 'var(--text-secondary)', flexShrink: 0 }} />
                        <span style={{ fontSize: 12, fontWeight: 500, color: 'var(--text-primary)', flex: 1 }}>
                          Sort Tabs by Title
                        </span>
                      </div>

                      {/* 5. Sort Tabs by URL */}
                      <div
                        onClick={() => {
                          handleSortTabs('url')
                          setShowTabMenu(false)
                        }}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: 10,
                          padding: '8px 12px',
                          borderRadius: 8,
                          cursor: 'pointer',
                          transition: 'all 0.2s',
                        }}
                        className="notes-list-item"
                      >
                        <Globe size={14} style={{ color: 'var(--text-secondary)', flexShrink: 0 }} />
                        <span style={{ fontSize: 12, fontWeight: 500, color: 'var(--text-primary)', flex: 1 }}>
                          Sort Tabs by URL
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Render webviews with display:none for hidden running pages */}
            <div className="webview-container" ref={containerRef}>
              {(() => {
                const visibleTabs = workspaceTabs.filter((t: Tab) => t.id === activeTabId || (isSplitActive && t.id === splitTabId))
                const elements: React.ReactNode[] = []

                workspaceTabs.forEach((tab: Tab) => {
                  const isLoaded = loadedTabIds.includes(tab.id)
                  if (!isLoaded) return

                  const isHome =
                    tab.url === 'aether://home' || tab.url === 'about:blank' || tab.url === ''

                  const isLeftSplitPane = isSplitActive && visibleTabs[0]?.id === tab.id
                  const isRightSplitPane = isSplitActive && visibleTabs[1]?.id === tab.id

                  let flexStyle = '1 1 0%'
                  if (isSplitActive) {
                    if (isLeftSplitPane) {
                      flexStyle = `${splitRatio} 1 0%`
                    } else if (isRightSplitPane) {
                      flexStyle = `${1 - splitRatio} 1 0%`
                    }
                  }

                  const paneEl = (
                    <div
                      key={tab.id}
                      onMouseDownCapture={() => {
                        if (isSplitActive && tab.id !== activeTabId) {
                          const prevActive = activeTabId
                          store.setActiveTab(tab.id)
                          setSplitTabId(prevActive)
                        }
                      }}
                      style={{
                        display: activeTabId === tab.id || (isSplitActive && splitTabId === tab.id) ? 'flex' : 'none',
                        flex: flexStyle,
                        height: '100%',
                        flexDirection: 'column',
                        overflow: 'hidden',
                        boxShadow: isSplitActive && activeTabId === tab.id ? 'inset 0 0 0 2px var(--bg-accent)' : 'none',
                        position: 'relative',
                        pointerEvents: isResizing ? 'none' : 'auto'
                      }}
                    >
                      {isHome ? (
                        <StartPage tabId={tab.id} />
                      ) : (
                        <webview
                          ref={(ref) => setupWebviewListeners(tab.id, ref)}
                          src={tab.url}
                          partition={tab.isPrivate ? `persist:private-${tab.id}` : `persist:${activeProfileId}`} // Profile or private isolated session cookies
                          allowpopups={true}
                        />
                      )}
                    </div>
                  )

                  elements.push(paneEl)

                  if (isSplitActive && isLeftSplitPane) {
                    elements.push(
                      <div
                        key="split-resizer"
                        onMouseDown={handleResizeMouseDown}
                        style={{
                          width: 8,
                          height: '100%',
                          cursor: 'col-resize',
                          flexShrink: 0,
                          zIndex: 20,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          backgroundColor: isResizing ? 'rgba(131,56,236,0.1)' : 'transparent',
                          transition: 'background-color 0.2s',
                          margin: '0 -4px'
                        }}
                      >
                        <div
                          style={{
                            width: 2,
                            height: '100%',
                            backgroundColor: isResizing ? 'var(--bg-accent)' : 'var(--border-color)',
                            transition: 'background-color 0.2s'
                          }}
                        />
                      </div>
                    )
                  }
                })

                return elements
              })()}

              {/* ============================================================== */}
              {/* 5. READING MODE ARTICLE OVERLAY                                */}
              {/* ============================================================== */}
              {store.readingModeActive && store.readingModeContent && (
                <div className="reading-mode-overlay scroller">
                  <div className="reading-mode-article">
                    <button
                      className="premium-btn"
                      style={{
                        width: 'auto',
                        marginBottom: 24,
                        display: 'flex',
                        alignItems: 'center',
                        gap: 6
                      }}
                      onClick={() => store.setReadingMode(false)}
                    >
                      <X size={14} />
                      <span>Close Reading Mode</span>
                    </button>
                    <h1 className="reading-mode-title">{store.readingModeContent.title}</h1>
                    <div className="reading-mode-body">
                      {store.readingModeContent.body.split('\n\n').map((paragraph, index) => (
                        <p key={index}>{paragraph}</p>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* ============================================================== */}
              {/* 6. RAW SOURCE CODE VIEWER OVERLAY                              */}
              {/* ============================================================== */}
              {store.viewSourceActive && (
                <div className="code-viewer-overlay scroller">
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      borderBottom: '1px solid var(--border-color)',
                      paddingBottom: 12,
                      marginBottom: 16
                    }}
                  >
                    <div style={{ fontWeight: 600 }}>Raw HTML Source: {activeTabObj?.url}</div>
                    <button
                      className="premium-btn"
                      style={{
                        width: 'auto',
                        padding: '6px 12px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 6
                      }}
                      onClick={() => store.setViewSource(false)}
                    >
                      <X size={14} />
                      <span>Close Source Viewer</span>
                    </button>
                  </div>
                  <pre style={{ margin: 0, whiteSpace: 'pre-wrap', wordBreak: 'break-all' }}>
                    <code>{sourceCode}</code>
                  </pre>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default App
