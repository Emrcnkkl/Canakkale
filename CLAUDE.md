# CLAUDE.md — Kişisel Panel

Kullanıcının kendine özel kontrol paneli. Kullanıcıyla iletişim ve arayüz metinleri **Türkçe**dir.

## Yapı
- `index.html` — tek dosyalık sayfa (inline CSS/JS, kütüphane yok). Sekmeler: Bugün · Okul · Gelişim · Kariyer · Projeler · Kitap & Film · Finans (adreste `#okul` gibi).
- `data.js` — **tüm veriler** `window.PANEL_DATA` içinde. Her alanın şeması dosyadaki yorumlarda.
- Yayın: GitHub Pages (ana dal, kök dizin). Yerelde `index.html`'e çift tıklamak da çalışır (fetch yok, `data.js` script olarak yüklenir).

## Veri güncelleme akışı
Kullanıcı bilgiyi sohbette verir ("Pazartesi 09:00 Mikroiktisat…", "Sapiens'i bitirdim, 4 puan" vb.).
Claude `data.js`'i düzenler, `updated` alanını bugünün tarihine çeker, `node -e "global.window={};require('./data.js')"` ile sözdizimini sınar, commit + push eder.
- Tarihler `YYYY-AA-GG`, saatler `SS:DD`, tutarlar TL cinsinden sayı.
- Ders oturumlarında `day`: 1 = Pazartesi … 7 = Pazar.
- Finans ay ay: `{month: "2026-11", income: [...], expenses: [...]}`; yeni ay yeni nesne.
- Uydurma veri ekleme; bilinmeyen alanı boş bırak. Sayfadaki "örnek görünüm" verisi `index.html` içindeki `DEMO()`'dadır ve kaydedilmez.

## Gizlilik
Depo herkese açıksa `data.js` herkes tarafından okunabilir. Hassas bilgi (tam tutarlar, telefon, adres, kimlik/öğrenci no) eklemeden önce kullanıcıyı uyar.
Sayfada `noindex` etiketi var (arama motorları listelemesin) ama bu gizlilik sağlamaz.
