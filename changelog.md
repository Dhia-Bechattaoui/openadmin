# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

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

[Unreleased]: https://github.com/dhia-bechattaoui/openadmin/compare/v0.1.1...HEAD
[0.1.1]: https://github.com/dhia-bechattaoui/openadmin/compare/v0.1.0...v0.1.1
[0.1.0]: https://github.com/dhia-bechattaoui/openadmin/compare/v0.0.7...v0.1.0
[0.0.7]: https://github.com/dhia-bechattaoui/openadmin/compare/v0.0.6...v0.0.7
[0.0.6]: https://github.com/dhia-bechattaoui/openadmin/compare/v0.0.5...v0.0.6
[0.0.5]: https://github.com/dhia-bechattaoui/openadmin/compare/v0.0.4...v0.0.5
[0.0.4]: https://github.com/dhia-bechattaoui/openadmin/compare/v0.0.3...v0.0.4
[0.0.3]: https://github.com/dhia-bechattaoui/openadmin/compare/v0.0.2...v0.0.3
[0.0.2]: https://github.com/dhia-bechattaoui/openadmin/compare/v0.0.1...v0.0.2
[0.0.1]: https://github.com/dhia-bechattaoui/openadmin/releases/tag/v0.0.1
