# GARCHA EXIM Navigator

India export–import guide app — **no AI needed**, works offline, and **collects the latest DGFT & RBI rulings, foreign buyer leads and tenders every day** automatically.

## Open / install
- **Open in Chrome:** https://mangeshwarsinghp14.github.io/garcha-exim-navigator/
- **Install on phone (Android):** open the link in Chrome → ⋮ → **Install app** / **Add to Home screen**. Works offline after the first open; your data stays on your device (move it with *Backup & Export*).

## What's inside
**v7:** 🗺 **Trade Map — who buys & who sells what** · pick a product to see the biggest buying countries (with 1-year growth and how much they already buy from India), the biggest selling countries (India's rank and share), who supplies the top buyers, where India sells now and who sells to India · pick a country to see everything it buys and sells · **Best gaps for India**: big buyers that take under 5% from India for products India already sells well. Figures: UN Comtrade, 66 products (edit `data/trademap-products.json`).

**v6:** 🤝 Buyer Leads & Tenders (World Bank-funded tenders, EU TED supply tenders, news of foreign brands sourcing from India — unread items tagged *New*, with dates & deadline countdown) · 📈 Top Exports from India (30 groups, FY 2015-16 → FY 2025-26, where to source, who buys, price-check links) · 📍 Source by State / City (181 districts & clusters across all 36 states/UTs) · 📦 What to Import & From Where (26 import groups, supplier countries, official foreign trade-promotion bodies).

Also: Before-You-Start checklist · Trade Planner (type “export basmati rice to UK” → full flowchart with permissions, whom to meet, documents, money plan) · Step-by-step roadmaps · **Latest Rulings & Updates** · Shipment / licence / task trackers · Calculators (export price, import landed cost, CBM, FEMA deadline) · Documents library · Finance · Schemes · Procure & Sell · Markets & FTAs · Legal & Incoterms · Glossary with hover meanings.

## How it stays up to date (no AI)
- `.github/workflows/update-rulings.yml` runs twice a day (07:00 & 19:00 IST) on GitHub's free servers.
- `scripts/fetch-updates.mjs` reads **official sources only** (`data/sources.json`): DGFT Notifications, Public Notices, Trade Notices, Circulars; RBI Notifications & Press Releases (trade/forex only). Items are tagged by keywords (`data/watch.json`) and saved to `data/updates.json`; source health to `data/status.json`.
- `scripts/fetch-leads.mjs` collects buyer leads & tenders: World Bank procurement notices API (Invitation for Bids, goods & non-consulting services, India-based notices skipped), EU TED search API (supply contract notices, last 3 days), Google News RSS (foreign buyers sourcing from India). Saved to `data/leads.json` and `data/leads-status.json`; old/closed items drop off automatically.
- The app shows them on **📰 Latest Rulings & Updates**, with "New" and "Important" flags and a warning when an item may affect one of the app's built-in rules.
- **Rules sheet:** `data/rules.json` holds the facts the app calculates with (FEMA realisation months, RoDTEP end date, key rules, FTA list). When a ruling changes one of them, edit that line on GitHub (pencil icon) — every user gets the change on next open. Run the updater manually from *Actions → Update EXIM rulings → Run workflow*.

- `.github/workflows/update-trademap.yml` runs 4 times a day (03:10, 09:10, 15:10, 21:10 IST); each run `scripts/fetch-trademap.mjs` refreshes up to 20 products not updated in the last 6 days from the free UN Comtrade public API (no key, about 200 calls before a 20-minute pause), so every product is renewed about once a week; it moves to the newer year once ~90% of countries have reported it. Saved to `data/trademap.json` and `data/trademap-status.json`. To refresh everything at once: *Actions → Update Trade Map → Run workflow → tick “Refresh every product”* (it stops when the API quota runs out; later runs finish the rest).

## Source files
`index.html` (built app) is assembled from `shell.html` + `data.js` + `planner_data.js` + `prep_data.js` + `trade_data.js` + `app.js` (build: `python3 build_garcha.py .`). `manifest.webmanifest`, `sw.js`, icons = installable/offline app.

Guidance only — always open the official notification before acting.
© Mangeshwar Garcha (mangeshwarsinghp14) — All rights reserved.
