require('dotenv').config();
const express = require('express');
const cors = require('cors');
const cron = require('node-cron');

const admin = require('firebase-admin');
// CATATAN: Bro perlu menaruh file serviceAccountKey.json di folder server/ ini
// agar backend bisa mengakses database secara aman.
const serviceAccountPath = './serviceAccountKey.json'; 

try {
  const serviceAccount = require(serviceAccountPath);
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
  });
  console.log('✅ Firebase Admin Initialized');
} catch (e) {
  console.warn('⚠️ Firebase Admin gagal load (File json belum ada). Fitur Atomic Stok dinonaktifkan.');
}

const db = admin.apps.length > 0 ? admin.firestore() : null;

const app = express();
app.use(cors());
app.use(express.json()); // Parsing body raw menjadi object JSON

// ==========================================
// ROUTE 1: Webhook Cloud API WhatsApp (Verify)
// ==========================================
// Meta akan menembak endpoint ini untuk mengecek apakah server kita asli
app.get('/webhook/whatsapp', (req, res) => {
  const verify_token = process.env.WA_VERIFY_TOKEN;
  const mode = req.query['hub.mode'];
  const token = req.query['hub.verify_token'];
  const challenge = req.query['hub.challenge'];

  if (mode && token) {
    if (mode === 'subscribe' && token === verify_token) {
      console.log('✅ WA Webhook Terverifikasi!');
      res.status(200).send(challenge);
    } else {
      res.sendStatus(403);
    }
  } else {
    res.status(400).send('Harap serahkan hub.mode dan hub.verify_token');
  }
});

// ==========================================
// ROUTE 2: Menerima Pesan Masuk dari WhatsApp
// ==========================================
app.post('/webhook/whatsapp', async (req, res) => {
  const body = req.body;

  if (body.object) {
    if (body.entry && body.entry[0].changes && body.entry[0].changes[0].value.messages) {
      const waMessage = body.entry[0].changes[0].value.messages[0];
      const senderPhone = waMessage.from; // Nomor WA Pelanggan
      const textMessage = waMessage.text ? waMessage.text.body : '';

      console.log(`📩 Pesan Masuk dari ${senderPhone}: ${textMessage}`);

      // TODO: Simpan `textMessage` ke Firestore 'conversations' & 'messages'
      // agar sinkron ke The Harvester Aksena.

      res.sendStatus(200); 
    } else {
      res.sendStatus(200); 
    }
  } else {
    res.sendStatus(404);
  }
});

// ==========================================
// ROUTE 3: Conflict Resolution (Atomic Reservation)
// ==========================================
app.post('/api/inventory/reserve', async (req, res) => {
  const { productId, qty, userId } = req.body;

  if (!db) return res.status(500).json({ error: 'Database not connected' });

  try {
    const productRef = db.collection('products').doc(productId);
    
    const result = await db.runTransaction(async (t) => {
      const doc = await t.get(productRef);
      if (!doc.exists) throw new Error('Produk tidak ditemukan');

      const currentStock = doc.data().stock || 0;
      if (currentStock < qty) {
        return { success: false, reason: 'OUT_OF_STOCK' };
      }

      // 1. Kurangi stok utama secara atomik
      t.update(productRef, { stock: currentStock - qty });

      // 2. Buat record reservasi (Soft-Booking)
      const reservationRef = db.collection('reservations').doc();
      t.set(reservationRef, {
        productId,
        qty,
        userId,
        status: 'BOOKED',
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        expiresAt: new Date(Date.now() + 60 * 60 * 1000) // TTL 60 Menit
      });

      return { success: true, reservationId: reservationRef.id };
    });

    res.json(result);
  } catch (error) {
    console.error('❌ Reservation Error:', error);
    res.status(500).json({ error: error.message });
  }
});

// ==========================================
// ROUTE 4: Smart Substitute (The Matching Engine)
// ==========================================
app.post('/api/ai/substitute', async (req, res) => {
  const { categoryId, originalPrice } = req.body;

  if (!db) return res.status(500).json({ error: 'Database not connected' });

  try {
    // Cari produk di kategori yang sama dengan stok > 0
    const snapshot = await db.collection('products')
      .where('category', '==', categoryId)
      .where('stock', '>', 0)
      .limit(10) // Limit dilebarkan untuk memberi ruang pada ASL
      .get();

    const candidates = [];
    snapshot.forEach(doc => {
      const data = doc.data();
      // Hitung selisih harga (Price Similarity)
      const priceDiff = Math.abs(data.price - originalPrice);
      
      // === ASL LOGIC (SMART OFFER PRIORITY) ===
      let priorityScore = priceDiff;
      if (data.slow_moving_tag === 'SLOW_MOVING') {
        // Berikan prioritas tinggi untuk item SLOW_MOVING dengan mengurangkan "distance" skornya
        priorityScore -= 999999; 
        data.asl_smart_offer = true; // Flag untuk Frontend/AI agar memberi embel-embel Diskon
      }

      candidates.push({ id: doc.id, ...data, priceDiff, priorityScore });
    });

    // Urutkan rentang harga / prioritas terdekat dari yang terkecil
    candidates.sort((a, b) => a.priorityScore - b.priorityScore);

    res.json({ alternatives: candidates.slice(0, 2) });
  } catch (error) {
    res.status(500).json({ error: 'Gagal mencari substitusi' });
  }
});

// ==========================================
// ROUTE 5: AI Generation (The Closer)
// ==========================================
app.post('/api/ai/generate', async (req, res) => {
  const { prompt, context, userId, stockOut } = req.body;

  try {
    console.log(`🤖 AI Sedang berpikir untuk user: ${userId}...`);
    
    let reply = "";
    if (stockOut) {
      // Logic Smart Substitute di sini
      reply = `Waduh Kak, mohon maaf sekali. Stok produk tersebut baru saja habis. Tapi tenang, Aksena punya rekomendasi pengganti yang gak kalah keren dan harganya mirip lho! Mau dikirimin fotonya?`;
    } else {
      reply = `Halo Kak! Ini adalah balasan otomatis AI Aksena. Ada yang bisa kami bantu mengenai produk ${prompt}?`;
    }

    res.json({ reply });
  } catch (error) {
    console.error('❌ AI Error:', error);
    res.status(500).json({ error: 'Gagal generate AI' });
  }
});

// ==========================================
// ROUTE 4: The Marketer (Broadcast & Sequence)
// ==========================================
app.post('/api/marketer/broadcast', async (req, res) => {
  const { message, targets, userId } = req.body;

  try {
    console.log(`📢 Memulai Broadcast untuk ${targets.length} kontak...`);
    
    // Antrean pengiriman massal
    targets.forEach((target, index) => {
      setTimeout(() => {
        console.log(`➡️ Mengirim ke ${target.phone}: ${message}`);
        // Kirim via WA API di sini
      }, index * 1000); // Jeda 1 detik antar pesan hulu agar tidak kena ban
    });

    res.json({ status: 'Broadcast started' });
  } catch (error) {
    res.status(500).json({ error: 'Gagal memulai broadcast' });
  }
});

// ==========================================
// ROUTE 5: Uji Coba Server Nyala (Ping)
// ==========================================
app.get('/', (req, res) => {
  res.send('Aksena.id Engine V3 is Running! 🚀');
});

// ==========================================
// ROUTE 6: ASL Daily Scan (Smart Liquidation)
// ==========================================
const runDailyScan = async () => {
  console.log('⏰ [ASL] Menjalankan Daily Scan Master untuk mencari Dead Stock...');
  if (!db) {
    console.log('❌ [ASL] Database tidak tersambung. Skip check.');
    return;
  }
  
  try {
    const productsRef = db.collection('products');
    const snapshot = await productsRef.get();
    
    let redCount = 0;
    let totalPotentialLoss = 0;
    const now = new Date();

    const batch = db.batch();
    let updatesCount = 0;

    snapshot.forEach(doc => {
      const data = doc.data();
      let referenceDate = data.last_sold_date || data.createdAt;
      
      if (!referenceDate) return; 
      
      if (typeof referenceDate.toDate === 'function') {
        referenceDate = referenceDate.toDate();
      } else {
        referenceDate = new Date(referenceDate);
      }
      
      const diffTime = Math.abs(now - referenceDate);
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)); 

      let newStatus = 'Green'; 
      let newTag = null;
      let loss = 0;

      if (diffDays > 60) {
        newStatus = 'Red';
        newTag = 'SLOW_MOVING';
        redCount++;
        loss = (data.price || 0) * (data.stock || 0) * 0.5; // Estimasi 50% HPP
        totalPotentialLoss += loss;
      } else if (diffDays > 30) {
        newStatus = 'Yellow';
      }

      if (data.stock_status !== newStatus || data.slow_moving_tag !== newTag || data.potential_loss !== loss) {
        batch.update(doc.ref, {
          stock_status: newStatus,
          slow_moving_tag: newTag || admin.firestore.FieldValue.delete(),
          potential_loss: loss
        });
        updatesCount++;
      }
    });

    if (updatesCount > 0) {
      await batch.commit();
      console.log(`✅ [ASL] Scan selesai. ${updatesCount} produk di-update. ${redCount} item Dead Stock ditemukan.`);
      
      if (redCount > 0) {
        const notifMsg = `Bos, Aksena mendeteksi ada ${redCount} produk (Modal tertahan: Rp ${totalPotentialLoss.toLocaleString('id-ID')}) yang >60 hari tidak bergerak di gudang. Mau Aksena bantu buatkan "Rescue My Money" campaign hari ini? 🚨`;
        console.log(`📱 [WA NOTIF] KE OWNER -> ${notifMsg}`);
      }
    } else {
      console.log('✅ [ASL] Scan selesai. Tidak ada produk yang berganti zona.');
    }
  } catch (error) {
    console.error('❌ [ASL] Gagal Scan:', error);
  }
};

cron.schedule('0 0 * * *', runDailyScan);

// Endpoint manual trigger (bisa dipanggil dari Dashboard)
app.post('/api/asl/trigger-scan', async (req, res) => {
  await runDailyScan();
  res.json({ message: 'Daily Scan completed manually!' });
});

// ==========================================
// ROUTE 7: Drip Campaign Engine (Manual Trigger /api/leads/nurture)
// ==========================================
app.post('/api/leads/nurture', async (req, res) => {
  const { leadId } = req.body;
  if (!db) return res.status(500).json({ error: 'Database not connected' });

  try {
    const leadRef = db.collection('aksena_leads').doc(leadId);
    const docSnap = await leadRef.get();
    
    if (!docSnap.exists) {
      return res.status(404).json({ error: 'Lead tidak ditemukan' });
    }

    const leadData = docSnap.data();

    // Simulasi pengiriman pesan WA
    const nurtureMessage = `Halo ${leadData.name || leadData.businessName}, terima kasih sudah tertarik dengan Aksena.id. Apakah ada yang bisa kami bantu terkait sistem Aksena?`;
    console.log(`💬 [DRIP CAMPAIGN] Mengirim WA ke ${leadData.phone || 'Unknown'}: ${nurtureMessage}`);

    // Update state lead
    await leadRef.update({
      stage: 'NURTURED',
      lastContactedAt: admin.firestore.FieldValue.serverTimestamp()
    });

    // Catat ke contact_history
    await db.collection('aksena_leads').doc(leadId).collection('contact_history').add({
      type: 'WA_NURTURE',
      message: nurtureMessage,
      timestamp: admin.firestore.FieldValue.serverTimestamp()
    });

    res.json({ success: true, message: 'Nurture message sent and stage updated' });
  } catch (error) {
    console.error('❌ Gagal memproses nurture:', error);
    res.status(500).json({ error: 'Terjadi kesalahan pada server' });
  }
});

// ==========================================
// ROUTE 8: Auto Drip Campaign Cron Job
// ==========================================
const runDripCampaign = async () => {
  console.log('⏰ [DRIP] Menjalankan Auto-Nurture Scan untuk Leads...');
  if (!db) return;

  try {
    const leadsRef = db.collection('aksena_leads');
    // Cari lead dengan stage NEW
    const snapshot = await leadsRef.where('stage', '==', 'NEW').get();
    
    let nurturedCount = 0;
    const now = new Date();
    const batch = db.batch();

    snapshot.forEach(docSnap => {
      const data = docSnap.data();
      let createdDate = data.createdAt;
      
      if (!createdDate) return;
      if (typeof createdDate.toDate === 'function') {
        createdDate = createdDate.toDate();
      } else {
        createdDate = new Date(createdDate);
      }
      
      const diffTime = Math.abs(now - createdDate);
      const diffDays = diffTime / (1000 * 60 * 60 * 24);

      // Jika lead NEW sudah berumur >= 1 hari (24 jam), kita auto nurture
      // Untuk testing, ubah >= 1 jadi >= 0 sementara atau panggil via API trigger
      if (diffDays >= 1) {
        const nurtureMessage = `Halo ${data.name || data.businessName}, kami melihat pendaftaran Anda di Aksena.id. Yuk lanjut diskusi via WA ini jika ada pertanyaan!`;
        console.log(`🤖 [AUTO-DRIP] Mengirim follow up WA otomatis ke ${data.phone}: ${nurtureMessage}`);

        // Update doc
        batch.update(docSnap.ref, {
          stage: 'NURTURED',
          lastContactedAt: admin.firestore.FieldValue.serverTimestamp()
        });

        // Add history
        const historyRef = docSnap.ref.collection('contact_history').doc();
        batch.set(historyRef, {
          type: 'WA_AUTO_NURTURE',
          message: nurtureMessage,
          timestamp: admin.firestore.FieldValue.serverTimestamp()
        });

        nurturedCount++;
      }
    });

    if (nurturedCount > 0) {
      await batch.commit();
      console.log(`✅ [DRIP] Scan selesai. Berhasil auto-nurture ${nurturedCount} leads.`);
    } else {
      console.log('✅ [DRIP] Scan selesai. Belum ada lead baru yang perlu di-nurture hari ini.');
    }

  } catch (error) {
    console.error('❌ [DRIP] Gagal Scan:', error);
  }
};

// Auto Nurture berjalan setiap jam 9 pagi
cron.schedule('0 9 * * *', runDripCampaign);

// Endpoint manual trigger auto-drip (bisa dipanggil dari Postman dsb)
app.post('/api/drip/trigger-scan', async (req, res) => {
  await runDripCampaign();
  res.json({ message: 'Auto-Drip Campaign scan completed manually!' });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`📡 [Aksena Server] Berjalan pada port ${PORT}...`);
});
