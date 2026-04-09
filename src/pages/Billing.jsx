import { useState } from 'react';
import { CreditCard, Zap, CheckCircle, Clock, ArrowRight, ShieldCheck, TrendingUp, Info } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { paymentService } from '../services/paymentService';
import toast from 'react-hot-toast';

const PLANS = [
  {
    id: 'basic',
    name: 'Entry Level',
    price: 299000,
    period: 'bulan',
    tokens: 1000,
    features: ['1 Nomor WhatsApp', 'The Harvester (Basic)', 'The Manager (Basic)', 'AI The Closer', 'Email Support'],
    color: '#34d399' // Success green
  },
  {
    id: 'pro',
    name: 'Bisnis Pro',
    price: 699000,
    period: 'bulan',
    tokens: 3000,
    features: ['Semua Fitur Basic', 'The Compass (Analitik)', 'The Marketer (Broadcast)', 'Advanced AI Router', 'Prioritas Antrian WA'],
    color: '#00d4ff', // Accent cyan
    popular: true
  },
  {
    id: 'enterprise',
    name: 'Skala Besar',
    price: 1499000,
    period: 'bulan',
    tokens: 10000,
    features: ['Semua Fitur Pro', 'Custom AI Prompting', 'Dedicated Account Manager', 'Multi-user Team Access', 'SLA 99.9% Cloud API'],
    color: '#a855f7' // Purple
  }
];

const PACKS = [
  { id: 'pack1', tokens: 1000, price: 750000 },
  { id: 'pack2', tokens: 3000, price: 2100000 },
  { id: 'pack3', tokens: 10000, price: 6000000 },
];

const fmtRp = (n) => `Rp ${Number(n || 0).toLocaleString('id-ID')}`;

export default function Billing() {
  const { currentUser, userProfile } = useAuth();
  const [loading, setLoading] = useState(false);

  const handlePayment = async (amount, type, description) => {
    setLoading(true);
    try {
      const result = await paymentService.pay(currentUser.uid, amount, type, description);
      if (result.status === 'success' || result.transaction_status === 'settlement') {
        toast.success('Pembayaran Berhasil! Saldo/Langganan Anda akan segera diperbarui.');
      }
    } catch (error) {
      toast.error('Terjadi kesalahan saat memproses pembayaran.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fade-in-up">
      <div className="page-header">
        <h1>Billing & Subscription</h1>
        <p>Kelola paket langganan dan isi ulang kuota token Aksena Anda</p>
      </div>

      {/* Current Status Header */}
      <div className="grid-2-1" style={{ marginBottom: '32px' }}>
        <div className="card" style={{ 
          background: 'linear-gradient(135deg, rgba(0, 212, 255, 0.1) 0%, rgba(0, 212, 255, 0.05) 100%)',
          border: '1px solid rgba(0, 212, 255, 0.2)'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <div style={{ fontSize: '14px', color: 'var(--color-text-muted)', marginBottom: '4px' }}>Paket Aktif</div>
              <div style={{ fontSize: '24px', fontWeight: '800', color: 'var(--color-accent)', textTransform: 'capitalize' }}>
                {userProfile?.plan || 'Basic'} Plan
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '12px', fontSize: '13px', color: 'var(--color-text-secondary)' }}>
                <Clock size={14} /> Berakhir pada: {userProfile?.subscriptionExpiry ? new Date(userProfile.subscriptionExpiry.seconds * 1000).toLocaleDateString() : '30 April 2026'}
              </div>
            </div>
            <div className="badge badge-accent" style={{ padding: '8px 16px', fontSize: '12px' }}>
              <ShieldCheck size={14} style={{ marginRight: 6 }} /> Active
            </div>
          </div>
        </div>

        <div className="card" style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '14px', color: 'var(--color-text-muted)', marginBottom: '8px' }}>Saldo Token Saat Ini</div>
          <div style={{ fontSize: '32px', fontWeight: '900', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
            <Zap size={24} style={{ fill: 'var(--color-warning)', color: 'var(--color-warning)' }} />
            {userProfile?.tokenBalance?.toLocaleString() || '0'}
          </div>
          <p style={{ fontSize: '12px', color: 'var(--color-text-muted)', marginTop: '8px' }}>Kredit buat WhatsApp Blast, AI Chat, & Email</p>
        </div>
      </div>

      {/* Subscription Plans */}
      <div style={{ marginBottom: '40px' }}>
        <div style={{ marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <CheckCircle size={20} style={{ color: 'var(--color-accent)' }} />
          <h2 style={{ fontSize: '18px', fontWeight: '700' }}>Pilih Paket Langganan Bulanan</h2>
        </div>
        
        <div className="grid-3" style={{ gap: '24px' }}>
          {PLANS.map((plan) => (
            <div key={plan.id} className="card" style={{ 
              position: 'relative',
              border: plan.popular ? '2px solid var(--color-accent)' : '1px solid var(--color-border)',
              display: 'flex', flexDirection: 'column'
            }}>
              {plan.popular && (
                <div style={{ 
                  position: 'absolute', top: '-12px', left: '50%', transform: 'translateX(-50%)',
                  background: 'var(--color-accent)', color: '#000', padding: '4px 12px',
                  borderRadius: '20px', fontSize: '11px', fontWeight: '800', letterSpacing: '0.05em'
                }}>
                  TERPOPULER
                </div>
              )}
              
              <div style={{ marginBottom: '20px' }}>
                <h3 style={{ fontSize: '16px', fontWeight: '700', marginBottom: '4px' }}>{plan.name}</h3>
                <div style={{ fontSize: '28px', fontWeight: '900', color: '#fff', marginTop: '12px' }}>
                  {fmtRp(plan.price)} <span style={{ fontSize: '14px', fontWeight: '400', color: 'var(--color-text-muted)' }}>/{plan.period}</span>
                </div>
                <div style={{ padding: '8px 12px', background: 'rgba(255,255,255,0.05)', borderRadius: '8px', marginTop: '10px', fontSize: '13px', color: 'var(--color-success)', fontWeight: '600' }}>
                  Gratis {plan.tokens.toLocaleString()} Token/Bulan
                </div>
              </div>

              <div style={{ flex: 1, marginBottom: '24px' }}>
                <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {plan.features.map((feat, i) => (
                    <li key={i} style={{ fontSize: '13px', color: 'var(--color-text-secondary)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <CheckCircle size={14} style={{ color: plan.color, flexShrink: 0 }} />
                      {feat}
                    </li>
                  ))}
                </ul>
              </div>

              <button 
                className={plan.id === userProfile?.plan ? 'btn btn-secondary' : 'btn btn-primary'}
                style={{ width: '100%' }}
                disabled={loading || plan.id === userProfile?.plan}
                onClick={() => handlePayment(plan.price, 'SUBSCRIPTION', `Langganan ${plan.name}`)}
              >
                {plan.id === userProfile?.plan ? 'Paket Aktif' : `Pilih ${plan.name}`}
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Top-up Tokens Section */}
      <div className="card" style={{ background: 'rgba(255, 255, 255, 0.02)' }}>
        <div style={{ marginBottom: '20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <TrendingUp size={20} style={{ color: 'var(--color-warning)' }} />
            <h2 style={{ fontSize: '18px', fontWeight: '700' }}>Top-up Token (Pay-as-you-go)</h2>
          </div>
          <div style={{ background: 'rgba(245, 158, 11, 0.1)', color: 'var(--color-warning)', padding: '6px 12px', borderRadius: '20px', fontSize: '12px', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Info size={14} /> Direkomendasikan untuk Broadcast Massal
          </div>
        </div>

        <div className="grid-3" style={{ gap: '20px' }}>
          {PACKS.map((pack) => (
            <div key={pack.id} style={{ 
              padding: '20px', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)',
              background: 'var(--color-bg-surface)', textAlign: 'center', transition: 'all 0.3s',
              cursor: 'pointer'
            }} onMouseOver={(e) => e.currentTarget.style.borderColor = 'var(--color-warning)'} onMouseOut={(e) => e.currentTarget.style.borderColor = 'var(--color-border)'}>
              <div style={{ fontSize: '14px', color: 'var(--color-text-muted)', marginBottom: '4px' }}>Paket {pack.tokens.toLocaleString()}</div>
              <div style={{ fontSize: '20px', fontWeight: '800', color: '#fff', marginBottom: '16px' }}>{pack.tokens.toLocaleString()} Token</div>
              <div style={{ fontSize: '18px', fontWeight: '700', color: 'var(--color-warning)', marginBottom: '20px' }}>{fmtRp(pack.price)}</div>
              <button 
                className="btn btn-ghost"
                style={{ width: '100%', borderColor: 'var(--color-warning)', color: 'var(--color-warning)' }}
                disabled={loading}
                onClick={() => handlePayment(pack.price, 'TOPUP', `Topup ${pack.tokens} Tokens`)}
              >
                Top-up Sekarang <ArrowRight size={14} style={{ marginLeft: 8 }} />
              </button>
            </div>
          ))}
        </div>
        
        <p style={{ marginTop: '20px', fontSize: '12px', color: 'var(--color-text-muted)', textAlign: 'center' }}>
          * Token tidak memiliki masa kadaluarsa selama langganan Paket Bulanan Anda aktif.
        </p>
      </div>
    </div>
  );
}
