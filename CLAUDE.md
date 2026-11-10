# CLAUDE.md — Kişisel Panel

Emir'in kişisel kontrol paneli (Boğaziçi Bilgisayar Müh. 2. sınıf). Kullanıcıyla iletişim ve arayüz metinleri **Türkçe**dir.

## Yapı
- `index.html` — tek dosyalık sayfa (inline CSS/JS, kütüphane yok). Sekmeler: Bugün · Okul · Gelişim · Kariyer · Projeler · Kitap & Film · Finans (adreste `#okul` gibi).
  Yayında `data.enc.js` (şifreli) yüklenir ve şifre ekranı çıkar; yerelde `data.js` (düz) varsa doğrudan açılır.
- `tools/build.mjs` — veriyi okur, Google Takvim (`GCAL_ICS_URLS`) ve Moodle (`MOODLE_ICS_URL`) iCal'lerini `gcal[]` / `moodle[]` olarak ekler,
  PBKDF2-SHA256 (310 000 tur, tuz `canakkale-panel-v1`) + AES-GCM ile şifreler, `_site/` yazar. `PANEL_PASSWORD` yoksa durur (düz veri asla yayınlanmaz).
- `.github/workflows/panel.yml` — push, elle ve 3 saatte bir: gizli `Emrcnkkl/panel-veri` deposundan `data.js`'i alır (`DATA_REPO_TOKEN`),
  yoksa bu depodaki `data.js`'i kullanır; build eder, Pages'e yükler (Pages kaynağı: GitHub Actions). Şifreli veri git'e girmez.
- Secrets (kullanıcı kendisi girer, sohbete yazılmaz): `PANEL_PASSWORD`, `DATA_REPO_TOKEN`, `GCAL_ICS_URLS`, `MOODLE_ICS_URL`.

## Veri
- Asıl veri: gizli `panel-veri` deposundaki `data.js` (kurulduktan sonra). Bu depodaki `data.js` geçiş dönemi kopyasıdır ve **herkese açıktır**:
  not, GANO, öğrenci no, doğum günleri, tutarlar gibi hassas bilgiler yalnızca gizli depoya yazılır.
- Kullanıcı bilgiyi sohbette verir; Claude `data.js`'i düzenler, `updated`'i bugüne çeker, `node -e "global.window={};require('./data.js')"` ile sınar, commit + push eder.
  Gizli depo değiştiyse site kendiliğinden güncellenmez: Canakkale'de "Panel" workflow'unu elle tetikle (ya da 3 saatlik çalışmayı bekle).
- Tarihler `YYYY-AA-GG`, saatler `SS:DD`, tutarlar TL (sayı; bilinmiyorsa `null`). Ders oturumunda `day`: 1 = Pazartesi … 7 = Pazar, `type: "Lab"` olabilir.
- `curriculum[]` mezuniyet yolu tablosu (status: passed | taking | remaining | elective). Akademik takvim `akademiktakvim.bogazici.edu.tr/tr/json?type=4` (JSON) kaynağından.
- Uydurma veri ekleme; bilinmeyen alanı boş bırak. "Örnek görünüm" verisi `index.html` içindeki `DEMO()`'dadır ve kaydedilmez.
- `gcal[]`, `moodle[]`, `fb[]`, `sync`, `built` build sırasında üretilir; elle yazma.
- Fenerbahçe (`fb[]`, -21…+120 gün): futbol ESPN (`soccer/all/teams/436/schedule`), EuroLeague resmi API (`teamCode=ULK`),
  Basketbol Süper Ligi (4475) ve Efeler Ligi (4543) TheSportsDB ücretsiz anahtar `123` ile tur tur (istek sınırı: aralarına 2,2 sn).
  Kadın voleybolu (Sultanlar Ligi) açık kaynaklarda yok.
- Spotify: `spotify[]` öğesinde `url` yeter; build oEmbed ile adı ve kapağı alır (`img/spotify/<id>.jpg`, depoda yedeği var).
- Bu ortamda Node fetch proxy kullanmaz: yerel denemede `NODE_USE_ENV_PROXY=1 NODE_EXTRA_CA_CERTS=/root/.ccr/ca-bundle.crt` ekle.

## Deneme
`PANEL_PASSWORD=deneme node tools/build.mjs data.js /tmp/site` → `/tmp/site` klasörünü `python3 -m http.server` ile aç (şifre ekranı, "Bu cihazda hatırla").
