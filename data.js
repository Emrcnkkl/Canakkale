// Kişisel panel verileri. index.html bu dosyayı okur.
// Alanların açıklaması CLAUDE.md'de. Tarihler YYYY-AA-GG, saatler SS:DD, tutarlar TL (sayı).
window.PANEL_DATA = {
  updated: "2026-11-10",

  settings: {
    name: "Emir",        // selamlamada görünür
    school: "Boğaziçi Üniversitesi · Bilgisayar Mühendisliği, 2. sınıf", // sol üstte görünür
    termName: "",        // ör. "2026–27 Güz"
    termStart: "",       // dönem başlangıcı
    termEnd: "",         // dönem sonu
    totalEcts: 0,        // mezuniyet için gereken AKTS
    earnedEcts: 0,       // tamamlanan AKTS
    gpa: "",             // GANO
    gradTerm: ""         // hedef mezuniyet dönemi
  },

  // Okul
  courses: [],       // {code, name, ects, teacher, office, email, absenceLimit, absences, links:[{label,url}], sessions:[{day:1-7, start, end, room}]}
  exams: [],         // {course, type: "Vize"|"Final"|"Quiz"|"Bütünleme", date, time, room, grade}
  assignments: [],   // {course, title, due, time, status: "yapilacak"|"devam"|"teslim"}
  calendar: [],      // akademik takvim {title, date, end}
  remaining: [],     // kalan dersler {name, type: "zorunlu"|"seçmeli", ects, term}

  // Gelişim
  trainings: [],     // {title, platform, progress: 0-100, next, url}
  certificates: [],  // {title, issuer, date, url}
  goals: [],         // {title, horizon: "yil"|"donem"|"ay", current, target, unit} ya da {title, horizon, progress}

  // Kariyer
  applications: [],  // {company, role, type: "Staj"|"İş", status: "hazirlaniyor"|"basvuruldu"|"mulakat"|"teklif"|"sonuc", deadline, next, nextDate, url}

  // Projeler
  projects: [
    {
      name: "quant-bot",
      status: "aktif",
      desc: "BIST50 teknik sinyal botu: her gün 50 hisseye puan verir, AL/TUT/SAT sinyali ve canlı model portföy üretir, Telegram'a bildirir.",
      next: "Canlı portföy birkaç ay biriktikten sonra geriye dönük testle kıyasla.",
      site: "https://emrcnkkl.github.io/quant-bot/",
      repo: "https://github.com/Emrcnkkl/quant-bot",
      updated: "2026-11-10"
    },
    {
      name: "nxt",
      status: "aktif",
      desc: "Lead the Next",
      repo: "https://github.com/Emrcnkkl/leadthenext-astro"
    },
    {
      name: "anlik_bot",
      status: "aktif",
      site: "https://emrcnkkl.github.io/anlik_bot/"
    }
  ],                 // {name, status: "aktif"|"beklemede"|"fikir"|"bitti", desc, next, progress, site, repo, updated}

  // Kitap & Film
  books: [],         // {title, author, status: "okuyorum"|"okunacak"|"bitti", page, pages, rating: 1-5, finished}
  films: [],         // {title, year, status: "izlenecek"|"izlendi", rating: 1-5, watched, note}
  series: [],        // {title, platform, season, episode, total, status: "izliyorum"|"bekliyorum"|"izlenecek"|"bitti"|"biraktim", nextDate}

  // Finans
  finance: [],       // ay ay {month: "2026-11", income:[{label, amount}], expenses:[{label, amount, category}]}
  subscriptions: [], // {name, amount, cycle: "aylik"|"yillik", day (aylık: ayın kaçı), date (yıllık: AA-GG)}
  savings: [],       // {title, target, current, deadline}

  // Bugün sekmesi
  spotify: [],       // hızlı çal {title, subtitle, url}
  links: [
    { title: "GitHub", url: "https://github.com/Emrcnkkl" },
    { title: "quant-bot", url: "https://emrcnkkl.github.io/quant-bot/" },
    { title: "Spotify", url: "https://open.spotify.com/" }
  ],                 // {title, url}
  dates: []          // önemli günler {title, date, yearly: true|false, note}  (yıllıksa date "AA-GG" olabilir)
};
