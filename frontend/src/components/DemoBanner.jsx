import { AlertTriangle, Sparkles, ShieldCheck } from 'lucide-react';

export default function DemoBanner() {
  return (
    <div className="demo-banner">
      <div className="demo-banner-content">
        <span className="demo-tag">
          <Sparkles size={12} style={{ display: 'inline', marginRight: 3 }} />
          Demo Mode
        </span>
        <span>
          <strong>Simulated eSIM Provisioning Sandbox:</strong> All carrier activations, SM-DP+ profiles, LPA codes, and OTPs are generated for demonstration purposes.
        </span>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.75rem', color: '#94a3b8' }}>
        <ShieldCheck size={14} color="#10b981" />
        <span>GSMA Mock Spec v3.2</span>
      </div>
    </div>
  );
}
