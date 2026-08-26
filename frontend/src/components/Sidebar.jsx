import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  LayoutDashboard,
  Zap,
  Smartphone,
  Layers,
  History,
  ShieldAlert,
  LogOut,
  Radio,
  X
} from 'lucide-react';

export default function Sidebar({ isOpen, onClose }) {
  const { user, isAdmin, logout } = useAuth();

  const userNavItems = [
    { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/activate', label: 'Activate eSIM', icon: Zap, badge: 'New' },
    { to: '/devices', label: 'My Devices & EIDs', icon: Smartphone },
    { to: '/plans', label: 'Telecom Plans', icon: Layers },
    { to: '/activations', label: 'Activation History', icon: History }
  ];

  const adminNavItems = [
    { to: '/admin', label: 'Admin Command Center', icon: ShieldAlert, adminOnly: true }
  ];

  return (
    <aside className={`sidebar ${isOpen ? 'open' : ''}`}>
      <div className="sidebar-header">
        <div className="brand-logo">
          <div className="brand-icon-wrapper">
            <Radio size={20} />
          </div>
          <div>
            <div style={{ lineHeight: 1.1 }}>eSIM Pulse</div>
            <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)', fontWeight: 500 }}>
              Telecom Platform
            </span>
          </div>
        </div>
        <button
          className="menu-toggle-btn"
          style={{ display: isOpen ? 'flex' : 'none' }}
          onClick={onClose}
        >
          <X size={18} />
        </button>
      </div>

      <nav className="sidebar-nav">
        <div className="nav-section-label">Subscriber Portal</div>
        {userNavItems.map(item => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.to}
              to={item.to}
              onClick={onClose}
              className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
            >
              <Icon size={18} />
              <span>{item.label}</span>
              {item.badge && (
                <span
                  style={{
                    marginLeft: 'auto',
                    fontSize: '0.65rem',
                    background: 'var(--accent-primary)',
                    color: '#fff',
                    padding: '0.1rem 0.45rem',
                    borderRadius: '999px',
                    fontWeight: 700
                  }}
                >
                  {item.badge}
                </span>
              )}
            </NavLink>
          );
        })}

        {isAdmin && (
          <>
            <div className="nav-section-label" style={{ marginTop: '1rem', color: '#f59e0b' }}>
              Carrier Operator Admin
            </div>
            {adminNavItems.map(item => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  onClick={onClose}
                  className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
                  style={{ color: '#fcd34d' }}
                >
                  <Icon size={18} color="#f59e0b" />
                  <span>{item.label}</span>
                  <span
                    style={{
                      marginLeft: 'auto',
                      fontSize: '0.65rem',
                      background: 'rgba(245, 158, 11, 0.2)',
                      color: '#f59e0b',
                      border: '1px solid rgba(245, 158, 11, 0.4)',
                      padding: '0.1rem 0.4rem',
                      borderRadius: '999px',
                      fontWeight: 700
                    }}
                  >
                    ADMIN
                  </span>
                </NavLink>
              );
            })}
          </>
        )}
      </nav>

      {user && (
        <div className="sidebar-footer">
          <div className="user-mini-card">
            <div className="user-avatar">
              {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div
                style={{
                  fontSize: '0.85rem',
                  fontWeight: 600,
                  color: 'var(--text-primary)',
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis'
                }}
              >
                {user.name}
              </div>
              <div
                style={{
                  fontSize: '0.72rem',
                  color: 'var(--text-muted)',
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis'
                }}
              >
                {user.email}
              </div>
            </div>
            <button
              onClick={() => logout()}
              title="Sign Out"
              style={{
                color: 'var(--text-muted)',
                padding: '0.35rem',
                borderRadius: 'var(--radius-sm)',
                transition: 'color var(--transition-fast)'
              }}
              onMouseEnter={(e) => (e.currentTarget.style.color = '#ef4444')}
              onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--text-muted)')}
            >
              <LogOut size={16} />
            </button>
          </div>
        </div>
      )}
    </aside>
  );
}
