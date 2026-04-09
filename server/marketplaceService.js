const admin = require('firebase-admin');

/**
 * Sync Master Stock to all connected marketplaces
 * @param {string} sku - Product SKU
 * @param {number} newStock - New Stock Level
 * @param {object} db - Firestore Instance
 */
const syncGlobalStock = async (sku, newStock, db) => {
    console.log(`🔄 [Stock Sync] Memulai sinkronisasi SKU: ${sku} (Stok: ${newStock})`);

    // 1. Ambil Config Owner (Cek apakah Auto-Sync Aktif)
    const usersSnap = await db.collection('users').where('role', '==', 'super_admin').limit(1).get();
    if (usersSnap.empty) return;
    
    const ownerData = usersSnap.docs[0].data();
    if (!ownerData.autoSync) {
        console.log(`ℹ️ [Stock Sync] Auto-Sync dimatikan oleh Owner. Skip sinkronisasi kedaerahan.`);
        return;
    }

    // 2. Terapkan Stock Guard (Buffer)
    const buffer = ownerData.stockGuard || 0;
    const finalMarketplaceStock = Math.max(0, newStock - buffer);

    // 3. Simulasi API Call ke Marketplace
    const platforms = [];
    if (ownerData.shopeeUrl) platforms.push('SHOPEE');
    if (ownerData.tokopediaUrl) platforms.push('TOKOPEDIA');
    if (ownerData.tiktokUrl) platforms.push('TIKTOK');

    for (const p of platforms) {
        console.log(`📡 [API Push] Mengirim stok ${finalMarketplaceStock} ke ${p} untuk SKU ${sku}...`);
        // Mock delay API
        await new Promise(resolve => setTimeout(resolve, 500));
        console.log(`✅ [API Push] ${p} Berhasil di-update.`);
    }
};

/**
 * Handle Sale from any Marketplace
 */
const handleMarketplaceSale = async (platform, sku, qty, db) => {
    console.log(`🛍️ [Sale Notification] Terdeteksi penjualan di ${platform}: SKU ${sku} x${qty}`);

    const productRef = db.collection('products').where('sku', '==', sku).limit(1);
    const snap = await productRef.get();

    if (snap.empty) {
        console.error(`❌ [Sale Error] SKU ${sku} tidak ditemukan di database Aksena.`);
        return;
    }

    const doc = snap.docs[0];
    const currentStock = doc.data().stock || 0;
    const newStock = Math.max(0, currentStock - qty);

    // Update Master Database
    await doc.ref.update({ 
        stock: newStock,
        last_sold_date: admin.firestore.FieldValue.serverTimestamp()
    });

    // Pemicu Sinkronisasi Global
    await syncGlobalStock(sku, newStock, db);
};

module.exports = {
    syncGlobalStock,
    handleMarketplaceSale
};
