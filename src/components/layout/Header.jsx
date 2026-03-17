import { useLocation } from 'react-router-dom';
import { Bell, Search } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import '../../styles/header.css';

const pageTitles = {
  '/dashboard':  { title: 'Dashboard',       sub: 'Welcome back, Admin' },
  '/harvester':  { title: 'The Harvester',   sub: 'Omnichannel Communication Hub' },
  '/closer':     { title: 'The Closer',      sub: 'Agentic AI Sales Agent' },
  '/manager':    { title: 'The Manager',     sub: 'Retail & Inventory Suite' },
  '/collector':  { title: 'The Collector',   sub: 'Automated Payment & Split Fee' },
  '/compass':    { title: 'Market Compass',  sub: 'Big Data Intelligence — Confidential 🔒' },
};

export default function Header() {
  const { pathname } = useLocation();
  const { currentUser, userProfile } = useAuth();
  const displayName = userProfile?.name || currentUser?.email?.split('@')[0] || 'Admin';
  const initial = displayName.charAt(0).toUpperCase();

  const pageTitlesWithName = {
    '/dashboard':  { title: 'Dashboard',       sub: `Welcome back, ${displayName} 👋` },
    '/harvester':  { title: 'The Harvester',   sub: 'Omnichannel Communication Hub' },
    '/closer':     { title: 'The Closer',      sub: 'Agentic AI Sales Agent' },
    '/manager':    { title: 'The Manager',     sub: 'Retail & Inventory Suite' },
    '/collector':  { title: 'The Collector',   sub: 'Automated Payment & Split Fee' },
    '/compass':    { title: 'Market Compass',  sub: 'Big Data Intelligence — Confidential 🔒' },
    '/settings':   { title: 'Settings',        sub: 'Kelola profil dan akun Anda' },
  };

  const info = pageTitlesWithName[pathname] || { title: 'Aksena', sub: '' };

  return (
    <header className="app-header">
      <div className="header-page-info">
        <h1 className="header-title">{info.title}</h1>
        <p className="header-sub">{info.sub}</p>
      </div>

      <div className="header-actions">
        <div className="header-search">
          <Search size={14} />
          <input className="header-search-input" placeholder="Search..." />
        </div>

        <button className="header-icon-btn" title="Notifications">
          <Bell size={18} />
          <span className="notification-dot" />
        </button>

        <div className="header-avatar" title={displayName}>{initial}</div>
      </div>
    </header>
  );
}
