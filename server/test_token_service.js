const admin = require('firebase-admin');
const { tokenService } = require('./tokenService');

// Init Firebase
const serviceAccount = require('./serviceAccountKey.json');
if (!admin.apps.length) {
    admin.initializeApp({
        credential: admin.credential.cert(serviceAccount)
    });
}
const db = admin.firestore();

async function testCoreService() {
    console.log('🧪 [SERVICE TEST] Verifikasi Core Token Service...');
    const email = 'fahmizz580@gmail.com';
    const usersSnap = await db.collection('users').where('email', '==', email).limit(1).get();
    const userId = usersSnap.docs[0].id;

    // 1. Reset Balance to 100
    console.log('🔄 Resetting balance to 100...');
    await db.collection('users').doc(userId).update({ tokenBalance: 100 });

    // 2. Deduct 10
    console.log('💸 Deducting 10 for AI_CHAT...');
    const d1 = await tokenService.deduct(db, userId, 'AI_CHAT', 'Test deduction 1');
    console.log('Result d1:', d1);

    // 3. Deduct 50
    console.log('💸 Deducting 50 for WA_SENT...');
    const d2 = await tokenService.deduct(db, userId, 'WA_SENT', 'Test deduction 2');
    console.log('Result d2:', d2);

    // 4. Final Balance Check
    const finalBalance = await tokenService.getBalance(db, userId);
    console.log(`💰 Final Balance: ${finalBalance} (Expected: 40)`);

    if (finalBalance === 40) {
        console.log('✅ [CORE VERIFIED] Token service works perfectly!');
    } else {
        console.error('❌ [FAILED] Balance mismatch.');
    }
    process.exit(0);
}

testCoreService().catch(console.error);
