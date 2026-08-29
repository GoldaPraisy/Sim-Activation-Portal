import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Menu, Zap, Shield, LogIn, ArrowRight } from 'lucide-react';

export default function Navbar({ onMenuToggle }) {
  const { user, isAuthenticated, isAdmin, logout } = useAuth();

  return (
    <header className="topbar">
      <div className="topbar-left">
        <button className="menu-toggle-btn" onClick={onMenuToggle} title="Toggle Navigation">
          <Menu size={20} />
        </button>

        <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', textDecoration: 'none' }}>
          <img
            src="/logo.png"
            alt="SIM Activation Portal Logo"
            style={{ height: 28, width: 'auto', objectFit: 'contain' }}
          />
          <span style={{ fontWeight: 800, fontSize: '0.95rem', color: 'var(--text-primary)' }}>
            SIM Activation Portal
          </span>
        </Link>
      </div>

      <div className="topbar-right">
        {isAuthenticated ? (
          <>
            <Link to="/activate" className="btn btn-primary btn-sm">
              <Zap size={15} />
              <span>Activate eSIM</span>
            </Link>

            {isAdmin && (
              <Link to="/admin" className="badge badge-warning" style={{ textDecoration: 'none', padding: '0.4rem 0.75rem' }}>
                <Shield size={13} />
                <span>Admin View</span>
              </Link>
            )}

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
              <div
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: '50%',
                  background: 'linear-gradient(135deg, #6366f1, #06b6d4)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 700,
                  fontSize: '0.8rem',
                  color: '#fff'
                }}
              >
                {user?.name?.charAt(0) || 'U'}
              </div>
              <button
                onClick={() => logout()}
                className="btn btn-secondary btn-sm"
                style={{ fontSize: '0.8rem', padding: '0.35rem 0.75rem' }}
              >
                Sign Out
              </button>
            </div>
          </>
        ) : (
          <div style={{ display: 'flex', gap: '0.75rem' }}>
            <Link to="/login" className="btn btn-secondary btn-sm">
              <LogIn size={15} />
              <span>Sign In</span>
            </Link>
            <Link to="/register" className="btn btn-primary btn-sm">
              <span>Register</span>
              <ArrowRight size={14} />
            </Link>
          </div>
        )}
      </div>
    </header>
  );
}
