# Goal: Build OpenAdmin (The "Life Ops" Dashboard)

OpenAdmin is a local-first, privacy-focused application designed to manage personal "Life Ops" (warranties, subscriptions, expiring passports) without sending sensitive data to the cloud.

## Objective Architecture Justification

Forget past projects. If we are building a local-first application designed to run in the background for years, we need to optimize for **Security**, **Memory Footprint**, and **Speed**.

Here is an objective comparison of our options in 2026:

1. **Electron (Node.js + Chromium)**: 
   - *Pros:* Massive ecosystem, easiest to build.
   - *Cons:* Extremely bloated. It ships an entire Chromium browser. A simple app will consume 200MB+ of RAM while idling in the background. Unacceptable for a lightweight utility.
2. **Progressive Web App (PWA)**:
   - *Pros:* Runs in the browser, zero install.
   - *Cons:* Very restricted file system access. Browser databases (IndexedDB) can be accidentally cleared by the user, leading to permanent data loss. Background notifications are unreliable.
3. **Flutter**:
   - *Pros:* Very fast, cross-platform.
   - *Cons:* Integrating with complex native libraries (like offline OCR engines) via FFI is painful. The UI doesn't always feel "native" to the OS.
4. **Tauri v2 (Rust + Web UI)**:
   - *Pros:* Uses the OS's native webview instead of shipping Chromium. The bundle size is tiny (~5MB vs Electron's 150MB). Idle RAM usage is under 50MB. Rust provides memory safety and incredibly fast local file/database access.
   - *Cons:* Steeper learning curve for the backend.

**The Verdict:** 
For a "Life Ops" dashboard that requires local file storage (receipts), embedded databases (SQLite), and needs to run quietly in the background without draining battery, **Tauri + Rust + React** is objectively the most optimized, future-proof stack available today. 

## Proposed Technology Stack

1. **Framework:** Tauri v2
2. **Backend:** Rust (Memory safe, blazing fast) + SQLite (Embedded, zero-config local database).
3. **Frontend:** Vite + React + TypeScript + Vanilla CSS (For a highly optimized, dynamic "glassmorphism" aesthetic).
4. **OCR Engine:** Local Tesseract.js (WebAssembly) to ensure no receipt data ever leaves the machine.

## User Review Required

> [!IMPORTANT]  
> **Final Stack Approval**
> Based on this objective breakdown, are we locked in on **Tauri (Rust + React)**? If you prefer to sacrifice RAM usage for development speed, we can pivot to Electron, but Tauri is vastly superior for long-term optimization.

## Open Questions

> [!WARNING]  
> **UI Aesthetic**
> Do you prefer a sleek **Dark Mode (Glassmorphism)** look, or a clean, vibrant **Light Mode** aesthetic?

> [!NOTE]  
> **Initial Feature Focus**
> Which feature should we build first?
> 1. Receipt OCR & Warranty Tracker
> 2. Document Expiry Tracker (Passports, IDs)
> 3. Subscription Free-Trial Reminder

## Proposed Roadmap

### Phase 1: Foundation (V0.1)
- Scaffold the Tauri project structure.
- Implement the premium UI shell using React and custom CSS.
- Setup the local SQLite database schema in Rust.

### Phase 2: Core Feature Implementation
- Build the "Add Item" interface.
- Integrate local OCR to process receipt images.
- Connect the frontend to the Rust backend to save items to the database.

### Phase 3: Notifications & Polish
- Implement local system notifications to alert the user 30 days before a warranty expires.
- Final UI polish (animations, hover effects).
