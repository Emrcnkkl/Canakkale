// Kişisel panel verileri. index.html bu dosyayı okur.
// Alanların açıklaması CLAUDE.md'de. Tarihler YYYY-AA-GG, saatler SS:DD, tutarlar TL (sayı).
window.PANEL_DATA = {
  updated: "2026-11-10",

  settings: {
    name: "Emir",        // selamlamada görünür
    school: "Boğaziçi Üniversitesi · Bilgisayar Mühendisliği, 2. sınıf", // sol üstte görünür
    termName: "2026–27 Güz",
    termStart: "2026-09-21",
    termEnd: "2026-12-22",
    totalEcts: 240,
    earnedEcts: 55,      // 2025/26 yaz okulu sonrası
    gpa: "",             // GANO
    gradTerm: ""         // hedef mezuniyet dönemi
  },

  // Okul
  courses: [
    { code: "CMPE101", name: "Introduction to Computer Science", ects: 6, credit: 4,
      sessions: [ {day:1,start:"09:00",end:"10:50",room:"BM A2"}, {day:2,start:"11:00",end:"11:50",room:"BM A2"}, {day:5,start:"14:00",end:"16:00",room:"",type:"Lab"} ] },
    { code: "CMPE220", name: "Discrete Computational Structures", ects: 5, credit: 3,
      sessions: [ {day:3,start:"15:00",end:"16:50",room:"BM A3"}, {day:4,start:"16:00",end:"16:50",room:"BM A3"} ] },
    { code: "MATH202", name: "Differential Equations", ects: 7, credit: 4,
      sessions: [ {day:1,start:"11:00",end:"12:50",room:"NH 101"}, {day:3,start:"11:00",end:"12:50",room:"NH 305"} ] },
    { code: "PHYS121", name: "Introductory Mechanics & Thermodynamics", ects: 8, credit: 4,
      sessions: [ {day:1,start:"13:00",end:"14:50",room:"KB Z01"}, {day:3,start:"13:00",end:"14:50",room:"EF 206"} ] }
  ],       // {code, name, ects, teacher, office, email, absenceLimit, absences, links:[{label,url}], sessions:[{day:1-7, start, end, room}]}
  exams: [
    { course: "CMPE101", type: "Vize 1", date: "2026-10-26" },
    { course: "PHYS121", type: "Vize 1", date: "2026-11-03" },
    { course: "MATH202", type: "Vize", date: "2026-11-11" },
    { course: "CMPE220", type: "Vize 1", date: "2026-11-20" },
    { course: "CMPE101", type: "Vize 2", date: "2026-11-30" },
    { course: "MATH202", type: "Final", date: "2026-12-15", time: "Slot 3" },
    { course: "CMPE220", type: "Final", date: "2026-12-16", time: "Slot 3" },
    { course: "PHYS121", type: "Final", date: "2026-12-16", time: "Slot 4" },
    { course: "CMPE101", type: "Final", date: "2026-12-22", time: "Slot 3" }
  ],         // {course, type: "Vize"|"Final"|"Quiz"|"Bütünleme", date, time, room, grade}
  assignments: [],   // {course, title, due, time, status: "yapilacak"|"devam"|"teslim"}
  calendar: [
    // Kaynak: akademiktakvim.bogazici.edu.tr (10 Kasım 2026'da çekildi)
    { title: "Çevrimiçi kayıt dönemi", date: "2026-09-15", end: "2026-09-17" },
    { title: "Derslerin başlaması", date: "2026-09-21" },
    { title: "Ders ekleme/bırakma", date: "2026-09-28", end: "2026-09-30" },
    { title: "Cumhuriyet Bayramı (28 Ekim 13:00'ten sonra tatil)", date: "2026-10-29" },
    { title: "Dersten çekilme (öğrenci için son: 12 Kasım 23:59)", date: "2026-11-09", end: "2026-11-12" },
    { title: "Ders değerlendirme anketleri", date: "2026-11-30", end: "2026-12-11" },
    { title: "Derslerin son günü", date: "2026-12-11" },
    { title: "Yarıyıl sonu sınavları", date: "2026-12-13", end: "2026-12-22" },
    { title: "E ve mazeret sınavları", date: "2026-12-23", end: "2026-12-25" },
    { title: "ÇAP ve yan dal başvuruları", date: "2026-12-22", end: "2027-01-03" },
    { title: "Yılbaşı (tatil)", date: "2027-01-01" },
    { title: "Bahar dönemi çevrimiçi kayıt", date: "2027-01-13", end: "2027-01-15" },
    { title: "Bahar dönemi derslerin başlaması", date: "2027-01-18" },
    { title: "Bahar ders ekleme/bırakma", date: "2027-01-25", end: "2027-01-27" },
    { title: "Bahar tatili / Ramazan Bayramı", date: "2027-03-08", end: "2027-03-12" },
    { title: "Bahar dersten çekilme", date: "2027-03-22", end: "2027-03-26" },
    { title: "Yaz okulu ön kayıtları", date: "2027-04-07", end: "2027-04-09" },
    { title: "Bahar derslerin son günü", date: "2027-04-22" },
    { title: "Bahar yarıyıl sonu sınavları", date: "2027-04-25", end: "2027-05-04" },
    { title: "Bahar E ve mazeret sınavları", date: "2027-05-05", end: "2027-05-07" },
    { title: "Kurban Bayramı (15 Mayıs 13:00'ten sonra tatil)", date: "2027-05-16", end: "2027-05-19" },
    { title: "Yaz okulu derslerin başlaması", date: "2027-06-30" }
  ],      // akademik takvim {title, date, end}
  remaining: [],     // kalan dersler {name, type: "zorunlu"|"seçmeli", ects, term}
  // Mezuniyet yolu tablosu (BUIS müfredat eşleşmesi). status: "passed" | "taking" | "remaining" | "elective"
  curriculum: [
    { semester: 1, courses: [ {code:"CHEM105",status:"passed"}, {code:"CMPE101",status:"taking"}, {code:"EC 101",status:"passed"}, {code:"MATH101",status:"passed"}, {code:"PHYS121",status:"taking"} ] },
    { semester: 2, courses: [ {code:"CMPE142",status:"remaining"}, {code:"CMPE160",status:"remaining"}, {code:"EC 102",status:"passed"}, {code:"MATH102",status:"passed"}, {code:"PHYS201",status:"passed"} ] },
    { semester: 3, courses: [ {code:"CMPE220",status:"taking"}, {code:"CMPE230",status:"remaining"}, {code:"CMPE250",status:"remaining"}, {code:"EE 210",status:"passed"}, {code:"MATH201",status:"passed"}, {code:"TK 221",status:"remaining"} ] },
    { semester: 4, courses: [ {code:"CMPE222",status:"remaining"}, {code:"CMPE244",status:"remaining"}, {code:"EE 212",status:"remaining"}, {code:"MATH202",status:"taking"}, {code:"PHYS202/SCIE.",status:"elective"}, {code:"TK 222",status:"remaining"} ] },
    { semester: 5, courses: [ {code:"CMPE300",status:"remaining"}, {code:"CMPE322",status:"remaining"}, {code:"CMPE343",status:"remaining"}, {code:"CMPE346",status:"remaining"}, {code:"HTR 311",status:"remaining"}, {code:"IE 310",status:"remaining"} ] },
    { semester: 6, courses: [ {code:"CMPE320",status:"remaining"}, {code:"CMPE350",status:"remaining"}, {code:"CMPE354",status:"remaining"}, {code:"CMPE362",status:"remaining"}, {code:"HTR 312",status:"remaining"}, {code:"IE 306",status:"remaining"} ] },
    { semester: 7, courses: [ {code:"CC",status:"elective"}, {code:"CMPE seçmeli",status:"elective"}, {code:"Bölüm seçmeli",status:"elective"}, {code:"Bölüm seçmeli",status:"elective"}, {code:"HUM/HSS",status:"elective"} ] },
    { semester: 8, courses: [ {code:"CC",status:"elective"}, {code:"CC-1",status:"elective"}, {code:"CMPE400",status:"remaining"}, {code:"CMPE492",status:"remaining"}, {code:"Bölüm seçmeli",status:"elective"}, {code:"HUM/HSS",status:"elective"} ] }
  ],

  // Gelişim
  trainings: [
    { title: "SPL lisans sınavı hazırlığı", platform: "SPK Lisanslama Sınavları (SPL)", progress: 0, next: "Yakında başlıyor" }
  ],     // {title, platform, progress: 0-100, next, url}
  certificates: [],  // {title, issuer, date, url}
  goals: [
    { title: "SPL lisansını almak", horizon: "yil", progress: 0 }
  ],         // {title, horizon: "yil"|"donem"|"ay", current, target, unit} ya da {title, horizon, progress}

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
  subscriptions: [
    { name: "Spotify", domain: "spotify.com", amount: null, cycle: "aylik" },
    { name: "Canva", domain: "canva.com", amount: null, cycle: "aylik" },
    { name: "Claude", domain: "claude.ai", amount: null, cycle: "aylik" },
    { name: "Gemini", domain: "gemini.google.com", amount: null, cycle: "aylik" },
    { name: "iCloud", domain: "icloud.com", amount: null, cycle: "aylik" }
  ], // {name, amount, cycle: "aylik"|"yillik", day (aylık: ayın kaçı), date (yıllık: AA-GG)}
  savings: [],       // {title, target, current, deadline}

  // Bugün sekmesi
  spotify: [         // hızlı çal {title, subtitle, url, cover} — kapaklar build sırasında tazelenir
    { title: "slow", url: "https://open.spotify.com/playlist/0qQhl2Piwqb2FZNTVbURB7", cover: "img/spotify/0qQhl2Piwqb2FZNTVbURB7.jpg" },
    { title: "uzaktan", url: "https://open.spotify.com/playlist/3Oi2n20ahZ4f308FoQaFXC", cover: "img/spotify/3Oi2n20ahZ4f308FoQaFXC.jpg" },
    { title: "kaptan", url: "https://open.spotify.com/playlist/3jVOnymkY33nxHeN5JYYdp", cover: "img/spotify/3jVOnymkY33nxHeN5JYYdp.jpg" },
    { title: "pop+", url: "https://open.spotify.com/playlist/3JeiZWncYFRfYAcadIlGff", cover: "img/spotify/3JeiZWncYFRfYAcadIlGff.jpg" }
  ],
  links: [
    { title: "GitHub", url: "https://github.com/Emrcnkkl" },
    { title: "quant-bot", url: "https://emrcnkkl.github.io/quant-bot/" },
    { title: "Spotify", url: "https://open.spotify.com/" }
  ],                 // {title, url}
  // Fenerbahçe Basketbol Süper Ligi + Efeler Ligi (erkek voleybol) 2026-27 fikstürü — TheSportsDB'den 10 Kasım 2026'da alındı, sabit.
  // Futbol ve EuroLeague build sırasında otomatik gelir. Tarih değişikliği olursa buradan güncellenir.
  fbFixed: [
    {"sport": "Basketbol", "comp": "Basketbol Süper Ligi", "date": "2026-09-27", "opp": "Bahçeşehir Koleji SK", "logo": "https://r2.thesportsdb.com/images/media/team/badge/twgvxv1726910272.png", "home": false, "score": "83-98"},
    {"sport": "Basketbol", "comp": "Basketbol Süper Ligi", "date": "2026-10-02", "time": "18:00", "opp": "Manisa BB", "logo": "https://r2.thesportsdb.com/images/media/team/badge/dee2ms1740771670.png", "home": true},
    {"sport": "Basketbol", "comp": "Basketbol Süper Ligi", "date": "2026-10-10", "opp": "Çayirova", "logo": "https://r2.thesportsdb.com/images/media/team/badge/4adcmh1757583553.png", "home": false, "score": "100-85"},
    {"sport": "Basketbol", "comp": "Basketbol Süper Ligi", "date": "2026-10-18", "opp": "Petkim Spor", "logo": "https://r2.thesportsdb.com/images/media/team/badge/hlwgit1727704181.png", "home": true, "score": "77-82"},
    {"sport": "Basketbol", "comp": "Basketbol Süper Ligi", "date": "2026-10-25", "opp": "Karşıyaka Basket", "logo": "https://r2.thesportsdb.com/images/media/team/badge/mhh1y41739692642.png", "home": false, "score": "97-72"},
    {"sport": "Basketbol", "comp": "Basketbol Süper Ligi", "date": "2026-11-01", "opp": "Tofaş SK", "logo": "https://r2.thesportsdb.com/images/media/team/badge/l3t7p61698244996.png", "home": true, "score": "88-77"},
    {"sport": "Basketbol", "comp": "Basketbol Süper Ligi", "date": "2026-11-07", "opp": "Bursaspor Basketbol", "logo": "https://r2.thesportsdb.com/images/media/team/badge/mwt5rk1678898996.png", "home": false, "score": "78-59"},
    {"sport": "Basketbol", "comp": "Basketbol Süper Ligi", "date": "2026-11-15", "time": "20:30", "opp": "Anadolu Efes SK", "logo": "https://r2.thesportsdb.com/images/media/team/badge/uldz0d1782050729.png", "home": true},
    {"sport": "Basketbol", "comp": "Basketbol Süper Ligi", "date": "2026-11-22", "time": "20:30", "opp": "Besiktas Basketbol", "logo": "https://r2.thesportsdb.com/images/media/team/badge/rx0o811667119583.png", "home": false},
    {"sport": "Basketbol", "comp": "Basketbol Süper Ligi", "date": "2026-12-06", "time": "13:00", "opp": "Trabzonspor BK", "logo": "https://r2.thesportsdb.com/images/media/team/badge/wmu4u61784718489.png", "home": true},
    {"sport": "Basketbol", "comp": "Basketbol Süper Ligi", "date": "2026-12-11", "time": "19:00", "opp": "Bordo Sportif", "logo": "https://r2.thesportsdb.com/images/media/team/badge/iw11301757584059.png", "home": false},
    {"sport": "Basketbol", "comp": "Basketbol Süper Ligi", "date": "2026-12-20", "time": "15:30", "opp": "Türk Telekom BK", "logo": "https://r2.thesportsdb.com/images/media/team/badge/89j3fk1726910405.png", "home": true},
    {"sport": "Basketbol", "comp": "Basketbol Süper Ligi", "date": "2026-12-25", "time": "19:00", "opp": "Merkezefendi Belediyesi Denizli Basket", "logo": "https://r2.thesportsdb.com/images/media/team/badge/x2pms71784573128.png", "home": false},
    {"sport": "Basketbol", "comp": "Basketbol Süper Ligi", "date": "2027-01-01", "time": "19:00", "opp": "Galatasaray SK", "logo": "https://r2.thesportsdb.com/images/media/team/badge/s0648j1688557537.png", "home": true},
    {"sport": "Basketbol", "comp": "Basketbol Süper Ligi", "date": "2027-01-08", "time": "19:00", "opp": "Esenler Erokspor Basketball", "logo": "https://r2.thesportsdb.com/images/media/team/badge/cddejp1758793966.png", "home": false},
    {"sport": "Basketbol", "comp": "Basketbol Süper Ligi", "date": "2027-01-15", "time": "19:00", "opp": "Bahçeşehir Koleji SK", "logo": "https://r2.thesportsdb.com/images/media/team/badge/twgvxv1726910272.png", "home": true},
    {"sport": "Basketbol", "comp": "Basketbol Süper Ligi", "date": "2027-01-22", "time": "19:00", "opp": "Manisa BB", "logo": "https://r2.thesportsdb.com/images/media/team/badge/dee2ms1740771670.png", "home": false},
    {"sport": "Basketbol", "comp": "Basketbol Süper Ligi", "date": "2027-01-29", "time": "19:00", "opp": "Çayirova", "logo": "https://r2.thesportsdb.com/images/media/team/badge/4adcmh1757583553.png", "home": true},
    {"sport": "Basketbol", "comp": "Basketbol Süper Ligi", "date": "2027-02-05", "time": "19:00", "opp": "Petkim Spor", "logo": "https://r2.thesportsdb.com/images/media/team/badge/hlwgit1727704181.png", "home": false},
    {"sport": "Basketbol", "comp": "Basketbol Süper Ligi", "date": "2027-02-12", "time": "19:00", "opp": "Karşıyaka Basket", "logo": "https://r2.thesportsdb.com/images/media/team/badge/mhh1y41739692642.png", "home": true},
    {"sport": "Basketbol", "comp": "Basketbol Süper Ligi", "date": "2027-03-05", "time": "19:00", "opp": "Tofaş SK", "logo": "https://r2.thesportsdb.com/images/media/team/badge/l3t7p61698244996.png", "home": false},
    {"sport": "Basketbol", "comp": "Basketbol Süper Ligi", "date": "2027-03-12", "time": "19:00", "opp": "Bursaspor Basketbol", "logo": "https://r2.thesportsdb.com/images/media/team/badge/mwt5rk1678898996.png", "home": true},
    {"sport": "Basketbol", "comp": "Basketbol Süper Ligi", "date": "2027-03-19", "time": "19:00", "opp": "Anadolu Efes SK", "logo": "https://r2.thesportsdb.com/images/media/team/badge/uldz0d1782050729.png", "home": false},
    {"sport": "Basketbol", "comp": "Basketbol Süper Ligi", "date": "2027-03-26", "time": "19:00", "opp": "Besiktas Basketbol", "logo": "https://r2.thesportsdb.com/images/media/team/badge/rx0o811667119583.png", "home": true},
    {"sport": "Basketbol", "comp": "Basketbol Süper Ligi", "date": "2027-04-02", "time": "18:00", "opp": "Trabzonspor BK", "logo": "https://r2.thesportsdb.com/images/media/team/badge/wmu4u61784718489.png", "home": false},
    {"sport": "Basketbol", "comp": "Basketbol Süper Ligi", "date": "2027-04-09", "time": "18:00", "opp": "Bordo Sportif", "logo": "https://r2.thesportsdb.com/images/media/team/badge/iw11301757584059.png", "home": true},
    {"sport": "Basketbol", "comp": "Basketbol Süper Ligi", "date": "2027-04-16", "time": "18:00", "opp": "Türk Telekom BK", "logo": "https://r2.thesportsdb.com/images/media/team/badge/89j3fk1726910405.png", "home": false},
    {"sport": "Basketbol", "comp": "Basketbol Süper Ligi", "date": "2027-04-23", "time": "18:00", "opp": "Merkezefendi Belediyesi Denizli Basket", "logo": "https://r2.thesportsdb.com/images/media/team/badge/x2pms71784573128.png", "home": true},
    {"sport": "Basketbol", "comp": "Basketbol Süper Ligi", "date": "2027-04-30", "time": "18:00", "opp": "Galatasaray SK", "logo": "https://r2.thesportsdb.com/images/media/team/badge/s0648j1688557537.png", "home": false},
    {"sport": "Basketbol", "comp": "Basketbol Süper Ligi", "date": "2027-05-07", "time": "18:00", "opp": "Esenler Erokspor Basketball", "logo": "https://r2.thesportsdb.com/images/media/team/badge/cddejp1758793966.png", "home": true},
    {"sport": "Voleybol", "comp": "Efeler Ligi", "date": "2026-10-17", "opp": "Ziraat Bankası", "logo": "https://r2.thesportsdb.com/images/media/team/badge/dfuq2s1573075752.png", "home": true, "score": "0-3"},
    {"sport": "Voleybol", "comp": "Efeler Ligi", "date": "2026-10-24", "opp": "Gaziantep Gençlik", "logo": "https://r2.thesportsdb.com/images/media/team/badge/nqwvxn1785528780.png", "home": false, "score": "3-2"},
    {"sport": "Voleybol", "comp": "Efeler Ligi", "date": "2026-10-27", "opp": "Alanya Belediyespor", "logo": "https://r2.thesportsdb.com/images/media/team/badge/0lsvxm1785528607.png", "home": true, "score": "3-0"},
    {"sport": "Voleybol", "comp": "Efeler Ligi", "date": "2026-10-31", "opp": "İstanbul BB", "logo": "https://r2.thesportsdb.com/images/media/team/badge/gfq8pe1785528693.png", "home": false, "score": "3-1"},
    {"sport": "Voleybol", "comp": "Efeler Ligi", "date": "2026-11-07", "opp": "Gebze Belediyespor", "logo": "https://r2.thesportsdb.com/images/media/team/badge/lt0phu1785528446.png", "home": true, "score": "3-1"},
    {"sport": "Voleybol", "comp": "Efeler Ligi", "date": "2026-11-14", "time": "19:00", "opp": "Galatasaray Volleyball", "logo": "https://r2.thesportsdb.com/images/media/team/badge/cy4g6t1573134780.png", "home": false},
    {"sport": "Voleybol", "comp": "Efeler Ligi", "date": "2026-11-21", "time": "19:00", "opp": "Spor Toto", "logo": "https://r2.thesportsdb.com/images/media/team/badge/ng9o871624239562.png", "home": true},
    {"sport": "Voleybol", "comp": "Efeler Ligi", "date": "2026-11-28", "time": "14:00", "opp": "Halkbank Ankara", "logo": "https://r2.thesportsdb.com/images/media/team/badge/iycd3t1785529388.png", "home": false},
    {"sport": "Voleybol", "comp": "Efeler Ligi", "date": "2026-12-05", "time": "16:30", "opp": "Onikişubat Belediyespor", "logo": "https://r2.thesportsdb.com/images/media/team/badge/qzgsxx1785529530.png", "home": true},
    {"sport": "Voleybol", "comp": "Efeler Ligi", "date": "2026-12-12", "time": "14:00", "opp": "Sungurlu Belediyespor", "logo": "https://r2.thesportsdb.com/images/media/team/badge/3qcvh21785529650.png", "home": false},
    {"sport": "Voleybol", "comp": "Efeler Ligi", "date": "2026-12-22", "time": "14:00", "opp": "İstanbul GSK", "logo": "https://r2.thesportsdb.com/images/media/team/badge/9xb39l1785529120.png", "home": false},
    {"sport": "Voleybol", "comp": "Efeler Ligi", "date": "2026-12-26", "time": "16:00", "opp": "Altekma", "logo": "https://r2.thesportsdb.com/images/media/team/badge/3cg5qp1785529321.png", "home": false}
  ],

  dates: []          // önemli günler {title, date, yearly: true|false, note}  (yıllıksa date "AA-GG" olabilir)
};
