import { useState, useEffect } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  getMyDevices,
  getAllPlans,
  sendOtp,
  verifyOtp,
  calculateCheckout,
  createEsimRequest,
  updateDemoStatus,
  validateEID
} from '../services/api';
import confetti from 'canvas-confetti';
import toast from 'react-hot-toast';

import {
  Smartphone,
  Layers,
  ShieldCheck,
  CreditCard,
  QrCode,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  ArrowLeft,
  Sparkles,
  RefreshCw,
  Copy,
  Clock,
  Radio,
  Download,
  Zap
} from 'lucide-react';

import QRCodeViewer from '../components/QRCodeViewer';
import InstallationGuide from '../components/InstallationGuide';
import PaymentModal from '../components/PaymentModal';
import StatusTimeline from '../components/StatusTimeline';

export default function ActivationWizard() {
  const { user } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  // Step Management: 1: Device/EID, 2: Operator & Plan, 3: Mobile & OTP, 4: Provisioning & QR, 5: Live Status
  const [currentStep, setCurrentStep] = useState(1);

  // Data State
  const [devices, setDevices] = useState([]);
  const [plans, setPlans] = useState([]);
  const [loadingInitial, setLoadingInitial] = useState(true);

  // Form Selections
  const [selectedDeviceId, setSelectedDeviceId] = useState('');
  const [manualEid, setManualEid] = useState('');
  const [deviceName, setDeviceName] = useState('iPhone 15 Pro');
  const [deviceType, setDeviceType] = useState('iPhone');
  const [os, setOs] = useState('iOS 17.5');

  const [selectedOperator, setSelectedOperator] = useState(location.state?.preselectedOperator || 'Jio');
  const [selectedPlanId, setSelectedPlanId] = useState(location.state?.preselectedPlanId || '');

  // OTP State
  const [mobileNumber, setMobileNumber] = useState(user?.phone || '9876543210');
  const [otpCode, setOtpCode] = useState('');
  const [devOtp, setDevOtp] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [otpVerified, setOtpVerified] = useState(false);
  const [timerSeconds, setTimerSeconds] = useState(60);
  const [otpLoading, setOtpLoading] = useState(false);

  // Payment Modal State
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [paymentRecord, setPaymentRecord] = useState(null);

  // Provisioning & Result State
  const [isProvisioning, setIsProvisioning] = useState(false);
  const [provisionedData, setProvisionedData] = useState(null);
  const [activationStatus, setActivationStatus] = useState('REQUEST_CREATED');

  // Load Devices and Plans on Mount
  useEffect(() => {
    const loadData = async () => {
      try {
        const [devRes, planRes] = await Promise.all([
          getMyDevices(),
          getAllPlans()
        ]);

        if (devRes.data.success && devRes.data.devices.length > 0) {
          setDevices(devRes.data.devices);
          // Preselect first device if available
          const preDev = location.state?.preselectedDeviceId;
          if (preDev) {
            setSelectedDeviceId(preDev);
          } else {
            setSelectedDeviceId(devRes.data.devices[0].id);
          }
        }

        if (planRes.data.success) {
          setPlans(planRes.data.plans || []);
          if (!selectedPlanId && planRes.data.plans.length > 0) {
            setSelectedPlanId(planRes.data.plans[0].id);
          }
        }
      } catch (err) {
        console.error('Failed to load initial activation data:', err);
      } finally {
        setLoadingInitial(false);
      }
    };

    loadData();
  }, []);

  // OTP Countdown Timer
  useEffect(() => {
    let interval = null;
    if (otpSent && timerSeconds > 0) {
      interval = setInterval(() => {
        setTimerSeconds(s => s - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [otpSent, timerSeconds]);

  // Selected Plan Object
  const currentPlan = plans.find(p => p.id === selectedPlanId);

  // Filter plans for the chosen operator
  const operatorPlans = plans.filter(p => p.operator.toLowerCase() === selectedOperator.toLowerCase());

  // --- Step 1: Device & EID validation ---
  const handleProceedFromStep1 = () => {
    if (selectedDeviceId === 'manual') {
      const check = validateEID(manualEid);
      if (!check.isValid) {
        toast.error(check.error);
        return;
      }
    } else if (!selectedDeviceId && devices.length === 0) {
      const check = validateEID(manualEid);
      if (!check.isValid) {
        toast.error('Please enter a valid 32-digit EID or select a registered device.');
        return;
      }
    }
    setCurrentStep(2);
  };

  // --- Step 2: Operator & Plan Selection ---
  const handleProceedFromStep2 = () => {
    if (!selectedPlanId) {
      toast.error('Please select a telecom plan.');
      return;
    }
    setCurrentStep(3);
  };

  // --- Step 3: Request Simulated OTP ---
  const handleSendOtp = async () => {
    if (!mobileNumber || mobileNumber.length < 10) {
      toast.error('Please enter a valid 10-digit mobile number.');
      return;
    }

    setOtpLoading(true);
    try {
      const res = await sendOtp(mobileNumber);
      if (res.data.success) {
        setOtpSent(true);
        setTimerSeconds(60);
        if (res.data.devOtp) {
          setDevOtp(res.data.devOtp);
        }
        toast.success(res.data.message || 'Simulated OTP dispatched.');
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to send OTP.');
    } finally {
      setOtpLoading(false);
    }
  };

  // Verify OTP
  const handleVerifyOtp = async () => {
    if (!otpCode || otpCode.length !== 6) {
      toast.error('Please enter the 6-digit OTP code.');
      return;
    }

    setOtpLoading(true);
    try {
      const res = await verifyOtp(mobileNumber, otpCode);
      if (res.data.success) {
        setOtpVerified(true);
        toast.success('Mobile verification successful!');
        // Open Payment Modal immediately
        setIsPaymentModalOpen(true);
      }
    } catch (err) {
      toast.error(err.response?.data?.error || 'Invalid OTP code. Please retry.');
    } finally {
      setOtpLoading(false);
    }
  };

  // --- Step 4: Payment Callback & SM-DP+ Profile Provisioning ---
  const handlePaymentSuccess = async (payment) => {
    setPaymentRecord(payment);
    setIsPaymentModalOpen(false);
    setCurrentStep(4);
    setIsProvisioning(true);

    // Resolve target EID
    let targetEid = manualEid;
    let targetDeviceName = deviceName;
    if (selectedDeviceId && selectedDeviceId !== 'manual') {
      const dev = devices.find(d => d.id === selectedDeviceId);
      if (dev) {
        targetEid = dev.eid;
        targetDeviceName = dev.device_name;
      }
    }

    // Call Mock SM-DP+ Provisioning API
    try {
      const payload = {
        eid: targetEid || '89049032000000000000000000001001',
        device: targetDeviceName,
        planId: selectedPlanId,
        operator: selectedOperator,
        msisdn: mobileNumber,
        paymentId: payment.id
      };

      const res = await createEsimRequest(payload);
      if (res.data.success) {
        setProvisionedData(res.data);
        setActivationStatus('PROFILE_READY');
        toast.success('Mock eSIM Profile provisioned successfully!');

        // Trigger celebratory confetti
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 }
        });
      }
    } catch (err) {
      console.error('Provisioning failure:', err);
      toast.error('Carrier provisioning simulation error.');
    } finally {
      setIsProvisioning(false);
    }
  };

  // Fast-Forward / Demo Status Transition
  const handleSimulateStatus = async (nextStatus) => {
    if (!provisionedData?.requestId) return;
    try {
      const res = await updateDemoStatus(
        provisionedData.requestId,
        nextStatus,
        `Demo interactive update: ${nextStatus}`
      );
      if (res.data.success) {
        setActivationStatus(nextStatus);
        toast.success(`eSIM Status updated to: ${nextStatus}`);
        if (nextStatus === 'ACTIVATED') {
          confetti({
            particleCount: 120,
            spread: 90,
            origin: { y: 0.5 }
          });
        }
      }
    } catch (err) {
      toast.error('Failed to change status.');
    }
  };

  if (loadingInitial) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
        <div className="spinner" style={{ width: 40, height: 40 }} />
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
      {/* Wizard Header */}
      <div className="page-header" style={{ marginBottom: '1.5rem' }}>
        <div>
          <h1 className="page-title">
            <Zap size={28} color="var(--accent-primary)" />
            eSIM Activation Lifecycle Wizard
          </h1>
          <p className="page-subtitle">
            Simulate the end-to-end GSMA carrier eSIM provisioning workflow.
          </p>
        </div>
      </div>

      {/* Stepper Progress Bar */}
      <div className="card card-glass" style={{ padding: '1rem 1.75rem', marginBottom: '2rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.75rem' }}>
          {[
            { num: 1, label: 'Device & EID' },
            { num: 2, label: 'Operator & Plan' },
            { num: 3, label: 'Mobile & OTP' },
            { num: 4, label: 'eSIM Profile & QR' }
          ].map(s => (
            <div
              key={s.num}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                opacity: currentStep >= s.num ? 1 : 0.45
              }}
            >
              <div
                style={{
                  width: 28,
                  height: 28,
                  borderRadius: '50%',
                  background: currentStep >= s.num ? 'linear-gradient(135deg, var(--accent-primary), #06b6d4)' : 'var(--bg-surface)',
                  color: '#fff',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 800,
                  fontSize: '0.8rem'
                }}
              >
                {currentStep > s.num ? <CheckCircle2 size={16} /> : s.num}
              </div>
              <span style={{ fontSize: '0.88rem', fontWeight: currentStep === s.num ? 700 : 500, color: 'var(--text-primary)' }}>
                {s.label}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* STEP 1: Device & EID Selection */}
      {currentStep === 1 && (
        <div className="card card-glass">
          <h2 style={{ fontSize: '1.35rem', fontWeight: 800, marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Smartphone size={22} color="var(--accent-cyan)" />
            Step 1: Select or Register eSIM Device
          </h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '1.75rem' }}>
            Choose an existing registered device or input a 32-digit EID to provision the profile for.
          </p>

          {devices.length > 0 && (
            <div style={{ marginBottom: '1.75rem' }}>
              <label className="form-label">Select from Your Registered Devices</label>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1rem' }}>
                {devices.map(dev => (
                  <div
                    key={dev.id}
                    onClick={() => {
                      setSelectedDeviceId(dev.id);
                      setManualEid('');
                    }}
                    style={{
                      background: selectedDeviceId === dev.id ? 'rgba(99, 102, 241, 0.12)' : 'var(--bg-surface)',
                      border: selectedDeviceId === dev.id ? '2px solid var(--accent-primary)' : '1px solid var(--border-subtle)',
                      borderRadius: 'var(--radius-md)',
                      padding: '1.1rem',
                      cursor: 'pointer',
                      transition: 'all var(--transition-fast)'
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.35rem' }}>
                      <span style={{ fontWeight: 700, color: 'var(--text-primary)' }}>{dev.device_name}</span>
                      <span className="badge badge-cyan">{dev.device_type}</span>
                    </div>
                    <div style={{ fontSize: '0.78rem', fontFamily: 'var(--font-mono)', color: 'var(--text-secondary)' }}>
                      EID: {dev.eid.match(/.{1,4}/g)?.join(' ') || dev.eid}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Or Manual EID Entry */}
          <div style={{ borderTop: devices.length > 0 ? '1px solid var(--border-subtle)' : 'none', paddingTop: devices.length > 0 ? '1.5rem' : 0 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
              <label className="form-label" style={{ marginBottom: 0 }}>
                {devices.length > 0 ? 'Or Enter EID Manually' : 'Enter 32-Digit Device EID'}
              </label>
              <button
                type="button"
                onClick={() => {
                  setSelectedDeviceId('manual');
                  setManualEid('89049032000000000000000000001001');
                }}
                className="btn btn-secondary btn-sm"
                style={{ fontSize: '0.75rem', padding: '0.2rem 0.5rem' }}
              >
                Autofill Test EID (starts with 89)
              </button>
            </div>

            <div className="form-group">
              <input
                type="text"
                className="form-input"
                style={{ fontFamily: 'var(--font-mono)', fontSize: '0.9rem' }}
                value={manualEid}
                onChange={(e) => {
                  setSelectedDeviceId('manual');
                  setManualEid(e.target.value);
                }}
                placeholder="89049032000000000000000000001001"
                maxLength={36}
              />
              <div className="form-hint">
                Must be exactly 32 hexadecimal/numeric digits as printed on device box or in Settings → About.
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '2rem' }}>
            <button onClick={handleProceedFromStep1} className="btn btn-primary btn-lg">
              <span>Next: Choose Operator & Plan</span>
              <ArrowRight size={18} />
            </button>
          </div>
        </div>
      )}

      {/* STEP 2: Telecom Operator & Plan Selection */}
      {currentStep === 2 && (
        <div className="card card-glass">
          <h2 style={{ fontSize: '1.35rem', fontWeight: 800, marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Layers size={22} color="var(--accent-primary)" />
            Step 2: Select Telecom Operator & Plan
          </h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '1.75rem' }}>
            Pick your preferred carrier network and high-speed data subscription.
          </p>

          {/* Operator Badges */}
          <div style={{ marginBottom: '1.75rem' }}>
            <label className="form-label">Select Telecom Operator</label>
            <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
              {['Jio', 'Airtel', 'Vi', 'BSNL', 'Demo Telecom'].map(op => (
                <button
                  key={op}
                  type="button"
                  onClick={() => {
                    setSelectedOperator(op);
                    const matching = plans.filter(p => p.operator.toLowerCase() === op.toLowerCase());
                    if (matching.length > 0) setSelectedPlanId(matching[0].id);
                  }}
                  className={`btn ${selectedOperator === op ? 'btn-primary' : 'btn-secondary'}`}
                  style={{ borderRadius: 'var(--radius-md)', padding: '0.75rem 1.25rem' }}
                >
                  <Radio size={16} />
                  <span>{op}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Available Plans for Operator */}
          <div>
            <label className="form-label">Available Plans for {selectedOperator}</label>
            <div className="grid-3" style={{ marginTop: '0.5rem' }}>
              {operatorPlans.map(p => (
                <div
                  key={p.id}
                  onClick={() => setSelectedPlanId(p.id)}
                  style={{
                    background: selectedPlanId === p.id ? 'rgba(99, 102, 241, 0.14)' : 'var(--bg-surface)',
                    border: selectedPlanId === p.id ? '2px solid var(--accent-primary)' : '1px solid var(--border-subtle)',
                    borderRadius: 'var(--radius-md)',
                    padding: '1.25rem',
                    cursor: 'pointer',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    transition: 'all var(--transition-fast)'
                  }}
                >
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontWeight: 700, color: 'var(--text-primary)' }}>{p.plan_name}</span>
                      <span className="badge badge-primary">{p.validity_days}d</span>
                    </div>

                    <div style={{ fontSize: '1.6rem', fontWeight: 900, color: 'var(--text-primary)', margin: '0.5rem 0' }}>
                      ₹{p.price}
                    </div>

                    <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                      • {p.data_per_day}<br />
                      • {p.calling_benefits}<br />
                      • {p.sms_allowance}
                    </div>
                  </div>

                  <div style={{ marginTop: '1rem', textAlign: 'right' }}>
                    <span style={{ fontSize: '0.8rem', fontWeight: 700, color: selectedPlanId === p.id ? 'var(--accent-cyan)' : 'var(--text-muted)' }}>
                      {selectedPlanId === p.id ? '✓ Selected' : 'Click to Select'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '2.5rem' }}>
            <button onClick={() => setCurrentStep(1)} className="btn btn-secondary">
              <ArrowLeft size={16} />
              <span>Back</span>
            </button>
            <button onClick={handleProceedFromStep2} className="btn btn-primary btn-lg">
              <span>Next: Verify Mobile OTP</span>
              <ArrowRight size={18} />
            </button>
          </div>
        </div>
      )}

      {/* STEP 3: Mobile Verification & Simulated OTP */}
      {currentStep === 3 && (
        <div className="card card-glass" style={{ maxWidth: '560px', margin: '0 auto' }}>
          <h2 style={{ fontSize: '1.35rem', fontWeight: 800, marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <ShieldCheck size={22} color="var(--accent-success)" />
            Step 3: Mobile Number Verification
          </h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '1.5rem' }}>
            Verify your mobile identity via simulated telecom OTP security.
          </p>

          {/* Selected Plan Snapshot */}
          {currentPlan && (
            <div
              style={{
                background: 'var(--bg-surface)',
                border: '1px solid var(--border-subtle)',
                borderRadius: 'var(--radius-md)',
                padding: '1rem',
                marginBottom: '1.5rem',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}
            >
              <div>
                <div style={{ fontWeight: 700 }}>{currentPlan.plan_name} ({currentPlan.operator})</div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                  {currentPlan.data_per_day} • {currentPlan.validity_days} Days
                </div>
              </div>
              <div style={{ fontSize: '1.3rem', fontWeight: 800, color: '#38bdf8' }}>
                ₹{currentPlan.price}
              </div>
            </div>
          )}

          <div className="form-group">
            <label className="form-label">Subscriber Mobile Number</label>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <input
                type="tel"
                className="form-input"
                value={mobileNumber}
                onChange={(e) => setMobileNumber(e.target.value)}
                placeholder="9876543210"
                disabled={otpSent && otpVerified}
                required
              />
              <button
                type="button"
                onClick={handleSendOtp}
                disabled={otpLoading || (otpSent && timerSeconds > 0)}
                className="btn btn-secondary"
                style={{ flexShrink: 0 }}
              >
                {otpSent ? (timerSeconds > 0 ? `Resend (${timerSeconds}s)` : 'Resend OTP') : 'Send OTP'}
              </button>
            </div>
          </div>

          {/* Dev Mode OTP Helper Box */}
          {devOtp && !otpVerified && (
            <div
              style={{
                background: 'rgba(6, 182, 212, 0.1)',
                border: '1px solid rgba(6, 182, 212, 0.3)',
                borderRadius: 'var(--radius-md)',
                padding: '0.85rem 1rem',
                marginBottom: '1.25rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between'
              }}
            >
              <div>
                <span style={{ fontSize: '0.78rem', color: '#67e8f9', textTransform: 'uppercase', fontWeight: 700 }}>
                  Simulated Dev OTP:
                </span>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: '1.2rem', fontWeight: 800, color: '#fff', letterSpacing: '0.15em' }}>
                  {devOtp}
                </div>
              </div>
              <button
                type="button"
                onClick={() => setOtpCode(devOtp)}
                className="btn btn-secondary btn-sm"
                style={{ fontSize: '0.75rem', padding: '0.25rem 0.6rem' }}
              >
                1-Click Fill OTP
              </button>
            </div>
          )}

          {otpSent && (
            <div className="form-group">
              <label className="form-label">Enter 6-Digit Verification Code</label>
              <input
                type="text"
                className="form-input"
                style={{ fontFamily: 'var(--font-mono)', fontSize: '1.2rem', letterSpacing: '0.25em', textAlign: 'center' }}
                value={otpCode}
                onChange={(e) => setOtpCode(e.target.value)}
                placeholder="••••••"
                maxLength={6}
                required
              />
            </div>
          )}

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '2rem' }}>
            <button onClick={() => setCurrentStep(2)} className="btn btn-secondary">
              <ArrowLeft size={16} />
              <span>Back</span>
            </button>

            {otpSent && !otpVerified && (
              <button
                onClick={handleVerifyOtp}
                disabled={otpLoading || otpCode.length !== 6}
                className="btn btn-primary btn-lg"
              >
                {otpLoading ? (
                  <>
                    <div className="spinner" style={{ width: 18, height: 18 }} />
                    <span>Verifying...</span>
                  </>
                ) : (
                  <>
                    <span>Verify & Proceed to Payment</span>
                    <ArrowRight size={18} />
                  </>
                )}
              </button>
            )}

            {!otpSent && (
              <button onClick={handleSendOtp} disabled={otpLoading} className="btn btn-primary btn-lg">
                <span>Send OTP Verification</span>
                <ArrowRight size={18} />
              </button>
            )}
          </div>
        </div>
      )}

      {/* STEP 4: Mock SM-DP+ Profile Ready & QR Code Display */}
      {currentStep === 4 && (
        <div>
          {isProvisioning ? (
            <div className="card card-glass" style={{ textAlign: 'center', padding: '4rem 2rem' }}>
              <div className="spinner" style={{ width: 50, height: 50, margin: '0 auto 1.5rem' }} />
              <h2 style={{ fontSize: '1.6rem', fontWeight: 800 }}>
                Connecting to GSMA SM-DP+ Server...
              </h2>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', marginTop: '0.5rem' }}>
                Generating cryptographic profile keys, matching identifier, and high-res QR code.
              </p>
            </div>
          ) : provisionedData ? (
            <div>
              {/* Success Banner */}
              <div
                style={{
                  background: 'linear-gradient(90deg, rgba(16, 185, 129, 0.15), rgba(6, 182, 212, 0.15))',
                  border: '1px solid var(--accent-success)',
                  borderRadius: 'var(--radius-lg)',
                  padding: '1.5rem',
                  marginBottom: '2rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  flexWrap: 'wrap',
                  gap: '1rem'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  <div
                    style={{
                      width: 44,
                      height: 44,
                      borderRadius: '50%',
                      background: 'var(--accent-success)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: '#fff'
                    }}
                  >
                    <CheckCircle2 size={24} />
                  </div>
                  <div>
                    <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#fff' }}>
                      Mock eSIM Profile Successfully Provisioned!
                    </h3>
                    <div style={{ fontSize: '0.85rem', color: '#a7f3d0' }}>
                      Carrier: <strong>{provisionedData.operator}</strong> • Request ID:{' '}
                      <strong>{provisionedData.requestCode}</strong>
                    </div>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '0.6rem' }}>
                  <button
                    onClick={() => handleSimulateStatus('ACTIVATED')}
                    className="btn btn-success btn-sm"
                  >
                    <CheckCircle2 size={15} />
                    <span>Simulate Complete Installation & Activation</span>
                  </button>
                </div>
              </div>

              {/* Status Timeline */}
              <div className="card" style={{ marginBottom: '2rem' }}>
                <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '0.5rem' }}>
                  Live Provisioning Lifecycle Status
                </h3>
                <StatusTimeline currentStatus={activationStatus} />

                {/* Demo Status Controller Controls */}
                <div
                  style={{
                    marginTop: '1rem',
                    background: 'var(--bg-surface)',
                    border: '1px solid var(--border-subtle)',
                    padding: '0.85rem 1.25rem',
                    borderRadius: 'var(--radius-md)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    flexWrap: 'wrap',
                    gap: '0.75rem'
                  }}
                >
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                    ⚡ Demo Status Switcher (Test lifecycle transitions):
                  </span>
                  <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
                    {['PROFILE_READY', 'INSTALLATION_PENDING', 'ACTIVATED', 'FAILED'].map(st => (
                      <button
                        key={st}
                        onClick={() => handleSimulateStatus(st)}
                        className={`btn btn-sm ${activationStatus === st ? 'btn-primary' : 'btn-secondary'}`}
                        style={{ fontSize: '0.75rem', padding: '0.25rem 0.55rem' }}
                      >
                        {st}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* QR Code & LPA String Viewer */}
              <QRCodeViewer
                qrCodeUrl={provisionedData.qrCodeUrl}
                activationCode={provisionedData.activationCode}
                smdpServer={provisionedData.smdpServer}
                requestId={provisionedData.requestCode}
                operator={provisionedData.operator}
                eid={provisionedData.eid}
              />

              {/* Step-by-Step Installation Guide */}
              <InstallationGuide />

              <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', marginTop: '2.5rem' }}>
                <Link to="/dashboard" className="btn btn-secondary btn-lg">
                  <span>Return to Subscriber Dashboard</span>
                </Link>
                <Link to="/activations" className="btn btn-primary btn-lg">
                  <span>View All Activation Records</span>
                  <ArrowRight size={18} />
                </Link>
              </div>
            </div>
          ) : null}
        </div>
      )}

      {/* Mock Payment Gateway Modal */}
      {isPaymentModalOpen && currentPlan && (
        <PaymentModal
          isOpen={isPaymentModalOpen}
          onClose={() => setIsPaymentModalOpen(false)}
          plan={currentPlan}
          requestId="pending-provisioning"
          onPaymentSuccess={handlePaymentSuccess}
        />
      )}
    </div>
  );
}
