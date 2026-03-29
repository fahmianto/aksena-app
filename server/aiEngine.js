const { OpenAI } = require('openai');
const Anthropic = require('@anthropic-ai/sdk');
const admin = require('firebase-admin');

// Initialize SDKs (Will gracefully degrade if keys are missing)
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY || 'DUMMY_KEY' });
const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY || 'DUMMY_KEY' });

const CLAUDE_SYSTEM_PROMPT = `Anda adalah "Aksena Assistant", seorang Sales Professional & Customer Success yang ramah, sopan, dan berempati tinggi.
Target Anda: Menjawab pertanyaan prospek (Lead) terkait produk, kendala operasional, atau harga dengan bahasa kasual, asik, ala "Kak/Sis/Agan". 
Tujuan akhir: Membangun kenyamanan dan closing. Jika ditanya harga/stok dan Anda tidak tahu pastinya, alihkan dengan elegan atau tanyakan kehati-hatian mereka dalam bisnis. JANGAN TERDENGAR SEPERTI ROBOT.`;

const GPT_ROUTER_PROMPT = `You are a strict Routing Agent for a CRM system. 
You will receive a user message. You must classify its intent into exactly ONE of the following keywords:
- "SYSTEM_ACTION" : if the user asks to check stock, track an order, create an invoice, or something that strictly requires database access.
- "SALES_CHAT" : if the user is asking about product benefits, complaining about price, casual chatting, or asking general advice.

Reply ONLY with the exact keyword, nothing else.`;

/**
 * Handle Incoming Chat via Multi-Agent Architecture
 */
const handleIncomingChat = async (textMessage, lead, leadRef, db) => {
  try {
    // 1. Catat Inbound Message ke Firestore (History)
    await leadRef.collection('contact_history').add({
      type: 'WA_INBOUND',
      message: textMessage,
      timestamp: admin.firestore.FieldValue.serverTimestamp()
    });

    console.log(`🧠 [Router] Menganalisa intent pesan: "${textMessage}"`);

    let intent = 'SALES_CHAT'; // Default

    // 2. The Router (OpenAI GPT-4o-mini)
    // Cek apakah API Key valid, jika DUMMY kita skip router dan langsung ke Mock/Fallback
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
    } else {
        console.warn('⚠️ [Router] OPENAI_API_KEY tidak valid/DUMMY. Menggunakan default routing: SALES_CHAT.');
    }

    let aiReply = '';

    // 3. Routing Logic
    if (intent === 'SYSTEM_ACTION') {
        // [Node 2: SYSTEM ACTION] 
        // Saat ini karena fitur cek stok live via WA belum full rilis, kita balas via GPT atau Mock
        console.log(`⚙️ [System Exec] Menjalankan rute aksi sistem...`);
        aiReply = `Halo Kak ${lead.name || ''}, untuk pengecekan data sistem (stok/resi/invoice) saat ini sedang dalam maintenance singkat. Ada hal lain yang bisa dibantu terkait produknya?`;
        
        // FUTURE WOKR: Execute OpenAI Function Calling here (e.g., checkInventory(item))
    } else {
        // [Node 3: THE EXPERT CLOSER - Claude 3.5 Haiku]
        console.log(`💬 [The Closer] Mengoper ke Claude 3.5 Haiku...`);
        
        if (process.env.ANTHROPIC_API_KEY && process.env.ANTHROPIC_API_KEY !== 'DUMMY_KEY') {
            
            // Ambil 5 chat terakhir dari Firestore untuk Context Memory
            const historySnap = await leadRef.collection('contact_history')
                .where('type', 'in', ['WA_INBOUND', 'WA_OUTBOUND_AI'])
                .orderBy('timestamp', 'desc')
                .limit(5)
                .get();
                
            const messagesHistory = [];
            historySnap.forEach(doc => {
                const data = doc.data();
                const role = data.type === 'WA_INBOUND' ? 'user' : 'assistant';
                // Claude requires alternating 'user' / 'assistant', so we just prepend to keep chronological
                messagesHistory.unshift({ role, content: data.message });
            });

            // Ensure the last message is from the user (which is current textMessage)
            // Actually, we already saved it above, so it should be in the snapshot.
            // But to be safe, if history is empty, we force push.
            if (messagesHistory.length === 0 || messagesHistory[messagesHistory.length-1].content !== textMessage) {
                messagesHistory.push({ role: 'user', content: textMessage });
            }

            // Claude API Call
            const claudeResponse = await anthropic.messages.create({
                model: "claude-3-haiku-20240307", // Menggunakan Haiku untuk speed & cost-efficiency
                max_tokens: 300,
                system: CLAUDE_SYSTEM_PROMPT,
                messages: messagesHistory
            });

            aiReply = claudeResponse.content[0].text;
        } else {
            console.warn('⚠️ [The Closer] ANTHROPIC_API_KEY tidak valid/DUMMY. Menggunakan Fallback Mock.');
            aiReply = `Wah wajar banget Kak ${lead.name || ''}! Kalau boleh tahu lebih dalam, kendala operasional apa sih yang paling menguras tenaga Kakak saat ini? (Pesan ini adalah MOCK karena API Key belum diset)`;
        }
    }

    // 4. Jeda buatan (Typing effect simulation) & Send
    setTimeout(async () => {
        console.log(`🤖💬 [AI Outbound] Merespon ke ${lead.name || 'Prospek'}: "${aiReply}"`);
        
        // Catat Pesan Keluar (OUTBOUND AI) ke Firestore
        await leadRef.collection('contact_history').add({
            type: 'WA_OUTBOUND_AI',
            message: aiReply,
            timestamp: admin.firestore.FieldValue.serverTimestamp()
        });
        
    }, 2000);

  } catch (error) {
    console.error('❌ [aiEngine] Error saat memproses chat:', error);
  }
};

module.exports = {
  handleIncomingChat
};
