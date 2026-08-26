import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  Zap,
  Smartphone,
  QrCode,
  ShieldCheck,
  Radio,
  ArrowRight,
  Sparkles,
  Layers,
  Cpu,
  CheckCircle2,
  Lock
} from 'lucide-react';

export default function LandingPage() {
  const { isAuthenticated } = useAuth();

  const features = [
    {
      icon: Cpu,
      title: 'GSMA SM-DP+ Simulation',
      desc: 'Simulate remote eSIM profile generation and provisioning with standard LPA:1$ syntax in real-time.'
    },
    {
      icon: Smartphone,
      title: '32-Digit EID Verification',
      desc: 'Strict format checking and validation for eUICC identifiers across Apple iOS and Android hardware.'
    },
    {
      icon: ShieldCheck,
      title: 'Simulated 6-Digit OTP',
      desc: 'Test carrier mobile verification with countdown timers, rate limiting, and instant test code inspection.'
    },
    {
      icon: QrCode,
      title: 'Instant QR Code Generation',
      desc: 'Generate high-resolution carrier QR codes containing mock LPA activation profiles with 1-click download.'
    }
  ];

  const operators = [
    { name: 'Jio 5G', color: '#0057ff', badge: 'True 5G SA' },
    { name: 'Airtel 5G Plus', color: '#e50914', badge: 'Non-Standalone' },
    { name: 'Vi GIGAnet', color: '#ffc107', badge: 'Hero Unlimited' },
    { name: 'BSNL 4G/5G', color: '#008080', badge: 'National' },
    { name: 'Demo Telecom', color: '#8b5cf6', badge: 'Sandbox Ready' }
  ];

  return (
    <div style={{ paddingBottom: '4rem' }}>
      {/* Hero Section */}
      <section
        style={{
          textAlign: 'center',
          padding: '4rem 1.5rem 3rem',
          maxWidth: '900px',
          margin: '0 auto',
          position: 'relative'
        }}
      >
        <div
          className="badge badge-primary"
          style={{
            marginBottom: '1.5rem',
            padding: '0.4rem 1rem',
            fontSize: '0.85rem',
            boxShadow: '0 0 20px rgba(99, 102, 241, 0.3)'
          }}
        >
          <Sparkles size={14} color="#818cf8" />
          <span>Next-Gen Telecom eSIM Provisioning Platform</span>
        </div>

        <h1
          style={{
            fontSize: 'clamp(2.4rem, 5vw, 3.8rem)',
            lineHeight: 1.15,
            fontWeight: 900,
            marginBottom: '1.5rem',
            letterSpacing: '-0.03em'
          }}
        >
          Activate & Manage <br />
          <span
            style={{
              background: 'linear-gradient(135deg, #818cf8 0%, #38bdf8 50%, #c084fc 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent'
            }}
          >
            Digital eSIM Profiles
          </span>{' '}
          Instantly
        </h1>

        <p
          style={{
            fontSize: 'clamp(1rem, 2vw, 1.2rem)',
            color: 'var(--text-secondary)',
            marginBottom: '2.5rem',
            lineHeight: 1.6
          }}
        >
          A full-stack eSIM activation sandbox simulating real-world carrier workflows: 32-digit EID validation, simulated mobile OTP, mock payment gateway, GSMA SM-DP+ profile generation, and interactive QR code installation.
        </p>

        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
          <Link
            to={isAuthenticated ? '/activate' : '/register'}
            className="btn btn-primary btn-lg"
            style={{ boxShadow: '0 0 25px rgba(99, 102, 241, 0.4)' }}
          >
            <Zap size={18} />
            <span>Launch eSIM Activation Flow</span>
            <ArrowRight size={16} />
          </Link>

          <Link to="/plans" className="btn btn-secondary btn-lg">
            <Layers size={18} />
            <span>Explore Telecom Plans</span>
          </Link>
        </div>

        {/* Operator Badges Carousel */}
        <div
          style={{
            marginTop: '3.5rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '1rem',
            flexWrap: 'wrap'
          }}
        >
          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Simulated Carrier Integrations:
          </span>
          {operators.map((op, i) => (
            <div
              key={i}
              style={{
                background: 'var(--bg-surface)',
                border: '1px solid var(--border-subtle)',
                padding: '0.4rem 0.85rem',
                borderRadius: 'var(--radius-full)',
                display: 'flex',
                alignItems: 'center',
                gap: '0.45rem',
                fontSize: '0.82rem',
                fontWeight: 600
              }}
            >
              <div style={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: op.color }} />
              <span>{op.name}</span>
            </div>
          ))}
        </div>
      </section>

      {/* Feature Grid */}
      <section style={{ maxWidth: '1200px', margin: '3rem auto 0', padding: '0 1rem' }}>
        <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
          <h2 style={{ fontSize: '2rem', fontWeight: 800 }}>Complete Lifecycle Engine</h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>
            Engineered to replicate actual telecom core network behavior.
          </p>
        </div>

        <div className="grid-4">
          {features.map((feat, idx) => {
            const Icon = feat.icon;
            return (
              <div key={idx} className="card card-glass">
                <div
                  style={{
                    width: 44,
                    height: 44,
                    borderRadius: 'var(--radius-md)',
                    background: 'rgba(99, 102, 241, 0.15)',
                    border: '1px solid rgba(99, 102, 241, 0.3)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'var(--accent-primary)',
                    marginBottom: '1rem'
                  }}
                >
                  <Icon size={22} />
                </div>
                <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '0.5rem' }}>{feat.title}</h3>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', lineHeight: 1.5 }}>
                  {feat.desc}
                </p>
              </div>
            );
          })}
        </div>
      </section>

      {/* Step by step flow preview */}
      <section
        style={{
          maxWidth: '1000px',
          margin: '5rem auto 0',
          background: 'var(--bg-card)',
          border: '1px solid var(--border-subtle)',
          borderRadius: 'var(--radius-lg)',
          padding: '2.5rem',
          textAlign: 'center'
        }}
      >
        <div className="badge badge-cyan" style={{ marginBottom: '1rem' }}>
          End-to-End Workflow
        </div>
        <h2 style={{ fontSize: '1.8rem', fontWeight: 800, marginBottom: '1.5rem' }}>
          From Device EID to Live eSIM in Minutes
        </h2>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))',
            gap: '1rem',
            textAlign: 'center',
            marginTop: '2rem'
          }}
        >
          {[
            '1. Register EID',
            '2. Select Plan',
            '3. OTP Check',
            '4. Mock Payment',
            '5. SM-DP+ Provision',
            '6. QR Code Scan',
            '7. Active Line'
          ].map((text, i) => (
            <div
              key={i}
              style={{
                background: 'var(--bg-surface)',
                border: '1px solid var(--border-subtle)',
                padding: '1rem 0.5rem',
                borderRadius: 'var(--radius-md)',
                fontSize: '0.82rem',
                fontWeight: 600,
                color: 'var(--text-primary)'
              }}
            >
              <div style={{ color: 'var(--accent-cyan)', fontSize: '0.75rem', marginBottom: '0.2rem' }}>STEP 0{i + 1}</div>
              {text.slice(3)}
            </div>
          ))}
        </div>

        <div style={{ marginTop: '2.5rem' }}>
          <Link to="/activate" className="btn btn-cyan btn-lg">
            <span>Start Simulated Activation Demo</span>
            <ArrowRight size={16} />
          </Link>
        </div>
      </section>
    </div>
  );
}
