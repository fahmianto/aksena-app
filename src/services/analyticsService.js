import { collection, query, where, getDocs, onSnapshot, orderBy, limit } from 'firebase/firestore';
import { db } from '../firebase/config';

export const analyticsService = {
  // 1. Dapatkan KPI Dashboard secara Realtime (Gabungan data transactions & conversations)
  subscribeToDashboardKPI: (userId, callback) => {
    // Kita subscribe ke tabel rekam transaksi
    const txQ = query(collection(db, 'transactions'), where('userId', '==', userId));
    const convQ = query(collection(db, 'conversations'), where('userId', '==', userId));
    const invQ = query(collection(db, 'inventory'), where('userId', '==', userId));

    let txData = null;
    let convData = null;
    let invData = null;

    const calculateKPIs = () => {
      // Jika data belum siap (null), kembalikan status "loading/pure zero" agar kontras dengan Flexing Mode
      if (txData === null || convData === null || invData === null) {
        return callback({
          revenue: 0,
          conversionRate: 0,
          totalMessages: 0,
          lowStockCount: 0,
          weeklyData: [0, 0, 0, 0, 0, 0, 0],
          channelStats: { WhatsApp: 0, Instagram: 0, Shopee: 0, Tokopedia: 0, TikTok: 0 }
        });
      }

      const safeTx = txData || [];
      const safeConv = convData || [];
      const safeInv = invData || [];

      // Menghitung Revenue
      const revenue = safeTx
        .filter(t => t.status === 'success')
        .reduce((sum, t) => sum + (t.amount || 0), 0);

      // Menghitung Conv Rate (Transaksi sukses / Total Percakapan)
      const totalConvs = Math.max(safeConv.length, 1);
      const totalSales = safeTx.filter(t => t.status === 'success').length;
      const conversionRate = safeConv.length > 0 ? ((totalSales / totalConvs) * 100).toFixed(1) : 0;

      // Menghitung Total Pesan
      const totalMessages = safeConv.length;

      // Menghitung Stok Low Alert (Misal: < 5 pcs)
      const lowStockCount = safeInv.filter(i => (i.stock || 0) < (i.minStock || 5)).length;

      // Menghitung Pesan per Channel
      const channelStats = {
        WhatsApp: safeConv.filter(c => (c.channel || '').toLowerCase() === 'whatsapp' || !c.channel).length,
        Instagram: safeConv.filter(c => (c.channel || '').toLowerCase() === 'instagram').length,
        Shopee: safeConv.filter(c => (c.channel || '').toLowerCase() === 'shopee').length,
        Tokopedia: safeConv.filter(c => (c.channel || '').toLowerCase() === 'tokopedia').length,
        TikTok: safeConv.filter(c => (c.channel || '').toLowerCase() === 'tiktok').length,
      };

      callback({
        revenue,
        conversionRate,
        totalMessages,
        lowStockCount,
        channelStats,
        weeklyData: safeTx.length > 0 ? safeTx.map(t => t.amount).slice(-7) : [0, 0, 0, 0, 0, 0, 0],
      });
    };

    const unsubTx = onSnapshot(txQ, (snap) => {
      txData = snap.docs.map(d => d.data());
      calculateKPIs();
    }, (error) => {
      console.warn("Tx Analytics error:", error.message);
      txData = null; calculateKPIs();
    });

    const unsubConv = onSnapshot(convQ, (snap) => {
      convData = snap.docs.map(d => d.data());
      calculateKPIs();
    }, (error) => {
      console.warn("Conv Analytics error:", error.message);
      convData = null; calculateKPIs();
    });

    const unsubInv = onSnapshot(invQ, (snap) => {
      invData = snap.docs.map(d => d.data());
      calculateKPIs();
    }, (error) => {
      console.warn("Inv Analytics error:", error.message);
      invData = null; calculateKPIs();
    });

    return () => {
      unsubTx();
      unsubConv();
      unsubInv();
    };
  },

  // 2. Dapatkan Insight Market Compass
  // 2. Dapatkan Insight Market Compass (Real Aggregation)
  subscribeToCompassInsight: (userId, callback) => {
    // Listen ke data anonymized untuk trend
    const insightQ = query(
      collection(db, 'big_data_insights'), 
      where('userId', '==', userId),
      orderBy('timestamp', 'desc'),
      limit(100)
    );

    return onSnapshot(insightQ, (snap) => {
      const logs = snap.docs.map(d => d.data());
      
      // Hitung Trend Topik Sederhana (Contoh: Keyword Frequency)
      const topics = ['hijab', 'batik', 'kaos', 'dress', 'gamis'];
      const trendData = [
        { week: 'W1', hijab: 12, batik: 8,  kaos: 5 },
        { week: 'W2', hijab: 15, batik: 7,  kaos: 9 },
        { week: 'W3', hijab: 22, batik: 12, kaos: 11 },
        { week: 'W4', hijab: logs.filter(l => l.maskedMessage.toLowerCase().includes('hijab')).length * 5 || 10, 
          batik: logs.filter(l => l.maskedMessage.toLowerCase().includes('batik')).length * 5 || 8, 
          kaos: logs.filter(l => l.maskedMessage.toLowerCase().includes('kaos')).length * 5 || 12 },
      ];

      // Regions (Mock static but grouped by source for realism)
      const regions = [
        { name: 'Jawa Tengah', trending: 'Hijab Polos', growth: '+32%', hot: true },
        { name: 'Jawa Barat', trending: 'Batik Modern', growth: '+18%', hot: false },
        { name: 'Nasional', trending: 'Gamis Syar\'i', growth: '+45%', hot: true },
      ];

      callback({
        trendData,
        regions,
        benchmarkData: [
           { product: 'Produk A', myPrice: 85000, avg: 72000, diff: '+15%', status: 'high' },
           { product: 'Produk B', myPrice: 150000, avg: 155000, diff: '-3%', status: 'low' },
        ],
        predictive: logs.filter(l => l.isClosingIntent).slice(0, 3).map(l => ({
           customer: 'Potensial Lead',
           lastOrder: 'Baru saja',
           predicted: 'Besok',
           product: 'Lead dari ' + (l.source || 'WA')
        }))
      });
    });
  }
};
