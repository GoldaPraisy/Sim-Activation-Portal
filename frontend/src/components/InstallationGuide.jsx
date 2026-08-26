import { useState } from 'react';
import { Apple, Smartphone, Wifi, CheckCircle2, ChevronRight, HelpCircle } from 'lucide-react';

export default function InstallationGuide() {
  const [activeTab, setActiveTab] = useState('ios');

  const iosSteps = [
    {
      title: 'Connect to Wi-Fi',
      desc: 'Ensure your iPhone is connected to a stable Wi-Fi network before downloading the profile.'
    },
    {
      title: 'Open Cellular Settings',
      desc: 'Go to Settings → Cellular (or Mobile Data) → Tap "Add eSIM" or "Add Cellular Plan".'
    },
    {
      title: 'Scan the QR Code',
      desc: 'Point your camera at the QR code above or tap "Enter Details Manually" and paste the LPA string.'
    },
    {
      title: 'Label & Activate Profile',
      desc: 'Assign a label (e.g. Personal, Business, Travel), enable "Turn on this line", and complete setup.'
    }
  ];

  const androidSteps = [
    {
      title: 'Connect to Wi-Fi',
      desc: 'Connect your Android device to a reliable Wi-Fi internet connection.'
    },
    {
      title: 'Open SIM Manager',
      desc: 'Go to Settings → Network & internet (or Connections) → SIMs (or SIM Manager) → Tap "Add eSIM".'
    },
    {
      title: 'Scan QR Code or Add LPA',
      desc: 'Tap "Scan QR code from service provider" and aim your camera at the screen.'
    },
    {
      title: 'Confirm Download',
      desc: 'Tap "Download" or "Add". Once provisioned, toggle the new eSIM profile to active.'
    }
  ];

  const steps = activeTab === 'ios' ? iosSteps : androidSteps;

  return (
    <div className="card" style={{ marginTop: '2rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.5rem' }}>
        <div>
          <h3 style={{ fontSize: '1.2rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <HelpCircle size={20} color="var(--accent-cyan)" />
            eSIM Installation Instructions
          </h3>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
            Follow these step-by-step instructions to configure the eSIM on your device.
          </p>
        </div>

        {/* Device Switcher Tabs */}
        <div style={{ display: 'flex', background: 'var(--bg-surface)', padding: '0.25rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}>
          <button
            onClick={() => setActiveTab('ios')}
            className={`btn btn-sm ${activeTab === 'ios' ? 'btn-primary' : 'btn-secondary'}`}
            style={{ borderRadius: 'var(--radius-sm)', border: 'none' }}
          >
            <Apple size={16} />
            <span>Apple iPhone (iOS)</span>
          </button>
          <button
            onClick={() => setActiveTab('android')}
            className={`btn btn-sm ${activeTab === 'android' ? 'btn-primary' : 'btn-secondary'}`}
            style={{ borderRadius: 'var(--radius-sm)', border: 'none' }}
          >
            <Smartphone size={16} />
            <span>Android (Samsung/Pixel)</span>
          </button>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.25rem' }}>
        {steps.map((step, idx) => (
          <div
            key={idx}
            style={{
              background: 'var(--bg-surface)',
              border: '1px solid var(--border-subtle)',
              borderRadius: 'var(--radius-md)',
              padding: '1.25rem',
              position: 'relative'
            }}
          >
            <div
              style={{
                width: 28,
                height: 28,
                borderRadius: '50%',
                background: 'rgba(99, 102, 241, 0.15)',
                color: 'var(--accent-primary)',
                fontWeight: 800,
                fontSize: '0.85rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '0.75rem',
                border: '1px solid rgba(99, 102, 241, 0.3)'
              }}
            >
              {idx + 1}
            </div>
            <div style={{ fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.35rem', fontSize: '0.95rem' }}>
              {step.title}
            </div>
            <div style={{ color: 'var(--text-secondary)', fontSize: '0.83rem', lineHeight: 1.5 }}>
              {step.desc}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
