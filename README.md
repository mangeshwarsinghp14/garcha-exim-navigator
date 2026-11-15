# GARCHA EXIM Navigator

India export–import guide app — **no AI needed**, works offline, and **collects the latest DGFT & RBI rulings every day** automatically.

## Open / install
- **Open in Chrome:** https://mangeshwarsinghp14.github.io/garcha-exim-navigator/
- **Install on phone (Android):** open the link in Chrome → ⋮ → **Install app** / **Add to Home screen**. Works offline after the first open; your data stays on your device (move it with *Backup & Export*).

## What's inside
Before-You-Start checklist · Trade Planner (type “export basmati rice to UK” → full flowchart with permissions, whom to meet, documents, money plan) · Step-by-step roadmaps · **Latest Rulings & Updates** · Shipment / licence / task trackers · Calculators (export price, import landed cost, CBM, FEMA deadline) · Documents library · Finance · Schemes · Procure & Sell · Markets & FTAs · Legal & Incoterms · Glossary with hover meanings.

## How it stays up to date (no AI)
- `.github/workflows/update-rulings.yml` runs twice a day (07:00 & 19:00 IST) on GitHub's free servers.
- `scripts/fetch-updates.mjs` reads **official sources only** (`data/sources.json`): DGFT Notifications, Public Notices, Trade Notices, Circulars; RBI Notifications & Press Releases (trade/forex only). Items are tagged by keywords (`data/watch.json`) and saved to `data/updates.json`; source health to `data/status.json`.
- The app shows them on **📰 Latest Rulings & Updates**, with "New" and "Important" flags and a warning when an item may affect one of the app's built-in rules.
- **Rules sheet:** `data/rules.json` holds the facts the app calculates with (FEMA realisation months, RoDTEP end date, key rules, FTA list). When a ruling changes one of them, edit that line on GitHub (pencil icon) — every user gets the change on next open. Run the updater manually from *Actions → Update EXIM rulings → Run workflow*.

## Source files
`index.html` (built app) is assembled from `shell.html` + `data.js` + `planner_data.js` + `prep_data.js` + `app.js`. `manifest.webmanifest`, `sw.js`, icons = installable/offline app.

Guidance only — always open the official notification before acting.
© Mangeshwar Garcha (mangeshwarsinghp14) — All rights reserved.
