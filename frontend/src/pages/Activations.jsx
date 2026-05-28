import { useEffect, useState } from 'react';
import { ClipboardList, RefreshCw } from 'lucide-react';
import toast from 'react-hot-toast';
import { getAllActivations } from '../services/api';

export default function Activations() {
  const [activations, setActivations] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchActivations = () => {
    setLoading(true);
    getAllActivations()
      .then(r => setActivations(r.data))
      .catch(() => toast.error('Failed to load activations'))
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchActivations(); }, []);

  const getBadge = (status) => (
    <span className={`badge badge-${status?.toLowerCase()}`}>
      <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'currentColor', display: 'inline-block' }} />
      {status}
    </span>
  );

  return (
    <div>
      <div className="page-header">
        <h1>Activations Log</h1>
        <p>Full history of all SIM card activations across all customers.</p>
      </div>

      <div className="card table-card">
        <div className="section-header">
          <h2>All Activations ({activations.length})</h2>
          <button
            className="btn btn-sm"
            style={{ background: 'rgba(255,255,255,0.05)', color: 'var(--text-secondary)', border: '1px solid var(--border)' }}
            onClick={fetchActivations}
          >
            <RefreshCw size={14} />
          </button>
        </div>

        {loading ? <div className="spinner" /> : activations.length === 0 ? (
          <div className="empty-state">
            <ClipboardList size={48} />
            <p>No activations yet. Activate a SIM card to see records here.</p>
          </div>
        ) : (
          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>#</th>
                  <th>Activation ID</th>
                  <th>Customer</th>
                  <th>Phone</th>
                  <th>SIM (MSISDN)</th>
                  <th>Network</th>
                  <th>Plan</th>
                  <th>Status</th>
                  <th>Activated On</th>
                </tr>
              </thead>
              <tbody>
                {activations.map((a, i) => (
                  <tr key={a.id}>
                    <td style={{ color: 'var(--text-muted)' }}>{i + 1}</td>
                    <td style={{ fontFamily: 'monospace', color: '#a78bfa' }}>#{a.id}</td>
                    <td style={{ fontWeight: 600 }}>{a.customer?.name}</td>
                    <td style={{ color: 'var(--text-secondary)' }}>{a.customer?.phone}</td>
                    <td style={{ color: '#22d3ee', fontWeight: 600 }}>{a.simCard?.msisdn}</td>
                    <td>{a.simCard?.network}</td>
                    <td>
                      <span style={{ background: 'rgba(139,92,246,0.15)', color: '#a78bfa', border: '1px solid rgba(139,92,246,0.3)', padding: '3px 10px', borderRadius: 20, fontSize: '0.75rem', fontWeight: 600 }}>
                        {a.plan}
                      </span>
                    </td>
                    <td>{getBadge(a.status)}</td>
                    <td style={{ color: 'var(--text-secondary)', fontSize: '0.82rem' }}>
                      {new Date(a.activationDate).toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
