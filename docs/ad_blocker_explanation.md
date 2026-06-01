# KitKat Browser: Ad Blocker Implementation

This document outlines how the ad and tracker blocker is currently implemented in the browser. While `09_ad_blocker_architecture.md` outlines an aspirational architecture using a Rust-based N-API module, the current implementation leverages a lightweight, pure-TypeScript approach optimized for startup speed and low-latency request interception using JavaScript `Set` structures.

## 1. Blocklist Generation (`scripts/build-blocklist.js`)

Instead of parsing raw EasyList and EasyPrivacy rules at runtime, a build step pre-processes these rules.

*   **Inputs**: Raw text lists located in the `resources/` folder (e.g., `easylist_adservers.txt`, `easyprivacy_trackers.txt`).
*   **Processing**:
    *   The script skips comments, cosmetic rules, and complex exception rules.
    *   It extracts exact domain matches (`||example.com^`) and saves them as a list of domains.
    *   It extracts short keyword patterns (`/ads/`, etc.) and combines them with a curated list of high-signal tracker patterns (e.g., `googleads`, `doubleclick`, `google-analytics`).
*   **Output**: A compact JSON file `resources/blocklist.json` containing `domains` (an array) and `patterns` (an array).

## 2. Startup & In-Memory Storage (`src/main/index.ts`)

When the Main Process (Electron) starts, it loads the `blocklist.json` file into memory:

*   **Data Structures**:
    *   `blockedDomains` (A JavaScript `Set`): The `domains` array is loaded into a `Set` for O(1) (instant) lookup times.
    *   `blockedPatterns` (An `Array`): Keyword patterns are loaded into a standard array.
*   **Fallback Mechanism**: If `blocklist.json` fails to load (e.g., in a dev environment without the generated file), the browser falls back to a hardcoded array of top trackers and ad networks to ensure baseline protection.

## 3. Request Interception (`session.webRequest.onBeforeRequest`)

The core blocking logic hooks into Electron's network request lifecycle before headers are even sent.

When a session is created for a profile, the browser configures an interceptor:
```typescript
sess.webRequest.onBeforeRequest({ urls: ['http://*/*', 'https://*/*'] }, (details, callback) => { ... })
```

### The Matching Pipeline (`isBlockedUrl`)
For every network request (except `mainFrame` navigations, which are always allowed to prevent breaking site loads), the URL is passed to the `isBlockedUrl(url)` function:

1.  **Fast Path (Exact Domain)**: It parses the domain and checks `blockedDomains.has(hostname)`. If true, the request is immediately blocked.
2.  **Parent-Domain Match**: If the exact subdomain isn't blocked, it strips the subdomains one by one (e.g., `sub.ads.com` -> `ads.com`) and checks the `Set` again.
3.  **Slow Fallback (Patterns)**: If no domain match is found, it falls back to checking if the full URL string includes any of the keywords in the `blockedPatterns` array.

### Custom Site Overrides (Whitelisting)
Before blocking, the system checks the profile's database (`getDb().adBlockRules`). If the user has disabled ad-blocking for the site initiating the request (`adBlockAction === 'allow'`), the request is permitted.

### Telemetry and UI Updates
If the request is successfully blocked (`callback({ cancel: true })`):
*   The global and profile-specific block counters in the local JSON database (`db.stats`) are incremented.
*   An IPC message (`ad-blocked`) is sent to the active window to update the shield icon counter in the UI in real-time.
