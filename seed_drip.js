async function seed() {
  const { initializeApp } = await import('firebase/app');
  const { getFirestore, collection, addDoc } = await import('firebase/firestore');

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

  console.log("Menyiapkan Skenario Edukasi Default...");

  const defaultSequences = [
    {
      step: 1,
      delayDays: 1,
      isActive: true,
      messageTemplate: "Halo {{name}}, pendaftaran {{businessName}} di Aksena.id sudah kami terima. \n\nApakah ada pertanyaan terkait sistem kami? Yuk diskusi di sini!",
      createdAt: new Date()
    },
    {
      step: 2,
      delayDays: 3,
      isActive: true,
      messageTemplate: "Hai {{name}}, sudah cek fitur Rescue My Money dari Aksena? \n\nFitur ini bisa bantu {{businessName}} buat deteksi barang numpuk dan ubah jadi cash kembali lho. Coba cek dashboard sekarang ya!",
      createdAt: new Date()
    },
    {
      step: 3,
      delayDays: 7,
      isActive: true,
      messageTemplate: "Halo {{name}}! Jangan jadikan tumpukan stok di gudang {{businessName}} sebagai hambatan profit. \n\nNgobrol yuk sama tim Aksena, kita bisa bantu settingkan AI untuk otomatis jualan barang lambat.",
      createdAt: new Date()
    }
  ];

  for (const seq of defaultSequences) {
    await addDoc(collection(db, 'drip_sequences'), seq);
  }

  console.log("✅ Default Drip Sequences Selesai Dibuat!");
}

seed().then(() => process.exit(0)).catch(e => { console.error(e); process.exit(1); });
