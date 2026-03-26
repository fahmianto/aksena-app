async function seed() {
  const { initializeApp } = await import('firebase/app');
  const { getFirestore, collection, addDoc, doc, setDoc } = await import('firebase/firestore');

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

  console.log("Memulai proses seeding data dummy...");

  // Waktu simulasi
  const now = new Date();
  const twoDaysAgo = new Date(now.getTime() - (48 * 60 * 60 * 1000));
  const sixtyFiveDaysAgo = new Date(now.getTime() - (65 * 24 * 60 * 60 * 1000));
  const fortyDaysAgo = new Date(now.getTime() - (40 * 24 * 60 * 60 * 1000));
  const tenDaysAgo = new Date(now.getTime() - (10 * 24 * 60 * 60 * 1000));

  // --- SEED LEADS ---
  const dummyLeads = [
    {
      name: "Toko Suka Maju (Baru)",
      email: "sukamaju@dummy.com",
      businessName: "Toko Suka Maju",
      phone: "081234567890",
      source: "WhatsApp",
      stage: "NEW",
      planInterest: "standard",
      createdAt: now,
      lastContactedAt: null,
      notes: ""
    },
    {
      name: "Gudang Berkah (Telat Nurture)",
      email: "gudangberkah@dummy.com",
      businessName: "Gudang Berkah ID",
      phone: "081298765432",
      source: "Register",
      stage: "NEW",
      planInterest: "growth",
      createdAt: twoDaysAgo, // Sudah lebih 24 jam jadi bisa di test Auto-Drip
      lastContactedAt: null,
      notes: "Coba test Auto-Drip Campaign ke leads ini"
    },
    {
      name: "Distributor X (Nurtured)",
      email: "distx@dummy.com",
      businessName: "Distributor X",
      phone: "081122334455",
      source: "Landing",
      stage: "NURTURED",
      planInterest: "basic",
      createdAt: twoDaysAgo,
      lastContactedAt: now,
      notes: ""
    },
    {
      name: "Boutique Cantik (Offered)",
      email: "cantik@dummy.com",
      businessName: "Boutique Cantik",
      phone: "081199887766",
      source: "WhatsApp",
      stage: "OFFERED",
      planInterest: "enterprise",
      createdAt: tenDaysAgo,
      lastContactedAt: twoDaysAgo,
      notes: ""
    }
  ];

  console.log("Menambahkan Leads Dummy...");
  for (const lead of dummyLeads) {
    await addDoc(collection(db, 'aksena_leads'), lead);
  }

  // --- SEED PRODUCTS ---
  const dummyProducts = [
    {
      name: "Gamis Katun Premium (Dead Stock)",
      sku: "GM-KTN-01",
      stock: 15,
      price: 150000,
      category: "Pakaian Wanita",
      createdAt: sixtyFiveDaysAgo,
      last_sold_date: sixtyFiveDaysAgo, // > 60 hari -> RED
      stock_status: "Red",
      slow_moving_tag: "SLOW_MOVING",
      potential_loss: 150000 * 15 * 0.5 // sesuai logic di server 50%
    },
    {
      name: "Hijab Instan Basic (Slow)",
      sku: "HJ-BS-02",
      stock: 50,
      price: 35000,
      category: "Pakaian Wanita",
      createdAt: fortyDaysAgo,
      last_sold_date: fortyDaysAgo, // > 30 hari -> YELLOW
      stock_status: "Yellow",
      slow_moving_tag: null,
      potential_loss: 0
    },
    {
      name: "Pashmina Ceruty (Fast)",
      sku: "PS-CR-03",
      stock: 120,
      price: 45000,
      category: "Pakaian Wanita",
      createdAt: tenDaysAgo,
      last_sold_date: tenDaysAgo, // < 30 hari -> GREEN
      stock_status: "Green",
      slow_moving_tag: null,
      potential_loss: 0
    }
  ];

  console.log("Menambahkan Produk Dummy...");
  for (const prod of dummyProducts) {
    await addDoc(collection(db, 'products'), prod);
  }

  console.log("✅ Seeding Data Selesai!");
}

seed().then(() => process.exit(0)).catch(e => { console.error(e); process.exit(1); });
