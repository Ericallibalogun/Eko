```markdown
<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# Eko — Frontend Overview

This README describes the frontend of the Eko application: its features, how to run it locally, environment variables, folder layout, and how to contribute. (Note: references to any external product pages were intentionally removed — this README focuses only on the app and its frontend.)

---

## What the frontend provides

The frontend implements a user-facing interface for interacting with models, managing sessions and files, and performing common AI workflows. The list below is written to be comprehensive; if you want it trimmed to exactly match the code in the repository, I can extract the component names and exact features if you grant access or paste the frontend file list.

Key frontend features

- Responsive UI
  - Layouts that adapt to desktop, tablet and mobile
  - Collapsible navigation and mobile-friendly menus

- Authentication & User Sessions
  - Sign in / Sign out flows and session persistence (cookies/localStorage)
  - Account pages and API key / credential display (if supported)

- Dashboard / Home
  - Overview panels for recent activity, quick actions and usage stats￼
close

  - Recent projects or sessions list with quick-open actions

- Conversational / Chat Interface
  - Message list with user and assistant bubbles
  - Support for streaming/incremental responses
  - Markdown rendering with code block highlighting
  - Copy-to-clipboard, edit and delete message actions

- Model & Request Controls
  - Model selection UI (choose model/engine)
  - Parameter controls (temperature, max tokens, top_p, etc.)
  - Request history and retry controls
  - Loading indicators and request status

- File & Data Input
  - File upload (drag & drop and file picker)
  - File preview (text, images, PDFs) and basic metadata
  - Attach files to conversations or use files as model inputs

- Prompt Tools & Templates
  - Saved prompt templates and quick prompts panel
  - Common transformation tools (summarize, translate, rewrite, extract)

- Export & Persistence
  - Save/export conversations and outputs (JSON/markdown)
  - Local export and (if supported) integration with backend storage

- Multimedia Support (where available)
  - Microphone/voice input and audio transcription UI
  - Audio playback and transcript viewer
  - Image input and image preview flows

- Settings & Preferences
  - Theme toggle (light/dark/system)
  - Language/locale settings
  - Account and API key management pages

- Notifications & Error Handling
  - Toasts for success, warning, and error
  - Modal confirmations and clear error messages
  - Retry UI for failed requests

- Accessibility & Keyboard Navigation
  - Keyboard-first navigation and ARIA attributes
  - Focus management and screen-reader friendly markup

- Performance & Developer Experience
  - Lazy-loaded routes and components
  - Loading skeletons / spinners
  - Developer debug tools (logs, environment warnings)
  - Testing skeletons (unit/integration tests suggested)

---

## Screenshots / Demos (placeholders)

Add screenshots or animated GIFs to the repo in /public or /assets and reference them here:

- assets/screenshots/dashboard.png
- assets/screenshots/chat.png
- assets/screenshots/uploader.png

---

## Run the frontend locally

Prerequisites: Node.js (LTS recommended)

1. Install dependencies
   npm install

2. Create environment file
   - Copy .env.example (if present) or create .env.local and add required keys.

   Typical environment variables used by the frontend (update to match your project):
   - NEXT_PUBLIC_API_URL — base URL for your backend API (if applicable)
   - NEXT_PUBLIC_ANALYTICS_ID — analytics id (optional)
   - NEXT_PUBLIC_FEATURE_FLAGS — feature toggles (optional)

   Note: Any secrets (API keys for protected services) should be provided server-side when possible.
   If the frontend requires a server-side API key for model calls, keep it in server-side env files and never commit secrets.

3. Run in development
   npm run dev
   - Open http://localhost:3000 (or the address indicated by your framework)

4. Build for production
   npm run build
   npm start

Adjust commands if your project uses a different framework or package scripts (e.g., pnpm, yarn, Next.js app directory).

---

## Folder structure (typical)

Below is a common frontend layout — update to match your repository exactly:

- src/
  - components/       — reusable UI components (Chat, Navbar, Uploader, Modal)
  - pages/ or app/     — top-level routes and pages
  - styles/            — CSS, variables, theme tokens
  - hooks/             — reusable React hooks
  - lib/               — API clients, utilities
  - contexts/          — React context providers (auth, theme)
  - public/            — static assets (images, icons)
  - tests/             — unit and integration tests

---

## Environment variables (examples)

- NEXT_PUBLIC_API_URL — client-side API base URL
- NEXTAUTH_URL — authentication callback URL (if using NextAuth)
- OAUTH_CLIENT_ID — OAuth client id (if applicable)
- SENTRY_DSN ￼
close
— error reporting DSN (optional)

Do not commit secrets. Use server environment variables or secret managers.

---

## Contributing

Contributions are welcome:

- Fork the repository
- Create a feature branch: git checkout -b feat/some-feature
- Add tests and update docs
- Open a pull request with a clear description of the change
￼
close

Include any frontend design guidelines or component patterns to keep the UI consistent.

---

## License & Contact

- License: add your license (e.g., MIT)
- Author: Ericallibalogun
- Contact: add preferred contact method (email or GitHub profile)

---

If you want me to produce an exact, repository-accurate frontend features list and component map, I can do that next — I currently don't have access to read the repository files from here. You can either paste the list of files under src/ or grant access for me to scan the frontend; I will then update this README to exactly match the code (component names, routes, environment variables and screenshots).
```
