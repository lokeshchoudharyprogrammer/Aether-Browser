<div align="center">

# 🌐 Aether Browser

**An isolated, multi-profile developer-focused desktop web browser**
Built with Electron · React · TypeScript · Zustand

[![Platform](https://img.shields.io/badge/Platform-Windows%20%7C%20macOS%20%7C%20Linux-blue)](#)
[![Electron](https://img.shields.io/badge/Electron-39-47848f)](#)
[![React](https://img.shields.io/badge/React-19-61dafb)](#)
[![License](https://img.shields.io/badge/License-MIT-green)](#)

</div>

---

## 📖 Table of Contents

1. [What is Aether Browser?](#what-is-aether-browser)
2. [✨ Features](#features)
3. [🖼️ Screenshots](#screenshots)
4. [🛠️ Tech Stack](#tech-stack)
5. [📁 Project Structure](#project-structure)
6. [⚡ Quick Start — Development](#quick-start--development)
7. [🔧 Continuing Development](#continuing-development)
8. [📦 Build for Production](#build-for-production)
9. [🪟 Build & Distribute for Windows](#build--distribute-for-windows)
10. [🍎 Build for macOS](#build-for-macos)
11. [🐧 Build for Linux](#build-for-linux)
12. [🚀 Distribute / Share for Download](#distribute--share-for-download)
13. [⌨️ Keyboard Shortcuts](#keyboard-shortcuts)
14. [📚 Architecture Docs](#architecture-docs)
15. [🤝 Contributing](#contributing)

---

## What is Aether Browser?

Aether Browser is a **privacy-first, developer-centric desktop browser** built on top of Electron (Chromium). It provides true local multi-profile isolation — each profile has its own cookies, cache, history, bookmarks, notes, and workspaces — completely separated at the OS level.

It's designed for developers, power users, and privacy-conscious users who need to manage multiple identities (work, personal, client projects) in a single app without profiles leaking into each other.

---

## Features

### 🔐 Multi-Profile System
- Create unlimited isolated profiles (Developer, Personal, Client, etc.)
- Each profile has its own: cookies · cache · history · bookmarks · notes · workspaces
- **Sleek Landing Dashboard** — Access workspaces via a modal-free, full-screen profile selection flow with radial gradient vignettes
- **PIN-locked profiles** — lock any profile with a numeric PIN code
- **Profile avatar** system with emoji/icon selection

### 🗂️ Workspaces & Tab System
- Organize tabs into named workspaces inside each profile
- Switch between workspaces instantly without losing tab state
- **Compact Pinned Tabs** — Pinned tabs automatically collapse to a small size (36px width), hiding title text and close buttons
- **Hover Unpin Toggle** — Hovering over a pinned tab swaps the favicon with a clickable unpin icon
- Create, rename, and delete workspaces per profile

### 🛡️ Built-in Ad Blocker
- Intercepts tracking and ad requests at the network layer
- Live counter showing total blocked requests per profile
- Works across all websites automatically — no setup needed

### 🏠 Premium Start Page (New Tab Page)
- **Live system bar** with clock, network status, and profile indicator
- **Dev Speed Dial** — one-click shortcuts to GitHub, MDN, NPM, StackOverflow, etc.
- **Scratch Pad** — in-browser code scratchpad that saves to the notes panel
- **Developer Toolbox** — live Base64, URL encode/decode, JSON formatter, JWT decoder, Regex sandbox
- **Keyboard Shortcut Reference** card — always visible on the home page

### 📚 Sidebar Panels
- **Bookmarks** — add, view, delete bookmarks per profile
- **History** — full browsing history per profile with search
- **Notes** — persistent markdown-style notes saved to the current profile
- All panels slide in/out with keyboard shortcuts or toolbar buttons

### ⌨️ Keyboard Shortcuts
- Full shortcut system for tab management, sidebar panels, and profile switching
- OS-level accelerators (work even when focus is inside a web page)
- Shortcut reference card visible on every new tab page

### 🎨 Dark Mode UI
- Fully dark glassmorphism UI — no light mode clutter
- CSS variable based theming — easy to extend and customize
- Monospace developer aesthetic inspired by VS Code / Arc Browser

### 🌐 Smart URL Bar & Suggestions
- Detects URLs vs search queries automatically
- **Live Autocomplete Suggestions** — Displays a debounced, premium suggestions dropdown on both the Start Page and the top address bar with full keyboard arrow-key navigation support
- Supports Google, DuckDuckGo, and Bing as search engines
- Switch search engine per-session from the new tab page

---

## Tech Stack

| Layer | Technology |
|---|---|
| **Desktop Shell** | [Electron 39](https://www.electronjs.org/) (Chromium) |
| **Frontend Framework** | [React 19](https://react.dev/) + TypeScript |
| **Build Tool** | [electron-vite](https://electron-vite.org/) + Vite 7 |
| **State Management** | [Zustand 5](https://zustand-demo.pmnd.rs/) |
| **IPC Bridge** | Electron Context Bridge (`preload/index.ts`) |
| **Icons** | [Lucide React](https://lucide.dev/) |
| **Packaging** | [electron-builder 26](https://www.electron.build/) |
| **Encryption** | crypto-js (AES-256 for profile PIN lock) |

---

## Project Structure

```
kitkatbrowser/
├── src/
│   ├── main/
│   │   ├── index.ts          # Main process — window creation, IPC handlers, app menu
│   │   └── db.ts             # SQLite-style in-memory database (profiles, bookmarks, history)
│   ├── preload/
│   │   ├── index.ts          # Context Bridge — exposes safe APIs to renderer
│   │   └── index.d.ts        # TypeScript types for window.api
│   └── renderer/
│       └── src/
│           ├── App.tsx        # Root component — tab bar, sidebar, webviews, shortcuts
│           ├── main.tsx       # React entry point
│           ├── store/
│           │   └── browserStore.ts   # Zustand global state (tabs, profiles, DB)
│           ├── components/
│           │   ├── ProfilePortal.tsx  # Profile selection, creation, PIN lock screen
│           │   ├── StartPage.tsx      # New tab / home page (search, speed dial, toolbox)
│           │   ├── SidebarPanel.tsx   # Bookmarks, history, and notes panels
│           │   └── AvatarIcon.tsx     # Profile avatar icon renderer
│           └── assets/
│               └── main.css   # Global design system (CSS variables, animations)
├── build/
│   ├── icon.ico              # Windows app icon (ADD THIS before building)
│   ├── icon.icns             # macOS app icon (ADD THIS before building)
│   └── icon.png              # Linux app icon (ADD THIS before building)
├── docs/                     # 25 detailed architecture docs
├── electron-builder.yml      # Packaging config (targets, installer settings)
├── electron.vite.config.ts   # Vite + Electron build config
└── package.json              # Scripts, dependencies, version
```

---

## Quick Start — Development

### Prerequisites

- **Node.js** 20 or later → [nodejs.org](https://nodejs.org)
- **npm** (comes with Node)
- **Git** → [git-scm.com](https://git-scm.com)

### 1. Clone the repository

```bash
git clone https://github.com/YOUR_USERNAME/aether-browser.git
cd aether-browser
```

### 2. Install dependencies

```bash
npm install
```

### 3. Launch in development mode

```bash
npm run dev
```

This starts the app with **Hot Module Replacement (HMR)** — any code change you save instantly updates the app without restarting.

---

## Continuing Development

### How the codebase works

The app has **two processes** that communicate via IPC:

```
Main Process (Node.js)          Renderer Process (Browser/React)
─────────────────────           ────────────────────────────────
src/main/index.ts               src/renderer/src/App.tsx
  - Creates BrowserWindow          - Tab bar UI
  - Manages app menu               - Sidebar panels
  - Handles IPC messages           - WebView management
  - Registers OS shortcuts         - Profile switching

src/preload/index.ts  ←──────── window.api ─────────────────────
  - Context Bridge                 - Renderer calls window.api.*
  - Safe API exposure              - Main responds via ipcMain
```

### Adding a new feature — step by step

#### Adding a new IPC channel (e.g. a new button that calls main process):

1. **`src/preload/index.ts`** — expose the new method:
   ```ts
   myFeature: (data: string) => ipcRenderer.invoke('my-feature', data)
   ```

2. **`src/preload/index.d.ts`** — add the TypeScript type:
   ```ts
   myFeature: (data: string) => Promise<void>
   ```

3. **`src/main/index.ts`** — handle it:
   ```ts
   ipcMain.handle('my-feature', async (_, data) => {
     // do something
   })
   ```

4. **Renderer** — call it from React:
   ```ts
   await window.api.myFeature('hello')
   ```

#### Adding a new sidebar panel tab:

Edit `src/renderer/src/components/SidebarPanel.tsx` — add a new tab ID to the `SidebarTab` union type in `browserStore.ts` and add the panel JSX.

#### Adding a new keyboard shortcut:

1. In `src/main/index.ts` — add to the `Menu.buildFromTemplate` accelerators array
2. In `src/renderer/src/App.tsx` — add a new `case` to the `onShortcut` handler

### Useful dev commands

```bash
npm run dev          # Start with hot reload
npm run typecheck    # Check TypeScript for errors (run before committing)
npm run lint         # Check code style
npm run format       # Auto-format code with Prettier
```

---

## Build for Production

### Step 1 — Add app icons (required!)

Place these files in the `build/` folder:

| File | Size | Used for |
|---|---|---|
| `build/icon.ico` | 256×256 min | Windows installer & taskbar |
| `build/icon.icns` | 512×512 | macOS dock & DMG |
| `build/icon.png` | 512×512 | Linux app icon |

> **Free icon tool**: Go to [icoconvert.com](https://icoconvert.com) → upload a PNG → download `.ico` → save as `build/icon.ico`

### Step 2 — Update version & metadata in `package.json`

```json
{
  "name": "aether-browser",
  "version": "1.0.0",
  "description": "Privacy-first multi-profile desktop browser",
  "author": "Your Name <you@email.com>"
}
```

### Step 3 — Run the build

```bash
# Build for your current platform
npm run build

# This runs: TypeScript check → Vite build → electron-builder package
```

The output goes to the `dist/` folder.

---

## Build & Distribute for Windows

> **Note**: Building a Windows `.exe` from macOS requires a Windows machine or CI. See options below.

### Option A — Run on a Windows PC (easiest ✅)

On a Windows machine with Node.js installed:

```bash
npm install
npm run build:win
```

**Output:**
```
dist/
└── AetherBrowser-1.0.0-Setup.exe   ← Share this file!
```

The installer includes:
- Install wizard with directory selection
- Desktop shortcut (created automatically)
- Start Menu entry
- Uninstaller (in Add/Remove Programs)

---

### Option B — GitHub Actions CI (builds in cloud, free ✅)

Create `.github/workflows/release.yml` in your project:

```yaml
name: Release Aether Browser

on:
  push:
    tags:
      - 'v*'

jobs:
  build-windows:
    runs-on: windows-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
      - run: npm ci
      - run: npm run build:win
      - uses: softprops/action-gh-release@v2
        with:
          files: dist/*.exe

  build-mac:
    runs-on: macos-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
      - run: npm ci
      - run: npm run build:mac
      - uses: softprops/action-gh-release@v2
        with:
          files: dist/*.dmg

  build-linux:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
      - run: npm ci
      - run: npm run build:linux
      - uses: softprops/action-gh-release@v2
        with:
          files: dist/*.AppImage
```

**Trigger a release:**
```bash
git add .
git commit -m "release: v1.0.0"
git tag v1.0.0
git push origin main --tags
```

GitHub Actions will automatically:
1. Build Windows `.exe`, macOS `.dmg`, and Linux `.AppImage`
2. Create a GitHub Release with all files attached as download assets

---

## Build for macOS

```bash
npm run build:mac
```

**Output:** `dist/AetherBrowser-1.0.0.dmg`

> **Note**: macOS notarization (required for distribution outside the App Store) needs an Apple Developer account ($99/yr). Set `notarize: true` in `electron-builder.yml` and configure your Apple ID credentials.

---

## Build for Linux

```bash
npm run build:linux
```

**Output:**
```
dist/
├── AetherBrowser-1.0.0.AppImage   ← Universal, no install needed
└── AetherBrowser-1.0.0.deb        ← Debian/Ubuntu package
```

---

## Distribute / Share for Download

### GitHub Releases (recommended for open source)

After running GitHub Actions or uploading manually:

1. Go to your repo → **Releases** → **Draft a new release**
2. Set tag to `v1.0.0`, write release notes
3. Upload `AetherBrowser-1.0.0-Setup.exe` (and other platforms)
4. **Publish release**

Users download from a URL like:
```
https://github.com/YOUR_USERNAME/aether-browser/releases/latest
```

### Quick share (Google Drive / Dropbox)

1. Upload `.exe` to Google Drive
2. Right-click → **Share** → **Anyone with the link can view**
3. Click **Copy link** → share it

### Your own website

```html
<a href="https://yoursite.com/downloads/AetherBrowser-1.0.0-Setup.exe"
   download>
  ⬇️ Download Aether Browser for Windows (v1.0.0)
</a>
```

---

## Keyboard Shortcuts

| Shortcut | Action |
|---|---|
| `Cmd/Ctrl + T` | Open new tab |
| `Cmd/Ctrl + W` | Close current tab |
| `Cmd/Ctrl + 1–9` | Jump to tab by number |
| `Cmd/Ctrl + B` | Toggle bookmarks panel |
| `Cmd/Ctrl + L` | Toggle history panel |
| `Cmd/Ctrl + Shift + L` | Toggle notes panel |
| `Cmd/Ctrl + Shift + P` | Switch / lock profile |
| `Cmd/Ctrl + Shift + N` | Open new private window |
| `Cmd/Ctrl + ,` | Open profile settings |

> On Windows/Linux: replace `Cmd` with `Ctrl`

---

## Architecture Docs

Detailed technical documentation lives in the `docs/` folder:

| Doc | Topic |
|---|---|
| [01 System Design](docs/01_system_design.md) | Goals, KPIs, vision |
| [02 High-Level Architecture](docs/02_high_level_architecture.md) | Main/Renderer IPC model |
| [03 Chromium Integration](docs/03_chromium_integration_strategy.md) | WebViews, session partitions |
| [04 Database Schema](docs/04_database_schema.md) | Profile/history/bookmark storage |
| [05 Multi-Profile](docs/05_multi_profile_architecture.md) | Cookie/cache isolation |
| [06 Password Lock](docs/06_password_lock_architecture.md) | PIN encryption, AES-256 vault |
| [07 Workspaces](docs/07_workspace_architecture.md) | Tab grouping, state restore |
| [08 Session Management](docs/08_session_management_architecture.md) | Auto-save, crash recovery |
| [09 Ad Blocker](docs/09_ad_blocker_architecture.md) | Request filtering engine |
| [10 Privacy](docs/10_privacy_architecture.md) | Fingerprint mitigation |
| [11 Security](docs/11_security_architecture.md) | CSP, sandbox hardening |
| [12 Theme Engine](docs/12_theme_engine_design.md) | CSS variable theming |
| [13 Plugins](docs/13_plugin_architecture.md) | Plugin loader architecture |
| [14 Folder Structure](docs/14_folder_structure.md) | Full directory layout |
| [15 Desktop App](docs/15_desktop_application_architecture.md) | OS shortcuts, multi-window |
| [16 Cross-Platform](docs/16_cross_platform_strategy.md) | Packaging, code-signing |
| [17 MVP Roadmap](docs/17_mvp_roadmap.md) | Feature milestones |
| [18 Production Roadmap](docs/18_production_roadmap.md) | Scaling, telemetry |
| [19 Open Source](docs/19_open_source_roadmap.md) | License, governance |
| [20 Sync Strategy](docs/20_scaling_strategy.md) | E2EE profile sync |
| [21 Contributors](docs/21_contributor_guidelines.md) | PR process, code standards |
| [22 Setup Guide](docs/22_technical_documentation.md) | Local build troubleshooting |
| [23 Security Checklist](docs/23_security_review_checklist.md) | Code audit checklist |
| [24 Browser Store](docs/24_browser_store_architecture.md) | Extension distribution |
| [25 AI Integration](docs/25_future_ai_integration_plan.md) | Future local AI features |

---

## Contributing

1. **Fork** this repo
2. Create a branch: `git checkout -b feature/my-feature`
3. Make your changes
4. Run `npm run typecheck && npm run lint` — fix any errors
5. Commit: `git commit -m "feat: add my feature"`
6. Push and open a **Pull Request**

Please follow [Conventional Commits](https://www.conventionalcommits.org/) for commit messages:
- `feat:` — new feature
- `fix:` — bug fix
- `refactor:` — code cleanup
- `docs:` — documentation update

---

<div align="center">

Made with ❤️ using Electron + React

**[⬆ Back to Top](#aether-browser)**

</div>
