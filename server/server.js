require('dotenv').config();
const express = require('express');
const cors = require('cors');

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
      .limit(5)
      .get();

    const candidates = [];
    snapshot.forEach(doc => {
      const data = doc.data();
      // Hitung selisih harga (Price Similarity)
      const priceDiff = Math.abs(data.price - originalPrice);
      candidates.push({ id: doc.id, ...data, priceDiff });
    });

    // Urutkan berdasarkan harga terdekat
    candidates.sort((a, b) => a.priceDiff - b.priceDiff);

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

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`📡 [Aksena Server] Berjalan pada port ${PORT}...`);
});
