// GARCHA EXIM Navigator — daily rulings updater (no AI, no dependencies). Node 18+.
// Reads data/sources.json + data/watch.json, fetches official pages/feeds, writes data/updates.json + data/status.json.
import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { execFile } from "node:child_process";
import { promisify } from "node:util";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const DATA = path.join(ROOT, "data");
const UA = "GarchaEximNavigator/1.0 (+https://github.com/mangeshwarsinghp14/garcha-exim-navigator)";
const MAX_ITEMS = 600;

const readJSON = async (f, def) => { try { return JSON.parse(await fs.readFile(path.join(DATA, f), "utf8")); } catch { return def; } };
const decode = s => String(s || "")
  .replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, "$1")
  .replace(/<[^>]+>/g, " ")
  .replace(/&nbsp;/g, " ").replace(/&amp;/g, "&").replace(/&lt;/g, "<").replace(/&gt;/g, ">")
  .replace(/&quot;/g, '"').replace(/&#39;|&apos;/g, "'").replace(/&#(\d+);/g, (_, n) => String.fromCharCode(+n))
  .replace(/\s+/g, " ").trim();

// Uses curl (pre-installed on GitHub runners); DGFT rejects Node's built-in fetch client.
const run = promisify(execFile);
async function get(url, tries = 2) {
  let last;
  for (let i = 0; i < tries; i++) {
    try {
      const { stdout } = await run("curl", ["-sS", "-L", "--max-time", "40", "--fail", "-A", UA, "-H", "Accept: text/html,application/xml,text/xml,*/*", url], { maxBuffer: 20 * 1024 * 1024 });
      if (!stdout || stdout.length < 200) throw new Error("empty response");
      return stdout;
    } catch (e) { last = new Error(String(e.stderr || e.message || e).trim().split("\n").pop()); await new Promise(res => setTimeout(res, 3000)); }
  }
  throw last;
}

// dd/mm/yyyy -> yyyy-mm-dd
const dmy = s => { const m = String(s).match(/(\d{1,2})\/(\d{1,2})\/(\d{4})/); return m ? `${m[3]}-${m[2].padStart(2, "0")}-${m[1].padStart(2, "0")}` : ""; };
const rfc = s => { const d = new Date(String(s).replace(/\s+$/, "")); return isNaN(d) ? "" : d.toISOString().slice(0, 10); };

export function parseDgftTable(html, baseUrl) {
  const start = html.indexOf('id="metaTable"'); if (start < 0) throw new Error("table not found");
  const t = html.slice(start); const body = t.split("</thead>")[1] || ""; const end = body.indexOf("</tbody>");
  const rows = (end > 0 ? body.slice(0, end) : body).match(/<tr[\s\S]*?<\/tr>/g) || [];
  const out = [];
  for (const r of rows) {
    const tds = r.match(/<td[\s\S]*?<\/td>/g) || []; if (tds.length < 5) continue;
    const cell = i => decode(tds[i]);
    const href = (r.match(/href="([^"]+)"/) || [])[1] || "";
    out.push({ num: cell(1), title: cell(3), date: dmy(cell(4)), link: href ? encodeURI(decodeURI(href)) : baseUrl });
  }
  if (!out.length) throw new Error("no rows parsed");
  return out;
}

export function parseRss(xml) {
  const items = xml.match(/<item[\s>][\s\S]*?<\/item>/g) || [];
  const out = items.map(it => {
    const tag = n => { const m = it.match(new RegExp(`<${n}[^>]*>([\\s\\S]*?)<\\/${n}>`)); return m ? m[1] : ""; };
    return { num: "", title: decode(tag("title")), date: rfc(decode(tag("pubDate"))), link: decode(tag("link")), desc: decode(tag("description")).slice(0, 300) };
  }).filter(x => x.title && x.link);
  if (!out.length) throw new Error("no RSS items");
  return out;
}

const esc = s => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
const has = (text, k) => new RegExp("(^|[^a-z0-9])" + esc(k.toLowerCase()) + "([^a-z0-9]|$)").test(text);
export function classify(item, watch) {
  const text = (item.title + " " + (item.desc || "")).toLowerCase();
  const tags = []; let important = false; const rules = [];
  for (const w of watch.tags) if (w.k.some(k => has(text, k))) { tags.push(w.tag); if (w.important) important = true; }
  for (const r of watch.rules) if (r.k.some(k => has(text, k))) rules.push(r.rule);
  return { tags: [...new Set(tags)], important, rules: [...new Set(rules)] };
}

async function main() {
  const sources = await readJSON("sources.json", []);
  const watch = await readJSON("watch.json", { tags: [], rules: [] });
  const prev = await readJSON("updates.json", { items: [] });
  const today = new Date().toISOString().slice(0, 10);
  const known = new Map(prev.items.map(i => [i.id, i]));
  const status = { runAt: new Date().toISOString(), sources: [] };
  let added = 0;

  for (const s of sources) {
    const st = { id: s.id, name: s.name, url: s.url, ok: false, count: 0, kept: 0, error: "" };
    try {
      const raw = await get(s.url);
      let rows = s.type === "dgft_table" ? parseDgftTable(raw, s.url) : parseRss(raw);
      st.count = rows.length;
      if (s.filter && s.filter.length) rows = rows.filter(r => s.filter.some(k => has((r.title + " " + (r.desc || "")).toLowerCase(), k)));
      rows = rows.slice(0, s.max || 60);
      st.kept = rows.length;
      for (const r of rows) {
        const id = s.id + ":" + (r.num || "") + ":" + r.title.slice(0, 120);
        const c = classify(r, watch);
        if (known.has(id)) { Object.assign(known.get(id), { tags: c.tags, important: c.important || !!s.alwaysImportant, rules: c.rules, link: r.link, date: r.date || known.get(id).date }); continue; }
        known.set(id, { id, src: s.id, srcName: s.name, kind: s.kind || "", official: !!s.official, num: r.num, title: r.title, desc: r.desc || "", date: r.date || today, link: r.link, firstSeen: today, ...c, important: c.important || !!s.alwaysImportant });
        added++;
      }
      st.ok = true;
    } catch (e) { st.error = String(e && e.message || e).slice(0, 200); }
    status.sources.push(st);
  }

  const items = [...known.values()].sort((a, b) => (b.date || "").localeCompare(a.date || "") || (b.firstSeen || "").localeCompare(a.firstSeen || "")).slice(0, MAX_ITEMS);
  const okCount = status.sources.filter(s => s.ok).length;
  status.ok = okCount; status.total = sources.length; status.added = added;
  const out = { generatedAt: status.runAt, lastChange: added ? status.runAt : (prev.lastChange || status.runAt), items };
  await fs.writeFile(path.join(DATA, "updates.json"), JSON.stringify(out, null, 1));
  await fs.writeFile(path.join(DATA, "status.json"), JSON.stringify(status, null, 1));
  console.log(`Sources ok ${okCount}/${sources.length}, new items ${added}, total ${items.length}`);
  for (const s of status.sources) console.log(` - ${s.ok ? "OK " : "ERR"} ${s.name}: ${s.kept}/${s.count} ${s.error}`);
  if (!okCount) process.exitCode = 1;
}

if (process.argv[1] && fileURLToPath(import.meta.url) === path.resolve(process.argv[1])) main();
