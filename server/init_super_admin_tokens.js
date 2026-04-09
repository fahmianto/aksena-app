const admin = require('firebase-admin');
const path = require('path');

// Init Firebase
const serviceAccount = require('./serviceAccountKey.json');
if (!admin.apps.length) {
    admin.initializeApp({
        credential: admin.credential.cert(serviceAccount)
    });
}
const db = admin.firestore();

async function initTokens() {
    const email = 'fahmizz580@gmail.com';
    console.log(`🏦 [Token Init] Menambahkan 1.000 token untuk ${email}...`);

    const usersSnap = await db.collection('users').where('email', '==', email).limit(1).get();
    
    if (usersSnap.empty) {
        console.error('❌ User tidak ditemukan!');
        return;
    }

    const userRef = usersSnap.docs[0].ref;
    await userRef.update({
        tokenBalance: 1000
    });

    console.log('✅ Token berhasil ditambahkan! Saldo: 1.000 Tokens (Rp 100rb Value)');
    process.exit(0);
}

initTokens().catch(console.error);
