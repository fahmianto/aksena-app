const admin = require('firebase-admin');

// Init Firebase
const serviceAccount = require('./serviceAccountKey.json');
if (!admin.apps.length) {
    admin.initializeApp({
        credential: admin.credential.cert(serviceAccount)
    });
}
const db = admin.firestore();

async function checkBilling() {
    console.log('🏦 [Billing Audit] Memeriksa saldo dan transaksi...');
    
    const email = 'fahmizz580@gmail.com';
    const usersSnap = await db.collection('users').where('email', '==', email).limit(1).get();
    
    if (usersSnap.empty) {
        console.error('❌ User tidak ditemukan!');
        return;
    }

    const userDoc = usersSnap.docs[0];
    const balance = userDoc.data().tokenBalance || 0;
    console.log(`👤 User: ${email}`);
    console.log(`💰 Saldo Saat Ini: ${balance} Tokens`);

    console.log('\n📜 5 Transaksi Terakhir:');
    const logsSnap = await db.collection('token_transactions')
        .where('userId', '==', userDoc.id)
        .orderBy('timestamp', 'desc')
        .limit(5)
        .get();

    logsSnap.forEach(doc => {
        const data = doc.data();
        const time = data.timestamp ? data.timestamp.toDate().toLocaleString() : 'N/A';
        console.log(`- [${time}] ${data.type}: ${data.amount} Tokens (${data.description})`);
    });

    process.exit(0);
}

checkBilling().catch(console.error);
