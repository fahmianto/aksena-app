import { useState, useEffect } from 'react';
import { Package, AlertTriangle, TrendingUp, RefreshCw, Plus, Loader } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import {
  subscribeToInventory, getInventory, addProduct, updateProduct, deleteProduct
} from '../services/inventoryService';
import EmptyState from '../components/common/EmptyState';
import toast from 'react-hot-toast';

const statusBadge = {
  ok:  <span className="badge badge-success">Aman</span>,
  low: <span className="badge badge-warning"><AlertTriangle size={10} /> Low Stock</span>,
  out: <span className="badge badge-danger">Habis</span>,
};

function computeStatus(stock, minStock) {
  if (stock === 0) return 'out';
  if (stock < minStock) return 'low';
  return 'ok';
}

export default function Manager() {
  const { currentUser } = useAuth();
  const [inventory, setInventory] = useState([]);
  const [loading, setLoading]     = useState(true);
  const [editing, setEditing]     = useState(null); // product being edited inline

  useEffect(() => {
    if (!currentUser) return;
    setLoading(true);
    const unsub = subscribeToInventory(currentUser.uid, (data) => {
      setInventory(data);
      setLoading(false);
    });
    return () => unsub();
  }, [currentUser]);

  async function handleRestock(item) {
    const newStock = item.stock + item.minStock * 2;
    try {
      await updateProduct(item.id, { stock: newStock, status: 'ok' });
      toast.success(`Stok ${item.name} diperbarui!`);
      loadInventory();
    } catch {
      toast.error('Gagal update stok.');
    }
  }

  const alerts = inventory.filter(i => i.status !== 'ok');
  const stats = {
    total: inventory.length,
    ok:  inventory.filter(i => i.status === 'ok').length,
    low: inventory.filter(i => i.status === 'low').length,
    out: inventory.filter(i => i.status === 'out').length,
  };

  return (
    <div className="fade-in-up">
      <div className="page-header">
        <h1>The Manager</h1>
        <p>Retail & Inventory Suite — Real-time stock sync & smart restock suggestion</p>
      </div>

      {/* Stats */}
      <div className="grid-4" style={{ marginBottom:'24px' }}>
        {[
          { label: 'Total Produk',   value: loading ? '—' : stats.total, icon: Package,      color:'var(--color-accent)' },
          { label: 'Stok Aman',      value: loading ? '—' : stats.ok,    icon: Package,      color:'var(--color-success)' },
          { label: 'Low Stock',      value: loading ? '—' : stats.low,   icon: AlertTriangle,color:'var(--color-warning)' },
          { label: 'Stok Habis',     value: loading ? '—' : stats.out,   icon: AlertTriangle,color:'var(--color-danger)' },
        ].map(s => (
          <div key={s.label} className="stat-card">
            <div className="stat-icon" style={{ background: `${s.color}20` }}>
              <s.icon size={18} style={{ color: s.color }} />
            </div>
            <div className="stat-label">{s.label}</div>
            <div className="stat-value">{s.value}</div>
          </div>
        ))}
      </div>

      {/* Alerts */}
      {!loading && alerts.length > 0 && (
        <div className="card" style={{ marginBottom:'24px', borderColor:'rgba(245,158,11,0.3)' }}>
          <div className="card-header">
            <span className="card-title"><AlertTriangle size={16} style={{ color:'var(--color-warning)', marginRight:6, display:'inline' }} />Peringatan Stok</span>
          </div>
          <div style={{ display:'flex', flexDirection:'column', gap:'10px' }}>
            {alerts.map(a => (
              <div key={a.id} style={{
                padding:'12px 16px', borderRadius:'var(--radius-md)',
                background: a.status==='out'?'rgba(239,68,68,0.08)':'rgba(245,158,11,0.08)',
                border:`1px solid ${a.status==='out'?'rgba(239,68,68,0.25)':'rgba(245,158,11,0.25)'}`,
                display:'flex', alignItems:'flex-start', gap:'10px'
              }}>
                <AlertTriangle size={14} style={{ color: a.status==='out'?'var(--color-danger)':'var(--color-warning)', flexShrink:0, marginTop:2 }} />
                <div style={{ flex:1 }}>
                  <div style={{ fontSize:'13px', fontWeight:600, marginBottom:2, color: a.status==='out'?'var(--color-danger)':'var(--color-warning)' }}>{a.name}</div>
                  <div style={{ fontSize:'12px', color:'var(--color-text-secondary)' }}>
                    {a.status==='out'
                      ? `STOK HABIS! Produk ini terjual ${a.sold} pcs. Restock segera.`
                      : `Stok tinggal ${a.stock} pcs di bawah minimum ${a.minStock} pcs.`}
                  </div>
                </div>
                <button className="btn btn-secondary btn-sm" onClick={() => handleRestock(a)}>Restock</button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Table */}
      <div className="card" style={{ padding:0 }}>
        <div className="card-header" style={{ padding:'16px 20px', borderBottom:'1px solid var(--color-border)' }}>
          <span className="card-title">Inventori Produk</span>
          <div style={{ display:'flex', gap:'8px' }}>
            <button className="btn btn-secondary btn-sm" onClick={loadInventory} disabled={loading}>
              {loading ? <Loader size={13} className="spin" /> : <RefreshCw size={13} />} Refresh
            </button>
          </div>
        </div>
        {loading ? (
          <div style={{ padding:'40px', textAlign:'center', color:'var(--color-text-muted)' }}>
            <Loader size={24} style={{ marginBottom:8 }} className="spin" />
            <p style={{ fontSize:'13px' }}>Memuat data inventori...</p>
          </div>
        ) : inventory.length === 0 ? (
          <div style={{ padding: '20px' }}>
            <EmptyState 
              icon={Package} 
              title="Inventori Kosong" 
              description="Anda belum memiliki produk. Tambahkan produk pertama Anda untuk mulai memantau stok secara real-time."
              actionLabel="Tambah Produk Baru"
              onAction={() => alert('Fitur tambah produk sedang dikembangkan')}
            />
          </div>
        ) : (
          <div className="table-wrapper" style={{ border:'none', borderRadius:0 }}>
            <table className="table">
              <thead>
                <tr>
                  <th>Produk</th><th>SKU</th><th>Stok</th><th>Min. Stok</th>
                  <th>Terjual (30h)</th><th>Tren</th><th>Status</th><th>Aksi</th>
                </tr>
              </thead>
              <tbody>
                {inventory.map(item => (
                  <tr key={item.id}>
                    <td style={{ fontWeight:500 }}>{item.name}</td>
                    <td style={{ color:'var(--color-text-muted)', fontSize:'12px' }}>{item.sku}</td>
                    <td style={{ fontWeight:700, color: item.stock===0?'var(--color-danger)':item.stock<item.minStock?'var(--color-warning)':'var(--color-text-primary)' }}>
                      {item.stock} pcs
                    </td>
                    <td style={{ color:'var(--color-text-muted)' }}>{item.minStock} pcs</td>
                    <td>{item.sold} pcs</td>
                    <td style={{ color: item.trend?.startsWith('+')?'var(--color-success)':'var(--color-danger)', fontWeight:600 }}>
                      <TrendingUp size={12} style={{ display:'inline', marginRight:3 }} />{item.trend}
                    </td>
                    <td>{statusBadge[item.status] || statusBadge[computeStatus(item.stock, item.minStock)]}</td>
                    <td>
                      <div style={{ display:'flex', gap:'6px' }}>
                        {item.status !== 'ok' && (
                          <button className="btn btn-primary btn-sm" onClick={() => handleRestock(item)}>Restock</button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
