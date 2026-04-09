import { useState, useEffect } from 'react';
import { Bot, ShoppingCart, CheckCircle, XCircle, MessageSquare } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { messageService } from '../services/messageService';
import { subscribeToInventory } from '../services/inventoryService';
import { subscribeTransactions } from '../services/transactionService';

const scripts = [
  { type: 'Double Binding', text: 'Kakak mau yang warna hitam atau navy? Keduanya lagi bestseller minggu ini 😊' },
  { type: 'Objection: Mahal', text: 'Iya Kak, memang sedikit lebih mahal dari pasaran karena bahan premium. Tapi biasanya yang pake bilang awet sampai 2 tahun Kak. Hemat jangka panjangnya.' },
  { type: 'Objection: Pikir Dulu', text: 'Boleh Kak, sambil pikir-pikir kasih tau aja ya, soalnya stok size M tinggal 5 pcs. Nggak mau kehabisan kan? 😊' },
  { type: 'Close', text: 'Kalau Kakak jadi ambil sekarang, saya langsung buatkan invoice dan link bayarnya ya. Bisa transfer BCA, Mandiri, atau GoPay Kak!' },
];

const statusColor = { new: 'var(--color-info)', negotiating: 'var(--color-warning)', closing: 'var(--color-success)', won: 'var(--color-success)', lost: 'var(--color-danger)' };
const statusLabel = { new: 'Baru', negotiating: 'Negosiasi', closing: 'Closing', won: 'Berhasil', lost: 'Batal' };

export default function Closer() {
  const { currentUser: user } = useAuth();
  const [activeScript, setActiveScript] = useState(scripts[0]);
  const [activeConvos, setActiveConvos] = useState([]);
  const [loading, setLoading] = useState(true);

  const [inventory, setInventory] = useState([]);
  const [stats, setStats] = useState({ closing: 0, failed: 0, rate: '0%' });

  useEffect(() => {
    if (!user) return;
    
    // 1. Subscribe to Active Conversations
    const unsubConvos = messageService.subscribeToConversations(user.uid, (data) => {
      const filtered = data.filter(c => ['new', 'negotiating', 'closing'].includes(c.status || 'new'));
      setActiveConvos(filtered);
      setLoading(false);
    });

    // 2. Subscribe to Live Stock
    const unsubInv = subscribeToInventory(user.uid, (data) => {
      setInventory(data.slice(0, 5));
    });

    // 3. Subscribe to Today's Stats
    const unsubStats = subscribeTransactions(user.uid, (data) => {
      const today = new Date().toDateString();
      const todayTxs = data.filter(t => {
        const d = t.createdAt?.toDate ? t.createdAt.toDate().toDateString() : new Date().toDateString();
        return d === today;
      });
      const won = todayTxs.filter(t => t.status === 'success').length;
      const lost = todayTxs.filter(t => t.status === 'failed').length;
      const rate = todayTxs.length > 0 ? Math.round((won / todayTxs.length) * 100) + '%' : '0%';
      setStats({ closing: won, failed: lost, rate });
    });
    
    return () => {
      unsubConvos();
      unsubInv();
      unsubStats();
    };
  }, [user]);

  const handleSendToChat = async (convId, text) => {
    try {
      if(!convId) {
        alert("Pilih satu percakapan untuk mengirim");
        return;
      }
      await messageService.sendMessage(convId, text, 'ai');
      // Toast success could be added here
      alert("Script AI terkirim ke pelanggan");
    } catch (e) {
      console.error(e);
      alert("Gagal mengirim pesan");
    }
  };

  const getProgress = (status) => {
    if (status === 'closing') return 85;
    if (status === 'negotiating') return 50;
    return 15;
  };

  return (
    <div className="fade-in-up">
      <div className="page-header">
        <h1>The Closer</h1>
        <p>Agentic AI Sales — Double Binding & Objection Handling</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: '20px' }}>
        {/* Main panel */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* Active conversations */}
          <div className="card">
            <div className="card-header">
              <span className="card-title">Percakapan Berlangsung (AI Assisted)</span>
              <span className="badge badge-success"><span className="live-dot" style={{ width:6, height:6, display:'inline-block' }} /> Live</span>
            </div>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {loading ? (
                <div style={{ fontSize: 13, color: 'var(--color-text-muted)', textAlign: 'center', padding: 20 }}>Memuat antrean chat...</div>
              ) : activeConvos.length === 0 ? (
                <div style={{ fontSize: 13, color: 'var(--color-text-muted)', textAlign: 'center', padding: 20 }}>Belum ada obrolan aktif.</div>
              ) : (
                activeConvos.map(conv => {
                  const stat = conv.status || 'new';
                  const prog = getProgress(stat);
                  
                  return (
                    <div key={conv.id} style={{ display:'flex', alignItems:'center', gap:'12px', padding:'12px', background:'var(--color-bg-surface)', borderRadius:'var(--radius-md)', border:'1px solid var(--color-border)' }}>
                      <div style={{ width:36, height:36, borderRadius:'50%', background:'var(--color-bg-card)', display:'flex', alignItems:'center', justifyContent:'center' }}>
                        <MessageSquare size={16} />
                      </div>
                      <div style={{ flex:1 }}>
                        <div style={{ display:'flex', justifyContent:'space-between', marginBottom:4 }}>
                          <span style={{ fontSize:'13px', fontWeight:600 }}>{conv.customerName || 'Anon'}</span>
                          <span className="badge badge-accent" style={{ fontSize:'10px', textTransform:'uppercase' }}>{conv.channel || 'wa'}</span>
                        </div>
                        <div style={{ display:'flex', alignItems:'center', gap:8 }}>
                          <div style={{ flex:1, height:4, background:'var(--color-bg-card)', borderRadius:4, overflow:'hidden' }}>
                            <div style={{ height:'100%', width:`${prog}%`, background: statusColor[stat], borderRadius:4, transition:'width 0.5s' }} />
                          </div>
                          <span style={{ fontSize:'11px', color: statusColor[stat], fontWeight:600 }}>{statusLabel[stat]} {prog}%</span>
                        </div>
                      </div>
                      <button onClick={() => handleSendToChat(conv.id, activeScript.text)} className="btn btn-primary btn-sm">Terapkan Script</button>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Script launcher */}
          <div className="card">
            <div className="card-header">
              <span className="card-title">AI Script Library</span>
              <span className="badge badge-purple"><Bot size={10} /> Powered by Gemini</span>
            </div>
            <div style={{ display:'grid', gridTemplateColumns:'repeat(2, 1fr)', gap:'10px' }}>
              {scripts.map(s => (
                <div key={s.type}
                  onClick={() => setActiveScript(s)}
                  style={{
                    padding:'12px', borderRadius:'var(--radius-md)', cursor:'pointer',
                    background: activeScript.type === s.type ? 'var(--color-bg-hover)' : 'var(--color-bg-surface)',
                    border: `1px solid ${activeScript.type === s.type ? 'var(--color-accent)' : 'var(--color-border)'}`,
                    transition:'all 150ms'
                  }}
                >
                  <div style={{ fontSize:'11px', fontWeight:700, color:'var(--color-accent)', marginBottom:4, textTransform:'uppercase', letterSpacing:'0.05em' }}>{s.type}</div>
                  <div style={{ fontSize:'12px', color:'var(--color-text-secondary)', lineHeight:1.5 }}>{s.text.slice(0,80)}...</div>
                </div>
              ))}
            </div>

            {/* Selected script preview */}
            <div style={{ marginTop:'16px', padding:'14px', background:'var(--color-bg-surface)', borderRadius:'var(--radius-md)', border:'1px solid var(--color-border-strong)' }}>
              <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:8 }}>
                <div style={{ fontSize:'11px', color:'var(--color-text-muted)', textTransform:'uppercase', letterSpacing:'0.05em' }}>Pratinjau: {activeScript.type}</div>
              </div>
              <p style={{ fontSize:'13px', color:'var(--color-text-primary)', lineHeight:1.6 }}>{activeScript.text}</p>
              <div style={{ display:'flex', gap:'8px', marginTop:'12px' }}>
                <button onClick={() => navigator.clipboard.writeText(activeScript.text)} className="btn btn-secondary btn-sm">Salin Manual</button>
                <div style={{ fontSize: 11, color:'var(--color-text-muted)', marginLeft: 'auto', alignSelf:'center' }}>
                  Atau klik "Terapkan Script" di target atas
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right stats */}
        <div style={{ display:'flex', flexDirection:'column', gap:'16px' }}>
          {[
            { label: 'Closing Hari Ini', value: stats.closing, icon: CheckCircle, color: 'var(--color-success)' },
            { label: 'Gagal / Batal', value: stats.failed, icon: XCircle, color: 'var(--color-danger)' },
            { label: 'Conv. Rate (Today)', value: stats.rate, icon: Bot, color: 'var(--color-accent)' },
          ].map(s => (
            <div key={s.label} className="stat-card">
              <div className="stat-icon" style={{ background: `${s.color}20` }}>
                <s.icon size={18} style={{ color: s.color }} />
              </div>
              <div className="stat-label">{s.label}</div>
              <div className="stat-value">{s.value}</div>
            </div>
          ))}

          <div className="card" style={{ padding:'16px' }}>
            <div style={{ fontSize:'12px', fontWeight:600, color:'var(--color-text-muted)', textTransform:'uppercase', letterSpacing:'0.06em', marginBottom:'12px' }}>Status Stok Live</div>
            {inventory.length === 0 ? (
               <div style={{ fontSize: 11, color: 'var(--color-text-muted)', textAlign: 'center', padding: '10px 0' }}>Belum ada data stok.</div>
            ) : inventory.map(item => (
              <div key={item.id} style={{ display:'flex', justifyContent:'space-between', alignItems:'center', padding:'8px 0', borderBottom:'1px solid var(--color-border)' }}>
                <span style={{ fontSize:'12px', color:'var(--color-text-primary)' }}>{item.name}</span>
                <span className={`badge ${item.status === 'ok' ? 'badge-success' : 'badge-warning'}`} style={{ fontSize: 10 }}>{item.stock} pcs</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
