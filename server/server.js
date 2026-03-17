require('dotenv').config();
const express = require('express');
const cors = require('cors');

// Inisialisasi Firebase Admin (Digunakan untuk memuat data tanpa batas rule read/write umum)
// const admin = require('firebase-admin');
// const serviceAccount = require('./serviceAccountKey.json'); // Nanti didapatkan dari Firebase Settings

/*
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});
const db = admin.firestore();
*/

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

      res.sendStatus(200); // Wajib balas 200 OK agar Meta tidak terus mengirim ulang
    } else {
      res.sendStatus(200); // Balas OK untuk status/receipt
    }
  } else {
    res.sendStatus(404);
  }
});

// ==========================================
// ROUTE 3: Uji Coba Server Nyala (Ping)
// ==========================================
app.get('/', (req, res) => {
  res.send('Aksena Engine V3 is Running! 🚀');
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`📡 [Aksena Server] Berjalan pada port ${PORT}...`);
});
