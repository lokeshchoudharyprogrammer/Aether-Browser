# Scaling Strategy - End-to-End Encrypted Sync Infrastructure

## 1. Zero-Knowledge E2EE Architecture

Project Atlas Sync uses an End-to-End Encrypted (E2EE) architecture. The sync server stores only encrypted payloads and cannot read bookmarks, history records, notes, or passwords. Decryption keys are generated on-device and never shared with the server.

```mermaid
graph TD
    subgraph Client Device A
        DataA[Bookmarks, Notes, Passwords] --> EncryptA[Encrypt: AES-GCM-256]
        KeyA[Derived Sync Key] --> EncryptA
        EncryptA --> BlobA[Encrypted Payload Blob]
    end

    subgraph Zero-Knowledge Sync Server
        BlobA -->|HTTPS POST| Server[(Storage Server: PostgreSQL/Redis)]
        Server -->|HTTPS GET| BlobB[Encrypted Payload Blob]
    end

    subgraph Client Device B
        BlobB --> DecryptB[Decrypt: AES-GCM-256]
        KeyB[Sync Key imported via pairing] --> DecryptB
        DecryptB --> DataB[Decrypted Bookmarks, Notes]
    end
```

### Key Derivation for Sync

The Sync Key is derived from a local **Secret Passphrase (12 words)** and the profile identifier using PBKDF2 with 100,000 iterations of SHA-256.

---

## 2. Sync Server APIs (REST and WebSockets)

The sync server coordinates data replication and real-time update notifications across connected devices.

| Endpoint                | Method | Payload                                            | Rationale                                                  |
| :---------------------- | :----- | :------------------------------------------------- | :--------------------------------------------------------- |
| `/api/v1/sync/register` | `POST` | `{ device_name, public_key_hash }`                 | Registers a new device to the user's encrypted pool.       |
| `/api/v1/sync/payloads` | `GET`  | Headers: `If-Modified-Since`                       | Downloads new encrypted change blobs since the last sync.  |
| `/api/v1/sync/payloads` | `POST` | `{ client_version, changes: [{ id, data_blob }] }` | Uploads new encrypted changes to the server database.      |
| `/ws/v1/sync`           | `WS`   | WebSocket Connection                               | Triggers real-time alerts when other devices push updates. |

---

## 3. Conflict Resolution via CRDTs

When multiple devices modify bookmarks or notes concurrently while offline, the browser uses **Conflict-free Replicated Data Types (CRDTs)** to merge changes automatically without data loss.

- **Bookmarks/Notes (LWW-Element-Set)**: Last-Write-Wins element set based on high-resolution UTC timestamps. If Device A updates note title at 12:00:01 and Device B updates it at 12:00:02, Device B's changes are applied.
- **TOC (Tree Structure)**: Bookmarks utilize custom fractional indexing (similar to Figma's positioning model) to maintain sorted positions in parent directories without colliding when items are moved concurrently.

---

## 4. Secure Device Pairing Handshake (SPAKE2)

To link a new device to an existing sync pool securely, we implement a **SPAKE2** key exchange handshake. This allows pairing via a short, human-readable 6-digit PIN code.

```mermaid
sequenceDiagram
    participant DevA as Registered Device A
    participant Server as Relay Server
    participant DevB as New Device B

    DevA->>DevA: Generate 6-Digit PIN & SPAKE2 Parameters
    DevA->>Server: Register exchange channel for PIN
    DevB->>Server: Connect using user-entered 6-Digit PIN

    Note over DevA,DevB: SPAKE2 cryptographic handshake exchange
    DevA->>Server: Send public exchange parameter A
    DevB->>Server: Send public exchange parameter B

    Server->>DevB: Relay A
    Server->>DevA: Relay B

    Note over DevA,DevB: Both derive identical Shared Secret Key
    DevA->>DevB: Send Encrypted Sync Key (via Shared Secret Key)
    DevB->>DevB: Decrypt & save Sync Key to secure store
```

This handshake guarantees that even if a malicious actor intercepts the network traffic, they cannot impersonate a device or compromise the Sync Key without guessing the 6-digit PIN code during the brief pairing window.
