import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { logout } from '../services/authService';
import { updateUserProfile } from '../services/userService';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import {
  User, Building, Mail, Shield, CreditCard,
  LogOut, Save, Zap, AlertTriangle, Users, UserPlus, Trash2
} from 'lucide-react';

const planBadge = {
  basic:      { label: 'Basic',      cls: 'badge-info' },
  standard:   { label: 'Standard',   cls: 'badge-accent' },
  growth:     { label: 'Growth',     cls: 'badge-success' },
  enterprise: { label: 'Enterprise', cls: 'badge-purple' },
};

export default function Settings() {
  const { currentUser, userProfile } = useAuth();
  const navigate = useNavigate();

  const [name, setName]         = useState(userProfile?.name || '');
  const [business, setBusiness] = useState(userProfile?.business || '');
  const [saving, setSaving]     = useState(false);

  // Team Management State
  const [team, setTeam] = useState([]);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState('staff');
  const [inviting, setInviting] = useState(false);

  const plan = planBadge[userProfile?.plan || 'basic'];

  async function handleSave(e) {
    e.preventDefault();
    setSaving(true);
    try {
      await updateUserProfile(currentUser.uid, { name, business });
      toast.success('Profil berhasil disimpan!');
    } catch {
      toast.error('Gagal menyimpan. Coba lagi.');
    } finally {
      setSaving(false);
    }
  }

  // Effect to load team members
  useEffect(() => {
    if (userProfile?.role === 'owner' && currentUser?.uid) {
      import('../services/userService').then(s => {
        s.getTeamMembers(currentUser.uid).then(setTeam);
      });
    }
  }, [userProfile, currentUser?.uid]);

  const handleInvite = async (e) => {
    e.preventDefault();
    if (!inviteEmail) return;
    setInviting(true);
    try {
      const s = await import('../services/userService');
      const newMember = await s.inviteTeamMember(currentUser.uid, {
        email: inviteEmail,
        role: inviteRole,
        name: 'Pending Invite'
      });
      setTeam(prev => [...prev, newMember]);
      setInviteEmail('');
      toast.success(`Undangan tim berhasil dikirim ke ${inviteEmail}`);
    } catch {
      toast.error('Gagal mengirim undangan.');
    } finally {
      setInviting(false);
    }
  };

  async function handleLogout() {
    await logout();
    toast.success('Berhasil logout.');
    navigate('/login');
  }

  return (
    <div className="fade-in-up" style={{ maxWidth: 720, margin: '0 auto' }}>
      <div className="page-header">
        <h1>Settings</h1>
        <p>Kelola profil dan akun Aksena Anda</p>
      </div>

      {/* Plan badge */}
      <div className="card" style={{ marginBottom:'20px', display:'flex', alignItems:'center', gap:'16px' }}>
        <div style={{ width:48, height:48, borderRadius:'var(--radius-md)', background:'linear-gradient(135deg, var(--color-accent), var(--color-accent-2))', display:'flex', alignItems:'center', justifyContent:'center', color:'#000' }}>
          <Zap size={22} />
        </div>
        <div style={{ flex:1 }}>
          <div style={{ fontSize:'var(--font-md)', fontWeight:700 }}>
            {userProfile?.business || 'Bisnis Anda'}
          </div>
          <div style={{ fontSize:'var(--font-sm)', color:'var(--color-text-secondary)' }}>
            {currentUser?.email}
          </div>
        </div>
        <span className={`badge ${plan.cls}`} style={{ fontSize:'13px', padding:'6px 12px' }}>
          <CreditCard size={12} /> Plan {plan.label}
        </span>
      </div>

      {/* Profile form */}
      <div className="card" style={{ marginBottom:'20px' }}>
        <div className="card-header">
          <span className="card-title"><User size={16} style={{ display:'inline', marginRight:6 }} />Profil Akun</span>
        </div>
        <form onSubmit={handleSave} style={{ display:'flex', flexDirection:'column', gap:'16px' }}>
          <div className="form-group">
            <label className="form-label">Nama Lengkap</label>
            <div style={{ position:'relative', display:'flex', alignItems:'center' }}>
              <User size={14} style={{ position:'absolute', left:12, color:'var(--color-text-muted)', pointerEvents:'none' }} />
              <input className="form-input" style={{ paddingLeft:36 }} value={name} onChange={e=>setName(e.target.value)} placeholder="Nama Lengkap" />
            </div>
          </div>
          <div className="form-group">
            <label className="form-label">Nama Bisnis</label>
            <div style={{ position:'relative', display:'flex', alignItems:'center' }}>
              <Building size={14} style={{ position:'absolute', left:12, color:'var(--color-text-muted)', pointerEvents:'none' }} />
              <input className="form-input" style={{ paddingLeft:36 }} value={business} onChange={e=>setBusiness(e.target.value)} placeholder="Nama Bisnis" />
            </div>
          </div>
          <div className="form-group">
            <label className="form-label">Email</label>
            <div style={{ position:'relative', display:'flex', alignItems:'center' }}>
              <Mail size={14} style={{ position:'absolute', left:12, color:'var(--color-text-muted)', pointerEvents:'none' }} />
              <input className="form-input" style={{ paddingLeft:36, opacity:0.6 }} value={currentUser?.email || ''} disabled />
            </div>
            <p style={{ fontSize:'var(--font-xs)', color:'var(--color-text-muted)', marginTop:4 }}>Email tidak dapat diubah.</p>
          </div>
          <div className="form-group">
            <label className="form-label">Role</label>
            <div style={{ display:'flex', alignItems:'center', gap:8 }}>
              <Shield size={14} style={{ color:'var(--color-accent)' }} />
              <span className="badge badge-accent">{userProfile?.role || 'owner'}</span>
            </div>
          </div>
          <div style={{ display:'flex', justifyContent:'flex-end' }}>
            <button type="submit" className="btn btn-primary" disabled={saving}>
              <Save size={15} /> {saving ? 'Menyimpan...' : 'Simpan Perubahan'}
            </button>
          </div>
        </form>
      </div>

      {/* Team Management - Only visible for pure Owner/Super Admin */}
      {['owner', 'super_admin'].includes(userProfile?.role) && (
        <div className="card" style={{ marginBottom:'20px' }}>
          <div className="card-header">
            <span className="card-title"><Users size={16} style={{ display:'inline', marginRight:6 }} />Manajemen Tim (RBAC)</span>
          </div>
          <div style={{ padding:'0' }}>
            <p style={{ fontSize:'13px', color:'var(--color-text-secondary)', marginBottom:'16px' }}>Kelola akses operasional untuk tim Anda.</p>
            
            {/* Form Invite */}
            <form onSubmit={handleInvite} style={{ display:'flex', gap:'12px', marginBottom:'20px', alignItems:'flex-end' }}>
              <div style={{ flex:2 }}>
                <label className="form-label" style={{ fontSize:'12px' }}>Email Anggota</label>
                <input className="form-input" type="email" value={inviteEmail} onChange={e=>setInviteEmail(e.target.value)} placeholder="Email Staf / Manajer" required />
              </div>
              <div style={{ flex:1 }}>
                <label className="form-label" style={{ fontSize:'12px' }}>Role</label>
                <select className="form-input" value={inviteRole} onChange={e=>setInviteRole(e.target.value)}>
                  <option value="manager">Manager (Operasional)</option>
                  <option value="staff">Staff (CS/Sales)</option>
                </select>
              </div>
              <button className="btn btn-primary" type="submit" disabled={inviting}>
                {inviting ? 'Mengirim...' : <><UserPlus size={15} /> Invite</>}
              </button>
            </form>

            {/* List Team */}
            <div style={{ border:'1px solid var(--color-border)', borderRadius:'var(--radius-md)', overflow:'hidden' }}>
              <div style={{ background:'var(--color-bg-surface)', padding:'10px 16px', display:'flex', fontSize:'12px', fontWeight:600, color:'var(--color-text-muted)', borderBottom:'1px solid var(--color-border)' }}>
                <div style={{ flex:2 }}>Anggota</div>
                <div style={{ width:100 }}>Role Akses</div>
                <div style={{ width:50, textAlign:'center' }}>Aksi</div>
              </div>
              {team.length === 0 ? (
                <div style={{ padding:'20px', textAlign:'center', fontSize:'13px', color:'var(--color-text-muted)' }}>Belum ada anggota tim.</div>
              ) : team.map(member => (
                <div key={member.id} style={{ padding:'12px 16px', display:'flex', alignItems:'center', borderBottom:'1px solid var(--color-border)' }}>
                  <div style={{ flex:2 }}>
                    <div style={{ fontSize:'13px', fontWeight:500 }}>{member.name}</div>
                    <div style={{ fontSize:'12px', color:'var(--color-text-muted)' }}>{member.email}</div>
                  </div>
                  <div style={{ width:100 }}>
                    <span className={`badge ${member.role==='manager'?'badge-info':'badge-default'}`} style={{ textTransform:'capitalize' }}>
                      {member.role}
                    </span>
                  </div>
                  <div style={{ width:50, textAlign:'center' }}>
                    <button className="btn" style={{ padding:4, color:'var(--color-danger)', background:'transparent' }} title="Hapus Akses">
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
            <div style={{ marginTop:12, fontSize:'11px', color:'var(--color-warning)' }}>
              <i>* Anggota staf tidak dapat mengakses menu Pengaturan ini maupun The Brain.</i>
            </div>
          </div>
        </div>
      )}

      {/* Danger zone */}
      <div className="card" style={{ borderColor:'rgba(239,68,68,0.3)' }}>
        <div className="card-header">
          <span className="card-title" style={{ color:'var(--color-danger)' }}>
            <AlertTriangle size={16} style={{ display:'inline', marginRight:6 }} />Danger Zone
          </span>
        </div>
        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between' }}>
          <div>
            <div style={{ fontSize:'var(--font-sm)', fontWeight:600, marginBottom:2 }}>Keluar dari Akun</div>
            <div style={{ fontSize:'var(--font-xs)', color:'var(--color-text-muted)' }}>Anda harus login kembali setelah logout.</div>
          </div>
          <button className="btn btn-danger" onClick={handleLogout}>
            <LogOut size={15} /> Logout
          </button>
        </div>
      </div>
    </div>
  );
}
