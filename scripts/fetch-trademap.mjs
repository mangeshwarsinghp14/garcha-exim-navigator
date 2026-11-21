// GARCHA EXIM Navigator — Trade Map collector (no AI, no API key)
// Reads data/trademap-products.json, asks the UN Comtrade public API who buys and who sells
// each product, and writes data/trademap.json + data/trademap-status.json.
// © mangeshwarsinghp14 — All rights reserved
import fs from "node:fs";

const API = "https://comtradeapi.un.org/public/v1/preview/C/A/HS";
const REF = "https://comtradeapi.un.org/files/v1/app/reference/";
const INDIA = 699;
const GAP_MS = +(process.env.TM_GAP_MS || 4500); // the public API allows about one request every few seconds
const ONLY = (process.env.TM_ONLY || "").split(",").filter(Boolean); // test a few HS codes
const BATCH = +(process.env.TM_BATCH || 20); // products refreshed per run (oldest first); TM_ALL=1 refreshes all
const MIN_AGE_DAYS = +(process.env.TM_MIN_AGE_DAYS || 6); // skip products refreshed more recently than this
// The public API has a call quota (about 200 calls, then a ~20-minute pause), so each run stays under ~170 calls.
const ALL = process.env.TM_ALL === "1";
const OUT = "data/trademap.json", STATUS = "data/trademap-status.json";
const sleep = ms => new Promise(r => setTimeout(r, ms));
let calls = 0, fails = 0;

async function getJSON(url, tries = 4) {
  for (let i = 1; i <= tries; i++) {
    try {
      const r = await fetch(url, { headers: { "User-Agent": "garcha-exim-navigator" }, signal: AbortSignal.timeout(60000) });
      const t = await r.text();
      if (r.status === 429 || r.status >= 500 || !t.trim()) throw new Error("HTTP " + r.status + (t.trim() ? "" : " empty"));
      if (!r.ok) throw new Error("HTTP " + r.status + " " + t.slice(0, 120));
      return JSON.parse(t);
    } catch (e) {
      if (process.env.TM_DEBUG) console.log("   retry", i, e.message);
      if (i === tries) throw e;
      await sleep(4000 * i);
    }
  }
}
async function q(p) {
  const u = API + "?" + new URLSearchParams(p).toString();
  await sleep(GAP_MS); calls++;
  const t0 = Date.now();
  const d = await getJSON(u);
  if (process.env.TM_DEBUG) console.log("  ", ((Date.now() - t0) / 1000).toFixed(1) + "s", u.slice(API.length));
  if (d.error) throw new Error(String(d.error).slice(0, 150));
  return (d.data || []).filter(x => +x.partner2Code === 0 && String(x.customsCode) === "C00" && +x.motCode === 0);
}

// ---------- country names ----------
const NAMES = {}, SKIP = new Set([0, 97, 899, 838, 839, 837, 898, 896, 568, 577, 637, 527, 879]);
async function loadNames() {
  for (const [file, cKey, nKey, isoKey] of [["Reporters.json", "reporterCode", "reporterDesc", "reporterCodeIsoAlpha2"], ["partnerAreas.json", "PartnerCode", "PartnerDesc", "PartnerCodeIsoAlpha2"]]) {
    const d = await getJSON(REF + file);
    for (const r of d.results || []) {
      const c = +r[cKey], nm = String(r[nKey] || r.text || c);
      if (c !== 490 && (r.isGroup || /\bnes\b|Bunkers|Free Zones|Special Categories|^World$|EU-28|European Union/i.test(nm))) SKIP.add(c);
      if (!NAMES[c]) NAMES[c] = [c === 490 ? "Taiwan" : nm.replace(/\s*\(.*?\)\s*/g, " ").trim(), r[isoKey] || ""];
    }
  }
  Object.assign(NAMES, { [INDIA]: ["India", "IN"], 842: ["USA", "US"], 826: ["United Kingdom", "GB"], 784: ["UAE", "AE"], 410: ["South Korea", "KR"], 643: ["Russia", "RU"], 704: ["Vietnam", "VN"], 490: ["Taiwan", "TW"] });
}

const row = x => [+x.reporterCode, +x.partnerCode, Math.round(+x.primaryValue || 0), Math.round(+x.netWgt || 0)];
function byReporter(rows) { // one value per reporting country (World partner)
  const m = new Map();
  for (const x of rows) { const [r, , v, kg] = row(x); if (SKIP.has(r) || !v) continue; if (!m.has(r) || m.get(r)[0] < v) m.set(r, [v, kg]); }
  return m;
}
function byPartner(rows) { // one value per partner country; re-imports (partner = reporter) skipped
  const m = new Map();
  for (const x of rows) { const [r, p, v, kg] = row(x); if (SKIP.has(p) || p === r || !v) continue; if (!m.has(p) || m.get(p)[0] < v) m.set(p, [v, kg]); }
  return m;
}
const top = (m, n) => [...m.entries()].sort((a, b) => b[1][0] - a[1][0]).slice(0, n);

async function chooseYear() {
  const y = new Date().getUTCFullYear() - 1;
  try {
    const a = (await q({ period: y, cmdCode: "8708", flowCode: "M", partnerCode: 0 })).length;
    const b = (await q({ period: y - 1, cmdCode: "8708", flowCode: "M", partnerCode: 0 })).length;
    return a >= 0.9 * b ? y : y - 1; // move to the newer year once ~90% of countries have reported it
  } catch { return y - 1; }
}

async function product(p, Y) {
  const imp = byReporter(await q({ period: Y, cmdCode: p.hs, flowCode: "M", partnerCode: 0 }));
  if (!imp.size) throw new Error("no import data for " + Y);
  const impPrev = byReporter(await q({ period: Y - 1, cmdCode: p.hs, flowCode: "M", partnerCode: 0 }));
  const exp = byReporter(await q({ period: Y, cmdCode: p.hs, flowCode: "X", partnerCode: 0 }));
  const inX = byPartner(await q({ reporterCode: INDIA, period: Y, cmdCode: p.hs, flowCode: "X" }));
  const inM = byPartner(await q({ reporterCode: INDIA, period: Y, cmdCode: p.hs, flowCode: "M" }));
  const world = [...imp.values()].reduce((s, v) => s + v[0], 0);
  const worldX = [...exp.values()].reduce((s, v) => s + v[0], 0);
  const expSorted = top(exp, 400);
  const indRank = expSorted.findIndex(e => e[0] === INDIA) + 1;
  const indX = exp.get(INDIA) ? exp.get(INDIA)[0] : [...inX.values()].reduce((s, v) => s + v[0], 0);
  const buyers = top(imp, 40).map(([c, [v, kg]]) => [c, v, impPrev.get(c) ? impPrev.get(c)[0] : 0, kg, inX.get(c) ? inX.get(c)[0] : 0]);
  const sup = {}; // who supplies the 3 biggest buyers (India itself skipped as a buyer)
  for (const [c] of top(imp, 4).filter(e => e[0] !== INDIA).slice(0, 3)) {
    try { sup[c] = top(byPartner(await q({ reporterCode: c, period: Y, cmdCode: p.hs, flowCode: "M" })), 8).map(([pc, [v]]) => [pc, v]); }
    catch (e) { fails++; }
  }
  return {
    hs: p.hs, name: p.name, dir: p.dir, grp: p.grp, kw: p.kw, year: Y, fetchedAt: new Date().toISOString(),
    world, worldX, indX, indRank, nExp: exp.size, nImp: imp.size,
    buyers,                                                    // [country, value, value prev year, kg, India's sales there]
    sellers: top(exp, 15).map(([c, [v, kg]]) => [c, v, kg]),   // biggest exporting countries
    indiaTo: top(inX, 25).map(([c, [v, kg]]) => [c, v, kg]),   // where India sells now
    indiaFrom: top(inM, 12).map(([c, [v, kg]]) => [c, v, kg]), // who sells to India
    sup                                                         // {buyer: [[supplier, value]]}
  };
}

async function main() {
  const cfg = JSON.parse(fs.readFileSync("data/trademap-products.json", "utf8"));
  let old = { products: [] }; try { old = JSON.parse(fs.readFileSync(OUT, "utf8")); } catch {}
  const oldBy = Object.fromEntries((old.products || []).map(p => [p.hs, p]));
  await loadNames();
  const Y = await chooseYear();
  const items = cfg.items;
  const age = p => { const o = oldBy[p.hs]; return o && o.year === Y && !o.stale ? (o.fetchedAt || "0") : ""; };
  const cutoff = new Date(Date.now() - MIN_AGE_DAYS * 864e5).toISOString();
  const todo = new Set((ONLY.length ? items.filter(p => ONLY.includes(p.hs)) : ALL ? items : items.filter(p => age(p) < cutoff).sort((a, b) => age(a).localeCompare(age(b))).slice(0, BATCH)).map(p => p.hs));
  if (!todo.size) console.log("All products are fresh — nothing to do");
  const errors = [];
  let ok = 0;
  const done = {}; // hs -> fresh product
  const writeOut = final => { // saves after every product, so a stopped run keeps its progress
    const list = items.map(p => done[p.hs] || (oldBy[p.hs] ? Object.assign({}, oldBy[p.hs], { name: p.name, dir: p.dir, grp: p.grp, kw: p.kw, stale: oldBy[p.hs].year !== Y }) : null)).filter(Boolean);
    const used = new Set([INDIA]);
    for (const p of list) {
      [p.buyers, p.sellers, p.indiaTo, p.indiaFrom].forEach(l => l.forEach(b => used.add(b[0])));
      Object.entries(p.sup || {}).forEach(([c, l]) => { used.add(+c); l.forEach(x => used.add(x[0])); });
    }
    const countries = {}; [...used].forEach(c => countries[c] = NAMES[c] || (old.countries && old.countries[c]) || ["Country " + c, ""]);
    if (!ok) { if (final) console.log("Nothing refreshed — keeping old file"); return list.length; }
    fs.writeFileSync(OUT, JSON.stringify({ generatedAt: new Date().toISOString(), year: Y, source: "UN Comtrade (comtradeplus.un.org) — values in US$ as reported by each country; imports are CIF, exports FOB.", countries, products: list }));
    return list.length;
  };
  for (const p of items) {
    if (!todo.has(p.hs)) continue;
    try { done[p.hs] = await product(p, Y); ok++; console.log("ok", p.hs, p.name); writeOut(false); }
    catch (e) {
      fails++; errors.push([p.hs, String(e.message || e).slice(0, 150)]); console.log("FAIL", p.hs, e.message);
      if (/429|limit|quota/i.test(e.message || "")) { console.log("Rate limit reached — stopping this run"); break; }
    }
  }
  const n = writeOut(true);
  fs.writeFileSync(STATUS, JSON.stringify({ checkedAt: new Date().toISOString(), year: Y, products: n, refreshed: ok, tried: todo.size, calls, fails, errors }, null, 1));
  console.log("done", ok + "/" + todo.size, "refreshed;", n, "products in file;", "calls", calls, "fails", fails);
}
main().catch(e => { console.error(e); process.exit(1); });
