import { useState } from 'react';
import { Truck, Search, MapPin, Package, Clock, CheckCircle, ChevronRight, Loader } from 'lucide-react';
import { trackingService } from '../services/trackingService';

export default function Tracking() {
  const [awb, setAwb] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  const handleTrack = async (e) => {
    if (e) e.preventDefault();
    if (!awb) return;

    setLoading(true);
    setError(null);
    setResult(null);

    const res = await trackingService.trackAWB(awb);
    if (res.success) {
      setResult(res.data);
    } else {
      setError(res.message);
    }
    setLoading(false);
  };

  return (
    <div className="fade-in-up">
      <div className="page-header">
        <h1>Tracking Center</h1>
        <p>Pantau status pengiriman paket pelanggan secara real-time</p>
      </div>

      <div className="grid-2-1">
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          {/* Tracking Search Form */}
          <div className="glass-card" style={{ padding: '32px' }}>
            <h2 style={{ fontSize: '18px', fontWeight: '700', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '10px' }}>
              <Search size={20} color="var(--color-accent)" /> Cek Nomor Resi
            </h2>
            <form onSubmit={handleTrack} style={{ display: 'flex', gap: '12px' }}>
              <input 
                type="text" 
                className="form-input" 
                placeholder="Masukkan Nomor Resi (misal: AKSN12345678)"
                value={awb}
                onChange={(e) => setAwb(e.target.value)}
                style={{ flex: 1, height: '48px', fontSize: '15px' }}
              />
              <button className="btn btn-primary" style={{ padding: '0 24px', height: '48px' }} disabled={loading}>
                {loading ? <Loader className="spin" size={20} /> : 'Lacak Paket'}
              </button>
            </form>
            {error && <p style={{ color: 'var(--color-danger)', fontSize: '13px', marginTop: '12px' }}>{error}</p>}
          </div>

          {/* Result Card */}
          {result && (
            <div className="glass-card" style={{ padding: 0, overflow: 'hidden' }}>
              <div style={{ padding: '24px', background: 'rgba(0,212,255,0.05)', borderBottom: '1px solid var(--color-border)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <div className="badge badge-accent" style={{ marginBottom: '8px' }}>{result.summary.courier}</div>
                    <div style={{ fontSize: '20px', fontWeight: '800' }}>{result.summary.awb}</div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '12px', color: 'var(--color-text-muted)' }}>Status Terakhir</div>
                    <div style={{ color: 'var(--color-success)', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <CheckCircle size={16} /> {result.summary.status}
                    </div>
                  </div>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', padding: '24px', borderBottom: '1px solid var(--color-border)' }}>
                <div>
                  <div style={{ fontSize: '11px', color: 'var(--color-text-muted)', textTransform: 'uppercase', marginBottom: '4px' }}>Pengirim</div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <MapPin size={14} color="var(--color-text-muted)" />
                    <span style={{ fontWeight: 600 }}>{result.summary.origin}</span>
                  </div>
                </div>
                <div>
                  <div style={{ fontSize: '11px', color: 'var(--color-text-muted)', textTransform: 'uppercase', marginBottom: '4px' }}>Penerima</div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <MapPin size={14} color="var(--color-accent)" />
                    <span style={{ fontWeight: 600 }}>{result.summary.receiver} ({result.summary.destination})</span>
                  </div>
                </div>
              </div>

              <div style={{ padding: '24px' }}>
                <h3 style={{ fontSize: '14px', fontWeight: '700', marginBottom: '20px' }}>Riwayat Perjalanan</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0' }}>
                  {result.history.map((step, i) => (
                    <div key={i} style={{ display: 'flex', gap: '20px', position: 'relative' }}>
                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                        <div style={{ 
                          width: '12px', height: '12px', borderRadius: '50%', 
                          background: i === result.history.length - 1 ? 'var(--color-accent)' : 'var(--color-border-strong)',
                          zIndex: 1, 
                          marginTop: '4px',
                          boxShadow: i === result.history.length - 1 ? '0 0 10px var(--color-accent)' : 'none'
                        }} />
                        {i < result.history.length - 1 && (
                          <div style={{ width: '2px', flex: 1, background: 'var(--color-border)', margin: '4px 0' }} />
                        )}
                      </div>
                      <div style={{ paddingBottom: '24px' }}>
                        <div style={{ fontSize: '12px', fontWeight: '700', color: i === result.history.length - 1 ? 'var(--color-text-primary)' : 'var(--color-text-secondary)' }}>
                          {step.desc}
                        </div>
                        <div style={{ fontSize: '11px', color: 'var(--color-text-muted)', marginTop: '4px' }}>
                          {step.date} • {step.location}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Sidebar / Recent Shipments */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div className="glass-card">
            <h3 style={{ fontSize: '14px', fontWeight: '700', marginBottom: '16px' }}>Pengiriman Terbaru</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {[
                { awb: 'AKSN99283741', courier: 'JNE', status: 'Transit' },
                { awb: 'AKSN99283742', courier: 'J&T', status: 'Delivered' },
                { awb: 'AKSN99283743', courier: 'SiCepat', status: 'Pick Up' }
              ].map(item => (
                <div 
                  key={item.awb} 
                  style={{ 
                    padding: '12px', borderRadius: 'var(--radius-md)', background: 'rgba(255,255,255,0.02)', 
                    border: '1px solid var(--color-border)', cursor: 'pointer', transition: 'all 0.2s'
                  }}
                  onClick={() => { setAwb(item.awb); handleTrack(); }}
                  onMouseOver={(e) => e.currentTarget.style.borderColor = 'var(--color-accent-glow)'}
                  onMouseOut={(e) => e.currentTarget.style.borderColor = 'var(--color-border)'}
                >
                  <div style={{ fontSize: '12px', fontWeight: '600', marginBottom: '2px' }}>{item.awb}</div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: 'var(--color-text-muted)' }}>
                    <span>{item.courier}</span>
                    <span style={{ color: item.status === 'Delivered' ? 'var(--color-success)' : 'var(--color-warning)' }}>{item.status}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="glass-card" style={{ background: 'linear-gradient(135deg, rgba(124,58,237,0.1), transparent)' }}>
            <h3 style={{ fontSize: '14px', fontWeight: '700', color: '#a78bfa', marginBottom: '10px' }}>💡 Tips Aksena</h3>
            <p style={{ fontSize: '12px', color: 'var(--color-text-secondary)', lineHeight: 1.5 }}>
              AI Aksena bisa otomatis memberitahu pelanggan via WhatsApp setiap kali status paket berubah. Aktifkan fitur <b>Auto-Tracking Notification</b> di Pengaturan.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
