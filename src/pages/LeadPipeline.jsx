import { useState, useEffect } from 'react';
import { 
  Users, Search, Filter, MoreVertical, 
  MessageSquare, Mail, Phone, Clock,
  ChevronRight, AlertCircle, CheckCircle2
} from 'lucide-react';
import { 
  subscribeToLeads, 
  updateLeadStage, 
  LEAD_STAGES, 
  STAGE_META 
} from '../services/leadService';
import toast from 'react-hot-toast';
import ChatHistoryModal from '../components/ChatHistoryModal';

export default function LeadPipeline() {
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeChatLead, setActiveChatLead] = useState(null);

  useEffect(() => {
    const unsub = subscribeToLeads((data) => {
      setLeads(data);
      setLoading(false);
    });
    return () => unsub();
  }, []);

  const filteredLeads = leads.filter(l => 
    l.businessName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    l.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    l.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const moveLead = async (leadId, newStage) => {
    try {
      await updateLeadStage(leadId, newStage);
      toast.success(`Lead dipindahkan ke stage ${STAGE_META[newStage].label}`);
    } catch (err) {
      toast.error('Gagal memindahkan lead');
    }
  };

  const handleNurture = async (lead) => {
    const toastId = toast.loading(`Mengirim seri edukasi WA ke ${lead.phone || lead.businessName}...`);
    try {
      const res = await fetch('http://localhost:3000/api/leads/nurture', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ leadId: lead.id })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Gagal mengirim nurture WA');
      
      toast.success('Pesan WA berhasil dikirim!', { id: toastId });
    } catch (error) {
      console.error(error);
      toast.error(error.message, { id: toastId });
    }
  };

  if (loading) return <div className="p-8 text-center">Memuat data leads...</div>;

  return (
    <div className="fade-in-up">
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1>Lead Pipeline</h1>
          <p>Kelola calon klien Aksena.id dari minat hingga closing</p>
        </div>
        <div className="flex gap-4">
          <div className="form-input-wrapper" style={{ width: '300px' }}>
            <Search size={16} />
            <input 
              type="text" 
              className="form-input form-input-icon" 
              placeholder="Cari bisnis, nama, email..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
      </div>

      <div className="pipeline-board" style={{ 
        display: 'flex', 
        gap: '16px', 
        overflowX: 'auto', 
        paddingBottom: '20px',
        minHeight: 'calc(100vh - 250px)'
      }}>
        {LEAD_STAGES.map((stage) => {
          const stageLeads = filteredLeads.filter(l => l.stage === stage);
          const meta = STAGE_META[stage];

          return (
            <div key={stage} className="pipeline-column" style={{ 
              minWidth: '280px', 
              flex: 1,
              background: 'rgba(255,255,255,0.02)',
              borderRadius: 'var(--radius-lg)',
              padding: '12px',
              border: '1px solid var(--color-border)'
            }}>
              <div className="column-header" style={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center',
                marginBottom: '16px',
                padding: '0 4px'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: meta.color }} />
                  <span style={{ fontWeight: 600, fontSize: '14px' }}>{meta.label}</span>
                  <span className="badge" style={{ background: 'rgba(255,255,255,0.05)', color: 'var(--color-text-muted)' }}>
                    {stageLeads.length}
                  </span>
                </div>
              </div>

              <div className="column-cards" style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {stageLeads.map((lead) => (
                  <div key={lead.id} className="card" style={{ padding: '12px', cursor: 'grab' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                      <span className="badge" style={{ fontSize: '10px', background: 'rgba(0,212,255,0.1)', color: 'var(--color-accent)' }}>
                        {lead.source}
                      </span>
                      <button className="btn-ghost" style={{ padding: 0 }}><MoreVertical size={14} /></button>
                    </div>
                    
                    <div style={{ fontWeight: 600, fontSize: '14px', marginBottom: '4px' }}>{lead.businessName}</div>
                    <div style={{ fontSize: '12px', color: 'var(--color-text-secondary)', marginBottom: '12px' }}>{lead.name}</div>
                    
                    <div style={{ display: 'flex', gap: '8px', marginBottom: '12px' }}>
                      {lead.phone && (
                        <div 
                           title="Lihat Harvester Log (The Closer AI)" 
                           style={{ color: 'var(--color-success)', cursor: 'pointer' }}
                           onClick={() => setActiveChatLead(lead)}
                        >
                          <MessageSquare size={14} />
                        </div>
                      )}
                      <div title={lead.email} style={{ color: 'var(--color-info)' }}><Mail size={14} /></div>
                    </div>

                    <div className="divider" style={{ margin: '8px 0' }} />

                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '10px', color: 'var(--color-text-muted)' }}>
                        <Clock size={10} />
                        {lead.createdAt?.toDate ? lead.createdAt.toDate().toLocaleDateString('id-ID') : 'Baru'}
                      </div>
                      
                      <div className="flex gap-1">
                        {stage !== 'CONVERTED' && stage !== 'LOST' && (
                          <button 
                            className="btn btn-primary" 
                            style={{ padding: '4px 8px', fontSize: '10px', height: 'auto' }}
                            onClick={() => moveLead(lead.id, LEAD_STAGES[LEAD_STAGES.indexOf(stage) + 1])}
                          >
                            Proses <ChevronRight size={10} />
                          </button>
                        )}
                        {stage === 'NEW' && (
                          <button 
                            className="btn btn-secondary" 
                            style={{ padding: '4px 8px', fontSize: '10px', height: 'auto' }}
                            onClick={() => handleNurture(lead)}
                          >
                            Nurture
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {activeChatLead && (
        <ChatHistoryModal 
          lead={activeChatLead} 
          onClose={() => setActiveChatLead(null)} 
        />
      )}
    </div>
  );
}
