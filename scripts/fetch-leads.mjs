// GARCHA EXIM Navigator — daily buyer leads & foreign tenders collector (no AI, no dependencies). Node 18+.
// Sources: World Bank procurement notices API, EU TED search API, Google News RSS (buyer/sourcing news).
// Writes data/leads.json and data/leads-status.json.
import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { execFile } from "node:child_process";
import { promisify } from "node:util";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const DATA = path.join(ROOT, "data");
const UA = "GarchaEximNavigator/1.0 (+https://github.com/mangeshwarsinghp14/garcha-exim-navigator)";
const MAX = 1200;
const run = promisify(execFile);

async function curl(url, opts = {}) {
  const args = ["-sS", "-L", "--max-time", "45", "--fail", "-A", UA];
  if (opts.body) args.push("-X", "POST", "-H", "Content-Type: application/json", "--data", JSON.stringify(opts.body));
  args.push(url);
  let last;
  for (let i = 0; i < 2; i++) {
    try { const { stdout } = await run("curl", args, { maxBuffer: 30 * 1024 * 1024 }); if (!stdout) throw new Error("empty"); return stdout; }
    catch (e) { last = new Error(String(e.stderr || e.message || e).trim().split("\n").pop()); await new Promise(r => setTimeout(r, 3000)); }
  }
  throw last;
}
const decode = s => String(s || "").replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, "$1").replace(/<[^>]+>/g, " ")
  .replace(/&nbsp;/g, " ").replace(/&amp;/g, "&").replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&quot;/g, '"')
  .replace(/&#39;|&apos;/g, "'").replace(/&#(\d+);/g, (_, n) => String.fromCharCode(+n)).replace(/\s+/g, " ").trim();
const iso = d => { const x = new Date(d); return isNaN(x) ? "" : x.toISOString().slice(0, 10); };
const ymd = d => d.toISOString().slice(0, 10).replace(/-/g, "");
const pick = m => (m && typeof m === "object") ? (m.eng || m.ENG || Object.values(m)[0] || "") : (m || "");
const first = v => Array.isArray(v) ? v[0] : v;

// CPV division (first 2 digits) -> sector label
const CPV = { "03": "Agri & food", "15": "Agri & food", "09": "Fuels & oils", "14": "Minerals & metals", "16": "Machinery", "18": "Textiles & apparel", "19": "Leather & textiles",
  "22": "Paper & printing", "24": "Chemicals", "30": "Electronics & IT", "31": "Electrical", "32": "Electronics & IT", "33": "Medical & pharma", "34": "Vehicles & parts",
  "35": "Security & defence", "37": "Sports, toys & music", "38": "Lab & instruments", "39": "Furniture & home textiles", "41": "Water", "42": "Machinery", "43": "Machinery",
  "44": "Construction materials", "48": "Software" };

export async function worldBank() {
  const out = [];
  for (const grp of ["GO", "NC"]) {
    const u = "https://search.worldbank.org/api/v2/procnotices?format=json&rows=100&os=0&srt=noticedate&order=desc" +
      "&fl=id,project_name,bid_description,notice_type,noticedate,submission_date,project_ctry_name,procurement_group,bid_reference_no" +
      "&notice_type_exact=Invitation%20for%20Bids&procurement_group_exact=" + grp;
    const j = JSON.parse(await curl(u));
    for (const n of (j.procnotices || [])) {
      const ctry = n.project_ctry_name || "";
      if (/^india$/i.test(ctry)) continue; // foreign buyers only
      out.push({ id: "wb:" + n.id, src: "wb", srcName: "World Bank tenders", kind: "Tender", title: decode(n.bid_description || n.project_name), buyer: decode(n.project_name),
        country: ctry || "Multiple / regional", date: iso(n.noticedate), deadline: "", ref: n.bid_reference_no || n.id,
        sector: grp === "GO" ? "" : "Services (non-consulting)", link: "https://projects.worldbank.org/en/projects-operations/procurement-detail/" + n.id,
        note: "World Bank-financed: firms from India are generally eligible. Deadline and bid documents are in the notice; bid via the buyer named there." });
    }
  }
  if (!out.length) throw new Error("no notices");
  return out;
}

export async function ted() {
  const since = new Date(Date.now() - 3 * 864e5);
  const body = { query: `notice-type IN (cn-standard) AND contract-nature IN (supplies) AND publication-date>=${ymd(since)}`,
    fields: ["publication-number", "notice-title", "buyer-name", "buyer-country", "classification-cpv", "deadline-receipt-tender-date-lot", "publication-date"], limit: 250 };
  const j = JSON.parse(await curl("https://api.ted.europa.eu/v3/notices/search", { body }));
  const out = (j.notices || []).map(n => {
    const cpv = String(first(n["classification-cpv"]) || "");
    const t = String(pick(n["notice-title"]));
    const parts = t.split(" – ");
    return { id: "ted:" + n["publication-number"], src: "ted", srcName: "EU tenders (TED)", kind: "Tender", title: parts.length > 2 ? parts.slice(1).join(" – ") : t,
      buyer: decode(first(pick(n["buyer-name"])) || ""), country: parts.length > 1 ? parts[0] : String(first(n["buyer-country"]) || "EU"),
      date: iso(String(n["publication-date"]).slice(0, 10)), deadline: iso(String(first(n["deadline-receipt-tender-date-lot"]) || "").slice(0, 10)),
      ref: n["publication-number"], cpv, sector: CPV[cpv.slice(0, 2)] || "", link: "https://ted.europa.eu/en/notice/-/detail/" + n["publication-number"],
      note: "EU public tender. India is not in the WTO procurement agreement, so check the notice's eligibility rules; many open procedures accept foreign bidders, often via an EU partner." };
  }).filter(x => x.title);
  if (!out.length) throw new Error("no notices");
  return out;
}

const NEWS_Q = [
  ["Sourcing from India", '("Indian suppliers" OR "suppliers in India" OR "source from India" OR "sourcing from India") (seeks OR looking OR plans OR expands OR partner)'],
  ["Buyer delegations & meets", '("reverse buyer seller meet" OR "buyer-seller meet" OR "buyer delegation" OR "foreign buyers") India export'],
  ["Global sourcing plans", '("India sourcing" OR "sourcing hub" OR "procure from India") (retailer OR brand OR company OR startup)']
];
export async function news() {
  const out = [];
  for (const [label, q] of NEWS_Q) {
    if (out.length) await new Promise(r => setTimeout(r, 8000));
    let x; try { x = await curl("https://news.google.com/rss/search?q=" + encodeURIComponent(q + " when:7d") + "&hl=en-IN&gl=IN&ceid=IN:en"); } catch (e) { if (out.length) continue; throw e; }
    for (const it of (x.match(/<item[\s>][\s\S]*?<\/item>/g) || []).slice(0, 25)) {
      const tag = n => { const m = it.match(new RegExp(`<${n}[^>]*>([\\s\\S]*?)<\\/${n}>`)); return m ? decode(m[1]) : ""; };
      const title = tag("title"), link = tag("link"); if (!title || !link) continue;
      const m = title.match(/^(.*) - ([^-]+)$/);
      out.push({ id: "news:" + title.slice(0, 140), src: "news", srcName: "News: " + label, kind: "Buyer news", title: m ? m[1] : title, buyer: m ? m[2].trim() : "",
        country: "", date: iso(tag("pubDate")), deadline: "", ref: "", sector: "", link, note: "News report, not an official notice. Verify the company before sharing prices or samples." });
    }
  }
  if (!out.length) throw new Error("no items");
  return out;
}

async function main() {
  const prev = await fs.readFile(path.join(DATA, "leads.json"), "utf8").then(JSON.parse).catch(() => ({ items: [] }));
  const known = new Map(prev.items.map(i => [i.id, i]));
  const today = new Date().toISOString().slice(0, 10);
  const status = { runAt: new Date().toISOString(), sources: [] };
  let added = 0;
  for (const [id, name, fn] of [["wb", "World Bank tenders", worldBank], ["ted", "EU tenders (TED)", ted], ["news", "Buyer & sourcing news", news]]) {
    const st = { id, name, ok: false, count: 0, error: "" };
    try {
      const rows = await fn(); st.count = rows.length; st.ok = true;
      for (const r of rows) { if (known.has(r.id)) { Object.assign(known.get(r.id), { deadline: r.deadline || known.get(r.id).deadline }); continue; } known.set(r.id, { ...r, firstSeen: today }); added++; }
    } catch (e) { st.error = String(e.message || e).slice(0, 200); }
    status.sources.push(st);
  }
  const cutNews = new Date(Date.now() - 30 * 864e5).toISOString().slice(0, 10);
  const cutDead = new Date(Date.now() - 3 * 864e5).toISOString().slice(0, 10);
  const cutAny = new Date(Date.now() - 60 * 864e5).toISOString().slice(0, 10);
  const items = [...known.values()].filter(i => i.kind === "Buyer news" ? (i.date || i.firstSeen) >= cutNews : (i.deadline ? i.deadline >= cutDead : (i.date || i.firstSeen) >= cutAny))
    .sort((a, b) => (b.firstSeen || "").localeCompare(a.firstSeen || "") || (b.date || "").localeCompare(a.date || "")).slice(0, MAX);
  status.ok = status.sources.filter(s => s.ok).length; status.total = status.sources.length; status.added = added;
  await fs.writeFile(path.join(DATA, "leads.json"), JSON.stringify({ generatedAt: status.runAt, items }, null, 0));
  await fs.writeFile(path.join(DATA, "leads-status.json"), JSON.stringify(status, null, 1));
  console.log(`Lead sources ok ${status.ok}/${status.total}, new ${added}, total ${items.length}`);
  for (const s of status.sources) console.log(` - ${s.ok ? "OK " : "ERR"} ${s.name}: ${s.count} ${s.error}`);
  if (!status.ok) process.exitCode = 1;
}
if (process.argv[1] && fileURLToPath(import.meta.url) === path.resolve(process.argv[1])) main();
