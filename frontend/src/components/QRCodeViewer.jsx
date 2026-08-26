import { useState } from 'react';
import { Copy, Check, Download, AlertTriangle, QrCode, Server, Shield } from 'lucide-react';
import toast from 'react-hot-toast';

export default function QRCodeViewer({
  qrCodeUrl,
  activationCode,
  smdpServer = 'smdp.telecom-demo.io',
  requestId,
  operator = 'Demo Telecom',
  eid,
  createdAt
}) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    if (!activationCode) return;
    navigator.clipboard.writeText(activationCode);
    setCopied(true);
    toast.success('LPA Activation Code copied to clipboard!');
    setTimeout(() => setCopied(false), 2500);
  };

  const handleDownloadQR = () => {
    if (!qrCodeUrl) return;
    const link = document.createElement('a');
    link.href = qrCodeUrl;
    link.download = `esim-profile-${operator.toLowerCase().replace(/\s+/g, '')}-${requestId || 'demo'}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success('QR Code downloaded successfully!');
  };

  return (
    <div className="card card-glass card-glow-primary" style={{ textAlign: 'center' }}>
      {/* Prominent Mandatory Demo Warning Box */}
      <div
        style={{
          background: 'rgba(245, 158, 11, 0.1)',
          border: '1px solid rgba(245, 158, 11, 0.35)',
          borderRadius: 'var(--radius-md)',
          padding: '0.85rem 1rem',
          marginBottom: '1.5rem',
          display: 'flex',
          alignItems: 'center',
          gap: '0.75rem',
          textAlign: 'left'
        }}
      >
        <AlertTriangle size={24} color="var(--accent-warning)" style={{ flexShrink: 0 }} />
        <div style={{ fontSize: '0.82rem', color: '#fef3c7', lineHeight: 1.4 }}>
          <strong>DEMONSTRATION eSIM PROFILE:</strong> This is a simulated carrier profile. It cannot be used to connect to a real commercial telecom network subscription.
        </div>
      </div>

      <div style={{ display: 'inline-flex', flexDirection: 'column', alignItems: 'center' }}>
        {/* QR Code Container with Frame */}
        <div
          style={{
            background: '#ffffff',
            padding: '1.25rem',
            borderRadius: 'var(--radius-lg)',
            boxShadow: '0 10px 30px rgba(0,0,0,0.5)',
            border: '4px solid #6366f1',
            position: 'relative',
            maxWidth: '300px'
          }}
        >
          {qrCodeUrl ? (
            <img
              src={qrCodeUrl}
              alt="eSIM Activation QR Code"
              style={{ width: '100%', height: 'auto', display: 'block', borderRadius: '4px' }}
            />
          ) : (
            <div
              style={{
                width: 240,
                height: 240,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#334155'
              }}
            >
              <QrCode size={64} />
            </div>
          )}
        </div>

        <div style={{ marginTop: '1rem', display: 'flex', gap: '0.75rem', flexWrap: 'wrap', justifyContent: 'center' }}>
          <button onClick={handleDownloadQR} className="btn btn-secondary btn-sm">
            <Download size={15} />
            <span>Download QR Code</span>
          </button>
          <button onClick={handleCopy} className="btn btn-primary btn-sm">
            {copied ? <Check size={15} color="#4ade80" /> : <Copy size={15} />}
            <span>{copied ? 'Copied LPA!' : 'Copy Activation Code'}</span>
          </button>
        </div>
      </div>

      {/* Profile Details Metadata Box */}
      <div
        style={{
          marginTop: '1.75rem',
          background: 'var(--bg-surface)',
          border: '1px solid var(--border-subtle)',
          borderRadius: 'var(--radius-md)',
          padding: '1.25rem',
          textAlign: 'left'
        }}
      >
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', fontSize: '0.85rem' }}>
          <div>
            <div style={{ color: 'var(--text-muted)', fontSize: '0.75rem', textTransform: 'uppercase' }}>Telecom Operator</div>
            <div style={{ fontWeight: 700, color: 'var(--text-primary)', fontSize: '1rem' }}>{operator}</div>
          </div>
          <div>
            <div style={{ color: 'var(--text-muted)', fontSize: '0.75rem', textTransform: 'uppercase' }}>SM-DP+ Address</div>
            <div style={{ fontFamily: 'var(--font-mono)', color: '#38bdf8' }}>{smdpServer}</div>
          </div>
          <div>
            <div style={{ color: 'var(--text-muted)', fontSize: '0.75rem', textTransform: 'uppercase' }}>Target Device EID</div>
            <div style={{ fontFamily: 'var(--font-mono)', color: 'var(--text-secondary)', fontSize: '0.8rem' }}>
              {eid || '8904 9032 0000 0000 0000 0000 0000 1001'}
            </div>
          </div>
          <div>
            <div style={{ color: 'var(--text-muted)', fontSize: '0.75rem', textTransform: 'uppercase' }}>Request Ref ID</div>
            <div style={{ fontFamily: 'var(--font-mono)', color: '#a5b4fc' }}>{requestId || 'REQ-2026-LIVE'}</div>
          </div>
        </div>

        {/* LPA String Block */}
        <div style={{ marginTop: '1rem' }}>
          <div style={{ color: 'var(--text-muted)', fontSize: '0.75rem', textTransform: 'uppercase', marginBottom: '0.35rem' }}>
            Full GSMA LPA Activation String (Manual Input)
          </div>
          <div
            style={{
              fontFamily: 'var(--font-mono)',
              fontSize: '0.82rem',
              background: '#07090e',
              border: '1px solid var(--border-subtle)',
              borderRadius: 'var(--radius-sm)',
              padding: '0.6rem 0.85rem',
              color: '#38bdf8',
              wordBreak: 'break-all',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '0.5rem'
            }}
          >
            <span>{activationCode || `LPA:1$${smdpServer}$ACT-DEMO`}</span>
            <button
              onClick={handleCopy}
              style={{ color: 'var(--text-muted)', padding: '0.2rem' }}
              title="Copy"
            >
              {copied ? <Check size={14} color="#4ade80" /> : <Copy size={14} />}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
