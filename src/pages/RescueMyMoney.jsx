import { useState, useEffect } from 'react';
import { AlertTriangle, TrendingUp, Zap, Send } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { db } from '../firebase/config';
import { collection, query, where, onSnapshot } from 'firebase/firestore';

export default function RescueMyMoney() {
  const { currentUser } = useAuth();
  const [autoDiscount, setAutoDiscount] = useState(false);
  const [discountRate, setDiscountRate] = useState(20);
  const [deadStockItems, setDeadStockItems] = useState([]);
  const [blasting, setBlasting] = useState(null);
  const [stats, setStats] = useState({ potentialLoss: 0, projectedRecovery: 0, redItemsCount: 0 });

  useEffect(() => {
    if (!currentUser) return;
    const q = query(collection(db, 'products'), where('slow_moving_tag', '==', 'SLOW_MOVING'));
    const unsub = onSnapshot(q, (snap) => {
      const items = snap.docs.map(d => ({ id: d.id, ...d.data() }));
      const potentialLoss = items.reduce((acc, i) => acc + ((i.price || 0) * (i.stock || 0)), 0);
      const projectedRecovery = potentialLoss * ((100 - discountRate) / 100);
      setDeadStockItems(items);
      setStats({ potentialLoss, projectedRecovery, redItemsCount: items.length });
    });
    return () => unsub();
  }, [currentUser, discountRate]);

  const handleManualScan = async () => {
    try {
      await fetch('http://localhost:3000/api/asl/trigger-scan', { method: 'POST' });
      alert('✅ Daily Scan selesai dijalankan! Cek produk di tabel.');
    } catch (e) {
      alert('❌ Server backend belum aktif. Jalankan: cd server && node server.js');
    }
  };

  const handleBlastPromo = async (item) => {
    setBlasting(item.id);
    const msg = `Halo Kak! Aksena ada Flash Sale terbatas untuk ${item.name} – diskon ${discountRate}% khusus hari ini. Jangan sampai kehabisan! 🔥`;
    try {
      await fetch('http://localhost:3000/api/marketer/broadcast', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: msg, targets: [], userId: currentUser?.uid })
      });
      alert(`🚀 Blast Promo WA untuk "${item.name}" berhasil diantrekan!`);
    } catch (e) {
      alert('❌ Gagal konek ke server backend.');
    } finally {
      setBlasting(null);
    }
  };

  const handleToggleAuto = () => setAutoDiscount(!autoDiscount);

  return (
    <div className="fade-in-up">
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1>Rescue My Money (ASL)</h1>
          <p>Aksena Smart Liquidation – Ubah stok mati kembali menjadi cash flow</p>
        </div>
        <div>
          <button className="btn btn-primary" onClick={handleManualScan} style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            <Zap size={16} />
            Jalankan Manual Scan
          </button>
        </div>
      </div>

      <div className="grid-3" style={{ marginBottom: '24px' }}>
        {/* Card 1: Potential Loss */}
        <div className="stat-card" style={{ borderColor: 'var(--color-danger)' }}>
          <div className="stat-icon" style={{ background: 'rgba(239,68,68,0.2)' }}>
            <AlertTriangle size={18} color="#ef4444" />
          </div>
          <div className="stat-label">Potential Loss (Modal Tertahan)</div>
          <div className="stat-value" style={{ color: '#ef4444' }}>Rp {stats.potentialLoss.toLocaleString('id-ID')}</div>
          <div className="stat-change" style={{ color: '#ef4444' }}>
            Dari {stats.redItemsCount} produk di Zona Merah ({'>'}60 hari)
          </div>
        </div>

        {/* Card 2: Projected Recovery */}
        <div className="stat-card" style={{ borderColor: 'var(--color-success)' }}>
          <div className="stat-icon" style={{ background: 'rgba(16,185,129,0.2)' }}>
            <TrendingUp size={18} color="#10b981" />
          </div>
          <div className="stat-label">Projected Recovery</div>
          <div className="stat-value" style={{ color: '#10b981' }}>Rp {stats.projectedRecovery.toLocaleString('id-ID')}</div>
          <div className="stat-change" style={{ color: '#10b981' }}>Estimasi jika diskon {discountRate}% diterapkan</div>
        </div>

        {/* Card 3: Auto-Liquidation Toggle */}
        <div className="card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
            <div style={{ fontWeight: 600 }}>Auto-Liquidation</div>
            <label className="switch">
              <input type="checkbox" checked={autoDiscount} onChange={handleToggleAuto} />
              <span className="slider round"></span>
            </label>
          </div>
          <p style={{ fontSize: '13px', color: 'var(--color-text-muted)', marginBottom: 16 }}>
            Izinkan AI menawarkan diskon sebagai &quot;Smart Offer&quot; saat ada lead.
          </p>
          <div style={{ display: 'flex', gap: 8 }}>
            {[10, 20, 30, 50].map(pct => (
              <button
                key={pct}
                onClick={() => setDiscountRate(pct)}
                className={`btn ${discountRate === pct ? 'btn-primary' : 'btn-outline'}`}
                style={{ flex: 1, padding: '4px 0', fontSize: '13px', height: 'auto' }}
                disabled={!autoDiscount}
              >
                {pct}%
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Dead Stock Table */}
      <div className="card">
        <div className="card-header">
          <span className="card-title">Daftar Dead Stock (Zona Merah)</span>
          <span className="badge badge-danger">{deadStockItems.length} Items</span>
        </div>
        <div className="table-responsive">
          <table className="data-table">
            <thead>
              <tr>
                <th align="left">Produk</th>
                <th align="left">SKU</th>
                <th align="center">Stok</th>
                <th align="center">Hari Tanpa Transaksi</th>
                <th align="right">Modal Tertahan</th>
                <th align="center">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {deadStockItems.length === 0 && (
                <tr>
                  <td colSpan={6} style={{ padding: 24, textAlign: 'center', color: 'var(--color-text-muted)' }}>
                    🎉 Tidak ada Dead Stock saat ini! Semua produk bergerak lancar.
                  </td>
                </tr>
              )}
              {deadStockItems.map((item, i) => (
                <tr key={item.id} style={{ borderBottom: i < deadStockItems.length - 1 ? '1px solid var(--color-border)' : 'none' }}>
                  <td style={{ padding: '12px', fontWeight: 500 }}>{item.name}</td>
                  <td style={{ padding: '12px', color: 'var(--color-text-muted)' }}>{item.sku || '—'}</td>
                  <td align="center" style={{ padding: '12px' }}>{item.stock} pcs</td>
                  <td align="center" style={{ padding: '12px', color: '#ef4444', fontWeight: 600 }}>
                    {item.daysIdle || '60+'} Hari
                  </td>
                  <td align="right" style={{ padding: '12px' }}>
                    Rp {((item.price || 0) * (item.stock || 0)).toLocaleString('id-ID')}
                  </td>
                  <td align="center" style={{ padding: '12px' }}>
                    <button
                      className="btn btn-outline"
                      style={{ fontSize: '12px', padding: '6px 12px', height: 'auto', display: 'inline-flex', gap: 6, alignItems: 'center' }}
                      onClick={() => handleBlastPromo(item)}
                      disabled={blasting === item.id}
                    >
                      <Send size={12} />
                      {blasting === item.id ? 'Mengirim...' : 'Blast Promo WA'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
