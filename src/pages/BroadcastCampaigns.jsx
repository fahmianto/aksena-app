import { useState } from 'react';
import { Send, Sparkles, Filter, Users, AlertCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import { API_BASE_URL } from '../config/api';

export default function BroadcastCampaigns() {
  const { currentUser } = useAuth();
  
  const [topic, setTopic] = useState('');
  const [message, setMessage] = useState('');
  const [audienceStage, setAudienceStage] = useState('ALL');
  const [sendType, setSendType] = useState('NOW'); // 'NOW' or 'SCHEDULED'
  const [scheduledAt, setScheduledAt] = useState('');
  const [channel, setChannel] = useState('WA'); // 'WA' | 'EMAIL' | 'SMART'
  const [subject, setSubject] = useState('');
  
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSending, setIsSending] = useState(false);

  const handleGenerateAI = async () => {
    if (!topic) {
      toast.error('Masukkan topik promo terlebih dahulu');
      return;
    }

    setIsGenerating(true);
    const loadingToast = toast.loading('Silakan tunggu, AI sedang menyusun kata-kata...');
    
    try {
      const res = await fetch(`${API_BASE_URL}/api/ai/copywriter`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ topic })
      });
      const data = await res.json();
      
      if (!res.ok) throw new Error(data.error || 'Gagal generate AI');
      
      setMessage(data.suggestion);
      toast.success('Draft Copywriting berhasil dibuat!', { id: loadingToast });
    } catch (error) {
      toast.error(error.message, { id: loadingToast });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleBroadcast = async () => {
    if (!message) {
      toast.error('Pesan broadcast tidak boleh kosong');
      return;
    }

    if (channel !== 'WA' && !subject) {
      toast.error('Subjek email wajib diisi bila channel bukan spesifik WA');
      return;
    }

    if (sendType === 'SCHEDULED' && !scheduledAt) {
      toast.error('Pilih tanggal dan jam penjadwalan terlebih dahulu');
      return;
    }
    
    const confirmMsg = sendType === 'NOW' 
      ? 'Yakin ingin mendistribusikan Broadcast Promo ini secara massal SEKARANG?'
      : `Yakin ingin MENJADWALKAN Broadcast Promo ini untuk ${new Date(scheduledAt).toLocaleString('id-ID')}?`;
      
    if (!window.confirm(confirmMsg)) return;

    setIsSending(true);
    const loadingToast = toast.loading('Sedang mengantrekan pengiriman massal ke server...');

    try {
      const res = await fetch(`${API_BASE_URL}/api/marketer/broadcast`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message,
          subject,
          channel,
          audienceParams: { filterStage: audienceStage },
          userId: currentUser?.uid,
          scheduledAt: sendType === 'SCHEDULED' ? scheduledAt : null
        })
      });
      
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Gagal merespon broadcast');
      
      const successMsg = sendType === 'NOW' 
        ? `🚀 Berhasil! Menembak ${data.targetCount || '?'} target audiens.`
        : `⏳ Berhasil! Broadcast dijadwalkan untuk dikirim nanti.`;
        
      toast.success(successMsg, { id: loadingToast, duration: 5000 });
      setTopic('');
      setMessage('');
      setScheduledAt('');
      setSendType('NOW');
    } catch (error) {
      toast.error(error.message, { id: loadingToast });
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="fade-in-up">
      <div className="page-header" style={{ marginBottom: 24 }}>
        <h1>Promo Broadcast</h1>
        <p>Distribusi penawaran tematik massal ke sekumpulan Leads (Targeted Marketing)</p>
      </div>

      <div className="grid-2" style={{ gap: 24 }}>
        
        {/* Kolom Kiri: AI Copywriter & Komposisi */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div className="card" style={{ padding: 24 }}>
            <h2 style={{ fontSize: 16, marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
              <Sparkles size={18} color="var(--color-accent)"/>
              Aksena AI Copywriter
            </h2>
            <div className="form-group">
              <label>Apa topik promo Anda hari ini?</label>
              <div style={{ display: 'flex', gap: 8 }}>
                <input 
                  type="text" 
                  className="form-input" 
                  style={{ flex: 1 }}
                  placeholder="Cth: Flash Sale Baju Lebaran Diskon 50%"
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                />
                <button 
                  className="btn btn-outline" 
                  style={{ whiteSpace: 'nowrap' }}
                  onClick={handleGenerateAI}
                  disabled={isGenerating}
                >
                  {isGenerating ? 'Mikir...' : 'Generate 🪄'}
                </button>
              </div>
            </div>
          </div>

          <div className="card" style={{ padding: 24 }}>
            <h2 style={{ fontSize: 16, marginBottom: 16 }}>Opsi Distribusi & Pesan</h2>
            
            <div className="form-group" style={{ marginBottom: 16 }}>
              <label>Pilih Saluran (Channel)</label>
              <select 
                className="form-input" 
                value={channel}
                onChange={(e) => setChannel(e.target.value)}
              >
                <option value="WA">📱 WhatsApp Only</option>
                <option value="EMAIL">📧 Email Only</option>
                <option value="BOTH">📱📧 WhatsApp & Email (Broadcast Ganda)</option>
                <option value="SMART">🤖 Smart Omnichannel (Email diutamakan jika ada)</option>
              </select>
            </div>

            {channel !== 'WA' && (
              <div className="form-group" style={{ marginBottom: 16 }}>
                <label>Judul / Subjek Email</label>
                <input 
                  type="text" 
                  className="form-input" 
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  placeholder="Subjek unik yang bikin penasaran..."
                />
              </div>
            )}

            <div className="form-group">
              <label>Draf Pesan {channel === 'EMAIL' ? '(Mendukung HTML dasar via Node)' : ''}</label>
              <textarea 
                className="form-input" 
                rows={10} 
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Tulis manual atau gunakan tombol Generate AI di atas..."
                style={{ lineHeight: 1.6 }}
              />
              <div style={{ fontSize: 12, color: 'var(--color-text-muted)', marginTop: 8 }}>
                Gunakan <code>{`{{name}}`}</code> atau <code>{`{{businessName}}`}</code> untuk menyapa pelanggan.
              </div>
            </div>
            
            <div className="card" style={{ padding: 12, background: 'rgba(239,68,68,0.05)', border: '1px solid rgba(239,68,68,0.2)' }}>
              <div style={{ display: 'flex', gap: 8, alignItems: 'flex-start' }}>
                <AlertCircle size={16} color="var(--color-danger)" style={{ marginTop: 2, flexShrink: 0 }} />
                <div style={{ fontSize: 12, color: 'var(--color-text-secondary)', lineHeight: 1.5 }}>
                  <strong style={{ color: 'var(--color-text)' }}>Footer Otomatis (Anti-Spam):</strong><br/>
                  Sistem akan otomatis menambahkan baris <em>"Balas UNSUB untuk berhenti langganan"</em> di akhir pesan ini untuk menjaga keamanan nomor WA Anda.
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Kolom Kanan: Target Audience & Eksekusi */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div className="card" style={{ padding: 24, border: '1px solid var(--color-primary)' }}>
            <h2 style={{ fontSize: 16, marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
              <Filter size={18} color="var(--color-primary)"/>
              Target Audiens
            </h2>
            
            <div className="form-group">
              <label>Pilih Segmentasi Leads</label>
              <select 
                className="form-input" 
                value={audienceStage}
                onChange={(e) => setAudienceStage(e.target.value)}
              >
                <option value="ALL">Semua Leads (Kecuali Unsubscribed)</option>
                <option value="NEW">Baru Daftar (Stage: NEW)</option>
                <option value="NURTURED">Sedang Diedukasi (Stage: NURTURED)</option>
                <option value="OFFERED">Pernah Ditawarkan (Stage: OFFERED)</option>
                <option value="LOST">Leads Pasif / Ditolak (Stage: LOST)</option>
              </select>
            </div>

            <div style={{ margin: '24px 0', padding: '16px 0', borderTop: '1px solid var(--color-border)', borderBottom: '1px solid var(--color-border)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: 14, color: 'var(--color-text-muted)' }}>Estimasi Broadcast:</span>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontWeight: 700, fontSize: 16 }}>
                  <Users size={16} /> Sedang dihitung...
                </div>
              </div>
            </div>

            <div className="form-group" style={{ marginBottom: 24 }}>
              <label>Opsi Pengiriman</label>
              <div style={{ display: 'flex', gap: 16, marginBottom: 12 }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}>
                  <input 
                    type="radio" 
                    name="sendType" 
                    value="NOW" 
                    checked={sendType === 'NOW'} 
                    onChange={() => setSendType('NOW')} 
                  />
                  <span>Kirim Sekarang</span>
                </label>
                <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}>
                  <input 
                    type="radio" 
                    name="sendType" 
                    value="SCHEDULED" 
                    checked={sendType === 'SCHEDULED'} 
                    onChange={() => setSendType('SCHEDULED')} 
                  />
                  <span>Jadwalkan</span>
                </label>
              </div>

              {sendType === 'SCHEDULED' && (
                <div className="fade-in">
                  <input 
                    type="datetime-local" 
                    className="form-input" 
                    value={scheduledAt}
                    onChange={(e) => setScheduledAt(e.target.value)}
                  />
                  <div style={{ fontSize: 11, color: 'var(--color-text-muted)', marginTop: 8 }}>
                    Sistem akan mengirimkan pesan otomatis pada tanggal dan jam yang dipilih. Pastikan server nyala.
                  </div>
                </div>
              )}
            </div>

            <button 
              className="btn btn-primary" 
              style={{ width: '100%', padding: 14, fontSize: 15, display: 'flex', justifyContent: 'center', gap: 8 }}
              onClick={handleBroadcast}
              disabled={isSending}
            >
              <Send size={18} />
              {isSending ? 'Memproses Antrean...' : (sendType === 'NOW' ? 'Broadcast Sekarang 🚀' : 'Simpan Jadwal ⏳')}
            </button>
            <div style={{ textAlign: 'center', fontSize: 11, color: 'var(--color-text-muted)', marginTop: 12 }}>
              Aman dari blokir. Pesan dikirim berurutan dengan jeda waktu aman.
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
