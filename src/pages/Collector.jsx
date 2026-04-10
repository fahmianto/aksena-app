import { useState, useEffect } from 'react';
import { CreditCard, CheckCircle, Clock, AlertCircle, TrendingUp, Loader, RefreshCw, BarChart3, Download } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import {
  subscribeTransactions, getTransactions, addTransaction, updateTransactionStatus
} from '../services/transactionService';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell 
} from 'recharts';
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
  const [showAnimation, setShowAnimation] = useState(false);

  useEffect(() => {
    if (!currentUser) return;
    setLoading(true);
    const unsub = subscribeTransactions(currentUser.uid, (data) => {
      setTransactions(data);
      setLoading(false);
    });
    setTimeout(() => setShowAnimation(true), 100);
    return () => unsub();
  }, [currentUser]);

  const successTx    = transactions.filter(t => t.status === 'success');
  const totalRevenue = successTx.reduce((a, t) => a + (t.amount || 0), 0);
  const totalFees    = successTx.reduce((a, t) => a + (t.fee || 0), 0);

  const calcFee = feeAmount * (feeRate / 100);

  // Chart Data Preparation
  const chartData = [
    { name: 'Mon', total: 4000000 },
    { name: 'Tue', total: 3000000 },
    { name: 'Wed', total: 5000000 },
    { name: 'Thu', total: 2500000 },
    { name: 'Fri', total: 6000000 },
    { name: 'Sat', total: 7500000 },
    { name: 'Sun', total: totalRevenue || 500000 }, 
  ];

  const exportToCSV = () => {
    if (transactions.length === 0) {
      toast.error('Tidak ada data untuk diexport');
      return;
    }
    const headers = ['Tx Ref', 'Customer', 'Channel', 'Amount', 'Fee', 'Profit', 'Status'];
    const rows = transactions.map(t => [
      t.txRef,
      t.customer,
      t.channel || 'WA',
      t.amount || 0,
      t.fee || 0,
      (t.amount || 0) - (t.fee || 0),
      t.status
    ]);
    const csvContent = [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `Aksena_Transactions_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success('File CSV berhasil didownload!');
  };

  return (
    <div className={showAnimation ? 'fade-in-up' : ''}>
      <div className="page-header">
        <h1>The Collector</h1>
        <p>Omnichannel Payment & Auto Split-Fee — 100% Akurasi</p>
      </div>

      {/* KPI Cards */}
      <div className="grid-4" style={{ marginBottom: '24px' }}>
        {[
          { label: 'Total Revenue', value: loading ? '—' : fmtRp(totalRevenue), icon: CreditCard, color: 'var(--color-accent)' },
          { label: 'Success Fee', value: loading ? '—' : fmtRp(totalFees), icon: TrendingUp, color: 'var(--color-success)' },
          { label: 'Tx Sukses', value: loading ? '—' : successTx.length, icon: CheckCircle, color: 'var(--color-success)' },
          { label: 'Conversion', value: transactions.length ? Math.round((successTx.length / transactions.length) * 100) + '%' : '0%', icon: BarChart3, color: 'var(--color-info)' },
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

      <div className="grid-2-1" style={{ marginBottom: '24px' }}>
        {/* Trend Chart (Glass Effect) */}
        <div className="glass-card" style={{ height: '320px' }}>
          <div className="card-header" style={{ marginBottom: '16px' }}>
            <span className="card-title">Revenue Trend (Last 7 Days)</span>
            <span className="badge badge-accent">Live</span>
          </div>
          <div style={{ width: '100%', height: '220px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" vertical={false} />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: 'var(--color-text-muted)' }} />
                <YAxis hide />
                <Tooltip cursor={{ fill: 'rgba(0, 212, 255, 0.05)' }} contentStyle={{ background: 'var(--color-bg-card)', border: '1px solid var(--color-border)', borderRadius: '8px', fontSize: '11px' }} />
                <Bar dataKey="total">
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={index === chartData.length - 1 ? 'var(--color-accent)' : 'var(--color-bg-surface)'} radius={[4, 4, 0, 0]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Quick Insights */}
        <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div className="card-header"><span className="card-title">Merchant Health</span></div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {[
              { label: 'Avg Ticket', value: successTx.length ? fmtRp(totalRevenue / successTx.length) : 'Rp 0', color: 'var(--color-info)' },
              { label: 'Aksena Fee (Today)', value: fmtRp(totalFees), color: 'var(--color-success)' },
            ].map((st) => (
              <div key={st.label}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', marginBottom: '6px' }}>
                  <span style={{ color: 'var(--color-text-muted)' }}>{st.label}</span>
                  <span style={{ fontWeight: 700, color: st.color }}>{st.value}</span>
                </div>
                <div style={{ height: '4px', background: 'rgba(255,255,255,0.05)', borderRadius: '2px', overflow: 'hidden' }}>
                  <div style={{ width: '70%', height: '100%', background: st.color }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid-2-1">
        {/* Transaction Table */}
        <div className="card" style={{ padding: 0 }}>
          <div className="card-header" style={{ padding: '16px 20px', borderBottom: '1px solid var(--color-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <span className="card-title">Recent Transactions </span>
              <span className="badge badge-success" style={{ marginLeft: '8px' }}>Live</span>
            </div>
            <button onClick={exportToCSV} className="btn btn-outline btn-sm" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Download size={14} /> Export CSV
            </button>
          </div>
          <div className="table-wrapper" style={{ border: 'none', borderRadius: 0 }}>
            <table className="table">
              <thead>
                <tr>
                  <th>Ref</th><th>Customer</th><th>Channel</th><th>Amount</th><th>Est. Margin</th><th>Status</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan={6} style={{ textAlign: 'center', padding: '24px' }}><Loader className="spin" /></td></tr>
                ) : transactions.length === 0 ? (
                  <tr><td colSpan={6} style={{ textAlign: 'center', padding: '24px', color: 'var(--color-text-muted)' }}>Belum ada transaksi hari ini.</td></tr>
                ) : transactions.map(t => (
                  <tr key={t.id}>
                    <td style={{ fontSize: '11px', color: 'var(--color-text-muted)', fontFamily: 'monospace' }}>{t.txRef}</td>
                    <td style={{ fontWeight: 600 }}>{t.customer}</td>
                    <td><span className={`badge channel-${t.channel?.toLowerCase() || 'wa'}`}>{t.channel}</span></td>
                    <td style={{ fontWeight: 700 }}>{fmtRp(t.amount)}</td>
                    <td style={{ fontWeight: 700, color: 'var(--color-success)' }}>{fmtRp((t.amount || 0) - (t.fee || 0))}</td>
                    <td>{statusBadge[t.status]}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Calculator */}
        <div className="card">
          <div className="card-header"><span className="card-title">Split-Fee Calculator</span></div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div className="form-group">
              <label className="form-label">Nominal Transaksi</label>
              <input className="form-input" type="number" value={feeAmount} onChange={e => setFeeAmount(Number(e.target.value))} />
            </div>
            <div className="form-group">
              <label className="form-label">Aksena Rate</label>
              <select className="form-input" value={feeRate} onChange={e => setFeeRate(Number(e.target.value))}>
                <option value={1}>1% (Standard)</option>
                <option value={2}>2% (Pro)</option>
              </select>
            </div>
            <div style={{ background: 'rgba(0,212,255,0.05)', padding: '16px', borderRadius: '12px', border: '1px solid var(--color-border)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '13px' }}>
                <span style={{ color: 'var(--color-text-muted)' }}>You Receive</span>
                <span style={{ fontWeight: 700 }}>{fmtRp(feeAmount - calcFee)}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', paddingTop: '8px', borderTop: '1px solid var(--color-border)' }}>
                <span style={{ color: 'var(--color-success)', fontWeight: 600 }}>Aksena Fee</span>
                <span style={{ fontWeight: 700, color: 'var(--color-success)' }}>{fmtRp(calcFee)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
