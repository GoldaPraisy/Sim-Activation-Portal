import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Smartphone, Layers, Zap, HelpCircle, X, ArrowRight, CheckCircle2 } from 'lucide-react';

export default function AppTour() {
  const [isOpen, setIsOpen] = useState(false);
  const [step, setStep] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    // Check if user is logged in AND tour hasn't been completed yet
    const token = localStorage.getItem('esim_token');
    const tourCompleted = localStorage.getItem('esim_tour_completed');
    
    if (token && tourCompleted !== 'true') {
      // Small timeout to let pages load beautifully
      const timer = setTimeout(() => {
        setIsOpen(true);
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, []);

  if (!isOpen) return null;

  const handleNext = () => {
    if (step < 4) {
      setStep(s => s + 1);
      // Automatically redirect to related pages for visual highlight context
      if (step === 0) navigate('/devices');
      if (step === 1) navigate('/plans');
      if (step === 2) navigate('/activate');
      if (step === 3) navigate('/help');
    }
  };

  const handlePrev = () => {
    if (step > 0) {
      setStep(s => s - 1);
      if (step === 1) navigate('/dashboard');
      if (step === 2) navigate('/devices');
      if (step === 3) navigate('/plans');
      if (step === 4) navigate('/activate');
    }
  };

  const handleComplete = () => {
    localStorage.setItem('esim_tour_completed', 'true');
    setIsOpen(false);
    navigate('/dashboard');
  };

  const tourSteps = [
    {
      title: 'Welcome to SIM Activation Portal! 👋',
      description: 'Let\'s take a quick 1-minute walk-through of the interface. This will preview how you register devices and activate your network plans.',
      icon: <Zap size={42} color="var(--accent-primary)" />
    },
    {
      title: 'Step 1: Register Your Devices 📱',
      description: 'Go here to register your smartphone. For eSIM, input your unique 32-digit EID. For physical SIM, just specify the device model.',
      icon: <Smartphone size={42} color="var(--accent-cyan)" />
    },
    {
      title: 'Step 2: Choose Your Plan 📊',
      description: 'Browse, compare and pick high-speed 5G plans from top operators like Jio, Airtel, Vi, and BSNL.',
      icon: <Layers size={42} color="var(--accent-primary)" />
    },
    {
      title: 'Step 3: Activate Your SIM Card ⚡',
      description: 'Open the Activation Wizard, choose eSIM or Physical SIM, verify your mobile number via OTP, checkout, and launch connection!',
      icon: <Zap size={42} color="var(--accent-success)" />
    },
    {
      title: 'Step 4: Help Center & FAQs ❓',
      description: 'Got stuck or need to look up how to check your EID or IMEI numbers? The Help Center covers all FAQs and setup instructions.',
      icon: <HelpCircle size={42} color="var(--accent-warning)" />
    }
  ];

  const currentTour = tourSteps[step];

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(5, 8, 15, 0.85)',
        backdropFilter: 'blur(8px)',
        zIndex: 9999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '1rem'
      }}
    >
      <div
        className="card card-glass card-glow-primary animate-fade-in"
        style={{
          maxWidth: '480px',
          width: '100%',
          padding: '2rem',
          position: 'relative',
          border: '1px solid rgba(255, 255, 255, 0.12)'
        }}
      >
        {/* Skip Icon */}
        <button
          onClick={handleComplete}
          style={{
            position: 'absolute',
            top: 20,
            right: 20,
            background: 'none',
            border: 'none',
            color: 'var(--text-muted)',
            cursor: 'pointer'
          }}
          title="Skip Tour"
        >
          <X size={20} />
        </button>

        {/* Tour Graphic/Icon */}
        <div
          style={{
            width: 80,
            height: 80,
            borderRadius: '50%',
            background: 'var(--bg-surface)',
            border: '1px solid var(--border-subtle)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 1.5rem'
          }}
        >
          {currentTour.icon}
        </div>

        {/* Tour Content */}
        <div style={{ textAlign: 'center' }}>
          <h3 style={{ fontSize: '1.4rem', fontWeight: 800, marginBottom: '0.75rem', color: '#fff' }}>
            {currentTour.title}
          </h3>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.92rem', lineHeight: 1.6, marginBottom: '2rem' }}>
            {currentTour.description}
          </p>
        </div>

        {/* Stepper Dots Indicator */}
        <div style={{ display: 'flex', justifyContent: 'center', gap: '0.5rem', marginBottom: '2rem' }}>
          {tourSteps.map((_, idx) => (
            <div
              key={idx}
              style={{
                width: idx === step ? 24 : 8,
                height: 8,
                borderRadius: 'var(--radius-full)',
                background: idx === step ? 'var(--accent-primary)' : 'rgba(255,255,255,0.15)',
                transition: 'all 0.3s ease'
              }}
            />
          ))}
        </div>

        {/* Action Controls */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          {step > 0 ? (
            <button onClick={handlePrev} className="btn btn-secondary btn-sm" style={{ padding: '0.5rem 1rem' }}>
              Back
            </button>
          ) : (
            <button onClick={handleComplete} className="btn btn-secondary btn-sm" style={{ padding: '0.5rem 1rem', border: 'none' }}>
              Skip Tour
            </button>
          )}

          {step < 4 ? (
            <button onClick={handleNext} className="btn btn-primary btn-sm" style={{ padding: '0.5rem 1.1rem' }}>
              <span>Next</span>
              <ArrowRight size={14} />
            </button>
          ) : (
            <button onClick={handleComplete} className="btn btn-cyan btn-sm" style={{ padding: '0.5rem 1.1rem' }}>
              <CheckCircle2 size={14} />
              <span>Complete Tour</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
