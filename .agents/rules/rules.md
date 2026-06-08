---
trigger: always_on
---

# Agent Rules

This directory contains rules and guidelines for AI agents working in this repository.

1. **Local-First Always:** Agents must never add dependencies or write code that sends user data (receipts, documents) to a third-party cloud provider.
2. **Rust Backend Preference:** Complex data processing or OS-level integrations should happen in the Rust backend, not the frontend.
3. **Vanilla CSS:** The frontend uses Vanilla CSS instead of Tailwind. Ensure all styles are modular and adhere to a premium, "glassmorphism" aesthetic.
