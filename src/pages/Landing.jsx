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
          <span>AKSENA.ID</span>
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
          <h2>Arsitektur 6-Layer <span className="gradient-text">Aksena.id</span></h2>
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

      {/* Lead Capture Form */}
      <section className="landing-demo" id="demo" style={{ padding: '80px 20px', background: 'rgba(0,212,255,0.03)', borderTop: '1px solid var(--color-border)' }}>
        <div className="section-header" style={{ textAlign: 'center', marginBottom: '40px' }}>
          <h2>Tertarik Mencoba <span className="gradient-text">Aksena.id</span>?</h2>
          <p>Tinggalkan kontak Anda, tim kami akan memberikan demo eksklusif.</p>
        </div>
        <div className="card" style={{ maxWidth: '500px', margin: '0 auto' }}>
          <form className="auth-form" onSubmit={async (e) => {
            e.preventDefault();
            const formData = new FormData(e.target);
            const data = {
              name: formData.get('name'),
              email: formData.get('email'),
              phone: formData.get('phone'),
              business: formData.get('business'),
              source: 'landing_demo',
              stage: 'LEAD'
            };
            try {
              const { createLead } = await import('../services/leadService');
              await createLead(data);
              alert('Terima kasih! Tim Aksena akan segera menghubungi Anda di WhatsApp. 🚀');
              e.target.reset();
            } catch (err) {
              alert('Gagal mengirim data. Coba lagi nanti.');
            }
          }}>
            <div className="form-group">
              <label className="form-label">Nama Lengkap</label>
              <input className="form-input" name="name" type="text" placeholder="Budi Santoso" required />
            </div>
            <div className="form-group" style={{ marginTop: '16px' }}>
              <label className="form-label">Nama Bisnis</label>
              <input className="form-input" name="business" type="text" placeholder="Toko Maju Jaya" required />
            </div>
            <div className="form-group" style={{ marginTop: '16px' }}>
              <label className="form-label">Nomor WhatsApp</label>
              <input className="form-input" name="phone" type="text" placeholder="628123456789" required />
            </div>
            <div className="form-group" style={{ marginTop: '16px' }}>
              <label className="form-label">Email</label>
              <input className="form-input" name="email" type="email" placeholder="budi@email.com" required />
            </div>
            <button type="submit" className="btn btn-primary w-full" style={{ marginTop: '24px', justifyContent: 'center' }}>
              Minta Demo Sekarang
            </button>
          </form>
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
