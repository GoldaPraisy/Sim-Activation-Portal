import { useEffect, useState } from 'react';
import { Plus, Trash2, Users, RefreshCw } from 'lucide-react';
import toast from 'react-hot-toast';
import { getAllCustomers, createCustomer, deleteCustomer } from '../services/api';

const initForm = { name: '', email: '', phone: '', idNumber: '', address: '', simType: '' };

export default function Customers() {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState(initForm);
  const [submitting, setSubmitting] = useState(false);
  const [showForm, setShowForm] = useState(false);

  const fetchCustomers = () => {
    setLoading(true);
    getAllCustomers()
      .then(r => setCustomers(r.data))
      .catch(() => toast.error('Failed to load customers'))
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchCustomers(); }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.phone || !form.idNumber || !form.address || !form.simType) {
      toast.error('All fields are required');
      return;
    }
    setSubmitting(true);
    try {
      await createCustomer(form);
      toast.success('Customer registered successfully!');
      setForm(initForm);
      setShowForm(false);
      fetchCustomers();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to register customer');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this customer?')) return;
    try {
      await deleteCustomer(id);
      toast.success('Customer deleted');
      fetchCustomers();
    } catch {
      toast.error('Failed to delete customer');
    }
  };

  return (
    <div>
      <div className="page-header">
        <h1>Customers</h1>
        <p>Register and manage customer profiles for SIM activation.</p>
      </div>

      {showForm && (
        <div className="card" style={{ marginBottom: 24 }}>
          <div className="section-header">
            <h2>Register New Customer</h2>
          </div>
          <form onSubmit={handleSubmit}>
            <div className="form-grid">
              <div className="form-group">
                <label>Full Name</label>
                <input type="text" placeholder="John Doe" value={form.name}
                  onChange={e => setForm({ ...form, name: e.target.value })} />
              </div>
              <div className="form-group">
                <label>Email Address</label>
                <input type="email" placeholder="john@example.com" value={form.email}
                  onChange={e => setForm({ ...form, email: e.target.value })} />
              </div>
              <div className="form-group">
                <label>Phone Number</label>
                <input type="text" placeholder="+919876543210" value={form.phone}
                  onChange={e => setForm({ ...form, phone: e.target.value })} />
              </div>
              <div className="form-group">
                <label>National ID / Aadhaar</label>
                <input type="text" placeholder="1234-5678-9012" value={form.idNumber}
                  onChange={e => setForm({ ...form, idNumber: e.target.value })} />
              </div>
              <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                <label>Address</label>
                <input type="text" placeholder="123, Main Street, City, State, PIN" value={form.address}
                  onChange={e => setForm({ ...form, address: e.target.value })} />
              </div>
              <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                <label>SIM Type (Network)</label>
                <select 
                  value={form.simType} 
                  onChange={e => setForm({ ...form, simType: e.target.value })}
                  style={{ width: '100%', padding: '10px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)', background: 'var(--bg-card)', color: 'var(--text-primary)' }}
                >
                  <option value="">Select Network</option>
                  <option value="Jio">Jio</option>
                  <option value="Airtel">Airtel</option>
                  <option value="Vi">Vi</option>
                  <option value="BSNL">BSNL</option>
                </select>
              </div>
            </div>
            <div className="form-actions">
              <button type="button" className="btn btn-danger btn-sm" onClick={() => setShowForm(false)}>Cancel</button>
              <button type="submit" className="btn btn-success btn-sm" disabled={submitting}>
                {submitting ? 'Registering...' : <><Plus size={15} /> Register</>}
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="card table-card">
        <div className="section-header">
          <h2>Registered Customers ({customers.length})</h2>
          <div style={{ display: 'flex', gap: 10 }}>
            <button className="btn btn-sm" style={{ background: 'rgba(255,255,255,0.05)', color: 'var(--text-secondary)', border: '1px solid var(--border)' }} onClick={fetchCustomers}>
              <RefreshCw size={14} />
            </button>
            <button className="btn btn-success btn-sm" onClick={() => setShowForm(!showForm)}>
              <Plus size={15} /> Add Customer
            </button>
          </div>
        </div>

        {loading ? <div className="spinner" /> : customers.length === 0 ? (
          <div className="empty-state">
            <Users size={48} />
            <p>No customers registered yet. Add your first customer!</p>
          </div>
        ) : (
          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>#</th>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Phone</th>
                  <th>ID Number</th>
                  <th>SIM Type</th>
                  <th>Registered</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {customers.map((c, i) => (
                  <tr key={c.id}>
                    <td style={{ color: 'var(--text-muted)' }}>{i + 1}</td>
                    <td style={{ fontWeight: 600 }}>{c.name}</td>
                    <td style={{ color: '#818cf8' }}>{c.email}</td>
                    <td>{c.phone}</td>
                    <td style={{ fontFamily: 'monospace', fontSize: '0.82rem', color: '#fbbf24' }}>{c.idNumber}</td>
                    <td>
                      <span className="badge" 
                            style={{ 
                              background: 'rgba(255,255,255,0.05)', 
                              color: 'var(--text-primary)',
                              padding: '4px 8px',
                              borderRadius: '4px',
                              fontSize: '0.75rem',
                              border: '1px solid var(--border)'
                            }}>
                        {c.simType || 'N/A'}
                      </span>
                    </td>
                    <td style={{ color: 'var(--text-secondary)', fontSize: '0.82rem' }}>
                      {new Date(c.createdAt).toLocaleDateString()}
                    </td>
                    <td>
                      <button className="btn btn-danger btn-sm" onClick={() => handleDelete(c.id)}>
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
