// GARCHA EXIM Navigator — daily exchange rates (free, no key): open.er-api.com (ExchangeRate-API)
// Writes data/fx.json with rupees per unit of each currency. Keeps the old file if the fetch fails.
// © mangeshwarsinghp14 — All rights reserved
import fs from "node:fs";
const CUR = ["USD", "EUR", "GBP", "AED", "SAR", "JPY", "CNY", "AUD", "CAD", "SGD", "CHF"];
try {
  const r = await fetch("https://open.er-api.com/v6/latest/USD", { signal: AbortSignal.timeout(30000) });
  const d = await r.json();
  if (d.result !== "success" || !d.rates || !d.rates.INR) throw new Error("bad response");
  const inrPer = {}; CUR.forEach(c => { if (d.rates[c]) inrPer[c] = +(d.rates.INR / d.rates[c]).toFixed(4); });
  fs.writeFileSync("data/fx.json", JSON.stringify({ date: d.time_last_update_utc, fetchedAt: new Date().toISOString(), source: "ExchangeRate-API (open.er-api.com), market mid-rate — your bank's rate will differ a little", inrPer }, null, 1));
  console.log("fx ok", inrPer.USD);
} catch (e) { console.log("fx failed, keeping old file:", e.message); }
