const { OpenAI } = require('openai');
require('dotenv').config();

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY || 'DUMMY_KEY' });

const ABI_SYSTEM_PROMPT = `Sebagai Aksena, Asisten Bisnis Digital Proaktif untuk Owner Toko. 
Tugasmu: Menganalisis tren, mendeteksi masalah sebelum terjadi, dan memberikan saran strategis yang berorientasi pada profit (Cuan).

1. Prinsip Komunikasi (Tone of Voice):
- Profesional namun Akrab: Gunakan sapaan "Bos" atau "Owner".
- Data-Driven: Jangan berasumsi. Gunakan angka dari hasil eksekusi Function/Tools untuk mendukung setiap jawaban.
- Solution-Oriented: Jika ada masalah (stok habis/omzet turun), jangan cuma lapor. Berikan minimal 2 opsi solusi nyata.

2. Logika Analisis (The Reasoning Framework):
- Konteks: Ambil data dari sistem menggunakan tool.
- Anomali: Cari perbedaan mencolok atau bahaya tersembunyi.
- Rekomendasi: Berikan langkah konkret.

3. Contoh Skenario:
- Jika stok barang laku ada yang kritis: "Bos, stok [Barang] sisa sedikit. Mau saya buatkan draf PO?"
- Jika ada 'Stok Mati' (Slow Moving): "Bos, ada modal tertahan di stok mati. Gimana kalau kita bikin Flash Sale?"
- Jika Owner tanya "omzet" atau "leads": Tolong narik data dari database lalu presentasikan.`;

// -----------------------------------------------------------------
// TOOLS: Database Getter Functions (Mocked execution for V1)
// -----------------------------------------------------------------
async function get_inventory_snapshot(db) {
    if(!db) return JSON.stringify({ error: "Database not connected" });
    try {
        const snap = await db.collection('aksena_inventory').get();
        let totalItems = 0;
        let slowMovingCount = 0;
        let slowMovingValue = 0;
        let fastMovingCount = 0;
        
        let details = [];

        snap.forEach(doc => {
            const data = doc.data();
            totalItems++;
            const price = data.price || 0;
            const stock = data.stockQuantity || 0;
            const value = price * stock;

            details.push({
                productName: data.productName,
                stock: stock,
                price: price,
                status: data.isSlowMoving ? 'SLOW' : 'NORMAL'
            });

            if (data.isSlowMoving) {
                slowMovingCount++;
                slowMovingValue += value;
            } else {
                fastMovingCount++;
            }
        });

        const report = {
            total_unique_items: totalItems,
            slow_moving_items: slowMovingCount,
            capital_stuck_in_slow_moving: slowMovingValue,
            fast_moving_items: fastMovingCount,
            inventory_details: details.slice(0, 20) // Limit to top 20 to save tokens
        };
        console.log("📊 [ACI Tool] Memanggil get_inventory_snapshot");
        return JSON.stringify(report);
    } catch (e) {
        return JSON.stringify({ error: e.message });
    }
}

async function get_pipeline_metrics(db) {
    if(!db) return JSON.stringify({ error: "Database not connected" });
    try {
        const snap = await db.collection('aksena_leads').get();
        let totalLeads = 0;
        let stages = {};

        snap.forEach(doc => {
            const data = doc.data();
            totalLeads++;
            const stage = data.pipelineStage || 'NEW_LEAD';
            stages[stage] = (stages[stage] || 0) + 1;
        });

        console.log("📊 [ACI Tool] Memanggil get_pipeline_metrics");
        return JSON.stringify({
            total_leads_in_pipeline: totalLeads,
            leads_per_stage: stages
        });
    } catch (e) {
        return JSON.stringify({ error: e.message });
    }
}

// -----------------------------------------------------------------
// ACI ENGINE: The Master Brain
// -----------------------------------------------------------------
const handleOwnerChat = async (textMessage, senderPhone, db) => {
    console.log(`🧠 [The Master Brain] Bos (${senderPhone}) Bertanya: "${textMessage}"`);
    
    // Tools Definition
    const tools = [
        {
            type: "function",
            function: {
                name: "get_inventory_snapshot",
                description: "Menarik ringkasan stok gudang, termasuk mendeteksi stok mati (slow moving) dan nilai modal yang tertahan (HPP).",
                parameters: { type: "object", properties: {}, additionalProperties: false }
            }
        },
        {
            type: "function",
            function: {
                name: "get_pipeline_metrics",
                description: "Mendapatkan jumlah prospek (leads) yang terbagi di masing-masing tahap Pipeline penjualan.",
                parameters: { type: "object", properties: {}, additionalProperties: false }
            }
        }
    ];

    try {
        const messages = [
            { role: "system", content: ABI_SYSTEM_PROMPT },
            { role: "user", content: textMessage }
        ];

        const isMockMode = !process.env.OPENAI_API_KEY || process.env.OPENAI_API_KEY.includes('sk-proj-...');

        if (isMockMode) {
            console.log("⚠️ [ACI] Berjalan dalam Mock Mode (OpenAI Key belum di-set)");
            
            // Menggunakan hardcoded mock data agar UI bisa dites sempurna tanpa bergantung ke DB/OpenAI
            const parsed = {
                total_unique_items: 120,
                slow_moving_items: 24,
                capital_stuck_in_slow_moving: 15500000,
                fast_moving_items: 96
            };
            const nominalStuck = parsed.capital_stuck_in_slow_moving ? parsed.capital_stuck_in_slow_moving.toLocaleString('id-ID') : '0';
            
            if (messages[1].content.toLowerCase().includes('admin')) {
              return `Halo Kak! Dari tarikan data saya, saat ini total ada **${parsed.total_unique_items} SKU** aktif di gudang. Ada **${parsed.slow_moving_items} item** *slow moving* yang perlu perhatian khusus ya. Mau saya bantu buatkan draf pesan broadcast promo untuk cuci gudang?`;
            }

            return `Siap Bos! Terkait omzet hari ini sedang dikalkulasi, namun ada hal krusial yang pantauan saya temukan:\n\nSaat ini ada **${parsed.slow_moving_items} item** berstatus *slow moving* dengan total modal kita yang mengendap tertahan (HPP) sebesar **Rp${nominalStuck}**.\n\nSaran taktis saya:\n1. Segera adakan *flash sale* akhir bulan untuk produk tersebut.\n2. Lakukan *bundling* dengan ${parsed.fast_moving_items} produk penyumbang omzet (*fast moving*).\n\nMau saya tarik data detail produk matinya Bos?`;
        }

        // 1. Initial Prompt with Tools
        const response1 = await openai.chat.completions.create({
            model: "gpt-4o-mini",
            messages: messages,
            tools: tools
        });

        const message1 = response1.choices[0].message;
        
        // Cek apakah AI ingin menjalankan Tool Function
        if (message1.tool_calls) {
            messages.push(message1); // Konvensi OpenAI: tambahkan respons AI ke array messages sebelum melempar hasil tool

            for (const toolCall of message1.tool_calls) {
                const functionName = toolCall.function.name;
                let functionResponse = "{}";

                if (functionName === 'get_inventory_snapshot') {
                    functionResponse = await get_inventory_snapshot(db);
                } else if (functionName === 'get_pipeline_metrics') {
                    functionResponse = await get_pipeline_metrics(db);
                }

                messages.push({
                    tool_call_id: toolCall.id,
                    role: "tool",
                    name: functionName,
                    content: functionResponse
                });
            }

            // 2. Kirim Hasil Data Kemabali ke GPT untuk Dianalisa layaknya Konsultan
            const finalResponse = await openai.chat.completions.create({
                model: "gpt-4o-mini",
                messages: messages,
            });

            return finalResponse.choices[0].message.content;
        }

        // Kalau tidak pakai Tool, balas biasa
        return message1.content;

    } catch (error) {
        console.error('❌ [ACI Engine] Error saat proses Brain:', error);
        return "Aksena agak pusing nih Bos, koneksi API atau tokennya mungkin bermasalah. Cek Server Log ya!";
    }
};

module.exports = {
    handleOwnerChat
};
