# CLAUDE.md — Kişisel Panel

Emir'in kişisel kontrol paneli (Boğaziçi Bilgisayar Müh. 2. sınıf). Kullanıcıyla iletişim ve arayüz metinleri **Türkçe**dir.

## Yapı
- `index.html` — tek dosyalık sayfa (inline CSS/JS, kütüphane yok). Sekmeler: Bugün · Okul · Gelişim · Kariyer · Projeler · Kitap & Film · Fenerbahçe · Finans (adreste `#okul` gibi).
  Tasarım: derin lacivert + şampanya altını, cam kartlar; tema seçici (Sistem/Açık/Koyu, `localStorage panel.theme`), karşılama alanında canlı saat ve öne çıkanlar,
  Ctrl/⌘K (ya da /) hızlı arama, 1–8 tuşlarıyla sekme. Renkler yalnızca `:root` tokenlarından; koyu değerler iki blokta (media + `[data-theme=dark]`).
  Yayında `data.enc.js` (şifreli) yüklenir ve şifre ekranı çıkar. Bu depoda veri yok.
- `tools/build.mjs` — veriyi okur, Google Takvim (`GCAL_ICS_URLS`) ve Moodle (`MOODLE_ICS_URL`) iCal'lerini `gcal[]` / `moodle[]` olarak ekler,
  PBKDF2-SHA256 (310 000 tur, tuz `canakkale-panel-v1`) + AES-GCM ile şifreler, `_site/` yazar. `PANEL_PASSWORD` yoksa durur (düz veri asla yayınlanmaz).
- `.github/workflows/panel.yml` — push, elle ve 3 saatte bir: gizli `Emrcnkkl/panel-veri` deposundan `data.js`'i alır (`DATA_REPO_TOKEN`;
  okunamazsa hata verip durur), build eder, Pages'e yükler (Pages kaynağı: GitHub Actions). Şifreli veri git'e girmez. Site: https://emrcnkkl.github.io/Canakkale/
- Secrets (kullanıcı kendisi girer, sohbete yazılmaz): `PANEL_PASSWORD`, `DATA_REPO_TOKEN`, `GCAL_ICS_URLS`, `MOODLE_ICS_URL`.

## Veri
- Veri yalnızca gizli `Emrcnkkl/panel-veri` deposundaki `data.js`'te (bu depo herkese açık; buraya veri yazma, git geçmişinde eski hassas olmayan bir kopya var).
- Kullanıcı bilgiyi sohbette verir; Claude panel-veri'de `data.js`'i düzenler, `updated`'i bugüne çeker, `node -e "global.window={};require('./data.js')"` ile sınar,
  commit + push eder, sonra burada "Panel" workflow'unu elle tetikler (workflow_dispatch, ref `main`).
- Tarihler `YYYY-AA-GG`, saatler `SS:DD`, tutarlar TL (sayı; bilinmiyorsa `null`). Ders oturumunda `day`: 1 = Pazartesi … 7 = Pazar, `type: "Lab"` olabilir.
- `curriculum[]` mezuniyet yolu tablosu (status: passed | taking | remaining | elective). Akademik takvim `akademiktakvim.bogazici.edu.tr/tr/json?type=4` (JSON) kaynağından.
- Uydurma veri ekleme; bilinmeyen alanı boş bırak. "Örnek görünüm" verisi `index.html` içindeki `DEMO()`'dadır ve kaydedilmez.
- `gcal[]`, `moodle[]`, `fb[]`, `sync`, `built` build sırasında üretilir; elle yazma.
- Fenerbahçe (`fb[]`, -21…+120 gün): futbol ESPN (`soccer/all/teams/436/schedule`) ve EuroLeague resmi API (`teamCode=ULK`) build'de otomatik.
  Basketbol Süper Ligi ve Efeler Ligi `data.js` → `fbFixed[]` içinde sabit (TheSportsDB'den bir kez alındı; canlı çekim istek sınırı yüzünden çok yavaştı).
  Her maçta `logo` (rakip arması URL'si) var. Kadın voleybolu (Sultanlar Ligi) açık kaynaklarda yok.
- Logolar: şirketler/bağlantılar Google favicon servisi (`domain` alanı ya da URL'nin alan adı), okul logosu bogazici.edu.tr favicon'u. Yüklenmezse harf rozeti.
- Finans: `settings.monthlyBudget` her ay varsayılan bütçe; abonelikler (aylık karşılığı) giderlere otomatik eklenir (`monthExp`).
- `curriculum[]` status'ta `failed` (kırmızı) ve `grade` (harf notu) da olabilir; `settings.advisor`, `advisorEmail`.
- Spotify: `spotify[]` öğesinde `url` yeter; build oEmbed ile adı ve kapağı alır (`img/spotify/<id>.jpg`, depoda yedeği var).
- Bu ortamda Node fetch proxy kullanmaz: yerel denemede `NODE_USE_ENV_PROXY=1 NODE_EXTRA_CA_CERTS=/root/.ccr/ca-bundle.crt` ekle.

## Deneme
`PANEL_PASSWORD=deneme node tools/build.mjs ../panel-veri/data.js /tmp/site` → `/tmp/site` klasörünü `python3 -m http.server` ile aç (şifre ekranı, "Bu cihazda hatırla").
