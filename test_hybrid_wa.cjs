const notificationService = require('./server/notificationService.js');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, 'server', '.env') });

async function testHybridWA() {
    console.log('--- 🤖 AKSENA HYBRID WA TEST ENGINE ---');
    console.log('📅 Time:', new Date().toLocaleString());
    console.log('🚀 Memulai Prosedur Pengetesan...');

    const testNumber = '6281112015979'; // Nomor Aksena sendiri untuk tes

    // 1. Tes Jalur MARKETING (Fonnte) - Biaya Rp 0
    console.log('\n--- 🟡 Jalur MARKETING (Fonnte) ---');
    console.log('📡 Menghubungkan ke Gateway...');
    const resMarketing = await notificationService.sendWA(testNumber, 'Tes Pesan Promo Aksena via Fonnte 🚀', null, null, 'MARKETING');
    
    if (resMarketing.success) {
        console.log('✅ STATUS: BERHASIL');
        if (resMarketing.simulation) console.log('⚠️ INFO: Mode Simulasi (Token belum diset)');
    } else {
        console.log('❌ STATUS: GAGAL');
        console.log('📝 DETAIL:', resMarketing.error);
    }

    // 2. Tes Jalur SERVICE (Meta)
    console.log('\n--- 🔵 Jalur SERVICE (Meta Cloud API) ---');
    console.log('🛡️ Menghubungkan ke Official API...');
    const resService = await notificationService.sendWA(testNumber, 'Tes Pesan Service Aksena via Meta 🛡️', null, null, 'SERVICE');
    
    if (resService.success) {
        console.log('✅ STATUS: BERHASIL');
        if (resService.simulation) console.log('☁️ INFO: Mode Simulasi (Meta Cloud Token belum diset)');
    } else {
        console.log('❌ STATUS: GAGAL');
        console.log('📝 DETAIL:', resService.error);
    }

    console.log('\n=======================================');
    console.log('✅ SELURUH PENGETESAN SELESAI.');
    console.log('=======================================');
}

testHybridWA().catch(err => {
    console.error('💥 CRITICAL ERROR:', err);
});
