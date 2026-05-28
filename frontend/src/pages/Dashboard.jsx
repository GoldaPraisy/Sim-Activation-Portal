import { useEffect, useState } from 'react';
import { LayoutDashboard, Smartphone, Users, Zap, ClipboardList, TrendingUp } from 'lucide-react';
import { getDashboardStats } from '../services/api';

const statConfig = [
  { key: 'totalSims',       label: 'Total SIM Cards',    icon: Smartphone,    color: '#9C27B0', bg: 'rgba(156, 39, 176, 0.15)'  },
  { key: 'availableSims',   label: 'Available SIMs',     icon: TrendingUp,    color: '#00E676', bg: 'rgba(0, 230, 118, 0.15)'  },
  { key: 'activatedSims',   label: 'Activated SIMs',     icon: Zap,           color: '#FF00FF', bg: 'rgba(255, 0, 255, 0.15)'  },
  { key: 'deactivatedSims', label: 'Deactivated SIMs',   icon: Smartphone,    color: '#FF1744', bg: 'rgba(255, 23, 68, 0.15)'   },
  { key: 'totalCustomers',  label: 'Registered Customers',icon: Users,        color: '#B39DDB', bg: 'rgba(179, 157, 219, 0.15)' },
  { key: 'totalActivations',label: 'Total Activations',  icon: ClipboardList, color: '#D1C4E9', bg: 'rgba(209, 196, 233, 0.15)' },
];

export default function Dashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getDashboardStats()
      .then(r => setStats(r.data))
      .catch(() => setStats({}))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div>
      <div className="page-header">
        <h1>Dashboard</h1>
        <p>Welcome to the SIM Activation Portal — monitor all activity at a glance.</p>
      </div>

      {loading ? (
        <div className="spinner" />
      ) : (
        <div className="stats-grid">
          {statConfig.map(({ key, label, icon: Icon, color, bg }) => (
            <div className="stat-card card" key={key}>
              <div className="stat-icon" style={{ background: bg }}>
                <Icon size={24} color={color} />
              </div>
              <div className="stat-info">
                <div className="stat-value" style={{ color }}>{stats?.[key] ?? 0}</div>
                <div className="stat-label">{label}</div>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="card" style={{ marginTop: 8 }}>
        <div className="section-header">
          <h2>Quick Actions</h2>
        </div>
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
          <a href="/sims" className="btn btn-primary"><Smartphone size={16} /> Manage SIM Cards</a>
          <a href="/customers" className="btn btn-success"><Users size={16} /> Add Customer</a>
          <a href="/activate" className="btn" style={{ background: 'rgba(255, 0, 255, 0.1)', color: '#FF00FF', border: '1px solid rgba(255, 0, 255, 0.2)' }}>
            <Zap size={16} /> Activate SIM
          </a>
          <a href="/activations" className="btn" style={{ background: 'rgba(156, 39, 176, 0.1)', color: '#9C27B0', border: '1px solid rgba(156, 39, 176, 0.2)' }}>
            <ClipboardList size={16} /> View Logs
          </a>
        </div>
      </div>
    </div>
  );
}
