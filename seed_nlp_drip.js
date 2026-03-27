const nlpSequences = [
  {
    step: 1,
    delayDays: 1, // H+1
    isActive: true,
    messageTemplate: `Halo Kak {{name}}! 👋 Selamat datang di ekosistem Aksena.id.\n\nTerima kasih sudah trial/download e-book dari kami. Sayangnya, ada satu realita bisnis yang jarang dibahas: \n"Banyak bisnis mati bukan karena produknya jelek, tapi karena leads yang masuk MENGUAP begitu saja."\n\nPernah merasa capek bayar iklan mahal-mahal, leads masuk, tapi pas di-follow up manual... ujung-ujungnya cuma di-read, ghosting, atau balas "nanti dulu ya"?\n\nItulah alasan Aksena dibangun. Besok saya akan share cerita bagaimana 1 fitur sepele bisa merubah konversi ghosting jadi closing. Pantau terus ya Kak! 🔥\n\n_Balas UNSUB untuk berhenti berlangganan tips bisnis dari Aksena._`,
    createdAt: new Date()
  },
  {
    step: 2,
    delayDays: 2, // H+2
    isActive: true,
    messageTemplate: `Halo Kak {{name}}, gimana kabarnya hari ini?\n\nNyambung cerita kemarin... Bayangkan bisnis {{businessName}} itu seperti Bak Mandi. \nIklan/Ads itu air keran yang mengucur deras. Sayangnya, bak mandinya bocor (follow up lambat, lupa balas, nggak ada edukasi). Airnya habis terus.\n\nDulu, ada salah satu klien kami yang juga ngalamin ini. Dia nambah budget iklan 3x lipat, tapi omsetnya malah stagnan. Setelah diusut, ternyata tim CS-nya kewalahan balas WA satu-satu. Leads yang harusnya "panas" keburu "dingin".\n\nSolusinya? Dia pakai fitur *Automated Drip Campaign* dari Aksena. Cuma modal setting 1x di awal, sistem yang follow-up dan edukasi prospek siang dan malam. Gila kan? \n\nSemoga {{businessName}} nggak ngalamin kebocoran yang sama ya Kak. Besok kita bahas teknik "Hypnotic Copywriting" buat follow up otomatis. See you!`,
    createdAt: new Date()
  },
  {
    step: 3,
    delayDays: 4, // H+4
    isActive: true,
    messageTemplate: `Hai Kak {{name}}! Pernah dengar soal NLP (Neuro-Linguistic Programming) dalam jualan? 🧠\n\nManusia itu beli pakai EMOSI, lalu membenarkan keputusannya pakai LOGIKA. \nKalau Kakak follow up leads cuma bilang "Halo Kak, mau jadi beli?", itu logika murni. Wajar kalau ditolak.\n\nCoba ganti angle-nya: "Halo Kak {{name}}, mumpung stok tinggal 2 dan besok harga naik, saya keep-kan dulu ya agar Kakak tidak menyesal kehabisan."\nLihat bedanya? Ada emosi ketakutan kehilangan (Fear Of Missing Out).\n\nDi Aksena.id, Kakak bisa masukin skrip-skrip psikologis ini ke dalam sistem. Leads akan merasa dikirimi pesan personal secara manual, padahal itu robot pintar kita yang kerja. Mau coba rasakan efisiensinya? Langsung aja setup Drip Sequences di dashboard Aksena Kakak! 🚀`,
    createdAt: new Date()
  },
  {
    step: 4,
    delayDays: 7, // H+7
    isActive: true,
    messageTemplate: `Satu minggu berlalu sejak Kak {{name}} kenal Aksena. Udah kebayang belum asyiknya punya "Karyawan Digital" yang nggak pernah tidur? 🤖\n\nCoba tutup mata sebentar. Bayangkan satu bulan dari sekarang:\nKakak lagi santai ngopi di cafe, tiba-tiba masuk notif HP... \n"Dring!" Ada pesanan baru. \nLalu masuk lagi... "Dring!" Omset bertambah.\n\nKakak nggak pusing mikirin follow-up lagi karena sistem Aksena udah mengerjakannya 24/7. Leads yang minggu lalu diam, tiba-tiba transfer karena diedukasi secara elegan sama sistem. Enak banget kan?\n\nRealita seperti itu sudah dirasakan ratusan bisnis lain. Jangan sampai {{businessName}} ketinggalan kereta, Kak! Segera upgrade akun Aksena-nya hari ini dan jadikan visi itu nyata.`,
    createdAt: new Date()
  },
  {
    step: 5,
    delayDays: 10, // H+10
    isActive: true,
    messageTemplate: `Halo Kak {{name}}. Kalau dipikir secara logika, menghabiskan gaji 5-8 juta sebulan untuk hire 2 admin CS agar stand-by 24 jam itu lumayan berat buat operasional. Belum lagi human error, admin sakit, ketiduran dll. 💸\n\nCoba bandingkan: Aksena.id mengotomatiskan tugas 2-3 orang admin sekaligus dengan investasi yang cuma sepersekian persen dari UMR. ROI (Return on Investment)-nya jelas banget. \n\nAksena bukan sekedar tools, tapi ASET tak kasat mata yang menyelamatkan omset {{businessName}} dari kebocoran. Yuk, ambil langkah logis hari ini. Log in ke dashboard sekarang dan nikmati perbedaannya.`,
    createdAt: new Date()
  },
  {
    step: 6,
    delayDays: 15, // H+15
    isActive: true,
    messageTemplate: `Kak {{name}}, beberapa user sempat ragu sebelum pakai Aksena karena takut "pusing setup IT-nya". Padahal...\n\nSistem kita didesain "Plug-and-Play". Gak butuh jago coding. Antarmukanya simpel, tarik (drag) dan lepas (drop). Kalau bingung, tim support Aksena asli manusia (bukan bot nyebelin) siap bimbing sampai Kakak jalan lancar.\n\nPilihan ada di tangan Kakak: Belajar sistem baru paling lama 1 hari, TAPI omset aman selamanya. ATAU diam nyaman di cara lama, tapi pelan-pelan tergerus kompetitor yang udah main otomasi. \n\nPilih yang bikin bisnis Kakak bertumbuh dong pastinya! 🔥`,
    createdAt: new Date()
  },
  {
    step: 7,
    delayDays: 21, // H+21
    isActive: true,
    messageTemplate: `Wow, udah mau 3 minggu sejak kita kenal Kak {{name}}! Seru rasanya bisa sharing banyak ilmu bisnis.\n\nNgomong-ngomong, kuota server untuk harga langganan Aksena fase "Early Adopter" ini sudah mulai menipis. Dalam waktu dekat, harganya pasti akan disesuaikan (baca: NAIK). \n\nMumpung Kakak masih terdaftar sebagai whitelist Early Leads kami, ini saat yang paling tepat untuk mengunci (lock) harga termurah Aksena SEUMUR HIDUP. \n\nBuktikan sendiri bedanya. Balas chat ini dengan kata "MAU AKSENA" dan tim kami akan memberikan penawaran eksklusif yang nggak akan Kakak tolak. 😉`,
    createdAt: new Date()
  },
  {
    step: 8,
    delayDays: 30, // H+30
    isActive: true,
    messageTemplate: `Hai Kak {{name}}! Nggak kerasa udah sebulan berlalu. Gimana perkembangan {{businessName}}? Semoga makin meroket ya! 🚀\n\nTahukah Kakak bahwa pesan ini adalah BUBUK MESIU dari sebuah sistem yang kita namakan "Multi-Step Drip Engine". Ya, pesan yang Kakak baca detik ini sudah di-setup dari 30 hari yang lalu secara TERJADWAL OTOMATIS tanpa disentuh manusia sama sekali.\n\nKakak terbukti baru saja melewati perjalanan (Customer Journey) simulasi persuasi otomatis kami. Bukankah lebih keren jika sistem secanggih ini yang melayani pembeli Kakak setiap hari?\n\nLog In ke Aksena sekarang, dan mari kita buat sistem yang sama untuk meroketkan closing rate bisnis Kakak! ⚡️`,
    createdAt: new Date()
  }
];

async function seed() {
  const { initializeApp } = await import('firebase/app');
  const { getFirestore, collection, addDoc, getDocs, deleteDoc } = await import('firebase/firestore');

  const firebaseConfig = {
    apiKey: "AIzaSyDp2qbPJryTBpNMdzU-QyJI9IHzFSTsyDY",
    authDomain: "aksena-mvp.firebaseapp.com",
    projectId: "aksena-mvp",
    storageBucket: "aksena-mvp.firebasestorage.app",
    messagingSenderId: "1090951998118",
    appId: "1:1090951998118:web:29d8d60db4e4e31322e267",
  };

  const app = initializeApp(firebaseConfig);
  const db = getFirestore(app);

  console.log('⏳ Menghapus Drip Sequence yang lama...');
  const collRef = collection(db, 'drip_sequences');
  const snapshot = await getDocs(collRef);
  
  for (const docSnap of snapshot.docs) {
    await deleteDoc(docSnap.ref);
  }

  console.log('✅ Menyiapkan Skenario Edukasi VIP Berseri (NLP & Storytelling)...');
  
  for (const seq of nlpSequences) {
    await addDoc(collection(db, 'drip_sequences'), seq);
  }

  console.log('🎉 8 Hari/Skenario "30-Day Auto-Pilot VIP Drip" Selesai Dibuat!');
  process.exit(0);
}

seed().catch(error => {
  console.error("Terjadi kesalahan:", error);
  process.exit(1);
});
