import { useEffect, useState } from 'react';
import { Plus, Trash2, Smartphone, RefreshCw } from 'lucide-react';
import toast from 'react-hot-toast';
import { getAllSims, createSim, deleteSim } from '../services/api';

const NETWORKS = ['Airtel', 'Jio', 'Vi', 'BSNL', 'MTNL'];

const initForm = { aadhaarNumber: '', msisdn: '', network: 'Airtel' };

export default function SimCards() {
  const [sims, setSims] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState(initForm);
  const [submitting, setSubmitting] = useState(false);
  const [showForm, setShowForm] = useState(false);

  const fetchSims = () => {
    setLoading(true);
    getAllSims()
      .then(r => setSims(r.data))
      .catch(() => toast.error('Failed to load SIM cards'))
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchSims(); }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.aadhaarNumber || !form.msisdn || !form.network) {
      toast.error('All fields are required');
      return;
    }
    setSubmitting(true);
    try {
      await createSim(form);
      toast.success('SIM card added successfully!');
      setForm(initForm);
      setShowForm(false);
      fetchSims();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to add SIM card');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this SIM card?')) return;
    try {
      await deleteSim(id);
      toast.success('SIM card deleted');
      fetchSims();
    } catch {
      toast.error('Failed to delete SIM card');
    }
  };

  const getBadge = (status) => (
    <span className={`badge badge-${status.toLowerCase()}`}>
      <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'currentColor', display: 'inline-block' }} />
      {status}
    </span>
  );

  return (
    <div>
      <div className="page-header">
        <h1>SIM Cards</h1>
        <p>Manage your SIM card inventory — add, view, and remove SIM cards.</p>
      </div>

      {/* Add Form */}
      {showForm && (
        <div className="card" style={{ marginBottom: 24 }}>
          <div className="section-header">
            <h2>Add New SIM Card</h2>
          </div>
          <form onSubmit={handleSubmit}>
            <div className="form-grid">
              <div className="form-group">
                <label>Aadhaar Number (12 digits)</label>
                <input
                  type="text"
                  placeholder="1234 5678 9012"
                  value={form.aadhaarNumber}
                  maxLength={12}
                  onChange={e => setForm({ ...form, aadhaarNumber: e.target.value.replace(/\D/g, '') })}
                />
              </div>
              <div className="form-group">
                <label>MSISDN (Phone Number)</label>
                <input
                  type="text"
                  placeholder="+919876543210"
                  value={form.msisdn}
                  onChange={e => setForm({ ...form, msisdn: e.target.value })}
                />
              </div>
              <div className="form-group">
                <label>Network Operator</label>
                <select value={form.network} onChange={e => setForm({ ...form, network: e.target.value })}>
                  {NETWORKS.map(n => <option key={n}>{n}</option>)}
                </select>
              </div>
            </div>
            <div className="form-actions">
              <button type="button" className="btn btn-danger btn-sm" onClick={() => setShowForm(false)}>Cancel</button>
              <button type="submit" className="btn btn-primary btn-sm" disabled={submitting}>
                {submitting ? 'Adding...' : <><Plus size={15} /> Add SIM</>}
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="card table-card">
        <div className="section-header">
          <h2>SIM Inventory ({sims.length})</h2>
          <div style={{ display: 'flex', gap: 10 }}>
            <button className="btn btn-sm" style={{ background: 'rgba(255,255,255,0.05)', color: 'var(--text-secondary)', border: '1px solid var(--border)' }} onClick={fetchSims}>
              <RefreshCw size={14} />
            </button>
            <button className="btn btn-primary btn-sm" onClick={() => setShowForm(!showForm)}>
              <Plus size={15} /> Add SIM
            </button>
          </div>
        </div>

        {loading ? <div className="spinner" /> : sims.length === 0 ? (
          <div className="empty-state">
            <Smartphone size={48} />
            <p>No SIM cards found. Add your first SIM card!</p>
          </div>
        ) : (
          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>#</th>
                  <th>Aadhaar Number</th>
                  <th>MSISDN</th>
                  <th>Network</th>
                  <th>Status</th>
                  <th>Added On</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {sims.map((sim, i) => (
                  <tr key={sim.id}>
                    <td style={{ color: 'var(--text-muted)' }}>{i + 1}</td>
                    <td style={{ fontFamily: 'monospace', fontSize: '0.82rem', color: 'var(--accent-primary)' }}>{sim.aadhaarNumber}</td>
                    <td style={{ fontWeight: 600 }}>{sim.msisdn}</td>
                    <td>{sim.network}</td>
                    <td>{getBadge(sim.status)}</td>
                    <td style={{ color: 'var(--text-secondary)', fontSize: '0.82rem' }}>
                      {new Date(sim.createdAt).toLocaleDateString()}
                    </td>
                    <td>
                      <button className="btn btn-danger btn-sm" onClick={() => handleDelete(sim.id)}>
                        <Trash2 size={13} />
                      </button>
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
