const { OpenAI } = require('openai');
const Anthropic = require('@anthropic-ai/sdk');
const admin = require('firebase-admin');
const { tokenService } = require('./tokenService');
const notificationService = require('./notificationService');
const { privacyEngine } = require('./privacyEngine');

// Initialize SDKs
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY || 'DUMMY_KEY' });
const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY || 'DUMMY_KEY' });

/**
 * Ambil riwayat belanja pelanggan untuk personalisasi AI
 */
const findCustomerHistory = async (db, lead) => {
    try {
        const phone = lead.phone || null;
        const ig_sid = lead.ig_sid || null;
        
        let txQuery;
        if (phone) {
            txQuery = db.collection('transactions').where('phone', '==', phone).orderBy('createdAt', 'desc').limit(3);
        } else if (ig_sid) {
            txQuery = db.collection('transactions').where('ig_sid', '==', ig_sid).orderBy('createdAt', 'desc').limit(3);
        } else {
            return null;
        }

        const snap = await txQuery.get();
        if (snap.empty) return null;

        let history = "RIWAYAT BELANJA PELANGGAN INI:\n";
        snap.forEach(doc => {
            const data = doc.data();
            const date = data.createdAt ? (data.createdAt.toDate ? data.createdAt.toDate().toLocaleDateString('id-ID') : new Date(data.createdAt).toLocaleDateString('id-ID')) : 'Baru-baru ini';
            history += `- ${date}: Beli ${data.productName || 'Produk'} (${data.variant || 'No Variant'}). Status: ${data.status}\n`;
        });
        return history;
    } catch (err) {
        console.error('❌ [findCustomerHistory] Error:', err);
        return null;
    }
};

/**
 * Generate Dynamic System Prompt based on Owner Settings & The Brain
 */
const getSystemPrompt = (links, source, customerHistory = null, slowMovingProducts = null, knowledge = "") => {
  const { shopeeUrl, tokopediaUrl, tiktokUrl, businessName = 'Aksena' } = links;
  
  let sourceContext = '';
  if (source === 'SHOPEE') sourceContext = `Pelanggan chat dari Shopee. Prioritaskan checkout via link produk Shopee: ${shopeeUrl || 'toko Shopee kami'}.`;
  if (source === 'TOKOPEDIA') sourceContext = `Pelanggan chat dari Tokopedia. Prioritaskan checkout via Tokopedia: ${tokopediaUrl || 'toko Tokopedia kami'}.`;
  if (source === 'TIKTOK') sourceContext = `Pelanggan chat dari TikTok Shop. Gunakan link TikTok: ${tiktokUrl || 'keranjang kuning TikTok kami'}.`;
  if (source === 'IG_DM') sourceContext = `Pelanggan chat via Instagram DM. Jika percakapan mulai serius (tanya harga, detail produk, atau checkout), WAJIB arahkan ke WhatsApp resmi kami [wa.me/628123456789] dengan alasan: "Agar bisa kami buatkan invoice resmi dan akses payment gateway yang lebih aman".`;
  if (source === 'IG_COMMENT') sourceContext = `Pelanggan bertanya via Komentar Instagram. Tugas Anda adalah membalas secara publik di komentar dengan: "Siap Kak! Detailnya sudah kami kirim ke DM ya, silakan dicek 😊". Lalu kirimkan pesan detail produk via DM.`;
  if (source === 'WA') sourceContext = `Pelanggan chat via WhatsApp. Ini adalah jalur utama transaksi. Berikan informasi produk dan bantu proses closing dengan pembuatan invoice.`;

  const historyContext = customerHistory ? `\n[VVIP RECOGNITION]:\n${customerHistory}\nSapa pelanggan dengan sangat hangat karena mereka sudah pernah beli sebelumnya. Sebutkan produk favorit/terakhir mereka jika relevan agar mereka merasa dikenali.` : '';

  const liquidationContext = slowMovingProducts ? `\n[SMART LIQUIDATION - PRIORITAS PROMO]:\nProduk berikut sedang dalam pembersihan gudang (cuci gudang):\n${slowMovingProducts}\nTawarkan produk ini sebagai paket bundling atau alternatif jika produk utama tidak cocok. Berikan diskon spesial (misal: "Khusus hari ini ada diskon tambahan untuk item ini Kak!").` : '';

  return `Anda adalah "Aksena Assistant", Sales Professional untuk ${businessName}. Ramah, solutif, dan proaktif.
Tugas khusus Anda (Omni-channel):
1. [CONTEXT]: ${sourceContext}${historyContext}${liquidationContext}
[BRAND KNOWLEDGE]:
${knowledge}

2. [INSTAGRAM COMMENT/REACTION]:
      - Jika ada pesan "[STORY_REACTION]", itu berarti lead mereaksi Story. Balas dengan sangat antusias di DM.
      - Jika ada pesan "[COMMENT_ON_MEDIA_...]", balas komentarnya secara publik dengan mengarahkan ke DM.
3. [PRIVACY PIVOT]: Selalu giring percakapan dari Instagram ke WhatsApp untuk diskusi harga, nego, dan pembayaran invoice demi privasi dan keamanan data kontak.
4. [SYSTEM_ACTION]: Jika ada data stok/resi dari sistem, sampaikan dengan jelas dan tawarkan bantuan checkout.
5. Target utama: Nurturing leads dan meminimalisir "Chat Response Rate" yang telat.`;
};

const GPT_ROUTER_PROMPT = `You are a strict Routing Agent for a CRM system. 
You will receive a user message. You must classify its intent into exactly ONE of the following keywords:
- "SYSTEM_ACTION" : if the user asks to check stock, track an order, or create an invoice.
- "HOT_INTENT" : if the user shows strong buying intent (asking for price, payment method, asking how to buy).
- "SALES_CHAT" : for general questions, product benefits, or casual chatting.

Reply ONLY with the exact keyword, nothing else.`;

/**
 * Execute System Action (Real Data Check)
 */
const executeSystemAction = async (text, db) => {
    const query = text.toLowerCase();
    
    // 1. Cek Stok
    if (query.includes('stok') || query.includes('ready')) {
        const snapshot = await db.collection('products').get();
        let foundProduct = null;
        snapshot.forEach(doc => {
            const data = doc.data();
            if (query.includes(data.name.toLowerCase()) || query.includes(data.sku?.toLowerCase())) {
                foundProduct = data;
            }
        });

        if (foundProduct) {
            const status = foundProduct.stock > 0 ? "Ready Kak! ✅" : "Waduh, lagi habis Kak. ❌";
            return `${status} Stok ${foundProduct.name} saat ini sisa ${foundProduct.stock} pcs. Mau langsung keep sebelum kehabisan?`;
        }
    }

    // 2. Cek Order/Resi
    if (query.includes('resi') || query.includes('pesanan') || query.includes('lacak') || query.includes('status')) {
      try {
        // Extract ID (Order ID: #AKS-123) or Phone (08...)
        const idMatch = text.match(/(?:#)?(AKS-[A-Z0-9-]{3,10})/i);
        const phoneMatch = text.match(/(08\d{8,12})/);
        const awbMatch = text.match(/(AKSN\d{5,15}|JP\d{8,12}|JN\d{8,12})/i); // Added AKSN for our simulated ones

        const searchId = idMatch ? idMatch[1].toUpperCase() : null;
        const searchPhone = phoneMatch ? phoneMatch[1] : null;
        const searchAwb = awbMatch ? awbMatch[1].toUpperCase() : null;

        if (!searchId && !searchPhone && !searchAwb) {
          return "Boleh dibantu nomor HP atau nomor ordernya Kak? Biar AI Aksena bantu lacak di sistem gudang sekarang juga. 😊";
        }

        let snap = null;
        if (searchId) snap = await db.collection('transactions').where('orderId', '==', searchId).limit(1).get();
        if ((!snap || snap.empty) && searchAwb) snap = await db.collection('transactions').where('awb', '==', searchAwb).limit(1).get();
        if ((!snap || snap.empty) && searchPhone) snap = await db.collection('transactions').where('phone', '==', searchPhone).orderBy('createdAt', 'desc').limit(3).get();
        
        if (!snap || snap.empty) {
          return `Waduh, pesanan Kakak belum ketemu nih di sistem. Pastikan nomor ordernya sudah benar ya (Contoh: AKS-001) atau kasih nomor HP pas checkout.`;
        }

        const orders = [];
        snap.forEach(d => orders.push(d.data()));
        
        if (orders.length > 1) {
          let list = `Ketemu! Ada ${orders.length} pesanan terakhir Kakak:\n`;
          orders.forEach((o, i) => {
            list += `${i+1}. ${o.orderId} - *${o.status}* (Resi: ${o.awb || 'Proc'})\n`;
          });
          return list + "\nMau dibantu cek detail salah satunya?";
        }

        const order = orders[0];
        const status = order.status || 'Sedang Diproses';
        const awb = order.awb || 'Belum di-generate';

        let reply = `Ketemu Kak! Pesanan ${order.orderId} saat ini berstatus: *${status}* ✨\n`;
        if (awb !== 'Belum di-generate' && awb !== 'Belum ada') {
          reply += `📦 Nomor Resi: ${awb}\n`;
          reply += `🔗 Tracking 24/7 di: https://aksena.id/#/tracking?awb=${awb}\n`;
        } else {
          reply += `📦 Paket Kakak sedang disiapkan oleh tim gudang. Resi otomatis akan muncul di sini segera setelah paket diserahkan ke kurir ya!\n`;
        }
        reply += `\nEstimasi perjalanan: 2-3 hari. Ada pertanyaan lain yang bisa dibantu, Kak?`;
        
        return reply;
      } catch (err) {
        console.error('❌ Error Tracking:', err);
        return "Sistem tracking Aksena lagi sedikit sibuk nih. Boleh coba ketik nomor order/HP lagi Kak?";
      }
    }

    return "Sedang mengecek data sistem... Ada hal spesifik yang ingin Kakak tanyakan soal stok atau pesanan?";
};

/**
 * Handle Incoming Chat via Multi-Agent Architecture
 */
const handleIncomingChat = async (textMessage, lead, leadRef, db, source = 'WA') => {
  try {
    const channelIcons = { 'IG': '📸', 'WA': '💬', 'SHOPEE': '🛍️', 'TOKOPEDIA': '📦', 'TIKTOK': '🎵' };
    const prefix = `${channelIcons[source] || '💬'} [${source}]`;
    const historyTypeIn = `${source}_INBOUND`;
    const historyTypeOut = `${source}_OUTBOUND_AI`;

    // 1. Catat Inbound Message
    await leadRef.collection('contact_history').add({
      type: historyTypeIn,
      message: textMessage,
      timestamp: admin.firestore.FieldValue.serverTimestamp()
    });

    console.log(`${prefix} 🧠 [Router] Menganalisa intent: "${textMessage}"`);

    // 2. Ambil Config Owner (Marketplace Links & UID)
    const usersSnap = await db.collection('users').where('role', '==', 'super_admin').limit(1).get();
    if (usersSnap.empty) {
        console.warn('⚠️ No Super Admin found for token billing.');
        return;
    }
    const ownerDoc = usersSnap.docs[0];
    const ownerData = ownerDoc.data();
    const ownerId = ownerDoc.id;

    // === PRIVACY/BIG DATA ENGINE ===
    // Sembunyikan PII sebelum masuk ke log analisa/investor (Big Data)
    const anonymizedMsg = privacyEngine.maskPII(textMessage);
    await db.collection('big_data_insights').add({
       userId: ownerId,
       source: source,
       maskedMessage: anonymizedMsg,
       isClosingIntent: intent === 'HOT_INTENT',
       timestamp: admin.firestore.FieldValue.serverTimestamp()
    });
    // ===============================

    const configLinks = {
        shopeeUrl: ownerData.shopeeUrl || '',
        tokopediaUrl: ownerData.tokopediaUrl || '',
        tiktokUrl: ownerData.tiktokUrl || '',
        businessName: ownerData.business || 'Aksena'
    };

    // 2.5. Ambil Knowledge Base (The Brain / RAG)
    const brainSnap = await db.collection('brain_knowledge').doc(ownerId).get();
    const brainData = brainSnap.exists ? brainSnap.data() : {};
    const knowledgeContext = `
[BUSINESS CONTEXT]: ${brainData.businessContext || 'Sales Professional'}
[USP & BENEFITS]: ${brainData.uspAndBenefits || ''}
[FAQ]: ${brainData.faq || ''}
[SHIPPING POLICY]: ${brainData.shippingPolicy || ''}
`.trim();

    let intent = 'SALES_CHAT'; 

    // 3. The Router (OpenAI)
    if (process.env.OPENAI_API_KEY && process.env.OPENAI_API_KEY !== 'DUMMY_KEY') {
        const routerResponse = await openai.chat.completions.create({
            model: "gpt-4o-mini",
            messages: [
                { role: "system", content: GPT_ROUTER_PROMPT },
                { role: "user", content: textMessage }
            ],
            temperature: 0,
            max_tokens: 10
        });
        intent = routerResponse.choices[0].message.content.trim();
        console.log(`🧭 [Router] Keputusan: ${intent}`);
    }

    // 3.5. Biaya AI Brain (Econ Token Check)
    const tokenCheck = await tokenService.deduct(db, ownerId, 'AI_CHAT', `Chat: ${textMessage.substring(0, 20)}...`);
    if (!tokenCheck.success && tokenCheck.error === 'INSUFFICIENT_TOKENS') {
        aiReply = `⚠️ [BILLING] Saldo Aksena Token Anda tidak cukup untuk merespon chat ini. Silakan top-up via Dashboard agar ACI tetap aktif. 😊`;
        console.warn(`🛑 [Billing] Insufficient tokens for user ${ownerId}`);
    } else if (intent === 'SYSTEM_ACTION') {
        console.log(`⚙️ [System Exec] Menjalankan rute aksi sistem...`);
        aiReply = await executeSystemAction(textMessage, db);
    } else {
        console.log(`💬 [The Closer] Mengoper ke Claude 3.5 Haiku...`);
        
        // 3.8. Cek Riwayat Belanja (VVIP Recognition)
        const customerHistory = await findCustomerHistory(db, lead);
        if (customerHistory) console.log(`💎 [VVIP] Customer History ditemukan! Menyiapkan respon personal.`);

        // 3.9. Cek Produk Dead Stock (Smart Liquidation)
        let slowMovingContext = "";
        const slowSnap = await db.collection('products').where('stock_status', '==', 'Red').limit(2).get();
        if (!slowSnap.empty) {
            slowSnap.forEach(doc => {
                const p = doc.data();
                slowMovingContext += `- ${p.name} (SKU: ${p.sku}) Harga Asli: ${p.price}\n`;
            });
            console.log(`🚨 [ASL] Dead Stock ditemukan! Mengarahkan AI untuk likuidasi.`);
        }

        if (process.env.ANTHROPIC_API_KEY && process.env.ANTHROPIC_API_KEY !== 'DUMMY_KEY') {
            const historySnap = await leadRef.collection('contact_history')
                .orderBy('timestamp', 'desc')
                .limit(5)
                .get();
                
            const messagesHistory = [];
            historySnap.forEach(doc => {
                const data = doc.data();
                const role = data.type.includes('INBOUND') ? 'user' : 'assistant';
                messagesHistory.unshift({ role, content: data.message });
            });

            let finalUserMessage = textMessage;
            if (intent === 'HOT_INTENT') {
                finalUserMessage = `[SYSTEM_HINT: HOT INTENT. Fokus ke closing & arahkan ke link Marketplace/WA.]\n\n${textMessage}`;
            }
            if (textMessage.includes('[STORY_REACTION]')) {
                finalUserMessage = `[SYSTEM_HINT: CUSTOMER BEREAKSI PADA STORY KITA. Tugas Anda: 1. Balas dengan EKSPRESIF dan KEPO (misal: "Wah makasih love-nya Kak! 😍 Suka banget ya sama item yang ini?"). 2. Tawarkan varian warna/promo terkait dengan teknik SOFT SELLING. Jangan kaku.]\n\n${textMessage}`;
            }

            const isAnthropicReady = process.env.ANTHROPIC_API_KEY && !process.env.ANTHROPIC_API_KEY.includes('sk-ant-api03');
            
            if (isAnthropicReady) {
                const claudeResponse = await anthropic.messages.create({
                    model: "claude-3-haiku-20240307",
                    max_tokens: 300,
                    system: getSystemPrompt(configLinks, source, customerHistory, slowMovingContext, knowledgeContext),
                    messages: messagesHistory.length > 0 ? messagesHistory : [{ role: 'user', content: finalUserMessage }]
                });
                aiReply = claudeResponse.content[0].text;
            } else if (process.env.OPENAI_API_KEY) {
                // Fallback ke OpenAI jika Anthropic belum ada key asli
                const oaiResponse = await openai.chat.completions.create({
                    model: "gpt-4o-mini",
                    messages: [
                        { role: "system", content: getSystemPrompt(configLinks, source, customerHistory, slowMovingContext, knowledgeContext) },
                        ...messagesHistory,
                        { role: "user", content: finalUserMessage }
                    ],
                    max_tokens: 300
                });
                aiReply = oaiResponse.choices[0].message.content;
            } else {
                aiReply = `Halo Kak ${lead.name || ''}! Ada yang bisa dibantu mengenai ${configLinks.businessName}? (Pending API Setup)`;
            }
        }
    }

    // 5. Send Response (REAL OUTBOUND)
    setTimeout(async () => {
        console.log(`${prefix} 🤖💬 [AI Outbound] Merespon: "${aiReply}"`);
        
        // A. Catat ke History
        await leadRef.collection('contact_history').add({
            type: historyTypeOut,
            message: aiReply,
            timestamp: admin.firestore.FieldValue.serverTimestamp()
        });

        // B. Kirim ke Channel Asli
        if (source === 'WA' && lead.phone) {
            await notificationService.sendWA(lead.phone, aiReply, db, ownerId);
        } else if ((source === 'IG_DM' || source === 'IG_COMMENT' || source === 'IG') && lead.ig_sid) {
            await notificationService.sendInstagramDM(lead.ig_sid, aiReply);
        }
    }, 1500);

  } catch (error) {
    console.error('❌ [aiEngine] Error:', error);
  }
};

module.exports = {
  handleIncomingChat
};
