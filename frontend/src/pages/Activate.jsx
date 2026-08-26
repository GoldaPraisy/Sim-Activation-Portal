import { useEffect, useState } from 'react';
import { Zap, CheckCircle, CreditCard, Lock, Smartphone } from 'lucide-react';
import toast from 'react-hot-toast';
import { getPlansByNetwork, publicActivate, getAllCustomers } from '../services/api';

const NETWORKS = ['Jio', 'Airtel', 'Vi', 'BSNL'];

export default function Activate() {
  const [form, setForm] = useState({ customerId: '', phone: '', network: '', plan: '' });
  const [plans, setPlans] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [loadingPlans, setLoadingPlans] = useState(false);
  const [loadingCustomers, setLoadingCustomers] = useState(true);
  
  const [showPayment, setShowPayment] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(null);
  
  useEffect(() => {
    getAllCustomers()
      .then(res => setCustomers(res.data))
      .catch(() => toast.error('Failed to load customers'))
      .finally(() => setLoadingCustomers(false));
  }, []);

  // Fetch plans when network changes
  useEffect(() => {
    if (form.network) {
      setLoadingPlans(true);
      getPlansByNetwork(form.network)
        .then(res => setPlans(res.data))
        .catch(() => toast.error('Failed to load plans for ' + form.network))
        .finally(() => setLoadingPlans(false));
      setForm(f => ({ ...f, plan: '' })); // reset plan
    } else {
      setPlans([]);
    }
  }, [form.network]);

  const handleProceedToPayment = (e) => {
    e.preventDefault();
    if (!form.customerId) {
      toast.error('Please select a customer'); return;
    }
    if (!form.plan) {
      toast.error('Select a plan'); return;
    }
    setShowPayment(true);
  };

  const handlePayment = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    // Simulate payment delay
    setTimeout(async () => {
      try {
        const selectedPlan = plans.find(p => p.id === form.plan);
        const res = await publicActivate({
          msisdn: form.phone,
          network: form.network,
          plan: `₹${selectedPlan.price} - ${selectedPlan.benefits}`,
        });
        setSuccess(res.data);
        toast.success('Payment Successful! SIM activated.');
        setShowPayment(false);
      } catch (err) {
        toast.error(err.response?.data?.message || 'Activation failed');
      } finally {
        setSubmitting(false);
      }
    }, 1500);
  };

  if (success) {
    return (
      <div>
        <div className="page-header">
          <h1>Activation Complete</h1>
          <p>Your plan is now active.</p>
        </div>
        <div className="card" style={{ border: '1px solid var(--accent-success)', background: 'rgba(16,185,129,0.07)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <CheckCircle size={48} color="var(--accent-success)" />
            <div>
              <div style={{ fontWeight: 800, color: 'var(--accent-success)', fontSize: '1.2rem', marginBottom: 4 }}>Payment & Activation Successful!</div>
              <div style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>
                Phone Number: <strong style={{ color: 'var(--text-primary)' }}>{form.phone}</strong><br/>
                Network: <strong style={{ color: 'var(--accent-primary)' }}>{form.network}</strong><br/>
                Activated Plan: <strong style={{ color: 'var(--text-primary)' }}>{success.plan}</strong>
              </div>
            </div>
          </div>
          <button className="btn btn-primary" style={{ marginTop: 24 }} onClick={() => {
            setSuccess(null);
            setForm({ phone: '', network: '', plan: '' });
          }}>Activate Another SIM</button>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="page-header">
        <h1>Activate Your SIM</h1>
        <p>Enter your phone number, select your network, and choose a plan to recharge or activate.</p>
      </div>

      <div className="card" style={{ maxWidth: 700, margin: '0 auto' }}>
        {!showPayment ? (
          <form onSubmit={handleProceedToPayment}>
            <div className="form-group" style={{ marginBottom: 20 }}>
              <label>Select Customer</label>
              <div style={{ display: 'flex', alignItems: 'center', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)', padding: '0 14px' }}>
                <Smartphone size={18} color="var(--text-secondary)" />
                <select 
                  value={form.customerId} 
                  onChange={e => {
                    const cust = customers.find(c => c.id === parseInt(e.target.value));
                    if (cust) {
                      setForm({ 
                        ...form, 
                        customerId: cust.id, 
                        phone: cust.phone, 
                        network: cust.simType 
                      });
                    } else {
                      setForm({ ...form, customerId: '', phone: '', network: '', plan: '' });
                    }
                  }}
                  style={{ border: 'none', background: 'transparent', boxShadow: 'none', width: '100%', padding: '12px 0', color: 'var(--text-primary)' }}
                >
                  <option value="">Choose a registered customer...</option>
                  {customers.map(c => (
                    <option key={c.id} value={c.id}>{c.name} ({c.phone}) - {c.simType}</option>
                  ))}
                </select>
              </div>
              {form.phone && (
                <div style={{ marginTop: 8, fontSize: '0.85rem', color: 'var(--accent-primary)', fontWeight: 500 }}>
                  Network: {form.network} | Phone: {form.phone}
                </div>
              )}
            </div>

            {form.network && (
              <div className="form-group" style={{ marginBottom: 24 }}>
                <label>Network</label>
                <div style={{ 
                  padding: '12px', textAlign: 'center', borderRadius: 'var(--radius-sm)', 
                  border: `2px solid var(--accent-primary)`,
                  background: 'rgba(156, 39, 176, 0.2)',
                  color: 'var(--accent-primary)',
                  fontWeight: 600
                }}>
                  {form.network}
                </div>
              </div>
            )}

            {form.network && (
              <div style={{ marginBottom: 24 }}>
                <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Available Plans for {form.network}</label>
                {loadingPlans ? <div className="spinner" style={{ margin: '20px auto', width: 30, height: 30 }} /> : (
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 12, marginTop: 10 }}>
                    {plans.map(plan => (
                      <div key={plan.id} onClick={() => setForm({ ...form, plan: plan.id })}
                        style={{
                          padding: '16px', borderRadius: 'var(--radius-md)', cursor: 'pointer', transition: 'all 0.2s', display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                          border: `2px solid ${form.plan === plan.id ? 'var(--accent-primary)' : 'var(--border)'}`,
                          background: form.plan === plan.id ? 'rgba(156, 39, 176, 0.2)' : 'rgba(255,255,255,0.03)',
                        }}>
                        <div>
                          <div style={{ fontWeight: 800, fontSize: '1.2rem', color: form.plan === plan.id ? 'var(--accent-primary)' : 'var(--text-primary)', marginBottom: 4 }}>₹{plan.price}</div>
                          <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>{plan.benefits}</div>
                        </div>
                        <div style={{ textAlign: 'right' }}>
                          <span className="badge badge-activated">{plan.validity}</span>
                        </div>
                      </div>
                    ))}
                    {plans.length === 0 && <span style={{ color: 'var(--accent-danger)', fontSize: '0.9rem' }}>No plans found for {form.network}.</span>}
                  </div>
                )}
              </div>
            )}

            <div className="form-actions" style={{ marginTop: 24 }}>
              <button type="submit" className="btn btn-primary" style={{ width: '100%', justifyContent: 'center', padding: '14px' }} disabled={!form.customerId || !form.plan}>
                Proceed to Payment
              </button>
            </div>
          </form>
        ) : (
          <form onSubmit={handlePayment}>
            <div style={{ textAlign: 'center', marginBottom: 24 }}>
              <div style={{ display: 'inline-flex', padding: 16, background: 'var(--bg-card-hover)', borderRadius: '50%', marginBottom: 12 }}>
                <CreditCard size={32} color="var(--accent-primary)" />
              </div>
              <h2 style={{ fontSize: '1.4rem', marginBottom: 8 }}>Secure Payment</h2>
              <p style={{ color: 'var(--text-secondary)' }}>You are paying <strong>₹{plans.find(p => p.id === form.plan)?.price}</strong> for {form.network} recharge.</p>
            </div>

            <div className="form-group" style={{ marginBottom: 16 }}>
              <label>Card Number</label>
              <input type="text" placeholder="0000 0000 0000 0000" maxLength={19} required />
            </div>
            
            <div className="form-grid" style={{ marginBottom: 24 }}>
              <div className="form-group">
                <label>Expiry Date</label>
                <input type="text" placeholder="MM/YY" maxLength={5} required />
              </div>
              <div className="form-group">
                <label>CVV</label>
                <input type="password" placeholder="123" maxLength={3} required />
              </div>
            </div>

            <div style={{ display: 'flex', gap: 12 }}>
              <button type="button" className="btn btn-danger" style={{ flex: 1, justifyContent: 'center' }} onClick={() => setShowPayment(false)} disabled={submitting}>
                Back
              </button>
              <button type="submit" className="btn btn-success" style={{ flex: 2, justifyContent: 'center' }} disabled={submitting}>
                {submitting ? 'Processing...' : <><Lock size={16} /> Pay & Activate</>}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
