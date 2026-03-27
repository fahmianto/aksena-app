import { initializeApp } from 'firebase/app';
import { getFirestore, collection, addDoc, serverTimestamp } from 'firebase/firestore';

async function seedTestLead() {
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

  const leadData = {
    name: 'Budi (CEO Toko Mas)',
    businessName: 'Toko Emas Makmur',
    email: 'budi.ceo@emas-makmur.com',
    phone: '081234567890',
    source: 'landing_cta',
    stage: 'NEW',
    planInterest: 'pro',
    notes: 'Sample lead untuk demo Harvester Log',
    createdAt: serverTimestamp(),
    lastContactedAt: serverTimestamp(),
  };

  try {
    const leadRef = await addDoc(collection(db, 'aksena_leads'), leadData);
    console.log('✅ Lead Dummy Berhasil Dibuat: ', leadRef.id);

    // Add Mock Chat History!
    const contactHistoryRef = collection(db, 'aksena_leads', leadRef.id, 'contact_history');

    await addDoc(contactHistoryRef, {
      type: 'WA_BROADCAST',
      message: 'Halo Kak Budi! Terima kasih sudah mendaftar di Aksena.id. Ada kendala bisnis yang sedang ingin ditingkatkan?',
      timestamp: new Date(Date.now() - 3600000) // 1 Hour ago
    });

    await addDoc(contactHistoryRef, {
      type: 'WA_INBOUND',
      message: 'Aduh mas, pusing tiap bulan ngitung stok pasti ada yang selisih. Capek.',
      timestamp: new Date(Date.now() - 300000) // 5 minutes ago
    });

    await addDoc(contactHistoryRef, {
      type: 'WA_OUTBOUND_AI',
      message: 'Wah wajar banget Kak Budi, ngitung stok manual emang rawan selisih dan bikin capek tim. Di Aksena, kita punya fitur khusus namanya "Rescue My Money" yang nggak cuma nyatet stok otomatis, tapi juga ngelacak dead-stock pelan-pelan jadi cash. Mau saya tunjukin simulasi cara kerjanya?',
      timestamp: new Date(Date.now() - 250000) // 4 mins ago
    });

    console.log('✅ Mock Contact History injected to Lead ID: ', leadRef.id);
    process.exit(0);
  } catch (error) {
    console.error('Error seeding data:', error);
    process.exit(1);
  }
}

seedTestLead();
