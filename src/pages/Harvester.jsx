import { useState, useEffect } from 'react';
import { MessageSquare, Instagram, ShoppingBag, Search, Send, Zap } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { messageService } from '../services/messageService';
import EmptyState from '../components/common/EmptyState';

const channels = [
  { id: 'wa',  label: 'WhatsApp',  icon: MessageSquare, cls: 'channel-wa' },
  { id: 'ig',  label: 'Instagram', icon: Instagram,     cls: 'channel-ig' },
  { id: 'sh',  label: 'Shopee',    icon: ShoppingBag,   cls: 'channel-sh' },
];

export default function Harvester() {
  const { currentUser: user } = useAuth();
  const [conversations, setConversations] = useState([]);
  const [active, setActive] = useState(null);
  const [chatHistory, setChatHistory] = useState([]);
  const [filter, setFilter] = useState('all');
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);

  // Initialize and Subscribe
  useEffect(() => {
    if (!user) return;

    setLoading(true);
    const unsubConvs = messageService.subscribeToConversations(user.uid, (data) => {
      setConversations(data);
      if (data.length > 0 && !active) {
        setActive(data[0]);
      }
      setLoading(false);
    });

    return () => {
      if (unsubConvs) unsubConvs();
    };
  }, [user]);

  // Subscribe to messages when active changes
  useEffect(() => {
    if (!active) return;
    
    // Clear previous history immediately while loading new one
    setChatHistory([]);
    
    const unsub = messageService.subscribeToMessages(active.id, (msgs) => {
      setChatHistory(msgs);
    });

    return () => unsub();
  }, [active?.id]);

  const handleSend = async () => {
    if (!newMessage.trim() || !active) return;
    const textToSend = newMessage;
    setNewMessage(''); // optimistic clear
    
    try {
      await messageService.sendMessage(active.id, textToSend, 'agent');
    } catch (err) {
      console.error("Failed to send", err);
      // could set error state here
    }
  };

  const filtered = filter === 'all' ? conversations : conversations.filter(c => c.channel === filter);
  const chanInfo = { wa: channels[0], ig: channels[1], sh: channels[2] };
  
  // Calculate counts
  const counts = { all: conversations.length, wa: 0, ig: 0, sh: 0 };
  conversations.forEach(c => {
    if (counts[c.channel] !== undefined) counts[c.channel]++;
  });

  return (
    <div className="fade-in-up" style={{ height: 'calc(100vh - 128px)', display: 'flex', gap: '20px' }}>
      {/* Left: Inbox List */}
      <div className="card" style={{ width: 320, flexShrink: 0, padding: 0, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        {/* Channel filter */}
        <div style={{ padding: '12px 16px', borderBottom: '1px solid var(--color-border)', display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
          <button
            className={`badge ${filter === 'all' ? 'badge-accent' : ''}`}
            style={{ cursor:'pointer' }}
            onClick={() => setFilter('all')}
          >All ({counts.all})</button>
          
          {channels.map(ch => (
            <button key={ch.id}
              className={`badge ${ch.cls}`}
              style={{ cursor:'pointer', opacity: filter === ch.id ? 1 : 0.5 }}
              onClick={() => setFilter(ch.id)}
            >{ch.label} ({counts[ch.id]})</button>
          ))}
        </div>

        {/* Search */}
        <div style={{ padding: '10px 16px', borderBottom: '1px solid var(--color-border)', display:'flex', alignItems:'center', gap:'8px', color:'var(--color-text-muted)' }}>
          <Search size={14} />
          <input style={{ background:'none', border:'none', outline:'none', flex:1, fontSize:'13px', color:'var(--color-text-primary)' }} placeholder="Cari percakapan..." />
        </div>

        {/* Conversation List */}
        <div style={{ flex:1, overflowY:'auto' }}>
          {loading ? (
            <div style={{ padding: 20, textAlign: 'center', color: 'var(--color-text-muted)', fontSize: 13 }}>
              <Loader size={18} className="spin" style={{ marginBottom: 8 }} />
              <div>Memuat percakapan...</div>
            </div>
          ) : filtered.length === 0 ? (
            <div style={{ padding: '40px 20px' }}>
              <EmptyState 
                icon={MessageSquare} 
                title="Inbox Kosong" 
                description="Belum ada pesan masuk. Hubungkan WhatsApp atau Instagram Anda di menu Pengaturan."
                actionLabel="Buka Pengaturan"
                onAction={() => window.location.hash = '#/settings'}
              />
            </div>
          ) : filtered.map(conv => {
            const ch = chanInfo[conv.channel] || chanInfo.wa;
            
            // Format time properly (fallback to 'Baru' if timestamp is null initially)
            let timeStr = 'Baru';
            if (conv.updatedAt) {
              const date = conv.updatedAt instanceof Date ? conv.updatedAt : new Date();
              timeStr = date.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
            }
            
            return (
              <div key={conv.id}
                onClick={() => setActive(conv)}
                style={{
                  display: 'flex', gap: '10px', padding: '12px 16px', cursor: 'pointer',
                  background: active?.id === conv.id ? 'var(--color-bg-hover)' : 'transparent',
                  borderBottom: '1px solid var(--color-border)', transition: 'background 150ms',
                }}
              >
                <div style={{ width:36, height:36, borderRadius:'50%', background:'var(--color-bg-surface)', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
                  <ch.icon size={16} />
                </div>
                <div style={{ flex:1, minWidth:0 }}>
                  <div style={{ display:'flex', justifyContent:'space-between', marginBottom:2 }}>
                    <span style={{ fontSize:'13px', fontWeight:600 }}>{conv.customerName || conv.name}</span>
                    <span style={{ fontSize:'11px', color:'var(--color-text-muted)' }}>{timeStr}</span>
                  </div>
                  <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}>
                    <span style={{ fontSize:'12px', color:'var(--color-text-secondary)', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap', maxWidth:160 }}>{conv.lastMessage || conv.last}</span>
                    {conv.unread > 0 && (
                      <span style={{ width:18, height:18, background:'var(--color-accent)', color:'#000', borderRadius:'50%', fontSize:'10px', fontWeight:700, display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>{conv.unread}</span>
                    )}
                  </div>
                  <span className={`badge ${ch.cls}`} style={{ marginTop:4, fontSize:'10px' }}>{ch.label}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Right: Chat Window */}
      <div className="card" style={{ flex:1, padding:0, display:'flex', flexDirection:'column', overflow:'hidden' }}>
        {active ? (
          <>
            {/* Chat header */}
            <div style={{ padding:'14px 20px', borderBottom:'1px solid var(--color-border)', display:'flex', alignItems:'center', gap:'12px', background:'var(--color-bg-surface)' }}>
              <div style={{ width:36, height:36, borderRadius:'50%', background:'var(--color-bg-card)', display:'flex', alignItems:'center', justifyContent:'center' }}>
                {(() => { 
                  const Ch = (chanInfo[active.channel] || chanInfo.wa).icon; 
                  return <Ch size={16} />; 
                })()}
              </div>
              <div>
                <div style={{ fontSize:'14px', fontWeight:600 }}>{active?.customerName || active?.name}</div>
                <div style={{ fontSize:'11px', color:'var(--color-text-muted)', display:'flex', alignItems:'center', gap:4 }}>
                  <span className="live-dot" style={{ width:6, height:6 }} /> Online
                </div>
              </div>
              <div style={{ marginLeft:'auto' }}>
                <span className="badge badge-accent">🤖 AI Active</span>
              </div>
            </div>

            {/* Messages */}
            <div style={{ flex:1, overflowY:'auto', padding:'20px', display:'flex', flexDirection:'column', gap:'12px' }}>
              {chatHistory.length === 0 ? (
                 <div style={{ textAlign: 'center', color: 'var(--color-text-muted)', fontSize: 13, marginTop: 40 }}>Belum ada pesan. Mulai percakapan sekarang.</div>
              ) : chatHistory.map((msg, i) => {
                const isMyMessage = msg.sender === 'ai' || msg.sender === 'agent';
                
                let msgTime = '';
                if (msg.timestamp) {
                   const date = msg.timestamp instanceof Date ? msg.timestamp : new Date();
                   msgTime = date.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
                }

                return (
                  <div key={msg.id || i} style={{ display:'flex', justifyContent: isMyMessage ? 'flex-start' : 'flex-end' }}>
                    {isMyMessage && (
                      <div style={{ width:28, height:28, borderRadius:'50%', background:'linear-gradient(135deg, var(--color-accent), var(--color-accent-2))', display:'flex', alignItems:'center', justifyContent:'center', marginRight:8, marginTop:'auto', flexShrink:0 }}>
                        <Zap size={12} color="#000" />
                      </div>
                    )}
                    <div style={{
                      maxWidth:'70%', padding:'10px 14px', lineHeight:1.5,
                      borderRadius: isMyMessage ? '4px 16px 16px 16px' : '16px 4px 16px 16px',
                      background: isMyMessage ? 'var(--color-bg-surface)' : 'rgba(0,212,255,0.12)',
                      border: isMyMessage ? '1px solid var(--color-border)' : '1px solid rgba(0,212,255,0.25)',
                      fontSize: '13px', color: 'var(--color-text-primary)',
                    }}>
                      {msg.text}
                      <div style={{ fontSize:'10px', color:'var(--color-text-muted)', marginTop:4, textAlign: 'right' }}>
                        {msgTime} {msg.sender === 'agent' && '(Agent)'}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Input */}
            <div style={{ padding:'12px 20px', borderTop:'1px solid var(--color-border)', display:'flex', gap:'10px', alignItems:'center', background:'var(--color-bg-surface)' }}>
              <input
                className="form-input"
                placeholder="Ketik balasan manual atau biarkan AI yang handle..."
                style={{ flex:1 }}
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              />
              <button className="btn btn-primary btn-sm" onClick={handleSend} disabled={!newMessage.trim()}>
                <Send size={14} />
              </button>
            </div>
          </>
        ) : (
          <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--color-text-muted)' }}>
            Pilih percakapan untuk mulai merespons
          </div>
        )}
      </div>
    </div>
  );
}

