import { useState, useEffect } from 'react';
import { AlertTriangle, TrendingUp, Zap, Send } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { db } from '../firebase/config';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { API_BASE_URL } from '../config/api';

export default function RescueMyMoney() {
  const { currentUser } = useAuth();
  const [autoDiscount, setAutoDiscount] = useState(false);
  const [discountRate, setDiscountRate] = useState(20);
  const [deadStockItems, setDeadStockItems] = useState([]);
  const [blasting, setBlasting] = useState(null);
  const [stats, setStats] = useState({ potentialLoss: 0, projectedRecovery: 0, redItemsCount: 0 });
  const [showAnimation, setShowAnimation] = useState(false);

  useEffect(() => {
    // Trigger animation entry
    setTimeout(() => setShowAnimation(true), 100);
  }, []);

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
      await fetch(`${API_BASE_URL}/api/asl/trigger-scan`, { method: 'POST' });
      alert('✅ Daily Scan selesai dijalankan! Cek produk di tabel.');
    } catch (e) {
      alert('❌ Server backend belum aktif. Jalankan: cd server && node server.js');
    }
  };

  const handleBlastPromo = async (item) => {
    setBlasting(item.id);
    const msg = `Halo Kak! Aksena ada Flash Sale terbatas untuk ${item.name} – diskon ${discountRate}% khusus hari ini. Jangan sampai kehabisan! 🔥`;
    try {
      await fetch(`${API_BASE_URL}/api/marketer/broadcast`, {
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

      <div className={`grid-3 ${showAnimation ? 'fade-in-up' : ''}`} style={{ marginBottom: '32px' }}>
        {/* Card 1: Potential Loss - Alarming Red */}
        <div className="glass-card" style={{ 
          borderLeft: '4px solid var(--color-danger)', 
          background: 'linear-gradient(135deg, rgba(239, 68, 68, 0.1) 0%, transparent 100%)',
          position: 'relative',
          overflow: 'hidden'
        }}>
          <div style={{ position: 'absolute', top: -10, right: -10, opacity: 0.1 }}>
            <AlertTriangle size={80} color="var(--color-danger)" />
          </div>
          <div className="stat-label" style={{ color: 'var(--color-danger)', opacity: 0.8 }}>Potential Loss (Modal Tertahan)</div>
          <div style={{ fontSize: '32px', fontWeight: '900', color: '#fff', margin: '8px 0' }}>
            Rp {stats.potentialLoss.toLocaleString('id-ID')}
          </div>
          <div style={{ fontSize: '13px', color: 'var(--color-text-secondary)', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span className="live-dot" style={{ background: 'var(--color-danger)' }} />
            {stats.redItemsCount} Produk di Zona Merah ({'>'}60 hari)
          </div>
        </div>

        {/* Card 2: Projected Recovery - Inspiring Success */}
        <div className="glass-card" style={{ 
          borderLeft: '4px solid var(--color-success)', 
          background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.1) 0%, transparent 100%)',
          position: 'relative',
          overflow: 'hidden'
        }}>
          <div style={{ position: 'absolute', top: -10, right: -10, opacity: 0.1 }}>
            <TrendingUp size={80} color="var(--color-success)" />
          </div>
          <div className="stat-label" style={{ color: 'var(--color-success)', opacity: 0.8 }}>Projected Recovery</div>
          <div style={{ fontSize: '32px', fontWeight: '900', color: 'var(--color-success)', margin: '8px 0' }}>
            Rp {stats.projectedRecovery.toLocaleString('id-ID')}
          </div>
          <div style={{ fontSize: '13px', color: 'var(--color-text-secondary)' }}>
            Estimasi dana kembali jika diskon {discountRate}% diterapkan
          </div>
        </div>

        {/* Card 3: Auto-Liquidation Toggle - Tech Modern */}
        <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', border: '1px solid var(--color-accent-glow)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <div>
              <div style={{ fontWeight: 700, fontSize: '15px' }}>Auto-Liquidation AI</div>
              <div style={{ fontSize: '12px', color: 'var(--color-text-muted)' }}>Status: {autoDiscount ? 'Aktif' : 'Non-aktif'}</div>
            </div>
            <label className="switch">
              <input type="checkbox" checked={autoDiscount} onChange={handleToggleAuto} />
              <span className="slider round"></span>
            </label>
          </div>
          <div style={{ display: 'flex', gap: 6 }}>
            {[10, 20, 30, 50].map(pct => (
              <button
                key={pct}
                onClick={() => setDiscountRate(pct)}
                className="btn"
                style={{ 
                  flex: 1, padding: '6px 0', fontSize: '12px', height: 'auto',
                  background: discountRate === pct ? 'var(--color-accent)' : 'rgba(255,255,255,0.05)',
                  color: discountRate === pct ? '#000' : 'var(--color-text-secondary)',
                  border: '1px solid transparent',
                  borderColor: discountRate === pct ? 'var(--color-accent)' : 'var(--color-border)'
                }}
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
