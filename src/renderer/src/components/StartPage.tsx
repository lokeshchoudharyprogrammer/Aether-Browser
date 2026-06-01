import React, { useState, useEffect } from 'react'
import { useBrowserStore } from '../store/browserStore'
import { AvatarIcon } from './AvatarIcon'
import {
  Globe,
  Clock,
  Calendar,
  Bookmark,
  ChevronDown,
  Check,
  Cpu,
  Terminal,
  Shield,
  Layers,
  Wifi
} from 'lucide-react'

interface StartPageProps {
  tabId: string
}

export const StartPage: React.FC<StartPageProps> = ({ tabId }) => {
  const store = useBrowserStore()
  const { db, activeProfileId, updateTabUrl, addNote } = store

  const [query, setQuery] = useState('')
  const [searchEngine, setSearchEngine] = useState<'google' | 'duckduckgo' | 'bing'>('google')
  const [showEngineDropdown, setShowEngineDropdown] = useState(false)

  // Live clock state
  const [time, setTime] = useState(new Date())

  // Quick scratchpad note state
  const [scratchContent, setScratchContent] = useState('')

  // Developer utility tool state
  const [activeDevTool, setActiveDevTool] = useState<'base64' | 'url' | 'json' | 'jwt' | 'regex'>(
    'base64'
  )
  const [devInput, setDevInput] = useState('')
  const [devOutput, setDevOutput] = useState('')
  const [isUrlDecode, setIsUrlDecode] = useState(false)
  const [isBase64Decode, setIsBase64Decode] = useState(false)

  // JSON Formatter specific states
  const [jsonIndentation, setJsonIndentation] = useState<number>(2)

  // JWT specific states
  const [jwtHeader, setJwtHeader] = useState('')
  const [jwtPayload, setJwtPayload] = useState('')
  const [jwtSignature, setJwtSignature] = useState('')
  const [jwtExpiry, setJwtExpiry] = useState<string | null>(null)

  // Regex specific states
  const [regexPattern, setRegexPattern] = useState(
    '[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}'
  )
  const [regexFlags, setRegexFlags] = useState('g')
  const [regexTestString, setRegexTestString] = useState(
    'Contact us at contact@aetherbrowser.com or support@aether.dev.'
  )
  const [regexMatches, setRegexMatches] = useState<
    { match: string; index: number; groups?: any }[]
  >([])

  // Network connection state
  const [isOnline, setIsOnline] = useState(navigator.onLine)

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000)

    const handleOnline = () => setIsOnline(true)
    const handleOffline = () => setIsOnline(false)

    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    return () => {
      clearInterval(timer)
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [])

  // Live utility conversion
  useEffect(() => {
    try {
      if (!devInput.trim()) {
        setDevOutput('')
        if (activeDevTool === 'jwt') {
          setJwtHeader('')
          setJwtPayload('')
          setJwtSignature('')
          setJwtExpiry(null)
        }
        return
      }

      if (activeDevTool === 'base64') {
        if (isBase64Decode) {
          setDevOutput(atob(devInput.trim()))
        } else {
          setDevOutput(btoa(devInput))
        }
      } else if (activeDevTool === 'url') {
        if (isUrlDecode) {
          setDevOutput(decodeURIComponent(devInput))
        } else {
          setDevOutput(encodeURIComponent(devInput))
        }
      } else if (activeDevTool === 'json') {
        const parsed = JSON.parse(devInput)
        setDevOutput(JSON.stringify(parsed, null, jsonIndentation))
      } else if (activeDevTool === 'jwt') {
        const parts = devInput.trim().split('.')
        if (parts.length < 2) {
          setDevOutput(
            '[ERROR] Invalid JWT: Must contain at least a header and payload separated by a dot.'
          )
          setJwtHeader('')
          setJwtPayload('')
          setJwtSignature('')
          setJwtExpiry(null)
          return
        }

        const base64UrlDecode = (str: string) => {
          let base64 = str.replace(/-/g, '+').replace(/_/g, '/')
          while (base64.length % 4) {
            base64 += '='
          }
          return decodeURIComponent(
            atob(base64)
              .split('')
              .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
              .join('')
          )
        }

        const headerDecoded = base64UrlDecode(parts[0])
        const payloadDecoded = base64UrlDecode(parts[1])
        setJwtHeader(JSON.stringify(JSON.parse(headerDecoded), null, 2))
        setJwtPayload(JSON.stringify(JSON.parse(payloadDecoded), null, 2))
        setJwtSignature(parts[2] || 'NO_SIGNATURE')

        const payloadObj = JSON.parse(payloadDecoded)
        if (payloadObj.exp) {
          const expTime = payloadObj.exp * 1000
          const diff = expTime - Date.now()
          if (diff < 0) {
            setJwtExpiry('Expired')
          } else {
            const minutes = Math.floor(diff / 60000)
            const seconds = Math.floor((diff % 60000) / 1000)
            setJwtExpiry(`Expires in ${minutes}m ${seconds}s`)
          }
        } else {
          setJwtExpiry('Never expires (No exp claim)')
        }
        setDevOutput('Decoded successfully.')
      }
    } catch (e: any) {
      setDevOutput(`[ERROR] Conversion failed: ${e.message}`)
    }
  }, [devInput, activeDevTool, isBase64Decode, isUrlDecode, jsonIndentation])

  // Regex Processing Effect
  useEffect(() => {
    if (activeDevTool === 'regex') {
      try {
        if (!regexPattern) {
          setRegexMatches([])
          return
        }
        const regex = new RegExp(
          regexPattern,
          regexFlags.includes('g') ? regexFlags : regexFlags + 'g'
        )
        const matches: any[] = []
        let match
        let limit = 0
        while ((match = regex.exec(regexTestString)) !== null && limit < 100) {
          limit++
          matches.push({
            match: match[0],
            index: match.index,
            groups: match.groups
          })
          if (!regex.global) break
        }
        setRegexMatches(matches)
      } catch (e: any) {
        setRegexMatches([])
      }
    }
  }, [regexPattern, regexFlags, regexTestString, activeDevTool])

  if (!db) return null

  const activeProfile = db.profiles.find((p: any) => p.id === activeProfileId)
  const profileName = activeProfile?.name || 'Developer'
  const profileBookmarks = db.bookmarks
    .filter((b: any) => b.profileId === activeProfileId)
    .slice(0, 4)

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const trimmed = query.trim()
    if (!trimmed) return

    let destination = trimmed
    if (!trimmed.startsWith('http://') && !trimmed.startsWith('https://')) {
      if (trimmed.includes('.') && !trimmed.includes(' ')) {
        destination = 'https://' + trimmed
      } else {
        if (searchEngine === 'google') {
          destination = 'https://www.google.com/search?q=' + encodeURIComponent(trimmed)
        } else if (searchEngine === 'duckduckgo') {
          destination = 'https://duckduckgo.com/?q=' + encodeURIComponent(trimmed)
        } else {
          destination = 'https://www.bing.com/search?q=' + encodeURIComponent(trimmed)
        }
      }
    }
    updateTabUrl(tabId, destination, trimmed)
  }

  const devShortcuts = [
    {
      name: 'GitHub',
      url: 'https://github.com',
      tag: 'GIT',
      desc: 'Repositories',
      color: 'var(--bg-accent)'
    },
    {
      name: 'StackOverflow',
      url: 'https://stackoverflow.com',
      tag: 'ERR',
      desc: 'Code Solutions',
      color: '#f48024'
    },
    {
      name: 'MDN Web Docs',
      url: 'https://developer.mozilla.org',
      tag: 'API',
      desc: 'Web Standards',
      color: '#ff007f'
    },
    {
      name: 'NPM Registry',
      url: 'https://www.npmjs.com',
      tag: 'PKG',
      desc: 'Packages',
      color: '#cb3837'
    },
    {
      name: 'ChatGPT',
      url: 'https://chat.openai.com',
      tag: 'GPT',
      desc: 'Prompt Engine',
      color: '#2ec4b6'
    },
    {
      name: 'Dev.to',
      url: 'https://dev.to',
      tag: 'DEV',
      desc: 'Read Articles',
      color: 'var(--text-primary)'
    },
    {
      name: 'Tailwind CSS',
      url: 'https://tailwindcss.com',
      tag: 'CSS',
      desc: 'Styling Docs',
      color: '#06b6d4'
    },
    { name: 'ViteJS', url: 'https://vite.dev', tag: 'SRV', desc: 'Bundler Tool', color: '#bd34fe' }
  ]

  const handleSaveScratchNote = () => {
    if (!scratchContent.trim()) return
    addNote('Scratch Log [' + time.toLocaleDateString() + ']', scratchContent)
    setScratchContent('')
    alert('Note saved to notes sidebar panel!')
  }

  const handleShortcutClick = (url: string, name: string) => {
    updateTabUrl(tabId, url, name)
  }

  return (
    <div
      style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        padding: '40px 24px',
        background:
          'radial-gradient(circle at 50% 15%, var(--bg-secondary) 0%, var(--bg-primary) 100%)',
        color: 'var(--text-primary)',
        overflowY: 'auto',
        height: '100%',
        width: '100%'
      }}
      className="scroller"
    >
      {/* BRAND LOGO & TITLE SECTION (Arc/Vivaldi Inspired) */}
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          textAlign: 'center',
          marginBottom: 40,
          marginTop: 10
        }}
      >
        {/* Stylized Aether Hexagon Logo */}
        <div
          style={{
            width: 58,
            height: 58,
            borderRadius: '16px',
            background: 'linear-gradient(135deg, var(--bg-accent) 0%, #ff7b00 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 8px 30px rgba(131, 56, 235, 0.25)',
            marginBottom: 12,
            fontSize: 26,
            fontWeight: 800,
            color: '#ffffff',
            border: '1px solid rgba(255, 255, 255, 0.15)',
            animation: 'pulse 3s infinite ease-in-out'
          }}
        >
          Æ
        </div>
        <h1
          style={{
            fontSize: 34,
            fontWeight: 800,
            letterSpacing: '-1px',
            margin: 0,
            background: 'linear-gradient(135deg, var(--text-primary) 30%, var(--bg-accent) 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            fontFamily: 'var(--font-sans)'
          }}
        >
          Aether Browser
        </h1>
        <p
          style={{
            fontSize: 13,
            color: 'var(--text-secondary)',
            marginTop: 4,
            fontWeight: 500,
            letterSpacing: '0.5px',
            textTransform: 'uppercase'
          }}
        >
          Isolated Multi-Profile Developer Workspace
        </p>
      </div>

      {/* 1. DEVELOPER TERMINAL HEADER BAR */}
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          justifyContent: 'space-between',
          alignItems: 'center',
          width: '100%',
          maxWidth: 960,
          gap: 16,
          marginBottom: 28,
          background: 'var(--glass-bg)',
          border: '1px solid var(--glass-border)',
          padding: '14px 20px',
          borderRadius: 'var(--border-radius-md)',
          backdropFilter: 'blur(16px)',
          boxShadow: 'var(--shadow-sm)'
        }}
      >
        {/* Profile/Welcome Section */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <div
            style={{
              width: 40,
              height: 40,
              borderRadius: '50%',
              backgroundColor: 'var(--bg-tertiary)',
              border: '2px solid var(--bg-accent)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 0 10px rgba(131, 56, 236, 0.2)'
            }}
          >
            <AvatarIcon
              name={activeProfile?.avatar || 'User'}
              size={18}
              style={{ color: 'var(--bg-accent)' }}
            />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <span
                style={{
                  fontSize: 9,
                  fontFamily: 'var(--font-mono)',
                  background: 'rgba(46, 196, 182, 0.15)',
                  padding: '2px 5px',
                  borderRadius: 3,
                  color: '#2ec4b6',
                  fontWeight: 700
                }}
              >
                SESSION_ACTIVE
              </span>
              <span
                style={{
                  fontSize: 10,
                  fontFamily: 'var(--font-mono)',
                  color: 'var(--text-secondary)'
                }}
              >
                root@{profileName.toLowerCase()}
              </span>
            </div>
            <h3 style={{ fontSize: 15, fontWeight: 700, margin: '2px 0 0 0' }}>
              Welcome back, {profileName}
            </h3>
          </div>
        </div>

        {/* Live system parameters metrics */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
          {/* Engine metrics */}
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: 2,
              fontFamily: 'var(--font-mono)',
              fontSize: 11
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <Cpu size={12} style={{ color: 'var(--text-secondary)' }} />
              <span style={{ color: 'var(--text-secondary)' }}>ENV:</span>
              <span style={{ color: 'var(--text-primary)', fontWeight: 600 }}>v1.0.0</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <Wifi size={12} style={{ color: isOnline ? '#2ec4b6' : '#ef233c' }} />
              <span style={{ color: 'var(--text-secondary)' }}>NET:</span>
              <span style={{ color: isOnline ? '#2ec4b6' : '#ef233c', fontWeight: 600 }}>
                {isOnline ? 'ONLINE' : 'OFFLINE'}
              </span>
            </div>
          </div>

          <div style={{ width: 1, height: 28, backgroundColor: 'var(--border-color)' }} />

          {/* Clock & Calendar widget */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 2, textAlign: 'right' }}>
            <div
              style={{
                fontSize: 15,
                fontWeight: 700,
                fontFamily: 'var(--font-mono)',
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                justifyContent: 'flex-end',
                color: 'var(--text-primary)'
              }}
            >
              <Clock size={14} style={{ color: 'var(--bg-accent)' }} />
              <span>
                {time.toLocaleTimeString([], {
                  hour: '2-digit',
                  minute: '2-digit',
                  second: '2-digit'
                })}
              </span>
            </div>
            <div
              style={{
                fontSize: 10,
                color: 'var(--text-secondary)',
                display: 'flex',
                alignItems: 'center',
                gap: 4,
                fontFamily: 'var(--font-mono)',
                justifyContent: 'flex-end'
              }}
            >
              <Calendar size={11} />
              <span>
                {time.toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' })}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* 2. COMMAND PALETTE SEARCH ENGINE BAR */}
      <div style={{ width: '100%', maxWidth: 960, marginBottom: 28 }}>
        <form onSubmit={handleSearchSubmit} style={{ display: 'flex', gap: 8, width: '100%' }}>
          {/* Select dropdown engine selector */}
          <div style={{ position: 'relative' }}>
            <button
              type="button"
              onClick={() => setShowEngineDropdown(!showEngineDropdown)}
              style={{
                height: 44,
                padding: '0 16px',
                borderRadius: 'var(--border-radius-sm)',
                backgroundColor: 'var(--bg-secondary)',
                border: '1px solid var(--border-color)',
                color: 'var(--text-primary)',
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                cursor: 'pointer',
                fontSize: 12,
                fontWeight: 600,
                fontFamily: 'var(--font-mono)',
                transition: 'all 0.2s'
              }}
            >
              <span>{searchEngine.toUpperCase()}</span>
              <ChevronDown size={14} />
            </button>

            {showEngineDropdown && (
              <div
                style={{
                  position: 'absolute',
                  top: 50,
                  left: 0,
                  backgroundColor: 'var(--bg-secondary)',
                  border: '1px solid var(--border-color)',
                  borderRadius: 'var(--border-radius-sm)',
                  boxShadow: 'var(--shadow-md)',
                  zIndex: 30,
                  width: 140,
                  overflow: 'hidden'
                }}
              >
                {['google', 'duckduckgo', 'bing'].map((engine) => (
                  <div
                    key={engine}
                    onClick={() => {
                      setSearchEngine(engine as any)
                      setShowEngineDropdown(false)
                    }}
                    style={{
                      padding: '10px 14px',
                      cursor: 'pointer',
                      fontSize: 11,
                      fontFamily: 'var(--font-mono)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      backgroundColor:
                        searchEngine === engine ? 'var(--bg-tertiary)' : 'transparent',
                      color: searchEngine === engine ? 'var(--bg-accent)' : 'var(--text-primary)'
                    }}
                    className="notes-list-item"
                  >
                    <span>{engine.toUpperCase()}</span>
                    {searchEngine === engine && <Check size={12} />}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Core Command Palette Input */}
          <div style={{ flex: 1, position: 'relative' }}>
            <input
              type="text"
              className="premium-input"
              placeholder={`> search or enter URL address...`}
              style={{
                height: 44,
                paddingLeft: 44,
                fontSize: 13,
                fontFamily: 'var(--font-mono)',
                borderRadius: 'var(--border-radius-sm)',
                backgroundColor: 'var(--bg-secondary)',
                boxShadow: 'var(--shadow-sm)'
              }}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
            <Terminal
              size={16}
              style={{ position: 'absolute', left: 16, top: 14, color: 'var(--bg-accent)' }}
            />
          </div>
        </form>
      </div>

      {/* 3. PRO DEV GRIDS LAYOUT */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(290px, 1fr))',
          gap: 20,
          width: '100%',
          maxWidth: 960,
          margin: '0 auto'
        }}
      >
        {/* Speed Dial Section */}
        <div
          style={{
            background: 'var(--bg-secondary)',
            border: '1px solid var(--border-color)',
            borderRadius: 'var(--border-radius-md)',
            padding: 18,
            display: 'flex',
            flexDirection: 'column',
            boxShadow: 'var(--shadow-sm)'
          }}
        >
          {/* IDE style fake window header dots */}
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: 12
            }}
          >
            <div style={{ display: 'flex', gap: 5 }}>
              <div
                style={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: '#ff5f56' }}
              />
              <div
                style={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: '#ffbd2e' }}
              />
              <div
                style={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: '#27c93f' }}
              />
            </div>
            <h3
              style={{
                fontSize: 10,
                fontWeight: 600,
                color: 'var(--text-secondary)',
                textTransform: 'uppercase',
                letterSpacing: 0.8,
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                fontFamily: 'var(--font-mono)',
                margin: 0
              }}
            >
              <Globe size={12} style={{ color: 'var(--bg-accent)' }} />
              <span>DEV_SPEED_DIAL</span>
            </h3>
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(2, 1fr)',
              gap: 10
            }}
          >
            {devShortcuts.map((s) => (
              <div
                key={s.name}
                onClick={() => handleShortcutClick(s.url, s.name)}
                style={{
                  backgroundColor: 'var(--bg-tertiary)',
                  border: '1px solid var(--border-color)',
                  borderRadius: 6,
                  padding: '10px 12px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 4,
                  cursor: 'pointer',
                  transition: 'all 0.2s'
                }}
                className="notes-list-item"
              >
                <div
                  style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
                >
                  <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>
                    {s.name}
                  </span>
                  <span
                    style={{
                      fontSize: 9,
                      fontFamily: 'var(--font-mono)',
                      backgroundColor: 'rgba(255, 255, 255, 0.05)',
                      padding: '1px 4px',
                      borderRadius: 3,
                      color: s.color,
                      fontWeight: 700
                    }}
                  >
                    {s.tag}
                  </span>
                </div>
                <span style={{ fontSize: 10, color: 'var(--text-secondary)' }}>{s.desc}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Console / Scratchpad Log Section */}
        <div
          style={{
            background: 'var(--bg-secondary)',
            border: '1px solid var(--border-color)',
            borderRadius: 'var(--border-radius-md)',
            padding: 18,
            display: 'flex',
            flexDirection: 'column',
            boxShadow: 'var(--shadow-sm)'
          }}
        >
          {/* IDE style fake window header dots */}
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: 12
            }}
          >
            <div style={{ display: 'flex', gap: 5 }}>
              <div
                style={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: '#ff5f56' }}
              />
              <div
                style={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: '#ffbd2e' }}
              />
              <div
                style={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: '#27c93f' }}
              />
            </div>
            <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
              {scratchContent.trim() && (
                <button
                  onClick={handleSaveScratchNote}
                  style={{
                    background: 'rgba(131, 56, 236, 0.1)',
                    border: '1px solid var(--bg-accent)',
                    color: 'var(--bg-accent)',
                    fontSize: 9,
                    fontWeight: 700,
                    cursor: 'pointer',
                    padding: '2px 6px',
                    borderRadius: 3,
                    fontFamily: 'var(--font-mono)'
                  }}
                >
                  SAVE_LOG
                </button>
              )}
              <h3
                style={{
                  fontSize: 10,
                  fontWeight: 600,
                  color: 'var(--text-secondary)',
                  textTransform: 'uppercase',
                  letterSpacing: 0.8,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6,
                  fontFamily: 'var(--font-mono)',
                  margin: 0
                }}
              >
                <Terminal size={12} style={{ color: 'var(--bg-accent)' }} />
                <span>SCRATCHPAD_LOG</span>
              </h3>
            </div>
          </div>

          <div style={{ flex: 1, position: 'relative', display: 'flex' }}>
            {/* Fake terminal line numbers */}
            <div
              style={{
                width: 22,
                backgroundColor: 'rgba(0,0,0,0.1)',
                borderRadius: '6px 0 0 6px',
                fontFamily: 'var(--font-mono)',
                fontSize: 10,
                color: 'var(--text-secondary)',
                padding: '10px 2px',
                textAlign: 'center',
                display: 'flex',
                flexDirection: 'column',
                gap: 4,
                borderRight: '1px solid var(--border-color)'
              }}
            >
              <span>01</span>
              <span>02</span>
              <span>03</span>
              <span>04</span>
              <span>05</span>
              <span>06</span>
            </div>

            <textarea
              placeholder="// Type quick notes or raw snippets here..."
              style={{
                flex: 1,
                minHeight: 140,
                padding: 10,
                borderRadius: '0 6px 6px 0',
                border: 'none',
                backgroundColor: 'rgba(0, 0, 0, 0.15)',
                color: 'var(--text-primary)',
                fontFamily: 'var(--font-mono)',
                fontSize: 12,
                lineHeight: 1.45,
                resize: 'none',
                outline: 'none'
              }}
              value={scratchContent}
              onChange={(e) => setScratchContent(e.target.value)}
            />
          </div>
        </div>

        {/* Real-time Developer Utility Toolset Widget */}
        <div
          style={{
            gridColumn: '1 / -1',
            background: 'var(--bg-secondary)',
            border: '1px solid var(--border-color)',
            borderRadius: 'var(--border-radius-md)',
            padding: 18,
            display: 'flex',
            flexDirection: 'column',
            boxShadow: 'var(--shadow-sm)'
          }}
        >
          {/* Header tabs toggle */}
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: 14,
              borderBottom: '1px solid var(--border-color)',
              paddingBottom: 8
            }}
          >
            <div style={{ display: 'flex', gap: 14, alignItems: 'center' }}>
              <div style={{ display: 'flex', gap: 5, marginRight: 8 }}>
                <div
                  style={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: '#ff5f56' }}
                />
                <div
                  style={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: '#ffbd2e' }}
                />
                <div
                  style={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: '#27c93f' }}
                />
              </div>
              {[
                { id: 'base64', name: 'BASE64_CONVERTER' },
                { id: 'url', name: 'URL_ENCODER_DECODER' },
                { id: 'json', name: 'JSON_FORMATTER' },
                { id: 'jwt', name: 'JWT_DECODER' },
                { id: 'regex', name: 'REGEX_SANDBOX' }
              ].map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => {
                    setActiveDevTool(tab.id as any)
                    setDevInput('')
                    setDevOutput('')
                  }}
                  style={{
                    background: 'none',
                    border: 'none',
                    fontSize: 10,
                    fontFamily: 'var(--font-mono)',
                    color: activeDevTool === tab.id ? 'var(--bg-accent)' : 'var(--text-secondary)',
                    fontWeight: activeDevTool === tab.id ? 700 : 500,
                    cursor: 'pointer',
                    paddingBottom: 8,
                    borderBottom: activeDevTool === tab.id ? '2px solid var(--bg-accent)' : 'none',
                    marginBottom: -9
                  }}
                >
                  {tab.name}
                </button>
              ))}
            </div>

            {/* Sub direction toggle */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              {activeDevTool === 'base64' && (
                <button
                  type="button"
                  onClick={() => {
                    setIsBase64Decode(!isBase64Decode)
                    setDevInput('')
                    setDevOutput('')
                  }}
                  style={{
                    backgroundColor: 'var(--bg-tertiary)',
                    border: '1px solid var(--border-color)',
                    color: 'var(--text-primary)',
                    fontFamily: 'var(--font-mono)',
                    fontSize: 9,
                    fontWeight: 600,
                    padding: '3px 8px',
                    borderRadius: 4,
                    cursor: 'pointer'
                  }}
                >
                  MODE: {isBase64Decode ? 'DECODE (Base64 -> Raw)' : 'ENCODE (Raw -> Base64)'}
                </button>
              )}
              {activeDevTool === 'url' && (
                <button
                  type="button"
                  onClick={() => {
                    setIsUrlDecode(!isUrlDecode)
                    setDevInput('')
                    setDevOutput('')
                  }}
                  style={{
                    backgroundColor: 'var(--bg-tertiary)',
                    border: '1px solid var(--border-color)',
                    color: 'var(--text-primary)',
                    fontFamily: 'var(--font-mono)',
                    fontSize: 9,
                    fontWeight: 600,
                    padding: '3px 8px',
                    borderRadius: 4,
                    cursor: 'pointer'
                  }}
                >
                  MODE: {isUrlDecode ? 'DECODE (URL -> Plain)' : 'ENCODE (Plain -> URL)'}
                </button>
              )}
              {activeDevTool === 'json' && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <span
                    style={{
                      fontSize: 9,
                      fontFamily: 'var(--font-mono)',
                      color: 'var(--text-secondary)'
                    }}
                  >
                    INDENT:
                  </span>
                  {[2, 4].map((indent) => (
                    <button
                      key={indent}
                      type="button"
                      onClick={() => setJsonIndentation(indent)}
                      style={{
                        backgroundColor:
                          jsonIndentation === indent ? 'var(--bg-accent)' : 'var(--bg-tertiary)',
                        color: jsonIndentation === indent ? '#ffffff' : 'var(--text-primary)',
                        border: '1px solid var(--border-color)',
                        fontFamily: 'var(--font-mono)',
                        fontSize: 9,
                        fontWeight: 600,
                        padding: '2px 6px',
                        borderRadius: 3,
                        cursor: 'pointer'
                      }}
                    >
                      {indent}
                    </button>
                  ))}
                </div>
              )}
              {activeDevTool === 'jwt' && jwtExpiry && (
                <span
                  style={{
                    fontSize: 9,
                    fontFamily: 'var(--font-mono)',
                    fontWeight: 700,
                    backgroundColor: jwtExpiry.includes('Expired')
                      ? 'rgba(239, 35, 60, 0.15)'
                      : 'rgba(46, 196, 182, 0.15)',
                    color: jwtExpiry.includes('Expired') ? '#ef233c' : '#2ec4b6',
                    padding: '3px 8px',
                    borderRadius: 4
                  }}
                >
                  {jwtExpiry.toUpperCase()}
                </span>
              )}
              {activeDevTool === 'regex' && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <span
                    style={{
                      fontSize: 9,
                      fontFamily: 'var(--font-mono)',
                      color: 'var(--text-secondary)'
                    }}
                  >
                    FLAGS:
                  </span>
                  <input
                    type="text"
                    value={regexFlags}
                    onChange={(e) => setRegexFlags(e.target.value)}
                    style={{
                      width: 40,
                      height: 20,
                      backgroundColor: 'var(--bg-tertiary)',
                      border: '1px solid var(--border-color)',
                      color: 'var(--text-primary)',
                      fontFamily: 'var(--font-mono)',
                      fontSize: 10,
                      fontWeight: 600,
                      textAlign: 'center',
                      borderRadius: 3,
                      outline: 'none'
                    }}
                  />
                </div>
              )}
            </div>
          </div>

          {/* Main workspace layout for toolsets */}
          <div style={{ display: 'flex', flexDirection: 'column', minHeight: 160 }}>
            {/* 1. Base64 / URL / JSON Standard Double Textarea */}
            {(activeDevTool === 'base64' ||
              activeDevTool === 'url' ||
              activeDevTool === 'json') && (
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div>
                  <label
                    style={{
                      display: 'block',
                      fontSize: 10,
                      fontFamily: 'var(--font-mono)',
                      color: 'var(--text-secondary)',
                      marginBottom: 4
                    }}
                  >
                    INPUT_TEXT
                  </label>
                  <textarea
                    placeholder={
                      activeDevTool === 'json'
                        ? 'Paste minified JSON string...'
                        : 'Paste or type text to convert...'
                    }
                    style={{
                      width: '100%',
                      height: 120,
                      padding: 8,
                      borderRadius: 6,
                      border: '1px solid var(--border-color)',
                      backgroundColor: 'var(--bg-tertiary)',
                      color: 'var(--text-primary)',
                      fontFamily: 'var(--font-mono)',
                      fontSize: 11,
                      resize: 'none',
                      outline: 'none'
                    }}
                    value={devInput}
                    onChange={(e) => setDevInput(e.target.value)}
                  />
                </div>

                <div>
                  <label
                    style={{
                      display: 'block',
                      fontSize: 10,
                      fontFamily: 'var(--font-mono)',
                      color: 'var(--text-secondary)',
                      marginBottom: 4
                    }}
                  >
                    OUTPUT_TEXT
                  </label>
                  <textarea
                    placeholder="Converted output will appear here..."
                    readOnly
                    style={{
                      width: '100%',
                      height: 120,
                      padding: 8,
                      borderRadius: 6,
                      border: '1px solid var(--border-color)',
                      backgroundColor: 'rgba(0, 0, 0, 0.15)',
                      color: devOutput.startsWith('[ERROR]') ? '#ef233c' : 'var(--bg-accent)',
                      fontFamily: 'var(--font-mono)',
                      fontSize: 11,
                      resize: 'none',
                      outline: 'none'
                    }}
                    value={devOutput}
                  />
                </div>
              </div>
            )}

            {/* 2. JWT Decoder View */}
            {activeDevTool === 'jwt' && (
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div>
                  <label
                    style={{
                      display: 'block',
                      fontSize: 10,
                      fontFamily: 'var(--font-mono)',
                      color: 'var(--text-secondary)',
                      marginBottom: 4
                    }}
                  >
                    ENCRYPTED_JWT_TOKEN
                  </label>
                  <textarea
                    placeholder="Paste encoded JWT token (header.payload.signature)..."
                    style={{
                      width: '100%',
                      height: 120,
                      padding: 8,
                      borderRadius: 6,
                      border: '1px solid var(--border-color)',
                      backgroundColor: 'var(--bg-tertiary)',
                      color: 'var(--text-primary)',
                      fontFamily: 'var(--font-mono)',
                      fontSize: 11,
                      resize: 'none',
                      outline: 'none',
                      wordBreak: 'break-all'
                    }}
                    value={devInput}
                    onChange={(e) => setDevInput(e.target.value)}
                  />
                </div>

                <div
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 8,
                    height: 120,
                    overflowY: 'auto',
                    paddingRight: 4
                  }}
                  className="scroller"
                >
                  {jwtHeader ? (
                    <>
                      <div>
                        <div
                          style={{
                            fontSize: 9,
                            fontFamily: 'var(--font-mono)',
                            color: '#ff007f',
                            fontWeight: 700,
                            marginBottom: 2
                          }}
                        >
                          HEADER (ALGORITHM & TYPE)
                        </div>
                        <pre
                          style={{
                            margin: 0,
                            padding: 6,
                            backgroundColor: 'rgba(255, 0, 127, 0.05)',
                            border: '1px solid rgba(255, 0, 127, 0.15)',
                            borderRadius: 4,
                            fontFamily: 'var(--font-mono)',
                            fontSize: 10,
                            color: '#ff007f',
                            whiteSpace: 'pre-wrap'
                          }}
                        >
                          {jwtHeader}
                        </pre>
                      </div>
                      <div>
                        <div
                          style={{
                            fontSize: 9,
                            fontFamily: 'var(--font-mono)',
                            color: '#8338ec',
                            fontWeight: 700,
                            marginBottom: 2
                          }}
                        >
                          PAYLOAD (DATA CLAIMS)
                        </div>
                        <pre
                          style={{
                            margin: 0,
                            padding: 6,
                            backgroundColor: 'rgba(131, 56, 236, 0.05)',
                            border: '1px solid rgba(131, 56, 236, 0.15)',
                            borderRadius: 4,
                            fontFamily: 'var(--font-mono)',
                            fontSize: 10,
                            color: '#b19ffb',
                            whiteSpace: 'pre-wrap'
                          }}
                        >
                          {jwtPayload}
                        </pre>
                      </div>
                      <div>
                        <div
                          style={{
                            fontSize: 9,
                            fontFamily: 'var(--font-mono)',
                            color: '#2ec4b6',
                            fontWeight: 700,
                            marginBottom: 2
                          }}
                        >
                          SIGNATURE
                        </div>
                        <pre
                          style={{
                            margin: 0,
                            padding: 6,
                            backgroundColor: 'rgba(46, 196, 182, 0.05)',
                            border: '1px solid rgba(46, 196, 182, 0.15)',
                            borderRadius: 4,
                            fontFamily: 'var(--font-mono)',
                            fontSize: 10,
                            color: '#2ec4b6',
                            whiteSpace: 'pre-wrap',
                            wordBreak: 'break-all'
                          }}
                        >
                          {jwtSignature}
                        </pre>
                      </div>
                    </>
                  ) : (
                    <div
                      style={{
                        height: '100%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: 'var(--text-secondary)',
                        fontSize: 11,
                        border: '1px solid var(--border-color)',
                        borderRadius: 6,
                        borderStyle: 'dashed'
                      }}
                    >
                      Decoded JWT segments will appear here...
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* 3. Regex Sandbox View */}
            {activeDevTool === 'regex' && (
              <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: 12 }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  <div>
                    <label
                      style={{
                        display: 'block',
                        fontSize: 10,
                        fontFamily: 'var(--font-mono)',
                        color: 'var(--text-secondary)',
                        marginBottom: 4
                      }}
                    >
                      REGEX_PATTERN
                    </label>
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        backgroundColor: 'var(--bg-tertiary)',
                        border: '1px solid var(--border-color)',
                        borderRadius: 6,
                        paddingLeft: 8
                      }}
                    >
                      <span
                        style={{
                          fontSize: 12,
                          fontFamily: 'var(--font-mono)',
                          color: 'var(--text-secondary)'
                        }}
                      >
                        /
                      </span>
                      <input
                        type="text"
                        style={{
                          flex: 1,
                          height: 28,
                          border: 'none',
                          background: 'none',
                          color: 'var(--text-primary)',
                          fontFamily: 'var(--font-mono)',
                          fontSize: 11,
                          padding: '0 4px',
                          outline: 'none'
                        }}
                        value={regexPattern}
                        onChange={(e) => setRegexPattern(e.target.value)}
                      />
                      <span
                        style={{
                          fontSize: 12,
                          fontFamily: 'var(--font-mono)',
                          color: 'var(--text-secondary)',
                          paddingRight: 8
                        }}
                      >
                        /{regexFlags}
                      </span>
                    </div>
                  </div>
                  <div>
                    <label
                      style={{
                        display: 'block',
                        fontSize: 10,
                        fontFamily: 'var(--font-mono)',
                        color: 'var(--text-secondary)',
                        marginBottom: 4
                      }}
                    >
                      TEST_STRING
                    </label>
                    <textarea
                      placeholder="Type text to run pattern matching against..."
                      style={{
                        width: '100%',
                        height: 60,
                        padding: 8,
                        borderRadius: 6,
                        border: '1px solid var(--border-color)',
                        backgroundColor: 'var(--bg-tertiary)',
                        color: 'var(--text-primary)',
                        fontFamily: 'var(--font-sans)',
                        fontSize: 12,
                        resize: 'none',
                        outline: 'none'
                      }}
                      value={regexTestString}
                      onChange={(e) => setRegexTestString(e.target.value)}
                    />
                  </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  <label
                    style={{
                      display: 'block',
                      fontSize: 10,
                      fontFamily: 'var(--font-mono)',
                      color: 'var(--text-secondary)'
                    }}
                  >
                    MATCHES ({regexMatches.length})
                  </label>
                  <div
                    style={{
                      flex: 1,
                      minHeight: 96,
                      maxHeight: 96,
                      overflowY: 'auto',
                      backgroundColor: 'rgba(0,0,0,0.15)',
                      border: '1px solid var(--border-color)',
                      borderRadius: 6,
                      padding: 8
                    }}
                    className="scroller"
                  >
                    {regexMatches.length > 0 ? (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                        {regexMatches.map((m, idx) => (
                          <div
                            key={idx}
                            style={{
                              fontSize: 11,
                              fontFamily: 'var(--font-mono)',
                              display: 'flex',
                              gap: 8,
                              color: 'var(--bg-accent)'
                            }}
                          >
                            <span style={{ color: 'var(--text-secondary)' }}>[{m.index}]</span>
                            <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>
                              "{m.match}"
                            </span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div
                        style={{
                          height: '100%',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: 'var(--text-secondary)',
                          fontSize: 10
                        }}
                      >
                        No matches found.
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Live Shield Shield Stat Widget */}
        <div
          style={{
            background:
              'linear-gradient(135deg, rgba(131, 56, 236, 0.08) 0%, rgba(0, 245, 212, 0.05) 100%)',
            border: '1px solid var(--border-color)',
            borderRadius: 'var(--border-radius-md)',
            padding: 18,
            display: 'flex',
            alignItems: 'center',
            gap: 16,
            boxShadow: 'var(--shadow-sm)'
          }}
        >
          <div
            style={{
              width: 36,
              height: 36,
              borderRadius: '50%',
              backgroundColor: 'rgba(131, 56, 236, 0.15)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0
            }}
          >
            <Shield size={18} style={{ color: 'var(--bg-accent)' }} />
          </div>
          <div>
            <h4
              style={{
                fontSize: 12,
                fontWeight: 700,
                color: 'var(--text-primary)',
                marginBottom: 2,
                fontFamily: 'var(--font-mono)'
              }}
            >
              SHIELD_ADS_BLOCKED
            </h4>
            <span
              style={{
                fontSize: 11,
                color: 'var(--text-secondary)',
                fontFamily: 'var(--font-sans)'
              }}
            >
              Total trackers intercepted in profile:{' '}
              <strong style={{ color: 'var(--bg-accent)' }}>{store.adBlockedCount}</strong>
            </span>
          </div>
        </div>

        {/* ── KEYBOARD SHORTCUTS CHEAT SHEET ─────────────────────────── */}
        <div
          style={{
            gridColumn: '1 / -1',
            background: 'var(--bg-secondary)',
            border: '1px solid var(--border-color)',
            borderRadius: 'var(--border-radius-md)',
            padding: 20,
            boxShadow: 'var(--shadow-sm)',
            display: 'flex',
            flexDirection: 'column',
            gap: 16
          }}
        >
          {/* Card header */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, borderBottom: '1px solid var(--border-color)', paddingBottom: 12 }}>
            <div style={{ display: 'flex', gap: 5 }}>
              <div style={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: '#ff5f56' }} />
              <div style={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: '#ffbd2e' }} />
              <div style={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: '#27c93f' }} />
            </div>
            <span style={{ fontSize: 10, fontFamily: 'var(--font-mono)', fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: 1, marginLeft: 4 }}>
              ⌨ KEYBOARD_SHORTCUTS
            </span>
            <span style={{ marginLeft: 'auto', fontSize: 9, fontFamily: 'var(--font-mono)', color: 'rgba(46,196,182,0.8)', background: 'rgba(46,196,182,0.1)', padding: '2px 7px', borderRadius: 4, fontWeight: 700 }}>
              ACTIVE
            </span>
          </div>

          {/* Shortcut groups */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 18 }}>

            {/* Group: Tab Management */}
            <div>
              <div style={{ fontSize: 9, fontFamily: 'var(--font-mono)', fontWeight: 700, color: 'var(--bg-accent)', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 10 }}>
                Tab Management
              </div>
              {[
                { keys: ['⌘', 'T'], desc: 'Open new tab' },
                { keys: ['⌘', 'W'], desc: 'Close current tab' },
                { keys: ['⌘', '1–9'], desc: 'Jump to tab by number' },
              ].map((s) => (
                <div key={s.desc} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '7px 0', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                  <span style={{ fontSize: 11, color: 'var(--text-secondary)', fontFamily: 'var(--font-sans)' }}>{s.desc}</span>
                  <div style={{ display: 'flex', gap: 3, alignItems: 'center' }}>
                    {s.keys.map((k, i) => (
                      <React.Fragment key={k + i}>
                        <kbd style={{
                          display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                          minWidth: 22, height: 22, padding: '0 6px',
                          background: 'var(--bg-tertiary)', border: '1px solid rgba(255,255,255,0.12)',
                          borderBottom: '2px solid rgba(0,0,0,0.35)', borderRadius: 5,
                          fontFamily: 'var(--font-mono)', fontSize: 10, fontWeight: 700,
                          color: 'var(--text-primary)', boxShadow: '0 1px 3px rgba(0,0,0,0.3)'
                        }}>{k}</kbd>
                        {i < s.keys.length - 1 && <span style={{ fontSize: 9, color: 'var(--text-secondary)', margin: '0 1px' }}>+</span>}
                      </React.Fragment>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            {/* Group: Sidebar & Navigation */}
            <div>
              <div style={{ fontSize: 9, fontFamily: 'var(--font-mono)', fontWeight: 700, color: '#2ec4b6', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 10 }}>
                Sidebar & Navigation
              </div>
              {[
                { keys: ['⌘', 'B'], desc: 'Toggle bookmarks panel' },
                { keys: ['⌘', 'L'], desc: 'Toggle history panel' },
                { keys: ['⌘', '⇧', 'L'], desc: 'Toggle notes panel' },
              ].map((s) => (
                <div key={s.desc} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '7px 0', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                  <span style={{ fontSize: 11, color: 'var(--text-secondary)', fontFamily: 'var(--font-sans)' }}>{s.desc}</span>
                  <div style={{ display: 'flex', gap: 3, alignItems: 'center' }}>
                    {s.keys.map((k, i) => (
                      <React.Fragment key={k + i}>
                        <kbd style={{
                          display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                          minWidth: 22, height: 22, padding: '0 6px',
                          background: 'var(--bg-tertiary)', border: '1px solid rgba(255,255,255,0.12)',
                          borderBottom: '2px solid rgba(0,0,0,0.35)', borderRadius: 5,
                          fontFamily: 'var(--font-mono)', fontSize: 10, fontWeight: 700,
                          color: 'var(--text-primary)', boxShadow: '0 1px 3px rgba(0,0,0,0.3)'
                        }}>{k}</kbd>
                        {i < s.keys.length - 1 && <span style={{ fontSize: 9, color: 'var(--text-secondary)', margin: '0 1px' }}>+</span>}
                      </React.Fragment>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            {/* Group: Profile & Security */}
            <div>
              <div style={{ fontSize: 9, fontFamily: 'var(--font-mono)', fontWeight: 700, color: '#ff7b00', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 10 }}>
                Profile & Security
              </div>
              {[
                { keys: ['⌘', '⇧', 'P'], desc: 'Switch / lock profile' },
                { keys: ['⌘', '⇧', 'N'], desc: 'Open new private window' },
                { keys: ['⌘', ','], desc: 'Open profile settings' },
              ].map((s) => (
                <div key={s.desc} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '7px 0', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                  <span style={{ fontSize: 11, color: 'var(--text-secondary)', fontFamily: 'var(--font-sans)' }}>{s.desc}</span>
                  <div style={{ display: 'flex', gap: 3, alignItems: 'center' }}>
                    {s.keys.map((k, i) => (
                      <React.Fragment key={k + i}>
                        <kbd style={{
                          display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                          minWidth: 22, height: 22, padding: '0 6px',
                          background: 'var(--bg-tertiary)', border: '1px solid rgba(255,255,255,0.12)',
                          borderBottom: '2px solid rgba(0,0,0,0.35)', borderRadius: 5,
                          fontFamily: 'var(--font-mono)', fontSize: 10, fontWeight: 700,
                          color: 'var(--text-primary)', boxShadow: '0 1px 3px rgba(0,0,0,0.3)'
                        }}>{k}</kbd>
                        {i < s.keys.length - 1 && <span style={{ fontSize: 9, color: 'var(--text-secondary)', margin: '0 1px' }}>+</span>}
                      </React.Fragment>
                    ))}
                  </div>
                </div>
              ))}
            </div>

          </div>

          {/* Footer hint */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 2, paddingTop: 10, borderTop: '1px solid rgba(255,255,255,0.05)' }}>
            <span style={{ fontSize: 9, fontFamily: 'var(--font-mono)', color: 'var(--text-secondary)', opacity: 0.7 }}>
              💡 On Windows/Linux, replace <kbd style={{ display:'inline', padding:'1px 4px', background:'var(--bg-tertiary)', border:'1px solid rgba(255,255,255,0.12)', borderRadius:3, fontSize:9, fontFamily:'var(--font-mono)' }}>⌘</kbd> with <kbd style={{ display:'inline', padding:'1px 4px', background:'var(--bg-tertiary)', border:'1px solid rgba(255,255,255,0.12)', borderRadius:3, fontSize:9, fontFamily:'var(--font-mono)' }}>Ctrl</kbd>
            </span>
          </div>
        </div>

        {/* Bookmarks Log panel */}
        <div
          style={{
            background: 'var(--bg-secondary)',
            border: '1px solid var(--border-color)',
            borderRadius: 'var(--border-radius-md)',
            padding: 18,
            boxShadow: 'var(--shadow-sm)'
          }}
        >
          <h4
            style={{
              fontSize: 10,
              fontWeight: 600,
              color: 'var(--text-secondary)',
              textTransform: 'uppercase',
              letterSpacing: 0.8,
              marginBottom: 10,
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              fontFamily: 'var(--font-mono)'
            }}
          >
            <Bookmark size={12} style={{ color: 'var(--bg-accent)' }} />
            <span>BOOKMARKS_LOG</span>
          </h4>
          {profileBookmarks.length === 0 ? (
            <span
              style={{
                fontSize: 11,
                color: 'var(--text-secondary)',
                fontFamily: 'var(--font-mono)'
              }}
            >
              No records found.
            </span>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              {profileBookmarks.map((b: any) => (
                <div
                  key={b.id}
                  onClick={() => updateTabUrl(tabId, b.url, b.title)}
                  style={{
                    fontSize: 11,
                    color: 'var(--text-primary)',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 6,
                    fontFamily: 'var(--font-mono)'
                  }}
                  className="vertical-tab"
                >
                  <Layers size={10} style={{ color: 'var(--bg-accent)' }} />
                  <span
                    style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}
                  >
                    {b.title}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
