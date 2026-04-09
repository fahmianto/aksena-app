const admin = require('firebase-admin');

// use local service account if available, otherwise mock
let db;
try {
    const serviceAccount = require('./serviceAccountKey.json');
    admin.initializeApp({ credential: admin.credential.cert(serviceAccount) });
    db = admin.firestore();
} catch (e) {
    console.error('Firebase Admin not initialized. Please ensure serviceAccountKey.json exists.');
    process.exit(1);
}

const seedData = async () => {
    console.log('🌱 Seeding Aksena v2.1 Data...');

    // 1. Products
    const products = [
        { sku: 'GM-KTN-01', name: 'Gamis Katun Premium', price: 150000, stock: 15, last_sold_date: new Date(Date.now() - 70 * 24 * 60 * 60 * 1000) },
        { sku: 'PJ-ST-02', name: 'Piyama Set Satin', price: 85000, stock: 40, last_sold_date: new Date(Date.now() - 40 * 24 * 60 * 60 * 1000) },
        { sku: 'PS-CR-03', name: 'Pashmina Ceruty', price: 45000, stock: 120, last_sold_date: new Date() },
        { sku: 'HJ-BS-04', name: 'Hijab Basic Voal', price: 35000, stock: 10, last_sold_date: new Date(Date.now() - 80 * 24 * 60 * 60 * 1000) }
    ];

    for (const p of products) {
        const snap = await db.collection('products').where('sku', '==', p.sku).limit(1).get();
        if (snap.empty) {
            await db.collection('products').add({ ...p, createdAt: new Date() });
            console.log(`✅ Added Product: ${p.sku}`);
        }
    }

    // 2. Transactions
    const transactions = [
        { orderId: 'AKS-001', awb: 'JP123456789', status: 'Selesai', eta: 'Tiba kemarin', items: [{ sku: 'PS-CR-03', qty: 2 }] },
        { orderId: 'AKS-002', awb: 'JP987654321', status: 'Dikirim', eta: 'Besok Sore', items: [{ sku: 'GM-KTN-01', qty: 1 }] },
        { orderId: 'AKS-003', awb: null, status: 'Diproses', eta: '3 hari lagi', items: [{ sku: 'PJ-ST-02', qty: 1 }] }
    ];

    for (const t of transactions) {
        const snap = await db.collection('transactions').where('orderId', '==', t.orderId).limit(1).get();
        if (snap.empty) {
            await db.collection('transactions').add({ ...t, timestamp: admin.firestore.FieldValue.serverTimestamp() });
            console.log(`✅ Added Transaction: ${t.orderId}`);
        }
    }

    console.log('🚀 Seeding Complete! Aksena Intelligence is now fully fueled.');
};

seedData().catch(console.error);
