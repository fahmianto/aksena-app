const { initializeApp, cert } = require('firebase-admin/app');
const { getFirestore, FieldValue } = require('firebase-admin/firestore');
const fs = require('fs');

async function seedTestLead() {
  const serviceAccount = JSON.parse(
    fs.readFileSync('../server/serviceAccountKey.json', 'utf-8')
  );

  initializeApp({
    credential: cert(serviceAccount)
  });

  const db = getFirestore();

  const leadData = {
    name: 'Budi (CEO Toko Mas)',
    businessName: 'Toko Emas Makmur',
    email: 'budi.ceo@emas-makmur.com',
    phone: '081234567890',
    source: 'landing_cta',
    stage: 'LEAD',
    planInterest: 'pro',
    notes: 'Sample lead untuk demo Harvester Log',
    createdAt: FieldValue.serverTimestamp(),
    lastContactedAt: FieldValue.serverTimestamp(),
  };

  const leadRef = await db.collection('aksena_leads').add(leadData);
  console.log('✅ Lead Dummy Berhasil Dibuat: ', leadRef.id);

  // Add Mock Chat History!
  const contactHistoryRef = leadRef.collection('contact_history');

  await contactHistoryRef.add({
    type: 'WA_BROADCAST',
    message: 'Halo Kak Budi! Terima kasih sudah mendaftar di Aksena.id. Ada kendala bisnis yang sedang ingin ditingkatkan?',
    timestamp: new Date(Date.now() - 360000) 
  });

  await contactHistoryRef.add({
    type: 'WA_INBOUND',
    message: 'Aduh mas, pusing tiap bulan ngitung stok pasti ada yang selisih. Capek mana admin saya pada galak.',
    timestamp: new Date(Date.now() - 300000) 
  });

  await contactHistoryRef.add({
    type: 'WA_OUTBOUND_AI',
    message: 'Wah wajar banget Kak Budi, ngitung stok manual emang rawan selisih dan bikin capek tim. Di Aksena, kita punya fitur khusus namanya "Rescue My Money" yang nggak cuma nyatet stok otomatis, tapi juga ngelacak dead-stock pelan-pelan jadi cash. Mau saya tunjukin simulasi cara kerjanya?',
    timestamp: new Date(Date.now() - 250000) 
  });

  console.log('✅ Mock Contact History injected to Lead ID: ', leadRef.id);
  process.exit(0);
}

seedTestLead().catch(console.error);
