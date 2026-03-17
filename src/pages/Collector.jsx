import { useState, useEffect } from 'react';
import { CreditCard, CheckCircle, Clock, AlertCircle, TrendingUp, Loader, RefreshCw } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import {
  getTransactions, addTransaction, updateTransactionStatus, seedDemoTransactions
} from '../services/transactionService';
import toast from 'react-hot-toast';

const statusBadge = {
  success: <span className="badge badge-success">Sukses</span>,
  pending: <span className="badge badge-warning">Pending</span>,
  failed:  <span className="badge badge-danger">Gagal</span>,
};

const fmtRp = (n) => `Rp ${Number(n || 0).toLocaleString('id-ID')}`;

export default function Collector() {
  const { currentUser } = useAuth();
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading]           = useState(true);
  const [feeAmount, setFeeAmount]       = useState(1000000);
  const [feeRate, setFeeRate]           = useState(1);

  async function loadTransactions() {
    setLoading(true);
    try {
      const data = await getTransactions(currentUser.uid);
      if (data.length === 0) {
        await seedDemoTransactions(currentUser.uid);
        const seeded = await getTransactions(currentUser.uid);
        setTransactions(seeded);
        toast.success('Demo transaksi berhasil dimuat!');
      } else {
        setTransactions(data);
      }
    } catch {
      toast.error('Gagal memuat transaksi.');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { loadTransactions(); }, []);

  const successTx    = transactions.filter(t => t.status === 'success');
  const totalRevenue = successTx.reduce((a, t) => a + (t.amount || 0), 0);
  const totalFees    = successTx.reduce((a, t) => a + (t.fee || 0), 0);

  const calcFee = feeAmount * (feeRate / 100);

  return (
    <div className="fade-in-up">
      <div className="page-header">
        <h1>The Collector</h1>
        <p>Automated Payment & Auto Split-Fee — 100% Akurasi</p>
      </div>

      {/* KPI Cards */}
      <div className="grid-4" style={{ marginBottom:'24px' }}>
        {[
          { label: 'Total Revenue', value: loading ? '—' : fmtRp(totalRevenue), icon: CreditCard,  color:'var(--color-accent)' },
          { label: 'Success Fee',   value: loading ? '—' : fmtRp(totalFees),    icon: TrendingUp,  color:'var(--color-success)' },
          { label: 'Tx Sukses',     value: loading ? '—' : successTx.length,    icon: CheckCircle, color:'var(--color-success)' },
          { label: 'Pending/Gagal', value: loading ? '—' : transactions.filter(t=>t.status!=='success').length, icon: AlertCircle, color:'var(--color-warning)' },
        ].map(s => (
          <div key={s.label} className="stat-card">
            <div className="stat-icon" style={{ background: `${s.color}20` }}>
              <s.icon size={18} style={{ color: s.color }} />
            </div>
            <div className="stat-label">{s.label}</div>
            <div className="stat-value" style={{ fontSize:'var(--font-xl)' }}>{s.value}</div>
          </div>
        ))}
      </div>

      <div className="grid-2-1" style={{ marginBottom:'0' }}>
        {/* Transaction Table */}
        <div className="card" style={{ padding:0 }}>
          <div className="card-header" style={{ padding:'16px 20px', borderBottom:'1px solid var(--color-border)' }}>
            <span className="card-title">Log Transaksi</span>
            <div style={{ display:'flex', gap:'8px', alignItems:'center' }}>
              <span className="badge badge-success"><span className="live-dot" style={{width:6,height:6,display:'inline-block'}} /> Real-time</span>
              <button className="btn btn-ghost btn-sm" onClick={loadTransactions} disabled={loading}>
                {loading ? <Loader size={13} /> : <RefreshCw size={13} />}
              </button>
            </div>
          </div>
          {loading ? (
            <div style={{ padding:'40px', textAlign:'center', color:'var(--color-text-muted)' }}>
              <Loader size={24} style={{ marginBottom:8 }} />
              <p style={{ fontSize:'13px' }}>Memuat transaksi...</p>
            </div>
          ) : (
            <div className="table-wrapper" style={{ border:'none', borderRadius:0 }}>
              <table className="table">
                <thead>
                  <tr>
                    <th>Ref</th><th>Customer</th><th>Channel</th>
                    <th>Amount</th><th>Fee</th><th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {transactions.map(t => (
                    <tr key={t.id}>
                      <td style={{ fontSize:'11px', color:'var(--color-text-muted)', fontFamily:'monospace' }}>{t.txRef}</td>
                      <td style={{ fontWeight:500 }}>{t.customer}</td>
                      <td>
                        <span className={`badge ${t.channel==='WA'?'channel-wa':t.channel==='IG'?'channel-ig':'channel-sh'}`}>{t.channel}</span>
                      </td>
                      <td style={{ fontWeight:600 }}>{fmtRp(t.amount)}</td>
                      <td style={{ color:'var(--color-success)', fontWeight:600 }}>{fmtRp(t.fee)}</td>
                      <td>{statusBadge[t.status]}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Fee Calculator */}
        <div className="card">
          <div className="card-header">
            <span className="card-title">Fee Calculator</span>
          </div>
          <div style={{ display:'flex', flexDirection:'column', gap:'16px' }}>
            <div className="form-group">
              <label className="form-label">Nominal Transaksi</label>
              <input className="form-input" type="number" value={feeAmount}
                onChange={e => setFeeAmount(Number(e.target.value))} />
            </div>
            <div className="form-group">
              <label className="form-label">Rate Success Fee</label>
              <select className="form-input" value={feeRate} onChange={e => setFeeRate(Number(e.target.value))}>
                <option value={0.5}>0.5% (Basic)</option>
                <option value={1}>1% (Standard)</option>
                <option value={2}>2% (Growth)</option>
                <option value={5}>5% (Enterprise)</option>
              </select>
            </div>
            <div style={{ background:'var(--color-bg-surface)', border:'1px solid var(--color-border-strong)', borderRadius:'var(--radius-md)', padding:'16px' }}>
              <div style={{ display:'flex', justifyContent:'space-between', marginBottom:'8px' }}>
                <span style={{ fontSize:'13px', color:'var(--color-text-muted)' }}>Revenue ke Merchant</span>
                <span style={{ fontSize:'13px', fontWeight:600 }}>{fmtRp(feeAmount - calcFee)}</span>
              </div>
              <div style={{ display:'flex', justifyContent:'space-between', paddingTop:'8px', borderTop:'1px solid var(--color-border)' }}>
                <span style={{ fontSize:'13px', color:'var(--color-accent)', fontWeight:600 }}>Fee Aksena ({feeRate}%)</span>
                <span style={{ fontSize:'13px', fontWeight:700, color:'var(--color-success)' }}>{fmtRp(calcFee)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
