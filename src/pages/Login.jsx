import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Zap, Mail, Lock, ArrowRight, AlertCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import { loginWithEmail } from '../services/authService';
import './Auth.css';

export default function Login() {
  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState('');
  const navigate  = useNavigate();
  const location  = useLocation();
  const from      = location.state?.from?.pathname || '/dashboard';

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await loginWithEmail(email, password);
      toast.success('Selamat datang kembali! 👋');
      navigate(from, { replace: true });
    } catch (err) {
      const msg = err.code === 'auth/invalid-credential'
        ? 'Email atau password salah.'
        : err.code === 'auth/too-many-requests'
        ? 'Terlalu banyak percobaan. Coba lagi nanti.'
        : 'Login gagal. Coba lagi.';
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
            <div className="auth-logo-name">AKSENA</div>
            <div className="auth-logo-sub">Intelligence Platform</div>
          </div>
        </div>

        <div className="auth-header">
          <h1>Selamat Datang</h1>
          <p>Masuk ke dashboard Aksena.id v2.0</p>
        </div>

        {error && (
          <div style={{ display:'flex', alignItems:'center', gap:'8px', padding:'10px 14px', background:'rgba(239,68,68,0.1)', border:'1px solid rgba(239,68,68,0.3)', borderRadius:'var(--radius-md)', marginBottom:'16px' }}>
            <AlertCircle size={14} style={{ color:'var(--color-danger)', flexShrink:0 }} />
            <span style={{ fontSize:'13px', color:'var(--color-danger)' }}>{error}</span>
          </div>
        )}

        <form className="auth-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Email</label>
            <div className="form-input-wrapper">
              <Mail size={15} />
              <input
                className="form-input form-input-icon"
                type="email"
                placeholder="admin@aksena.id"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
              />
            </div>
          </div>
          <div className="form-group">
            <label className="form-label">Password</label>
            <div className="form-input-wrapper">
              <Lock size={15} />
              <input
                className="form-input form-input-icon"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
              />
            </div>
          </div>

          <button
            type="submit"
            className="btn btn-primary w-full"
            style={{ justifyContent: 'center' }}
            disabled={loading}
          >
            {loading ? 'Masuk...' : <><span>Masuk</span><ArrowRight size={16} /></>}
          </button>
        </form>

        <p className="auth-footer-text">
          Belum punya akun? <Link to="/register">Daftar sekarang</Link>
        </p>
      </div>
    </div>
  );
}
