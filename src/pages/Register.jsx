import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Zap, Mail, Lock, User, Building, ArrowRight, AlertCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import { registerWithEmail } from '../services/authService';
import './Auth.css';

export default function Register() {
  const [name, setName]         = useState('');
  const [business, setBusiness] = useState('');
  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState('');
  const navigate = useNavigate();

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    if (password.length < 6) {
      setError('Password minimal 6 karakter.');
      return;
    }
    setLoading(true);
    try {
      await registerWithEmail(email, password, { name, business });
      toast.success('Akun berhasil dibuat! Selamat datang 🎉');
      navigate('/dashboard', { replace: true });
    } catch (err) {
      const msg = err.code === 'auth/email-already-in-use'
        ? 'Email sudah terdaftar. Silakan login.'
        : err.code === 'auth/weak-password'
        ? 'Password terlalu lemah. Minimal 6 karakter.'
        : 'Pendaftaran gagal. Coba lagi.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="auth-page">
      <div className="auth-orb auth-orb-1" />
      <div className="auth-orb auth-orb-2" />

      <div className="auth-card fade-in-up">
        <div className="auth-logo">
          <div className="auth-logo-icon"><Zap size={20} /></div>
          <div>
            <div className="auth-logo-name">AKSENA.ID</div>
            <div className="auth-logo-sub">Intelligence Platform</div>
          </div>
        </div>

        <div className="auth-header">
          <h1>Buat Akun Baru</h1>
          <p>Mulai transformasi bisnis Anda dengan Aksena.id</p>
        </div>

        {error && (
          <div style={{ display:'flex', alignItems:'center', gap:'8px', padding:'10px 14px', background:'rgba(239,68,68,0.1)', border:'1px solid rgba(239,68,68,0.3)', borderRadius:'var(--radius-md)', marginBottom:'16px' }}>
            <AlertCircle size={14} style={{ color:'var(--color-danger)', flexShrink:0 }} />
            <span style={{ fontSize:'13px', color:'var(--color-danger)' }}>{error}</span>
          </div>
        )}

        <form className="auth-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Nama Lengkap</label>
            <div className="form-input-wrapper">
              <User size={15} />
              <input className="form-input form-input-icon" type="text" placeholder="Budi Santoso"
                value={name} onChange={e => setName(e.target.value)} required />
            </div>
          </div>
          <div className="form-group">
            <label className="form-label">Nama Bisnis</label>
            <div className="form-input-wrapper">
              <Building size={15} />
              <input className="form-input form-input-icon" type="text" placeholder="Toko Maju Jaya"
                value={business} onChange={e => setBusiness(e.target.value)} required />
            </div>
          </div>
          <div className="form-group">
            <label className="form-label">Email</label>
            <div className="form-input-wrapper">
              <Mail size={15} />
              <input className="form-input form-input-icon" type="email" placeholder="budi@tokomajujaya.com"
                value={email} onChange={e => setEmail(e.target.value)} required />
            </div>
          </div>
          <div className="form-group">
            <label className="form-label">Password</label>
            <div className="form-input-wrapper">
              <Lock size={15} />
              <input className="form-input form-input-icon" type="password" placeholder="Min. 6 karakter"
                value={password} onChange={e => setPassword(e.target.value)} required />
            </div>
          </div>

          <button type="submit" className="btn btn-primary w-full" style={{ justifyContent:'center' }} disabled={loading}>
            {loading ? 'Mendaftar...' : <><span>Daftar Sekarang</span><ArrowRight size={16} /></>}
          </button>
        </form>

        <p className="auth-footer-text">
          Sudah punya akun? <Link to="/login">Masuk di sini</Link>
        </p>
      </div>
    </div>
  );
}
