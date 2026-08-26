import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getAllPlans } from '../services/api';
import {
  Layers,
  Zap,
  Check,
  Sparkles,
  Wifi,
  PhoneCall,
  MessageSquare,
  Gift,
  Search,
  Filter
} from 'lucide-react';
import toast from 'react-hot-toast';

export default function PlansPage() {
  const [plans, setPlans] = useState([]);
  const [operators, setOperators] = useState([]);
  const [selectedOperator, setSelectedOperator] = useState('ALL');
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);

  const navigate = useNavigate();

  useEffect(() => {
    fetchPlans();
  }, [selectedOperator]);

  const fetchPlans = async () => {
    setLoading(true);
    try {
      const params = {};
      if (selectedOperator !== 'ALL') params.operator = selectedOperator;

      const res = await getAllPlans(params);
      if (res.data.success) {
        setPlans(res.data.plans || []);
        if (res.data.operators) setOperators(res.data.operators);
      }
    } catch (err) {
      toast.error('Failed to load telecom subscription plans.');
    } finally {
      setLoading(false);
    }
  };

  const filteredPlans = plans.filter(plan => {
    // Category filter
    if (selectedCategory === '5G' && !plan.is_unlimited_5g) return false;
    if (selectedCategory === 'POPULAR' && !plan.is_popular) return false;
    if (selectedCategory === 'LONG_VALIDITY' && plan.validity_days < 84) return false;

    // Search query
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      return (
        plan.plan_name.toLowerCase().includes(q) ||
        plan.operator.toLowerCase().includes(q) ||
        plan.data_per_day.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const handleSelectPlan = (plan) => {
    navigate('/activate', {
      state: {
        preselectedPlanId: plan.id,
        preselectedOperator: plan.operator,
        plan
      }
    });
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">
            <Layers size={28} color="var(--accent-primary)" />
            Telecom Subscription Plans
          </h1>
          <p className="page-subtitle">
            Browse and compare high-speed 5G plans from top operators for instant digital eSIM provisioning.
          </p>
        </div>
      </div>

      {/* Operator Filter Tabs */}
      <div
        style={{
          display: 'flex',
          gap: '0.6rem',
          flexWrap: 'wrap',
          marginBottom: '1.5rem',
          alignItems: 'center'
        }}
      >
        <button
          onClick={() => setSelectedOperator('ALL')}
          className={`btn btn-sm ${selectedOperator === 'ALL' ? 'btn-primary' : 'btn-secondary'}`}
        >
          All Carriers ({plans.length})
        </button>
        {['Jio', 'Airtel', 'Vi', 'BSNL', 'Demo Telecom'].map(op => (
          <button
            key={op}
            onClick={() => setSelectedOperator(op)}
            className={`btn btn-sm ${selectedOperator === op ? 'btn-primary' : 'btn-secondary'}`}
          >
            {op}
          </button>
        ))}
      </div>

      {/* Search & Category Sub-filter */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: '1rem',
          flexWrap: 'wrap',
          marginBottom: '2rem'
        }}
      >
        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
          <button
            onClick={() => setSelectedCategory('ALL')}
            className={`btn btn-sm ${selectedCategory === 'ALL' ? 'btn-secondary' : ''}`}
            style={{
              background: selectedCategory === 'ALL' ? 'rgba(255,255,255,0.1)' : 'transparent',
              border: '1px solid var(--border-subtle)'
            }}
          >
            All Plans
          </button>
          <button
            onClick={() => setSelectedCategory('5G')}
            className={`btn btn-sm ${selectedCategory === '5G' ? 'btn-secondary' : ''}`}
            style={{
              background: selectedCategory === '5G' ? 'rgba(6, 182, 212, 0.15)' : 'transparent',
              color: selectedCategory === '5G' ? '#67e8f9' : undefined,
              border: '1px solid var(--border-subtle)'
            }}
          >
            ⚡ Unlimited 5G
          </button>
          <button
            onClick={() => setSelectedCategory('POPULAR')}
            className={`btn btn-sm ${selectedCategory === 'POPULAR' ? 'btn-secondary' : ''}`}
            style={{
              background: selectedCategory === 'POPULAR' ? 'rgba(99, 102, 241, 0.15)' : 'transparent',
              color: selectedCategory === 'POPULAR' ? '#a5b4fc' : undefined,
              border: '1px solid var(--border-subtle)'
            }}
          >
            🔥 Best Sellers
          </button>
          <button
            onClick={() => setSelectedCategory('LONG_VALIDITY')}
            className={`btn btn-sm ${selectedCategory === 'LONG_VALIDITY' ? 'btn-secondary' : ''}`}
            style={{
              background: selectedCategory === 'LONG_VALIDITY' ? 'rgba(16, 185, 129, 0.15)' : 'transparent',
              color: selectedCategory === 'LONG_VALIDITY' ? '#6ee7b7' : undefined,
              border: '1px solid var(--border-subtle)'
            }}
          >
            📅 Long Validity (84d+)
          </button>
        </div>

        <div style={{ position: 'relative', width: '280px' }}>
          <Search size={16} color="var(--text-muted)" style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)' }} />
          <input
            type="text"
            className="form-input"
            style={{ paddingLeft: '2.4rem', fontSize: '0.85rem' }}
            placeholder="Search plans or benefits..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {/* Plans Grid */}
      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: '4rem' }}>
          <div className="spinner" style={{ width: 36, height: 36 }} />
        </div>
      ) : filteredPlans.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '3rem 1rem', color: 'var(--text-muted)' }}>
          <Layers size={48} style={{ opacity: 0.4, marginBottom: '0.75rem' }} />
          <div style={{ fontWeight: 600, fontSize: '1.1rem', color: 'var(--text-primary)' }}>No plans matching filters</div>
          <p style={{ fontSize: '0.85rem', marginTop: '0.25rem' }}>
            Try resetting your search query or choosing another operator tab.
          </p>
        </div>
      ) : (
        <div className="grid-3">
          {filteredPlans.map(plan => (
            <div
              key={plan.id}
              className={`card card-glass ${plan.is_popular ? 'card-glow-primary' : ''}`}
              style={{
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                position: 'relative'
              }}
            >
              {plan.is_popular && (
                <div
                  style={{
                    position: 'absolute',
                    top: 14,
                    right: 14,
                    background: 'linear-gradient(135deg, var(--accent-primary), var(--accent-purple))',
                    color: '#fff',
                    fontSize: '0.68rem',
                    fontWeight: 800,
                    padding: '0.2rem 0.6rem',
                    borderRadius: 'var(--radius-full)',
                    letterSpacing: '0.05em',
                    textTransform: 'uppercase',
                    boxShadow: '0 2px 10px rgba(99, 102, 241, 0.4)'
                  }}
                >
                  Popular Choice
                </div>
              )}

              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
                  <span className="badge badge-primary">{plan.operator}</span>
                  {plan.is_unlimited_5g && (
                    <span className="badge badge-cyan" style={{ fontSize: '0.7rem' }}>
                      Unlimited 5G
                    </span>
                  )}
                </div>

                <div style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                  {plan.plan_name}
                </div>

                <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.35rem', margin: '0.75rem 0 1.25rem' }}>
                  <span style={{ fontSize: '2.2rem', fontWeight: 900, color: 'var(--text-primary)', letterSpacing: '-0.03em' }}>
                    ₹{plan.price}
                  </span>
                  <span style={{ color: 'var(--text-muted)', fontSize: '0.9rem', fontWeight: 600 }}>
                    / {plan.validity_days} Days
                  </span>
                </div>

                {/* Benefits List */}
                <div
                  style={{
                    borderTop: '1px solid var(--border-subtle)',
                    paddingTop: '1rem',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '0.65rem',
                    fontSize: '0.85rem'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', color: 'var(--text-primary)' }}>
                    <Wifi size={16} color="var(--accent-cyan)" />
                    <span><strong>{plan.data_per_day}</strong> High-Speed Data</span>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', color: 'var(--text-primary)' }}>
                    <PhoneCall size={16} color="var(--accent-success)" />
                    <span>{plan.calling_benefits}</span>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', color: 'var(--text-secondary)' }}>
                    <MessageSquare size={16} color="var(--accent-primary)" />
                    <span>{plan.sms_allowance}</span>
                  </div>

                  {plan.ott_perks && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', color: '#fcd34d' }}>
                      <Gift size={16} color="var(--accent-warning)" />
                      <span>{plan.ott_perks}</span>
                    </div>
                  )}
                </div>
              </div>

              <div style={{ marginTop: '1.75rem' }}>
                <button
                  onClick={() => handleSelectPlan(plan)}
                  className="btn btn-primary"
                  style={{ width: '100%', justifyContent: 'center' }}
                >
                  <Zap size={15} />
                  <span>Select & Activate eSIM</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
