import { useState, useEffect } from 'react';
import { TrendingUp, TrendingDown, MessageSquare, CreditCard, Package, Zap } from 'lucide-react';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar
} from 'recharts';
import { useAuth } from '../context/AuthContext';
import { analyticsService } from '../services/analyticsService';

const fmt = (n) => `Rp ${(n / 1000000).toFixed(1)}M`;

export default function Dashboard() {
  const { currentUser: user } = useAuth();
  const [kpi, setKpi] = useState({
    revenue: 0, conversionRate: 0, totalMessages: 0, lowStockCount: 0,
    weeklyData: [0,0,0,0,0,0,0]
  });

  useEffect(() => {
    if (!user) return;
    const unsub = analyticsService.subscribeToDashboardKPI(user.uid, (data) => {
      setKpi(data);
    });
    return () => unsub();
  }, [user]);

  const kpiData = [
    { label: 'Conversion Rate', value: `${kpi.conversionRate}%`, change: '+3.4%', positive: true, icon: TrendingUp, color: '#10b981' },
    { label: 'Revenue Hari Ini', value: fmt(kpi.revenue || 0).replace('Rp ', 'Rp'), change: '+12.1%', positive: true, icon: CreditCard, color: '#00d4ff' },
    { label: 'Pesan Masuk', value: kpi.totalMessages || 0, change: '+28', positive: true, icon: MessageSquare, color: '#f59e0b' },
    { label: 'Stok Low Alert', value: kpi.lowStockCount || 0, change: '-2', positive: true, icon: Package, color: '#ef4444' },
  ];

  const areaData = [
    { day: 'Sen', revenue: kpi.weeklyData[0] || 0 },
    { day: 'Sel', revenue: kpi.weeklyData[1] || 0 },
    { day: 'Rab', revenue: kpi.weeklyData[2] || 0 },
    { day: 'Kam', revenue: kpi.weeklyData[3] || 0 },
    { day: 'Jum', revenue: kpi.weeklyData[4] || 0 },
    { day: 'Sab', revenue: kpi.weeklyData[5] || 0 },
    { day: 'Min', revenue: kpi.weeklyData[6] || 0 },
  ];


const channelData = [
  { name: 'WhatsApp', messages: 112, color: '#25d366' },
  { name: 'Instagram', messages: 45, color: '#e1306c' },
  { name: 'Shopee',    messages: 30, color: '#ee4d2d' },
];

const recentActivity = [
  { time: '2m ago', event: 'AI Closer berhasil closing order Rp 850rb dari WA', type: 'success' },
  { time: '8m ago', event: 'Low stock alert: Produk "Baju Batik Motif A" tersisa 3 pcs', type: 'warning' },
  { time: '15m ago', event: 'Payment Rp 1.2jt terkonfirmasi – Success fee Rp 6rb terpotong', type: 'info' },
  { time: '23m ago', event: 'Pelanggan Budi (IG) mulai percakapan baru', type: 'default' },
  { time: '1j ago', event: 'Market Compass: Produk "Hijab Segi Empat" trending di Jawa Tengah', type: 'accent' },
];

  return (
    <div className="fade-in-up">
      <div className="page-header">
        <h1>Overview</h1>
        <p>Ringkasan performa bisnis Aksena hari ini</p>
      </div>

      {/* KPI Cards */}
      <div className="grid-4" style={{ marginBottom: '24px' }}>
        {kpiData.map(({ label, value, change, positive, icon: Icon, color }) => (
          <div key={label} className="stat-card">
            <div className="stat-icon" style={{ background: `${color}20` }}>
              <Icon size={18} style={{ color }} />
            </div>
            <div className="stat-label">{label}</div>
            <div className="stat-value">{value}</div>
            <div className="stat-change" style={{ color: positive ? 'var(--color-success)' : 'var(--color-danger)' }}>
              {positive ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
              {change} vs kemarin
            </div>
          </div>
        ))}
      </div>

      {/* Charts row */}
      <div className="grid-2-1" style={{ marginBottom: '24px' }}>
        {/* Revenue chart */}
        <div className="card">
          <div className="card-header">
            <span className="card-title">Revenue Mingguan</span>
            <span className="badge badge-success">Live</span>
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={areaData}>
              <defs>
                <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#00d4ff" stopOpacity={0.25} />
                  <stop offset="95%" stopColor="#00d4ff" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis dataKey="day" tick={{ fill: '#4e6d8a', fontSize: 12 }} axisLine={false} tickLine={false} />
              <YAxis tickFormatter={fmt} tick={{ fill: '#4e6d8a', fontSize: 11 }} axisLine={false} tickLine={false} width={55} />
              <Tooltip
                contentStyle={{ background: '#0d2040', border: '1px solid rgba(0,212,255,0.2)', borderRadius: 8 }}
                labelStyle={{ color: '#e8f4fd' }}
                formatter={(v) => [fmt(v), 'Revenue']}
              />
              <Area type="monotone" dataKey="revenue" stroke="#00d4ff" strokeWidth={2} fill="url(#revGrad)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Channel bar */}
        <div className="card">
          <div className="card-header">
            <span className="card-title">Pesan per Channel</span>
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={channelData} layout="vertical" barSize={18}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" horizontal={false} />
              <XAxis type="number" tick={{ fill: '#4e6d8a', fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis dataKey="name" type="category" tick={{ fill: '#8baec8', fontSize: 12 }} axisLine={false} tickLine={false} width={70} />
              <Tooltip contentStyle={{ background: '#0d2040', border: '1px solid rgba(0,212,255,0.2)', borderRadius: 8 }} />
              {channelData.map(({ name, color }) => (
                <Bar key={name} dataKey="messages" fill={color} radius={[0, 4, 4, 0]} />
              ))}
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Activity feed */}
      <div className="card">
        <div className="card-header">
          <span className="card-title">Aktivitas Terbaru</span>
          <span className="live-dot" /> 
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0' }}>
          {recentActivity.map(({ time, event, type }, i) => (
            <div key={i} style={{
              display: 'flex', gap: '12px', alignItems: 'flex-start',
              padding: '12px 0',
              borderBottom: i < recentActivity.length - 1 ? '1px solid var(--color-border)' : 'none',
            }}>
              <div style={{
                width: 8, height: 8, borderRadius: '50%', marginTop: 6, flexShrink: 0,
                background: type === 'success' ? 'var(--color-success)'
                  : type === 'warning' ? 'var(--color-warning)'
                  : type === 'info' ? 'var(--color-info)'
                  : type === 'accent' ? 'var(--color-accent)'
                  : 'var(--color-text-muted)'
              }} />
              <div style={{ flex: 1 }}>
                <p style={{ fontSize: 'var(--font-sm)', color: 'var(--color-text-primary)' }}>{event}</p>
              </div>
              <span style={{ fontSize: 'var(--font-xs)', color: 'var(--color-text-muted)', flexShrink: 0 }}>{time}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
