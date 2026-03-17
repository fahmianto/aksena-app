import { useState, useEffect } from 'react';
import { Brain as BrainIcon, Save, Info, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { brainService } from '../services/brainService';
import toast from 'react-hot-toast';

export default function Brain() {
  const { currentUser: user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    businessContext: '',
    uspAndBenefits: '',
    faq: '',
    shippingPolicy: ''
  });

  useEffect(() => {
    if (!user) return;
    const loadData = async () => {
      try {
        const data = await brainService.getKnowledge(user.uid);
        if (data) setFormData({
          businessContext: data.businessContext || '',
          uspAndBenefits: data.uspAndBenefits || '',
          faq: data.faq || '',
          shippingPolicy: data.shippingPolicy || ''
        });
      } catch (e) {
        toast.error('Gagal memuat The Brain');
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [user]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSave = async () => {
    if (!user) return;
    setSaving(true);
    try {
      await brainService.saveKnowledge(user.uid, formData);
      toast.success('Knowledge Base berhasil disimpan!');
    } catch (e) {
      toast.error('Gagal menyimpan ke The Brain');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fade-in-up" style={{ maxWidth: '800px' }}>
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <div style={{ display:'flex', alignItems:'center', gap:'10px' }}>
            <h1>The Brain</h1>
            <span className="badge badge-purple"><BrainIcon size={12} style={{marginRight:4}} /> RAG Config</span>
          </div>
          <p>Membekali AI Agent Anda dengan *Product Knowledge* dan *Business Rules*.</p>
        </div>
        <button 
          className="btn btn-primary" 
          onClick={handleSave} 
          disabled={saving || loading}
          style={{ display:'flex', alignItems:'center', gap:'8px' }}
        >
          {saving ? 'Menyimpan...' : <><Save size={16} /> Simpan Knowledge</>}
        </button>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        {/* Info Banner */}
        <div style={{ background: 'rgba(124, 58, 237, 0.1)', border: '1px solid rgba(124, 58, 237, 0.3)', padding: '16px', borderRadius: 'var(--radius-md)', display: 'flex', gap: '12px' }}>
          <Info size={20} style={{ color: 'var(--color-purple)', flexShrink: 0 }} />
          <div>
            <h4 style={{ fontSize: '14px', color: 'var(--color-purple)', margin: '0 0 6px 0' }}>Cara Kerja RAG (Retrieval-Augmented Generation)</h4>
            <p style={{ fontSize: '13px', color: 'var(--color-text-secondary)', margin: 0, lineHeight: 1.5 }}>
              Semua teks yang Anda masukkan di sini akan disinkronkan ke Vector Database. Ketika *The Harvester* atau *The Closer* diaktifkan, AI akan merujuk pada informasi ini untuk merespons pelanggan secara otomatis.
            </p>
          </div>
        </div>

        {loading ? (
          <div style={{ padding: 40, textAlign: 'center', color: 'var(--color-text-muted)', fontSize: 14 }}>Mengunduh profil otak AI...</div>
        ) : (
          <>
            <div className="card">
              <div className="card-header">
                <span className="card-title">1. Business Profile & Persona</span>
              </div>
              <div style={{ padding: '0' }}>
                <p style={{ fontSize: '12px', color: 'var(--color-text-muted)', marginBottom: '8px' }}>Sebutkan nama brand Anda, tone bahasa (misal: ramah, pakai Kak/Sis), dan deskripsi umum bisnis Anda.</p>
                <textarea 
                  name="businessContext"
                  className="input" 
                  rows="4" 
                  placeholder="Contoh: Brand kami 'HijabCantik'. Panggil customer dengan 'Kak'. Kami menjual hijab premium bahan voal ultrafine..."
                  value={formData.businessContext}
                  onChange={handleChange}
                  style={{ width: '100%', resize: 'vertical' }}
                />
              </div>
            </div>

            <div className="card">
              <div className="card-header">
                <span className="card-title">2. Unique Selling Proposition (USP) & Benefit</span>
              </div>
              <div style={{ padding: '0' }}>
                <p style={{ fontSize: '12px', color: 'var(--color-text-muted)', marginBottom: '8px' }}>Digunakan AI untuk teknik *Objection Handling* ketika customer ragu atau komplain harga.</p>
                <textarea 
                  name="uspAndBenefits"
                  className="input" 
                  rows="5" 
                  placeholder="Contoh: 1. Harga lebih mahal karena bahan import asli. 2. Jahitan tepi rapi butik, bukan neci pabrik. 3. Nyaman dipakai seharian tidak bikin gerah..."
                  value={formData.uspAndBenefits}
                  onChange={handleChange}
                  style={{ width: '100%', resize: 'vertical' }}
                />
              </div>
            </div>

            <div className="card">
              <div className="card-header">
                <span className="card-title">3. Aturan Pengiriman & Ekspedisi</span>
              </div>
              <div style={{ padding: '0' }}>
                <p style={{ fontSize: '12px', color: 'var(--color-text-muted)', marginBottom: '8px' }}>Ongkos kirim gratis? Bisa COD? Batas waktu transfer?</p>
                <textarea 
                  name="shippingPolicy"
                  className="input" 
                  rows="3" 
                  placeholder="Contoh: Kami bisa COD via J&T. Pengiriman dari Bandung. Batas transfer jam 3 sore untuk dikirim di hari yang sama."
                  value={formData.shippingPolicy}
                  onChange={handleChange}
                  style={{ width: '100%', resize: 'vertical' }}
                />
              </div>
            </div>

            <div className="card">
              <div className="card-header">
                <span className="card-title">4. Frequently Asked Questions (FAQ)</span>
              </div>
              <div style={{ padding: '0' }}>
                <p style={{ fontSize: '12px', color: 'var(--color-text-muted)', marginBottom: '8px' }}>Daftar pertanyaan umum dan jawabannya. Pisahkan dengan garis baru untuk setiap Q&A.</p>
                <textarea 
                  name="faq"
                  className="input" 
                  rows="6" 
                  placeholder="Q: Apakah barang ready?\nA: Semua yang bisa di-klik di katalog berarti ready kak.\nQ: Bisa retur?\nA: Bisa retur jika cacat produksi maksimal 2 hari setelah barang diterima dengan video unboxing."
                  value={formData.faq}
                  onChange={handleChange}
                  style={{ width: '100%', resize: 'vertical' }}
                />
              </div>
            </div>
            
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--color-success)', fontSize: '13px', justifyContent: 'flex-end', marginTop: '10px' }}>
              <CheckCircle2 size={16} /> <span>Data tersimpan otomatis tersinkronisasi dengan Node AI Closer.</span>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
