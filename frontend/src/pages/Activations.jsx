import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getMyEsimRequests } from '../services/api';
import {
  History,
  Zap,
  QrCode,
  Search,
  CheckCircle2,
  Clock,
  XCircle,
  Smartphone,
  Layers,
  ArrowRight
} from 'lucide-react';
import toast from 'react-hot-toast';

export default function Activations() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState('ALL');
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    try {
      const res = await getMyEsimRequests();
      if (res.data.success) {
        setRequests(res.data.requests || []);
      }
    } catch (err) {
      toast.error('Failed to load activation records.');
    } finally {
      setLoading(false);
    }
  };

  const filtered = requests.filter(r => {
    if (filterStatus !== 'ALL' && r.status !== filterStatus) return false;
    if (search) {
      const q = search.toLowerCase();
      return (
        r.request_code.toLowerCase().includes(q) ||
        r.operator.toLowerCase().includes(q) ||
        r.msisdn.toLowerCase().includes(q) ||
        (r.plan?.name && r.plan.name.toLowerCase().includes(q))
      );
    }
    return true;
  });

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">
            <History size={28} color="var(--accent-primary)" />
            eSIM Activation History
          </h1>
          <p className="page-subtitle">
            Track all requested, provisioned, and activated digital SIM profiles.
          </p>
        </div>
        <Link to="/activate" className="btn btn-primary">
          <Zap size={16} />
          <span>New Activation</span>
        </Link>
      </div>

      {/* Filter and Search Bar */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: '1rem',
          flexWrap: 'wrap',
          marginBottom: '1.5rem'
        }}
      >
        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
          {['ALL', 'ACTIVATED', 'PROFILE_READY', 'INSTALLATION_PENDING', 'REJECTED'].map(st => (
            <button
              key={st}
              onClick={() => setFilterStatus(st)}
              className={`btn btn-sm ${filterStatus === st ? 'btn-primary' : 'btn-secondary'}`}
              style={{ fontSize: '0.8rem' }}
            >
              {st}
            </button>
          ))}
        </div>

        <div style={{ position: 'relative', width: '280px' }}>
          <Search size={16} color="var(--text-muted)" style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)' }} />
          <input
            type="text"
            className="form-input"
            style={{ paddingLeft: '2.4rem', fontSize: '0.85rem' }}
            placeholder="Search by ID, Phone, Operator..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {/* Requests Table */}
      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: '3rem' }}>
          <div className="spinner" style={{ width: 36, height: 36 }} />
        </div>
      ) : filtered.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '3.5rem 1rem', color: 'var(--text-muted)' }}>
          <History size={48} style={{ opacity: 0.4, marginBottom: '0.75rem' }} />
          <div style={{ fontWeight: 600, fontSize: '1.1rem', color: 'var(--text-primary)' }}>
            No Activation Requests Found
          </div>
          <p style={{ fontSize: '0.85rem', marginTop: '0.25rem' }}>
            You haven't requested any eSIM activations matching the current filters.
          </p>
          <Link to="/activate" className="btn btn-primary btn-sm" style={{ marginTop: '1.25rem' }}>
            Start an Activation
          </Link>
        </div>
      ) : (
        <div className="table-wrapper">
          <table className="telecom-table">
            <thead>
              <tr>
                <th>Request Code</th>
                <th>Operator</th>
                <th>Mobile Number</th>
                <th>Device EID</th>
                <th>Plan Details</th>
                <th>Status</th>
                <th>Date</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(r => (
                <tr key={r.id}>
                  <td style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, color: '#38bdf8' }}>
                    {r.request_code}
                  </td>
                  <td>
                    <span className="badge badge-primary">{r.operator}</span>
                  </td>
                  <td style={{ fontWeight: 600 }}>+91 {r.msisdn}</td>
                  <td style={{ fontFamily: 'var(--font-mono)', fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
                    {r.eid ? `${r.eid.slice(0, 8)}...${r.eid.slice(-4)}` : 'N/A'}
                  </td>
                  <td>
                    <div style={{ fontWeight: 600 }}>{r.plan?.name || 'eSIM Plan'}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>₹{r.plan?.price || 299} • {r.plan?.data}</div>
                  </td>
                  <td>
                    <span
                      className={`badge ${
                        r.status === 'ACTIVATED'
                          ? 'badge-success'
                          : r.status === 'REJECTED' || r.status === 'FAILED'
                          ? 'badge-danger'
                          : 'badge-primary'
                      }`}
                    >
                      {r.status}
                    </span>
                  </td>
                  <td style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                    {new Date(r.created_at).toLocaleDateString()}
                  </td>
                  <td>
                    <Link
                      to={`/activations/${r.id}`}
                      className="btn btn-secondary btn-sm"
                      style={{ fontSize: '0.8rem', padding: '0.35rem 0.75rem' }}
                    >
                      <QrCode size={14} />
                      <span>View QR</span>
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
