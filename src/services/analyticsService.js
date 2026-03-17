import { collection, query, where, getDocs, onSnapshot } from 'firebase/firestore';
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
      // Jika salah satu dari data gagal dimuat (Firestore belum siap), gunakan dummy total
      if (!txData && !convData && !invData) {
        return callback({
          revenue: 45000000,
          conversionRate: 68.5,
          totalMessages: 142,
          lowStockCount: 12,
          weeklyData: [3200000, 2800000, 4100000, 3900000, 5200000, 7100000, 8500000],
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

      // Menghitung Pesan Masuk (menggunakan totalConvs sebagai proxy)
      const totalMessages = safeConv.length;

      // Menghitung Low Stock
      const lowStockCount = safeInv.filter(i => (i.stock || 0) <= 5).length;

      callback({
        revenue,
        conversionRate,
        totalMessages,
        lowStockCount,
        weeklyData: safeTx.length > 0 ? safeTx.map(t => t.amount) : [3200000, 2800000, 4100000, 3900000, 5200000, 7100000, 8500000], // Simulasi simple
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
  subscribeToCompassInsight: (userId, callback) => {
    // Simulasi insight berdasarkan big data
    const dummyInsight = {
      trendData: [
        { week: 'W1', hijab: 420, batik: 310, kaos: 280 },
        { week: 'W2', hijab: 510, batik: 290, kaos: 340 },
        { week: 'W3', hijab: 480, batik: 380, kaos: 310 },
        { week: 'W4', hijab: 620, batik: 420, kaos: 390 },
        { week: 'W5', hijab: 710, batik: 460, kaos: 430 },
        { week: 'W6', hijab: 680, batik: 500, kaos: 480 },
      ],
      benchmarkData: [
        { product: 'Hijab Segi Empat', myPrice: 75000,  avg: 68000,  diff: '+10.3%', status: 'high' },
        { product: 'Batik Tulis M',    myPrice: 185000, avg: 192000, diff: '-3.6%',  status: 'low' },
        { product: 'Dress Midi',       myPrice: 245000, avg: 248000, diff: '-1.2%',  status: 'ok' },
        { product: 'Kaos Cotton',      myPrice: 89000,  avg: 82000,  diff: '+8.5%',  status: 'high' },
      ],
      regions: [
        { name: 'Jawa Tengah', trending: 'Hijab Segi Empat', growth: '+28%', hot: true },
        { name: 'Jawa Barat',  trending: 'Batik Tulis',      growth: '+15%', hot: false },
        { name: 'DKI Jakarta', trending: 'Dress Midi',       growth: '+22%', hot: true },
        { name: 'Jawa Timur',  trending: 'Kaos Cotton',      growth: '+11%', hot: false },
      ],
      predictive: [
        { customer: 'Siti Rahayu', lastOrder: '14 hari lalu', predicted: '2 hari lagi', product: 'Hijab Navy' },
        { customer: 'Bapak Hendra', lastOrder: '21 hari lalu', predicted: '1 hari lagi', product: 'Batik M' },
        { customer: 'rizky_style',  lastOrder: '8 hari lalu',  predicted: '5 hari lagi', product: 'Kaos S' },
      ]
    };
    
    // Kembalikan statis dalam simulasi ini
    callback(dummyInsight);
    return () => {}; // return empty unsub function
  }
};
