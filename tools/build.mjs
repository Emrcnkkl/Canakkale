// Paneli yayına hazırlar: veriyi okur, Google Takvim ve Moodle takvimini (iCal) ekler,
// AES-GCM ile şifreler ve _site/ klasörüne index.html + data.enc.js yazar.
// Kullanım: PANEL_PASSWORD=... node tools/build.mjs <data.js> <çıktı klasörü>
// İsteğe bağlı: GCAL_ICS_URLS (boşluk/satırla ayrılmış birden çok adres), MOODLE_ICS_URL
import fs from "node:fs";
import path from "node:path";
import vm from "node:vm";
import { webcrypto as crypto } from "node:crypto";

const [, , dataPath = "data.js", outDir = "_site"] = process.argv;
const PASSWORD = process.env.PANEL_PASSWORD || "";
if (!PASSWORD) {
  console.error("PANEL_PASSWORD yok: veri şifrelenmeden yayınlanmaz.");
  process.exit(1);
}

const ctx = { window: {} };
vm.runInNewContext(fs.readFileSync(dataPath, "utf8"), ctx);
const data = ctx.window.PANEL_DATA;
if (!data) { console.error(dataPath + " içinde window.PANEL_DATA yok."); process.exit(1); }

/* ---------- Tarih yardımcıları (Türkiye UTC+3, yaz saati yok) ---------- */
const TR_OFFSET = 3 * 3600e3;
const pad = n => String(n).padStart(2, "0");
const ymd = d => `${d.getUTCFullYear()}-${pad(d.getUTCMonth() + 1)}-${pad(d.getUTCDate())}`;
const hm = d => `${pad(d.getUTCHours())}:${pad(d.getUTCMinutes())}`;
const nowTR = new Date(Date.now() + TR_OFFSET);
const today = Date.UTC(nowTR.getUTCFullYear(), nowTR.getUTCMonth(), nowTR.getUTCDate());
const WIN_FROM = today - 7 * 864e5, WIN_TO = today + 150 * 864e5;

// iCal tarihini "Türkiye saatine göre" bir Date'e çevirir (UTC alanları yerel saati taşır).
function parseDT(value, params) {
  const m = /^(\d{4})(\d{2})(\d{2})(?:T(\d{2})(\d{2})(\d{2})?(Z)?)?$/.exec(value.trim());
  if (!m) return null;
  const allDay = params.VALUE === "DATE" || m[4] === undefined;
  let t = Date.UTC(+m[1], +m[2] - 1, +m[3], +(m[4] || 0), +(m[5] || 0));
  if (m[7] === "Z") t += TR_OFFSET; // UTC → Türkiye
  return { d: new Date(t), allDay };
}

/* ---------- Basit iCal ayrıştırıcı ---------- */
function parseICS(text) {
  const lines = text.replace(/\r\n/g, "\n").replace(/\n[ \t]/g, "").split("\n");
  const events = []; let cur = null;
  for (const line of lines) {
    if (line === "BEGIN:VEVENT") { cur = { exdates: [] }; continue; }
    if (line === "END:VEVENT") { if (cur) events.push(cur); cur = null; continue; }
    if (!cur) continue;
    const i = line.indexOf(":"); if (i < 0) continue;
    const [name, ...ps] = line.slice(0, i).split(";");
    const params = Object.fromEntries(ps.map(p => p.split("=")).map(([k, v]) => [k.toUpperCase(), v]));
    const value = line.slice(i + 1);
    const text = () => value.replace(/\\n/gi, " ").replace(/\\([,;\\])/g, "$1").trim();
    switch (name.toUpperCase()) {
      case "SUMMARY": cur.title = text(); break;
      case "LOCATION": cur.location = text(); break;
      case "DESCRIPTION": cur.desc = text(); break;
      case "CATEGORIES": cur.cat = text(); break;
      case "URL": cur.url = value.trim(); break;
      case "STATUS": cur.status = value.trim(); break;
      case "DTSTART": cur.start = parseDT(value, params); break;
      case "DTEND": cur.end = parseDT(value, params); break;
      case "RRULE": cur.rrule = Object.fromEntries(value.split(";").map(p => p.split("="))); break;
      case "EXDATE": value.split(",").forEach(v => { const x = parseDT(v, params); if (x) cur.exdates.push(ymd(x.d)); }); break;
      case "RECURRENCE-ID": cur.recurId = true; break;
    }
  }
  return events;
}

// Tekrarlayan etkinlikleri pencere içinde açar (YEARLY, WEEKLY, DAILY; BYDAY destekli).
function occurrences(ev) {
  if (!ev.start) return [];
  const s = ev.start.d.getTime();
  const dur = ev.end ? ev.end.d.getTime() - s : 0;
  const r = ev.rrule;
  if (!r) return [{ t: s, dur }];
  const out = [], until = r.UNTIL ? parseDT(r.UNTIL, {})?.d.getTime() ?? Infinity : Infinity;
  const count = r.COUNT ? +r.COUNT : Infinity, interval = +(r.INTERVAL || 1);
  const DAYS = { MO: 1, TU: 2, WE: 3, TH: 4, FR: 5, SA: 6, SU: 0 };
  let n = 0;
  const push = t => { if (t > until || n >= count) return false; n++; out.push({ t, dur }); return true; };
  if (r.FREQ === "YEARLY") {
    const d0 = new Date(s);
    for (let y = d0.getUTCFullYear(); ; y += interval) {
      const t = Date.UTC(y, d0.getUTCMonth(), d0.getUTCDate(), d0.getUTCHours(), d0.getUTCMinutes());
      if (t > WIN_TO || !push(t)) break;
    }
  } else if (r.FREQ === "WEEKLY") {
    const byday = r.BYDAY ? r.BYDAY.split(",").map(x => DAYS[x.slice(-2)]) : [new Date(s).getUTCDay()];
    const d0 = new Date(s), weekStart = s - ((d0.getUTCDay() + 6) % 7) * 864e5;
    for (let w = weekStart; w <= WIN_TO; w += 7 * 864e5 * interval) {
      for (const bd of [...byday].sort((a, b) => ((a + 6) % 7) - ((b + 6) % 7))) {
        const t = w + ((bd + 6) % 7) * 864e5;
        if (t < s) continue;
        if (!push(t)) return out;
      }
    }
  } else if (r.FREQ === "DAILY") {
    for (let t = s; t <= WIN_TO; t += 864e5 * interval) if (!push(t)) break;
  } else out.push({ t: s, dur });
  return out;
}

function expand(events) {
  const res = [];
  for (const ev of events) {
    if (ev.status === "CANCELLED" || !ev.start) continue;
    for (const o of occurrences(ev)) {
      const d = new Date(o.t);
      if (o.t < WIN_FROM || o.t > WIN_TO || ev.exdates.includes(ymd(d))) continue;
      const item = { title: ev.title || "(başlıksız)", date: ymd(d) };
      if (!ev.start.allDay) {
        item.time = hm(d);
        if (o.dur) item.endTime = hm(new Date(o.t + o.dur));
      } else if (o.dur > 864e5) {
        item.end = ymd(new Date(o.t + o.dur - 864e5)); // iCal'de bitiş günü dahil değil
      }
      if (ev.rrule && ev.rrule.FREQ !== "YEARLY") item.rec = true; // haftalık/günlük tekrar
      if (ev.location) item.location = ev.location;
      if (ev.cat) item.cat = ev.cat;
      if (ev.url) item.url = ev.url;
      res.push(item);
    }
  }
  return res.sort((a, b) => (a.date + (a.time || "")).localeCompare(b.date + (b.time || "")));
}

async function getICS(url) {
  const r = await fetch(url, { headers: { "user-agent": "panel-build/1.0" }, signal: AbortSignal.timeout(30000) });
  if (!r.ok) throw new Error("HTTP " + r.status);
  const t = await r.text();
  if (!t.includes("BEGIN:VCALENDAR")) throw new Error("iCal değil");
  return t;
}

const sync = {};
const gUrls = (process.env.GCAL_ICS_URLS || "").split(/\s+/).filter(Boolean);
if (gUrls.length) {
  try {
    const all = [];
    for (const u of gUrls) all.push(...expand(parseICS(await getICS(u))));
    // aynı başlık+tarih+saat birden çok takvimde varsa bir kez göster
    const seen = new Set();
    data.gcal = all.filter(e => { const k = e.title + e.date + (e.time || ""); if (seen.has(k)) return false; seen.add(k); return true; })
      .sort((a, b) => (a.date + (a.time || "")).localeCompare(b.date + (b.time || "")));
    sync.gcal = "ok";
    console.log(`Google Takvim: ${data.gcal.length} etkinlik`);
  } catch (e) { sync.gcal = "hata"; console.warn("Google Takvim alınamadı:", e.message); }
}
if (process.env.MOODLE_ICS_URL) {
  try {
    data.moodle = expand(parseICS(await getICS(process.env.MOODLE_ICS_URL)))
      .map(e => ({ title: e.title.replace(/\s+(is due|son teslim tarihi|teslim tarihi)$/i, ""), course: e.cat || "", date: e.date, time: e.time, url: e.url }));
    sync.moodle = "ok";
    console.log(`Moodle: ${data.moodle.length} etkinlik`);
  } catch (e) { sync.moodle = "hata"; console.warn("Moodle takvimi alınamadı:", e.message); }
}
data.sync = sync;
data.built = new Date().toISOString();

/* ---------- Şifreleme ---------- */
const SALT = "canakkale-panel-v1", ITER = 310000;
const base = await crypto.subtle.importKey("raw", new TextEncoder().encode(PASSWORD), "PBKDF2", false, ["deriveKey"]);
const key = await crypto.subtle.deriveKey({ name: "PBKDF2", salt: new TextEncoder().encode(SALT), iterations: ITER, hash: "SHA-256" },
  base, { name: "AES-GCM", length: 256 }, false, ["encrypt"]);
const iv = crypto.getRandomValues(new Uint8Array(12));
const ct = await crypto.subtle.encrypt({ name: "AES-GCM", iv }, key, new TextEncoder().encode(JSON.stringify(data)));
const b64 = u => Buffer.from(u).toString("base64");

fs.mkdirSync(outDir, { recursive: true });
fs.writeFileSync(path.join(outDir, "data.enc.js"),
  `window.PANEL_ENC=${JSON.stringify({ v: 1, salt: SALT, iter: ITER, iv: b64(iv), ct: b64(new Uint8Array(ct)) })};\n`);
fs.copyFileSync("index.html", path.join(outDir, "index.html"));
fs.writeFileSync(path.join(outDir, ".nojekyll"), "");
console.log(`Şifreli site hazır: ${outDir}/ (index.html, data.enc.js)`);
