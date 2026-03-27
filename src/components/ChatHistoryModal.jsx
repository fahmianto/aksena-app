import { useState, useEffect, useRef } from 'react';
import { X, Bot, User, MessageSquare, Mail } from 'lucide-react';
import { subscribeToContactHistory } from '../services/leadService';

export default function ChatHistoryModal({ lead, onClose }) {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const bottomRef = useRef(null);

  useEffect(() => {
    if (!lead) return;
    const unsub = subscribeToContactHistory(lead.id, (data) => {
      setHistory(data);
      setLoading(false);
      setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);
    });
    return () => unsub();
  }, [lead]);

  if (!lead) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-content" style={{ maxWidth: '500px', width: '100%', height: '80vh', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        <div className="modal-header" style={{ padding: '16px', borderBottom: '1px solid var(--color-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h3 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
              <MessageSquare size={18} className="text-accent" />
              The Harvester Log
            </h3>
            <div style={{ fontSize: '12px', color: 'var(--color-text-muted)', marginTop: '4px' }}>
              Histori Percakapan dengan {lead.name} ({lead.businessName})
            </div>
          </div>
          <button className="btn-ghost" onClick={onClose}><X size={20} /></button>
        </div>

        <div className="modal-body" style={{ flex: 1, overflowY: 'auto', padding: '16px', display: 'flex', flexDirection: 'column', gap: '16px', background: 'rgba(0,0,0,0.2)' }}>
          {loading ? (
            <div className="text-center text-muted" style={{ marginTop: '40px' }}>Memuat histori percakapan...</div>
          ) : history.length === 0 ? (
            <div className="text-center p-8 empty-state">
              <Bot size={48} className="text-muted" style={{ margin: '0 auto 16px', opacity: 0.2 }} />
              <div>Belum ada histori obrolan WA.</div>
              <div style={{ fontSize: '12px', marginTop: '4px' }}>Kirim Nurture atau tunggu balasan leads.</div>
            </div>
          ) : (
            history.map((chat) => {
              const isSystem = chat.type !== 'WA_INBOUND';
              const isEmail = chat.type === 'EMAIL_NURTURE' || chat.type === 'EMAIL_BROADCAST';
              const isAI = !isEmail && isSystem;

              return (
                <div key={chat.id} style={{ 
                  display: 'flex', 
                  flexDirection: 'column',
                  alignItems: isSystem ? 'flex-start' : 'flex-end',
                  maxWidth: '85%',
                  alignSelf: isSystem ? 'flex-start' : 'flex-end'
                }}>
                  <div style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: '6px', 
                    marginBottom: '4px',
                    fontSize: '11px',
                    color: 'var(--color-text-muted)'
                  }}>
                    {isSystem ? (
                      isEmail ? <Mail size={12} className="text-info" /> : <Bot size={12} className="text-accent" />
                    ) : <User size={12} className="text-success" />}
                    {isSystem ? (isEmail ? 'Aksena Mailer' : 'Aksena System') : lead.name}
                  </div>
                  <div style={{
                    background: isSystem ? (isEmail ? 'rgba(56, 189, 248, 0.1)' : 'rgba(0, 212, 255, 0.1)') : 'rgba(16, 185, 129, 0.1)',
                    border: `1px solid ${isSystem ? (isEmail ? 'rgba(56, 189, 248, 0.2)' : 'rgba(0, 212, 255, 0.2)') : 'rgba(16, 185, 129, 0.2)'}`,
                    padding: '12px',
                    borderRadius: '12px',
                    borderTopLeftRadius: isSystem ? '4px' : '12px',
                    borderTopRightRadius: isSystem ? '12px' : '4px',
                    color: 'var(--color-text)',
                    fontSize: '14px',
                    lineHeight: '1.5'
                  }}>
                    {isEmail && chat.subject && (
                      <div style={{ fontWeight: 600, borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '6px', marginBottom: '8px' }}>
                        Subject: {chat.subject}
                      </div>
                    )}
                    <div dangerouslySetInnerHTML={{ __html: chat.message?.replace(/\n/g, '<br/>') || '' }} />
                  </div>
                  <div style={{ fontSize: '10px', color: 'var(--color-text-muted)', marginTop: '4px' }}>
                    {chat.timestamp?.toDate ? chat.timestamp.toDate().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit'}) : 'Baru saja'}
                  </div>
                </div>
              );
            })
          )}
          <div ref={bottomRef} />
        </div>
        
        <div style={{ padding: '12px 16px', borderTop: '1px solid var(--color-border)', background: 'rgba(0,0,0,0.5)', fontSize: '12px', color: 'var(--color-text-muted)', textAlign: 'center' }}>
          🤖 The Closer AI otomatis merespon pesan balasan.
        </div>
      </div>
    </div>
  );
}
