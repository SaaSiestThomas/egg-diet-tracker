# Egg Diet Tracker: Convert to Standalone iOS App

## Project Overview

I have a web app called **Egg Diet Tracker** currently hosted on Railway:
https://egg-diet-tracker-production.up.railway.app

The goal is to convert this into a **standalone, offline iOS app** that can be published on the Apple App Store at $4.99 (one-time purchase). The app must work without any server dependency.

## Current State

- Web app hosted on Railway (likely Node.js backend with a database)
- Has user accounts/login system
- Tracks meals across a 15-day egg diet protocol in 3 phases:
  - Phase 1 (Days 1-5): Egg Fast
  - Phase 2 (Days 6-10): Strict LCHF
  - Phase 3 (Days 11-15): Egg Fast
- Tracks weight over time
- Progress bar showing meals tracked out of total
- Start date picker
- Rules/guidelines section
- Charming egg-themed UI with warm yellow/orange color palette

## What Needs to Happen

### Step 1: Make the app fully client-side (no server)

- **Remove all server/backend dependencies** (API calls, database connections, Express/Node server, etc.)
- **Remove the login/account system entirely.** On iOS, the phone IS the user's identity. No auth needed.
- **Replace all server-side data storage with localStorage or IndexedDB.** All meal logs, weight entries, start date, and progress must persist locally on the device.
- **Keep all existing UI, design, styling, and functionality intact.** The app should look and behave exactly the same, just without a server.
- The result should be a **static web app** (HTML + CSS + JS) that can open in a browser via `index.html` with no build server required. If the app uses React or another framework, a static build output (`npm run build` producing a `dist/` or `build/` folder) is fine.

### Step 2: Wrap with Capacitor for iOS

Once the app works as a standalone client-side web app:

1. Install Capacitor:
   ```bash
   npm install @capacitor/core @capacitor/cli
   npx cap init "Egg Diet Tracker" "com.eggdiet.tracker"
   ```

2. Configure `capacitor.config.ts` (or `.json`):
   - Set `webDir` to point to the build output folder (e.g., `dist` or `build`)
   - No server URL needed since we're bundling assets locally

3. Add iOS platform:
   ```bash
   npm install @capacitor/ios
   npx cap add ios
   ```

4. Build and sync:
   ```bash
   npm run build
   npx cap sync
   ```

5. The Xcode project will be in the `ios/` folder, ready to open with `npx cap open ios`

### Step 3: iOS App Store Preparation

Add these features/configs to make the app App Store ready:

- **App icon:** Generate from the egg-themed design (1024x1024 required for App Store, plus all required sizes)
- **Splash/launch screen:** Warm yellow/egg themed, matching the app design
- **Bundle ID:** `com.eggdiet.tracker` (or similar)
- **Display name:** "Egg Diet Tracker"
- **Status bar:** Style appropriately for the warm yellow header
- **Safe area handling:** Ensure the app respects iPhone notch/Dynamic Island
- **Offline capability:** Confirm everything works in airplane mode

### Optional Enhancements (Nice to Have)

- Add Capacitor Local Notifications plugin for meal reminders (every 3-4 hours as per the diet rules)
- Add haptic feedback on meal logging
- Add data export (share your progress as text/image)
- Add a "Share results" feature at the end of 15 days

## Data Model Reference

The app tracks (store all in localStorage):

- **User profile:** start date, current phase/day
- **Meal log:** For each day (1-15), meals with description (e.g., "2 boiled eggs + mayo")
- **Weight log:** Daily weight entries for the weight chart
- **Settings/preferences:** Any user preferences

## Key Constraints

- **No server dependency whatsoever.** The app must work 100% offline.
- **No em dashes in any text/copy.** Use regular dashes or rewrite.
- **Keep the existing visual design.** The egg-themed UI with warm colors, emoji usage, phase tabs, and progress tracking are all great. Don't redesign.
- **Target iOS 15+** for broad device compatibility.

## Technical Notes

- Capacitor is free and open source (MIT license)
- The Xcode project it generates is a standard iOS project
- Final build/signing/submission will be done manually in Xcode on a Mac
- Apple Developer Account ($99/year) is handled separately

## Success Criteria

When done, I should be able to:
1. Run `npm run build` to produce the static web app
2. Run `npx cap sync` to push it to the iOS project
3. Open the Xcode project and build/run on the iOS Simulator
4. See the full Egg Diet Tracker working offline with all data persisting locally
5. All existing features (meal logging, weight tracking, phase navigation, rules, progress bar) work as before
