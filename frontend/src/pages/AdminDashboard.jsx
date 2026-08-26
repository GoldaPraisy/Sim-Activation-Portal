import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  getAdminStats,
  getAllAdminRequests,
  updateAdminRequestStatus,
  getAllAdminUsers,
  getAllAdminDevices,
  getAllAdminPayments,
  getAdminAuditLogs
} from '../services/api';
import {
  ShieldAlert,
  Users,
  Smartphone,
  Layers,
  CreditCard,
  CheckCircle2,
  XCircle,
  Clock,
  Search,
  Filter,
  RefreshCw,
  QrCode,
  Check,
  X,
  History,
  AlertTriangle,
  Radio
} from 'lucide-react';
import toast from 'react-hot-toast';

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState('requests'); // 'requests', 'users', 'devices', 'payments', 'logs'
  const [stats, setStats] = useState(null);
  const [requests, setRequests] = useState([]);
  const [users, setUsers] = useState([]);
  const [devices, setDevices] = useState([]);
  const [payments, setPayments] = useState([]);
  const [logs, setLogs] = useState([]);

  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetchStats();
    loadCurrentTab(activeTab);
  }, [activeTab]);

  const fetchStats = async () => {
    try {
      const res = await getAdminStats();
      if (res.data.success) {
        setStats(res.data.metrics);
      }
    } catch (err) {
      console.error('Failed to load admin stats:', err);
    }
  };

  const loadCurrentTab = async (tab) => {
    setLoading(true);
    try {
      if (tab === 'requests') {
        const res = await getAllAdminRequests({ status: statusFilter, search });
        if (res.data.success) setRequests(res.data.requests || []);
      } else if (tab === 'users') {
        const res = await getAllAdminUsers();
        if (res.data.success) setUsers(res.data.users || []);
      } else if (tab === 'devices') {
        const res = await getAllAdminDevices();
        if (res.data.success) setDevices(res.data.devices || []);
      } else if (tab === 'payments') {
        const res = await getAllAdminPayments();
        if (res.data.success) setPayments(res.data.payments || []);
      } else if (tab === 'logs') {
        const res = await getAdminAuditLogs();
        if (res.data.success) setLogs(res.data.logs || []);
      }
    } catch (err) {
      toast.error('Failed to load ' + tab + ' data.');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (requestId, nextStatus) => {
    try {
      const res = await updateAdminRequestStatus(requestId, {
        status: nextStatus,
        note: `Admin manually set status to ${nextStatus}`
      });
      if (res.data.success) {
        toast.success(res.data.message);
        fetchStats();
        loadCurrentTab('requests');
      }
    } catch (err) {
      toast.error('Failed to update activation request status.');
    }
  };

  return (
    <div>
      {/* Page Header */}
      <div className="page-header">
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.35rem' }}>
            <span className="badge badge-warning">Carrier Admin Portal</span>
            <span className="badge badge-primary">GSMA SM-DP+ Control</span>
          </div>
          <h1 className="page-title">
            <ShieldAlert size={28} color="var(--accent-warning)" />
            Telecom Provisioning Command Center
          </h1>
          <p className="page-subtitle">
            Carrier-level administrative overview, real-time subscriber provisioning approval, and audit governance.
          </p>
        </div>
        <button onClick={() => { fetchStats(); loadCurrentTab(activeTab); }} className="btn btn-secondary btn-sm">
          <RefreshCw size={15} />
          <span>Refresh Data</span>
        </button>
      </div>

      {/* Admin KPI Cards */}
      {stats && (
        <div className="grid-4" style={{ marginBottom: '2rem' }}>
          <div className="card card-glass card-glow-primary">
            <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>
              Total Subscribers
            </div>
            <div style={{ fontSize: '2.2rem', fontWeight: 800, color: 'var(--text-primary)', marginTop: '0.2rem' }}>
              {stats.totalUsers}
            </div>
            <div style={{ fontSize: '0.78rem', color: '#a5b4fc', marginTop: '0.5rem' }}>
              {stats.totalDevices} Registered Devices / EIDs
            </div>
          </div>

          <div className="card card-glass card-glow-cyan">
            <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>
              Activation Requests
            </div>
            <div style={{ fontSize: '2.2rem', fontWeight: 800, color: 'var(--text-primary)', marginTop: '0.2rem' }}>
              {stats.totalRequests}
            </div>
            <div style={{ fontSize: '0.78rem', color: '#67e8f9', marginTop: '0.5rem' }}>
              {stats.pendingRequests} Pending • {stats.completedActivations} Active
            </div>
          </div>

          <div className="card card-glass">
            <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>
              Provisioning Success
            </div>
            <div style={{ fontSize: '2.2rem', fontWeight: 800, color: 'var(--accent-success)', marginTop: '0.2rem' }}>
              {stats.totalRequests > 0
                ? `${Math.round((stats.completedActivations / stats.totalRequests) * 100)}%`
                : '100%'}
            </div>
            <div style={{ fontSize: '0.78rem', color: 'var(--accent-danger)', marginTop: '0.5rem' }}>
              {stats.failedRequests} Rejected / Failed
            </div>
          </div>

          <div className="card card-glass">
            <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>
              Total Revenue Logged
            </div>
            <div style={{ fontSize: '2.2rem', fontWeight: 800, color: '#fcd34d', marginTop: '0.2rem' }}>
              ₹{stats.totalRevenue}
            </div>
            <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginTop: '0.5rem' }}>
              {stats.totalPayments} Transactions Processed
            </div>
          </div>
        </div>
      )}

      {/* Main Admin Navigation Tabs */}
      <div
        style={{
          display: 'flex',
          gap: '0.6rem',
          borderBottom: '1px solid var(--border-subtle)',
          paddingBottom: '1rem',
          marginBottom: '1.75rem',
          flexWrap: 'wrap'
        }}
      >
        <button
          onClick={() => setActiveTab('requests')}
          className={`btn btn-sm ${activeTab === 'requests' ? 'btn-primary' : 'btn-secondary'}`}
        >
          <Radio size={15} />
          <span>Activation Requests ({stats?.totalRequests || 0})</span>
        </button>

        <button
          onClick={() => setActiveTab('users')}
          className={`btn btn-sm ${activeTab === 'users' ? 'btn-primary' : 'btn-secondary'}`}
        >
          <Users size={15} />
          <span>Subscribers ({stats?.totalUsers || 0})</span>
        </button>

        <button
          onClick={() => setActiveTab('devices')}
          className={`btn btn-sm ${activeTab === 'devices' ? 'btn-primary' : 'btn-secondary'}`}
        >
          <Smartphone size={15} />
          <span>Devices & EIDs ({stats?.totalDevices || 0})</span>
        </button>

        <button
          onClick={() => setActiveTab('payments')}
          className={`btn btn-sm ${activeTab === 'payments' ? 'btn-primary' : 'btn-secondary'}`}
        >
          <CreditCard size={15} />
          <span>Payments Ledger ({stats?.totalPayments || 0})</span>
        </button>

        <button
          onClick={() => setActiveTab('logs')}
          className={`btn btn-sm ${activeTab === 'logs' ? 'btn-primary' : 'btn-secondary'}`}
        >
          <History size={15} />
          <span>Audit Logs</span>
        </button>
      </div>

      {/* TAB 1: Activation Requests Management Table */}
      {activeTab === 'requests' && (
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '1rem' }}>
            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
              {['ALL', 'PROFILE_READY', 'ACTIVATED', 'INSTALLATION_PENDING', 'REJECTED'].map(st => (
                <button
                  key={st}
                  onClick={() => { setStatusFilter(st); }}
                  className={`btn btn-sm ${statusFilter === st ? 'btn-primary' : 'btn-secondary'}`}
                  style={{ fontSize: '0.78rem' }}
                >
                  {st}
                </button>
              ))}
            </div>

            <div style={{ position: 'relative', width: '280px' }}>
              <Search size={15} color="var(--text-muted)" style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)' }} />
              <input
                type="text"
                className="form-input"
                style={{ paddingLeft: '2.2rem', fontSize: '0.82rem', padding: '0.5rem 0.75rem 0.5rem 2.2rem' }}
                placeholder="Search requests..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>

          {loading ? (
            <div style={{ display: 'flex', justifyContent: 'center', padding: '3rem' }}>
              <div className="spinner" style={{ width: 36, height: 36 }} />
            </div>
          ) : requests.length === 0 ? (
            <div className="card" style={{ textAlign: 'center', padding: '3rem 1rem', color: 'var(--text-muted)' }}>
              No requests found.
            </div>
          ) : (
            <div className="table-wrapper">
              <table className="telecom-table">
                <thead>
                  <tr>
                    <th>Ref Code</th>
                    <th>Subscriber</th>
                    <th>Operator</th>
                    <th>Plan</th>
                    <th>Device EID</th>
                    <th>Status</th>
                    <th>Admin Controls (Status Transition)</th>
                  </tr>
                </thead>
                <tbody>
                  {requests.map(r => (
                    <tr key={r.id}>
                      <td style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, color: '#38bdf8' }}>
                        <Link to={`/activations/${r.id}`} style={{ color: '#38bdf8' }}>
                          {r.request_code}
                        </Link>
                      </td>
                      <td>
                        <div style={{ fontWeight: 600 }}>{r.user?.name || 'Subscriber'}</div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>+91 {r.msisdn}</div>
                      </td>
                      <td>
                        <span className="badge badge-primary">{r.operator}</span>
                      </td>
                      <td>
                        <div style={{ fontWeight: 600 }}>{r.plan?.name || 'eSIM Plan'}</div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>₹{r.plan?.price}</div>
                      </td>
                      <td style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                        {r.eid ? `${r.eid.slice(0, 8)}...${r.eid.slice(-4)}` : 'N/A'}
                      </td>
                      <td>
                        <span
                          className={`badge ${
                            r.status === 'ACTIVATED'
                              ? 'badge-success'
                              : r.status === 'REJECTED' || r.status === 'FAILED'
                              ? 'badge-danger'
                              : 'badge-warning'
                          }`}
                        >
                          {r.status}
                        </span>
                      </td>
                      <td>
                        <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
                          {r.status !== 'ACTIVATED' && (
                            <button
                              onClick={() => handleUpdateStatus(r.id, 'ACTIVATED')}
                              className="btn btn-success btn-sm"
                              style={{ fontSize: '0.72rem', padding: '0.25rem 0.55rem' }}
                              title="Approve & Activate"
                            >
                              <Check size={12} />
                              <span>Approve</span>
                            </button>
                          )}

                          {r.status !== 'REJECTED' && (
                            <button
                              onClick={() => handleUpdateStatus(r.id, 'REJECTED')}
                              className="btn btn-danger btn-sm"
                              style={{ fontSize: '0.72rem', padding: '0.25rem 0.55rem' }}
                              title="Reject Request"
                            >
                              <X size={12} />
                              <span>Reject</span>
                            </button>
                          )}

                          <select
                            value={r.status}
                            onChange={(e) => handleUpdateStatus(r.id, e.target.value)}
                            style={{
                              background: 'var(--bg-surface)',
                              color: 'var(--text-primary)',
                              border: '1px solid var(--border-subtle)',
                              borderRadius: 'var(--radius-sm)',
                              fontSize: '0.72rem',
                              padding: '0.2rem 0.4rem'
                            }}
                          >
                            <option value="REQUEST_CREATED">REQUEST_CREATED</option>
                            <option value="OTP_VERIFIED">OTP_VERIFIED</option>
                            <option value="PAYMENT_COMPLETED">PAYMENT_COMPLETED</option>
                            <option value="PROFILE_READY">PROFILE_READY</option>
                            <option value="INSTALLATION_PENDING">INSTALLATION_PENDING</option>
                            <option value="ACTIVATED">ACTIVATED</option>
                            <option value="REJECTED">REJECTED</option>
                          </select>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* TAB 2: Subscribers Table */}
      {activeTab === 'users' && (
        <div className="table-wrapper">
          <table className="telecom-table">
            <thead>
              <tr>
                <th>Subscriber ID</th>
                <th>Full Name</th>
                <th>Email Address</th>
                <th>Phone</th>
                <th>Registered Devices</th>
                <th>Total Requests</th>
                <th>Joined</th>
              </tr>
            </thead>
            <tbody>
              {users.map(u => (
                <tr key={u.id}>
                  <td style={{ fontFamily: 'var(--font-mono)', color: '#38bdf8' }}>{u.id}</td>
                  <td style={{ fontWeight: 700 }}>{u.name}</td>
                  <td>{u.email}</td>
                  <td>+91 {u.phone}</td>
                  <td>
                    <span className="badge badge-cyan">{u.deviceCount} Device(s)</span>
                  </td>
                  <td>
                    <span className="badge badge-primary">{u.requestCount} Request(s)</span>
                  </td>
                  <td style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                    {new Date(u.created_at).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* TAB 3: Devices & EIDs */}
      {activeTab === 'devices' && (
        <div className="table-wrapper">
          <table className="telecom-table">
            <thead>
              <tr>
                <th>Device ID</th>
                <th>Owner</th>
                <th>Device Model</th>
                <th>OS & Type</th>
                <th>32-Digit EID Identifier</th>
                <th>IMEI</th>
                <th>Registered</th>
              </tr>
            </thead>
            <tbody>
              {devices.map(d => (
                <tr key={d.id}>
                  <td style={{ fontFamily: 'var(--font-mono)', color: '#38bdf8' }}>{d.id}</td>
                  <td>
                    <div style={{ fontWeight: 600 }}>{d.owner?.name || 'Subscriber'}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{d.owner?.email}</div>
                  </td>
                  <td style={{ fontWeight: 600 }}>{d.device_name}</td>
                  <td>
                    <span className="badge badge-cyan">{d.device_type}</span>
                    <span style={{ marginLeft: 6, fontSize: '0.78rem', color: 'var(--text-secondary)' }}>{d.os}</span>
                  </td>
                  <td style={{ fontFamily: 'var(--font-mono)', fontSize: '0.8rem', color: '#38bdf8' }}>
                    {d.eid.match(/.{1,4}/g)?.join(' ') || d.eid}
                  </td>
                  <td style={{ fontFamily: 'var(--font-mono)', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                    {d.imei || 'N/A'}
                  </td>
                  <td style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                    {new Date(d.created_at).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* TAB 4: Payments Ledger */}
      {activeTab === 'payments' && (
        <div className="table-wrapper">
          <table className="telecom-table">
            <thead>
              <tr>
                <th>Transaction ID</th>
                <th>Subscriber</th>
                <th>Request Ref</th>
                <th>Plan Name</th>
                <th>Base Amount</th>
                <th>18% GST</th>
                <th>Total Paid</th>
                <th>Method</th>
                <th>Status</th>
                <th>Timestamp</th>
              </tr>
            </thead>
            <tbody>
              {payments.map(p => (
                <tr key={p.id}>
                  <td style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, color: '#38bdf8' }}>
                    {p.transaction_id}
                  </td>
                  <td>{p.user?.name || 'Subscriber'}</td>
                  <td style={{ fontFamily: 'var(--font-mono)' }}>{p.requestCode}</td>
                  <td>{p.plan?.name || 'eSIM Plan'}</td>
                  <td>₹{p.amount}</td>
                  <td>₹{p.tax}</td>
                  <td style={{ fontWeight: 800, color: 'var(--accent-success)' }}>₹{p.total_amount}</td>
                  <td>
                    <span className="badge badge-primary">{p.payment_method}</span>
                  </td>
                  <td>
                    <span className="badge badge-success">{p.status}</span>
                  </td>
                  <td style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                    {new Date(p.created_at).toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* TAB 5: Audit Logs */}
      {activeTab === 'logs' && (
        <div className="table-wrapper">
          <table className="telecom-table">
            <thead>
              <tr>
                <th>Timestamp</th>
                <th>Request Ref</th>
                <th>Carrier</th>
                <th>From Status</th>
                <th>To Status</th>
                <th>Triggered By</th>
                <th>Audit Note</th>
              </tr>
            </thead>
            <tbody>
              {logs.map(l => (
                <tr key={l.id}>
                  <td style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                    {new Date(l.created_at).toLocaleString()}
                  </td>
                  <td style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, color: '#38bdf8' }}>
                    {l.requestCode}
                  </td>
                  <td>
                    <span className="badge badge-primary">{l.operator}</span>
                  </td>
                  <td style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{l.from_status || 'INIT'}</td>
                  <td>
                    <span className="badge badge-cyan">{l.to_status}</span>
                  </td>
                  <td style={{ fontWeight: 600, fontSize: '0.8rem' }}>{l.created_by}</td>
                  <td style={{ color: 'var(--text-secondary)', fontSize: '0.82rem' }}>{l.note}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
