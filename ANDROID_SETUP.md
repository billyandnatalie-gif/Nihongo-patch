# Phase 2 — Android preparation (Capacitor)

This is **build scaffolding**, not a published or tested Android app. It leaves the GitHub Pages site unchanged.

## Prerequisites
- Node.js compatible with Capacitor 8 (see current Capacitor environment setup docs).
- Android Studio and Android SDK on Windows, macOS, or Linux.
- Android phone with USB debugging enabled, or an Android emulator.

## First Android build
1. Clone or download this repository and open a terminal in its root.
2. Run `npm install`.
3. Run `npm run build` (copies the existing static site into `www/`).
4. Run `npx cap add android` (first time only).
5. Run `npm run cap:sync`.
6. Run `npx cap open android` and select a device in Android Studio, then Run.

For later web changes, repeat `npm run cap:sync` and rebuild in Android Studio.

## Acceptance testing before Play Store release
- Confirm all N5–N3 screens, scenarios, local save/load, import/export, Japanese TTS, and responsive layout.
- Confirm microphone permission and speech recognition on a **physical Android device**. Browser SpeechRecognition can behave differently or be unavailable in Android WebView; it may require a native speech-recognition integration rather than a simple permission change.
- Check offline behavior, Android back button/navigation, accessibility, app icon, splash screen, and performance.
- Replace the provisional `com.nihongopath.app` application ID with an identifier you control **before your first published release**; changing it after publication creates a different Play Store app.
- Do not put AI-provider API keys into the web assets or Android bundle. Use a secured backend for paid AI tutoring.
- Before monetization: implement entitlements with Google Play Billing, privacy/data-safety declarations, restore purchases, and release testing. Capacitor alone does not add billing or an AI tutor.

Do not merge this branch until you've reviewed it. No existing website files are changed by this preparation.
