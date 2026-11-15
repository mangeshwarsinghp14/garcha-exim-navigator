/* ===== GARCHA EXIM NAVIGATOR — APP LOGIC ===== */
(function(){
"use strict";
const $=(s,r=document)=>r.querySelector(s), $$=(s,r=document)=>Array.from(r.querySelectorAll(s));
const esc=v=>String(v==null?"":v).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const uid=()=>Date.now().toString(36)+Math.random().toString(36).slice(2,7);
const num=v=>{const n=parseFloat(String(v).replace(/,/g,""));return isFinite(n)?n:0};
const inr=v=>"₹"+Math.round(v).toLocaleString("en-IN");
const fmt=(v,d=2)=>(+v).toLocaleString("en-IN",{minimumFractionDigits:d,maximumFractionDigits:d});
const today=()=>{const d=new Date();d.setHours(0,0,0,0);return d};
const parseD=s=>{if(!s)return null;const [y,m,d]=s.split("-").map(Number);if(!y||!m||!d)return null;return new Date(y,m-1,d)};
const isoD=d=>d.getFullYear()+"-"+String(d.getMonth()+1).padStart(2,"0")+"-"+String(d.getDate()).padStart(2,"0");
const showD=d=>d?d.toLocaleDateString("en-IN",{day:"2-digit",month:"short",year:"numeric"}):"—";
function addMonths(d,m){const r=new Date(d.getFullYear(),d.getMonth()+m,1);const last=new Date(r.getFullYear(),r.getMonth()+1,0).getDate();r.setDate(Math.min(d.getDate(),last));return r}
const addDays=(d,n)=>{const r=new Date(d);r.setDate(r.getDate()+n);return r};
const daysBetween=(a,b)=>Math.round((b-a)/864e5);

/* ---------- STATE & PERSISTENCE ---------- */
const RULES={asOf:"2026-11-15",realiseMonths:9,realiseMonthsINR:12,rodtepEnd:"2026-12-31",keyRules:[
 "Export proceeds must be realised within 9 months of shipment (12 months if invoiced/settled in INR) — FEMA (Export & Import of Goods and Services) Regulations 2026, in force from 1 Oct 2026.",
 "FEMA Second Amendment (notified 2 Nov 2026, effective 1 Oct 2026): service exporters are deemed to have filed the EDF when they give the bank payment details — resident individuals (any value), others up to ₹10 lakh per remittance.",
 "RoDTEP continues up to 31 Dec 2026 at unchanged rates.",
 "FTAs in force: UK CETA (15 Jul 2026), Oman CEPA (1 Jun 2026), India–New Zealand FTA (20 Oct 2026, 100% of Indian exports duty-free). EU FTA concluded, not yet in force.",
 "INR-invoiced exports get full FTP benefits (FTP amendment, 20 Aug 2026).",
 "Rice (HSN 1006) export policy condition amended by DGFT Notification 47 dated 9 Nov 2026 — check before contracting."],ruleNames:{},confirmedNote:""};
const RM=inr=>inr?RULES.realiseMonthsINR:RULES.realiseMonths;
const AI_OK=!!(window.claude&&window.claude.use);
const KEYS=["profile","road","ships","regs","contacts","tasks","plans","prep"];
const DEF={profile:{name:"",mode:"export",product:"",hs:"",markets:"",city:"",state:"Punjab"},road:{},ships:[],regs:[],contacts:[],tasks:[],plans:[],prep:{}};
const S=JSON.parse(JSON.stringify(DEF));
const LS="garcha-exim-v3";
try{if(!localStorage.getItem("garcha-exim-v3")){const old=localStorage.getItem("garcha-exim-v2")||localStorage.getItem("garcha-exim-v1");if(old)localStorage.setItem("garcha-exim-v3",old)}}catch(e){}
let DB=null, UIDV=null, syncState="local";
try{const raw=localStorage.getItem(LS);if(raw){const o=JSON.parse(raw);KEYS.forEach(k=>{if(o[k]!=null)S[k]=o[k]})}}catch(e){}
const pend={}, writing={}, timers={};
function save(key){
  try{localStorage.setItem(LS,JSON.stringify(S))}catch(e){}
  if(!DB||!UIDV)return;
  clearTimeout(timers[key]); timers[key]=setTimeout(()=>flush(key),700);
}
async function flush(key){
  if(writing[key]){pend[key]=true;return}
  writing[key]=true; setSync("saving");
  try{await DB.doc("data/users/"+UIDV+"/"+key).set({v:JSON.parse(JSON.stringify(S[key])),at:Date.now()});setSync("cloud")}
  catch(e){setSync(e&&e.code==="quota_exceeded"?"full":"error")}
  writing[key]=false;
  if(pend[key]){pend[key]=false;flush(key)}
}
function setSync(s){syncState=s;const el=$("#sync");if(!el)return;
  const m={local:["Saved on this device","dot-grey"],cloud:["Synced to your account","dot-green"],saving:["Saving…","dot-amber"],error:["Sync failed – saved on this device","dot-red"],full:["Cloud storage full – saved on this device","dot-red"],loading:["Loading your data…","dot-amber"]}[s]||["",""];
  el.innerHTML='<span class="dot '+m[1]+'"></span>'+esc(m[0]);}
async function initCloud(){
  if(!window.claude||!window.claude.use)return;
  try{
    const [db,user]=await Promise.all([window.claude.use("db"),window.claude.use("user")]);
    if(!db||!user)return;
    const id=await user.id(); if(!id)return;
    DB=db;UIDV=id;setSync("loading");
    let anyCloud=false;
    const res=await Promise.all(KEYS.map(k=>DB.doc("data/users/"+UIDV+"/"+k).get().catch(()=>null)));
    res.forEach((snap,i)=>{const k=KEYS[i];if(snap&&snap.exists){const d=snap.data();if(d&&d.v!=null){S[k]=JSON.parse(JSON.stringify(d.v));anyCloud=true}}});
    if(!anyCloud){ // first time: push local data up
      for(const k of KEYS){ if(JSON.stringify(S[k])!==JSON.stringify(DEF[k])) await flush(k) }
    }
    try{localStorage.setItem(LS,JSON.stringify(S))}catch(e){}
    setSync("cloud"); render();
  }catch(e){setSync("local")}
}

/* ---------- ROUTING ---------- */
const VIEWS=[
 ["dashboard","Dashboard","◉"],["updates","Latest Rulings & Updates","📰"],["prep","Before You Start (checklist)","🧰"],["planner","Trade Planner (flowchart)","🧭"],["roadmap","Step-by-step Roadmap","➜"],["shipments","Shipment Tracker","⛴"],["todo","Pending Tasks","☑"],
 ["registrations","Licences & Registrations","🪪"],["documents","Documents Library","📄"],["calculators","Calculators","🧮"],
 ["finance","Finance & Payments","₹"],["schemes","Incentives & Schemes","🎯"],["procure","Procure & Sell","🔎"],
 ["markets","Markets & FTAs","🌍"],["legal","Legal & Incoterms","⚖"],["contacts","Contacts","👥"],
 ["advisor","Ask the Advisor","💬"],["glossary","Glossary","📘"],["backup","Backup & Export","⤓"]
];
if(!AI_OK){const ai=VIEWS.findIndex(v=>v[0]==="advisor");if(ai>=0)VIEWS.splice(ai,1)}
function cur(){const h=(location.hash||"").replace("#","");return VIEWS.some(v=>v[0]===h)?h:"dashboard"}
window.addEventListener("hashchange",()=>{render();window.scrollTo(0,0)});

function nav(){
  const c=cur();
  const ub=typeof unreadImportant==="function"?unreadImportant():0;
  $("#nav").innerHTML=VIEWS.map(v=>'<a href="#'+v[0]+'" class="'+(v[0]===c?"on":"")+'"><span class="ic">'+v[2]+'</span>'+esc(v[1])+(v[0]==="updates"&&ub?' <span class="nbadge">'+ub+'</span>':'')+'</a>').join("");
  $("#navsel").innerHTML=VIEWS.map(v=>'<option value="'+v[0]+'"'+(v[0]===c?" selected":"")+'>'+esc(v[1])+'</option>').join("");
}
function modes(){const m=S.profile.mode;return m==="both"?["export","import"]:[m]}

/* ---------- ROADMAP HELPERS ---------- */
function allSteps(mode){const out=[];ROADMAP[mode].forEach(p=>p.steps.forEach(s=>out.push(Object.assign({phase:p.phase},s))));return out}
function progress(mode){const st=allSteps(mode);const d=st.filter(s=>S.road[s.id]&&S.road[s.id].d).length;return {d,t:st.length,pct:st.length?Math.round(d*100/st.length):0}}
function nextSteps(mode,n=3){return allSteps(mode).filter(s=>!(S.road[s.id]&&S.road[s.id].d)).slice(0,n)}

/* ---------- COMPLIANCE CALENDAR ---------- */
function calendar(){
  const t=today(), y=t.getFullYear(), items=[];
  const push=(date,title,kind,link)=>items.push({date,title,kind,link,days:daysBetween(t,date)});
  // IEC annual update (Apr–Jun)
  let iecEnd=new Date(y,5,30), iecStart=new Date(y,3,1);
  if(t>iecEnd){iecEnd=new Date(y+1,5,30);iecStart=new Date(y+1,3,1)}
  push(iecEnd,(t>=iecStart?"IEC annual update window OPEN – complete by 30 Jun":"IEC annual update (window 1 Apr – 30 Jun)"),"law","#registrations");
  // LUT before 1 Apr
  if(S.profile.mode!=="import"){let lut=new Date(y,2,31);if(t>lut)lut=new Date(y+1,2,31);push(lut,"File GST LUT (RFD-11) for next financial year","law","#roadmap")}
  // GST returns
  let g1=new Date(y,t.getMonth(),11);if(t>g1)g1=addMonths(g1,1);push(g1,"GSTR-1 (monthly filers) – report exports/sales","tax","#roadmap");
  let g3=new Date(y,t.getMonth(),20);if(t>g3)g3=addMonths(g3,1);push(g3,"GSTR-3B (monthly filers) – pay tax / claim import IGST","tax","#roadmap");
  // RoDTEP scheme end
  const rod=parseD(RULES.rodtepEnd);if(rod&&t<=rod&&S.profile.mode!=="import")push(rod,"RoDTEP scheme valid up to "+showD(rod)+" – watch the Updates page for extension","scheme","#updates");
  // shipments
  S.ships.forEach(s=>{const sd=parseD(s.shipDate);if(!sd)return;
    if(s.type==="export"){
      const st=STAGES.export;const paidIdx=st.indexOf("Payment realised"), bankIdx=st.indexOf("Docs to bank");
      if((s.stage|0)<bankIdx){const dd=addDays(sd,21);push(dd,"Submit docs to bank – "+(s.ref||"export"),"ship","#shipments")}
      if((s.stage|0)<paidIdx){push(realDue(s),"FEMA realisation deadline – "+(s.ref||"export")+" ("+RM(s.inrInv)+" months)","ship","#shipments")}
    }else{
      const st=STAGES.import;const idx=st.indexOf("BoE to bank (IDPMS)");
      if((s.stage|0)<idx){push(addMonths(sd,6),"Import payment / IDPMS closure check – "+(s.ref||"import"),"ship","#shipments")}
    }});
  // registrations expiry
  S.regs.forEach(r=>{const e=parseD(r.expiry);if(e)push(e,"Expiry: "+r.name+(r.no?" ("+r.no+")":""),"reg","#registrations")});
  return items.filter(i=>i.days>=-120).sort((a,b)=>a.date-b.date);
}
function realDue(s){const sd=parseD(s.shipDate);return sd?addMonths(sd,RM(s.inrInv)):null}

/* ---------- VIEWS ---------- */
const V={};
V.dashboard=function(){
  const p=S.profile, ms=modes();
  const prog=ms.map(m=>{const pr=progress(m),nx=nextSteps(m,3);
    return '<div class="card"><div class="row sb"><h3>'+(m==="export"?"Export journey":"Import journey")+'</h3><b class="big">'+pr.pct+'%</b></div>'+
    '<div class="bar"><i style="width:'+pr.pct+'%"></i></div><p class="muted">'+pr.d+' of '+pr.t+' steps done</p>'+
    (nx.length?'<h4>Your next step'+(nx.length>1?'s':'')+'</h4><ol class="next">'+nx.map(s=>'<li><b>'+esc(s.t)+'</b><br><span class="muted small">'+esc(s.phase)+'</span></li>').join("")+'</ol><a class="btn" href="#roadmap">Open roadmap →</a>':'<p class="ok">All steps complete — focus on scaling (Schemes & Markets).</p>')+'</div>'}).join("");
  const cal=calendar().slice(0,12);
  const calH=cal.length?'<table class="tbl"><thead><tr><th>Due</th><th>What</th><th>In</th></tr></thead><tbody>'+cal.map(i=>'<tr class="'+(i.days<0?"late":i.days<=30?"soon":"")+'"><td>'+showD(i.date)+'</td><td><a href="'+i.link+'">'+esc(i.title)+'</a></td><td>'+(i.days<0?Math.abs(i.days)+"d overdue":i.days+"d")+'</td></tr>').join("")+'</tbody></table>':'<p class="muted">Nothing due.</p>';
  const open=S.ships.filter(s=>(s.stage|0)<STAGES[s.type].length-1);
  const totE=S.ships.filter(s=>s.type==="export").reduce((a,s)=>a+num(s.inr),0), totI=S.ships.filter(s=>s.type==="import").reduce((a,s)=>a+num(s.inr),0);
  const tasks=S.tasks.filter(t=>!t.done).sort((a,b)=>a.pri-b.pri).slice(0,5);
  return '<div class="hero"><div><h2>'+(p.name?"Namaste, "+esc(p.name):"Welcome to your EXIM command centre")+'</h2><p>'+(p.product?"Product: <b>"+esc(p.product)+"</b>"+(p.hs?" · HS "+esc(p.hs):""):"Set your product below so the app can guide you.")+(p.markets?" · Target: "+esc(p.markets):"")+'</p></div></div>'+
  '<div class="card cta"><h3>🧭 What do you want to do?</h3><p class="small muted">Type it in one line — the Trade Planner builds a full flowchart with permissions, whom to meet, documents and money.</p><form id="dashplan" class="row gap wrap"><input id="dashq" placeholder="e.g. export basmati rice to UK  /  import LED lights from China" style="flex:1;min-width:240px"><button class="btn">Build my plan</button></form></div>'+
  (()=>{if(!UPD.items.length)return '<div class="card"><h3>📰 Latest rulings</h3><p class="muted small">'+(UPD.loading?"Checking DGFT & RBI…":"Connect to the internet to load today’s DGFT & RBI updates.")+'</p><a class="btn ghost" href="#updates">Open updates →</a></div>';
    const L=UPD.items.filter(i=>i.important).slice(0,5);
    return '<div class="card"><div class="row sb wrap gap"><h3>📰 What changed recently</h3><span class="small muted">collected '+fmtDT(UPD.generatedAt)+'</span></div><ul class="plain">'+L.map(i=>'<li>'+(readSet.has(i.id)?'':'<span class="pill amber">New</span> ')+'<span class="small muted">'+esc(showD(parseD(i.date)))+' · '+esc(i.kind||"")+' '+esc(i.num||"")+'</span><br><a href="'+esc(i.link)+'" target="_blank" rel="noopener" data-updopen="'+esc(i.id)+'">'+esc(i.title)+'</a></li>').join("")+'</ul><a class="btn ghost" href="#updates">All updates ('+UPD.items.length+') →</a></div>'})()+
  (()=>{const vis=PREP.filter(prepVisible),d=vis.filter(i=>prepDone(i.id)).length,m=vis.filter(i=>i.need==="Must"&&!prepDone(i.id)).length,pc=vis.length?Math.round(d*100/vis.length):0;
    return '<div class="card"><div class="row sb"><h3>🧰 Before you start</h3><b class="big">'+pc+'%</b></div><div class="bar"><i style="width:'+pc+'%"></i></div><p class="muted small">'+(m?m+' must-have items still missing (bank, GST, IEC…).':'All must-haves in place.')+'</p><a class="btn ghost" href="#prep">Open checklist →</a></div>'})()+
  '<div class="card"><h3>Your profile</h3><div class="grid4">'+
   fld("pf_name","Your / business name",p.name)+fld("pf_product","Product",p.product)+fld("pf_hs","HS code (8-digit)",p.hs)+fld("pf_markets","Target countries / sources",p.markets)+'<label class="f"><span>Your state</span><select id="pf_state">'+Object.keys(STATES).map(x=>'<option'+(p.state===x?" selected":"")+'>'+esc(x)+'</option>').join("")+'</select></label></div>'+
   '<div class="row gap mt"><label class="lbl">I want to</label><div class="seg">'+["export","import","both"].map(m=>'<button data-mode="'+m+'" class="'+(p.mode===m?"on":"")+'">'+(m==="both"?"Export + Import":m[0].toUpperCase()+m.slice(1))+'</button>').join("")+'</div></div></div>'+
  '<div class="grid2">'+prog+'</div>'+
  '<div class="grid2"><div class="card"><h3>Compliance & deadline calendar</h3>'+calH+'</div>'+
  '<div class="card"><h3>Business snapshot</h3><div class="kpis"><div><b>'+S.ships.length+'</b><span>shipments</span></div><div><b>'+open.length+'</b><span>open</span></div><div><b>'+inr(totE)+'</b><span>export value</span></div><div><b>'+inr(totI)+'</b><span>import value</span></div></div>'+
  '<h4>Top pending tasks</h4>'+(tasks.length?'<ul class="plain">'+tasks.map(t=>'<li><span class="pri p'+t.pri+'">P'+t.pri+'</span> '+esc(t.t)+'</li>').join("")+'</ul>':'<p class="muted">No pending tasks.</p>')+'<a class="btn ghost" href="#todo">Manage tasks</a></div></div>'+
  '<div class="card note"><b>Key rules right now (confirmed '+ASOF+'):</b><ul>'+RULES.keyRules.map(r=>'<li>'+esc(r)+'</li>').join("")+'</ul><p class="small muted">Rules change often — always confirm on DGFT / CBIC / RBI before acting. This app is a guide, not legal or financial advice.</p></div>';
};
function fld(id,l,v,type="text",extra=""){return '<label class="f"><span>'+esc(l)+'</span><input id="'+id+'" type="'+type+'" value="'+esc(v)+'" '+extra+'></label>'}

V.roadmap=function(){
  return modes().map(m=>{const pr=progress(m);
   return '<div class="card"><div class="row sb"><h2>'+(m==="export"?"Export roadmap — start to finish":"Import roadmap — start to finish")+'</h2><b class="big">'+pr.pct+'%</b></div><div class="bar"><i style="width:'+pr.pct+'%"></i></div>'+
   '<p class="muted small">Tick each step as you finish it. The first unticked step is your next step. Add notes (ref nos, dates, contacts) in each step.</p></div>'+
   ROADMAP[m].map(ph=>{const d=ph.steps.filter(s=>S.road[s.id]&&S.road[s.id].d).length;
    return '<details class="phase" '+(d<ph.steps.length?"open":"")+'><summary><b>'+esc(ph.phase)+'</b><span class="pill">'+d+'/'+ph.steps.length+'</span></summary>'+
    ph.steps.map(s=>{const r=S.road[s.id]||{};const isNext=nextSteps(m,1)[0]&&nextSteps(m,1)[0].id===s.id;
     return '<div class="step '+(r.d?"done":"")+(isNext?" isnext":"")+'"><label class="chk"><input type="checkbox" data-step="'+s.id+'" '+(r.d?"checked":"")+'><span>'+esc(s.t)+'</span>'+(isNext?'<em class="tag">NEXT</em>':'')+'</label>'+
     '<p>'+esc(s.d)+'</p><div class="meta">'+(s.where?'<span>📍 <a href="'+esc(s.where[1])+'" target="_blank" rel="noopener">'+esc(s.where[0])+'</a></span>':'')+(s.docs&&s.docs!=="—"?'<span>📄 '+esc(s.docs)+'</span>':'')+'<span>⏱ '+esc(s.time)+'</span><span>💰 '+esc(s.cost)+'</span></div>'+
     (s.tip?'<p class="tip">💡 '+esc(s.tip)+'</p>':'')+'<textarea data-note="'+s.id+'" placeholder="My notes for this step…" rows="1">'+esc(r.n||"")+'</textarea></div>'}).join("")+'</details>'}).join("")}).join("");
};

V.shipments=function(){
  const list=S.ships.slice().sort((a,b)=>(b.shipDate||"").localeCompare(a.shipDate||""));
  return '<div class="card"><div class="row sb"><h2>Shipment tracker</h2><div class="row gap"><button class="btn" data-addship="export">+ Export shipment</button><button class="btn ghost" data-addship="import">+ Import shipment</button></div></div>'+
  '<p class="muted small">Each shipment moves through stages. Export realisation deadline is auto-calculated (9 months; 12 if INR-invoiced). Click a stage to move it.</p></div>'+
  (list.length?list.map(shipCard).join(""):'<div class="card empty">No shipments yet. Add your first one above.</div>');
};
function shipCard(s){
  const st=STAGES[s.type], idx=s.stage|0, due=s.type==="export"?realDue(s):null, t=today();
  let dueH="";
  if(due&&idx<st.indexOf("Payment realised")){const dl=daysBetween(t,due);dueH='<span class="pill '+(dl<0?"red":dl<=60?"amber":"green")+'">Realise by '+showD(due)+' ('+(dl<0?Math.abs(dl)+'d overdue':dl+'d left')+')</span>'}
  return '<div class="card ship"><div class="row sb"><h3>'+(s.type==="export"?"⬆ Export":"⬇ Import")+' · '+esc(s.ref||"(no ref)")+'</h3><div class="row gap">'+dueH+'<button class="btn sm ghost" data-delship="'+s.id+'">Delete</button></div></div>'+
  '<div class="grid4">'+
   sf(s,"ref","Ref / Invoice no")+sf(s,"party",s.type==="export"?"Buyer":"Supplier")+sf(s,"country","Country")+sf(s,"product","Product")+
   sf(s,"hs","HS code")+sf(s,"value","Value (foreign currency)","number")+sel(s,"cur","Currency",["USD","EUR","GBP","AED","INR","AUD","CHF","JPY","CNY","SGD"])+sf(s,"inr","Value in ₹","number")+
   sel(s,"incoterm","Incoterm",["EXW","FCA","FAS","FOB","CFR","CIF","CPT","CIP","DAP","DPU","DDP"])+sel(s,"pay","Payment terms",["Advance","LC at sight","Confirmed LC","Usance LC","D/P","D/A","Open account","Part advance + balance"])+sf(s,"shipDate","Shipment date (LEO/BL)","date")+
   (s.type==="export"?'<label class="f chkf"><input type="checkbox" data-sfc="'+s.id+'" '+(s.inrInv?"checked":"")+'><span>Invoiced/settled in INR (12-month window)</span></label>':sf(s,"boe","Bill of Entry no"))+
  '</div><div class="stages">'+st.map((n,i)=>'<button data-stage="'+s.id+'" data-i="'+i+'" class="'+(i<idx?"past":i===idx?"now":"")+'">'+(i<idx?"✓ ":"")+esc(n)+'</button>').join("")+'</div>'+
  '<textarea data-sf="'+s.id+'" data-k="notes" rows="2" placeholder="Notes: CHA, vessel, BL no, LC no, follow-ups…">'+esc(s.notes||"")+'</textarea></div>';
}
function sf(s,k,l,type="text"){return '<label class="f"><span>'+esc(l)+'</span><input data-sf="'+s.id+'" data-k="'+k+'" type="'+type+'" value="'+esc(s[k]||"")+'"></label>'}
function sel(s,k,l,opts){return '<label class="f"><span>'+esc(l)+'</span><select data-sf="'+s.id+'" data-k="'+k+'"><option value=""></option>'+opts.map(o=>'<option'+(s[k]===o?" selected":"")+'>'+esc(o)+'</option>').join("")+'</select></label>'}

V.todo=function(){
  const L=S.tasks.slice().sort((a,b)=>(a.done-b.done)||(a.pri-b.pri));
  return '<div class="card"><h2>Pending tasks (by priority)</h2><form id="taskf" class="row gap wrap"><input id="tk_t" placeholder="Add a task… e.g. Ask CHA for Mundra quote" style="flex:1;min-width:220px"><select id="tk_p"><option value="1">P1 – urgent</option><option value="2" selected>P2 – important</option><option value="3">P3 – later</option></select><button class="btn">Add</button></form>'+
  '<div class="row gap mt"><button class="btn ghost sm" id="seedtasks">Add suggested tasks from my next roadmap steps</button></div></div>'+
  '<div class="card">'+(L.length?'<ul class="tasks">'+L.map(t=>'<li class="'+(t.done?"done":"")+'"><label class="chk"><input type="checkbox" data-task="'+t.id+'" '+(t.done?"checked":"")+'><span class="pri p'+t.pri+'">P'+t.pri+'</span> <span>'+esc(t.t)+'</span></label><select data-taskp="'+t.id+'">'+[1,2,3].map(p=>'<option value="'+p+'"'+(t.pri===p?" selected":"")+'>P'+p+'</option>').join("")+'</select><button class="btn sm ghost" data-deltask="'+t.id+'">✕</button></li>').join("")+'</ul>':'<p class="muted">No tasks yet.</p>')+'</div>';
};

V.registrations=function(){
  const sug=["IEC","GSTIN","LUT (FY)","RCMC","AD Code (port)","Udyam","DSC","FSSAI","APEDA RCMC","BIS licence","LMPC","ECGC policy","Trademark"];
  return '<div class="card"><h2>Licences & registrations</h2><p class="muted small">Track every number and expiry. Expiries show on the Dashboard calendar.</p><div class="row gap wrap">'+sug.map(n=>'<button class="btn sm ghost" data-addreg="'+esc(n)+'">+ '+esc(n)+'</button>').join("")+'<button class="btn sm" data-addreg="">+ Other</button></div></div>'+
  (S.regs.length?'<div class="card"><table class="tbl edit"><thead><tr><th>Name</th><th>Number</th><th>Issued</th><th>Expiry / renewal</th><th>Notes</th><th></th></tr></thead><tbody>'+S.regs.map(r=>'<tr><td><input data-rg="'+r.id+'" data-k="name" value="'+esc(r.name)+'"></td><td><input data-rg="'+r.id+'" data-k="no" value="'+esc(r.no||"")+'"></td><td><input type="date" data-rg="'+r.id+'" data-k="issued" value="'+esc(r.issued||"")+'"></td><td><input type="date" data-rg="'+r.id+'" data-k="expiry" value="'+esc(r.expiry||"")+'"></td><td><input data-rg="'+r.id+'" data-k="notes" value="'+esc(r.notes||"")+'"></td><td><button class="btn sm ghost" data-delreg="'+r.id+'">✕</button></td></tr>').join("")+'</tbody></table></div>':'<div class="card empty">Nothing added yet.</div>');
};

let docFilter={side:"",q:""};
V.documents=function(){
  const rows=DOCS.filter(d=>(!docFilter.side||d[1]===docFilter.side||d[1]==="B")&&(!docFilter.q||d.join(" ").toLowerCase().includes(docFilter.q.toLowerCase())));
  return '<div class="card"><h2>Documents library ('+DOCS.length+')</h2><div class="row gap wrap"><div class="seg">'+[["","All"],["E","Export"],["I","Import"]].map(x=>'<button data-dside="'+x[0]+'" class="'+(docFilter.side===x[0]?"on":"")+'">'+x[1]+'</button>').join("")+'</div><input id="dq" placeholder="Search documents…" value="'+esc(docFilter.q)+'" style="flex:1;min-width:200px"></div></div>'+
  '<div class="card"><table class="tbl"><thead><tr><th>Document</th><th>For</th><th>Stage</th><th>Issued by</th><th>Purpose</th><th>Mandatory?</th><th>Where</th></tr></thead><tbody>'+
  rows.map(d=>'<tr><td><b>'+esc(d[0])+'</b></td><td>'+({E:"Export",I:"Import",B:"Both"}[d[1]])+'</td><td>'+esc(d[2])+'</td><td>'+esc(d[3])+'</td><td>'+esc(d[4])+'</td><td>'+esc(d[5])+'</td><td>'+esc(d[6])+'</td></tr>').join("")+'</tbody></table></div>';
};

/* ---- calculators ---- */
const CALC_DEF={
 ex:{cost:250,qty:1000,margin:15,inland:15000,cha:12000,docs:3000,bank:0.5,ecgc:0.3,freight:1200,ins:0.2,rate:88,inc:2.5},
 im:{fob:10000,freight:"",ins:"",rate:88,bcd:10,sws:10,add:0,igst:18,cess:0,cha:15000,port:12000,inland:8000,bankc:0.5,qty:1000,gstReg:true,margin:20},
 cbm:{l:60,w:40,h:40,n:500,kg:12},
 rd:{date:isoD(today()),inr:false}
};
let C=JSON.parse(JSON.stringify(CALC_DEF));
try{const c=JSON.parse(sessionStorage.getItem("garcha-calc")||"null");if(c)C=Object.assign(C,c)}catch(e){}
function cin(g,k,l,step="any",suf=""){const v=C[g][k];return '<label class="f"><span>'+esc(l)+(suf?' <i>'+suf+'</i>':'')+'</span><input data-c="'+g+'" data-k="'+k+'" type="number" step="'+step+'" value="'+esc(v)+'"></label>'}
function calcExport(c){
  const qty=Math.max(1,num(c.qty)), exw=num(c.cost)*qty*(1+num(c.margin)/100);
  const fixed=num(c.inland)+num(c.cha)+num(c.docs);
  const pct=(num(c.bank)+num(c.ecgc))/100;
  const fobINR=(exw+fixed)/Math.max(0.01,1-pct);
  const rate=Math.max(0.0001,num(c.rate)), fobFC=fobINR/rate;
  const cfrFC=fobFC+num(c.freight);
  const insP=num(c.ins)/100, cifFC=cfrFC/Math.max(0.01,1-1.1*insP);
  const incINR=fobINR*num(c.inc)/100;
  return {exw,fixed,fobINR,fobFC,cfrFC,cifFC,incINR,perUnit:{fob:fobFC/qty,cfr:cfrFC/qty,cif:cifFC/qty,fobNet:(fobINR-incINR)/rate/qty},qty};
}
function calcImport(c){
  const rate=Math.max(0.0001,num(c.rate)), fob=num(c.fob);
  const fr=c.freight===""||c.freight==null?fob*0.20:num(c.freight);
  const ins=c.ins===""||c.ins==null?fob*0.01125:num(c.ins);
  const av=(fob+fr+ins)*rate;
  const bcd=av*num(c.bcd)/100, sws=bcd*num(c.sws)/100, add=av*num(c.add)/100;
  const igstBase=av+bcd+sws+add, igst=igstBase*num(c.igst)/100, cess=igstBase*num(c.cess)/100;
  const duty=bcd+sws+add+igst+cess;
  const other=num(c.cha)+num(c.port)+num(c.inland)+fob*rate*num(c.bankc)/100;
  const landedGross=av+duty+other, credit=c.gstReg?igst+cess:0, landed=landedGross-credit;
  const qty=Math.max(1,num(c.qty)), pu=landed/qty, sell=pu*(1+num(c.margin)/100);
  return {fr,ins,av,bcd,sws,add,igst,cess,duty,other,landedGross,credit,landed,pu,sell,qty,frAssumed:c.freight===""||c.freight==null,insAssumed:c.ins===""||c.ins==null};
}
const CONT=[["20' GP",28,25000],["40' GP",58,26500],["40' HC",68,26500]];
function calcCBM(c){const unit=num(c.l)*num(c.w)*num(c.h)/1e6, n=Math.max(0,num(c.n)), cbm=unit*n, kg=num(c.kg)*n;
  return {unit,cbm,kg,fit:CONT.map(k=>({n:k[0],byVol:unit>0?Math.floor(k[1]/unit):0,byWt:num(c.kg)>0?Math.floor(k[2]/num(c.kg)):Infinity,need:Math.max(cbm/k[1],kg/k[2])}))}}
V.calculators=function(){
  const e=calcExport(C.ex), i=calcImport(C.im), b=calcCBM(C.cbm);
  const rd=parseD(C.rd.date), due=rd?addMonths(rd,RM(C.rd.inr)):null;
  const best=b.fit.find(f=>f.need<=1);
  return '<div class="grid2">'+
  '<div class="card"><h2>Export price builder</h2><p class="muted small">From your cost to EXW → FOB → CFR → CIF. Bank & ECGC charges are % of FOB; insurance at 110% of CIF.</p><div class="grid3">'+
   cin("ex","cost","Cost per unit","any","₹ incl. packing")+cin("ex","qty","Quantity","1")+cin("ex","margin","Profit margin","any","%")+
   cin("ex","inland","Inland freight to port","any","₹ total")+cin("ex","cha","CHA + port + THC","any","₹ total")+cin("ex","docs","Docs, CoO, inspection","any","₹ total")+
   cin("ex","bank","Bank charges","any","% of FOB")+cin("ex","ecgc","ECGC premium","any","% of FOB")+cin("ex","rate","Exchange rate","any","₹ per 1 FC")+
   cin("ex","freight","Ocean/air freight","any","FC total")+cin("ex","ins","Insurance rate","any","%")+cin("ex","inc","RoDTEP + drawback","any","% of FOB")+'</div>'+
   '<table class="tbl res"><tr><td>EXW value</td><td>'+inr(e.exw)+'</td></tr><tr><td>FOB value</td><td><b>'+inr(e.fobINR)+'</b> = '+fmt(e.fobFC)+' FC</td></tr><tr><td>FOB per unit</td><td><b>'+fmt(e.perUnit.fob,3)+'</b> FC</td></tr><tr><td>CFR per unit</td><td>'+fmt(e.perUnit.cfr,3)+' FC</td></tr><tr><td>CIF per unit</td><td>'+fmt(e.perUnit.cif,3)+' FC</td></tr><tr><td>Incentive earned (RoDTEP/drawback)</td><td>'+inr(e.incINR)+'</td></tr><tr><td>Lowest FOB/unit if you pass incentive to buyer</td><td>'+fmt(e.perUnit.fobNet,3)+' FC</td></tr></table></div>'+
  '<div class="card"><h2>Import landed cost</h2><p class="muted small">Assessable value = CIF × customs rate. Leave freight/insurance blank to use customs defaults (20% / 1.125% of FOB). Check your exact BCD, IGST, anti-dumping for your HS.</p><div class="grid3">'+
   cin("im","fob","FOB value","any","FC")+cin("im","freight","Freight","any","FC, blank = 20%")+cin("im","ins","Insurance","any","FC, blank = 1.125%")+
   cin("im","rate","Customs exchange rate","any","₹")+cin("im","bcd","BCD","any","%")+cin("im","sws","SWS","any","% of BCD")+
   cin("im","add","Anti-dumping/other","any","% of AV")+cin("im","igst","IGST","any","%")+cin("im","cess","Comp. cess","any","%")+
   cin("im","cha","CHA fee","any","₹")+cin("im","port","Port/CFS/line charges","any","₹")+cin("im","inland","Inland transport","any","₹")+
   cin("im","bankc","Bank/forex charges","any","% of FOB")+cin("im","qty","Quantity","1")+cin("im","margin","Your margin","any","%")+'</div>'+
   '<label class="f chkf"><input type="checkbox" data-c="im" data-k="gstReg" '+(C.im.gstReg?"checked":"")+'><span>I am GST-registered (IGST is creditable)</span></label>'+
   '<table class="tbl res"><tr><td>Freight / insurance used</td><td>'+fmt(i.fr)+(i.frAssumed?" (20%)":"")+' / '+fmt(i.ins)+(i.insAssumed?" (1.125%)":"")+' FC</td></tr><tr><td>Assessable value (AV)</td><td>'+inr(i.av)+'</td></tr><tr><td>BCD + SWS + ADD</td><td>'+inr(i.bcd)+' + '+inr(i.sws)+' + '+inr(i.add)+'</td></tr><tr><td>IGST + cess</td><td>'+inr(i.igst)+' + '+inr(i.cess)+'</td></tr><tr><td>Total duty paid at customs</td><td><b>'+inr(i.duty)+'</b></td></tr><tr><td>Clearing & other costs</td><td>'+inr(i.other)+'</td></tr><tr><td>Cash outflow (before ITC)</td><td>'+inr(i.landedGross)+'</td></tr><tr><td>Less IGST credit</td><td>'+inr(i.credit)+'</td></tr><tr><td>Net landed cost</td><td><b>'+inr(i.landed)+'</b></td></tr><tr><td>Landed cost per unit</td><td><b>'+inr(i.pu)+'</b></td></tr><tr><td>Selling price per unit (before GST)</td><td>'+inr(i.sell)+'</td></tr></table></div>'+
  '<div class="card"><h2>CBM & container planner</h2><div class="grid3">'+cin("cbm","l","Carton length","any","cm")+cin("cbm","w","Width","any","cm")+cin("cbm","h","Height","any","cm")+cin("cbm","n","No. of cartons","1")+cin("cbm","kg","Gross wt / carton","any","kg")+'</div>'+
   '<table class="tbl res"><tr><td>CBM per carton</td><td>'+fmt(b.unit,4)+'</td></tr><tr><td>Total volume</td><td><b>'+fmt(b.cbm,2)+' CBM</b></td></tr><tr><td>Total weight</td><td>'+fmt(b.kg,0)+' kg</td></tr>'+b.fit.map(f=>'<tr><td>'+f.n+' (practical)</td><td>max '+Math.min(f.byVol,f.byWt)+' cartons · you need '+fmt(f.need,2)+' container(s)</td></tr>').join("")+'</table>'+
   '<p class="small">'+(b.cbm<15?"👉 Under ~15 CBM: <b>LCL</b> (shared container) is usually cheaper.":best?"👉 Fits in one <b>"+best.n+"</b>.":"👉 Needs multiple containers.")+' Practical capacities used: 20′≈28 CBM, 40′≈58, 40′HC≈68; confirm payload limits with your line.</p></div>'+
  '<div class="card"><h2>FEMA realisation deadline</h2><div class="grid3"><label class="f"><span>Date of shipment / invoice</span><input type="date" data-c="rd" data-k="date" value="'+esc(C.rd.date)+'"></label><label class="f chkf"><input type="checkbox" data-c="rd" data-k="inr" '+(C.rd.inr?"checked":"")+'><span>Invoiced/settled in INR</span></label></div>'+
   '<p class="big2">Realise by: <b>'+showD(due)+'</b></p><p class="muted small">Under FEMA (Export & Import of Goods and Services) Regulations 2026 as amended 22 Sep 2026: 9 months from shipment (goods) or invoice (services); 12 months where invoiced/settled in INR. Extensions only via your AD bank.</p></div>'+
  '</div>';
};

V.finance=function(){
  return '<div class="card"><h2>Payment methods — safest to riskiest (for exporter)</h2><table class="tbl"><thead><tr><th>Method</th><th>Risk</th><th>How it works</th><th>Use when</th></tr></thead><tbody>'+FIN.pay.map(r=>'<tr><td><b>'+esc(r[0])+'</b></td><td>'+esc(r[1])+'</td><td>'+esc(r[2])+'</td><td>'+esc(r[3])+'</td></tr>').join("")+'</tbody></table><p class="small muted">For importers the order reverses — open account/DP is safest for you, advance is riskiest.</p></div>'+
  '<div class="card"><h2>Where the money comes from</h2><table class="tbl"><thead><tr><th>Product</th><th>Stage</th><th>What it is</th></tr></thead><tbody>'+FIN.credit.map(r=>'<tr><td><b>'+esc(r[0])+'</b></td><td>'+esc(r[1])+'</td><td>'+esc(r[2])+'</td></tr>').join("")+'</tbody></table></div>'+
  '<div class="card"><h2>Protect against risk</h2><ul>'+FIN.risk.map(r=>'<li><b>'+esc(r[0])+':</b> '+esc(r[1])+'</li>').join("")+'</ul></div>'+
  '<div class="card note"><h3>Money rules to remember</h3><ul><li>Export proceeds: 9 months (12 months if INR-invoiced) from 1 Oct 2026. RBI’s earlier 450-day enhanced credit window applied to disbursals only up to 30 Jun 2026.</li><li>All export receipts must come through your AD bank (EDPMS). Third-party payments only as FEMA permits.</li><li>Import payments: pay through AD bank against invoice; submit Bill of Entry to bank to close IDPMS.</li><li>Keep a forward-contract policy: hedge at least 50% of confirmed orders.</li></ul></div>';
};

V.schemes=function(){
  return '<div class="card"><h2>Incentives, schemes & support</h2><p class="muted small">Status as on '+ASOF+'. Always verify eligibility and current guidelines on DGFT before applying.</p></div><div class="grid2">'+
  SCHEMES.map(s=>'<div class="card scheme"><div class="row sb"><h3>'+esc(s.n)+'</h3><span class="pill">'+esc(s.c)+'</span></div><p class="status">'+esc(s.s)+'</p><p>'+esc(s.d)+'</p><p class="small"><b>For:</b> '+esc(s.who)+' · <a href="'+esc(s.l)+'" target="_blank" rel="noopener">Official site</a></p></div>').join("")+'</div>';
};

V.procure=function(){
  const tl=(rows,h)=>'<table class="tbl"><thead><tr>'+h.map(x=>'<th>'+x+'</th>').join("")+'</tr></thead><tbody>'+rows.map(r=>'<tr><td><b>'+esc(r[0])+'</b></td><td>'+esc(r[1])+'</td>'+(r.length>2?'<td>'+(r[2]&&r[2]!=="—"?'<a href="'+esc(r[2])+'" target="_blank" rel="noopener">Open</a>':'—')+'</td>':'')+'</tr>').join("")+'</tbody></table>';
  return '<div class="grid2"><div class="card"><h2>⬆ Procure in India (for export)</h2>'+tl(SOURCES_EXPORT,["Source","What you get","Link"])+'<p class="tip">💡 Merchant exporter? Ask suppliers to bill at <b>0.1% GST</b> (Notification 40/2017-CT(Rate)); export within 90 days.</p></div>'+
  '<div class="card"><h2>⬆ Find buyers abroad</h2>'+tl(BUYERS,["Channel","Use it for","Link"])+'</div>'+
  '<div class="card"><h2>Indian clusters — buy where it is made</h2>'+tl(CLUSTERS,["Cluster","Specialities"])+'</div>'+
  '<div class="card"><h2>⬇ Source abroad (for import)</h2>'+tl(IMPORT_SOURCING,["Source","Notes","Link"])+'</div>'+
  '<div class="card"><h2>⬇ Sell imported goods in India</h2>'+tl(SELL_IN_INDIA,["Channel","Details"])+'</div>'+
  '<div class="card note"><h3>How to choose a product–market pair</h3><ol><li>Find products India makes competitively (Tradestat: top export lines; your local cluster).</li><li>In TradeMap, see which countries import most & growing fastest; compare unit values to your FOB.</li><li>Check tariff India faces (Market Access Map) — prefer FTA markets.</li><li>Check non-tariff rules (Indian Trade Portal SPS/TBT).</li><li>Find 20 importers via trade data → sample → small trial order with advance/LC.</li></ol></div></div>';
};

V.markets=function(){
  return '<div class="card"><h2>India’s trade agreements — status '+ASOF+'</h2><table class="tbl"><thead><tr><th>Partner</th><th>Agreement</th><th>Status</th><th>What it means for you</th></tr></thead><tbody>'+FTAS.map(r=>'<tr><td><b>'+esc(r[0])+'</b></td><td>'+esc(r[1])+'</td><td>'+esc(r[2])+'</td><td>'+esc(r[3])+'</td></tr>').join("")+'</tbody></table><p class="small muted">To claim an FTA rate abroad you need a <b>preferential Certificate of Origin</b> (DGFT e-CoO) and must meet that FTA’s rules of origin. For imports into India under an FTA, follow CAROTAR 2020.</p></div>'+
  '<div class="card note"><h3>Quick market picks</h3><ul><li><b>Gulf (UAE, Oman):</b> FTA + short transit + large Indian diaspora — best first market for food, textiles, building materials, engineering.</li><li><b>UK:</b> CETA live since Jul 2026 — apparel, home textiles, leather, gems, marine, processed food gain most.</li><li><b>Australia:</b> all Indian exports duty-free since Jan 2026.</li><li><b>EFTA:</b> machinery, chemicals, pharma, gems.</li><li><b>USA:</b> biggest single market; tariff situation changed several times in 2025–26 — check current rate for your HS code before quoting.</li></ul></div>';
};

V.legal=function(){
  return '<div class="card"><h2>Laws & rules you work under</h2><table class="tbl"><tbody>'+LEGAL.map(r=>'<tr><td><b>'+esc(r[0])+'</b></td><td>'+esc(r[1])+'</td></tr>').join("")+'</tbody></table></div>'+
  '<div class="card"><h2>Incoterms® 2020 — who pays & who bears risk</h2><table class="tbl"><thead><tr><th>Term</th><th>Name</th><th>Meaning</th><th>Mode</th></tr></thead><tbody>'+INCOTERMS.map(r=>'<tr><td><b>'+r[0]+'</b></td><td>'+esc(r[1])+'</td><td>'+esc(r[2])+'</td><td>'+r[3]+'</td></tr>').join("")+'</tbody></table></div>'+
  '<div class="card note"><h3>Contract checklist (paste into every deal)</h3><ol><li>Parties with full legal names, addresses, registration nos.</li><li>Product spec, HS code, quantity, tolerance (±%), quality standard, inspection agency.</li><li>Price, currency, Incoterms® 2020 + named place.</li><li>Payment terms, due dates, bank details (and how changes are verified — fraud protection).</li><li>Delivery schedule, partial shipments, transhipment.</li><li>Packing, marking, labelling, documents to be provided.</li><li>Insurance responsibility.</li><li>Claims: notice period, rejection process, limits of liability.</li><li>Force majeure; suspension; termination.</li><li>Governing law and arbitration (seat, institution, language).</li><li>Confidentiality, IP/brand use, anti-bribery & sanctions compliance.</li></ol><p class="small muted">General guidance only — not legal advice. For large contracts get a trade lawyer to review.</p></div>'+
  '<div class="card"><h2>Common penalties to avoid</h2><ul><li>Mis-declaring HS code/value/quantity → confiscation, penalty, redemption fine (Customs Act).</li><li>Non-realisation of export proceeds in time → RBI caution list, FEMA penalties, recovery of incentives.</li><li>Not fulfilling export obligation under AA/EPCG → pay duty + interest.</li><li>Importing QCO/BIS goods without licence → goods held, re-export or destruction.</li><li>Selling pre-packed imports without Legal Metrology labels → fines.</li><li>Dealing in prohibited/SCOMET items without licence → prosecution.</li></ul></div>';
};

V.contacts=function(){
  const roles=["Buyer","Supplier","CHA / Customs broker","Freight forwarder","Bank (AD)","EPC officer","Inspection agency","Insurer","CA / Lawyer","Transporter","Other"];
  return '<div class="card"><div class="row sb"><h2>Contacts</h2><button class="btn" id="addct">+ Add contact</button></div></div>'+
  (S.contacts.length?'<div class="card"><table class="tbl edit"><thead><tr><th>Role</th><th>Name</th><th>Company</th><th>Country</th><th>Phone</th><th>Email</th><th>Notes</th><th></th></tr></thead><tbody>'+S.contacts.map(c=>'<tr><td><select data-ct="'+c.id+'" data-k="role">'+roles.map(r=>'<option'+(c.role===r?" selected":"")+'>'+r+'</option>').join("")+'</select></td>'+["name","company","country","phone","email","notes"].map(k=>'<td><input data-ct="'+c.id+'" data-k="'+k+'" value="'+esc(c[k]||"")+'"></td>').join("")+'<td><button class="btn sm ghost" data-delct="'+c.id+'">✕</button></td></tr>').join("")+'</tbody></table></div>':'<div class="card empty">No contacts yet.</div>');
};

let advisorBusy=false, advisorOut="", advisorAvail=null;
V.advisor=function(){
  return '<div class="card"><h2>Ask the EXIM Advisor</h2><p class="muted small">Ask anything — e.g. “Which documents do I need to export basmati rice to the UK?” or “How do I import LED lights from China legally?”. The advisor sees your profile (product, HS, mode, markets) and your current roadmap position.</p>'+
  (advisorAvail===false?'<p class="warn">The advisor is not available in this view. Open this page on claude.ai while signed in to use it.</p>':'')+
  '<form id="advf"><textarea id="advq" rows="3" placeholder="Type your question…"></textarea><div class="row gap mt"><button class="btn" '+(advisorBusy?"disabled":"")+'>'+(advisorBusy?"Thinking…":"Ask")+'</button></div></form>'+
  '<div class="answer" id="advout">'+mdLite(advisorOut)+'</div><p class="small muted">AI answers can be wrong or out of date. Confirm rules on DGFT, CBIC, RBI and with your CHA/CA before acting.</p></div>';
};
function mdLite(t){if(!t)return"";let h=esc(t);h=h.replace(/\*\*(.+?)\*\*/g,"<b>$1</b>").replace(/^#{1,4}\s*(.+)$/gm,"<h4>$1</h4>").replace(/^\s*[-*]\s+(.+)$/gm,"<li>$1</li>").replace(/\n/g,"<br>");return h}

let glossQ="";
V.glossary=function(){const m=new Map();GLOSS.forEach(g=>m.set(g[0].toLowerCase(),[g[0],g[1]]));Object.keys(TERMS).forEach(k=>{const l=k.toLowerCase();if(!m.has(l)&&![...m.values()].some(v=>v[1]===TERMS[k]))m.set(l,[k,TERMS[k]])});
  const rows=[...m.values()].sort((a,b)=>a[0].localeCompare(b[0],"en",{sensitivity:"base"})).filter(r=>!glossQ||(r[0]+" "+r[1]).toLowerCase().includes(glossQ.toLowerCase()));
  return '<div class="card"><h2>Glossary — '+m.size+' terms in plain English</h2><input id="glq" placeholder="Search a word, e.g. LC, FOB, demurrage…" value="'+esc(glossQ)+'"></div><div class="card"><table class="tbl notip"><tbody>'+rows.map(g=>'<tr><td><b>'+esc(g[0])+'</b></td><td>'+esc(g[1])+'</td></tr>').join("")+'</tbody></table></div>'};

V.backup=function(){
  return '<div class="card"><h2>Backup, restore & export</h2><p>Status: <span id="sync2"></span></p><p class="muted small">Your data is saved to your Claude account when you open this page on claude.ai (private to you), and also on this device. Make a backup copy anyway.</p>'+
  '<div class="row gap wrap"><button class="btn" id="copyjson">Copy backup (JSON)</button><button class="btn ghost" id="dljson">Download backup file</button><button class="btn ghost" id="dlcsv">Download shipments (CSV)</button></div><p id="bmsg" class="small"></p>'+
  '<h3>Restore</h3><textarea id="restorebox" rows="5" placeholder="Paste a backup JSON here, or choose a file below"></textarea><div class="row gap wrap mt"><input type="file" id="restorefile" accept=".json,application/json"><button class="btn" id="dorestore">Restore</button><button class="btn ghost danger" id="reset">Clear all my data</button></div><div id="confirmbox"></div></div>';
};

/* ---------- RENDER ---------- */
function focusKey(el){if(!el||el===document.body||!$("#main").contains(el))return null;if(el.id)return "#"+CSS.escape(el.id);
  const ds=Object.keys(el.dataset||{});if(!ds.length)return null;return el.tagName.toLowerCase()+ds.map(k=>'[data-'+k.replace(/[A-Z]/g,m=>"-"+m.toLowerCase())+'="'+CSS.escape(el.dataset[k])+'"]').join("")}
function render(){
  nav();
  const c=cur();
  const ae=document.activeElement, fk=focusKey(ae);let sel=null;try{sel=ae&&ae.selectionStart!=null?[ae.selectionStart,ae.selectionEnd]:null}catch(_){}
  const openNodes=$$(".node.open [data-pldone]").map(x=>x.dataset.pldone);
  $("#main").innerHTML=V[c]();
  openNodes.forEach(k=>{const n=$('[data-pldone="'+CSS.escape(k)+'"]');if(n)n.closest(".node").classList.add("open")});
  decorateTerms($("#main"));termsBtn();hideTip();
  if(fk){const n=$(fk);if(n){n.focus({preventScroll:true});if(sel){try{n.setSelectionRange(sel[0],sel[1])}catch(_){}}}}
  setSync(syncState);
  if(c==="backup"){const s2=$("#sync2");if(s2)s2.innerHTML=$("#sync").innerHTML}
  $$("textarea[data-note]").forEach(autoGrow);
}
function autoGrow(t){t.style.height="auto";t.style.height=(t.scrollHeight+2)+"px"}

/* ---------- EVENTS ---------- */
document.addEventListener("input",e=>{
  const t=e.target;
  if(t.id&&t.id.startsWith("pf_")){S.profile[t.id.slice(3)]=t.value;save("profile");return}
  if(t.dataset.note){const id=t.dataset.note;S.road[id]=Object.assign({},S.road[id],{n:t.value});autoGrow(t);save("road");return}
  if(t.dataset.sf){const s=S.ships.find(x=>x.id===t.dataset.sf);if(s){s[t.dataset.k]=t.value;save("ships")}return}
  if(t.dataset.rg){const r=S.regs.find(x=>x.id===t.dataset.rg);if(r){r[t.dataset.k]=t.value;save("regs")}return}
  if(t.dataset.ct){const r=S.contacts.find(x=>x.id===t.dataset.ct);if(r){r[t.dataset.k]=t.value;save("contacts")}return}
  if(t.dataset.c&&t.type!=="checkbox"){C[t.dataset.c][t.dataset.k]=t.value;try{sessionStorage.setItem("garcha-calc",JSON.stringify(C))}catch(_){};rerenderCalc(t);return}
  if(t.id==="dq"){docFilter.q=t.value;render()}
  if(t.id==="glq"){glossQ=t.value;render()}
});
function rerenderCalc(){render()}
document.addEventListener("change",e=>{
  const t=e.target;
  if(t.dataset.step){const id=t.dataset.step;S.road[id]=Object.assign({},S.road[id],{d:t.checked});save("road");render();return}
  if(t.dataset.sfc){const s=S.ships.find(x=>x.id===t.dataset.sfc);if(s){s.inrInv=t.checked;save("ships");render()}return}
  if(t.dataset.sf&&t.tagName==="SELECT"){render();return}
  if(t.dataset.sf&&t.dataset.k==="shipDate"){render();return}
  if(t.dataset.rg&&t.type==="date"){return}
  if(t.dataset.task){const x=S.tasks.find(y=>y.id===t.dataset.task);if(x){x.done=t.checked;save("tasks");render()}return}
  if(t.dataset.taskp){const x=S.tasks.find(y=>y.id===t.dataset.taskp);if(x){x.pri=+t.value;save("tasks");render()}return}
  if(t.dataset.c&&t.type==="checkbox"){C[t.dataset.c][t.dataset.k]=t.checked;try{sessionStorage.setItem("garcha-calc",JSON.stringify(C))}catch(_){};render();return}
  if(t.id==="navsel"){location.hash=t.value;return}
  if(t.id==="restorefile"&&t.files&&t.files[0]){t.files[0].text().then(x=>{$("#restorebox").value=x})}
});
document.addEventListener("click",e=>{
  const b=e.target.closest("button,[data-mode]");if(!b)return;
  const d=b.dataset;
  if(d.mode){S.profile.mode=d.mode;save("profile");render();return}
  if(d.addship){S.ships.push({id:uid(),type:d.addship,stage:0,shipDate:"",cur:"USD",incoterm:d.addship==="export"?"FOB":"FOB"});save("ships");render();return}
  if(d.delship){askConfirm(b,"Delete this shipment?",()=>{S.ships=S.ships.filter(s=>s.id!==d.delship);save("ships");render()});return}
  if(d.stage){const s=S.ships.find(x=>x.id===d.stage);if(s){s.stage=+d.i;save("ships");render()}return}
  if(d.addreg!=null){S.regs.push({id:uid(),name:d.addreg||"New registration"});save("regs");render();return}
  if(d.delreg){S.regs=S.regs.filter(r=>r.id!==d.delreg);save("regs");render();return}
  if(d.deltask){S.tasks=S.tasks.filter(r=>r.id!==d.deltask);save("tasks");render();return}
  if(d.delct){S.contacts=S.contacts.filter(r=>r.id!==d.delct);save("contacts");render();return}
  if(d.dside!=null){docFilter.side=d.dside;render();return}
  if(b.id==="addct"){S.contacts.push({id:uid(),role:"Buyer"});save("contacts");render();return}
  if(b.id==="seedtasks"){let n=0;modes().forEach(m=>nextSteps(m,4).forEach((s,i)=>{if(!S.tasks.some(t=>t.src===s.id)){S.tasks.push({id:uid(),t:s.t,pri:i===0?1:2,done:false,src:s.id});n++}}));save("tasks");render();return}
  if(b.id==="copyjson"){copyText(JSON.stringify(S,null,1));return}
  if(b.id==="dljson"){dl("garcha-exim-backup-"+isoD(today())+".json",JSON.stringify(S,null,1),"application/json");return}
  if(b.id==="dlcsv"){dl("garcha-shipments-"+isoD(today())+".csv",csv(),"text/csv");return}
  if(b.id==="dorestore"){restore();return}
  if(b.id==="reset"){askConfirm(b,"Erase ALL your data (roadmap, shipments, tasks, contacts)? Make a backup first.",()=>{KEYS.forEach(k=>{S[k]=JSON.parse(JSON.stringify(DEF[k]));save(k)});render()});return}
});
document.addEventListener("submit",e=>{
  e.preventDefault();
  if(e.target.id==="taskf"){const v=$("#tk_t").value.trim();if(!v)return;S.tasks.push({id:uid(),t:v,pri:+$("#tk_p").value,done:false});save("tasks");render();const n=$("#tk_t");if(n)n.focus();return}
  if(e.target.id==="advf"){ask($("#advq").value.trim())}
  if(e.target.id==="dashplan"){const q=$("#dashq").value;const it=parseIntent(q);PL=newPlanInput(it||{dir:/import|buy|bring/i.test(q)?"import":"export",product:q.replace(/\b(export|import)\b/ig,"").trim(),country:findCountry(q)||"Other country"});location.hash="planner"}
});
function askConfirm(btn,msg,fn){
  const box=document.createElement("div");box.className="confirm";box.innerHTML='<span>'+esc(msg)+'</span><button class="btn sm danger">Yes</button><button class="btn sm ghost">Cancel</button>';
  const old=$(".confirm");if(old)old.remove();
  btn.closest(".card").appendChild(box);
  const [y,n]=$$("button",box);y.onclick=()=>{box.remove();fn()};n.onclick=()=>box.remove();
}
function bmsg(t){const m=$("#bmsg");if(m)m.textContent=t}
async function copyText(t){try{await navigator.clipboard.writeText(t);bmsg("Backup copied. Paste it into a note or WhatsApp to yourself.")}catch(e){$("#restorebox").value=t;bmsg("Copy blocked by browser — the backup is in the box below; select all and copy it.")}}
async function saveFile(name,data,type){
  const blob=new Blob([data],{type});
  let d=null;try{d=window.claude&&window.claude.use?await window.claude.use("downloads"):null}catch(e){}
  if(d){await d.save({filename:name,data:blob});return true}
  const a=document.createElement("a");a.href=URL.createObjectURL(blob);a.download=name;document.body.appendChild(a);a.click();setTimeout(()=>{URL.revokeObjectURL(a.href);a.remove()},1500);return true;
}
async function dl(name,data,type){
  try{await saveFile(name,data,type);bmsg("Saved "+name)}catch(e){bmsg("Download was cancelled or blocked — use 'Copy backup' instead.")}
}
function csv(){const h=["type","ref","party","country","product","hs","value","cur","inr","incoterm","pay","shipDate","stage","realiseBy","notes"];
  const q=v=>'"'+String(v==null?"":v).replace(/"/g,'""')+'"';
  return h.join(",")+"\n"+S.ships.map(s=>h.map(k=>k==="stage"?q(STAGES[s.type][s.stage|0]):k==="realiseBy"?q(s.type==="export"&&realDue(s)?isoD(realDue(s)):""):q(s[k])).join(",")).join("\n")}
function restore(){
  const raw=$("#restorebox").value.trim();if(!raw){bmsg("Paste a backup first.");return}
  let o;try{o=JSON.parse(raw)}catch(e){bmsg("That is not valid backup JSON.");return}
  if(!o||typeof o!=="object"||!KEYS.some(k=>k in o)){bmsg("This does not look like a Garcha EXIM backup.");return}
  KEYS.forEach(k=>{if(o[k]!=null&&typeof o[k]===typeof DEF[k]&&Array.isArray(o[k])===Array.isArray(DEF[k])){S[k]=o[k];save(k)}});
  render();bmsg("Restored.");
}

/* ---------- ADVISOR ---------- */
async function ask(q){
  if(!q||advisorBusy)return;
  let sample=null;try{sample=window.claude&&window.claude.use?await window.claude.use("sample"):null}catch(e){}
  if(!sample){advisorAvail=false;render();return}
  advisorBusy=true;advisorOut="";render();$("#advq").value=q;
  const p=S.profile, nx=modes().map(m=>m+": "+(nextSteps(m,1)[0]||{t:"all steps done"}).t).join("; ");
  const prompt="You are an expert Indian export-import consultant (DGFT, Customs/ICEGATE, GST, FEMA/RBI, EPCs, logistics, trade finance). Today is "+ASOF+". Facts to respect: FEMA (Export & Import of Goods and Services) Regulations 2026 in force from 1 Oct 2026 – export realisation 9 months (12 months if invoiced/settled in INR); RoDTEP extended to 31 Dec 2026; UK CETA in force 15 Jul 2026; Oman CEPA 1 Jun 2026; EU FTA concluded not in force; FTP 2023 amended Aug 2026 for INR invoicing; Export Promotion Mission (Niryat Protsahan, Niryat Disha) is live. Answer practically for a small Indian business: numbered steps, documents, portals, typical costs/time, risks. If unsure about a current rate or rule, say so and tell them where to verify. Keep it under 350 words. Plain text with short bullet lines; no tables.\n\nUser profile: name="+(p.name||"-")+", mode="+p.mode+", product="+(p.product||"-")+", HS="+(p.hs||"-")+", markets/sources="+(p.markets||"-")+". Current next step: "+nx+".\n\nQuestion: "+q;
  try{
    const r=await sample(prompt,{modelTier:"default",onText:({text})=>{advisorOut=text;const o=$("#advout");if(o)o.innerHTML=mdLite(text)}});
    advisorOut=r.text||advisorOut;
  }catch(e){advisorOut=e&&e.code==="not_granted"?"":(e&&e.code==="rate_limited"?"Too many questions right now — please wait a minute.":"Could not get an answer ("+(e&&e.code||"error")+").");if(e&&e.code==="not_granted")advisorAvail=false}
  advisorBusy=false;render();const qq=$("#advq");if(qq)qq.value=q;
}

/* ===== TRADE PLANNER MODULE (inserted inside app IIFE) ===== */
const CN_ALIAS={"uk":"United Kingdom","u.k.":"United Kingdom","britain":"United Kingdom","great britain":"United Kingdom","england":"United Kingdom","london":"United Kingdom",
 "usa":"United States","us":"United States","u.s.":"United States","u.s.a.":"United States","america":"United States","united states of america":"United States",
 "uae":"United Arab Emirates","dubai":"United Arab Emirates","abu dhabi":"United Arab Emirates","emirates":"United Arab Emirates","ksa":"Saudi Arabia","saudi":"Saudi Arabia",
 "eu":"European Union","europe":"European Union","holland":"Netherlands","korea":"South Korea","s korea":"South Korea","aus":"Australia","nz":"New Zealand","prc":"China","lanka":"Sri Lanka"};
function findCountry(t){if(!t)return "";const s=t.toLowerCase().replace(/[^a-z .]/g," ").replace(/\s+/g," ").trim();
  if(CN_ALIAS[s])return CN_ALIAS[s];
  const names=Object.keys(COUNTRIES).filter(n=>n!=="Other country");
  let hit=names.find(n=>n.toLowerCase()===s);if(hit)return hit;
  hit=names.find(n=>s.includes(n.toLowerCase()));if(hit)return hit;
  const w=s.split(" ");for(const k of Object.keys(CN_ALIAS)){if(w.includes(k))return CN_ALIAS[k]}
  return "";}
function detectCat(t){const s=(" "+(t||"").toLowerCase()+" ");let best="general",bl=0;
  CATS.forEach(c=>c.kw.forEach(k=>{if(s.includes(k)&&k.length>bl){best=c.id;bl=k.length}}));return best}
function parseIntent(t){
  const s=(t||"").trim();const m=s.match(/\b(export|exporting|sell|import|importing|buy|bring)\b\s+(.+?)\s+\b(to|into|from|in)\b\s+(.+)$/i);
  if(!m)return null;
  const v=m[1].toLowerCase(), dir=/^(import|importing|buy|bring)$/.test(v)?"import":"export";
  return {dir,product:m[2].replace(/^(some|the|a|an)\s+/i,"").trim(),country:findCountry(m[4])||"Other country",countryText:m[4].trim()};
}
const MODES=[["sea_fcl","Sea – full container (FCL)"],["sea_lcl","Sea – shared container (LCL)"],["air","Air cargo"],["courier","Courier / post (small)"],["land","Road / rail (neighbour country)"]];
const HAVE=[["bank","AD bank account"],["gst","GSTIN"],["udyam","Udyam"],["iec","IEC"],["dsc","DSC"],["ice","ICEGATE"],["adc","AD code at port"],["rcmc","RCMC"],["lut","LUT this FY"]];
const HAVE_STEP={bank:["e12","i11"],gst:["e13","i12"],udyam:["e14"],iec:["e15","i13"],dsc:["e16","i14"],ice:["e17","i14"],adc:["e17","i14"],rcmc:["e18"],lut:["e19"]};
function haveDefaults(){const h={};HAVE.forEach(([k])=>{h[k]=(HAVE_STEP[k]||[]).some(id=>S.road[id]&&S.road[id].d)});return h}
function newPlanInput(intent){
  const it=intent||{dir:S.profile.mode==="import"?"import":"export",product:S.profile.product||"",country:""};
  const cat=detectCat(it.product);const cp=countryProfile(it.country);
  const land=!!cp.land;
  return {id:uid(),dir:it.dir,product:it.product,hs:S.profile.hs||"",cat,country:it.country||"Other country",state:S.profile.state||"Punjab",
    mode:CATS.find(c=>c.id===cat).service?"service":(land?"land":"sea_fcl"),incoterm:it.dir==="export"?"FOB":"FOB",pay:"LC at sight",
    value:20000,cur:"USD",rate:88,qty:1000,margin:15,newPartner:true,have:haveDefaults(),shipDate:isoD(addDays(today(),45)),
    intRate:9.5,prodDays:30,rodtep:0,dbk:0,bcd:10,igst:18,sellDays:45,done:{},ai:null,created:Date.now()};
}
let PL=null; // current plan input
let plAI={busy:false,err:""};

/* ---------- PLAN ENGINE ---------- */
function A(id){return APPR[id]}
function node(key,t,how,o){return Object.assign({key,t,how,appr:null,meet:"",docs:"",time:"",cost:"",fin:"",warn:"",link:"",src:"rule"},o||{})}
function apprNode(key,id,extraHow){const a=A(id);if(!a)return null;return node(key,a.n,a.how+(extraHow?" "+extraHow:""),{appr:{n:a.n,by:a.by,link:a.link},meet:a.meet,time:a.time,cost:a.cost})}
function transitDays(p,cp){if(p.mode==="air")return 4;if(p.mode==="courier")return 6;if(p.mode==="land")return 5;if(p.mode==="service")return 0;return TRANSIT[cp.r]||30}
function finance(p){
  const cp=countryProfile(p.country), rate=p.cur==="INR"?1:Math.max(0.0001,num(p.rate)), vINR=num(p.value)*rate, f={vINR,rate};
  f.transit=transitDays(p,cp);
  if(p.dir==="export"){
    f.cogs=vINR/(1+num(p.margin)/100);
    const advP=p.pay==="Advance"?1:p.pay==="Part advance + balance"?0.3:0;
    f.adv=vINR*advP; f.need=Math.max(0,f.cogs-f.adv);
    f.creditDays=PAYDAYS[p.pay]!=null?PAYDAYS[p.pay]:30;
    f.cycle=num(p.prodDays)+f.transit+f.creditDays+(advP<1?7:0);
    f.interest=f.need*num(p.intRate)/100*f.cycle/365;
    f.incent=vINR*(num(p.rodtep)+num(p.dbk))/100;
    f.ecgc=advP<1?[vINR*0.001,vINR*0.01]:null;
    f.lc=/LC/.test(p.pay)?[vINR*0.001,vINR*0.005]:null;
    f.ins=/^(CIF|CIP|DAP|DPU|DDP)$/.test(p.incoterm)?[vINR*1.1*0.001,vINR*1.1*0.005]:null;
    f.profit=vINR-f.cogs+f.incent-f.interest;
    const sd=parseD(p.shipDate); f.due=sd?addMonths(sd,RM(p.cur==="INR")):null; f.docsBy=sd?addDays(sd,21):null;
  }else{
    const cif=/^(CIF|CIP|CFR|CPT|DAP|DPU|DDP)$/.test(p.incoterm);
    const r=calcImport({fob:num(p.value),freight:cif?0:"",ins:cif?0:"",rate,bcd:p.bcd,sws:10,add:0,igst:p.igst,cess:0,cha:15000,port:12000,inland:10000,bankc:0.5,qty:Math.max(1,num(p.qty)),gstReg:true,margin:num(p.margin)});
    f.imp=r; f.cifNote=cif?"Value treated as CIF (freight/insurance included).":"Freight/insurance not known: customs adds 20% / 1.125% of FOB.";
    const advP=p.pay==="Advance"?1:p.pay==="Part advance + balance"?0.3:0;
    f.cycle=(advP>0?num(p.prodDays):0)+f.transit+7+num(p.sellDays);
    f.need=r.landedGross; f.interest=f.need*num(p.intRate)/100*f.cycle/365;
    f.lc=/LC/.test(p.pay)?[vINR*0.001,vINR*0.005]:null;
  }
  return f;
}
function buildPlan(p){
  const cat=CATS.find(c=>c.id===p.cat)||CATS[CATS.length-1], cp=countryProfile(p.country), reg=REGION[STATES[p.state]||"N"], f=finance(p);
  const ex=p.dir==="export", svc=!!cat.service, ph=[], cn=p.country==="Other country"?"the partner country":p.country, prod=p.product||cat.n;
  const add=(title,nodes)=>{nodes=nodes.filter(Boolean);if(nodes.length)ph.push({title,nodes})};
  if(!ex&&svc){
    add("A · Check & contract",[node("a1","Confirm the service & contract with the "+cn+" provider","Scope, deliverables, IP ownership, data protection, price & currency, payment milestones, governing law.",{docs:"Contract / SOW"}),
      node("a2","Check tax: GST reverse charge & TDS","Import of services: you pay GST under reverse charge (IGST) and may have to deduct income-tax TDS u/s 195 unless DTAA/exemption applies; get provider's TRC & Form 10F.",{meet:"Your CA"})]);
    add("B · Pay through your bank",[node("b1","Outward remittance via AD bank","Pay against invoice through your AD bank; Form 15CA/15CB (CA certificate) where tax rules require.",{appr:{n:"Form 15CA / 15CB",by:"Income Tax portal / CA",link:"https://www.incometax.gov.in"},meet:"AD bank forex desk + CA",fin:"Payment ≈ "+inr(f.vINR)}),
      node("b2","Pay GST under reverse charge & take credit","Pay IGST in GSTR-3B (cash), then claim it as input credit.",{meet:"Your CA"})]);
    let n=0;ph.forEach(x=>x.nodes.forEach(nd=>{nd.no=++n}));
    return {phases:ph,f:Object.assign(f,{imp:{duty:0,landed:f.vINR,landedGross:f.vINR,igst:0,other:0,pu:f.vINR,sell:f.vINR,av:f.vINR,bcd:0,sws:0}}),warns:[],meet:[{who:"Your AD bank – forex desk",why:"Outward remittance",link:""},{who:"Chartered Accountant",why:"15CA/CB, TDS, GST reverse charge",link:""}],cat,cp,reg};
  }
  const embassy={n:"Indian Embassy / High Commission in "+cn+" – Commercial Wing",link:G("Indian Embassy "+cn+" commercial wing trade enquiry")};
  const epc=EPC[cat.epc]||EPC.fieo;
  const warns=[];
  if(cp.warn)warns.push(cp.warn);
  const pl=(" "+(p.product||"").toLowerCase()+" ");
  if(ex&&/rice|wheat|sugar|onion|pulse|dal |lentil|chana|tur |urad|maize|de-oiled/.test(pl))warns.push("This product often faces export bans, minimum export prices (MEP) or export duty — check the latest DGFT/CBIC notifications for your exact HS code before you sign a contract.");
  if(ex&&/basmati/.test(pl))warns.push("Basmati: each export contract must be registered with APEDA (RCAC) before shipment; check any minimum export price in force.");
  if(!ex&&/almond|walnut|pistachio|cashew|dates|raisin|apple|pulse|lentil|chana/.test(pl))warns.push("Agri imports need FSSAI clearance and a Plant Quarantine import permit/release; some items have specific import conditions or duty changes — check before ordering.");
  if(p.newPartner&&/D\/A|Open account/.test(p.pay)&&ex)warns.push("New buyer on "+p.pay+" = high non-payment risk. Prefer advance or LC at sight; if not possible, get ECGC cover first.");
  if(!ex&&p.newPartner&&p.pay==="Advance")warns.push("100% advance to a new supplier is risky — use 30% advance + balance against copy B/L or a pre-shipment inspection report, or an LC.");
  if(p.mode==="land"&&!cp.land)warns.push("No standard land route to "+cn+" — use sea or air.");

  /* A. Feasibility */
  if(ex) add("A · Check it is allowed & worth it",[
    node("a1","Fix the 8-digit HS code for "+prod,"Find the ITC(HS) code. Everything — policy, incentives, the buyer's import duty — depends on it."+(p.hs?" You entered HS "+p.hs+".":""),{appr:{n:"Export policy — ITC(HS) Schedule 2",by:"DGFT",link:LINKS.dgft},meet:"Online; a CHA can confirm classification",time:"1 day",cost:"Free"}),
    node("a2","Check India's export policy for this HS","Confirm Free / Restricted / Prohibited / STE, and any minimum export price or quantity limit. Restricted items need a DGFT export authorisation before you ship.",{appr:{n:"Export authorisation (only if Restricted)",by:"DGFT",link:LINKS.dgft},meet:"DGFT Regional Authority (most work is online)",time:"1 hr – weeks",cost:"Free–fee"}),
    node("a3","Check "+cn+"'s import duty & rules for this product","Use Indian Trade Portal / Market Access Map for "+cn+"'s tariff on your HS, and its product rules (see section D). "+(cp.fta||"")+(cp.tariff?" "+cp.tariff:""),{meet:embassy.n,link:LINKS.itp,time:"1–3 days",cost:"Free"}),
    node("a4","Find & verify the buyer","Leads: "+epc[0]+", DGFT Trade Connect, Indian Mission in "+cn+", trade fairs, importer lists from shipment data. Verify: company registry, bank reference, ECGC buyer credit report.",{meet:"ECGC branch (buyer credit report) · "+embassy.n,link:LINKS.tradeconnect,time:"1–3 weeks",cost:"Small fee"}),
    node("a5","Cost & price the order","Build EXW → FOB → CIF in the Calculators tab. Include inland freight from "+p.state+", CHA, port charges, bank/ECGC charges, profit; decide whether to pass on RoDTEP/drawback.",{fin:"Order value ≈ "+inr(f.vINR)+" · Goods cost ≈ "+inr(f.cogs),time:"1 day"})
  ]);
  else add("A · Check it is allowed & worth it",[
    node("a1","Fix the 8-digit HS code for "+prod,"Find the code in the Customs Tariff; duty and licences depend on it."+(p.hs?" You entered HS "+p.hs+".":""),{appr:{n:"Customs Tariff / ITC(HS) Schedule 1",by:"CBIC / DGFT",link:LINKS.cbic},time:"1 day",cost:"Free"}),
    node("a2","Check India's import policy","Free / Restricted (import licence) / Prohibited / STE, policy conditions (port restrictions, monitoring registration). Goods made with forced labour are prohibited (FTP 2.20B).",{appr:{n:"Import licence (only if Restricted)",by:"DGFT",link:LINKS.dgft},meet:"DGFT Regional Authority",time:"1 hr – weeks"}),
    node("a3","Check BIS / QCO, anti-dumping & FTA duty","See if the product is under a BIS Quality Control Order or CRS (licence must exist BEFORE import), if anti-dumping duty applies on goods from "+cn+" (DGTR/CBIC), and whether an FTA rate is available ("+(cp.fta||"none")+") under CAROTAR rules.",{appr:{n:"BIS certificate (if under QCO)",by:"BIS",link:"https://www.bis.gov.in"},link:LINKS.dgtr,time:"1–2 days"}),
    node("a4","Find & verify the supplier in "+cn,"B2B portals/fairs; verify business & export licence, factory video call, third-party audit (QIMA, SGS, Intertek, BV). Never pay into a personal or third-country account.",{meet:"Inspection agency in "+cn+" · "+embassy.n,time:"1–3 weeks",cost:"US$200–400 audit"}),
    node("a5","Landed cost & selling price","Duty ≈ "+inr(f.imp.duty)+" (BCD "+p.bcd+"%, SWS 10% of BCD, IGST "+p.igst+"% — confirm rates for your HS). Net landed ≈ "+inr(f.imp.landed)+" after IGST credit.",{fin:"Cash needed till goods are sold ≈ "+inr(f.need),time:"1 day"})
  ]);

  /* B. Registrations */
  const regIds=ex?(svc?["bank","gst","lut","iec","stpi"]:["bank","gst","udyam","iec","dsc","ice","adc","rcmc","lut"]):["bank","gst","udyam","iec","dsc","ice","adc"];
  add("B · One-time registrations"+(Object.values(p.have).some(Boolean)?" (ones you already have are skipped)":""),regIds.filter(id=>!p.have[id]).map(id=>{
    const n=apprNode("b_"+id,id);
    if(id==="rcmc"&&n){n.t="RCMC from "+epc[0];n.meet=epc[0]+" regional office";n.appr.by=epc[0];n.link=epc[1]}
    if(id==="iec"&&svc&&n){n.how="IEC is optional for pure service exports but needed for most benefits and bank processing — recommended. "+n.how}
    if(id==="lut"&&n&&!ex)return null;
    return n}));

  /* C. India-side product approvals */
  let cIds=(ex?cat.ex:cat.im).filter(id=>id!=="rcmc"&&!(id==="lut"));
  if(ex&&/spice|turmeric|cumin|jeera|pepper|cardamom|chilli|chili|ginger|coriander|clove|saffron/.test(pl))cIds=cIds.concat(["spices"]);
  if(ex&&/\btea\b|coffee/.test(pl))cIds=cIds.concat(["tea"]);
  add("C · Product licences & approvals in India",cIds.map(id=>{const n=apprNode("c_"+id,id);
    if(!n)return null;
    if(id==="scomet")n.how="Only if your item is on the SCOMET list (Appendix 3) — most goods are not. "+n.how;
    if(id==="cites")n.how="Only if made from listed wildlife species/woods. "+n.how;
    if(id==="eic")n.how="Needed where EIC inspection/plant approval is notified for your product or required by "+cn+". "+n.how;
    if(id==="bis")n.how="Only if your HS code is under a BIS QCO/CRS. "+n.how;
    if(id==="dangerous"&&!cat.dg)return null;
    return n}).concat(p.ai&&p.ai.india_approvals?p.ai.india_approvals.map((x,i)=>node("ai_in"+i,x.name,x.how||"",{appr:{n:x.name,by:x.authority||"",link:safeUrl(x.url)},src:"ai"})):[]));

  /* D. Partner-country side */
  if(ex){
    const dn=(cp.regs||[]).map((r,i)=>node("d"+i,cn+": "+r.split(":")[0].split("(")[0].trim(),r+".",{meet:"Your buyer/importer arranges most of these — ask them early; "+embassy.n,link:embassy.link}));
    dn.push(node("dcat","What "+cn+" will ask for "+cat.n.toLowerCase(),cat.dest,{meet:"Buyer + your EPC ("+epc[0]+")"}));
    if(cp.fta&&/in force/i.test(cp.fta))dn.push(node("dfta","Preferential Certificate of Origin ("+cp.fta.split("—")[0].trim()+")","Your buyer pays lower/zero duty only if you give a preferential CoO and the product meets the agreement's rules of origin. Apply per shipment on the DGFT e-CoO platform.",{appr:{n:"Preferential Certificate of Origin",by:"DGFT e-CoO (EIC/EPCs)",link:LINKS.ecoo},time:"1–2 days",cost:"₹200–1,000"}));
    if(p.ai&&p.ai.partner_requirements)p.ai.partner_requirements.forEach((x,i)=>dn.push(node("ai_d"+i,x.name,x.how||"",{appr:{n:x.name,by:x.authority||"",link:safeUrl(x.url)},src:"ai"})));
    add("D · What "+cn+" requires",dn);
  }else{
    const dn=[node("d1","Supplier's export documents from "+cn,"Commercial invoice, packing list, B/L or AWB, Certificate of Origin ("+(cp.fta&&/in force/i.test(cp.fta)?"preferential — to claim the FTA rate under CAROTAR":"non-preferential")+"), test/analysis certificates.",{meet:"Supplier"})];
    if(["agri_fresh","agri_grain","plants","food_proc"].includes(p.cat))dn.push(node("d2","Phytosanitary / health certificate from "+cn,"Issued by "+cn+"'s plant/food authority; must match India's import permit conditions.",{meet:"Supplier"}));
    if(["animal","marine"].includes(p.cat))dn.push(node("d3","Veterinary health certificate from "+cn,"Per India's Sanitary Import Permit conditions.",{meet:"Supplier"}));
    dn.push(node("d4","Pre-shipment inspection","Book an inspection in "+cn+" before paying the balance (quantity, quality, labels with Indian importer details & MRP space).",{meet:"QIMA / SGS / Intertek / BV office in "+cn,cost:"US$250–400"}));
    if(p.ai&&p.ai.partner_requirements)p.ai.partner_requirements.forEach((x,i)=>dn.push(node("ai_d"+i,x.name,x.how||"",{appr:{n:x.name,by:x.authority||"",link:safeUrl(x.url)},src:"ai"})));
    add("D · Supplier side in "+cn,dn);
  }

  /* E. Deal & finance */
  const payHow={ "Advance":"Buyer pays before shipment — safest.","Part advance + balance":"Typically 30% advance, balance against documents/LC.","LC at sight":"Get the LC from buyer's bank, check every clause the same day, ask for amendments before production (UCP 600).","Confirmed LC":"Ask your Indian bank to confirm the LC — covers buyer-bank & country risk.","Usance LC (60 days)":"Paid 60 days after documents; can be discounted with your bank.","D/P":"Bank releases documents only when buyer pays.","D/A (60 days)":"Buyer takes goods on accepting a bill — take ECGC cover.","Open account (60 days)":"Goods & documents sent directly — only for trusted buyers, with ECGC/factoring."}[p.pay]||"";
  if(ex) add("E · Close the deal & arrange money",[
    node("e1","Quotation → Proforma Invoice","Quote "+p.incoterm+" (Incoterms 2020) with named place, currency "+p.cur+", validity, lead time, payment terms, bank details.",{docs:"Proforma invoice",time:"Same day"}),
    node("e2","Sign the sales contract / PO","Specs, tolerance, inspection, packing, delivery, payment, documents list, claims window, governing law & arbitration (India is not in CISG).",{docs:"Contract / PO",time:"1–5 days"}),
    node("e3","Secure payment: "+p.pay,payHow,{meet:"Your AD bank trade-finance desk",fin:f.lc?"LC charges ≈ "+inr(f.lc[0])+"–"+inr(f.lc[1]):""}),
    f.ecgc?node("e4","Take ECGC cover for this buyer","Get credit limit on the buyer and a Shipment (Comprehensive Risks) policy before shipping.",{appr:{n:"ECGC credit limit + policy",by:"ECGC",link:LINKS.ecgc},meet:"ECGC branch office",fin:"Premium ≈ "+inr(f.ecgc[0])+"–"+inr(f.ecgc[1])+" (indicative 0.1–1%)",time:"1–2 weeks"}):null,
    node("e5","Working capital: packing credit / PCFC","You need ≈ "+inr(f.need)+" for about "+f.cycle+" days (production "+p.prodDays+"d + transit ~"+f.transit+"d + payment ~"+f.creditDays+"d). Banks usually fund ~75–90% of order value as packing credit (INR) or PCFC (cheaper, in "+p.cur+"). Ask about EPM interest subvention, collateral support and the Credit Guarantee Scheme for Exporters.",{appr:{n:"Packing credit sanction",by:"AD bank",link:LINKS.dgft},meet:"Bank trade-finance officer",fin:"Interest ≈ "+inr(f.interest)+" at "+p.intRate+"%",time:"1–3 weeks"}),
    p.cur!=="INR"?node("e6","Hedge the currency","Book a forward contract with your bank for the "+p.cur+" receivable (or invoice in INR — allowed, gets FTP benefits, 12-month realisation).",{meet:"Bank forex desk"}):null
  ]);
  else add("E · Close the deal & arrange money",[
    node("e1","Get Proforma Invoice & negotiate","Prefer FOB/FCA (you control freight & insurance). Ask for Indian-compliant labels (importer name/address, MRP space, net qty, origin).",{docs:"Proforma invoice"}),
    node("e2","Sign PO / contract","Specs, inspection right, packing, delivery date & penalty, payment, documents incl. CoO, warranty, dispute resolution.",{docs:"PO / contract"}),
    node("e3","Pay supplier: "+p.pay,"Pay only through your AD bank (outward remittance against invoice, or open LC). Bank records it in IDPMS. "+(f.lc?"LC charges ≈ "+inr(f.lc[0])+"–"+inr(f.lc[1])+".":""),{meet:"AD bank forex/trade desk"}),
    node("e4","Fund duty & clearing","Keep ≈ "+inr(f.imp.duty+f.imp.other)+" ready for duty + clearing on arrival; IGST "+inr(f.imp.igst)+" comes back as GST credit.",{fin:"Total cash cycle ≈ "+f.cycle+" days · interest ≈ "+inr(f.interest)}),
    p.cur!=="INR"?node("e5","Hedge the currency","Book a forward contract for the "+p.cur+" payable.",{meet:"Bank forex desk"}):null
  ]);

  /* F. Produce / procure & pack (export) */
  if(ex&&!svc) add("F · Make / buy, inspect & pack",[
    node("f1","Produce or procure "+prod,"Merchant exporter? Suppliers can bill you at 0.1% GST if you export within 90 days (Notification 40/2017-CT(Rate)).",{fin:"Goods cost ≈ "+inr(f.cogs)}),
    node("f2","Quality check / pre-shipment inspection","Own QC + any inspection the buyer/LC or "+cn+" requires"+(cat.ex.includes("eic")?" (EIC/EIA where notified — "+reg.eia+")":"")+".",{meet:cat.ex.includes("eic")?reg.eia:"Third-party inspection agency",docs:"Inspection certificate"}),
    node("f3","Pack, mark & label for "+cn,"Export cartons/pallets; ISPM-15 stamped wood; shipping marks; labels per "+cn+" rules (language, ingredients, origin)."+(cat.dg?" Hazardous: UN packing, labels, MSDS, DG declaration.":""),{docs:"Packing list"+(cat.dg?", DG declaration, MSDS":"")})
  ]);

  /* G. Logistics & customs */
  if(ex&&svc) add("G · Deliver the service & declare",[
    node("g1","Invoice with SAC code","Export of services under LUT (no IGST) — mention LUT ARN on invoice; currency "+p.cur+".",{docs:"Tax invoice"}),
    node("g2","Export Declaration Form via AD bank","Under the FEMA 2026 regulations, declare the service export to your AD bank (EDF) and get the inward remittance advice (e-FIRC).",{appr:{n:"Export Declaration Form",by:"AD bank (FEMA 2026)",link:LINKS.rbi},meet:"Bank forex desk"}),
    node("g3","Withholding tax & DTAA","If "+cn+" deducts tax, give your Tax Residency Certificate (Form 10FA → TRC from Income Tax) to get treaty rate; claim foreign tax credit (Form 67).",{meet:"Your CA"})
  ]);
  else if(ex){
    const g=[node("g1","Appoint Customs Broker (CHA) & freight forwarder",(p.mode==="courier"?"Use an authorised courier (commercial courier shipping bill) or India Post Dak Ghar Niryat Kendra.":"Get 3 all-in quotes. Share IEC, GST, AD code, authority letter.")+" Your nearest options: "+(p.mode==="air"?reg.air:p.mode==="land"?(cp.land||reg.land||"land ICP"):(reg.icd+"; ports: "+reg.sea))+".",{meet:"CHA/forwarder at "+(p.mode==="air"?"air cargo complex":p.mode==="land"?"land ICP":"ICD/port"),cost:"₹3,000–15,000/shipment"}),
     node("g2","Book space","Freight booking ("+(MODES.find(m=>m[0]===p.mode)||["",""])[1]+"); note cut-off dates.",{docs:"Booking confirmation",fin:/^(CFR|CIF|CPT|CIP|DAP|DPU|DDP)$/.test(p.incoterm)?"You pay freight (your Incoterm "+p.incoterm+") — get quotes":"Buyer pays main freight under "+p.incoterm}),
     node("g3","Commercial invoice & packing list","Identical description/qty/value across invoice, packing list, shipping bill, B/L and LC. LUT declaration on invoice.",{docs:"Invoice, packing list"}),
     node("g4","File Shipping Bill on ICEGATE (via CHA)","Declare HS, FOB, LUT/IGST, and CLAIM RoDTEP"+(num(p.dbk)>0?" + drawback":"")+" here — missed claims are lost.",{appr:{n:"Shipping Bill → Let Export Order (LEO)",by:"Customs",link:LINKS.icegate},docs:"Shipping bill"}),
     node("g5","Stuffing, examination & LEO",(p.mode.startsWith("sea")?"Factory or CFS stuffing, e-seal, VGM to shipping line; ":"")+"customs check if selected by RMS; LEO issued = date of export.",{meet:"CHA at "+(p.mode==="air"?"air cargo":"ICD/port")}),
     /^(CIF|CIP|DAP|DPU|DDP)$/.test(p.incoterm)?node("g6","Insure the cargo (your Incoterm "+p.incoterm+")","Marine/air cargo policy at 110% of CIF, ICC(A).",{meet:"Insurer / broker",fin:f.ins?"≈ "+inr(f.ins[0])+"–"+inr(f.ins[1]):""}):null,
     node("g7",p.mode==="air"?"Airway Bill":p.mode==="land"?"Lorry receipt / rail receipt & border clearance":"Bill of Lading","Check consignee, notify party, ports, marks; 'clean on board'. Carrier must file EGM — refunds start only after EGM.",{docs:p.mode==="air"?"AWB":p.mode==="land"?"LR/RR":"B/L"}),
     node("g8","Certificates for this shipment",[cat.ex.includes("phyto")?"Phytosanitary (PQMS)":null,cat.ex.includes("eic")?"EIC health/inspection certificate":null,cat.ex.includes("aqexp")?"Veterinary health certificate":null,cp.fta&&/in force/i.test(cp.fta)?"Preferential CoO (e-CoO)":"Non-preferential CoO if buyer asks","Fumigation (if wood packing/grains)"].filter(Boolean).join(" · "),{appr:{n:"Certificate of Origin",by:"DGFT e-CoO",link:LINKS.ecoo},meet:cat.ex.includes("phyto")?"Plant Quarantine Station at port/ICD":"Online"})];
    add("G · Ship it & clear Indian customs",g);
  } else add("G · Ship, clear Indian customs & take delivery",[
    node("g1","Appoint forwarder & Customs Broker (CHA)","Forwarder picks up at "+cn+" port (if FOB); CHA files Bill of Entry. Entry port options for "+p.state+": "+(p.mode==="air"?reg.air:reg.sea+" / "+reg.icd)+".",{meet:"CHA at port of arrival",cost:"₹10,000–25,000/shipment"}),
    !/^(CIF|CIP|DAP|DPU|DDP)$/.test(p.incoterm)?node("g2","Insure the cargo","Your Incoterm "+p.incoterm+" — you insure from "+cn+"; 110% of CIF, ICC(A).",{meet:"Insurer"}):null,
    node("g3","File Bill of Entry in advance","Up to 30 days before arrival; latest end of day before arrival. Declare GSTIN; upload docs on e-Sanchit. Claim FTA rate with CoO if eligible.",{appr:{n:"Bill of Entry → assessment",by:"Customs",link:LINKS.icegate},docs:"Bill of Entry"}),
    node("g4","Pay duty online & get regulator NOCs","Duty ≈ "+inr(f.imp.duty)+". "+(cat.im.length?"Port-level clearances: "+cat.im.filter(i=>["fssai","pqimp","aq","cdsco_imp","bis"].includes(i)).map(i=>APPR[i].n).join(", ")+".":""),{appr:{n:"Duty e-payment",by:"ICEGATE",link:LINKS.icegate},fin:"Duty "+inr(f.imp.duty)}),
    node("g5","Examination & Out of Charge","Customs RMS may examine; then Out of Charge.",{meet:"CHA"}),
    node("g6","Delivery Order, CFS charges, transport","Pay line & CFS charges; watch free days (demurrage/detention).",{fin:"Clearing & transport ≈ "+inr(f.imp.other)})
  ]);

  /* H. Get paid / after clearance */
  if(ex) add("H · Get paid",[
    node("h1","Submit documents to bank","Within 21 days of shipment"+(f.docsBy?" — by "+showD(f.docsBy):"")+": invoice, packing list, B/L/AWB, CoO, insurance, bill of exchange, certificates.",{meet:"AD bank trade desk",time:"≤21 days"}),
    node("h2","Realise payment before the FEMA deadline","9 months from shipment (12 months if INR-invoiced) — for your planned ship date: "+(f.due?showD(f.due):"set a ship date")+".",{appr:{n:"FEMA realisation",by:"RBI / AD bank",link:LINKS.rbi},warn:"Late = RBI caution list & loss of incentives"}),
    node("h3","e-BRC / e-FIRC","Bank reports realisation to DGFT e-BRC; keep for GST & incentive audits.",{appr:{n:"e-BRC",by:"AD bank → DGFT",link:LINKS.ebrc}})
  ]);
  else add("H · After clearance — pay, claim credit, sell",[
    node("h1","Submit Bill of Entry to bank (IDPMS)","Proof that paid-for goods arrived.",{meet:"AD bank"}),
    node("h2","Claim IGST credit","IGST "+inr(f.imp.igst)+" appears in GSTR-2B; claim in GSTR-3B.",{fin:"+"+inr(f.imp.igst)+" back as credit"}),
    node("h3","Label & sell","LMPC labels (MRP, importer, origin), BIS mark if QCO; sell via distributors, marketplaces, GeM. Landed cost/unit ≈ "+inr(f.imp.pu)+" → price ≈ "+inr(f.imp.sell)+" + GST at "+p.margin+"% margin.",{meet:"Distributors / marketplace seller support"})
  ]);

  /* I. Benefits */
  if(ex) add("I · Claim benefits & stay compliant",[
    !svc?node("i1","RoDTEP"+(num(p.dbk)>0?" & drawback":""),"After EGM: create RoDTEP claim → e-scrip on ICEGATE (use for import duty or sell). Scheme valid to 31 Dec 2026 — check rate in Appendix 4R."+(num(p.dbk)>0?" Drawback is credited to bank automatically.":""),{appr:{n:"RoDTEP e-scrip",by:"Customs (ICEGATE)",link:LINKS.icegate},fin:f.incent?"≈ "+inr(f.incent):"Enter your RoDTEP % to estimate"}):null,
    node("i2","GST returns / refunds","Show exports in GSTR-1 (6A) & 3B; under LUT claim refund of accumulated ITC (RFD-01).",{meet:"Your CA"}),
    node("i3","Explore EPM support","Niryat Protsahan (interest subvention, factoring, collateral support) and Niryat Disha (market access, TRACE certification reimbursement up to ₹50 lakh for MSMEs, logistics).",{appr:{n:"EPM schemes",by:"DGFT",link:LINKS.dgft},meet:epc[0]})
  ]);

  // numbering + who-to-meet
  let n=0;ph.forEach(x=>x.nodes.forEach(nd=>{nd.no=++n}));
  const meet=[];const seen=new Set();const pushM=(who,why,link)=>{const k=who.toLowerCase();if(seen.has(k)||!who)return;seen.add(k);meet.push({who,why,link})};
  pushM("Your AD bank – trade finance & forex desk","Account, AD code, LC, packing credit, forward cover, e-BRC/IDPMS","");
  pushM("Chartered Accountant / GST practitioner","GST, LUT, refunds, books, TRC/withholding tax","");
  pushM(epc[0]+" (regional office)","RCMC, buyer leads, fairs, EPM scheme help",epc[1]);
  pushM("DGFT Regional Authority (your area)","IEC/policy queries, licences, schemes — most work is online",G("DGFT regional authority "+p.state));
  if(!svc)pushM("Customs Broker (CHA) & freight forwarder","Shipping bill / bill of entry, port work, freight — "+(p.mode==="air"?reg.air:reg.icd),G("customs broker "+(p.mode==="air"?"air cargo ":"ICD ")+p.state));
  ph.forEach(x=>x.nodes.forEach(nd=>{if(nd.appr&&nd.meet&&!/^Online$/i.test(nd.meet))pushM(nd.meet,nd.appr.n,nd.appr.link)}));
  if(ex&&f.ecgc)pushM("ECGC branch","Buyer credit limit & export credit insurance",LINKS.ecgc);
  pushM(embassy.n,ex?"Verify buyers, market info, trade disputes":"Verify suppliers, trade fairs",embassy.link);
  return {phases:ph,f,warns,meet,cat,cp,reg};
}
function safeUrl(u){u=String(u||"");return /^https:\/\/[a-z0-9.-]+\.[a-z]{2,}(\/|$)/i.test(u)?u:""}

/* ---------- PLANNER VIEW ---------- */
function plSel(k,opts,v){return '<select data-pl="'+k+'">'+opts.map(o=>{const val=Array.isArray(o)?o[0]:o,lab=Array.isArray(o)?o[1]:o;return '<option value="'+esc(val)+'"'+(String(v)===String(val)?" selected":"")+'>'+esc(lab)+'</option>'}).join("")+'</select>'}
function plIn(k,l,v,type="text",suf=""){return '<label class="f"><span>'+esc(l)+(suf?' <i>'+esc(suf)+'</i>':'')+'</span><input data-pl="'+k+'" type="'+type+'" value="'+esc(v)+'"'+(type==="number"?' step="any"':'')+'></label>'}
function plL(l,inner){return '<label class="f"><span>'+esc(l)+'</span>'+inner+'</label>'}
V.planner=function(){
  const saved=S.plans.slice().sort((a,b)=>b.created-a.created);
  let h='<div class="card"><h2>🧭 Trade Planner — your start-to-finish flowchart</h2><p class="muted small">Type what you want to do, e.g. <i>“export basmati rice to UK”</i> or <i>“import LED lights from China”</i>. The planner builds every step with the permissions, whom to meet and where, documents, time, cost and the money flow. Then tick steps off as you go.</p>'+
   '<form id="plform" class="row gap wrap"><input id="plq" placeholder="I want to export … to … / import … from …" style="flex:1;min-width:240px" value="'+esc(PL?((PL.dir==="export"?"export ":"import ")+PL.product+(PL.dir==="export"?" to ":" from ")+(PL.country==="Other country"?"":PL.country)):"")+'"><button class="btn">Build my plan</button></form>'+
   (saved.length?'<div class="row gap wrap mt"><span class="small muted">Saved plans:</span>'+saved.map(s=>'<span class="chip"><button class="link" data-plopen="'+s.id+'">'+esc((s.dir==="export"?"⬆ ":"⬇ ")+s.product+" · "+s.country)+'</button><button class="link x" data-pldel="'+s.id+'" title="Delete">✕</button></span>').join("")+'</div>':'')+'</div>';
  if(!PL)return h+'<div class="card empty">Type a sentence above, or <button class="btn sm" id="plblank">start with a blank plan</button></div>';
  const p=PL, P=buildPlan(p), f=P.f, ex=p.dir==="export", total=P.phases.reduce((a,x)=>a+x.nodes.length,0), done=P.phases.reduce((a,x)=>a+x.nodes.filter(nd=>p.done[nd.key]).length,0);
  h+='<div class="card"><div class="row sb wrap gap"><h3>'+(ex?"⬆ Export ":"⬇ Import ")+esc(p.product||"product")+(ex?" → ":" ← ")+esc(p.country)+'</h3><div class="row gap wrap"><button class="btn sm" id="plsave">'+(S.plans.some(s=>s.id===p.id)?"Save changes":"Save plan")+'</button><button class="btn sm ghost" id="pltasks">Add steps to my tasks</button><button class="btn sm ghost" id="plship">Create shipment</button></div></div>'+
   '<details class="inputs" open><summary class="small"><b>Details</b> — change anything; the plan updates instantly</summary><div class="grid4 mt">'+
   plL("Direction",plSel("dir",[["export","Export from India"],["import","Import into India"]],p.dir))+plIn("product","Product",p.product)+plIn("hs","HS code (if known)",p.hs)+
   plL("Product type",plSel("cat",CATS.map(c=>[c.id,c.n]),p.cat))+
   plL(ex?"Destination country":"Source country",plSel("country",Object.keys(COUNTRIES).filter(k=>k!=="Other country").sort().concat(["Other country"]),p.country))+
   plL("Your state (India)",plSel("state",Object.keys(STATES),p.state))+
   plL("Mode",plSel("mode",(CATS.find(c=>c.id===p.cat)||{}).service?[["service","Service (no shipment)"]]:MODES,p.mode))+
   plL("Incoterm",plSel("incoterm",["EXW","FCA","FAS","FOB","CFR","CIF","CPT","CIP","DAP","DPU","DDP"],p.incoterm))+
   plL("Payment term",plSel("pay",Object.keys(PAYDAYS),p.pay))+plIn("value","Order value",p.value,"number")+plL("Currency",plSel("cur",["USD","EUR","GBP","AED","AUD","CHF","JPY","CNY","SGD","SAR","INR"],p.cur))+plIn("rate","Exchange rate","" +p.rate,"number","₹ per 1")+
   plIn("margin","Your margin","" +p.margin,"number","%")+plIn("shipDate","Planned shipment date",p.shipDate,"date")+plIn("prodDays",ex?"Production/sourcing days":"Supplier production days","" +p.prodDays,"number")+plIn("intRate","Bank interest rate","" +p.intRate,"number","% p.a.")+
   (ex?plIn("rodtep","RoDTEP rate","" +p.rodtep,"number","% of FOB")+plIn("dbk","Drawback rate","" +p.dbk,"number","%"):plIn("bcd","BCD rate","" +p.bcd,"number","% — verify")+plIn("igst","IGST rate","" +p.igst,"number","%")+plIn("sellDays","Days to sell stock","" +p.sellDays,"number")+plIn("qty","Quantity (units)","" +p.qty,"number"))+
   '<label class="f chkf"><input type="checkbox" data-pl="newPartner" '+(p.newPartner?"checked":"")+'><span>New '+(ex?"buyer":"supplier")+' (first deal)</span></label></div>'+
   '<p class="small mt"><b>I already have:</b> '+HAVE.map(([k,l])=>'<label class="inl"><input type="checkbox" data-plh="'+k+'" '+(p.have[k]?"checked":"")+'> '+esc(l)+'</label>').join(" ")+'</p></details></div>';
  // summary
  h+='<div class="grid2"><div class="card"><h3>At a glance</h3><table class="tbl res">'+
    '<tr><td>Steps in your plan</td><td><b>'+total+'</b> ('+done+' done)</td></tr>'+
    '<tr><td>Trade agreement</td><td>'+esc(P.cp.fta||"—")+'</td></tr>'+
    (P.cp.tariff?'<tr><td>Tariff note</td><td>'+esc(P.cp.tariff)+'</td></tr>':'')+
    '<tr><td>Payment practice in '+esc(p.country)+'</td><td>'+esc(P.cp.pay||"—")+'</td></tr>'+
    '<tr><td>Export Promotion Council</td><td>'+esc((EPC[P.cat.epc]||EPC.fieo)[0])+'</td></tr>'+
    (P.cp.land&&ex?'<tr><td>Land route</td><td>'+esc(P.cp.land)+'</td></tr>':'')+
    '</table><div class="bar mt"><i style="width:'+(total?Math.round(done*100/total):0)+'%"></i></div></div>'+
   '<div class="card"><h3>Money plan</h3>'+moneyTable(p,f)+'</div></div>';
  if(P.warns.length)h+='<div class="card warnbox"><b>⚠ Watch out</b><ul>'+P.warns.map(w=>'<li>'+esc(w)+'</li>').join("")+'</ul></div>';
  // AI
  if(AI_OK)h+='<div class="card"><div class="row sb wrap gap"><div><h3>🤖 Product-specific deep-dive</h3><p class="small muted">Ask Claude for the exact rules for <b>'+esc(p.product||"your product")+'</b> '+(ex?"into":"from")+' <b>'+esc(p.country)+'</b>: HS code, licences, '+esc(p.country)+'’s requirements, duty, labelling, red flags. Results are added to the flowchart, marked <span class="aib">AI · verify</span>.</p></div><button class="btn" id="plai" '+(plAI.busy?"disabled":"")+'>'+(plAI.busy?"Researching… (up to a minute)":(p.ai?"Refresh deep-dive":"Get deep-dive"))+'</button></div>'+(plAI.err?'<p class="warn">'+esc(plAI.err)+'</p>':'')+(p.ai?aiBlock(p.ai):'')+'</div>';
  // related official updates (keyword match, no AI)
  {const words=[(p.product||"").toLowerCase(),...(p.hs?[String(p.hs).slice(0,4)]:[]),p.country.toLowerCase()].join(" ").split(/[^a-z0-9]+/).filter(w=>w.length>3&&!["export","import","other","country","products","product"].includes(w));
   const rel=UPD.items.filter(i=>words.some(w=>(i.title||"").toLowerCase().includes(w))).slice(0,8);
   h+='<div class="card"><h3>📰 Official updates that mention this plan</h3>'+(rel.length?'<ul class="plain">'+rel.map(i=>'<li><span class="small muted">'+esc(showD(parseD(i.date)))+' · '+esc(i.kind||"")+' '+esc(i.num||"")+'</span><br><a href="'+esc(i.link)+'" target="_blank" rel="noopener">'+esc(i.title)+'</a></li>').join("")+'</ul>':'<p class="small muted">'+(UPD.items.length?"No recent DGFT/RBI item mentions "+esc(p.product||"this product")+" or "+esc(p.country)+".":"Updates not loaded yet (needs internet).")+'</p>')+'<p class="small muted">Matched by words in the title — always open the official PDF.</p></div>';}
  // flowchart
  h+='<div class="card"><div class="row sb wrap gap"><h3>Flowchart — tap a step for details, tick when done</h3><div class="row gap wrap"><button class="btn sm ghost" id="plexpand">Expand all</button><button class="btn sm ghost" id="plwa">Copy for WhatsApp</button><button class="btn sm ghost" id="plhtml">Download shareable file</button><button class="btn sm ghost" id="plmm">Copy flowchart code</button></div></div><p id="plmsg" class="small"></p>'+
   '<div class="legend small"><span>🔒 permission/approval</span><span>💰 money</span><span>📍 whom/where</span><span class="aib">AI · verify</span></div><div class="flow">'+
   P.phases.map((x,pi)=>'<div class="lane l'+(pi%6)+'"><div class="lanehd">'+esc(x.title)+'</div>'+x.nodes.map(nd=>nodeHTML(nd,p)).join('<div class="arrow">↓</div>')+'</div>').join('<div class="arrow big">⬇</div>')+
   '<div class="lane done"><div class="lanehd">✅ '+(ex?"Payment realised, benefits claimed — repeat with next order":"Goods sold — reorder")+'</div></div></div></div>';
  // meet
  h+='<div class="card"><h3>📍 Whom to meet & where</h3><table class="tbl"><thead><tr><th>Who / where</th><th>For what</th><th></th></tr></thead><tbody>'+P.meet.map(m=>'<tr><td><b>'+esc(m.who)+'</b></td><td>'+esc(m.why)+'</td><td>'+(m.link?'<a href="'+esc(m.link)+'" target="_blank" rel="noopener">Find</a>':'')+'</td></tr>').join("")+'</tbody></table>'+
   '<p class="small muted">Your logistics region ('+esc(p.state)+'): sea — '+esc(P.reg.sea)+'; '+esc(P.reg.icd)+'; air — '+esc(P.reg.air)+'; inspection — '+esc(P.reg.eia)+'.</p></div>';
  return h;
};
function moneyTable(p,f){
  if(p.dir==="export")return '<table class="tbl res"><tr><td>Order value</td><td><b>'+inr(f.vINR)+'</b></td></tr><tr><td>Goods cost (at '+p.margin+'% margin)</td><td>'+inr(f.cogs)+'</td></tr><tr><td>Advance received</td><td>'+inr(f.adv)+'</td></tr><tr><td>Money you must fund</td><td><b>'+inr(f.need)+'</b></td></tr><tr><td>Cash cycle</td><td>'+f.cycle+' days</td></tr><tr><td>Interest cost @'+p.intRate+'%</td><td>'+inr(f.interest)+'</td></tr><tr><td>RoDTEP + drawback</td><td>'+(f.incent?inr(f.incent):"enter rates")+'</td></tr>'+(f.ecgc?'<tr><td>ECGC premium (est.)</td><td>'+inr(f.ecgc[0])+'–'+inr(f.ecgc[1])+'</td></tr>':'')+(f.lc?'<tr><td>LC charges (est.)</td><td>'+inr(f.lc[0])+'–'+inr(f.lc[1])+'</td></tr>':'')+'<tr><td>Gross profit after interest + incentives</td><td><b>'+inr(f.profit)+'</b></td></tr><tr><td>Docs to bank by</td><td>'+showD(f.docsBy)+'</td></tr><tr><td>Payment must arrive by (FEMA)</td><td><b>'+showD(f.due)+'</b></td></tr></table><p class="small muted">Indicative only — excludes freight, CHA and port charges (get quotes).</p>';
  const r=f.imp;return '<table class="tbl res"><tr><td>Goods value (₹)</td><td>'+inr(f.vINR)+'</td></tr><tr><td>Assessable value</td><td>'+inr(r.av)+'</td></tr><tr><td>BCD + SWS</td><td>'+inr(r.bcd+r.sws)+'</td></tr><tr><td>IGST (credit back)</td><td>'+inr(r.igst)+'</td></tr><tr><td>Clearing, port, transport (est.)</td><td>'+inr(r.other)+'</td></tr><tr><td>Total cash out</td><td><b>'+inr(r.landedGross)+'</b></td></tr><tr><td>Net landed cost</td><td><b>'+inr(r.landed)+'</b></td></tr><tr><td>Landed cost / unit</td><td>'+inr(r.pu)+'</td></tr><tr><td>Cash cycle / interest</td><td>'+f.cycle+' days / '+inr(f.interest)+'</td></tr></table><p class="small muted">'+esc(f.cifNote)+' Duty rates are your inputs — confirm for your HS on ICEGATE.</p>';
}
function nodeHTML(nd,p){
  const d=!!p.done[nd.key];
  return '<div class="node'+(d?" ok":"")+(nd.src==="ai"?" ai":"")+'"><div class="nh"><input type="checkbox" data-pldone="'+esc(nd.key)+'" '+(d?"checked":"")+' aria-label="done"><button class="nt" data-pltog>'+nd.no+'. '+esc(nd.t)+'</button>'+
   '<span class="ics">'+(nd.appr?'🔒':'')+(nd.fin?'💰':'')+(nd.meet?'📍':'')+(nd.src==="ai"?' <span class="aib">AI · verify</span>':'')+'</span></div>'+
   '<div class="nb"><p>'+esc(nd.how)+'</p>'+
   (nd.appr?'<p>🔒 <b>Permission:</b> '+esc(nd.appr.n)+(nd.appr.by?' — <i>'+esc(nd.appr.by)+'</i>':'')+(nd.appr.link?' · <a href="'+esc(nd.appr.link)+'" target="_blank" rel="noopener">Apply / check</a>':'')+'</p>':'')+
   (nd.meet?'<p>📍 <b>Whom / where:</b> '+esc(nd.meet)+(nd.link&&!nd.appr?' · <a href="'+esc(nd.link)+'" target="_blank" rel="noopener">Link</a>':'')+'</p>':'')+
   (nd.docs?'<p>📄 '+esc(nd.docs)+'</p>':'')+((nd.time||nd.cost)?'<p class="small muted">'+(nd.time?'⏱ '+esc(nd.time)+' ':'')+(nd.cost?'· 💵 '+esc(nd.cost):'')+'</p>':'')+
   (nd.fin?'<p>💰 '+esc(nd.fin)+'</p>':'')+(nd.warn?'<p class="warn">⚠ '+esc(nd.warn)+'</p>':'')+'</div></div>';
}
function aiBlock(a){
  const li=arr=>(Array.isArray(arr)&&arr.length)?'<ul>'+arr.map(x=>'<li>'+esc(typeof x==="string"?x:(x.name||"")+(x.how?" — "+x.how:""))+'</li>').join("")+'</ul>':'<p class="muted small">—</p>';
  return '<div class="aiout"><div class="grid2"><div><h4>HS code</h4><p>'+esc(a.hs_code||"—")+(a.hs_note?' <span class="muted small">'+esc(a.hs_note)+'</span>':'')+'</p><h4>India policy</h4><p>'+esc(a.india_policy||"—")+'</p><h4>Duty in partner country / India</h4><p>'+esc(a.tariff||"—")+'</p></div><div><h4>Documents</h4>'+li(a.documents)+'<h4>Labelling</h4>'+li(a.labelling)+'</div></div><div class="grid2"><div><h4>Where to find '+(PL.dir==="export"?"buyers":"suppliers")+'</h4>'+li(a.where_to_find)+'</div><div><h4>Red flags</h4>'+li(a.red_flags)+'<h4>Tips</h4>'+li(a.tips)+'</div></div><p class="small muted">Generated '+esc(a._at||"")+' by AI. Approval steps were added to the flowchart. Verify each item on the official site before acting.</p></div>';
}
async function runAI(){
  if(!PL||plAI.busy)return;
  let sample=null;try{sample=window.claude&&window.claude.use?await window.claude.use("sample"):null}catch(e){}
  if(!sample){plAI.err="The AI deep-dive works only in the claude.ai version of this app (link in the Backup page). Everything else works here.";render();return}
  plAI={busy:true,err:""};render();
  const p=PL,ex=p.dir==="export",cat=(CATS.find(c=>c.id===p.cat)||{}).n;
  const prompt="You are an expert in Indian foreign trade (DGFT FTP 2023, CBIC customs, FEMA 2026, GST) and in import regulations of other countries. Today is "+ASOF+".\nTask: list the SPECIFIC requirements to "+(ex?"EXPORT":"IMPORT")+" this product "+(ex?"from India to "+p.country:"from "+p.country+" into India")+".\nProduct: "+(p.product||cat)+" (category: "+cat+")"+(p.hs?", HS "+p.hs:"")+". Mode: "+p.mode+". Incoterm: "+p.incoterm+".\nRules: be specific to this product and country; do not repeat generic steps (IEC, GST, shipping bill, bank). If unsure, say 'verify' in the text. 'url' must be an official government/regulator https URL you are confident exists, otherwise an empty string. Keep each 'how' under 35 words. Max 6 items per list.\nReply with ONLY this JSON:\n{\"hs_code\":\"8-digit ITC-HS or 6-digit HS\",\"hs_note\":\"\",\"india_policy\":\"Free/Restricted/Prohibited/STE + any MEP/duty/condition\",\"india_approvals\":[{\"name\":\"\",\"authority\":\"\",\"how\":\"\",\"url\":\"\"}],\"partner_requirements\":[{\"name\":\"\",\"authority\":\"\",\"how\":\"\",\"url\":\"\"}],\"tariff\":\"duty the "+(ex?p.country+" importer pays (MFN and preferential under any FTA with India)":"Indian BCD/IGST and any anti-dumping on goods from "+p.country)+"\",\"documents\":[\"\"],\"labelling\":[\"\"],\"where_to_find\":[\"specific fairs, associations, platforms for "+(ex?"buyers in "+p.country:"suppliers in "+p.country)+"\"],\"red_flags\":[\"\"],\"tips\":[\"\"]}";
  try{
    const r=await sample.json(prompt,{modelTier:"default"});
    if(!r||typeof r!=="object")throw {code:"invalid_json"};
    ["india_approvals","partner_requirements","documents","labelling","where_to_find","red_flags","tips"].forEach(k=>{if(!Array.isArray(r[k]))r[k]=[];r[k]=r[k].slice(0,8)});
    ["india_approvals","partner_requirements"].forEach(k=>{r[k]=r[k].filter(x=>x&&typeof x==="object"&&x.name).map(x=>({name:String(x.name).slice(0,120),authority:String(x.authority||"").slice(0,120),how:String(x.how||"").slice(0,300),url:safeUrl(x.url)}))});
    ["documents","labelling","where_to_find","red_flags","tips"].forEach(k=>{r[k]=r[k].map(x=>String(typeof x==="string"?x:(x&&x.name)||"").slice(0,300)).filter(Boolean)});
    r._at=new Date().toLocaleString("en-IN");
    PL.ai=r;plAI={busy:false,err:""};
    const sv=S.plans.find(s=>s.id===PL.id);if(sv){Object.assign(sv,JSON.parse(JSON.stringify(PL)));save("plans")}
  }catch(e){plAI={busy:false,err:e&&e.code==="not_granted"?"You declined AI access for this page.":e&&e.code==="rate_limited"?"Too many requests — try again in a minute.":"Could not get the deep-dive ("+(e&&e.code||"error")+"). Try again."}}
  render();
}
function planText(p){const P=buildPlan(p),f=P.f,ex=p.dir==="export";
  let t="*"+(ex?"EXPORT ":"IMPORT ")+(p.product||"")+(ex?" → ":" ← ")+p.country+"* — GARCHA EXIM plan ("+ASOF+")\n";
  t+="Value: "+inr(f.vINR)+" · "+p.incoterm+" · "+p.pay+"\n";
  if(ex)t+="Fund: "+inr(f.need)+" for ~"+f.cycle+" days · Payment due by "+showD(f.due)+"\n";else t+="Duty ≈ "+inr(f.imp.duty)+" · Net landed ≈ "+inr(f.imp.landed)+"\n";
  P.warns.forEach(w=>t+="⚠ "+w+"\n");
  P.phases.forEach(x=>{t+="\n*"+x.title+"*\n";x.nodes.forEach(nd=>{t+=(p.done[nd.key]?"✅ ":"▫️ ")+nd.no+". "+nd.t+(nd.appr?"\n   🔒 "+nd.appr.n+(nd.appr.by?" ("+nd.appr.by+")":"")+(nd.appr.link?" "+nd.appr.link:""):"")+(nd.meet?"\n   📍 "+nd.meet:"")+(nd.fin?"\n   💰 "+nd.fin:"")+(nd.src==="ai"?"\n   (AI – verify)":"")+"\n"})});
  t+="\n_Guidance only — verify on DGFT/CBIC/RBI before acting._";return t}
function mermaidText(p){const P=buildPlan(p);const c=s=>String(s).replace(/["\[\]{}()<>|#;]/g," ").slice(0,70);
  let m="flowchart TD\n";let prev=null;P.phases.forEach((x,i)=>{m+='  subgraph P'+i+'["'+c(x.title)+'"]\n';x.nodes.forEach(nd=>{const id="N"+nd.no;m+='    '+id+'["'+nd.no+'. '+c(nd.t)+(nd.appr?' 🔒':'')+'"]\n'});m+="  end\n"});
  const all=[];P.phases.forEach(x=>x.nodes.forEach(nd=>all.push("N"+nd.no)));for(let i=1;i<all.length;i++)m+="  "+all[i-1]+" --> "+all[i]+"\n";return m}
function planHTMLFile(p){const P=buildPlan(p),ex=p.dir==="export";
  const css="body{font-family:system-ui,Segoe UI,Roboto,sans-serif;margin:0;padding:14px;color:#14213d;background:#f5f6f8}h1{font-size:20px}h2{font-size:16px;background:#0b6e4f;color:#fff;padding:8px 12px;border-radius:8px;margin:18px 0 8px}.n{background:#fff;border:1px solid #dde;border-radius:10px;padding:10px 12px;margin:0 0 6px}.n b{display:block}.a{text-align:center;color:#999}.w{background:#fee2e2;padding:8px 12px;border-radius:8px}table{border-collapse:collapse;width:100%;background:#fff}td{border-bottom:1px solid #eee;padding:6px}.ai{color:#b45309;font-size:12px}small{color:#667}";
  let h="<!DOCTYPE html><html><head><meta charset='utf-8'><meta name='viewport' content='width=device-width,initial-scale=1'><title>"+esc((ex?"Export ":"Import ")+p.product+" "+p.country)+"</title><style>"+css+"</style></head><body>";
  h+="<h1>"+(ex?"⬆ Export ":"⬇ Import ")+esc(p.product)+(ex?" → ":" ← ")+esc(p.country)+"</h1><small>GARCHA EXIM Navigator · "+ASOF+" · guidance only — verify on official sites</small>";
  h+="<h2>Money plan</h2>"+moneyTable(p,P.f).replace(/class="[^"]*"/g,"");
  if(P.warns.length)h+="<div class='w'>"+P.warns.map(w=>"⚠ "+esc(w)).join("<br>")+"</div>";
  P.phases.forEach(x=>{h+="<h2>"+esc(x.title)+"</h2>";h+=x.nodes.map(nd=>"<div class='n'><b>"+(p.done[nd.key]?"✅ ":"")+nd.no+". "+esc(nd.t)+(nd.src==="ai"?" <span class='ai'>AI · verify</span>":"")+"</b>"+esc(nd.how)+(nd.appr?"<br>🔒 <b style='display:inline'>"+esc(nd.appr.n)+"</b> — "+esc(nd.appr.by)+(nd.appr.link?" <a href='"+esc(nd.appr.link)+"'>link</a>":""):"")+(nd.meet?"<br>📍 "+esc(nd.meet):"")+(nd.docs?"<br>📄 "+esc(nd.docs):"")+(nd.fin?"<br>💰 "+esc(nd.fin):"")+"</div>").join("<div class='a'>↓</div>")});
  h+="<h2>Whom to meet & where</h2><table>"+P.meet.map(m=>"<tr><td><b>"+esc(m.who)+"</b></td><td>"+esc(m.why)+"</td></tr>").join("")+"</table></body></html>";return h}
async function plCopy(t,msg){try{await navigator.clipboard.writeText(t);plMsg(msg)}catch(e){plMsg("Copy blocked — select the text in the box below.");const m=$("#plmsg");if(m)m.innerHTML='<textarea rows="6" style="width:100%">'+esc(t)+'</textarea>'}}
function plMsg(t){const m=$("#plmsg");if(m)m.textContent=t}
function plHandlers(){
  document.addEventListener("input",e=>{const t=e.target;if(!t.dataset||t.dataset.pl==null||!PL)return;if(t.type==="checkbox")return;const k=t.dataset.pl;PL[k]=t.tagName==="SELECT"||t.type==="text"||t.type==="date"?t.value:t.value;
    if(k==="cat"&&(CATS.find(c=>c.id===t.value)||{}).service)PL.mode="service";else if(k==="cat"&&PL.mode==="service")PL.mode="sea_fcl";
    if(k==="dir"&&PL.dir==="import"&&PL.mode==="land"&&!countryProfile(PL.country).land)PL.mode="sea_fcl";
    if(k==="product"&&!PL._catTouched){PL.cat=detectCat(t.value)}
    if(k==="cat")PL._catTouched=true;
    render()});
  document.addEventListener("change",e=>{const t=e.target;if(!PL)return;
    if(t.dataset.pl==="newPartner"){PL.newPartner=t.checked;render()}
    if(t.dataset.plh){PL.have[t.dataset.plh]=t.checked;render()}
    if(t.dataset.pldone){PL.done[t.dataset.pldone]=t.checked;const sv=S.plans.find(s=>s.id===PL.id);if(sv){sv.done=Object.assign({},PL.done);save("plans")}render()}});
  document.addEventListener("click",e=>{const b=e.target.closest("button");if(!b)return;
    if(b.dataset.pltog!=null){b.closest(".node").classList.toggle("open");return}
    if(b.dataset.plopen){const s=S.plans.find(x=>x.id===b.dataset.plopen);if(s){PL=JSON.parse(JSON.stringify(s));plAI={busy:false,err:""};render()}return}
    if(b.dataset.pldel){const id=b.dataset.pldel;askConfirm(b,"Delete this saved plan?",()=>{S.plans=S.plans.filter(x=>x.id!==id);save("plans");if(PL&&PL.id===id)PL=null;render()});return}
    if(b.id==="plblank"){PL=newPlanInput(null);render();return}
    if(b.id==="plsave"){const i=S.plans.findIndex(s=>s.id===PL.id);const c=JSON.parse(JSON.stringify(PL));if(i>=0)S.plans[i]=c;else S.plans.push(c);save("plans");render();plMsg("Plan saved.");return}
    if(b.id==="plai"){runAI();return}
    if(b.id==="plexpand"){const ns=$$(".node");const open=ns.some(n=>!n.classList.contains("open"));ns.forEach(n=>n.classList.toggle("open",open));return}
    if(b.id==="plwa"){plCopy(planText(PL),"Copied — paste into WhatsApp.");return}
    if(b.id==="plmm"){plCopy(mermaidText(PL),"Flowchart code copied — paste at mermaid.live to get an image.");return}
    if(b.id==="plhtml"){(async()=>{try{await saveFile("garcha-plan-"+(PL.dir)+"-"+(PL.product||"product").replace(/[^a-z0-9]+/gi,"-").toLowerCase()+"-"+PL.country.replace(/[^a-z0-9]+/gi,"-").toLowerCase()+".html",planHTMLFile(PL),"text/html");plMsg("Saved — this file opens on any phone/computer; share it on WhatsApp.")}catch(err){plMsg("Download cancelled or blocked.")}})();return}
    if(b.id==="pltasks"){const P=buildPlan(PL);let n=0;P.phases.forEach((x,pi)=>x.nodes.forEach(nd=>{if(PL.done[nd.key])return;const src=PL.id+":"+nd.key;if(S.tasks.some(t=>t.src===src))return;S.tasks.push({id:uid(),t:"["+(PL.product||"plan")+" → "+PL.country+"] "+nd.t,pri:nd.appr?(pi<=2?1:2):3,done:false,src});n++}));save("tasks");plMsg(n+" steps added to Pending Tasks (permissions = P1/P2).");return}
    if(b.id==="plship"){S.ships.push({id:uid(),type:PL.dir==="export"?"export":"import",stage:0,ref:"",party:"",country:PL.country,product:PL.product,hs:PL.hs,value:String(PL.value),cur:PL.cur,inr:String(Math.round(num(PL.value)*(PL.cur==="INR"?1:num(PL.rate)))),incoterm:PL.incoterm,pay:"",shipDate:PL.shipDate,inrInv:PL.cur==="INR"});save("ships");plMsg("Shipment created in Shipment Tracker.");return}
  });
  document.addEventListener("submit",e=>{if(e.target.id!=="plform")return;e.preventDefault();const q=$("#plq").value;const it=parseIntent(q);
    if(!it){PL=newPlanInput({dir:/import|buy|bring/i.test(q)?"import":"export",product:q.replace(/\b(export|import)\b/ig,"").trim(),country:findCountry(q)||"Other country"})}else PL=newPlanInput(it);
    plAI={busy:false,err:""};render();const fl=$(".flow");if(fl)fl.scrollIntoView({behavior:"smooth",block:"start"})});
}
plHandlers();

/* ===== v3 MODULE: BEFORE-YOU-START CHECKLIST + HOVER MEANINGS ===== */
let prepSide="";
function prepDone(id){return !!(S.prep[id]&&S.prep[id].d)}
function prepVisible(it){return !prepSide||it.side==="B"||it.side===prepSide}
V.prep=function(){
  const vis=PREP.filter(prepVisible), done=vis.filter(i=>prepDone(i.id)).length, must=vis.filter(i=>i.need==="Must"), mustLeft=must.filter(i=>!prepDone(i.id));
  const pct=vis.length?Math.round(done*100/vis.length):0;
  let h='<div class="card"><div class="row sb wrap gap"><h2>🧰 Before you start — everything to have in place</h2><b class="big">'+pct+'%</b></div>'+
   '<div class="bar"><i style="width:'+pct+'%"></i></div>'+
   '<p class="muted small">'+done+' of '+vis.length+' ready · <b>'+mustLeft.length+' must-haves left</b>. Tick what you already have and note the number (e.g. your IEC). <span class="term-demo">Underlined words</span> show their meaning when you hover (or tap on phone).</p>'+
   '<div class="row gap wrap mt"><span class="small">Show for:</span><div class="seg">'+[["","Export + Import"],["E","Export only"],["I","Import only"]].map(x=>'<button data-prepside="'+x[0]+'" class="'+(prepSide===x[0]?"on":"")+'">'+x[1]+'</button>').join("")+'</div>'+
   '<button class="btn sm ghost" id="prepexpand">Show all details</button><button class="btn sm ghost" id="preptasks">Add missing must-haves to Pending Tasks</button></div><p id="prepmsg" class="small"></p></div>';
  if(mustLeft.length)h+='<div class="card note"><b>Do these first:</b> '+mustLeft.slice(0,6).map(i=>esc(i.t)).join(" → ")+(mustLeft.length>6?" …":"")+'</div>';
  PREP_GROUPS.forEach(([gid,gt,gd])=>{
    const items=PREP.filter(i=>i.g===gid&&prepVisible(i));if(!items.length)return;
    const gd2=items.filter(i=>prepDone(i.id)).length;
    h+='<div class="card prepg"><div class="row sb"><h3>'+esc(gt)+'</h3><span class="pill">'+gd2+'/'+items.length+'</span></div><p class="muted small">'+esc(gd)+'</p>'+
     items.map(i=>{const r=S.prep[i.id]||{};const needCls=i.need==="Must"?"must":i.need==="If needed"?"ifn":"rec";
      return '<div class="pitem'+(r.d?" ok":"")+'"><div class="ph"><input type="checkbox" data-prep="'+i.id+'" '+(r.d?"checked":"")+' aria-label="I have this"><div class="pt"><b>'+esc(i.t)+'</b> <span class="need '+needCls+'">'+esc(i.need)+'</span> <span class="sidebadge">'+({B:"Export & Import",E:"Export",I:"Import"}[i.side])+'</span><p class="pw">'+esc(i.what)+'</p></div><button class="btn sm ghost" data-preptog>Details</button></div>'+
       '<div class="pb"><p><b>Why you need it:</b> '+esc(i.why)+'</p><p><b>How to get it:</b> '+esc(i.how)+'</p><p class="small muted">'+(i.where?'📍 <a href="'+esc(i.where[1])+'" target="_blank" rel="noopener">'+esc(i.where[0])+'</a> · ':'')+'💵 '+esc(i.cost)+' · ⏱ '+esc(i.time)+'</p></div>'+
       '<input class="pnote" data-prepnote="'+i.id+'" placeholder="Number / note (e.g. IEC no., bank branch, contact)…" value="'+esc(r.n||"")+'"></div>'}).join("")+'</div>'});
  h+='<div class="card"><h3>Next</h3><p>When the must-haves are ticked, go to <a href="#planner">Trade Planner</a> and type what you want to export/import — registrations you ticked here are skipped automatically.</p></div>';
  return h;
};
/* Planner "already have" also reads this checklist */
const _haveDefaultsV2=haveDefaults;
haveDefaults=function(){const h=_haveDefaultsV2();PREP.forEach(i=>{if(i.have&&prepDone(i.id))h[i.have]=true});return h};

/* ----- hover / tap meanings ----- */
const TERM_LIST=Object.keys(TERMS).sort((a,b)=>b.length-a.length);
const TERM_RE=new RegExp("(?<![A-Za-z0-9])("+TERM_LIST.map(t=>t.replace(/[.*+?^${}()|[\]\\]/g,"\\$&")).join("|")+")(?![A-Za-z0-9])","g");
const TIP_SKIP=new Set(["A","BUTTON","LABEL","SELECT","OPTION","TEXTAREA","INPUT","SCRIPT","STYLE","SUMMARY","H2","CODE"]);
let termsOn=true;try{termsOn=localStorage.getItem("garcha-terms")!=="off"}catch(e){}
function decorateTerms(root){
  if(!termsOn||!root)return;
  const walker=document.createTreeWalker(root,NodeFilter.SHOW_TEXT,{acceptNode(n){
    if(!n.nodeValue||n.nodeValue.trim().length<2)return NodeFilter.FILTER_REJECT;
    for(let p=n.parentNode;p&&p!==root;p=p.parentNode){if(TIP_SKIP.has(p.tagName)||(p.classList&&(p.classList.contains("term")||p.classList.contains("notip"))))return NodeFilter.FILTER_REJECT}
    return NodeFilter.FILTER_ACCEPT}});
  const nodes=[];while(walker.nextNode())nodes.push(walker.currentNode);
  const usedBy=new Map();
  nodes.forEach(n=>{
    const block=(n.parentNode.closest&&n.parentNode.closest(".pitem,.node,.step,tr,.card,li"))||root;
    let used=usedBy.get(block);if(!used){used=new Set();usedBy.set(block,used)}
    const txt=n.nodeValue;TERM_RE.lastIndex=0;let m,last=0,frag=null;
    while((m=TERM_RE.exec(txt))){const key=m[1];const norm=TERMS[key].slice(0,40);if(used.has(norm))continue;used.add(norm);
      frag=frag||document.createDocumentFragment();frag.appendChild(document.createTextNode(txt.slice(last,m.index)));
      const s=document.createElement("span");s.className="term";s.tabIndex=0;s.dataset.term=key;s.textContent=key;frag.appendChild(s);last=m.index+key.length}
    if(frag){frag.appendChild(document.createTextNode(txt.slice(last)));n.parentNode.replaceChild(frag,n)}
  });
}
const tipEl=document.createElement("div");tipEl.id="tip";tipEl.setAttribute("role","tooltip");document.body.appendChild(tipEl);
let tipFor=null;
function showTip(el){const k=el.dataset.term;if(!TERMS[k])return;tipFor=el;tipEl.innerHTML='<b>'+esc(k)+'</b><br>'+esc(TERMS[k]);tipEl.style.display="block";
  const r=el.getBoundingClientRect(),w=Math.min(320,window.innerWidth-16);tipEl.style.maxWidth=w+"px";
  const tw=tipEl.offsetWidth,th=tipEl.offsetHeight;let x=Math.max(8,Math.min(r.left,window.innerWidth-tw-8)),y=r.bottom+6;if(y+th>window.innerHeight-8)y=Math.max(8,r.top-th-6);
  tipEl.style.left=x+"px";tipEl.style.top=y+"px"}
function hideTip(){tipEl.style.display="none";tipFor=null}
document.addEventListener("mouseover",e=>{const t=e.target.closest&&e.target.closest(".term");if(t)showTip(t)});
document.addEventListener("mouseout",e=>{const t=e.target.closest&&e.target.closest(".term");if(t&&!(e.relatedTarget&&t.contains(e.relatedTarget)))hideTip()});
document.addEventListener("focusin",e=>{if(e.target.classList&&e.target.classList.contains("term"))showTip(e.target)});
document.addEventListener("focusout",e=>{if(e.target.classList&&e.target.classList.contains("term"))hideTip()});
document.addEventListener("click",e=>{const t=e.target.closest&&e.target.closest(".term");if(t){showTip(t);return}if(!e.target.closest("#tip"))hideTip()},true);
document.addEventListener("keydown",e=>{if(e.key==="Escape")hideTip()});
window.addEventListener("scroll",hideTip,{passive:true});
function termsBtn(){const b=$("#termsbtn");if(b){b.textContent="💡 Meanings: "+(termsOn?"On":"Off");b.setAttribute("aria-pressed",termsOn)}}

/* ----- events ----- */
document.addEventListener("change",e=>{const t=e.target;
  if(t.dataset&&t.dataset.prep){const id=t.dataset.prep;S.prep[id]=Object.assign({},S.prep[id],{d:t.checked});save("prep");render()}});
document.addEventListener("input",e=>{const t=e.target;
  if(t.dataset&&t.dataset.prepnote){const id=t.dataset.prepnote;S.prep[id]=Object.assign({},S.prep[id],{n:t.value});save("prep")}});
document.addEventListener("click",e=>{const b=e.target.closest("button");if(!b)return;
  if(b.dataset.prepside!=null){prepSide=b.dataset.prepside;render();return}
  if(b.dataset.preptog!=null){b.closest(".pitem").classList.toggle("open");return}
  if(b.id==="prepexpand"){const ps=$$(".pitem");const open=ps.some(p=>!p.classList.contains("open"));ps.forEach(p=>p.classList.toggle("open",open));return}
  if(b.id==="preptasks"){let n=0;PREP.filter(i=>prepVisible(i)&&i.need==="Must"&&!prepDone(i.id)).forEach(i=>{const src="prep:"+i.id;if(S.tasks.some(t=>t.src===src))return;S.tasks.push({id:uid(),t:"Get ready: "+i.t,pri:["found","ident"].includes(i.g)?1:2,done:false,src});n++});save("tasks");const m=$("#prepmsg");if(m)m.textContent=n+" tasks added to Pending Tasks.";return}
  if(b.id==="termsbtn"){termsOn=!termsOn;try{localStorage.setItem("garcha-terms",termsOn?"on":"off")}catch(_){}termsBtn();hideTip();render();return}
});

/* ===== v5 MODULE: LIVE RULINGS FROM OFFICIAL SOURCES (no AI) ===== */
const PAGES_BASE="https://mangeshwarsinghp14.github.io/garcha-exim-navigator/";
const DATA_BASE=(location.protocol==="https:"&&/github\.io$/.test(location.hostname))?"data/":PAGES_BASE+"data/";
const REPO_URL="https://github.com/mangeshwarsinghp14/garcha-exim-navigator";
let UPD={items:[],generatedAt:"",status:null,loaded:false,err:"",loading:false};
let updF={q:"",tag:"",only:"all",src:""};
let readSet=new Set();try{readSet=new Set(JSON.parse(localStorage.getItem("garcha-read")||"[]"))}catch(e){}
function saveRead(){try{localStorage.setItem("garcha-read",JSON.stringify([...readSet].slice(-3000)))}catch(e){}}
function applyRules(r){
  if(!r||typeof r!=="object")return;
  if(r.realiseMonths)RULES.realiseMonths=+r.realiseMonths;
  if(r.realiseMonthsINR)RULES.realiseMonthsINR=+r.realiseMonthsINR;
  if(r.rodtepEnd)RULES.rodtepEnd=String(r.rodtepEnd);
  if(Array.isArray(r.keyRules)&&r.keyRules.length)RULES.keyRules=r.keyRules.map(String);
  if(r.ruleNames)RULES.ruleNames=r.ruleNames;
  if(r.confirmedNote)RULES.confirmedNote=String(r.confirmedNote);
  if(r.asOf){RULES.asOf=String(r.asOf);const d=parseD(RULES.asOf);if(d)ASOF=showD(d)}
  if(Array.isArray(r.ftas)&&r.ftas.length&&r.ftas.every(x=>Array.isArray(x)&&x.length>=3)){FTAS.length=0;r.ftas.forEach(x=>FTAS.push(x.map(String)))}
}
async function getJSON(name){const r=await fetch(DATA_BASE+name+"?t="+Date.now(),{cache:"no-store"});if(!r.ok)throw new Error("HTTP "+r.status);return r.json()}
async function loadUpdates(manual){
  if(UPD.loading)return;UPD.loading=true;UPD.err="";if(manual)render();
  try{
    const [u,st,ru]=await Promise.all([getJSON("updates.json"),getJSON("status.json").catch(()=>null),getJSON("rules.json").catch(()=>null)]);
    UPD.items=Array.isArray(u.items)?u.items:[];UPD.generatedAt=u.generatedAt||"";UPD.status=st;UPD.loaded=true;
    applyRules(ru);
    try{localStorage.setItem("garcha-upd-cache",JSON.stringify({u,st,ru}))}catch(e){}
    if(!localStorage.getItem("garcha-read-init")){const cut=isoD(addDays(today(),-30));UPD.items.forEach(i=>{if((i.date||"")<cut)readSet.add(i.id)});saveRead();try{localStorage.setItem("garcha-read-init","1")}catch(e){}}
  }catch(e){
    UPD.err=navigator.onLine===false?"You are offline — showing the last saved updates.":"Could not reach the update server ("+(e.message||"error")+") — showing the last saved updates.";
    try{const c=JSON.parse(localStorage.getItem("garcha-upd-cache")||"null");if(c){UPD.items=c.u.items||[];UPD.generatedAt=c.u.generatedAt||"";UPD.status=c.st;UPD.loaded=true;applyRules(c.ru)}}catch(_){}
  }
  UPD.loading=false;render();
}
function unreadImportant(){return UPD.items.filter(i=>i.important&&!readSet.has(i.id)).length}
function fmtDT(s){if(!s)return"—";const d=new Date(s);return isNaN(d)?s:d.toLocaleString("en-IN",{day:"2-digit",month:"short",year:"numeric",hour:"2-digit",minute:"2-digit"})}
function updRow(i){
  const rd=readSet.has(i.id), d=parseD(i.date);
  return '<div class="upd'+(rd?" rd":"")+(i.important?" imp":"")+'"><div class="ur"><span class="udate">'+(d?showD(d):"")+'</span><span class="usrc">'+esc(i.kind||i.srcName)+(i.num?' '+esc(i.num):'')+'</span>'+(i.important?'<span class="pill red">Important</span>':'')+(!rd?'<span class="pill amber">New</span>':'')+'</div>'+
   '<a class="ut" href="'+esc(i.link)+'" target="_blank" rel="noopener" data-updopen="'+esc(i.id)+'">'+esc(i.title)+'</a>'+
   ((i.tags&&i.tags.length)?'<div class="utags">'+i.tags.map(t=>'<button class="tagb" data-updtag="'+esc(t)+'">'+esc(t)+'</button>').join("")+'</div>':'')+
   ((i.rules&&i.rules.length)?'<p class="small warn">⚠ May affect: '+i.rules.map(r=>esc((RULES.ruleNames||{})[r]||r)).join(", ")+' — app rules last confirmed '+esc(ASOF)+'.</p>':'')+
   (!rd?'<button class="link small" data-updread="'+esc(i.id)+'">Mark as read</button>':'')+'</div>';
}
V.updates=function(){
  if(!UPD.loaded&&!UPD.loading&&!UPD.err)setTimeout(()=>loadUpdates(true),0);
  const tags=[...new Set(UPD.items.flatMap(i=>i.tags||[]))].sort();
  const srcs=[...new Set(UPD.items.map(i=>i.srcName))];
  let L=UPD.items.filter(i=>(updF.only==="all"||(updF.only==="imp"&&i.important)||(updF.only==="new"&&!readSet.has(i.id)))&&(!updF.tag||(i.tags||[]).includes(updF.tag))&&(!updF.src||i.srcName===updF.src)&&(!updF.q||(i.title+" "+(i.num||"")+" "+(i.tags||[]).join(" ")).toLowerCase().includes(updF.q.toLowerCase())));
  const st=UPD.status;
  let h='<div class="card"><div class="row sb wrap gap"><h2>📰 Latest rulings & updates</h2><div class="row gap wrap"><button class="btn sm" id="updnow" '+(UPD.loading?"disabled":"")+'>'+(UPD.loading?"Checking…":"Check now")+'</button><button class="btn sm ghost" id="updallread">Mark all read</button></div></div>'+
   '<p class="small muted">Collected automatically every day from <b>official sources only</b> — DGFT notifications, public notices, trade notices and circulars, and RBI notifications and press releases on trade and forex. No AI is used: items are matched to topics by keywords. Open each item to read the official text.</p>'+
   '<p class="small">Last collected: <b>'+fmtDT(UPD.generatedAt)+'</b>'+(st?' · sources working: <b>'+st.ok+'/'+st.total+'</b>':'')+' · app rules sheet confirmed: <b>'+esc(ASOF)+'</b></p>'+
   (UPD.err?'<p class="warn">'+esc(UPD.err)+'</p>':'')+
   (st&&st.ok<st.total?'<p class="small warn">Not reached on the last run: '+st.sources.filter(s=>!s.ok).map(s=>esc(s.name)).join(", ")+' — the official site may have changed or been down.</p>':'')+
   '<div class="row gap wrap mt"><div class="seg">'+[["all","All"],["imp","Important"],["new","Unread"]].map(x=>'<button data-updonly="'+x[0]+'" class="'+(updF.only===x[0]?"on":"")+'">'+x[1]+'</button>').join("")+'</div>'+
   '<select id="updsrc"><option value="">All sources</option>'+srcs.map(s=>'<option'+(updF.src===s?" selected":"")+'>'+esc(s)+'</option>').join("")+'</select>'+
   '<select id="updtag"><option value="">All topics</option>'+tags.map(t=>'<option'+(updF.tag===t?" selected":"")+'>'+esc(t)+'</option>').join("")+'</select>'+
   '<input id="updq" placeholder="Search e.g. rice, RoDTEP, IEC…" value="'+esc(updF.q)+'" style="flex:1;min-width:180px"></div></div>';
  if(!UPD.loaded&&UPD.loading)return h+'<div class="card empty">Loading the latest rulings…</div>';
  if(!UPD.items.length)return h+'<div class="card empty">No updates available yet. They appear here once the daily collector has run, and need internet the first time.</div>';
  h+='<div class="card">'+(L.length?L.slice(0,150).map(updRow).join(""):'<p class="muted">Nothing matches these filters.</p>')+(L.length>150?'<p class="small muted">Showing 150 of '+L.length+'. Narrow the filters to see more.</p>':'')+'</div>';
  h+='<div class="card note small"><b>How the app stays current:</b> a free GitHub robot runs every day at about 7 am and 7 pm IST, reads the official lists and saves new items here. If an item shows <span class="warn">⚠ May affect</span>, read it. If it changes a rule, update one line in <a href="'+REPO_URL+'/edit/main/data/rules.json" target="_blank" rel="noopener">data/rules.json</a> (deadline months, RoDTEP end date, key rules, FTA list), or ask Claude to. Everyone using the app gets the change automatically. <a href="'+REPO_URL+'/actions" target="_blank" rel="noopener">See robot runs</a>.</div>';
  return h;
};
document.addEventListener("click",e=>{const b=e.target.closest("button,a");if(!b)return;const d=b.dataset;
  if(b.id==="updnow"){loadUpdates(true);return}
  if(b.id==="updallread"){UPD.items.forEach(i=>readSet.add(i.id));saveRead();render();return}
  if(d.updonly){updF.only=d.updonly;render();return}
  if(d.updtag){updF.tag=d.updtag;render();return}
  if(d.updread){readSet.add(d.updread);saveRead();render();return}
  if(d.updopen){readSet.add(d.updopen);saveRead();setTimeout(render,300);return}
});
document.addEventListener("input",e=>{const t=e.target;if(t.id==="updq"){updF.q=t.value;render()}});
document.addEventListener("change",e=>{const t=e.target;if(t.id==="updsrc"){updF.src=t.value;render()}if(t.id==="updtag"){updF.tag=t.value;render()}});
window.addEventListener("online",()=>loadUpdates(false));

/* ---------- PWA (web version) ---------- */
let deferredInstall=null;
window.addEventListener("beforeinstallprompt",e=>{e.preventDefault();deferredInstall=e;const b=$("#installbtn");if(b)b.hidden=false});
window.addEventListener("appinstalled",()=>{const b=$("#installbtn");if(b)b.hidden=true});
document.addEventListener("click",async e=>{if(e.target.id!=="installbtn")return;if(deferredInstall){deferredInstall.prompt();try{await deferredInstall.userChoice}catch(_){};deferredInstall=null;e.target.hidden=true}});
if("serviceWorker" in navigator&&location.protocol==="https:"){window.addEventListener("load",()=>{navigator.serviceWorker.register("sw.js").catch(()=>{})})}
/* ---------- BOOT ---------- */
render();
setTimeout(initCloud,0);
setTimeout(()=>loadUpdates(false),0);
window.__GARCHA={RULES,UPD,loadUpdates,applyRules,TERMS,PREP,decorateTerms,haveDefaults:()=>haveDefaults(),buildPlan,parseIntent,newPlanInput,finance,planText,mermaidText,planHTMLFile,get PL(){return PL},set PL(v){PL=v},S,calcExport,calcImport,calcCBM,realDue,calendar,addMonths,progress,nextSteps};
})();
