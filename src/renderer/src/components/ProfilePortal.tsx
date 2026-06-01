import React, { useState, useEffect } from 'react'
import { useBrowserStore } from '../store/browserStore'
import { AvatarIcon } from './AvatarIcon'
import {
  UserPlus,
  ShieldAlert,
  ArrowRight,
  X,
  Lock,
  Unlock,
  Eye,
  EyeOff,
  Settings,
  Trash2,
  KeyRound,
  Grid3X3,
  ChevronLeft
} from 'lucide-react'

export const ProfilePortal: React.FC = () => {
  const { db, createProfile, deleteProfile, updateProfile, setActiveProfile } = useBrowserStore()

  const [selectedProfileId, setSelectedProfileId] = useState<string | null>(null)
  const [lockCode, setLockCode] = useState('')
  const [authError, setAuthError] = useState(false)
  const [showAuthCode, setShowAuthCode] = useState(false)

  // Profile creation & editing states
  const [showAddForm, setShowAddForm] = useState(false)
  const [editingProfileId, setEditingProfileId] = useState<string | null>(null)

  const [newName, setNewName] = useState('')
  const [newAvatar, setNewAvatar] = useState('User')
  const [newLockType, setNewLockType] = useState<'none' | 'password' | 'pin'>('none')
  const [newCode, setNewCode] = useState('')
  const [showNewCode, setShowNewCode] = useState(false)

  if (!db) return null

  const profiles = db.profiles

  // Auto-submit PIN when exactly 4 digits are typed
  useEffect(() => {
    if (selectedProfileId) {
      const activeProfile = profiles.find((p: any) => p.id === selectedProfileId)
      if (activeProfile && activeProfile.lockType === 'pin' && lockCode.length === 4) {
        handleAuthSubmit()
      }
    }
  }, [lockCode, selectedProfileId])

  const handleProfileSelect = async (profileId: string) => {
    const profile = profiles.find((p: any) => p.id === profileId)
    if (!profile) return

    if (profile.lockType === 'none') {
      setActiveProfile(profileId)
    } else {
      setSelectedProfileId(profileId)
      setLockCode('')
      setAuthError(false)
      setShowAuthCode(false)
    }
  }

  const handleAuthSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault()
    if (!selectedProfileId) return

    const success = await window.api.verifyProfileLock(selectedProfileId, lockCode)
    if (success) {
      setActiveProfile(selectedProfileId)
      setSelectedProfileId(null)
      setLockCode('')
    } else {
      setAuthError(true)
      setLockCode('')
    }
  }

  const handleCreateProfile = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newName.trim()) return

    await createProfile(newName, newAvatar, newLockType, newCode)

    // Reset states
    setShowAddForm(false)
    setNewName('')
    setNewAvatar('User')
    setNewLockType('none')
    setNewCode('')
    setShowNewCode(false)
  }

  const handleSaveProfileChanges = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editingProfileId || !newName.trim()) return

    await updateProfile(editingProfileId, newName, newAvatar, newLockType, newCode)

    // Exit edit mode
    setEditingProfileId(null)
    setNewName('')
    setNewAvatar('User')
    setNewLockType('none')
    setNewCode('')
    setShowNewCode(false)
  }

  const handleDeleteProfileClick = async () => {
    if (!editingProfileId) return
    if (editingProfileId === 'default') {
      alert('The primary Default profile cannot be deleted.')
      return
    }

    if (
      confirm(
        `Are you sure you want to delete profile "${newName}"? This will delete all its bookmarks, history, passwords, and workspaces!`
      )
    ) {
      await deleteProfile(editingProfileId)
      setEditingProfileId(null)
      setNewName('')
      setNewAvatar('User')
      setNewLockType('none')
      setNewCode('')
      setShowNewCode(false)
    }
  }

  // Pre-configured Lucide icons for profiles
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

  return (
    <div className="lock-portal">
      {/* Background Animated Gradient Mesh */}
      <div className="ambient-orbs-wrapper">
        <div className="ambient-orb ambient-orb-1" />
        <div className="ambient-orb ambient-orb-2" />
        <div className="ambient-orb ambient-orb-3" />
      </div>

      {selectedProfileId ? (
        // --- Redesigned Lock Screen Prompt ---
        <div className="lock-glass-card" style={{ maxWidth: 440 }}>
          <button
            type="button"
            className="nav-circle-btn"
            style={{ position: 'absolute', top: 16, left: 16, display: 'flex', alignItems: 'center', gap: 4, width: 'auto', padding: '0 10px', height: 28 }}
            onClick={() => setSelectedProfileId(null)}
          >
            <ChevronLeft size={14} />
            <span style={{ fontSize: 11 }}>Back</span>
          </button>

          <div
            className="profile-avatar-circle-wrapper"
            style={{
              width: 90,
              height: 90,
              borderWidth: 2,
              borderColor: 'var(--bg-accent, #8338ec)',
              backgroundColor: 'rgba(131, 56, 236, 0.08)'
            }}
          >
            <AvatarIcon
              name={profiles.find((p: any) => p.id === selectedProfileId)?.avatar || 'User'}
              size={36}
              style={{ color: 'var(--bg-accent)' }}
            />
          </div>

          <div style={{ marginTop: -8 }}>
            <h2 style={{ fontSize: 24, fontWeight: 700, color: '#ffffff' }}>
              {profiles.find((p: any) => p.id === selectedProfileId)?.name}
            </h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: 13, marginTop: 4 }}>
              This profile is protected
            </p>
          </div>

          <form
            onSubmit={handleAuthSubmit}
            style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 16 }}
          >
            {profiles.find((p: any) => p.id === selectedProfileId)?.lockType === 'pin' ? (
              // Tactical PIN pad layout
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%' }}>
                {/* Visual PIN dots */}
                <div className="pin-dot-container">
                  {[0, 1, 2, 3].map((idx) => (
                    <div
                      key={idx}
                      className={`pin-dot ${lockCode.length > idx ? 'filled' : ''}`}
                    />
                  ))}
                </div>
                {/* Hidden input to capture physical keyboard input */}
                <input
                  type="text"
                  pattern="\d*"
                  maxLength={4}
                  style={{ opacity: 0, position: 'absolute', pointerEvents: 'none' }}
                  value={lockCode}
                  onChange={(e) => {
                    setLockCode(e.target.value.replace(/\D/g, '').slice(0, 4))
                    setAuthError(false)
                  }}
                  autoFocus
                />
                
                {/* Tactile grid pad */}
                <div className="pin-pad-grid">
                  {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
                    <button
                      key={num}
                      type="button"
                      className="pin-pad-btn"
                      onClick={() => {
                        if (lockCode.length < 4) {
                          setLockCode(prev => prev + num)
                          setAuthError(false)
                        }
                      }}
                    >
                      {num}
                    </button>
                  ))}
                  <button
                    type="button"
                    className="pin-pad-btn"
                    style={{ fontSize: 12, color: '#ef233c', fontWeight: 500 }}
                    onClick={() => {
                      setLockCode('')
                      setAuthError(false)
                    }}
                  >
                    Clear
                  </button>
                  <button
                    type="button"
                    className="pin-pad-btn"
                    onClick={() => {
                      if (lockCode.length < 4) {
                        setLockCode(prev => prev + '0')
                        setAuthError(false)
                      }
                    }}
                  >
                    0
                  </button>
                  <button
                    type="button"
                    className="pin-pad-btn"
                    style={{ fontSize: 14 }}
                    onClick={() => {
                      setLockCode(prev => prev.slice(0, -1))
                      setAuthError(false)
                    }}
                  >
                    ⌫
                  </button>
                </div>
              </div>
            ) : (
              // Regular Password input
              <div style={{ position: 'relative', width: '100%' }}>
                <input
                  type={showAuthCode ? 'text' : 'password'}
                  placeholder="Enter Profile Password"
                  className="premium-input"
                  style={{ paddingRight: 45 }}
                  value={lockCode}
                  onChange={(e) => {
                    setLockCode(e.target.value)
                    setAuthError(false)
                  }}
                  autoFocus
                />
                <button
                  type="button"
                  className="nav-circle-btn"
                  style={{ position: 'absolute', right: 10, top: 6, width: 28, height: 28 }}
                  onClick={() => setShowAuthCode(!showAuthCode)}
                >
                  {showAuthCode ? <EyeOff size={14} /> : <Eye size={14} />}
                </button>
              </div>
            )}

            {authError && (
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  color: '#ef233c',
                  fontSize: 12,
                  justifyContent: 'center',
                  marginTop: -4
                }}
              >
                <ShieldAlert size={14} />
                <span>Incorrect credentials, try again</span>
              </div>
            )}

            {profiles.find((p: any) => p.id === selectedProfileId)?.lockType !== 'pin' && (
              <button
                type="submit"
                className="premium-btn"
                style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, height: 42 }}
              >
                <span>Unlock Profile</span>
                <ArrowRight size={16} />
              </button>
            )}
          </form>
        </div>
      ) : showAddForm ? (
        // --- Redesigned Create Profile Form ---
        <div className="lock-glass-card" style={{ maxWidth: 460 }}>
          <button
            type="button"
            className="nav-circle-btn"
            style={{ position: 'absolute', top: 16, right: 16 }}
            onClick={() => setShowAddForm(false)}
          >
            <X size={18} />
          </button>

          <div style={{ alignSelf: 'start', textAlign: 'left' }}>
            <h2 style={{ fontSize: 24, fontWeight: 700, color: '#ffffff' }}>New Workspace</h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: 13, marginTop: 4 }}>
              Configure a dedicated sandboxed environment
            </p>
          </div>

          <form
            onSubmit={handleCreateProfile}
            style={{
              width: '100%',
              display: 'flex',
              flexDirection: 'column',
              gap: 20,
              textAlign: 'left'
            }}
          >
            <div>
              <label
                style={{
                  display: 'block',
                  fontSize: 12,
                  fontWeight: 600,
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                  marginBottom: 6,
                  color: 'var(--text-secondary)'
                }}
              >
                Profile Name
              </label>
              <input
                type="text"
                placeholder="e.g. Work, Study, Testing"
                className="premium-input"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                required
              />
            </div>

            <div>
              <label
                style={{
                  display: 'block',
                  fontSize: 12,
                  fontWeight: 600,
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                  marginBottom: 6,
                  color: 'var(--text-secondary)'
                }}
              >
                Avatar Accent Icon
              </label>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                {profileIconsList.map((icon) => (
                  <button
                    key={icon.name}
                    type="button"
                    onClick={() => setNewAvatar(icon.name)}
                    style={{
                      cursor: 'pointer',
                      padding: '10px 12px',
                      borderRadius: 12,
                      border:
                        newAvatar === icon.name
                          ? '1px solid var(--bg-accent)'
                          : '1px solid rgba(255, 255, 255, 0.05)',
                      backgroundColor:
                        newAvatar === icon.name
                          ? 'rgba(131, 56, 236, 0.1)'
                          : 'rgba(255, 255, 255, 0.02)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: newAvatar === icon.name ? 'var(--bg-accent)' : 'var(--text-secondary)',
                      transition: 'all 0.2s'
                    }}
                    title={icon.label}
                  >
                    <AvatarIcon name={icon.name} size={18} />
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
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                  marginBottom: 8,
                  color: 'var(--text-secondary)'
                }}
              >
                Profile Lock Protection
              </label>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8 }}>
                {[
                  { value: 'none', label: 'No Lock', desc: 'Instant switch', icon: Unlock },
                  { value: 'password', label: 'Password', desc: 'Secure text', icon: KeyRound },
                  { value: 'pin', label: 'PIN Code', desc: '4-digit code', icon: Grid3X3 }
                ].map((opt) => {
                  const Icon = opt.icon
                  const isSelected = newLockType === opt.value
                  return (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => {
                        setNewLockType(opt.value as any)
                        setNewCode('')
                      }}
                      style={{
                        padding: '12px 6px',
                        borderRadius: 12,
                        border: isSelected ? '1px solid var(--bg-accent)' : '1px solid rgba(255,255,255,0.06)',
                        background: isSelected ? 'rgba(131, 56, 236, 0.08)' : 'rgba(255,255,255,0.02)',
                        color: isSelected ? '#fff' : 'var(--text-secondary)',
                        cursor: 'pointer',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        gap: 6,
                        transition: 'all 0.2s'
                      }}
                    >
                      <Icon size={16} style={{ color: isSelected ? 'var(--bg-accent)' : 'var(--text-secondary)' }} />
                      <span style={{ fontSize: 11, fontWeight: 600 }}>{opt.label}</span>
                      <span style={{ fontSize: 9, opacity: 0.6, textAlign: 'center' }}>{opt.desc}</span>
                    </button>
                  )
                })}
              </div>
            </div>

            {newLockType !== 'none' && (
              <div>
                <label
                  style={{
                    display: 'block',
                    fontSize: 12,
                    fontWeight: 600,
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em',
                    marginBottom: 6,
                    color: 'var(--text-secondary)'
                  }}
                >
                  Set Profile {newLockType === 'pin' ? 'PIN (Digits Only)' : 'Password'}
                </label>
                <div style={{ position: 'relative', width: '100%' }}>
                  <input
                    type={showNewCode ? 'text' : newLockType === 'pin' ? 'number' : 'password'}
                    placeholder={newLockType === 'pin' ? 'e.g. 1234' : 'Enter password text'}
                    className="premium-input"
                    style={{ paddingRight: 45 }}
                    value={newCode}
                    onChange={(e) => {
                      const val = e.target.value
                      setNewCode(newLockType === 'pin' ? val.replace(/\D/g, '').slice(0, 4) : val)
                    }}
                    required
                  />
                  <button
                    type="button"
                    className="nav-circle-btn"
                    style={{ position: 'absolute', right: 10, top: 6, width: 28, height: 28 }}
                    onClick={() => setShowNewCode(!showNewCode)}
                  >
                    {showNewCode ? <EyeOff size={14} /> : <Eye size={14} />}
                  </button>
                </div>
              </div>
            )}

            <button type="submit" className="premium-btn" style={{ height: 42, marginTop: 8 }}>
              Create and Enter Workspace
            </button>
          </form>
        </div>
      ) : editingProfileId ? (
        // --- Redesigned Manage/Edit Profile Form ---
        <div className="lock-glass-card" style={{ maxWidth: 460 }}>
          <button
            type="button"
            className="nav-circle-btn"
            style={{ position: 'absolute', top: 16, right: 16 }}
            onClick={() => setEditingProfileId(null)}
          >
            <X size={18} />
          </button>

          <div style={{ alignSelf: 'start', textAlign: 'left' }}>
            <h2 style={{ fontSize: 24, fontWeight: 700, color: '#ffffff' }}>Manage Profile</h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: 13, marginTop: 4 }}>
              Update credentials and visual choices
            </p>
          </div>

          <form
            onSubmit={handleSaveProfileChanges}
            style={{
              width: '100%',
              display: 'flex',
              flexDirection: 'column',
              gap: 20,
              textAlign: 'left'
            }}
          >
            <div>
              <label
                style={{
                  display: 'block',
                  fontSize: 12,
                  fontWeight: 600,
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                  marginBottom: 6,
                  color: 'var(--text-secondary)'
                }}
              >
                Profile Name
              </label>
              <input
                type="text"
                placeholder="e.g. Work, Study"
                className="premium-input"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                required
              />
            </div>

            <div>
              <label
                style={{
                  display: 'block',
                  fontSize: 12,
                  fontWeight: 600,
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                  marginBottom: 6,
                  color: 'var(--text-secondary)'
                }}
              >
                Avatar Accent Icon
              </label>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                {profileIconsList.map((icon) => (
                  <button
                    key={icon.name}
                    type="button"
                    onClick={() => setNewAvatar(icon.name)}
                    style={{
                      cursor: 'pointer',
                      padding: '10px 12px',
                      borderRadius: 12,
                      border:
                        newAvatar === icon.name
                          ? '1px solid var(--bg-accent)'
                          : '1px solid rgba(255, 255, 255, 0.05)',
                      backgroundColor:
                        newAvatar === icon.name
                          ? 'rgba(131, 56, 236, 0.1)'
                          : 'rgba(255, 255, 255, 0.02)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: newAvatar === icon.name ? 'var(--bg-accent)' : 'var(--text-secondary)',
                      transition: 'all 0.2s'
                    }}
                    title={icon.label}
                  >
                    <AvatarIcon name={icon.name} size={18} />
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
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                  marginBottom: 8,
                  color: 'var(--text-secondary)'
                }}
              >
                Lock Protection
              </label>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8 }}>
                {[
                  { value: 'none', label: 'No Lock', desc: 'Instant switch', icon: Unlock },
                  { value: 'password', label: 'Password', desc: 'Secure text', icon: KeyRound },
                  { value: 'pin', label: 'PIN Code', desc: '4-digit code', icon: Grid3X3 }
                ].map((opt) => {
                  const Icon = opt.icon
                  const isSelected = newLockType === opt.value
                  return (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => {
                        setNewLockType(opt.value as any)
                        setNewCode('')
                      }}
                      style={{
                        padding: '12px 6px',
                        borderRadius: 12,
                        border: isSelected ? '1px solid var(--bg-accent)' : '1px solid rgba(255,255,255,0.06)',
                        background: isSelected ? 'rgba(131, 56, 236, 0.08)' : 'rgba(255,255,255,0.02)',
                        color: isSelected ? '#fff' : 'var(--text-secondary)',
                        cursor: 'pointer',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        gap: 6,
                        transition: 'all 0.2s'
                      }}
                    >
                      <Icon size={16} style={{ color: isSelected ? 'var(--bg-accent)' : 'var(--text-secondary)' }} />
                      <span style={{ fontSize: 11, fontWeight: 600 }}>{opt.label}</span>
                      <span style={{ fontSize: 9, opacity: 0.6, textAlign: 'center' }}>{opt.desc}</span>
                    </button>
                  )
                })}
              </div>
            </div>

            {newLockType !== 'none' &&
              (() => {
                const originalProfile = profiles.find((p: any) => p.id === editingProfileId)
                const isLockNew = originalProfile?.lockType === 'none'
                return (
                  <div>
                    <label
                      style={{
                        display: 'block',
                        fontSize: 12,
                        fontWeight: 600,
                        textTransform: 'uppercase',
                        letterSpacing: '0.05em',
                        marginBottom: 6,
                        color: 'var(--text-secondary)'
                      }}
                    >
                      {isLockNew
                        ? `Set Profile ${newLockType === 'pin' ? 'PIN (Digits Only)' : 'Password'}`
                        : `Update Passcode (Leave blank to keep current)`}
                    </label>
                    <div style={{ position: 'relative', width: '100%' }}>
                      <input
                        type={showNewCode ? 'text' : newLockType === 'pin' ? 'number' : 'password'}
                        placeholder={
                          isLockNew
                            ? `Enter ${newLockType === 'pin' ? 'PIN code digits' : 'password text'}`
                            : `Enter new ${newLockType === 'pin' ? 'PIN' : 'password'}...`
                        }
                        className="premium-input"
                        style={{ paddingRight: 45 }}
                        value={newCode}
                        onChange={(e) => {
                          const val = e.target.value
                          setNewCode(newLockType === 'pin' ? val.replace(/\D/g, '').slice(0, 4) : val)
                        }}
                        required={isLockNew}
                      />
                      <button
                        type="button"
                        className="nav-circle-btn"
                        style={{ position: 'absolute', right: 10, top: 6, width: 28, height: 28 }}
                        onClick={() => setShowNewCode(!showNewCode)}
                      >
                        {showNewCode ? <EyeOff size={14} /> : <Eye size={14} />}
                      </button>
                    </div>
                  </div>
                )
              })()}

            <div style={{ display: 'flex', gap: 12, marginTop: 8 }}>
              {editingProfileId !== 'default' && profiles.length > 1 && (
                <button
                  type="button"
                  onClick={handleDeleteProfileClick}
                  style={{
                    backgroundColor: '#ef233c',
                    color: '#ffffff',
                    width: 'auto',
                    padding: '0 16px',
                    borderRadius: 12,
                    border: 'none',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    transition: 'opacity 0.2s'
                  }}
                  title="Delete Profile"
                >
                  <Trash2 size={16} />
                </button>
              )}
              <button type="submit" className="premium-btn" style={{ flex: 1, height: 42 }}>
                Save Settings
              </button>
            </div>
          </form>
        </div>
      ) : (
        // --- Redesigned Profile Selection Grid ---
        <div className="lock-glass-card" style={{ maxWidth: 540 }}>
          <div>
            <h1
              style={{
                fontSize: 34,
                fontWeight: 800,
                letterSpacing: '-0.02em',
                background: 'linear-gradient(135deg, var(--bg-accent, #8338ec) 30%, #ff007f 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                marginBottom: 6
              }}
            >
              Aether Browser
            </h1>
            <p style={{ color: 'var(--text-secondary)', fontSize: 13 }}>
              Select your sandboxed profile workspace to begin
            </p>
          </div>

          <div className="profile-grid">
            {profiles.map((p: any) => {
              const wsCount = (db.workspaces || []).filter((w: any) => w.profileId === p.id).length
              const bmCount = (db.bookmarks || []).filter((b: any) => b.profileId === p.id).length

              return (
                <div
                  key={p.id}
                  className="profile-select-card"
                  onClick={() => handleProfileSelect(p.id)}
                >
                  {/* Settings Gear Button */}
                  <button
                    type="button"
                    className="nav-circle-btn"
                    style={{
                      position: 'absolute',
                      top: 10,
                      right: 10,
                      width: 26,
                      height: 26,
                      padding: 0,
                      opacity: 0.5,
                      backgroundColor: 'rgba(255, 255, 255, 0.02)'
                    }}
                    onClick={(e) => {
                      e.stopPropagation()
                      setEditingProfileId(p.id)
                      setNewName(p.name)
                      setNewAvatar(p.avatar)
                      setNewLockType(p.lockType)
                      setNewCode('')
                      setShowNewCode(false)
                    }}
                  >
                    <Settings size={13} />
                  </button>

                  <div className="profile-avatar-circle-wrapper">
                    <AvatarIcon name={p.avatar} size={24} style={{ color: 'var(--bg-accent, #8338ec)' }} />
                  </div>
                  
                  <div style={{ textAlign: 'center', width: '100%' }}>
                    <div
                      style={{
                        fontWeight: 600,
                        fontSize: 14,
                        color: 'var(--text-primary)',
                        whiteSpace: 'nowrap',
                        width: '100%',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis'
                      }}
                    >
                      {p.name}
                    </div>
                    <div className="profile-badge-count">
                      {wsCount === 1 ? '1 workspace' : `${wsCount} workspaces`}
                      {bmCount > 0 && ` • ${bmCount} ${bmCount === 1 ? 'bookmark' : 'bookmarks'}`}
                    </div>
                  </div>

                  {p.lockType !== 'none' ? (
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 4,
                        fontSize: 10,
                        color: 'var(--text-secondary)',
                        marginTop: 2
                      }}
                    >
                      <Lock size={10} style={{ color: 'var(--bg-accent, #8338ec)' }} />
                      <span>Protected</span>
                    </div>
                  ) : (
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 4,
                        fontSize: 10,
                        color: '#2ec4b6',
                        marginTop: 2
                      }}
                    >
                      <Unlock size={10} style={{ color: '#2ec4b6' }} />
                      <span>Quick Entry</span>
                    </div>
                  )}
                </div>
              )
            })}

            <div
              className="profile-select-card"
              style={{
                borderStyle: 'dashed',
                borderColor: 'rgba(255, 255, 255, 0.15)',
                justifyContent: 'center',
                background: 'rgba(255, 255, 255, 0.01)'
              }}
              onClick={() => {
                setNewName('')
                setNewAvatar('User')
                setNewLockType('none')
                setNewCode('')
                setShowAddForm(true)
              }}
            >
              <div
                className="profile-avatar-circle-wrapper"
                style={{
                  borderStyle: 'dashed',
                  borderColor: 'rgba(255, 255, 255, 0.2)'
                }}
              >
                <UserPlus size={18} style={{ color: 'var(--text-secondary)' }} />
              </div>
              <div
                style={{
                  fontSize: 12,
                  color: 'var(--text-secondary)',
                  fontWeight: 600,
                  marginTop: 4
                }}
              >
                Add Profile
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
