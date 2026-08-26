import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  getMyDevices,
  getMyEsimRequests,
  getMyPayments,
  getAllPlans
} from '../services/api';
import {
  Zap,
  Smartphone,
  Layers,
  History,
  QrCode,
  CheckCircle2,
  Clock,
  CreditCard,
  Plus,
  ArrowRight,
  Shield,
  Radio,
  ExternalLink
} from 'lucide-react';
import toast from 'react-hot-toast';

export default function Dashboard() {
  const { user } = useAuth();
  const [devices, setDevices] = useState([]);
  const [requests, setRequests] = useState([]);
  const [payments, setPayments] = useState([]);
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const [devRes, reqRes, payRes, planRes] = await Promise.all([
          getMyDevices(),
          getMyEsimRequests(),
          getMyPayments(),
          getAllPlans({ popularOnly: 'true' })
        ]);

        if (devRes.data.success) setDevices(devRes.data.devices || []);
        if (reqRes.data.success) setRequests(reqRes.data.requests || []);
        if (payRes.data.success) setPayments(payRes.data.payments || []);
        if (planRes.data.success) setPlans(planRes.data.plans || []);
      } catch (err) {
        console.error('Failed to load dashboard data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const activeProfiles = requests.filter(r => r.status === 'ACTIVATED');
  const pendingRequests = requests.filter(r => ['REQUEST_CREATED', 'OTP_VERIFIED', 'PAYMENT_COMPLETED', 'PROFILE_READY', 'INSTALLATION_PENDING'].includes(r.status));

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '50vh' }}>
        <div className="spinner" style={{ width: 40, height: 40 }} />
      </div>
    );
  }

  return (
    <div>
      {/* Header Banner */}
      <div className="page-header">
        <div>
          <h1 className="page-title">
            <Radio size={28} color="var(--accent-primary)" />
            Subscriber Dashboard
          </h1>
          <p className="page-subtitle">
            Welcome back, <strong style={{ color: '#fff' }}>{user?.name}</strong> • Phone: +91 {user?.phone || '9876543210'}
          </p>
        </div>
        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <Link to="/devices" className="btn btn-secondary">
            <Smartphone size={16} />
            <span>Manage Devices</span>
          </Link>
          <Link to="/activate" className="btn btn-primary">
            <Zap size={16} />
            <span>Activate New eSIM</span>
          </Link>
        </div>
      </div>

      {/* KPI Metrics */}
      <div className="grid-4" style={{ marginBottom: '2rem' }}>
        <div className="card card-glass card-glow-primary">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>
                Active eSIM Lines
              </div>
              <div style={{ fontSize: '2.2rem', fontWeight: 800, color: 'var(--text-primary)', marginTop: '0.2rem' }}>
                {activeProfiles.length}
              </div>
            </div>
            <div
              style={{
                width: 40,
                height: 40,
                borderRadius: 'var(--radius-md)',
                background: 'rgba(99, 102, 241, 0.15)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--accent-primary)'
              }}
            >
              <Zap size={20} />
            </div>
          </div>
          <div style={{ fontSize: '0.78rem', color: 'var(--accent-success)', marginTop: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
            <CheckCircle2 size={13} />
            <span>5G VoNR Standalone Ready</span>
          </div>
        </div>

        <div className="card card-glass">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>
                Registered Devices
              </div>
              <div style={{ fontSize: '2.2rem', fontWeight: 800, color: 'var(--text-primary)', marginTop: '0.2rem' }}>
                {devices.length}
              </div>
            </div>
            <div
              style={{
                width: 40,
                height: 40,
                borderRadius: 'var(--radius-md)',
                background: 'rgba(6, 182, 212, 0.15)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--accent-cyan)'
              }}
            >
              <Smartphone size={20} />
            </div>
          </div>
          <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginTop: '0.75rem' }}>
            Verified 32-Digit EIDs
          </div>
        </div>

        <div className="card card-glass">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>
                Pending Activations
              </div>
              <div style={{ fontSize: '2.2rem', fontWeight: 800, color: 'var(--text-primary)', marginTop: '0.2rem' }}>
                {pendingRequests.length}
              </div>
            </div>
            <div
              style={{
                width: 40,
                height: 40,
                borderRadius: 'var(--radius-md)',
                background: 'rgba(245, 158, 11, 0.15)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--accent-warning)'
              }}
            >
              <Clock size={20} />
            </div>
          </div>
          <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginTop: '0.75rem' }}>
            In Provisioning Pipeline
          </div>
        </div>

        <div className="card card-glass">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>
                Total Payments
              </div>
              <div style={{ fontSize: '2.2rem', fontWeight: 800, color: 'var(--text-primary)', marginTop: '0.2rem' }}>
                ₹{payments.reduce((acc, p) => acc + (parseFloat(p.total_amount) || 0), 0).toFixed(0)}
              </div>
            </div>
            <div
              style={{
                width: 40,
                height: 40,
                borderRadius: 'var(--radius-md)',
                background: 'rgba(16, 185, 129, 0.15)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--accent-success)'
              }}
            >
              <CreditCard size={20} />
            </div>
          </div>
          <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginTop: '0.75rem' }}>
            {payments.length} Transaction(s) Logged
          </div>
        </div>
      </div>

      {/* Main Grid: Active Profiles & Recent Requests */}
      <div className="grid-2" style={{ marginBottom: '2.5rem' }}>
        {/* Active eSIM Profiles Card */}
        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Zap size={18} color="var(--accent-primary)" />
              Active eSIM Profiles
            </h2>
            <Link to="/activations" style={{ fontSize: '0.82rem', color: '#38bdf8' }}>
              View All History
            </Link>
          </div>

          {requests.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '2rem 1rem', color: 'var(--text-muted)' }}>
              <QrCode size={40} style={{ opacity: 0.4, marginBottom: '0.5rem' }} />
              <p>No eSIM profiles provisioned yet.</p>
              <Link to="/activate" className="btn btn-primary btn-sm" style={{ marginTop: '1rem' }}>
                Activate Your First eSIM
              </Link>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
              {requests.slice(0, 3).map(req => (
                <div
                  key={req.id}
                  style={{
                    background: 'var(--bg-surface)',
                    border: '1px solid var(--border-subtle)',
                    borderRadius: 'var(--radius-md)',
                    padding: '1rem 1.25rem',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: '1rem'
                  }}
                >
                  <div style={{ minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
                      <span style={{ fontWeight: 700, color: 'var(--text-primary)' }}>{req.operator}</span>
                      <span className={`badge ${req.status === 'ACTIVATED' ? 'badge-success' : 'badge-primary'}`}>
                        {req.status}
                      </span>
                    </div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                      Phone: <strong style={{ color: '#fff' }}>{req.msisdn}</strong> • Ref: {req.request_code}
                    </div>
                  </div>

                  <Link
                    to={`/activations/${req.id}`}
                    className="btn btn-secondary btn-sm"
                    style={{ flexShrink: 0 }}
                  >
                    <QrCode size={14} />
                    <span>View QR</span>
                  </Link>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Registered Devices Card */}
        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Smartphone size={18} color="var(--accent-cyan)" />
              Registered Devices & EIDs
            </h2>
            <Link to="/devices" className="btn btn-secondary btn-sm">
              <Plus size={14} />
              <span>Add Device</span>
            </Link>
          </div>

          {devices.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '2rem 1rem', color: 'var(--text-muted)' }}>
              <Smartphone size={40} style={{ opacity: 0.4, marginBottom: '0.5rem' }} />
              <p>No devices registered with 32-digit EID.</p>
              <Link to="/devices" className="btn btn-secondary btn-sm" style={{ marginTop: '1rem' }}>
                Register Device Now
              </Link>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
              {devices.slice(0, 3).map(dev => (
                <div
                  key={dev.id}
                  style={{
                    background: 'var(--bg-surface)',
                    border: '1px solid var(--border-subtle)',
                    borderRadius: 'var(--radius-md)',
                    padding: '1rem 1.25rem'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.35rem' }}>
                    <span style={{ fontWeight: 700, color: 'var(--text-primary)' }}>{dev.device_name}</span>
                    <span className="badge badge-cyan">{dev.os}</span>
                  </div>
                  <div style={{ fontSize: '0.78rem', fontFamily: 'var(--font-mono)', color: 'var(--text-secondary)' }}>
                    EID: {dev.eid.slice(0, 8)} •••• •••• {dev.eid.slice(-8)}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Featured Telecom Plans */}
      <div className="card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Layers size={18} color="var(--accent-primary)" />
              Featured Telecom Plans (Jio, Airtel, Vi, BSNL)
            </h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
              Instant eSIM provisioning available for all high-speed 5G plans.
            </p>
          </div>
          <Link to="/plans" className="btn btn-secondary btn-sm">
            <span>Browse All Plans</span>
            <ArrowRight size={14} />
          </Link>
        </div>

        <div className="grid-3">
          {plans.slice(0, 3).map(p => (
            <div
              key={p.id}
              style={{
                background: 'var(--bg-surface)',
                border: '1px solid var(--border-subtle)',
                borderRadius: 'var(--radius-md)',
                padding: '1.5rem',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between'
              }}
            >
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                  <span className="badge badge-primary">{p.operator}</span>
                  {p.is_unlimited_5g && <span className="badge badge-cyan">Unlimited 5G</span>}
                </div>
                <div style={{ fontSize: '1.15rem', fontWeight: 800, marginTop: '0.5rem' }}>{p.plan_name}</div>
                <div style={{ fontSize: '1.8rem', fontWeight: 900, color: 'var(--text-primary)', margin: '0.5rem 0' }}>
                  ₹{p.price}
                  <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 500 }}>
                    {' '}/ {p.validity_days} Days
                  </span>
                </div>
                <div style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', lineHeight: 1.5, marginBottom: '1rem' }}>
                  • {p.data_per_day} High Speed Data<br />
                  • {p.calling_benefits}<br />
                  • {p.sms_allowance}
                </div>
              </div>

              <Link
                to="/activate"
                state={{ preselectedPlanId: p.id, preselectedOperator: p.operator }}
                className="btn btn-primary btn-sm"
                style={{ width: '100%', justifyContent: 'center' }}
              >
                <Zap size={14} />
                <span>Select & Activate</span>
              </Link>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
