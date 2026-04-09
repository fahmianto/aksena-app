const admin = require('firebase-admin');
const { handleIncomingChat } = require('./aiEngine');
const notificationService = require('./notificationService');
const { tokenService } = require('./tokenService');

// Init Firebase
const serviceAccount = require('./serviceAccountKey.json');
if (!admin.apps.length) {
    admin.initializeApp({
        credential: admin.credential.cert(serviceAccount)
    });
}
const db = admin.firestore();

async function runTest() {
    const email = 'fahmizz580@gmail.com';
    console.log(`🧪 [Token Test] Memulai verifikasi untuk ${email}...`);

    const usersSnap = await db.collection('users').where('email', '==', email).limit(1).get();
    const ownerId = usersSnap.docs[0].id;
    const initialBalance = await tokenService.getBalance(db, ownerId);
    console.log(`💰 Saldo Awal: ${initialBalance} Tokens`);

    // 1. Simulasi Chat AI (Cost 10)
    console.log('\n🤖 [Step 1] Simulasi Chat AI...');
    const mockLead = { name: 'Customer Test', phone: '08123' };
    const mockLeadRef = db.collection('aksena_leads').doc('test-lead-id');
    // UID is found inside handleIncomingChat via super_admin query
    await handleIncomingChat("Halo AI, cek stok sepatu dong", mockLead, mockLeadRef, db, 'WA');

    // 2. Simulasi WA Sent (Cost 5)
    console.log('\n📱 [Step 2] Simulasi WA Sent...');
    await notificationService.sendWA('0812345678', 'Test WA Token', db, ownerId);

    // 3. Simulasi Email Sent (Cost 2)
    console.log('\n📧 [Step 3] Simulasi Email Sent...');
    await notificationService.sendEmail('test@gmail.com', 'Test Email Token', '<p>Test</p>', db, ownerId);

    // Final Check
    setTimeout(async () => {
        const finalBalance = await tokenService.getBalance(db, ownerId);
        const diff = initialBalance - finalBalance;
        const EXPECTED_DIFF = 17; // 10 (AI) + 5 (WA) + 2 (Email)

        console.log(`\n✅ Test Selesai!`);
        console.log(`💰 Saldo Akhir: ${finalBalance} Tokens`);
        console.log(`📉 Total Terpakai: ${diff} Tokens (Expected: ${EXPECTED_DIFF})`);
        
        if (diff === EXPECTED_DIFF) {
            console.log('🌟 [VERIFIED] Ekonomi Token Berjalan Sempurna!');
        } else {
            console.log('⚠️ [WARNING] Ada ketidaksesuaian perhitungan.');
        }
        process.exit(0);
    }, 2000);
}

runTest().catch(console.error);
