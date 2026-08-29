import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Menu, Zap, Shield, LogIn, ArrowRight, Activity } from 'lucide-react';
import { checkHealth } from '../services/api';

export default function Navbar({ onMenuToggle }) {
  const { user, isAuthenticated, isAdmin, logout } = useAuth();
  const navigate = useNavigate();
  const [apiStatus, setApiStatus] = useState('CHECKING'); // CHECKING | ONLINE | SLEEPING | OFFLINE

  useEffect(() => {
    let isMounted = true;
    checkHealth()
      .then(() => {
        if (isMounted) setApiStatus('ONLINE');
      })
      .catch(() => {
        if (isMounted) setApiStatus('SLEEPING');
      });
    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <header className="topbar">
      <div className="topbar-left">
        <button className="menu-toggle-btn" onClick={onMenuToggle} title="Toggle Navigation">
          <Menu size={20} />
        </button>

        <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', textDecoration: 'none', marginRight: '0.5rem' }}>
          <img
            src="/logo.png"
            alt="SIM Activation Portal Logo"
            style={{ height: 28, width: 'auto', objectFit: 'contain' }}
          />
          <span style={{ fontWeight: 800, fontSize: '0.95rem', color: 'var(--text-primary)', display: 'inline-block' }}>
            SIM Activation Portal
          </span>
        </Link>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
          <div className="live-pulse-dot" title="SM-DP+ Provisioning Server Live" />
          <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
            SM-DP+ Engine: <strong style={{ color: '#38bdf8' }}>smdp.telecom-demo.io</strong>
          </span>

          {apiStatus === 'ONLINE' && (
            <span className="badge badge-success" style={{ fontSize: '0.68rem', display: 'inline-flex', alignItems: 'center', gap: 4 }}>
              <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#10b981', display: 'inline-block' }} />
              API Connected
            </span>
          )}

          {apiStatus === 'SLEEPING' && (
            <span
              className="badge badge-warning"
              style={{ fontSize: '0.68rem', display: 'inline-flex', alignItems: 'center', gap: 4, cursor: 'help' }}
              title="Render free tier may take ~30-50s to wake up if idle. Try refreshing or logging in."
            >
              <Activity size={11} className="spinner" />
              API Waking Up...
            </span>
          )}

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
