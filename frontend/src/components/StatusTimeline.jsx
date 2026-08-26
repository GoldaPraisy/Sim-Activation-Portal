import { CheckCircle2, Clock, Smartphone, QrCode, CreditCard, ShieldCheck, Zap, XCircle } from 'lucide-react';

const STAGES = [
  { id: 'REQUEST_CREATED', label: 'Request Created', icon: Zap },
  { id: 'OTP_VERIFIED', label: 'OTP Verified', icon: ShieldCheck },
  { id: 'PAYMENT_COMPLETED', label: 'Payment Paid', icon: CreditCard },
  { id: 'PROFILE_READY', label: 'Profile Ready', icon: Smartphone },
  { id: 'QR_CODE_READY', label: 'QR Code Ready', icon: QrCode },
  { id: 'INSTALLATION_PENDING', label: 'Install Pending', icon: Clock },
  { id: 'ACTIVATED', label: 'Activated', icon: CheckCircle2 }
];

export default function StatusTimeline({ currentStatus = 'REQUEST_CREATED' }) {
  const isFailed = currentStatus === 'FAILED' || currentStatus === 'REJECTED';

  // Normalize status for positioning
  let activeIndex = STAGES.findIndex(s => s.id === currentStatus);
  if (activeIndex === -1) {
    if (currentStatus === 'PROFILE_GENERATED') activeIndex = 3;
    else activeIndex = 0;
  }

  const progressPercent = ((activeIndex) / (STAGES.length - 1)) * 100;

  return (
    <div style={{ margin: '1.75rem 0', width: '100%' }}>
      {isFailed && (
        <div
          style={{
            background: 'rgba(239, 68, 68, 0.12)',
            border: '1px solid var(--accent-danger)',
            borderRadius: 'var(--radius-md)',
            padding: '0.85rem 1.25rem',
            marginBottom: '1.5rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem',
            color: '#fca5a5'
          }}
        >
          <XCircle size={22} color="var(--accent-danger)" />
          <div>
            <strong>Activation Status: {currentStatus}</strong>
            <div style={{ fontSize: '0.82rem', color: '#fecaca' }}>
              The carrier provisioning transaction was halted or rejected. Please contact administrator or retry.
            </div>
          </div>
        </div>
      )}

      <div className="timeline-container">
        <div className="timeline-line-bg" />
        <div
          className="timeline-line-active"
          style={{
            width: `${Math.min(100, Math.max(0, progressPercent))}%`,
            background: isFailed ? 'var(--accent-danger)' : undefined
          }}
        />

        {STAGES.map((stage, idx) => {
          const Icon = stage.icon;
          const isCompleted = !isFailed && idx < activeIndex;
          const isCurrent = !isFailed && idx === activeIndex;

          let nodeClass = 'timeline-node';
          if (isCurrent) nodeClass += ' active';
          if (isCompleted) nodeClass += ' completed';

          return (
            <div key={stage.id} className={nodeClass}>
              <div className="timeline-circle">
                {isCompleted ? (
                  <CheckCircle2 size={20} color="#fff" />
                ) : (
                  <Icon size={18} />
                )}
              </div>
              <div className="timeline-label">{stage.label}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
