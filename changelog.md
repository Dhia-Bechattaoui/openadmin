# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [0.5.1] - 2026-06-09
### Fixed
- Re-triggered release pipeline to ensure APPLE_TEAM_ID secret is properly picked up by GitHub Actions.

## [0.5.0] - 2026-06-09
### Fixed
- Fixed GitHub Actions failing to notarize macOS release by explicitly passing APPLE_TEAM_ID.

## [0.4.1] - 2026-06-09
### Added
- Replaced default app icons with custom premium OpenAdmin icons across all platforms.
- Added beautiful UI screenshot to README.md.

### Fixed
- Fixed an issue where the "Add Item" modal would get cut off on smaller screens without a scrollbar.
- Configured GitHub Actions to automatically securely sign and notarize the macOS `.dmg` release to pass Apple Gatekeeper checks.
## [0.4.0] - 2026-06-09
### Added
- Created the "Documents" tab on the sidebar to properly view and manage personal documents.
- Improved UX: Clicking "Add Item" now auto-selects the category corresponding to your current active tab.
- Finalized background notification logic: The Rust worker now parses `expiration_date` and strictly triggers native OS alerts only for items expiring within the next 30 days.

## [0.3.0] - 2026-06-09
### Added
- Created the Settings configuration page.
- Added Data Export functionality with native file dialog to save SQLite database as a JSON backup.
- Added Database Wipe functionality with native confirmation protections.
- Added Push Notification toggle to enable/disable background OS alerts.
- Set up an automated GitHub Actions CI/CD pipeline to cross-compile and publish Windows `.msi` and macOS `.dmg` releases automatically.
### Fixed
- Bypassed strict frontend filesystem sandbox by securely routing file exports through the Rust backend.

## [0.2.2] - 2026-06-08
### Changed
- Updated `productName` in `tauri.conf.json` from `tauri-app` to `OpenAdmin` to ensure compiled `.dmg` binaries use the correct branding.
- Synced `package.json` configurations in preparation for the official compiled release.

## [0.2.1] - 2026-06-08
### Fixed
- Fixed bug where deleting an item silently failed due to Tauri's strict webview security policy blocking native `window.confirm` dialogs.

## [0.2.0] - 2026-06-08
### Added
- Implemented full CRUD capabilities for items (Edit and Delete).
- Added `update_item` and `delete_item` Rust commands to the embedded SQLite database backend.
- Added smooth hover action buttons (Pencil/Trash icons) to dashboard cards.
- Wired React modal state to smartly pre-fill existing item data for seamless inline-style editing.

## [0.1.1] - 2026-06-08
### Fixed
- Fixed bug where side menu navigation did not conditionally render main dashboard content.
- Implemented category filtering for the Warranties and Subscriptions tabs.
- Added dynamic headers based on the active tab context.

## [0.1.0] - 2026-06-08
### Added
- Created a background Rust worker thread to periodically check the SQLite database for expiring warranties and subscriptions.
- Integrated `tauri-plugin-notification` to trigger native Mac OS push notifications for items nearing expiration.
- Final UI polish: added smooth scale and shadow hover animations to dashboard glass cards.

## [0.0.7] - 2026-06-08
### Added
- Integrated Tesseract.js (WebAssembly) for offline, local receipt OCR.
- Added drag-and-drop image upload to the "Add Item" modal for auto-extracting cost and raw text.

## [0.0.6] - 2026-06-08
### Added
- Wired React "Add Item" form to the Tauri backend for SQLite persistence.
- Connected dashboard UI to automatically fetch and render saved items from the local database on load.

## [0.0.5] - 2026-06-08
### Added
- Implemented Rust backend database operations for items (`insert_item`, `get_items`).
- Exposed SQLite operations as Tauri Commands to the React frontend.

## [0.0.4] - 2026-06-08
### Added
- Configured embedded SQLite database (`rusqlite`) in the Rust backend with automated initialization.
- Built responsive "Add Item" React modal interface for data entry.

## [0.0.3] - 2026-06-08
### Added
- Implemented premium Dark Mode Glassmorphism UI shell (Vanilla CSS).
- Integrated `lucide-react` for beautiful iconography.
- Created sidebar navigation and responsive dashboard layout.

## [0.0.2] - 2026-06-08
### Added
- Scaffolded Tauri v2 application with React, TypeScript, and Vite.
- Added comprehensive README documentation outlining the architecture.

## [0.0.1] - 2026-06-08
### Added
- Initial project directory structure created.
- Implementation plan finalized.

[Unreleased]: https://github.com/dhia-bechattaoui/openadmin/compare/v0.4.0...HEAD
[0.4.0]: https://github.com/dhia-bechattaoui/openadmin/compare/v0.3.0...v0.4.0
[0.3.0]: https://github.com/dhia-bechattaoui/openadmin/compare/v0.2.2...v0.3.0
[0.2.2]: https://github.com/dhia-bechattaoui/openadmin/compare/v0.2.1...v0.2.2
[0.2.1]: https://github.com/dhia-bechattaoui/openadmin/compare/v0.2.0...v0.2.1
[0.2.0]: https://github.com/dhia-bechattaoui/openadmin/compare/v0.1.1...v0.2.0
[0.1.1]: https://github.com/dhia-bechattaoui/openadmin/compare/v0.1.0...v0.1.1
[0.1.0]: https://github.com/dhia-bechattaoui/openadmin/compare/v0.0.7...v0.1.0
[0.0.7]: https://github.com/dhia-bechattaoui/openadmin/compare/v0.0.6...v0.0.7
[0.0.6]: https://github.com/dhia-bechattaoui/openadmin/compare/v0.0.5...v0.0.6
[0.0.5]: https://github.com/dhia-bechattaoui/openadmin/compare/v0.0.4...v0.0.5
[0.0.4]: https://github.com/dhia-bechattaoui/openadmin/compare/v0.0.3...v0.0.4
[0.0.3]: https://github.com/dhia-bechattaoui/openadmin/compare/v0.0.2...v0.0.3
[0.0.2]: https://github.com/dhia-bechattaoui/openadmin/compare/v0.0.1...v0.0.2
[0.0.1]: https://github.com/dhia-bechattaoui/openadmin/releases/tag/v0.0.1
