import { Link } from 'react-router-dom';
import {
  Zap, MessageSquare, Bot, Package,
  CreditCard, BarChart3, ArrowRight, Shield, TrendingUp, Globe
} from 'lucide-react';
import './Landing.css';

const layers = [
  { icon: MessageSquare, label: 'The Harvester',  desc: 'WA, Instagram & Shopee terintegrasi dalam satu inbox.', color: '#25d366' },
  { icon: Bot,           label: 'The Closer',     desc: 'AI Sales Agent dengan teknik Double Binding & Objection Handling.', color: '#00d4ff' },
  { icon: Package,       label: 'The Manager',    desc: 'Stok real-time, low-stock alert, & saran restock otomatis.', color: '#f59e0b' },
  { icon: CreditCard,    label: 'The Collector',  desc: 'Auto split-fee 0.5%–5% saat transaksi berhasil.', color: '#7c3aed' },
  { icon: BarChart3,     label: 'Market Compass', desc: 'Big Data insight: tren produk & price benchmarking per wilayah.', color: '#ef4444' },
];

const stats = [
  { value: '20%+',  label: 'Kenaikan Conversion Rate' },
  { value: '100%',  label: 'Akurasi Split Payment' },
  { value: '<6j',   label: 'Refresh Insight Data' },
  { value: '3-in-1', label: 'Channel Terintegrasi' },
];

export default function Landing() {
  return (
    <div className="landing">
      {/* Navbar */}
      <nav className="landing-nav">
        <div className="landing-nav-logo">
          <div className="landing-nav-icon"><Zap size={16} /></div>
          <span>AKSENA</span>
        </div>
        <div className="landing-nav-links">
          <a href="#features">Features</a>
          <a href="#stats">KPI</a>
          <Link to="/login" className="btn btn-secondary btn-sm">Login</Link>
          <Link to="/register" className="btn btn-primary btn-sm">Mulai Gratis</Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="landing-hero">
        <div className="hero-badge">
          <Zap size={12} />
          <span>Aksena.id v2.0 — The Intelligence Era</span>
        </div>
        <h1 className="hero-title">
          Ubah Percakapan WhatsApp<br />
          Jadi <span className="gradient-text">Aset Data Bisnis</span>
        </h1>
        <p className="hero-desc">
          Infrastruktur data terdepan untuk ekonomi mikro Indonesia.<br />
          AI Sales Agent, Omnichannel Inbox, Big Data Insight — semua dalam satu platform.
        </p>
        <div className="hero-cta">
          <Link to="/register" className="btn btn-primary">
            Mulai Sekarang <ArrowRight size={16} />
          </Link>
          <Link to="/dashboard" className="btn btn-secondary">
            Lihat Dashboard
          </Link>
        </div>

        {/* Glow orbs */}
        <div className="hero-orb hero-orb-1" />
        <div className="hero-orb hero-orb-2" />
      </section>

      {/* Stats */}
      <section className="landing-stats" id="stats">
        {stats.map((s) => (
          <div key={s.label} className="landing-stat">
            <div className="landing-stat-value">{s.value}</div>
            <div className="landing-stat-label">{s.label}</div>
          </div>
        ))}
      </section>

      {/* Features / Layers */}
      <section className="landing-features" id="features">
        <div className="section-header">
          <h2>Arsitektur 6-Layer <span className="gradient-text">Aksena</span></h2>
          <p>Dari chat pelanggan ke insight bisnis — terotomasi penuh.</p>
        </div>
        <div className="features-grid">
          {layers.map(({ icon: Icon, label, desc, color }) => (
            <div key={label} className="feature-card">
              <div className="feature-card-icon" style={{ background: `${color}20`, border: `1px solid ${color}40` }}>
                <Icon size={20} style={{ color }} />
              </div>
              <h3>{label}</h3>
              <p>{desc}</p>
            </div>
          ))}
          <div className="feature-card feature-card-brain">
            <div className="feature-card-icon" style={{ background: 'rgba(0,212,255,0.1)', border: '1px solid rgba(0,212,255,0.3)' }}>
              <Shield size={20} style={{ color: 'var(--color-accent)' }} />
            </div>
            <h3>De-ID Engine <span className="badge badge-danger">CONFIDENTIAL</span></h3>
            <p>Privacy-first: hapus PII sebelum data masuk ke Big Data warehouse.</p>
          </div>
        </div>
      </section>

      {/* CTA Footer */}
      <section className="landing-cta-section">
        <Globe size={40} color="var(--color-accent)" />
        <h2>Siap jadi bagian dari infrastruktur data Indonesia?</h2>
        <Link to="/register" className="btn btn-primary">
          Daftar Sekarang <ArrowRight size={16} />
        </Link>
      </section>
    </div>
  );
}
