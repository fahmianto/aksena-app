require('dotenv').config();
console.log('🚀 [Aksena Startup] Prosedur inisialisasi dimulai...');

const express = require('express');
const cors = require('cors');
const cron = require('node-cron');
const nodemailer = require('nodemailer');
const admin = require('firebase-admin');

const app = express();
let server;

// 1. EARLY BINDING (Sangat Penting untuk Railway!)
const PORT = process.env.PORT || 3000;
server = app.listen(PORT, () => {
  console.log(`📡 [Aksena Server] Berjalan pada port ${PORT}...`);
});


// 2. EARLY HEALTH CHECK

app.get('/health', (req, res) => res.status(200).send('Aksena is Alive! ✅'));

// ==========================================
// NODEMAILER SETUP (Mailketing)
// ==========================================
let transporter;
try {
  transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp.mailketing.co.id',
    port: parseInt(process.env.SMTP_PORT) || 587,
    secure: false, // TLS
    auth: {
      user: process.env.SMTP_USER || 'dummy',
      pass: process.env.SMTP_PASS || 'dummy'
    }
  });
  transporter.verify((error) => {
    if (error) console.warn('⚠️ SMTP Mock Mode: Belum terhubung.');
    else console.log('📧 SMTP Mailketing Ready!');
  });
} catch (e) {
  console.warn('⚠️ SMTP Gagal Inisialisasi.');
}

// Helper Function: Kirim Email (HTML)
global.sendEmail = async (to, subject, htmlContent) => {
  if (!process.env.SMTP_PASS || !transporter) {
    console.log(`[MOCK EMAIL] To: ${to} | Subjek: ${subject}`);
    return true;
  }
  try {
    await transporter.sendMail({
      from: '"Aksena System" <no-reply@aksena.id>',
      to,
      subject,
      html: htmlContent
    });
    return true;
  } catch (error) {
    console.error(`Gagal mengirim email ke ${to}:`, error);
    return false;
  }
};

// ==========================================
// FIREBASE ADMIN SETUP
// ==========================================
let db = null;
try {
  if (process.env.FIREBASE_SERVICE_ACCOUNT) {
    const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
    admin.initializeApp({ credential: admin.credential.cert(serviceAccount) });
    console.log('✅ Firebase Admin Initialized (from ENV)');
  } else {
    const serviceAccount = require('./serviceAccountKey.json');
    admin.initializeApp({ credential: admin.credential.cert(serviceAccount) });
    console.log('✅ Firebase Admin Initialized (from file)');
  }
  db = admin.firestore();
} catch (e) {
  console.warn('⚠️ Firebase Admin gagal load.', e.message);
}

app.use(cors());
app.use(express.json());


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
  const { handleIncomingChat } = require('./aiEngine');
  const { handleOwnerChat } = require('./aciEngine');
  const body = req.body;

  if (body.object) {
    if (body.entry && body.entry[0].changes && body.entry[0].changes[0].value.messages) {
      const waMessage = body.entry[0].changes[0].value.messages[0];
      const senderPhone = waMessage.from; // Nomor WA Pelanggan
      const textMessage = waMessage.text ? waMessage.text.body : '';

      console.log(`📩 Pesan Masuk dari ${senderPhone}: ${textMessage}`);

      // [ACI] Aksena Conversational Intelligence (Jalur Khusus Owner)
      if (process.env.OWNER_PHONE && (senderPhone === process.env.OWNER_PHONE || senderPhone === process.env.OWNER_PHONE.replace(/^62/, '0'))) {
          // ACI menangani pesan
          const aciReply = await handleOwnerChat(textMessage, senderPhone, db);
          
          // Jeda simulasi ketik (Bila punya Meta API aktif, kirim balik pesannya disini)
          setTimeout(() => {
              console.log(`👔💬 [ACI Master Brain] Merespon ke CEO: "${aciReply}"`);
          }, 2000);
          
          return res.sendStatus(200); // Stop eksekusi agar tidak masuk ke The Closer
      }

      const cleanedText = textMessage.trim().toUpperCase();
      if (cleanedText === 'UNSUB' || cleanedText === 'STOP') {
        if (db) {
          const snap = await db.collection('aksena_leads').get(); 
          let foundDoc = null;
          snap.forEach(d => {
             const data = d.data();
             if (data.phone === senderPhone || data.phone === senderPhone.replace(/^62/, '0')) {
                 foundDoc = d;
             }
          });
          if (foundDoc) {
             await foundDoc.ref.update({ unsubscribed: true });
             console.log(`🚫 Lead ${foundDoc.data().name} berhasil di unsubscribed dari promo.`);
          }
        }
      } else {
        // ==========================================
        // THE CLOSER: AI Auto-Reply Engine
        // ==========================================
        if (db) {
          const snap = await db.collection('aksena_leads').get(); 
          let foundDoc = null;
          snap.forEach(d => {
             const data = d.data();
             if (data.phone === senderPhone || data.phone === senderPhone.replace(/^62/, '0')) {
                 foundDoc = d;
             }
          });

          if (foundDoc) {
             const lead = foundDoc.data();
             const leadRef = foundDoc.ref;
             
             // Meneruskan pesan ke Multi-Agent Router (aiEngine.js)
             await handleIncomingChat(textMessage, lead, leadRef, db);
          } else {
             console.log(`⚠️ Nomor ${senderPhone} tidak terdaftar di sistem. Pesan diabaikan.`);
          }
        }
      }

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
// ROUTE 4b: AI Broadcast Copywriter
// ==========================================
app.post('/api/ai/copywriter', async (req, res) => {
  const { topic } = req.body;
  
  // Dummy AI for local:
  const suggestedCopy = `Halo Kak {{name}}! 👋\nAda kabar gembira dari Aksena nih.\n\nTerkait promo: *${topic}*!\n\nJangan lewatkan kesempatan spesial ini ya. Langsung balas pesan ini jika Kakak berminat atau ada pertanyaan.\n\nSalam hangat, Tim Aksena.`;
  
  res.json({ suggestion: suggestedCopy });
});

// ==========================================
// ROUTE 4: The Marketer (Broadcast & Sequence)
// ==========================================
app.post('/api/marketer/broadcast', async (req, res) => {
  const { message, audienceParams, userId, scheduledAt, channel = 'WA', subject = 'Promo Aksena Spesial' } = req.body;

  if(!db) return res.status(500).json({ error: 'DB not connected' });

  try {
    let leadsQuery = db.collection('aksena_leads');
    if (audienceParams && audienceParams.filterStage && audienceParams.filterStage !== 'ALL') {
      leadsQuery = leadsQuery.where('stage', '==', audienceParams.filterStage);
    }
    const snap = await leadsQuery.get();
    const targets = [];
    snap.forEach(d => {
       const data = d.data();
       if(data.unsubscribed !== true) {
         // Filter based on channel availability
         if (channel === 'WA' && !data.phone) return;
         if (channel === 'EMAIL' && !data.email) return;
         if (channel === 'SMART' && !data.phone && !data.email) return;
         if (channel === 'BOTH' && !data.phone && !data.email) return;
         
         targets.push({ id: d.id, ...data });
       }
    });

    if (scheduledAt && new Date(scheduledAt).getTime() > Date.now()) {
      // B. JADWALKAN BROADCAST
      await db.collection('scheduled_broadcasts').add({
        message,
        subject,
        channel,
        audienceParams,
        userId,
        targets,
        scheduledAt: new Date(scheduledAt),
        status: 'PENDING',
        createdAt: admin.firestore.FieldValue.serverTimestamp()
      });
      console.log(`⏳ Broadcast dijadwalkan untuk ${targets.length} kontak pada ${new Date(scheduledAt).toLocaleString('id-ID')}`);
      return res.json({ status: 'Broadcast Scheduled', targetCount: targets.length });
    }

    console.log(`📢 Memulai Broadcast Thematic untuk ${targets.length} kontak...`);
    
    const finalMessageTemplate = message + (channel === 'EMAIL' ? '<br><br><i>Balas UNSUB untuk berhenti</i>' : '\n\n_Balas UNSUB untuk berhenti menerima pesan promo ini._');

    targets.forEach((target, index) => {
      setTimeout(async () => {
        let msg = finalMessageTemplate.replace(/\{\{name\}\}/g, target.name || target.businessName || 'Kak');
        msg = msg.replace(/\{\{businessName\}\}/g, target.businessName || '');
        
        if (channel === 'BOTH') {
           if (target.email) {
             console.log(`📧 Mengirim Broadcast Email ke ${target.email}`);
             await sendEmail(target.email, subject, msg);
             db.collection('aksena_leads').doc(target.id).collection('contact_history').add({
                type: 'EMAIL_BROADCAST',
                subject: subject,
                message: msg,
                timestamp: admin.firestore.FieldValue.serverTimestamp()
             });
           }
           if (target.phone) {
             console.log(`➡️ Mengirim Broadcast WA ke ${target.phone}`);
             db.collection('aksena_leads').doc(target.id).collection('contact_history').add({
                 type: 'WA_BROADCAST',
                 message: msg,
                 timestamp: admin.firestore.FieldValue.serverTimestamp()
             });
           }
        } else {
           let actualChannel = channel;
           // Smart Routing: Prioritaskan Email jika ada
           if (channel === 'SMART') {
             actualChannel = target.email ? 'EMAIL' : 'WA';
           }

           if (actualChannel === 'EMAIL') {
              console.log(`📧 Mengirim Broadcast Email ke ${target.email}`);
              await sendEmail(target.email, subject, msg);
              db.collection('aksena_leads').doc(target.id).collection('contact_history').add({
                 type: 'EMAIL_BROADCAST',
                 subject: subject,
                 message: msg,
                 timestamp: admin.firestore.FieldValue.serverTimestamp()
              });
           } else {
              console.log(`➡️ Mengirim Broadcast WA ke ${target.phone}`);
              db.collection('aksena_leads').doc(target.id).collection('contact_history').add({
                  type: 'WA_BROADCAST',
                  message: msg,
                  timestamp: admin.firestore.FieldValue.serverTimestamp()
              });
           }
        }
      }, index * 1000); // 1 sec delay to avoid rate limits
    });

    res.json({ status: 'Broadcast started', targetCount: targets.length });
  } catch (error) {
    console.error(error);
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
    const currentStep = leadData.nurtureStep || 0;

    // Ambil semua sequence aktif
    const seqSnap = await db.collection('drip_sequences').where('isActive', '==', true).orderBy('step', 'asc').get();
    const sequences = seqSnap.docs.map(d => d.data());

    // Cari edukasi selanjutnya (tanpa peduli urusan delayDays, karena dipaksa / di-trigger manual)
    const nextSeq = sequences.find(s => s.step > currentStep);

    if (!nextSeq) {
      return res.status(400).json({ error: 'Lead ini sudah menyelesaikan semua tahapan edukasi Drip Campaign yang tersedia.' });
    }

    let nurtureMessage = nextSeq.messageTemplate.replace(/\{\{name\}\}/g, leadData.name || leadData.businessName || 'Kak');
    nurtureMessage = nurtureMessage.replace(/\{\{businessName\}\}/g, leadData.businessName || '');

    // Omnichannel Dispatch Logic
    const hasEmail = Boolean(leadData.email);
    const hasWa = Boolean(leadData.phone);
    let usedChannel = 'WA';

    // Apabila memiliki email, ubah rute menjadi format email
    if (hasEmail) {
      usedChannel = 'EMAIL';
      const emailSubject = `Tips Bisnis Aksena - Edukasi #${nextSeq.step}`;
      const emailHtml = nurtureMessage.replace(/\n/g, '<br/>'); // Convert text to basic HTML break
      
      console.log(`📧 [DRIP MANUAL] Mengirim Email Edukasi Ke-${nextSeq.step} kepada ${leadData.email}`);
      await sendEmail(leadData.email, emailSubject, emailHtml);
      
      await db.collection('aksena_leads').doc(leadId).collection('contact_history').add({
        type: `EMAIL_NURTURE`,
        subject: emailSubject,
        message: emailHtml,
        timestamp: admin.firestore.FieldValue.serverTimestamp()
      });
    } else if (hasWa) {
      console.log(`💬 [DRIP MANUAL] Mengirim WA Edukasi Ke-${nextSeq.step} kepada ${leadData.phone || 'Unknown'}`);
      await db.collection('aksena_leads').doc(leadId).collection('contact_history').add({
        type: `WA_NURTURE`,
        message: nurtureMessage,
        timestamp: admin.firestore.FieldValue.serverTimestamp()
      });
    }

    // Update state lead
    await leadRef.update({
      stage: 'NURTURED',
      nurtureStep: nextSeq.step,
      lastContactedAt: admin.firestore.FieldValue.serverTimestamp()
    });

    res.json({ success: true, message: `Pesan Edukasi Ke-${nextSeq.step} berhasil dikirim via ${usedChannel}.` });
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
    // Ambil semua sequence aktif
    const seqSnap = await db.collection('drip_sequences').where('isActive', '==', true).orderBy('step', 'asc').get();
    if (seqSnap.empty) {
      console.log('ℹ️ [DRIP] Tidak ada Drip Sequences yang aktif di database. Skip operasi.');
      return;
    }
    const sequences = seqSnap.docs.map(d => d.data());

    const leadsRef = db.collection('aksena_leads');
    // Cari lead dengan stage NEW dan NURTURED untuk follow-up bertahap
    const snapshot = await leadsRef.where('stage', 'in', ['NEW', 'NURTURED']).get();
    
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
      
      if (data.unsubscribed === true) return; // SKIP UNSUBSCRIBED

      const diffTime = Math.abs(now - createdDate);
      const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24)); // Pembulatan mutlak ke hari
      const currentStep = data.nurtureStep || 0;

      // Cari urutan pesan yang seharusnya dikirim (Step > currentStep DAN umurnya sudah >= delayDays)
      const nextSeq = sequences.find(s => s.step > currentStep && diffDays >= s.delayDays);

      if (nextSeq) {
        let nurtureMessage = nextSeq.messageTemplate.replace(/\{\{name\}\}/g, data.name || data.businessName || 'Kak');
        nurtureMessage = nurtureMessage.replace(/\{\{businessName\}\}/g, data.businessName || '');

        const hasEmail = Boolean(data.email);
        
        if (hasEmail) {
          const emailSubject = `Update Aksena - Tips #${nextSeq.step}`;
          const emailHtml = nurtureMessage.replace(/\n/g, '<br/>');
          console.log(`📧 [AUTO-DRIP] Mengirim Email Edukasi Ke-${nextSeq.step} (H+${diffDays}) kepada ${data.email}`);
          sendEmail(data.email, emailSubject, emailHtml); // Async without await so it doesn't block batching
          
          const historyRef = docSnap.ref.collection('contact_history').doc();
          batch.set(historyRef, {
            type: `EMAIL_NURTURE`,
            subject: emailSubject,
            message: emailHtml,
            timestamp: admin.firestore.FieldValue.serverTimestamp()
          });
        } else if (data.phone) {
          console.log(`🤖 [AUTO-DRIP] Mengirim WA Edukasi Ke-${nextSeq.step} (H+${diffDays}) kepada ${data.phone}`);
          const historyRef = docSnap.ref.collection('contact_history').doc();
          batch.set(historyRef, {
            type: `WA_NURTURE`,
            message: nurtureMessage,
            timestamp: admin.firestore.FieldValue.serverTimestamp()
          });
        }

        // Update doc
        batch.update(docSnap.ref, {
          stage: 'NURTURED',
          nurtureStep: nextSeq.step,
          lastContactedAt: admin.firestore.FieldValue.serverTimestamp()
        });

        nurturedCount++;
      }
    });

    if (nurturedCount > 0) {
      await batch.commit();
      console.log(`✅ [DRIP] Scan selesai. Berhasil auto-nurture ${nurturedCount} pesan edukasi ke Leads.`);
    } else {
      console.log('✅ [DRIP] Scan selesai. Tidak ada lead yang jadwalnya kena edukasi hari ini.');
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

// ==========================================
// ROUTE 9: Scheduled Broadcast Cron Job (Setiap Menit)
// ==========================================
const runScheduledBroadcasts = async () => {
  if (!db) return;
  try {
    const now = new Date();
    const scheduledRef = db.collection('scheduled_broadcasts');
    // Ambil semua yang PENDING dan jadwalnya sudah lewat atau sama dengan SEKARANG
    const snap = await scheduledRef.where('status', '==', 'PENDING').where('scheduledAt', '<=', now).get();
    
    if (snap.empty) return;

    snap.forEach(async (doc) => {
      const job = doc.data();
      console.log(`🚀 [CRON BROADCAST] Mengeksekusi jadwal broadcast ID: ${doc.id}`);
      
      const { message, targets, channel = 'WA', subject = 'Promo Aksena Spesial' } = job;
      const finalMessageTemplate = message + (channel === 'EMAIL' ? '<br><br><i>Balas UNSUB untuk berhenti</i>' : '\n\n_Balas UNSUB untuk berhenti menerima pesan promo ini._');
      
      targets.forEach((target, i) => {
        setTimeout(async () => {
          let msg = finalMessageTemplate.replace(/\{\{name\}\}/g, target.name || target.businessName || 'Kak');
          msg = msg.replace(/\{\{businessName\}\}/g, target.businessName || '');
          
          if (channel === 'BOTH') {
             if (target.email) {
               console.log(`📧 [SCHEDULED] Mengirim Email ke ${target.email}`);
               await sendEmail(target.email, subject, msg);
               db.collection('aksena_leads').doc(target.id).collection('contact_history').add({
                  type: 'EMAIL_BROADCAST',
                  subject: subject,
                  message: msg,
                  timestamp: admin.firestore.FieldValue.serverTimestamp()
               });
             }
             if (target.phone) {
               console.log(`➡️ [SCHEDULED] Mengirim WA ke ${target.phone}`);
               db.collection('aksena_leads').doc(target.id).collection('contact_history').add({
                  type: 'WA_BROADCAST',
                  message: msg,
                  timestamp: admin.firestore.FieldValue.serverTimestamp()
               });
             }
          } else {
             let actualChannel = channel;
             if (channel === 'SMART') {
               actualChannel = target.email ? 'EMAIL' : 'WA';
             }

             if (actualChannel === 'EMAIL') {
                console.log(`📧 [SCHEDULED] Mengirim Email ke ${target.email}`);
                await sendEmail(target.email, subject, msg);
                db.collection('aksena_leads').doc(target.id).collection('contact_history').add({
                   type: 'EMAIL_BROADCAST',
                   subject: subject,
                   message: msg,
                   timestamp: admin.firestore.FieldValue.serverTimestamp()
                });
             } else {
                console.log(`➡️ [SCHEDULED] Mengirim WA ke ${target.phone}`);
                db.collection('aksena_leads').doc(target.id).collection('contact_history').add({
                   type: 'WA_BROADCAST',
                   message: msg,
                   timestamp: admin.firestore.FieldValue.serverTimestamp()
                });
             }
          }
        }, i * 1000); // delay aman 1 detik
      });

      // Tandai Selesai
      await doc.ref.update({ status: 'COMPLETED', executedAt: admin.firestore.FieldValue.serverTimestamp() });
    });
  } catch(error) {
    console.error('❌ Gagal menjalankan Scheduled Broadcasts:', error);
  }
};

cron.schedule('* * * * *', runScheduledBroadcasts);

// ==========================================
// ROUTE ACI: Dashboard Chat AI 
// ==========================================
app.post('/api/aci/chat', async (req, res) => {
  const { handleOwnerChat } = require('./aciEngine');
  const { message, role } = req.body;
  if (!message) return res.status(400).json({ error: 'Message required' });

  try {
      if (role === 'superadmin') {
          // Level Owner: Punya akses penuh Function Calling
          const reply = await handleOwnerChat(message, 'DASHBOARD_CEO', db);
          return res.json({ reply, role: 'superadmin' });
      } else {
          // Level Admin: Dibatasi aksesnya
          const lowerMsg = message.toLowerCase();
          if (lowerMsg.includes('omzet') || lowerMsg.includes('profit') || lowerMsg.includes('uang')) {
              return res.json({ reply: 'Maaf Kak, Aksena tidak diizinkan membuka data finansial/keuangan toko kepada selain level Owner. Ada hal lain yang bisa Aksena bantu carikan?', role });
          }
          const reply = await handleOwnerChat(message + " [PENTING: Jawab sebagai admin staf, JANGAN sebutkan angka omzet, modal, profit, atau HPP. Fokus ke data lead dan operasional.]", 'DASHBOARD_ADMIN', db);
          return res.json({ reply, role });
      }
  } catch (err) {
      console.error(err);
      return res.status(500).json({ error: 'ACI offline' });
  }
});

// Server sudah dinyalakan di baris paling atas (Line 11)


// Error handling to prevent crash
server.on('error', (err) => {
  console.error('❌ Server Error:', err);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('❌ Unhandled Rejection at:', promise, 'reason:', reason);
});

