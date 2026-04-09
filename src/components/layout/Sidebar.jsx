import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard, MessageSquare, Bot, Package, Truck,
  CreditCard, BarChart3, Settings, Zap, Brain, LifeBuoy, Users, Megaphone
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import '../../styles/sidebar.css';

const navItems = [
  { path: '/dashboard', icon: LayoutDashboard, label: 'Dashboard', sub: 'Overview', allowedRoles: ['super_admin', 'owner', 'manager'] },
  { path: '/harvester', icon: MessageSquare, label: 'The Harvester', sub: 'Omnichannel', allowedRoles: ['super_admin', 'owner', 'manager', 'staff'] },
  { path: '/closer',    icon: Bot,            label: 'The Closer',   sub: 'AI Sales', allowedRoles: ['super_admin', 'owner', 'manager', 'staff'] },
  { path: '/brain',     icon: Brain,          label: 'The Brain',    sub: 'Knowledge Base', allowedRoles: ['super_admin', 'owner'] },
  { path: '/manager',   icon: Package,        label: 'The Manager',  sub: 'Inventory', allowedRoles: ['super_admin', 'owner', 'manager'] },
  { path: '/tracking',  icon: Truck,          label: 'The Tracker',  sub: 'Order Status', allowedRoles: ['super_admin', 'owner', 'manager', 'staff'] },
  { path: '/collector', icon: CreditCard,     label: 'The Collector',sub: 'Payments', allowedRoles: ['super_admin', 'owner', 'manager'] },
  { path: '/compass',   icon: BarChart3,      label: 'Market Compass', sub: 'Big Data 🔒', allowedRoles: ['super_admin', 'owner'] },
  { path: '/asl',       icon: LifeBuoy,       label: 'Rescue My Money',sub: 'Smart Liquidation', allowedRoles: ['super_admin', 'owner', 'manager'] },
  { path: '/leads',     icon: Users,          label: 'Lead Pipeline',  sub: 'Internal CRM', allowedRoles: ['super_admin'] },
  { path: '/drip-settings', icon: MessageSquare, label: 'Drip Sequences', sub: 'Auto WA', allowedRoles: ['super_admin'] },
  { path: '/campaigns',     icon: Megaphone,      label: 'Promo Broadcast',sub: 'Blast WA', allowedRoles: ['super_admin', 'owner', 'manager'] },
  { path: '/billing',       icon: CreditCard,     label: 'Billing',      sub: 'Subscription', allowedRoles: ['super_admin', 'owner'] },
];

export default function Sidebar() {
  const { currentUser, userProfile } = useAuth();
  const displayName = userProfile?.name || currentUser?.email?.split('@')[0] || 'User';
  const initial = displayName.charAt(0).toUpperCase();

  return (
    <aside className="sidebar">
      {/* Logo */}
      <div className="sidebar-logo">
        <div className="sidebar-logo-icon"><Zap size={18} /></div>
        <div>
          <div className="sidebar-logo-name">AKSENA</div>
          <div className="sidebar-logo-version">v2.0 Intelligence</div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="sidebar-nav">
        <div className="sidebar-section-label">Core Modules</div>
        {navItems.map(({ path, icon: Icon, label, sub, allowedRoles }) => {
          const userRole = userProfile?.role || 'owner';
          if (!allowedRoles.includes(userRole)) return null;
          return (
            <NavLink
              key={path}
              to={path}
              className={({ isActive }) => `sidebar-item ${isActive ? 'active' : ''}`}
            >
              <div className="sidebar-item-icon"><Icon size={16} /></div>
              <div className="sidebar-item-text">
                <span className="sidebar-item-label">{label}</span>
                <span className="sidebar-item-sub">{sub}</span>
              </div>
            </NavLink>
          );
        })}
      </nav>

      <div className="sidebar-footer">
        {['super_admin', 'owner'].includes(userProfile?.role || 'owner') && (
          <NavLink to="/settings" className={({ isActive }) => `sidebar-item ${isActive ? 'active' : ''}`}>
            <div className="sidebar-item-icon"><Settings size={16} /></div>
            <div className="sidebar-item-text">
              <span className="sidebar-item-label">Settings</span>
            </div>
          </NavLink>
        )}
        <div className="sidebar-user">
          <div className="sidebar-user-avatar">{initial}</div>
          <div className="sidebar-user-info">
            <div className="sidebar-user-name">{displayName}</div>
            <div className="sidebar-user-role">{userProfile?.role || 'owner'}</div>
          </div>
          <span className="live-dot" title="Connected"></span>
        </div>

        {userProfile && (
          <div style={{
            margin: '12px 16px 0',
            padding: '12px',
            background: 'rgba(0, 212, 255, 0.05)',
            border: '1px solid rgba(0, 212, 255, 0.1)',
            borderRadius: '12px',
            display: 'flex',
            flexDirection: 'column',
            gap: '4px'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '10px', color: 'var(--color-text-muted)', fontWeight: '600', letterSpacing: '0.05em' }}>
                AKSENA TOKENS
              </span>
              <NavLink to="/billing" style={{ 
                fontSize: '10px', textDecoration: 'none', color: 'var(--color-accent)', 
                fontWeight: '700', borderBottom: '1px solid currentColor' 
              }}>
                MANAGE
              </NavLink>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Zap size={14} style={{ color: 'var(--color-accent)', fill: 'var(--color-accent)' }} />
              <span style={{ fontSize: '16px', fontWeight: '800', color: 'var(--color-text-primary)' }}>
                {userProfile.tokenBalance?.toLocaleString() || 0}
              </span>
            </div>
          </div>
        )}
      </div>
    </aside>
  );
}
