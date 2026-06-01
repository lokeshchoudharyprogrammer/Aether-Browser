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
  Trash2
} from 'lucide-react'

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
  const [loadedTabIds, setLoadedTabIds] = useState<string[]>([])

  // Find in Page state
  const [showFindBar, setShowFindBar] = useState(false)
  const [findQuery, setFindQuery] = useState('')
  const [findInfo, setFindInfo] = useState('')

  // Custom views states
  const [sourceCode, setSourceCode] = useState('')
  const [showWorkspaceMenu, setShowWorkspaceMenu] = useState(false)
  const [newWorkspaceName, setNewWorkspaceName] = useState('')

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
    if (activeTabId && !loadedTabIds.includes(activeTabId)) {
      setLoadedTabIds([...loadedTabIds, activeTabId])
    }

    if (activeTabId && db) {
      const activeTab = db.tabs.find((t: any) => t.id === activeTabId)
      if (activeTab) {
        setAddressInput(activeTab.url)
      }
    }
  }, [activeTabId, db])

  // Register global shortcuts and window event listeners
  useEffect(() => {
    // 1. New Tab
    const cleanNewTab = window.api.onShortcut('shortcut-new-tab', () => {
      addTab('New Tab', 'aether://home')
    })

    // 2. Close Current Tab
    const cleanCloseTab = window.api.onShortcut('shortcut-close-tab', () => {
      if (activeTabId) {
        closeTab(activeTabId)
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

    // 6. Switch Workspace
    const cleanSwitchWorkspace = window.api.onShortcut('shortcut-switch-workspace', (_, num: number) => {
      const index = num - 1
      const workspaces = db?.workspaces.filter((w: any) => w.profileId === activeProfileId) || []
      if (workspaces[index]) {
        setActiveWorkspace(workspaces[index].id)
      }
    })

    // Local keydown listener for the chrome frame
    const handleKeyDown = (e: KeyboardEvent) => {
      const isMod = e.metaKey || e.ctrlKey

      // Lock Profile: Ctrl/Cmd + Shift + L
      if (isMod && e.shiftKey && e.key.toLowerCase() === 'l') {
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
      if (isMod && !e.shiftKey && e.key.toLowerCase() === 'l') {
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
          closeTab(activeTabId)
        }
        return
      }

      // Switch Workspace: Ctrl/Cmd + Shift + [1-9]
      if (isMod && e.shiftKey && /^[1-9]$/.test(e.key)) {
        e.preventDefault()
        const index = parseInt(e.key) - 1
        const workspaces = db?.workspaces.filter((w: any) => w.profileId === activeProfileId) || []
        if (workspaces[index]) {
          setActiveWorkspace(workspaces[index].id)
        }
        return
      }
      // Zoom: Cmd+= or Cmd++ (zoom in)
      if (isMod && !e.shiftKey && (e.key === '=' || e.key === '+')) {
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

      // Zoom: Cmd+- (zoom out)
      if (isMod && e.key === '-') {
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

      // Zoom: Cmd+0 (reset)
      if (isMod && e.key === '0') {
        e.preventDefault()
        if (activeTabId) {
          setTabZoom(activeTabId, 1)
          const webview = webviewRefs.current[activeTabId]
          if (webview) webview.setZoomFactor(1)
        }
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
      cleanSwitchWorkspace()
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
  const workspaceTabs = db.tabs.filter((t: any) => t.workspaceId === activeWorkspaceId)
  const activeTabObj = workspaceTabs.find((t: any) => t.id === activeTabId)

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

  // Address submission
  const handleAddressSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    let url = addressInput.trim()
    if (!url) return

    if (!url.startsWith('http://') && !url.startsWith('https://')) {
      if (url.includes('.') && !url.includes(' ')) {
        url = 'https://' + url
      } else {
        url = 'https://www.google.com/search?q=' + encodeURIComponent(url)
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

    // Clean first
    webview.removeEventListener('dom-ready', () => {})

    webview.addEventListener('dom-ready', () => {
      try {
        const url = webview.getURL()
        const title = webview.getTitle()
        updateTabUrl(id, url, title)
        addHistory(title, url)
        if (id === activeTabId) {
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
        {/* Top Navbar */}
        <div className="top-navigation-bar">
          <button className="nav-circle-btn" onClick={handleGoBack} title="Back">
            <ArrowLeft size={16} />
          </button>
          <button className="nav-circle-btn" onClick={handleGoForward} title="Forward">
            <ArrowRight size={16} />
          </button>
          <button className="nav-circle-btn" onClick={handleReload} title="Reload">
            <RotateCw size={15} />
          </button>

          <form onSubmit={handleAddressSubmit} className="address-bar-container">
            <Shield
              size={14}
              style={{ color: store.adBlockedCount > 0 ? '#2ec4b6' : 'var(--text-secondary)' }}
            />
            <input
              id="address-bar"
              type="text"
              className="address-input"
              value={addressInput}
              onChange={(e) => setAddressInput(e.target.value)}
              onFocus={(e) => e.target.select()}
            />
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
                title="Reset zoom (Cmd+0)"
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
                  {tab.favicon ? (
                    <img
                      src={tab.favicon}
                      alt=""
                      width={12}
                      height={12}
                      style={{ borderRadius: 2, flexShrink: 0, objectFit: 'contain' }}
                      onError={(e) => { (e.target as HTMLImageElement).style.display = 'none' }}
                    />
                  ) : (
                    <span style={{ fontSize: 10, flexShrink: 0 }}>🌐</span>
                  )}
                  {tab.isPinned && <span style={{ fontSize: 9, opacity: 0.7, flexShrink: 0 }}>📌</span>}
                  <span className="tab-title-text">{tab.title}</span>
                  <button
                    className="tab-close-btn"
                    title={tab.isPinned ? 'Unpin' : 'Pin'}
                    style={{ marginLeft: 'auto', opacity: 0.5 }}
                    onClick={(e) => { e.stopPropagation(); store.togglePinTab(tab.id) }}
                  >
                    <span style={{ fontSize: 9 }}>{tab.isPinned ? '📌' : '⊙'}</span>
                  </button>
                  <button
                    className="tab-close-btn"
                    onClick={(e) => {
                      e.stopPropagation()
                      closeTab(tab.id)
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
            {/* Horizontal Tabs Strip (Default) */}
            {tabLayout === 'horizontal' && (
              <div className="tab-bar-horizontal scroller">
                {sortedWorkspaceTabs.map((tab: any) => (
                  <div
                    key={tab.id}
                    className={`horizontal-tab ${tab.active ? 'active' : ''}`}
                    onClick={() => setActiveTab(tab.id)}
                    style={{
                      borderTop: tab.isPinned ? '2px solid var(--bg-accent)' : '2px solid transparent'
                    }}
                  >
                    {/* Favicon */}
                    {tab.favicon ? (
                      <img
                        src={tab.favicon}
                        alt=""
                        width={13}
                        height={13}
                        style={{ borderRadius: 2, flexShrink: 0, objectFit: 'contain' }}
                        onError={(e) => { (e.target as HTMLImageElement).style.display = 'none' }}
                      />
                    ) : (
                      <span style={{ fontSize: 10, flexShrink: 0, lineHeight: 1 }}>🌐</span>
                    )}
                    <span className="tab-title-text">{tab.title}</span>
                    {/* Pin/Unpin button */}
                    <button
                      className="tab-close-btn"
                      title={tab.isPinned ? 'Unpin tab' : 'Pin tab'}
                      style={{ opacity: 0.5, fontSize: 9, padding: '0 1px' }}
                      onClick={(e) => { e.stopPropagation(); store.togglePinTab(tab.id) }}
                    >
                      {tab.isPinned ? '📌' : '⊙'}
                    </button>
                    <button
                      className="tab-close-btn"
                      onClick={(e) => {
                        e.stopPropagation()
                        closeTab(tab.id)
                      }}
                    >
                      <X size={10} />
                    </button>
                  </div>
                ))}

                <button
                  className="nav-circle-btn"
                  style={{ width: 24, height: 24, alignSelf: 'center', marginLeft: 4, flexShrink: 0 }}
                  onClick={() => addTab('New Tab', 'aether://home')}
                >
                  <Plus size={14} />
                </button>
              </div>
            )}

            {/* Render webviews with display:none for hidden running pages */}
            <div className="webview-container">
              {workspaceTabs.map((tab: Tab) => {
                const isLoaded = loadedTabIds.includes(tab.id)
                if (!isLoaded) return null

                const isHome =
                  tab.url === 'aether://home' || tab.url === 'about:blank' || tab.url === ''

                return (
                  <div
                    key={tab.id}
                    style={{
                      display: activeTabId === tab.id ? 'flex' : 'none',
                      width: '100%',
                      height: '100%',
                      flexDirection: 'column',
                      overflow: 'hidden'
                    }}
                  >
                    {isHome ? (
                      <StartPage tabId={tab.id} />
                    ) : (
                      <webview
                        ref={(ref) => setupWebviewListeners(tab.id, ref)}
                        src={tab.url}
                        partition={`persist:${activeProfileId}`} // Profile isolated session cookies
                        allowpopups={true}
                      />
                    )}
                  </div>
                )
              })}

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
