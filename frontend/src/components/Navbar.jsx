import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Menu, Zap, Shield, User, LogIn, ArrowRight } from 'lucide-react';

export default function Navbar({ onMenuToggle }) {
  const { user, isAuthenticated, isAdmin, logout } = useAuth();
  const navigate = useNavigate();

  return (
    <header className="topbar">
      <div className="topbar-left">
        <button className="menu-toggle-btn" onClick={onMenuToggle} title="Toggle Navigation">
          <Menu size={20} />
        </button>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div className="live-pulse-dot" title="SM-DP+ Provisioning Server Live" />
          <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
            SM-DP+ Engine: <strong style={{ color: '#38bdf8' }}>smdp.telecom-demo.io</strong>
          </span>
          <span className="badge badge-primary" style={{ fontSize: '0.68rem' }}>
            5G SA Ready
          </span>
        </div>
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
