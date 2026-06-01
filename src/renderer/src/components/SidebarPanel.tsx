import React, { useState, useEffect } from 'react'
import { useBrowserStore } from '../store/browserStore'
import { AvatarIcon } from './AvatarIcon'
import {
  Plus,
  Trash2,
  Shield,
  Trash,
  Eye,
  EyeOff,
  Check,
  AlertTriangle,
  Sparkles,
  Download,
  CheckCircle,
  XCircle,
  X
} from 'lucide-react'

interface SidebarPanelProps {
  currentTabUrl: string
  currentTabTitle: string
}

export const SidebarPanel: React.FC<SidebarPanelProps> = ({ currentTabUrl, currentTabTitle }) => {
  const store = useBrowserStore()
  const {
    db,
    activeProfileId,
    activeSidebarTab,
    setSidebarTab,
    addBookmark,
    deleteBookmark,
    clearHistory,
    addNote,
    updateNote,
    deleteNote,
    addCredential,
    deleteCredential,
    decryptCredential,
    addAdBlockRule,
    deleteAdBlockRule,
    updateProfileTheme,
    downloads,
    updateProfile,
    deleteProfile
  } = store

  // Profile configuration states
  const [profileNameInput, setProfileNameInput] = useState('')
  const [profileAvatarInput, setProfileAvatarInput] = useState('User')
  const [profileLockTypeInput, setProfileLockTypeInput] = useState<'none' | 'password' | 'pin'>(
    'none'
  )
  const [profileCodeInput, setProfileCodeInput] = useState('')
  const [showProfileCodeInput, setShowProfileCodeInput] = useState(false)

  // Notes states
  const [selectedNoteId, setSelectedNoteId] = useState<string | null>(null)
  const [noteTitle, setNoteTitle] = useState('')
  const [noteContent, setNoteContent] = useState('')

  // Bookmarks states
  const [bookmarkTitle, setBookmarkTitle] = useState('')
  const [bookmarkUrl, setBookmarkUrl] = useState('')

  // History search state
  const [historySearch, setHistorySearch] = useState('')

  // Passwords states
  const [newCredUrl, setNewCredUrl] = useState('')
  const [newCredUser, setNewCredUser] = useState('')
  const [newCredPass, setNewCredPass] = useState('')
  const [decryptedPasswords, setDecryptedPasswords] = useState<Record<string, string>>({})
  // Removed unused generatedPass state
  const [passLength, setPassLength] = useState(12)

  // AdBlocker states
  const [newRuleDomain, setNewRuleDomain] = useState('')
  const [newRuleAction, setNewRuleAction] = useState<'block' | 'allow'>('block')



  useEffect(() => {
    if (activeSidebarTab === 'notes' && selectedNoteId) {
      const note = db?.notes.find((n: any) => n.id === selectedNoteId)
      if (note) {
        setNoteTitle(note.title)
        setNoteContent(note.content)
      }
    }
  }, [selectedNoteId, activeSidebarTab])

  useEffect(() => {
    if (activeSidebarTab === 'profile' && db && activeProfileId) {
      const activeProfile = db.profiles.find((p: any) => p.id === activeProfileId)
      if (activeProfile) {
        setProfileNameInput(activeProfile.name)
        setProfileAvatarInput(activeProfile.avatar)
        setProfileLockTypeInput(activeProfile.lockType)
        setProfileCodeInput('')
        setShowProfileCodeInput(false)
      }
    }
  }, [activeSidebarTab, activeProfileId, db])

  if (!db || activeSidebarTab === 'none') return null

  // Filter items by profile ID
  const profileBookmarks = db.bookmarks.filter((b: any) => b.profileId === activeProfileId)
  const profileHistory = db.history.filter((h: any) => h.profileId === activeProfileId)
  const profileNotes = db.notes.filter((n: any) => n.profileId === activeProfileId)
  const profileCredentials = db.credentials.filter((c: any) => c.profileId === activeProfileId)
  const profileRules = db.adBlockRules[activeProfileId || ''] || []

  // Handle auto-saves for notes
  const saveActiveNote = () => {
    if (selectedNoteId) {
      updateNote(selectedNoteId, noteTitle || 'Untitled Note', noteContent)
    }
  }

  // Generate password helper
  const handleGeneratePassword = () => {
    const chars =
      'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()_+~`|}{[]:;?><,./-='
    let result = ''
    for (let i = 0; i < passLength; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length))
    }
    setNewCredPass(result)
  }

  // Password Strength Evaluator
  const getPasswordStrength = (pass: string) => {
    if (!pass) return { score: 0, label: 'None', color: '#6c757d' }
    let score = 0
    if (pass.length >= 8) score++
    if (pass.length >= 12) score++
    if (/[A-Z]/.test(pass)) score++
    if (/[0-9]/.test(pass)) score++
    if (/[^A-Za-z0-9]/.test(pass)) score++

    if (score <= 2) return { score, label: 'Vulnerable', color: '#ef233c' }
    if (score <= 4) return { score, label: 'Moderate', color: '#ffb703' }
    return { score, label: 'Strong / Safe', color: '#2ec4b6' }
  }

  const handleRevealPassword = async (id: string) => {
    if (decryptedPasswords[id]) {
      // Toggle off
      const updated = { ...decryptedPasswords }
      delete updated[id]
      setDecryptedPasswords(updated)
    } else {
      // Decrypt
      const pass = await decryptCredential(id)
      setDecryptedPasswords({ ...decryptedPasswords, [id]: pass })
    }
  }

  return (
    <div className="sidebar-panel">
      {/* --- Header --- */}
      <div className="sidebar-header">
        <h3 style={{ textTransform: 'capitalize', fontWeight: 600, fontSize: 16 }}>
          {activeSidebarTab === 'adblock' ? 'Shield Blocker' : activeSidebarTab}
        </h3>
        <button className="nav-circle-btn" onClick={() => setSidebarTab('none')}>
          <X size={16} />
        </button>
      </div>

      <div className="sidebar-content scroller">
        {/* ============================================================== */}
        {/* 1. NOTES SUBPANEL                                              */}
        {/* ============================================================== */}
        {activeSidebarTab === 'notes' &&
          (selectedNoteId ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12, height: '100%' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', gap: 8 }}>
                <button
                  className="premium-btn"
                  style={{ padding: '6px 12px', width: 'auto', fontSize: 12 }}
                  onClick={() => {
                    saveActiveNote()
                    setSelectedNoteId(null)
                  }}
                >
                  Save & Back
                </button>
                <button
                  className="nav-circle-btn"
                  style={{ color: '#ef233c' }}
                  onClick={() => {
                    deleteNote(selectedNoteId)
                    setSelectedNoteId(null)
                  }}
                >
                  <Trash2 size={16} />
                </button>
              </div>
              <input
                type="text"
                placeholder="Note Title"
                className="premium-input"
                value={noteTitle}
                onChange={(e) => setNoteTitle(e.target.value)}
                onBlur={saveActiveNote}
              />
              <textarea
                placeholder="Write your note here... (Auto-saves)"
                className="premium-input"
                style={{ flex: 1, minHeight: 280, resize: 'none', fontSize: 14 }}
                value={noteContent}
                onChange={(e) => setNoteContent(e.target.value)}
                onBlur={saveActiveNote}
              />
            </div>
          ) : (
            <div>
              <button
                className="premium-btn"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 8,
                  marginBottom: 16
                }}
                onClick={() => {
                  const id = 'note-' + Math.random().toString(36).substring(7)
                  addNote('New Note', '')
                  setSelectedNoteId(id)
                  // Zustand triggers re-render, note goes to top
                  setTimeout(() => {
                    const latest = useBrowserStore
                      .getState()
                      .db.notes.filter((n: any) => n.profileId === activeProfileId)[0]
                    if (latest) setSelectedNoteId(latest.id)
                  }, 50)
                }}
              >
                <Plus size={16} />
                <span>Create Note</span>
              </button>

              {profileNotes.length === 0 ? (
                <div
                  style={{
                    textAlign: 'center',
                    padding: 24,
                    color: 'var(--text-secondary)',
                    fontSize: 13
                  }}
                >
                  No notes created yet.
                </div>
              ) : (
                profileNotes.map((n: any) => (
                  <div
                    key={n.id}
                    className="notes-list-item"
                    onClick={() => setSelectedNoteId(n.id)}
                  >
                    <div
                      style={{
                        fontWeight: 500,
                        fontSize: 14,
                        color: 'var(--text-primary)',
                        marginBottom: 4
                      }}
                    >
                      {n.title}
                    </div>
                    <div
                      style={{
                        fontSize: 12,
                        color: 'var(--text-secondary)',
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis'
                      }}
                    >
                      {n.content || 'Empty note content...'}
                    </div>
                  </div>
                ))
              )}
            </div>
          ))}

        {/* ============================================================== */}
        {/* 2. BOOKMARKS SUBPANEL                                          */}
        {/* ============================================================== */}
        {activeSidebarTab === 'bookmarks' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {/* Quick Add Bookmark Form */}
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: 8,
                background: 'var(--bg-tertiary)',
                padding: 12,
                borderRadius: 8
              }}
            >
              <div style={{ fontSize: 13, fontWeight: 500, color: 'var(--text-secondary)' }}>
                Bookmark Current Tab
              </div>
              <button
                className="premium-btn"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 8,
                  padding: '8px 12px'
                }}
                onClick={() => addBookmark(currentTabTitle || 'New Bookmark', currentTabUrl)}
              >
                <Plus size={14} />
                <span>Add Current Page</span>
              </button>

              <div
                style={{
                  fontSize: 12,
                  borderTop: '1px solid var(--border-color)',
                  margin: '6px 0',
                  padding: '6px 0',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 4
                }}
              >
                <input
                  type="text"
                  placeholder="Custom Name"
                  className="premium-input"
                  style={{ height: 28, fontSize: 12, padding: '4px 8px' }}
                  value={bookmarkTitle}
                  onChange={(e) => setBookmarkTitle(e.target.value)}
                />
                <input
                  type="text"
                  placeholder="Custom URL"
                  className="premium-input"
                  style={{ height: 28, fontSize: 12, padding: '4px 8px' }}
                  value={bookmarkUrl}
                  onChange={(e) => setBookmarkUrl(e.target.value)}
                />
                <button
                  className="premium-btn"
                  style={{
                    padding: 4,
                    height: 28,
                    fontSize: 11,
                    backgroundColor: 'transparent',
                    border: '1px solid var(--border-color)',
                    color: 'var(--text-primary)'
                  }}
                  onClick={() => {
                    if (bookmarkUrl) {
                      addBookmark(bookmarkTitle || bookmarkUrl, bookmarkUrl)
                      setBookmarkTitle('')
                      setBookmarkUrl('')
                    }
                  }}
                >
                  Add Custom Link
                </button>
              </div>
            </div>

            {/* List */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {profileBookmarks.length === 0 ? (
                <div
                  style={{
                    textAlign: 'center',
                    padding: 24,
                    color: 'var(--text-secondary)',
                    fontSize: 13
                  }}
                >
                  No bookmarks saved.
                </div>
              ) : (
                profileBookmarks.map((b: any) => (
                  <div
                    key={b.id}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: 8,
                      background: 'var(--bg-tertiary)',
                      borderRadius: 6,
                      gap: 8
                    }}
                  >
                    <div
                      style={{ flex: 1, overflow: 'hidden', cursor: 'pointer' }}
                      onClick={() => store.addTab(b.title, b.url)}
                    >
                      <div
                        style={{
                          fontWeight: 500,
                          fontSize: 13,
                          color: 'var(--text-primary)',
                          whiteSpace: 'nowrap',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis'
                        }}
                      >
                        {b.title}
                      </div>
                      <div
                        style={{
                          fontSize: 11,
                          color: 'var(--text-secondary)',
                          whiteSpace: 'nowrap',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis'
                        }}
                      >
                        {b.url}
                      </div>
                    </div>
                    <button
                      className="nav-circle-btn"
                      style={{ color: '#ef233c', width: 24, height: 24 }}
                      onClick={() => deleteBookmark(b.id)}
                    >
                      <Trash2 size={12} />
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* ============================================================== */}
        {/* 3. DOWNLOADS SUBPANEL                                          */}
        {/* ============================================================== */}
        {activeSidebarTab === 'downloads' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {downloads.length === 0 ? (
              <div
                style={{
                  textAlign: 'center',
                  padding: 24,
                  color: 'var(--text-secondary)',
                  fontSize: 13
                }}
              >
                No active or recent downloads.
              </div>
            ) : (
              downloads.map((d) => (
                <div
                  key={d.id}
                  style={{
                    background: 'var(--bg-tertiary)',
                    padding: 12,
                    borderRadius: 8,
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 8
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <Download
                      size={16}
                      style={{ color: d.status === 'completed' ? '#2ec4b6' : 'var(--bg-accent)' }}
                    />
                    <div
                      style={{
                        fontWeight: 500,
                        fontSize: 13,
                        flex: 1,
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis'
                      }}
                    >
                      {d.filename}
                    </div>
                  </div>

                  {d.status === 'downloading' && (
                    <>
                      <div
                        style={{
                          width: '100%',
                          height: 4,
                          backgroundColor: 'var(--border-color)',
                          borderRadius: 2,
                          overflow: 'hidden'
                        }}
                      >
                        <div
                          style={{
                            height: '100%',
                            width: `${d.progress}%`,
                            backgroundColor: 'var(--bg-accent)'
                          }}
                        />
                      </div>
                      <div
                        style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          fontSize: 11,
                          color: 'var(--text-secondary)'
                        }}
                      >
                        <span>
                          {d.progress}% ({d.speed})
                        </span>
                        <span>
                          {Math.round(d.received / 1000000)} MB / {Math.round(d.total / 1000000)} MB
                        </span>
                      </div>
                      <div style={{ display: 'flex', gap: 8, marginTop: 4 }}>
                        <button
                          className="premium-btn"
                          style={{
                            padding: '4px 8px',
                            fontSize: 11,
                            flex: 1,
                            backgroundColor: 'var(--bg-secondary)',
                            border: '1px solid var(--border-color)',
                            color: 'var(--text-primary)'
                          }}
                          onClick={() => window.api.cancelDownload(d.id)}
                        >
                          Cancel
                        </button>
                      </div>
                    </>
                  )}

                  {d.status === 'completed' && (
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 6,
                        color: '#2ec4b6',
                        fontSize: 11
                      }}
                    >
                      <CheckCircle size={12} />
                      <span>Completed Successfully</span>
                    </div>
                  )}

                  {d.status === 'failed' && (
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 6,
                        color: '#ef233c',
                        fontSize: 11
                      }}
                    >
                      <XCircle size={12} />
                      <span>Failed / Cancelled</span>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        )}

        {/* ============================================================== */}
        {/* 4. HISTORY SUBPANEL                                            */}
        {/* ============================================================== */}
        {activeSidebarTab === 'history' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <div style={{ display: 'flex', gap: 8 }}>
              <input
                type="text"
                placeholder="Search History..."
                className="premium-input"
                style={{ flex: 1, height: 32, fontSize: 13 }}
                value={historySearch}
                onChange={(e) => setHistorySearch(e.target.value)}
              />
              <button
                className="nav-circle-btn"
                style={{ width: 32, height: 32, color: '#ef233c' }}
                title="Clear All History"
                onClick={clearHistory}
              >
                <Trash size={16} />
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {profileHistory.filter(
                (h) =>
                  h.title.toLowerCase().includes(historySearch.toLowerCase()) ||
                  h.url.toLowerCase().includes(historySearch.toLowerCase())
              ).length === 0 ? (
                <div
                  style={{
                    textAlign: 'center',
                    padding: 24,
                    color: 'var(--text-secondary)',
                    fontSize: 13
                  }}
                >
                  No matching history records.
                </div>
              ) : (
                profileHistory
                  .filter(
                    (h) =>
                      h.title.toLowerCase().includes(historySearch.toLowerCase()) ||
                      h.url.toLowerCase().includes(historySearch.toLowerCase())
                  )
                  .map((h: any) => (
                    <div
                      key={h.id}
                      style={{
                        padding: 8,
                        background: 'var(--bg-tertiary)',
                        borderRadius: 6,
                        cursor: 'pointer'
                      }}
                      onClick={() => store.addTab(h.title, h.url)}
                    >
                      <div
                        style={{
                          fontWeight: 500,
                          fontSize: 13,
                          color: 'var(--text-primary)',
                          whiteSpace: 'nowrap',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis'
                        }}
                      >
                        {h.title}
                      </div>
                      <div
                        style={{
                          fontSize: 11,
                          color: 'var(--text-secondary)',
                          whiteSpace: 'nowrap',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis'
                        }}
                      >
                        {h.url}
                      </div>
                      <div style={{ fontSize: 10, color: 'var(--text-secondary)', marginTop: 4 }}>
                        {new Date(h.timestamp).toLocaleTimeString([], {
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </div>
                    </div>
                  ))
              )}
            </div>
          </div>
        )}

        {/* ============================================================== */}
        {/* 5. PASSWORDS SUBPANEL                                          */}
        {/* ============================================================== */}
        {activeSidebarTab === 'passwords' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {/* Quick Lock warning */}
            <div
              style={{
                display: 'flex',
                gap: 10,
                background: 'rgba(131, 56, 236, 0.1)',
                border: '1px solid rgba(131, 56, 236, 0.2)',
                padding: 12,
                borderRadius: 8,
                alignItems: 'center'
              }}
            >
              <Shield size={20} style={{ color: 'var(--bg-accent)', flexShrink: 0 }} />
              <div style={{ fontSize: 12, color: 'var(--text-primary)' }}>
                Vault passwords are locked with AES-256 and isolated to this profile.
              </div>
            </div>

            {/* Save New Credential Form */}
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: 8,
                background: 'var(--bg-tertiary)',
                padding: 12,
                borderRadius: 8
              }}
            >
              <div style={{ fontSize: 13, fontWeight: 500 }}>Save New Credential</div>
              <input
                type="text"
                placeholder="Website / Domain URL"
                className="premium-input"
                style={{ height: 32, fontSize: 13 }}
                value={newCredUrl}
                onChange={(e) => setNewCredUrl(e.target.value)}
              />
              <input
                type="text"
                placeholder="Username / Email"
                className="premium-input"
                style={{ height: 32, fontSize: 13 }}
                value={newCredUser}
                onChange={(e) => setNewCredUser(e.target.value)}
              />
              <input
                type="text"
                placeholder="Password"
                className="premium-input"
                style={{ height: 32, fontSize: 13 }}
                value={newCredPass}
                onChange={(e) => setNewCredPass(e.target.value)}
              />

              {/* Password strength display */}
              {newCredPass && (
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifySelf: 'start',
                    gap: 6,
                    fontSize: 11,
                    fontWeight: 500,
                    color: getPasswordStrength(newCredPass).color
                  }}
                >
                  <AlertTriangle size={12} />
                  <span>Strength: {getPasswordStrength(newCredPass).label}</span>
                </div>
              )}

              {/* Secure generator */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 4 }}>
                <span style={{ fontSize: 11, color: 'var(--text-secondary)' }}>
                  Len: {passLength}
                </span>
                <input
                  type="range"
                  min="8"
                  max="24"
                  style={{ flex: 1, accentColor: 'var(--bg-accent)' }}
                  value={passLength}
                  onChange={(e) => setPassLength(parseInt(e.target.value))}
                />
                <button
                  className="premium-btn"
                  style={{
                    width: 'auto',
                    padding: '4px 8px',
                    fontSize: 11,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 4
                  }}
                  onClick={handleGeneratePassword}
                >
                  <Sparkles size={10} />
                  <span>Generate</span>
                </button>
              </div>

              <button
                className="premium-btn"
                style={{ padding: '8px 12px', marginTop: 8 }}
                onClick={() => {
                  if (newCredUrl && newCredUser && newCredPass) {
                    addCredential(newCredUrl, newCredUser, newCredPass)
                    setNewCredUrl('')
                    setNewCredUser('')
                    setNewCredPass('')
                  }
                }}
              >
                Save to Vault
              </button>
            </div>

            {/* Saved Credentials List */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              <div style={{ fontSize: 13, fontWeight: 500, color: 'var(--text-secondary)' }}>
                Saved Credentials
              </div>

              {profileCredentials.length === 0 ? (
                <div
                  style={{
                    textAlign: 'center',
                    padding: 16,
                    color: 'var(--text-secondary)',
                    fontSize: 12
                  }}
                >
                  Vault is empty.
                </div>
              ) : (
              profileCredentials.map((c: any) => (
                <div
                  key={c.id}
                  style={{
                    background: 'var(--bg-tertiary)',
                    padding: 14,
                    borderRadius: 10,
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 8,
                    border: '1px solid var(--border-color)'
                  }}
                >
                  {/* Header row */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <div style={{ fontWeight: 700, fontSize: 13, color: 'var(--text-primary)' }}>
                        {c.url}
                      </div>
                      <div style={{ fontSize: 11, color: 'var(--text-secondary)', marginTop: 2 }}>
                        👤 {c.username}
                      </div>
                    </div>
                    <div style={{ display: 'flex', gap: 4 }}>
                      <button
                        className="nav-circle-btn"
                        style={{ width: 26, height: 26 }}
                        title="Open site in new tab"
                        onClick={() => store.addTab(c.url, c.url.startsWith('http') ? c.url : `https://${c.url}`)}
                      >
                        <span style={{ fontSize: 11 }}>↗</span>
                      </button>
                      <button
                        className="nav-circle-btn"
                        style={{ color: '#ef233c', width: 26, height: 26 }}
                        title="Delete credential"
                        onClick={() => deleteCredential(c.id)}
                      >
                        <Trash2 size={12} />
                      </button>
                    </div>
                  </div>

                  {/* Password row */}
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 6,
                      background: 'var(--bg-secondary)',
                      padding: '6px 10px',
                      borderRadius: 6
                    }}
                  >
                    <span
                      style={{
                        flex: 1,
                        fontFamily: decryptedPasswords[c.id] ? 'var(--font-mono)' : 'inherit',
                        fontSize: 13,
                        letterSpacing: decryptedPasswords[c.id] ? 0 : 2,
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap'
                      }}
                    >
                      {decryptedPasswords[c.id] ? decryptedPasswords[c.id] : '••••••••••••'}
                    </span>
                    {decryptedPasswords[c.id] && (
                      <button
                        className="nav-circle-btn"
                        style={{ width: 22, height: 22 }}
                        title="Copy password"
                        onClick={() => navigator.clipboard.writeText(decryptedPasswords[c.id])}
                      >
                        <span style={{ fontSize: 10 }}>📋</span>
                      </button>
                    )}
                    <button
                      className="nav-circle-btn"
                      style={{ width: 22, height: 22 }}
                      title={decryptedPasswords[c.id] ? 'Hide password' : 'Reveal password'}
                      onClick={() => handleRevealPassword(c.id)}
                    >
                      {decryptedPasswords[c.id] ? <EyeOff size={12} /> : <Eye size={12} />}
                    </button>
                  </div>
                </div>
              ))
            )}
            </div>
          </div>
        )}

        {/* ============================================================== */}
        {/* 6. THEME STUDIO SUBPANEL                                       */}
        {/* ============================================================== */}
        {activeSidebarTab === 'theme' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <div style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 8 }}>
              Select dynamic design style
            </div>

            {[
              { id: 'dark', name: 'Premium Slate Dark', color: '#1a1c27', text: '#f8f9fa' },
              { id: 'light', name: 'Premium Slate Light', color: '#ffffff', text: '#1d2d44' },
              { id: 'amoled', name: 'AMOLED Pure Pitch Black', color: '#000000', text: '#00f5d4' },
              { id: 'custom', name: 'Cosmic Sunset Neon', color: '#120c1f', text: '#ff007f' }
            ].map((t) => {
              const activeProfile = db.profiles.find((p: any) => p.id === activeProfileId)
              const isActive = activeProfile?.themeId === t.id

              return (
                <div
                  key={t.id}
                  onClick={() => updateProfileTheme(t.id)}
                  style={{
                    background: t.color,
                    color: t.text,
                    padding: 16,
                    borderRadius: 8,
                    cursor: 'pointer',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    border: isActive ? '2px solid var(--bg-accent)' : '2px solid transparent',
                    boxShadow: 'var(--shadow-sm)'
                  }}
                >
                  <span style={{ fontWeight: 500, fontSize: 13 }}>{t.name}</span>
                  {isActive && <Check size={16} />}
                </div>
              )
            })}
          </div>
        )}

        {/* ============================================================== */}
        {/* 7. AD BLOCKER RULES SUBPANEL                                  */}
        {/* ============================================================== */}
        {activeSidebarTab === 'adblock' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {/* Dashboard status */}
            <div
              style={{
                background: 'var(--bg-tertiary)',
                padding: 16,
                borderRadius: 8,
                textAlign: 'center'
              }}
            >
              <Shield size={32} style={{ color: 'var(--bg-accent)', margin: '0 auto 8px' }} />
              <div style={{ fontSize: 28, fontWeight: 700 }}>{store.adBlockedCount}</div>
              <div
                style={{
                  fontSize: 11,
                  color: 'var(--text-secondary)',
                  textTransform: 'uppercase',
                  letterSpacing: 0.5
                }}
              >
                Ads & Trackers Blocked on Profile
              </div>
            </div>

            {/* Custom Rules Setup */}
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: 8,
                background: 'var(--bg-tertiary)',
                padding: 12,
                borderRadius: 8
              }}
            >
              <div style={{ fontSize: 13, fontWeight: 500 }}>Create Exception Rule</div>
              <input
                type="text"
                placeholder="e.g. github.com"
                className="premium-input"
                style={{ height: 32, fontSize: 13 }}
                value={newRuleDomain}
                onChange={(e) => setNewRuleDomain(e.target.value)}
              />
              <div style={{ display: 'flex', gap: 8 }}>
                <button
                  className="premium-btn"
                  style={{
                    flex: 1,
                    padding: 6,
                    fontSize: 11,
                    backgroundColor:
                      newRuleAction === 'block' ? 'var(--bg-accent)' : 'var(--bg-secondary)',
                    color: newRuleAction === 'block' ? 'var(--text-accent)' : 'var(--text-primary)',
                    border: '1px solid var(--border-color)'
                  }}
                  onClick={() => setNewRuleAction('block')}
                >
                  Strict Block
                </button>
                <button
                  className="premium-btn"
                  style={{
                    flex: 1,
                    padding: 6,
                    fontSize: 11,
                    backgroundColor:
                      newRuleAction === 'allow' ? 'var(--bg-accent)' : 'var(--bg-secondary)',
                    color: newRuleAction === 'allow' ? 'var(--text-accent)' : 'var(--text-primary)',
                    border: '1px solid var(--border-color)'
                  }}
                  onClick={() => setNewRuleAction('allow')}
                >
                  Allow Ads
                </button>
              </div>
              <button
                className="premium-btn"
                style={{ padding: '8px 12px', marginTop: 4 }}
                onClick={() => {
                  if (newRuleDomain) {
                    addAdBlockRule(newRuleDomain.trim().toLowerCase(), newRuleAction)
                    setNewRuleDomain('')
                  }
                }}
              >
                Add Custom Rule
              </button>
            </div>

            {/* Custom Rules List */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              <div style={{ fontSize: 13, fontWeight: 500, color: 'var(--text-secondary)' }}>
                Exception Rules
              </div>

              {profileRules.length === 0 ? (
                <div
                  style={{
                    textAlign: 'center',
                    padding: 12,
                    color: 'var(--text-secondary)',
                    fontSize: 12
                  }}
                >
                  No custom rules set.
                </div>
              ) : (
                profileRules.map((r: any) => (
                  <div
                    key={r.domain}
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      background: 'var(--bg-tertiary)',
                      padding: '8px 12px',
                      borderRadius: 6
                    }}
                  >
                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                      <span style={{ fontWeight: 600, fontSize: 13 }}>{r.domain}</span>
                      <span
                        style={{
                          fontSize: 10,
                          color: r.adBlockAction === 'block' ? '#ef233c' : '#2ec4b6'
                        }}
                      >
                        {r.adBlockAction === 'block' ? 'Block List' : 'Allow List'}
                      </span>
                    </div>
                    <button
                      className="nav-circle-btn"
                      style={{ color: '#ef233c', width: 24, height: 24 }}
                      onClick={() => deleteAdBlockRule(r.domain)}
                    >
                      <Trash2 size={12} />
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* ============================================================== */}
        {/* 8. ACTIVE PROFILE CONFIGURATIONS SUBPANEL                      */}
        {/* ============================================================== */}
        {activeSidebarTab === 'profile' &&
          (() => {
            const activeProfile = db.profiles.find((p: any) => p.id === activeProfileId)
            if (!activeProfile) return null

            const isLockNew = activeProfile.lockType === 'none' && profileLockTypeInput !== 'none'

            const profileIconsList = [
              { name: 'User', label: 'Personal' },
              { name: 'Briefcase', label: 'Work' },
              { name: 'GraduationCap', label: 'Study' },
              { name: 'Home', label: 'Family' },
              { name: 'Gamepad2', label: 'Gaming' },
              { name: 'Shield', label: 'Private' },
              { name: 'Compass', label: 'Guest' },
              { name: 'Sparkles', label: 'Creative' },
              { name: 'Heart', label: 'Health' }
            ]

            const handleSave = async (e: React.FormEvent) => {
              e.preventDefault()
              if (!profileNameInput.trim()) return
              await updateProfile(
                activeProfile.id,
                profileNameInput,
                profileAvatarInput,
                profileLockTypeInput,
                profileCodeInput
              )
              alert('Profile settings saved successfully!')
            }

            const handleDeleteClick = async () => {
              if (activeProfile.id === 'default') {
                alert('The primary Default profile cannot be deleted.')
                return
              }
              if (
                confirm(
                  `Are you sure you want to delete profile "${profileNameInput}"? This will delete all its bookmarks, history, passwords, and workspaces!`
                )
              ) {
                await deleteProfile(activeProfile.id)
              }
            }

            return (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                <form
                  onSubmit={handleSave}
                  style={{ display: 'flex', flexDirection: 'column', gap: 16 }}
                >
                  <div>
                    <label
                      style={{
                        display: 'block',
                        fontSize: 12,
                        fontWeight: 600,
                        marginBottom: 6,
                        color: 'var(--text-secondary)'
                      }}
                    >
                      Profile Name
                    </label>
                    <input
                      type="text"
                      className="premium-input"
                      value={profileNameInput}
                      onChange={(e) => setProfileNameInput(e.target.value)}
                      required
                    />
                  </div>

                  <div>
                    <label
                      style={{
                        display: 'block',
                        fontSize: 12,
                        fontWeight: 600,
                        marginBottom: 6,
                        color: 'var(--text-secondary)'
                      }}
                    >
                      Avatar Icon
                    </label>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 8 }}>
                      {profileIconsList.map((icon) => (
                        <button
                          key={icon.name}
                          type="button"
                          onClick={() => setProfileAvatarInput(icon.name)}
                          style={{
                            cursor: 'pointer',
                            padding: 8,
                            borderRadius: 6,
                            border:
                              profileAvatarInput === icon.name
                                ? '2px solid var(--bg-accent)'
                                : '1px solid var(--border-color)',
                            backgroundColor: 'var(--bg-tertiary)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color:
                              profileAvatarInput === icon.name
                                ? 'var(--bg-accent)'
                                : 'var(--text-secondary)',
                            transition: 'all 0.2s'
                          }}
                          title={icon.label}
                        >
                          <AvatarIcon name={icon.name} size={16} />
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label
                      style={{
                        display: 'block',
                        fontSize: 12,
                        fontWeight: 600,
                        marginBottom: 6,
                        color: 'var(--text-secondary)'
                      }}
                    >
                      Lock Type
                    </label>
                    <select
                      className="premium-input"
                      style={{ cursor: 'pointer' }}
                      value={profileLockTypeInput}
                      onChange={(e) => {
                        setProfileLockTypeInput(e.target.value as any)
                        setProfileCodeInput('')
                      }}
                    >
                      <option value="none">No Lock (Quick Switch)</option>
                      <option value="password">Password Locked</option>
                      <option value="pin">PIN Code Locked</option>
                    </select>
                  </div>

                  {profileLockTypeInput !== 'none' && (
                    <div>
                      <label
                        style={{
                          display: 'block',
                          fontSize: 12,
                          fontWeight: 600,
                          marginBottom: 6,
                          color: 'var(--text-secondary)'
                        }}
                      >
                        {isLockNew
                          ? `Set ${profileLockTypeInput === 'pin' ? 'PIN' : 'Password'}`
                          : `Update Password / PIN (Leave blank to keep current)`}
                      </label>
                      <div style={{ position: 'relative', width: '100%' }}>
                        <input
                          type={
                            showProfileCodeInput
                              ? 'text'
                              : profileLockTypeInput === 'pin'
                                ? 'number'
                                : 'password'
                          }
                          placeholder={
                            isLockNew
                              ? `Enter ${profileLockTypeInput === 'pin' ? 'PIN digits' : 'password text'}`
                              : `Enter new ${profileLockTypeInput === 'pin' ? 'PIN' : 'password'} (blank to keep)`
                          }
                          className="premium-input"
                          style={{ paddingRight: 40 }}
                          value={profileCodeInput}
                          onChange={(e) => setProfileCodeInput(e.target.value)}
                          required={isLockNew}
                        />
                        <button
                          type="button"
                          className="nav-circle-btn"
                          style={{ position: 'absolute', right: 8, top: 8, width: 24, height: 24 }}
                          onClick={() => setShowProfileCodeInput(!showProfileCodeInput)}
                        >
                          {showProfileCodeInput ? <EyeOff size={12} /> : <Eye size={12} />}
                        </button>
                      </div>
                    </div>
                  )}

                  <button
                    type="submit"
                    className="premium-btn"
                    style={{
                      padding: '10px 14px',
                      fontSize: 13,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: 6
                    }}
                  >
                    <Check size={14} />
                    <span>Save Settings</span>
                  </button>
                </form>

                {activeProfile.id !== 'default' && (
                  <div
                    style={{
                      borderTop: '1px solid var(--border-color)',
                      paddingTop: 16,
                      marginTop: 8
                    }}
                  >
                    <button
                      type="button"
                      onClick={handleDeleteClick}
                      className="premium-btn"
                      style={{
                        backgroundColor: '#ef233c',
                        color: '#ffffff',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: 8,
                        padding: '10px 14px',
                        fontSize: 13
                      }}
                    >
                      <Trash2 size={14} />
                      <span>Delete Profile</span>
                    </button>
                  </div>
                )}
              </div>
            )
          })()}


      </div>
    </div>
  )
}


