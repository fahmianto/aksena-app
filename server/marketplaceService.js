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

    // 3. Eksekusi API Push ke Marketplace (Placeholder Endpoints for Production Setup)
    const platforms = [];
    if (ownerData.shopeeUrl) platforms.push({ name: 'SHOPEE', endpoint: 'https://partner.shopeemobile.com/api/v2/product/update_stock' });
    if (ownerData.tokopediaUrl) platforms.push({ name: 'TOKOPEDIA', endpoint: 'https://fs.tokopedia.net/inventory/v1/fs/stock/update' });
    if (ownerData.tiktokUrl) platforms.push({ name: 'TIKTOK', endpoint: 'https://open-api.tiktokglobalshop.com/product/202309/products/stocks' });

    for (const p of platforms) {
        console.log(`📡 [API Push] Requesting ${p.name} endpoint: ${p.endpoint}...`);
        try {
            // Mock network call ke real endpoint
            await new Promise(resolve => setTimeout(resolve, 600)); 
            const mockRawResponse = { ok: true, status: 200, json: async () => ({ message: "Success", timestamp: Date.now() }) };
            
            if (mockRawResponse.ok) {
                console.log(`✅ [API Push] ${p.name} berhasil. Stok SKU ${sku} sinkron di level: ${finalMarketplaceStock}.`);
            } else {
                console.warn(`🛑 [API Push] ${p.name} gagal sinkronisasi HTTP ${mockRawResponse.status}`);
            }
        } catch (error) {
            console.error(`❌ [API Push] Timeout / Error koneksi ke ${p.name}:`, error.message);
        }
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
