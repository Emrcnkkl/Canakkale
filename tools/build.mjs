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
/* ---------- Fenerbahçe maç takvimi ---------- */
const sleep = ms => new Promise(r => setTimeout(r, ms));
const getJSON = async (u, tries = 3) => {
  for (let i = 0; ; i++) {
    try {
      const r = await fetch(u, { headers: { "user-agent": "panel-build/1.0" }, signal: AbortSignal.timeout(30000) });
      if (!r.ok) throw new Error("HTTP " + r.status);
      return await r.json();
    } catch (e) { if (i >= tries) throw e; await sleep(/429/.test(e.message) ? 45000 : 3000); }
  }
};
const trTime = iso => { const d = new Date(new Date(iso).getTime() + TR_OFFSET); return { date: ymd(d), time: hm(d) }; };
const COMP = { "Turkish Super Lig": "Süper Lig", "UEFA Champions League": "Şampiyonlar Ligi", "UEFA Europa League": "Avrupa Ligi",
  "UEFA Conference League": "Konferans Ligi", "UEFA Europa Conference League": "Konferans Ligi", "Turkish Cup": "Türkiye Kupası",
  "Turkish Super Cup": "Süper Kupa", "Turkish Basketbol Super Ligi": "Basketbol Süper Ligi", "EuroLeague Basketball": "EuroLeague",
  "Turkish Volleyball League": "Efeler Ligi" };
const comp = n => COMP[n] || n || "";
const season = () => { const y = nowTR.getUTCFullYear(), m = nowTR.getUTCMonth() + 1; return m >= 7 ? [y, y + 1] : [y - 1, y]; };
const FROM = today - 21 * 864e5, TO = today + 120 * 864e5;
const inWin = date => { const t = Date.parse(date + "T00:00:00Z"); return t >= FROM && t <= TO; };

async function fbFootball() {
  const out = [];
  for (const q of ["?fixture=true", ""]) {
    const d = await getJSON("https://site.api.espn.com/apis/site/v2/sports/soccer/all/teams/436/schedule" + q);
    for (const e of d.events || []) {
      const c = e.competitions?.[0]; if (!c) continue;
      const me = c.competitors.find(x => x.team?.id === "436"), op = c.competitors.find(x => x.team?.id !== "436");
      if (!me || !op) continue;
      const { date, time } = trTime(e.date);
      const done = c.status?.type?.completed;
      const sc = x => x.score?.displayValue ?? x.score?.value ?? x.score;
      out.push({ sport: "Futbol", comp: comp(e.league?.name || c.league?.name), date, time: done ? undefined : time,
        opp: op.team.displayName, home: me.homeAway === "home", score: done ? `${sc(me)}-${sc(op)}` : undefined });
    }
  }
  return out;
}

async function fbEuroleague() {
  const [y] = season();
  const d = await getJSON(`https://api-live.euroleague.net/v2/competitions/E/seasons/E${y}/games?teamCode=ULK`);
  return (d.data || []).map(g => {
    const home = g.local?.club?.code === "ULK", me = home ? g.local : g.road, op = home ? g.road : g.local;
    const { date, time } = trTime(g.utcDate);
    return { sport: "Basketbol", comp: "EuroLeague", date, time: g.played ? undefined : time, opp: op?.club?.name || "",
      home, score: g.played ? `${me?.score}-${op?.score}` : undefined };
  });
}

// TheSportsDB (ücretsiz anahtar): tura göre çeker; bugüne en yakın turu ikili aramayla bulur.
async function fbSportsDB(leagueId, sport, teamWord, maxRound) {
  const [y1, y2] = season(), cache = new Map();
  const round = async r => {
    if (!cache.has(r)) { await sleep(2200); const d = await getJSON(`https://www.thesportsdb.com/api/v1/json/123/eventsround.php?id=${leagueId}&r=${r}&s=${y1}-${y2}`); cache.set(r, d.events || []); }
    return cache.get(r);
  };
  const firstDate = evs => evs.map(e => e.dateEvent).sort()[0];
  let lo = 1, hi = maxRound;
  const todayStr = ymd(new Date(today));
  while (lo < hi) { // bugünden sonraki ilk tur
    const mid = (lo + hi) >> 1, evs = await round(mid);
    if (!evs.length || firstDate(evs) >= todayStr) hi = mid; else lo = mid + 1;
  }
  const out = [];
  for (let r = Math.max(1, lo - 2); r <= Math.min(maxRound, lo + 8); r++) {
    for (const e of await round(r)) {
      if (!e.strEvent.includes(teamWord)) continue;
      const home = e.strHomeTeam.includes(teamWord);
      const { date, time } = e.strTimestamp ? trTime(e.strTimestamp + "Z") : { date: e.dateEvent };
      const played = e.intHomeScore != null && e.intAwayScore != null && e.intHomeScore !== "";
      out.push({ sport, comp: comp(e.strLeague), date, time: played ? undefined : time,
        opp: home ? e.strAwayTeam : e.strHomeTeam, home,
        score: played ? (home ? `${e.intHomeScore}-${e.intAwayScore}` : `${e.intAwayScore}-${e.intHomeScore}`) : undefined });
    }
  }
  return out;
}

const fb = [], fbErr = [];
for (const [name, fn] of [["futbol", fbFootball], ["euroleague", fbEuroleague],
  ["bsl", () => fbSportsDB(4475, "Basketbol", "Fenerbah", 34)], ["voleybol", () => fbSportsDB(4543, "Voleybol", "Fenerbah", 30)]]) {
  try { const r = await fn(); fb.push(...r); console.log(`Fenerbahçe ${name}: ${r.length} maç`); }
  catch (e) { fbErr.push(name); console.warn(`Fenerbahçe ${name} alınamadı:`, e.message); }
}
if (fb.length) {
  const seen = new Set();
  data.fb = fb.filter(m => inWin(m.date)).filter(m => { const k = m.sport + m.date + m.opp; if (seen.has(k)) return false; seen.add(k); return true; })
    .sort((a, b) => (a.date + (a.time || "")).localeCompare(b.date + (b.time || "")));
}
sync.fb = fbErr.length ? "eksik: " + fbErr.join(", ") : "ok";

/* ---------- Spotify kapakları ---------- */
fs.mkdirSync(path.join(outDir, "img", "spotify"), { recursive: true });
if (fs.existsSync("img")) fs.cpSync("img", path.join(outDir, "img"), { recursive: true });
for (const sp of data.spotify || []) {
  const id = /playlist\/([A-Za-z0-9]+)/.exec(sp.url || "")?.[1]; if (!id) continue;
  try {
    const o = await getJSON("https://open.spotify.com/oembed?url=" + encodeURIComponent("https://open.spotify.com/playlist/" + id), 1);
    if (!sp.title) sp.title = o.title;
    if (o.thumbnail_url) {
      const r = await fetch(o.thumbnail_url, { signal: AbortSignal.timeout(20000) });
      if (r.ok) fs.writeFileSync(path.join(outDir, "img", "spotify", id + ".jpg"), Buffer.from(await r.arrayBuffer()));
    }
  } catch (e) { console.warn("Spotify kapağı alınamadı:", id, e.message); }
  if (fs.existsSync(path.join(outDir, "img", "spotify", id + ".jpg"))) sp.cover = `img/spotify/${id}.jpg`;
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
