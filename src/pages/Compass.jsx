import { useState, useEffect } from 'react';
import { Shield, TrendingUp, TrendingDown, BarChart3, MapPin, Bell } from 'lucide-react';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, BarChart, Bar, Cell, Legend,
} from 'recharts';
import { useAuth } from '../context/AuthContext';
import { analyticsService } from '../services/analyticsService';

const fmtRp = (n) => `Rp ${n.toLocaleString('id-ID')}`;

export default function Compass() {
  const { currentUser: user } = useAuth();
  const [insight, setInsight] = useState(null);

  useEffect(() => {
    if (!user) return;
    const unsub = analyticsService.subscribeToCompassInsight(user.uid, (data) => {
      setInsight(data);
    });
    return () => unsub();
  }, [user]);

  if (!insight) {
    return <div style={{ padding: 40, textAlign: 'center', color: 'var(--color-text-muted)', fontSize: 14 }}>Menganalisis big data pasar...</div>;
  }

  const { trendData, benchmarkData, regions, predictive } = insight;

  return (
    <div className="fade-in-up">
      <div className="page-header">
        <div style={{ display:'flex', alignItems:'center', gap:'10px' }}>
          <h1>Market Compass</h1>
          <span className="badge badge-danger"><Shield size={10} /> CONFIDENTIAL</span>
        </div>
        <p>Aksena Big Data Intelligence — De-identified & Privacy-compliant (UU PDP No. 27/2022)</p>
      </div>

      {/* Trend Chart */}
      <div className="grid-2-1" style={{ marginBottom:'24px' }}>
        <div className="card">
          <div className="card-header">
            <span className="card-title">Tren Produk (6 Minggu)</span>
            <span className="badge badge-accent"><span className="live-dot" style={{width:6,height:6,display:'inline-block'}} /> Updated 3j lalu</span>
          </div>
          <ResponsiveContainer width="100%" height={240}>
            <AreaChart data={trendData}>
              <defs>
                <linearGradient id="g1" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#00d4ff" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="#00d4ff" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="g2" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#7c3aed" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="#7c3aed" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="g3" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="#f59e0b" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis dataKey="week" tick={{ fill:'#4e6d8a', fontSize:12 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill:'#4e6d8a', fontSize:11 }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ background:'#0d2040', border:'1px solid rgba(0,212,255,0.2)', borderRadius:8 }} />
              <Legend wrapperStyle={{ fontSize:12, color:'#8baec8' }} />
              <Area type="monotone" dataKey="hijab" name="Hijab" stroke="#00d4ff" strokeWidth={2} fill="url(#g1)" />
              <Area type="monotone" dataKey="batik" name="Batik" stroke="#7c3aed" strokeWidth={2} fill="url(#g2)" />
              <Area type="monotone" dataKey="kaos"  name="Kaos"  stroke="#f59e0b" strokeWidth={2} fill="url(#g3)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Region Trends */}
        <div className="card">
          <div className="card-header">
            <span className="card-title">Trending per Wilayah</span>
            <MapPin size={16} style={{ color:'var(--color-accent)' }} />
          </div>
          <div style={{ display:'flex', flexDirection:'column', gap:'10px' }}>
            {regions.map(r => (
              <div key={r.name} style={{ display:'flex', alignItems:'center', gap:'12px', padding:'10px 12px', background:'var(--color-bg-surface)', borderRadius:'var(--radius-md)', border:'1px solid var(--color-border)' }}>
                <div style={{ flex:1 }}>
                  <div style={{ fontSize:'12px', fontWeight:600, color:'var(--color-text-primary)', marginBottom:2 }}>{r.name}</div>
                  <div style={{ fontSize:'11px', color:'var(--color-text-muted)' }}>🔥 {r.trending}</div>
                </div>
                <span className={`badge ${r.hot ? 'badge-success' : 'badge-info'}`}>
                  <TrendingUp size={10} /> {r.growth}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Price Benchmark + Predictive */}
      <div className="grid-2" style={{ marginBottom:'0' }}>
        {/* Price Benchmarking */}
        <div className="card" style={{ padding:0 }}>
          <div className="card-header" style={{ padding:'16px 20px', borderBottom:'1px solid var(--color-border)' }}>
            <span className="card-title">Price Benchmarking</span>
          </div>
          <div className="table-wrapper" style={{ border:'none', borderRadius:0 }}>
            <table className="table">
              <thead>
                <tr><th>Produk</th><th>Harga Anda</th><th>Rata-rata Industri</th><th>Selisih</th></tr>
              </thead>
              <tbody>
                {benchmarkData.map(b => (
                  <tr key={b.product}>
                    <td style={{ fontWeight:500 }}>{b.product}</td>
                    <td>{fmtRp(b.myPrice)}</td>
                    <td style={{ color:'var(--color-text-muted)' }}>{fmtRp(b.avg)}</td>
                    <td>
                      <span className={`badge ${b.status==='high' ? 'badge-warning' : b.status==='low' ? 'badge-info' : 'badge-success'}`}>
                        {b.status==='high' ? <TrendingUp size={10} /> : <TrendingDown size={10} />} {b.diff}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Predictive Demand */}
        <div className="card">
          <div className="card-header">
            <span className="card-title">Predictive Demand Engine</span>
            <Bell size={16} style={{ color:'var(--color-warning)' }} />
          </div>
          <p style={{ fontSize:'12px', color:'var(--color-text-muted)', marginBottom:'16px' }}>
            Auto follow-up akan dikirim 2 hari sebelum stok pelanggan diprediksi habis.
          </p>
          <div style={{ display:'flex', flexDirection:'column', gap:'10px' }}>
            {predictive.map(p => (
              <div key={p.customer} style={{ padding:'12px', background:'var(--color-bg-surface)', borderRadius:'var(--radius-md)', border:'1px solid var(--color-border)' }}>
                <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:4 }}>
                  <span style={{ fontSize:'13px', fontWeight:600 }}>{p.customer}</span>
                  <span className="badge badge-warning"><Bell size={10} /> {p.predicted}</span>
                </div>
                <div style={{ fontSize:'12px', color:'var(--color-text-muted)' }}>
                  Order terakhir: {p.lastOrder} · Produk: <strong style={{ color:'var(--color-text-primary)' }}>{p.product}</strong>
                </div>
                <button className="btn btn-primary btn-sm" style={{ marginTop:'10px' }}>Kirim Follow-up WA</button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
