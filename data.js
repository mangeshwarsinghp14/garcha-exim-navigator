/* ===== GARCHA EXIM NAVIGATOR — KNOWLEDGE BASE (verified Nov 2026) ===== */
let ASOF = "15 Nov 2026";

const LINKS = {
  dgft:"https://www.dgft.gov.in", icegate:"https://www.icegate.gov.in", gst:"https://www.gst.gov.in",
  udyam:"https://udyamregistration.gov.in", itp:"https://www.indiantradeportal.in", tradeconnect:"https://trade.gov.in",
  fieo:"https://www.fieo.org", ecgc:"https://www.ecgc.in", exim:"https://www.eximbankindia.in", cbic:"https://www.cbic.gov.in",
  tradestat:"https://tradestat.commerce.gov.in", trademap:"https://www.trademap.org", macmap:"https://www.macmap.org",
  comtrade:"https://comtradeplus.un.org", apeda:"https://apeda.gov.in", mpeda:"https://mpeda.gov.in", foscos:"https://foscos.fssai.gov.in",
  bis:"https://www.bis.gov.in", cdsco:"https://cdsco.gov.in", rbi:"https://www.rbi.org.in", dgtr:"https://www.dgtr.gov.in",
  commerce:"https://commerce.gov.in", ecoo:"https://coo.dgft.gov.in", ebrc:"https://www.dgft.gov.in", indiapost:"https://www.indiapost.gov.in",
  sidbi:"https://www.sidbi.in", mca:"https://www.mca.gov.in", ipindia:"https://ipindia.gov.in", gem:"https://gem.gov.in"
};

/* ---------- ROADMAPS: phases -> steps ---------- */
const ROADMAP = {
 export: [
  {phase:"0 · Decide what & where", steps:[
   {id:"e01",t:"Pick your product and find its 8-digit ITC-HS code",d:"Every rule, duty, incentive and licence hangs on the HS code. Search the ITC(HS) schedule on DGFT or the Customs Tariff on CBIC. Write down the 8-digit code.",where:["DGFT ITC(HS)",LINKS.dgft],docs:"Product spec sheet",time:"1 day",cost:"Free",tip:"If unsure between two codes, take a CHA's opinion or apply for an advance ruling later — a wrong HS code is the #1 cause of shipping-bill queries."},
   {id:"e02",t:"Check the export policy for your HS code",d:"Schedule 2 of ITC(HS): Free / Restricted (needs DGFT licence) / Prohibited / STE (only via State Trading Enterprise). Also check SCOMET (dual-use) list if chemicals, electronics, drones etc.",where:["DGFT – Export Policy",LINKS.dgft],docs:"—",time:"1 hr",cost:"Free",tip:"Most goods are 'Free'. Onions, rice varieties, sugar, wheat often get temporary curbs — re-check before every season."},
   {id:"e03",t:"Research the best markets for that product",d:"Find who imports the most, at what price, and what tariff they charge India. Use ITC TradeMap (top importers & unit values), Market Access Map (tariffs), Tradestat (India's own export data). Prefer FTA partners (UAE, UK, Australia, EFTA, Oman) for duty advantage.",where:["ITC TradeMap",LINKS.trademap],docs:"—",time:"3–7 days",cost:"Free (registration)",tip:"Shortlist 3 countries: one big, one FTA, one near (GCC/SAARC). See the Markets tab for FTA status."},
   {id:"e04",t:"Check product-specific rules (India + destination)",d:"Agri → APEDA; marine → MPEDA; spices → Spices Board; food → FSSAI + destination food law; plants → phytosanitary; textiles → AEPC/EPCH; drugs → CDSCO/WHO-GMP; electronics → CE/FCC/UKCA abroad. Destination may need labelling, testing, registration (e.g. US FDA facility registration).",where:["Indian Trade Portal – market rules",LINKS.itp],docs:"—",time:"2–5 days",cost:"Varies",tip:"Indian Trade Portal shows the destination's tariff + SPS/TBT requirements for your HS code — free and underused."},
   {id:"e05",t:"Decide model: Manufacturer-exporter or Merchant-exporter",d:"Merchant exporter = you buy from Indian makers and export under your IEC. Suppliers can bill you at concessional 0.1% GST if goods are exported within 90 days (Notification 40/2017-CT(Rate)) — keeps working capital free.",where:null,docs:"—",time:"—",cost:"—",tip:"Starting out, merchant export is lower-risk: no factory, no capex. Use clusters (Procure tab)."}
  ]},
  {phase:"1 · Set up the business (one-time)",steps:[
   {id:"e11",t:"Form the business entity & PAN",d:"Proprietorship (fastest), Partnership/LLP or Pvt Ltd (MCA). Get PAN in entity name.",where:["MCA (for LLP/Company)",LINKS.mca],docs:"PAN, Aadhaar, address proof",time:"1–15 days",cost:"₹0–₹15,000",tip:"Proprietorship is fine to start; convert to LLP/Pvt Ltd when volumes or partners grow."},
   {id:"e12",t:"Open a current account with an Authorised Dealer (AD Category-I) bank",d:"Must be a bank that handles forex (most big banks). Ask for: AD code letter, EEFC account, export finance (packing credit) desk.",where:null,docs:"Entity docs, PAN, GST (if ready)",time:"2–7 days",cost:"Min balance",tip:"Choose a branch with an active trade-finance/forex desk — ask them how many exporters they service."},
   {id:"e13",t:"GST registration",d:"Required for exports (zero-rated supply). Exports are inter-state supply, so registration is needed regardless of turnover.",where:["GST portal",LINKS.gst],docs:"PAN, Aadhaar, address proof, bank proof, photo",time:"3–7 days",cost:"Free",tip:"Add 'export' related HSN codes in your GST registration."},
   {id:"e14",t:"Udyam (MSME) registration",d:"Free, Aadhaar-based. Unlocks MSME benefits in EPM schemes, priority lending, collateral-free credit.",where:["Udyam portal",LINKS.udyam],docs:"Aadhaar, PAN, GSTIN",time:"Same day",cost:"Free",tip:"Many Export Promotion Mission benefits are MSME-targeted."},
   {id:"e15",t:"Get IEC (Importer-Exporter Code) from DGFT",d:"10-digit (same as PAN). Mandatory for any export/import. Apply online on DGFT. Must be UPDATED EVERY YEAR between April and June even if nothing changed, or it gets de-activated.",where:["DGFT – Apply IEC",LINKS.dgft],docs:"PAN, address proof, cancelled cheque/bank cert",time:"Same day–2 days",cost:"₹500",tip:"Put the April–June IEC update in your compliance calendar (app does this automatically)."},
   {id:"e16",t:"Get a Class-3 Digital Signature (DSC)",d:"Needed for ICEGATE and DGFT e-filing.",where:null,docs:"PAN, Aadhaar",time:"1 day",cost:"₹1,500–₹3,000",tip:"Buy the combo signing+encryption DSC."},
   {id:"e17",t:"Register on ICEGATE + register AD code at the port(s)",d:"ICEGATE = Customs e-portal. Register your AD bank code (bank letter) at each port/ICD you'll ship from, and your bank account for drawback/IGST refund credits (PFMS validation).",where:["ICEGATE",LINKS.icegate],docs:"AD code letter from bank, IEC, DSC",time:"2–5 days",cost:"Free",tip:"Without AD code registration your shipping bill cannot be filed. Ask your CHA to do it at the port."},
   {id:"e18",t:"Get RCMC from the relevant Export Promotion Council (EPC)",d:"Registration-cum-Membership Certificate. Needed to claim most FTP benefits (Advance Authorisation, EPCG, EPM schemes). Choose your product's EPC (e.g. EEPC, AEPC, EPCH, CHEMEXCIL, Pharmexcil, APEDA, Spices Board) or FIEO if multi-product. Valid 5 years.",where:["DGFT – RCMC (common digital platform)",LINKS.dgft],docs:"IEC, entity docs, fee",time:"3–10 days",cost:"₹5,000–₹25,000 + GST/yr",tip:"EPC membership also gives buyer enquiries, fair subsidies and trade notices — use them."},
   {id:"e19",t:"File GST LUT (Letter of Undertaking) for the year",d:"Form GST RFD-11 on GST portal. Lets you export WITHOUT paying IGST (no refund wait). Must be filed every financial year, ideally before 1 April.",where:["GST portal – RFD-11",LINKS.gst],docs:"GSTIN login",time:"1 hr",cost:"Free",tip:"Alternative: pay IGST and get auto-refund via shipping bill. LUT is better for cash flow."},
   {id:"e110",t:"Product registrations (if your product needs them)",d:"APEDA RCMC (scheduled agri products), FSSAI licence (food), MPEDA (marine), Spices Board CRES, Tea/Coffee/Rubber boards, Drug manufacturing licence, BIS (some goods), CITES (wildlife-derived), Kimberley (rough diamonds).",where:["APEDA",LINKS.apeda],docs:"Varies",time:"1–6 weeks",cost:"Varies",tip:"Agri exporters: APEDA's farmer-connect + traceability (e.g. GrapeNet/HortiNet) is mandatory for some EU-bound produce."},
   {id:"e111",t:"(Optional) Trademark your brand",d:"Apply on IP India. Consider Madrid Protocol for overseas protection in key markets.",where:["IP India",LINKS.ipindia],docs:"Logo, entity docs",time:"Application same day",cost:"₹4,500 (MSME/individual)",tip:"Register before you show your brand at fairs."}
  ]},
  {phase:"2 · Find buyers & price right",steps:[
   {id:"e21",t:"Build export price sheet (EXW / FOB / CIF)",d:"Use the Calculators tab. Never quote without knowing your FOB floor. Include inland freight, CHA, port, bank charges, ECGC, profit. Decide whether to pass RoDTEP/drawback to buyer.",where:null,docs:"Cost sheet",time:"1 day",cost:"—",tip:"Quote FOB/FCA for new buyers. For containerised cargo FCA is technically better (risk passes at the terminal). Avoid EXW — you still need the shipping bill in your name for incentives. Quote CIF/CFR only when you have reliable freight rates."},
   {id:"e22",t:"Make export-ready catalogue, samples, website/WhatsApp Business",d:"Spec sheet with HS code, MOQ, packing, lead time, certifications, photos. Prepare sample kits.",where:null,docs:"—",time:"1–2 weeks",cost:"Low",tip:"Include 'Incoterms 2020' and payment terms on your catalogue to look professional."},
   {id:"e23",t:"Get leads: EPC enquiries, DGFT Trade Connect, B2B portals, Indian Missions",d:"See Procure & Sell tab for full list: Trade Connect e-platform, Indian Embassy commercial wings, Alibaba/Amazon Global Selling, LinkedIn, trade data (importer lists).",where:["Trade Connect",LINKS.tradeconnect],docs:"—",time:"Ongoing",cost:"Free–paid",tip:"Importer lists from trade-data sites (shipments by HS code) are the most targeted leads."},
   {id:"e24",t:"Attend / exhibit at a trade fair or buyer-seller meet",d:"EPC-led India pavilions are subsidised. Export Promotion Mission – Niryat Disha (Market Access Support) supports fairs, BSMs, delegations.",where:["DGFT – EPM",LINKS.dgft],docs:"RCMC",time:"Per event",cost:"Subsidised",tip:"Book through your EPC to get the subsidy."},
   {id:"e25",t:"Verify the buyer before accepting the order",d:"ECGC buyer credit limit / status report, D&B report, company registry check, bank reference, Google/LinkedIn. For risky markets insist on advance or confirmed LC.",where:["ECGC",LINKS.ecgc],docs:"Buyer details",time:"3–10 days",cost:"Small fee",tip:"Red flags: free-email domain, urgency, asks to pay 'registration' fees, LC from unknown bank."},
   {id:"e26",t:"Send samples (courier / Dak Ghar Niryat Kendra)",d:"Courier export value cap per consignment was withdrawn from 1 Apr 2026. India Post DNKs handle small e-commerce/sample exports with customs at the post office.",where:["India Post",LINKS.indiapost],docs:"Invoice, IEC",time:"3–10 days",cost:"Varies",tip:"Mark 'Sample – no commercial value' only when truly free; otherwise invoice normally."}
  ]},
  {phase:"3 · Close the deal safely",steps:[
   {id:"e31",t:"Send quotation → Proforma Invoice (PI)",d:"PI states product, HS, qty, price, Incoterm 2020 + named place, currency, payment terms, delivery time, validity, bank details.",where:null,docs:"Proforma Invoice",time:"Same day",cost:"—",tip:"Specify 'Incoterms® 2020' explicitly, e.g. 'FOB Nhava Sheva, Incoterms 2020'."},
   {id:"e32",t:"Sign a written sales contract / purchase order",d:"Key clauses: specs & tolerance, quality/inspection, packing & marking, delivery, payment, documents list, insurance, force majeure, claims window, governing law, arbitration seat (e.g. Singapore/India), currency.",where:null,docs:"Sales contract / PO",time:"1–5 days",cost:"Lawyer (optional)",tip:"India is not party to CISG — always name governing law and arbitration in the contract."},
   {id:"e33",t:"Fix payment terms (safest first)",d:"Advance → Confirmed LC → LC → D/P (CAD) → D/A → Open account. New buyer: 30–50% advance + balance against documents or LC at sight.",where:null,docs:"—",time:"—",cost:"—",tip:"Contracts can now be invoiced in INR (outside Nepal/Bhutan) and still earn FTP benefits (FTP amended Aug 2026)."},
   {id:"e34",t:"If LC: scrutinise it the day you receive it",d:"Check: expiry & shipment dates realistic, port names, partial/transhipment, documents list feasible, no 'soft' clauses, issuing bank rating, UCP 600 applies. Ask for amendments BEFORE shipping.",where:null,docs:"Letter of Credit",time:"1–2 days",cost:"Bank charges",tip:"Most LC rejections are document discrepancies — prepare docs exactly as the LC says, spelling included."},
   {id:"e35",t:"Take ECGC cover (for credit / non-advance sales)",d:"ECGC Shipment policy covers buyer & country risk (~80–90%). Banks offer better finance against ECGC-covered receivables.",where:["ECGC",LINKS.ecgc],docs:"Proposal, buyer limit",time:"1–2 weeks",cost:"Premium ~0.1–1% of value",tip:"Credit limit on each buyer must be approved before shipment."},
   {id:"e36",t:"Arrange pre-shipment finance if needed",d:"Packing Credit (INR) or PCFC (foreign currency, cheaper) from your AD bank against the order/LC. Check Export Promotion Mission interest subvention & collateral support (Niryat Protsahan) and the Credit Guarantee Scheme for Exporters.",where:["DGFT – EPM Niryat Protsahan",LINKS.dgft],docs:"Order/LC, RCMC, financials",time:"1–3 weeks",cost:"Interest",tip:"See Finance tab for every option."}
  ]},
  {phase:"4 · Procure / produce & pack",steps:[
   {id:"e41",t:"Source goods or raw material",d:"Raise POs to suppliers; for merchant export ask them to invoice at 0.1% GST (merchant-export notification) — you must export within 90 days and give them proof.",where:null,docs:"PO, supplier invoice",time:"Per order",cost:"Goods",tip:"Agree inspection rights and penalty for delay with suppliers too."},
   {id:"e42",t:"Quality check & pre-shipment inspection",d:"Own QC + third-party (SGS, Intertek, Bureau Veritas, TÜV, QIMA) if buyer/LC demands. Export Inspection Council (EIC) certificate is compulsory for some foods/products to certain markets.",where:null,docs:"Inspection certificate",time:"1–3 days",cost:"₹5k–₹40k",tip:"Photos/videos of goods + packing during stuffing save many disputes."},
   {id:"e43",t:"Export packing, marking & labelling",d:"Seaworthy cartons, palletise; wooden packing must be ISPM-15 heat-treated/fumigated & stamped. Shipping marks: buyer, PO no, carton no x/y, net/gross wt, origin 'Made in India'. Destination labelling laws (language, ingredients, barcodes).",where:null,docs:"Packing list, fumigation cert",time:"1–3 days",cost:"Varies",tip:"Packing list must match invoice and LC exactly."}
  ]},
  {phase:"5 · Logistics & customs clearance",steps:[
   {id:"e51",t:"Appoint a licensed Customs Broker (CHA) & freight forwarder",d:"CHA files shipping bill and clears goods; forwarder books ship/air space. Often the same firm. Compare 3 quotes. Share KYC (authorisation letter, IEC, GST, AD code).",where:null,docs:"KYC, authority letter",time:"1–2 days",cost:"₹3k–₹15k/shipment",tip:"Ask for an all-in quote (CHA + THC + documentation + transport) to avoid surprises."},
   {id:"e52",t:"Book freight (FCL/LCL/air) & get booking confirmation",d:"FCL if > ~15 CBM; else LCL via consolidator. Check cut-off dates, free days, vessel ETD.",where:null,docs:"Booking confirmation",time:"2–7 days before",cost:"Freight",tip:"Use the CBM calculator to pick container size."},
   {id:"e53",t:"Prepare Commercial Invoice & Packing List",d:"Invoice: exporter/IEC/GSTIN, buyer, invoice no/date, HS, description, qty, unit price, total, Incoterm, currency, LUT reference or IGST paid, bank details, declaration.",where:null,docs:"Commercial Invoice, Packing List",time:"Same day",cost:"—",tip:"Export invoice under LUT must say 'Supply meant for export under LUT without payment of IGST'."},
   {id:"e54",t:"File the Shipping Bill on ICEGATE (via CHA)",d:"The key customs declaration. Claim here: RoDTEP (yes/no), Duty Drawback, IGST refund option / LUT, scheme codes (AA/EPCG). Check checklist carefully before submission.",where:["ICEGATE",LINKS.icegate],docs:"Invoice, packing list, licences",time:"1 day",cost:"In CHA fee",tip:"If you don't tick RoDTEP in the shipping bill you lose it for that shipment — verify the CHA's checklist."},
   {id:"e55",t:"Stuffing, VGM, customs examination & LEO",d:"Factory stuffing (self-sealing/RFID e-seal) or at ICD/CFS. Submit VGM (verified gross mass) to line. Customs may examine (RMS); then Let Export Order (LEO) is granted.",where:null,docs:"VGM, e-seal",time:"1–3 days",cost:"Port/CFS charges",tip:"LEO date = date of export for FEMA realisation clock."},
   {id:"e56",t:"Insurance (if your Incoterm requires)",d:"CIF/CIP: seller insures at 110% of CIF value; ICC(A) widest. Otherwise buyer insures. Keep your own cover for inland leg.",where:null,docs:"Insurance policy/certificate",time:"Same day",cost:"~0.1–0.5%",tip:"Open marine policy is cheaper for regular shippers."},
   {id:"e57",t:"Get Bill of Lading / Airway Bill",d:"Check consignee, notify party, marks, ports, 'clean on board' notation, freight prepaid/collect. For LC, consignee usually 'To order of [bank]'.",where:null,docs:"B/L or AWB",time:"1–3 days after sailing",cost:"BL fee",tip:"Original BL = title to goods. Never release originals without payment/acceptance (unless advance received). Make sure the carrier files the EGM — drawback, RoDTEP and IGST refund only start after EGM."},
   {id:"e58",t:"Certificate of Origin & other certificates",d:"Preferential CoO (to claim FTA duty cut abroad) on DGFT e-CoO platform; non-preferential CoO from chambers/EPCs. Plus phytosanitary, health, fumigation, analysis, halal etc. as required.",where:["DGFT e-CoO",LINKS.ecoo],docs:"Invoice, BL, origin proof",time:"1–2 days",cost:"₹200–₹1,000",tip:"Under UK CETA / UAE CEPA etc. the buyer saves duty only with a valid preferential CoO — offer it, it wins orders."}
  ]},
  {phase:"6 · Get paid",steps:[
   {id:"e61",t:"Submit export documents to your AD bank (within 21 days of shipment)",d:"For LC/collection: invoice, packing list, BL, CoO, insurance, bill of exchange etc. Bank sends to buyer's bank. Shipping bill appears in bank's EDPMS automatically.",where:null,docs:"Full document set",time:"Within 21 days",cost:"Bank charges",tip:"For advance-payment exports, still submit docs so the bank closes the EDPMS entry."},
   {id:"e62",t:"Realise export proceeds within the FEMA deadline",d:"From 1 Oct 2026 (FEMA Export & Import of Goods and Services Regulations 2026): 9 months from date of shipment (goods) / invoice (services); 12 months where invoiced/settled in INR. Delays need AD bank extension.",where:["RBI – FEMA notifications",LINKS.rbi],docs:"—",time:"Track in Shipments tab",cost:"—",tip:"The app computes each shipment's due date and warns you 60 days before."},
   {id:"e63",t:"Collect FIRC/e-BRC & close EDPMS",d:"Bank issues inward remittance advice; e-BRC flows to DGFT e-BRC platform. Needed as proof of realisation for incentives and GST refund audits.",where:["DGFT e-BRC",LINKS.ebrc],docs:"e-BRC",time:"After receipt",cost:"—",tip:"Unrealised bills after deadline put you on the RBI caution list — avoid at all costs."}
  ]},
  {phase:"7 · Claim benefits & stay compliant",steps:[
   {id:"e71",t:"RoDTEP: generate & use/sell e-scrips",d:"After EGM is filed, create RoDTEP claim on ICEGATE → e-scrip credited. Use to pay import duty or sell (transferable) on market. RoDTEP is extended up to 31 Dec 2026 (rates 0.3%–3.9%, Appendix 4R/4RE).",where:["ICEGATE",LINKS.icegate],docs:"Shipping bill, EGM",time:"Weeks",cost:"—",tip:"Check rates for your HS in Appendix 4R on DGFT; watch for extension after Dec 2026."},
   {id:"e72",t:"Duty Drawback & IGST refund",d:"Drawback (All Industry Rate) credited to your bank account automatically once EGM matches. IGST refund (if you paid IGST instead of LUT) is auto-processed after GSTR-1 Table 6A/GSTR-3B match.",where:["ICEGATE – refund status",LINKS.icegate],docs:"—",time:"2–6 weeks",cost:"—",tip:"Mismatch between invoice no./value in GST returns and shipping bill = refund stuck. Keep them identical."},
   {id:"e73",t:"GST returns showing exports",d:"Report exports in GSTR-1 (Table 6A) and GSTR-3B every month/quarter.",where:["GST portal",LINKS.gst],docs:"—",time:"Monthly",cost:"CA fees",tip:"Export under LUT: also claim refund of accumulated ITC (RFD-01) if credits pile up."},
   {id:"e74",t:"Yearly: IEC update (Apr–Jun), LUT (before 1 Apr), RCMC renewal",d:"Missing IEC update de-activates IEC; missing LUT forces IGST payment.",where:["DGFT",LINKS.dgft],docs:"—",time:"Annual",cost:"Free",tip:"See Compliance calendar on Dashboard."},
   {id:"e75",t:"Keep records (at least 5–8 years)",d:"Shipping bills, invoices, BRCs, contracts, LC, correspondence. Customs, GST, DGFT and RBI can audit.",where:null,docs:"All",time:"—",cost:"—",tip:"Scan everything into one folder per shipment number."}
  ]},
  {phase:"8 · Scale up",steps:[
   {id:"e81",t:"Advance Authorisation / EPCG",d:"AA: import inputs duty-free for export production (export obligation ~18 months). EPCG: import capital goods at zero duty, EO = 6× duty saved in 6 years.",where:["DGFT – Schemes",LINKS.dgft],docs:"RCMC, SION/self-declared norms",time:"2–4 weeks",cost:"Fee",tip:"Mostly for manufacturer-exporters; merchant exporters can tie up with a supporting manufacturer."},
   {id:"e82",t:"Status Holder (Export House) recognition",d:"Based on export performance (FTP 2023 thresholds from One Star US$3M up to Five Star US$800M over current + previous 3 years). Benefits: self-certification, priority, fewer checks.",where:["DGFT",LINKS.dgft],docs:"Export performance",time:"—",cost:"—",tip:"MSMEs and certain regions get double weightage — check FTP chapter 3."},
   {id:"e83",t:"Use Export Promotion Mission schemes",d:"Niryat Protsahan (finance: interest subvention, factoring, collateral support, alternative trade instruments, emerging markets risk-sharing) + Niryat Disha (market access, TRACE certification reimbursement, logistics, warehousing, inland transport for interior districts).",where:["DGFT – EPM",LINKS.dgft],docs:"RCMC, Udyam",time:"—",cost:"—",tip:"Read the Schemes tab — reimbursement for international certifications can be large for MSMEs."},
   {id:"e84",t:"Add FTA markets & diversify buyers",d:"No single buyer >30% of sales. Use FTA access: UK (in force 15 Jul 2026), Oman (1 Jun 2026), EFTA, UAE, Australia; EU & NZ coming.",where:["Commerce – Trade agreements",LINKS.commerce],docs:"—",time:"Ongoing",cost:"—",tip:"See Markets tab."}
  ]}
 ],
 import: [
  {phase:"0 · Decide what to import",steps:[
   {id:"i01",t:"Find demand & pick product; get 8-digit HS code",d:"Check Indian demand (marketplace best-sellers, distributors, B2B enquiries) and the HS code in Customs Tariff.",where:["CBIC Customs Tariff",LINKS.cbic],docs:"—",time:"1–7 days",cost:"Free",tip:"Look at Tradestat import data to see who already imports & at what unit value."},
   {id:"i02",t:"Check IMPORT policy (Schedule 1 ITC-HS)",d:"Free / Restricted (licence needed) / Prohibited / STE. Also policy conditions (e.g. port restrictions, monitoring systems like SIMS/NFMIMS/CIMS registrations for steel, non-ferrous, coal). Goods made with forced labour are prohibited (FTP para 2.20B, 2026).",where:["DGFT ITC(HS)",LINKS.dgft],docs:"—",time:"1 hr",cost:"Free",tip:"Second-hand/refurbished goods, many electronics, toys, food have special conditions."},
   {id:"i03",t:"Check standards & licences needed in India",d:"BIS Quality Control Orders (QCO) — many products need BIS licence of the FOREIGN manufacturer; FSSAI import licence (food); CDSCO (drugs, devices, cosmetics); WPC/ETA (wireless); Legal Metrology LMPC importer registration (pre-packaged); EPR (plastic packaging, e-waste, batteries); Plant Quarantine import permit (seeds/plants).",where:["BIS",LINKS.bis],docs:"—",time:"1–3 days research",cost:"—",tip:"A missing BIS licence means goods cannot be cleared — check before paying the supplier."},
   {id:"i04",t:"Check duty, anti-dumping & compute landed cost",d:"BCD + Social Welfare Surcharge (10% of BCD) + IGST (+cess, AIDC, anti-dumping/safeguard if any). FTA origin can reduce BCD with valid CoO (CAROTAR rules). Use the Landed Cost calculator.",where:["DGTR – anti-dumping",LINKS.dgtr],docs:"—",time:"1 day",cost:"—",tip:"Anti-dumping duty on Chinese goods can be 20–100%+ — always check DGTR/CBIC notifications for your HS."}
  ]},
  {phase:"1 · Set up (one-time)",steps:[
   {id:"i11",t:"Entity, PAN, AD bank current account",d:"Same as export. The AD bank remits payment abroad and tracks Bills of Entry in IDPMS.",where:null,docs:"Entity docs",time:"1–15 days",cost:"—",tip:""},
   {id:"i12",t:"GST registration",d:"Needed to claim IGST paid at customs as input tax credit (it appears in GSTR-2B from ICEGATE).",where:["GST portal",LINKS.gst],docs:"PAN, Aadhaar, address",time:"3–7 days",cost:"Free",tip:"Without GST, IGST on imports becomes a pure cost."},
   {id:"i13",t:"IEC from DGFT (+ yearly update Apr–Jun)",d:"Mandatory for commercial imports.",where:["DGFT",LINKS.dgft],docs:"PAN, address, bank proof",time:"1–2 days",cost:"₹500",tip:""},
   {id:"i14",t:"ICEGATE registration, DSC, AD code at port",d:"For e-payment of duty and document upload (e-Sanchit).",where:["ICEGATE",LINKS.icegate],docs:"IEC, DSC, bank letter",time:"2–5 days",cost:"Free",tip:""},
   {id:"i15",t:"Product licences: FSSAI / CDSCO / BIS / LMPC / WPC / EPR / PQ",d:"Get each one your product needs (see step 0.3). LMPC (Legal Metrology Packaged Commodities) registration is needed by importers of pre-packed goods for retail.",where:["FSSAI FoSCoS",LINKS.foscos],docs:"Varies",time:"1–12 weeks",cost:"Varies",tip:"BIS for foreign manufacturers (FMCS) can take months — plan early."}
  ]},
  {phase:"2 · Find & lock the supplier",steps:[
   {id:"i21",t:"Shortlist suppliers",d:"Alibaba, Made-in-China, Global Sources, trade fairs (Canton Fair, Yiwu, Dubai, Germany), country-specific directories, Indian embassy commerce wings.",where:null,docs:"—",time:"1–3 weeks",cost:"—",tip:"Ask for business licence, export licence, factory video call, and references from other Indian buyers."},
   {id:"i22",t:"Verify supplier & test samples",d:"Third-party factory audit (QIMA, SGS, Intertek). Test samples to BIS/FSSAI standard in an Indian NABL lab if regulated.",where:null,docs:"Audit report",time:"1–3 weeks",cost:"US$200–400 audit",tip:"Never pay to a personal account or a bank account in a different name/country than the supplier."},
   {id:"i23",t:"Negotiate Incoterm, price, specs & sign PO/contract",d:"Prefer FOB (you control freight & insurance from origin port). Include specs, QC/inspection, packaging, labelling for India (MRP sticker space), delivery, penalty, payment, CoO for FTA.",where:null,docs:"PI, PO/contract",time:"1 week",cost:"—",tip:"Ask supplier to print Indian-compliant labels (importer name/address, MRP, net qty, month-year, customer care)."},
   {id:"i24",t:"Pay supplier via AD bank (advance / LC / DP)",d:"Outward remittance against PI with invoice; or open LC. Bank reports in IDPMS; you must submit Bill of Entry to bank later as evidence of import.",where:null,docs:"PI, remittance form, KYC",time:"1–3 days",cost:"Bank charges + forex margin",tip:"Pay max 30% advance; balance against copy BL or after pre-shipment inspection."}
  ]},
  {phase:"3 · Ship & clear customs",steps:[
   {id:"i31",t:"Appoint forwarder & Customs Broker (CHA) in India",d:"Share KYC, IEC, GST, licences. Book freight (if FOB) and arrange marine insurance (110% CIF).",where:null,docs:"KYC, authority letter",time:"1–2 days",cost:"Quotes",tip:""},
   {id:"i32",t:"Receive shipping documents from supplier",d:"Commercial invoice, packing list, BL/AWB, CoO (preferential for FTA), test/analysis certificates, insurance (if CIF).",where:null,docs:"Doc set",time:"At sailing",cost:"—",tip:"Check invoice value = contract; under-invoicing is a customs offence."},
   {id:"i33",t:"File Bill of Entry (advance/prior filing)",d:"Advance filing is allowed up to 30 days before expected arrival; the outer limit is the end of the day before arrival, else late-filing charges apply. Declare your GSTIN on the BoE (otherwise IGST credit is blocked). Upload supporting docs on e-Sanchit. Types: home consumption, warehousing, ex-bond.",where:["ICEGATE",LINKS.icegate],docs:"Invoice, PL, BL, licences, CoO",time:"Before arrival",cost:"CHA fee",tip:"Advance filing + duty payment lets RMS clear goods on arrival (faster, less demurrage)."},
   {id:"i34",t:"Assessment, pay duty (e-payment), examination, Out of Charge",d:"Customs assesses; you pay duty online on ICEGATE; if selected, goods examined; then 'Out of Charge'. Regulated goods also need FSSAI/PQ/drug/BIS NOCs.",where:["ICEGATE e-payment",LINKS.icegate],docs:"Challan",time:"1–3 days",cost:"Duty",tip:"Watch free days at CFS/shipping line — demurrage & detention can exceed duty."},
   {id:"i35",t:"Get Delivery Order, pay CFS charges, move goods",d:"Shipping line issues DO after freight/charges; CFS releases; transport to warehouse.",where:null,docs:"DO, gate pass",time:"1–2 days",cost:"Line + CFS charges",tip:""}
  ]},
  {phase:"4 · After clearance & selling",steps:[
   {id:"i41",t:"Submit Bill of Entry to AD bank (close IDPMS)",d:"Proof that goods for which you paid actually arrived. Do it soon after clearance.",where:null,docs:"Bill of Entry",time:"Within weeks",cost:"—",tip:"Open IDPMS items attract bank & RBI follow-ups."},
   {id:"i42",t:"Claim IGST credit (GSTR-2B / ICEGATE data)",d:"IGST paid on import shows in your GSTR-2B (IMPG). Claim in GSTR-3B.",where:["GST portal",LINKS.gst],docs:"BoE",time:"Monthly",cost:"—",tip:"BCD and SWS are NOT creditable; only IGST/cess."},
   {id:"i43",t:"Label & comply before sale",d:"Legal Metrology declarations (importer name/address, MRP incl. taxes, net qty, month-year of import/mfg, country of origin, customer care), BIS mark if QCO, FSSAI label for food, EPR.",where:null,docs:"—",time:"Before dispatch",cost:"Stickering",tip:"Country of origin must be shown on e-commerce listings too."},
   {id:"i44",t:"Sell: distributors, retail, e-commerce, GeM, B2B",d:"See Procure & Sell tab — wholesale markets, Amazon/Flipkart/Meesho, IndiaMART leads, GeM for govt buyers, own brand D2C.",where:["GeM",LINKS.gem],docs:"GST invoices",time:"Ongoing",cost:"Commissions",tip:"Price with landed cost + GST + channel fee + margin (calculator)."},
   {id:"i45",t:"Keep records & pay supplier balance on time",d:"Keep BoE, invoices, remittances, licences, test reports ≥ 5–8 years. Pay import dues within the FEMA period agreed with AD bank (generally within 6 months of shipment for goods).",where:["RBI",LINKS.rbi],docs:"—",time:"—",cost:"—",tip:""}
  ]}
 ]
};

/* ---------- DOCUMENT LIBRARY ---------- */
const DOCS = [
 // [name, side(E/I/B), stage, who issues, purpose, mandatory?, where]
 ["IEC (Importer-Exporter Code)","B","Setup","DGFT","Identity for all exports/imports; update yearly Apr–Jun","Yes","DGFT portal"],
 ["GST Registration (GSTIN)","B","Setup","GST Dept","Zero-rated exports, ITC on imports","Yes","GST portal"],
 ["LUT (Form GST RFD-11)","E","Setup","You (GST portal)","Export without paying IGST; renew every FY","If not paying IGST","GST portal"],
 ["RCMC","E","Setup","EPC / FIEO / Commodity Board","Needed to claim FTP benefits; valid 5 years","For benefits","DGFT common platform"],
 ["AD Code registration","E","Setup","Your AD bank → Customs","Links bank to shipping bills at each port","Yes","ICEGATE / port"],
 ["Udyam Certificate","B","Setup","Ministry of MSME","MSME benefits & EPM eligibility","Recommended","Udyam portal"],
 ["Digital Signature (Class 3)","B","Setup","Certifying Authority","Sign e-filings on ICEGATE/DGFT","Yes","Any CA vendor"],
 ["Proforma Invoice","B","Deal","Seller","Offer/quotation; basis for advance payment & LC","Yes","You"],
 ["Sales Contract / Purchase Order","B","Deal","Buyer & Seller","Legal terms of the deal","Strongly advised","You"],
 ["Letter of Credit (LC)","B","Deal","Buyer's bank","Bank guarantee of payment if docs comply (UCP 600)","If LC terms","Banks"],
 ["Commercial Invoice","B","Shipping","Seller","Value for customs & payment; matches PL/BL/LC","Yes","You"],
 ["Packing List","B","Shipping","Seller","Contents per package, weights, dimensions","Yes","You"],
 ["Shipping Bill","E","Customs","Exporter via CHA on ICEGATE","Export declaration; claims RoDTEP/drawback/IGST refund","Yes","ICEGATE"],
 ["Let Export Order (LEO)","E","Customs","Customs","Permission to load; date of export","Yes","ICEGATE"],
 ["VGM (Verified Gross Mass)","E","Shipping","Shipper","SOLAS rule – certified container weight","Yes (sea)","Shipping line"],
 ["Bill of Lading (B/L)","B","Shipping","Shipping line / NVOCC","Receipt, contract of carriage, title to goods","Yes (sea)","Carrier"],
 ["Airway Bill (AWB)","B","Shipping","Airline / forwarder","Air transport receipt (not title)","Yes (air)","Carrier"],
 ["Certificate of Origin – Preferential","E","Shipping","DGFT e-CoO agencies (EIC, EPCs)","Buyer gets FTA duty concession","For FTA","coo.dgft.gov.in"],
 ["Certificate of Origin – Non-preferential","E","Shipping","Chambers of Commerce / EPCs","Proof of Indian origin","If buyer/LC asks","DGFT e-CoO"],
 ["Insurance Policy / Certificate","B","Shipping","Insurer","Cargo cover (110% CIF), ICC A/B/C","CIF/CIP","Insurer"],
 ["Inspection / Quality Certificate","E","Pre-shipment","EIC / 3rd-party (SGS etc.)","Quality proof; mandatory for some goods/markets","Sometimes","Agency"],
 ["Phytosanitary Certificate","E","Pre-shipment","Plant Quarantine (PQMS)","Plants, fruits, grains, seeds","For plant products","Plant Quarantine"],
 ["Health / Veterinary Certificate","E","Pre-shipment","EIC / APEDA / Animal Quarantine","Food, meat, dairy, marine","For such goods","EIC"],
 ["Fumigation Certificate","E","Pre-shipment","Approved fumigator","Wooden packing / grains (ISPM-15)","If wood/grains","Fumigator"],
 ["Bill of Exchange (Draft)","E","Payment","Exporter","Demand for payment under LC/DP/DA","For LC/collection","You"],
 ["Bank Realisation (e-BRC / FIRA)","E","Payment","AD Bank → DGFT","Proof of export payment received","Yes","DGFT e-BRC"],
 ["RoDTEP e-scrip","E","Benefits","Customs (ICEGATE)","Transferable duty credit (rates 0.3–3.9%)","If claimed","ICEGATE"],
 ["Export Declaration Form (EDF)","E","Payment","Exporter → AD bank","Single FEMA declaration for goods, services & software under the 2026 regulations (shipping-bill data serves for goods at EDI ports – confirm with AD bank)","Yes","AD bank"],
 ["Import General Manifest (IGM)","I","Customs","Carrier","Cargo manifest filed before arrival","Carrier files","ICEGATE"],
 ["Bill of Entry","I","Customs","Importer via CHA","Import declaration for assessment & duty","Yes","ICEGATE"],
 ["Duty payment challan","I","Customs","ICEGATE e-payment","Proof of duty paid","Yes","ICEGATE"],
 ["Out of Charge order","I","Customs","Customs","Goods cleared for home use","Yes","ICEGATE"],
 ["Delivery Order (DO)","I","Logistics","Shipping line/airline","Release instruction to CFS/terminal","Yes","Carrier"],
 ["FSSAI Import Licence / NOC","I","Licence","FSSAI","Food imports clearance","Food","FoSCoS"],
 ["BIS Licence (QCO goods)","I","Licence","BIS","Mandatory standard for notified goods","QCO items","BIS"],
 ["LMPC Registration","I","Licence","Legal Metrology","Importer of pre-packaged commodities","Pre-packed retail","Legal Metrology"],
 ["CDSCO Registration/Import Licence","I","Licence","CDSCO","Drugs, devices, cosmetics","Such goods","CDSCO SUGAM"],
 ["WPC / ETA approval","I","Licence","DoT WPC wing","Wireless/Bluetooth/Wi-Fi devices","Wireless","Saral Sanchar"],
 ["EPR Registration","I","Licence","CPCB","Plastic packaging, e-waste, batteries, tyres","Those goods","CPCB portal"],
 ["Import Licence (Restricted items)","I","Licence","DGFT","Required for 'Restricted' HS codes","If restricted","DGFT"]
];

/* ---------- FINANCE ---------- */
const FIN = {
 pay:[
  ["Advance payment","Lowest risk for exporter","Buyer pays before shipment (full or part). Shipment against advance must follow within the period allowed by FEMA/AD bank.","New buyers, small orders, risky countries"],
  ["Confirmed LC","Very low","An Indian/strong bank adds its guarantee to the buyer bank's LC. Covers buyer + country + bank risk.","Large orders, unknown buyer banks"],
  ["Irrevocable LC at sight","Low","Buyer's bank pays when compliant documents are presented (UCP 600). Risk = discrepancies & issuing-bank risk.","Standard for new relationships"],
  ["Usance LC","Low–Medium","Same as LC but payment after X days; can be discounted.","Buyer wants credit"],
  ["D/P (Documents against Payment / CAD)","Medium","Bank releases docs only when buyer pays. Risk: buyer refuses to take goods.","Known buyers"],
  ["D/A (Documents against Acceptance)","High","Buyer accepts bill and takes goods; pays later. Use with ECGC cover.","Trusted repeat buyers"],
  ["Open account","Highest","Goods + docs sent directly; buyer pays later. Use ECGC + factoring.","Long relationships, big retailers"]
 ],
 credit:[
  ["Packing Credit (PC) – INR","Pre-shipment","Bank loan to buy/produce/pack goods against confirmed order/LC. Liquidated by export proceeds."],
  ["PCFC – foreign currency","Pre-shipment","Packing credit in USD/EUR at lower international rates; repaid by export receipts."],
  ["Post-shipment credit / Bill discounting (EBRD)","Post-shipment","Bank advances against export bills until buyer pays."],
  ["Export factoring","Post-shipment","Sell receivables to a factor (with/without recourse); supported under EPM – Niryat Protsahan."],
  ["Forfaiting","Post-shipment","Non-recourse discounting of medium-term receivables (EXIM Bank & banks)."],
  ["Credit Guarantee Scheme for Exporters (CGSE)","Guarantee","₹20,000 crore government credit guarantee to help exporters get collateral-free additional credit."],
  ["Interest subvention (EPM – Niryat Protsahan)","Subsidy","Interest support on pre- and post-shipment rupee credit for eligible MSME exporters (replaced the old Interest Equalisation Scheme)."],
  ["Collateral support for export credit (EPM)","Guarantee","Partial collateral cover so MSMEs can borrow with less security (DGFT Trade Notice 21/2025-26)."],
  ["EXIM Bank lines & buyer's credit","Term finance","For project exports, overseas buyers, capacity building."],
  ["SIDBI / NBFC trade finance","Working capital","MSME-oriented lending; also TReDS for domestic receivables."]
 ],
 risk:[
  ["ECGC Shipment (Comprehensive Risks) policy","Covers non-payment due to buyer insolvency/default or country risk (war, transfer restrictions). Need credit limit per buyer."],
  ["ECGC ECIB (for banks)","Covers banks' export credit; makes your bank more willing to lend."],
  ["Forex hedging – forward contracts","Lock today's rate for a future receipt. Book with your AD bank against the order."],
  ["EEFC account","Keep part of export earnings in foreign currency to pay future imports — avoids double conversion."],
  ["Marine cargo insurance","ICC(A) all-risks; insure at 110% of CIF; open/annual policies for regular shippers."]
 ]
};

/* ---------- SCHEMES ---------- */
const SCHEMES = [
 {n:"RoDTEP",c:"Duty remission",s:"Active till 31 Dec 2026",d:"Refunds embedded taxes/duties as % of FOB (0.3%–3.9%, with per-unit caps). Claim in shipping bill → e-scrip on ICEGATE; transferable. Applies to DTA, AA, SEZ, EOU (Appendix 4R/4RE). Extended by DGFT Notification 41/2026-27 dated 30 Sep 2026.",who:"Most exporters",l:LINKS.dgft},
 {n:"Duty Drawback (AIR)",c:"Duty refund",s:"Active",d:"Refund of customs/central excise duties on inputs at All Industry Rates notified by CBIC; credited to bank after EGM.",who:"Exporters of goods with drawback rates",l:LINKS.cbic},
 {n:"RoSCTL",c:"Textiles",s:"Check DGFT for current validity",d:"Rebate of State & Central taxes for apparel & made-ups (chapters 61, 62, 63).",who:"Garments & made-ups",l:LINKS.dgft},
 {n:"Advance Authorisation (AA)",c:"Duty exemption",s:"Active (FTP 2023 Ch. 4)",d:"Duty-free import of inputs physically incorporated in exports; export obligation usually 18 months.",who:"Manufacturer-exporters",l:LINKS.dgft},
 {n:"EPCG",c:"Capital goods",s:"Active (FTP 2023 Ch. 5)",d:"Zero-duty import of capital goods; export obligation = 6× duty saved within 6 years.",who:"Manufacturers/service providers",l:LINKS.dgft},
 {n:"EOU / SEZ",c:"Zones",s:"Active",d:"Duty-free procurement, single-window, export-focused units.",who:"100% export units",l:LINKS.commerce},
 {n:"Export Promotion Mission – Niryat Protsahan",c:"Finance (₹10,401 cr)",s:"Rolling out 2025-26 to 2030-31",d:"Interest subvention on pre/post-shipment credit, export factoring, collateral support, alternative trade instruments, support for emerging export opportunities (risk sharing in new markets), e-commerce credit.",who:"MSME exporters (mostly)",l:LINKS.dgft},
 {n:"Export Promotion Mission – Niryat Disha",c:"Market access (₹14,659 cr)",s:"Rolling out",d:"Market Access Support (fairs, BSMs, delegations), TRACE (reimbursement of testing/certification/accreditation costs – MSME limit raised to ₹50 lakh, July 2026), logistics & overseas warehousing, inland transport reimbursement for interior districts, trade intelligence, branding & packaging.",who:"All exporters, MSME focus",l:LINKS.dgft},
 {n:"Credit Guarantee Scheme for Exporters",c:"Guarantee (₹20,000 cr)",s:"Active",d:"Govt guarantee for additional collateral-free credit to exporters.",who:"Exporters incl. MSMEs",l:LINKS.dgft},
 {n:"Status Holder (Export House)",c:"Recognition",s:"FTP 2023",d:"One Star (US$3M) → Five Star (US$800M); self-certification, faster clearances.",who:"Established exporters",l:LINKS.dgft},
 {n:"Districts as Export Hubs / ODOP",c:"Local support",s:"Active",d:"District export action plans, district-level export committees, cluster support.",who:"Local producers",l:LINKS.dgft},
 {n:"Dak Ghar Niryat Kendra & e-commerce exports",c:"Small exporters",s:"Active",d:"Post-office export hubs; courier value cap per consignment withdrawn from 1 Apr 2026.",who:"Artisans, D2C sellers",l:LINKS.indiapost},
 {n:"Rupee invoicing parity",c:"Policy",s:"FTP amended 20 Aug 2026",d:"Exports invoiced/settled in INR (except to Nepal & Bhutan) get same FTP benefits and count for export obligation. FEMA allows 12 months realisation for INR-invoiced exports.",who:"Everyone",l:LINKS.dgft}
];

/* ---------- MARKETS / FTAs ---------- */
const FTAS = [
 ["UAE","CEPA","In force 1 May 2022","~90%+ lines duty-free; Gulf gateway"],
 ["Australia","ECTA","In force 29 Dec 2022","100% of Indian exports duty-free from 1 Jan 2026; CECA upgrade under talks"],
 ["EFTA (Switzerland, Norway, Iceland, Liechtenstein)","TEPA","In force 1 Oct 2025","92.2% lines; US$100bn investment commitment"],
 ["Oman","CEPA","In force 1 Jun 2026","98.08% of Oman's lines duty-free (99.38% of India's exports by value)"],
 ["United Kingdom","CETA","In force 15 Jul 2026","Duty-free on ~99% of India's exports by value"],
 ["European Union","FTA","Concluded 27 Jan 2026 – ratification pending","97% of EU lines once in force"],
 ["New Zealand","FTA","In force 20 Oct 2026","100% of Indian exports duty-free; e-CoO via DGFT"],
 ["ASEAN","AITIGA","In force (review ongoing)","Check rules of origin carefully"],
 ["Japan","CEPA","In force 2011",""],
 ["South Korea","CEPA","In force 2010","Upgrade talks"],
 ["Singapore","CECA","In force 2005",""],
 ["Malaysia","CECA","In force 2011",""],
 ["Mauritius","CECPA","In force 2021",""],
 ["SAARC","SAFTA","In force",""],
 ["Chile / Mercosur / APTA","PTA","In force","Limited lines"],
 ["USA","Interim trade framework (Feb 2026)","Not an FTA","US reciprocal tariff on most Indian goods cut to 18% (Feb 2026); Nov 2026 reports of a permanent 10% rate on ~70% of exports — verify the current rate for your HS code before quoting"]
];

/* ---------- PROCURE & SELL ---------- */
const CLUSTERS = [
 ["Ludhiana (PB)","Hosiery & knitwear, bicycle & auto parts, hand tools, sewing machines"],["Jalandhar (PB)","Sports goods, hand tools, leather"],["Amritsar (PB)","Textiles, food processing, Attari ICP land route"],["Punjab/Haryana belt","Basmati rice, agri machinery"],["Panipat (HR)","Home textiles, recycled yarn, rugs"],["Tiruppur (TN)","Cotton knitwear"],["Surat (GJ)","Diamonds, synthetic textiles"],["Rajkot/Morbi (GJ)","Engineering, ceramic tiles"],["Moradabad (UP)","Brass & metal handicrafts"],["Agra/Kanpur (UP)","Footwear, leather"],["Firozabad (UP)","Glassware, bangles"],["Bhadohi-Mirzapur (UP)","Hand-knotted carpets"],["Jaipur (RJ)","Gems & jewellery, handicrafts, block prints"],["Kochi/Kerala","Spices, seafood, coir"],["Nashik (MH)","Grapes, onions"],["Ratnagiri (MH)","Alphonso mango, cashew"],["Hyderabad/Ahmedabad/Baddi","Pharma & APIs"],["Bengaluru/Chennai","Auto, electronics, engineering"]
];
const SOURCES_EXPORT = [
 ["Your EPC & Commodity Board","Supplier/manufacturer directories, buyer enquiries","—"],
 ["IndiaMART / TradeIndia / Udaan","Domestic manufacturers & wholesalers (verify GST & factory)","https://www.indiamart.com"],
 ["ODOP / District Export Hubs","GI-tagged & district products direct from producers","https://www.dgft.gov.in"],
 ["Industrial clusters (table above)","Best price/quality from specialised clusters","—"],
 ["Farmer Producer Organisations (FPOs)","Agri produce with traceability (APEDA farmer connect)","https://apeda.gov.in"],
 ["GeM sellers list","Pre-verified MSME manufacturers","https://gem.gov.in"]
];
const BUYERS = [
 ["DGFT Trade Connect e-platform","Govt platform linking exporters, Indian Missions, EPCs, banks","https://trade.gov.in"],
 ["Indian Trade Portal","Market-wise tariffs, SPS/TBT rules, opportunities","https://www.indiantradeportal.in"],
 ["Indian Embassies / Missions – commercial wing","Buyer lists, trade enquiries, business meetings","—"],
 ["EPC buyer-seller meets & India pavilions","Subsidised fairs (EPM Market Access Support)","https://www.fieo.org"],
 ["International fairs","Gulfood (Dubai), Canton (China), Ambiente & Heimtextil (Frankfurt), Anuga (Cologne), SIAL (Paris), MAGIC (Las Vegas), Big 5 (Dubai)","—"],
 ["B2B marketplaces","Alibaba.com, Global Sources, TradeKey, Go4WorldBusiness, Kompass, ExportersIndia","https://www.alibaba.com"],
 ["E-commerce exports","Amazon Global Selling, eBay, Etsy, Shopify + DNK/courier","https://sell.amazon.in/grow-your-business/amazon-global-selling"],
 ["Trade-data importer lists","Shipment records by HS code (Volza, Panjiva, ImportGenius, Seair) – find who already imports your product","—"],
 ["Market research","ITC TradeMap, Market Access Map, UN Comtrade, WITS, Tradestat","https://www.trademap.org"],
 ["LinkedIn & industry associations abroad","Direct outreach to importers/distributors","https://www.linkedin.com"]
];
const IMPORT_SOURCING = [
 ["Alibaba.com / 1688 (via agent)","Huge supplier base; use Trade Assurance & inspection","https://www.alibaba.com"],
 ["Made-in-China.com / Global Sources","Verified manufacturers, audited profiles","https://www.made-in-china.com"],
 ["Canton Fair, Yiwu market, Hong Kong fairs","Meet suppliers in person","https://www.cantonfair.org.cn"],
 ["Germany/Japan/Korea/Taiwan fairs","Machinery, precision, electronics","—"],
 ["UAE (Dubai) re-export hubs","Fast sourcing, mixed origin — check origin rules","—"],
 ["Inspection agencies","QIMA, SGS, Intertek, Bureau Veritas, TÜV","https://www.qima.com"]
];
const SELL_IN_INDIA = [
 ["Distributors & wholesalers","Wholesale markets (Delhi Sadar Bazar/Chandni Chowk, Mumbai Crawford/Lohar Chawl, Ludhiana, Surat)"],
 ["Marketplaces","Amazon, Flipkart, Meesho, JioMart, Myntra, Nykaa (need GST, LMPC, compliance labels, country of origin)"],
 ["B2B leads","IndiaMART, TradeIndia, Udaan"],
 ["Government buyers","GeM (Government e-Marketplace)"],
 ["Own brand / D2C","Shopify/WooCommerce + Instagram/WhatsApp; register trademark"],
 ["Industrial buyers","Direct to factories (for raw material/machinery imports)"]
];

/* ---------- LEGAL ---------- */
const LEGAL = [
 ["Foreign Trade (Development & Regulation) Act, 1992","Base law for FTP, IEC, licensing, penalties by DGFT."],
 ["Foreign Trade Policy 2023 (+ Handbook of Procedures)","Open-ended policy, amended by notifications. 2026 changes: forced-labour import ban (para 2.20B), INR-invoiced exports get full benefits (paras 2.52/2.53, Aug 2026), courier export value cap withdrawn (Apr 2026)."],
 ["Customs Act, 1962 & Customs Tariff Act, 1975","Shipping Bill/Bill of Entry, valuation, duty, confiscation & penalties for mis-declaration."],
 ["Customs Valuation Rules (2007 imports / 2007 exports)","Transaction value; for imports if freight unknown take 20% of FOB, insurance unknown 1.125% of FOB. The old notional 1% landing charge was dropped from 26 Sep 2017 (Notification 91/2017-Customs NT)."],
 ["CAROTAR, 2020","Rules of origin for claiming FTA concessions on imports — importer must possess origin information."],
 ["FEMA, 1999 + FEMA (Export & Import of Goods and Services) Regulations, 2026","Effective 1 Oct 2026: unified regime. Export realisation 9 months (12 months if INR-invoiced/settled); EDPMS/IDPMS; set-off rules; services use Export Declaration Form."],
 ["CGST / IGST Acts","Exports = zero-rated (LUT or IGST refund); IGST on imports creditable; merchant export at 0.1% GST."],
 ["Legal Metrology Act 2009 & Packaged Commodities Rules 2011","Importer registration & mandatory label declarations for pre-packed goods."],
 ["BIS Act 2016 & Quality Control Orders","Mandatory certification for notified goods (imports cannot clear without)."],
 ["Food Safety & Standards Act 2006","FSSAI import clearance, labelling; export food plants registration where required."],
 ["Drugs & Cosmetics Act 1940 / Medical Devices Rules","CDSCO licensing for imports/exports of drugs, devices, cosmetics."],
 ["Plant Quarantine Order 2003 / Livestock Importation Act","Permits & phytosanitary/vet certificates."],
 ["SCOMET (Appendix 3, ITC-HS)","Export control on dual-use goods & technology — licence needed."],
 ["Anti-dumping / Safeguard (DGTR)","Extra duties on specified imports; check before importing."],
 ["Indian Contract Act & Sale of Goods Act","Domestic contract law; for cross-border deals write governing law & arbitration (India is not party to CISG)."],
 ["Arbitration & Conciliation Act 1996","Enforcement of arbitral awards (New York Convention)."],
 ["ICC rules: Incoterms® 2020, UCP 600, URC 522, ISBP 821","Delivery terms, LC rules, collection rules, document checking standards."],
 ["Trade Marks Act 1999 / Madrid Protocol","Protect your brand at home & abroad."]
];
const INCOTERMS = [
 ["EXW","Ex Works","Buyer bears all costs/risks from your premises (incl. export clearance – awkward in India; prefer FCA).","Any"],
 ["FCA","Free Carrier","You clear export & hand to buyer's carrier at named place.","Any"],
 ["CPT","Carriage Paid To","You pay carriage to destination; risk passes at first carrier.","Any"],
 ["CIP","Carriage & Insurance Paid","CPT + you insure (ICC A, 110%).","Any"],
 ["DAP","Delivered at Place","You deliver to named place, buyer clears import.","Any"],
 ["DPU","Delivered at Place Unloaded","DAP + you unload.","Any"],
 ["DDP","Delivered Duty Paid","You pay everything incl. import duty – max risk.","Any"],
 ["FAS","Free Alongside Ship","Goods alongside vessel at port of shipment.","Sea"],
 ["FOB","Free On Board","Goods loaded on vessel; buyer pays freight & insurance. Most common for Indian exporters.","Sea"],
 ["CFR","Cost & Freight","You pay sea freight; risk passes on board.","Sea"],
 ["CIF","Cost, Insurance & Freight","CFR + you insure (min ICC C, 110%).","Sea"]
];

/* ---------- GLOSSARY ---------- */
const GLOSS = [
 ["AD Bank","Authorised Dealer Cat-I bank permitted by RBI to deal in foreign exchange."],["BCD","Basic Customs Duty."],["SWS","Social Welfare Surcharge – 10% of BCD (on most goods)."],["AIDC","Agriculture Infrastructure & Development Cess on some imports."],["IGST","Integrated GST charged on imports; creditable."],["CHA / Customs Broker","Licensed agent who files customs documents."],["CFS / ICD","Container Freight Station / Inland Container Depot."],["FCL / LCL","Full Container Load / Less than Container Load."],["THC","Terminal Handling Charges."],["Demurrage / Detention","Charges for overstaying containers at port / with you."],["EGM / IGM","Export / Import General Manifest filed by carrier."],["EDPMS / IDPMS","RBI systems tracking export bills / import payments."],["e-BRC","Electronic Bank Realisation Certificate."],["LEO","Let Export Order — customs permission to load."],["RMS","Risk Management System that decides exam/assessment."],["e-Sanchit","ICEGATE document upload."],["SION","Standard Input-Output Norms for AA."],["EO","Export Obligation."],["HS Code","Harmonised System product code (ITC-HS 8 digits in India)."],["QCO","Quality Control Order (BIS)."],["LMPC","Legal Metrology Packaged Commodities registration."],["RCMC","Registration-cum-Membership Certificate from an EPC."],["EPC","Export Promotion Council."],["ECGC","Export Credit Guarantee Corporation of India."],["PCFC","Pre-shipment Credit in Foreign Currency."],["UCP 600","ICC rules governing Letters of Credit."],["CoO","Certificate of Origin."],["VGM","Verified Gross Mass of container."],["NVOCC","Non-Vessel Operating Common Carrier (issues house BL)."],["DNK","Dak Ghar Niryat Kendra — post-office export centre."],["EPM","Export Promotion Mission (Niryat Protsahan + Niryat Disha)."],["TRACE","Trade Regulations, Accreditation & Compliance Enablement (EPM-Niryat Disha)."]
];

/* ---------- SHIPMENT STAGES ---------- */
const STAGES = {
 export:["Enquiry","PI sent","Order/PO","Payment/LC secured","Procure/Produce","Inspection & Packing","Freight booked","Shipping Bill filed","LEO & Loaded","BL/AWB received","Docs to bank","Payment realised","e-BRC","Incentives claimed"],
 import:["Supplier chosen","PI received","PO/contract","Payment/LC","Production","Pre-shipment inspection","Shipped (BL)","Bill of Entry filed","Duty paid","Out of Charge","Delivered to warehouse","BoE to bank (IDPMS)","IGST credit taken","Sold"]
};
