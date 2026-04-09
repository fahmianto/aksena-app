const { handleMarketplaceSale } = require('./marketplaceService');

// Mock Firestore for verification
const mockDb = {
    collection: (name) => {
        if (name === 'users') {
            return {
                where: () => ({
                    limit: () => ({
                        get: async () => ({
                            empty: false,
                            docs: [{
                                data: () => ({ 
                                    autoSync: true, 
                                    shopeeUrl: 'shopee.co.id/toko-ami', 
                                    tokopediaUrl: 'tokopedia.com/toko-ami', 
                                    tiktokUrl: 'tiktok.com/@toko-ami',
                                    stockGuard: 2 
                                })
                            }]
                        })
                    })
                })
            }
        }
        if (name === 'products') {
            return {
                where: () => ({
                    limit: () => ({
                        get: async () => ({
                            empty: false,
                            docs: [{
                                data: () => ({ stock: 10, name: 'Gamis Katun', sku: 'GM-01' }),
                                ref: { update: async (data) => console.log(`✅ [Mock DB] Product Updated: master_stock=${data.stock}`) }
                            }]
                        })
                    })
                })
            }
        }
    }
};

const runTest = async () => {
    console.log('🧪 Starting Omni-channel Sync Test [MOCK]...');
    
    // Simulate Shopee Sale of 3 items for SKU 'GM-01' (Initial stock 10)
    // New stock should be 7 in DB.
    // Sync to other marketplaces should use 7 - 2 (Stock Guard) = 5.
    await handleMarketplaceSale('SHOPEE', 'GM-01', 3, mockDb);
    
    console.log('🧪 Test Finished.');
};

runTest().catch(console.error);
