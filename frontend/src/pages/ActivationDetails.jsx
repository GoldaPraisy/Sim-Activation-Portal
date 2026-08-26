import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getEsimRequestById, updateDemoStatus } from '../services/api';
import {
  Zap,
  Smartphone,
  Layers,
  CreditCard,
  QrCode,
  CheckCircle2,
  Clock,
  ArrowLeft,
  RefreshCw,
  Copy,
  AlertTriangle,
  History,
  Radio
} from 'lucide-react';
import QRCodeViewer from '../components/QRCodeViewer';
import InstallationGuide from '../components/InstallationGuide';
import StatusTimeline from '../components/StatusTimeline';
import toast from 'react-hot-toast';

export default function ActivationDetails() {
  const { id } = useParams();
  const [request, setRequest] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRequestDetails();
  }, [id]);

  const fetchRequestDetails = async () => {
    try {
      const res = await getEsimRequestById(id);
      if (res.data.success) {
        setRequest(res.data.request);
      }
    } catch (err) {
      toast.error('Failed to load activation details.');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (newStatus) => {
    try {
      const res = await updateDemoStatus(id, newStatus, `Demo status transition: ${newStatus}`);
      if (res.data.success) {
        toast.success(`Status updated to ${newStatus}`);
        setRequest(prev => ({ ...prev, status: newStatus }));
        fetchRequestDetails();
      }
    } catch (err) {
      toast.error('Failed to change activation status.');
    }
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
        <div className="spinner" style={{ width: 40, height: 40 }} />
      </div>
    );
  }

  if (!request) {
    return (
      <div className="card" style={{ textAlign: 'center', padding: '3rem' }}>
        <h2>Activation Request Not Found</h2>
        <Link to="/activations" className="btn btn-primary" style={{ marginTop: '1rem' }}>
          Back to Activations List
        </Link>
      </div>
    );
  }

  return (
    <div>
      <div className="page-header">
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
            <Link to="/activations" className="btn btn-secondary btn-sm">
              <ArrowLeft size={14} />
              <span>All Requests</span>
            </Link>
            <span className="badge badge-primary">{request.request_code}</span>
            <span className={`badge ${request.status === 'ACTIVATED' ? 'badge-success' : 'badge-primary'}`}>
              {request.status}
            </span>
          </div>
          <h1 className="page-title">
            <Radio size={28} color="var(--accent-primary)" />
            eSIM Profile: {request.operator} ({request.msisdn})
          </h1>
        </div>
      </div>

      {/* Status Timeline */}
      <div className="card" style={{ marginBottom: '2rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 700 }}>Lifecycle Progression Status</h3>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
            Requested on: {new Date(request.created_at).toLocaleString()}
          </span>
        </div>

        <StatusTimeline currentStatus={request.status} />

        {/* Demo Fast-Forward Status Bar */}
        <div
          style={{
            marginTop: '1.5rem',
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
            ⚡ Demo Action (Change activation state):
          </span>
          <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
            {['REQUEST_CREATED', 'PROFILE_READY', 'INSTALLATION_PENDING', 'ACTIVATED', 'REJECTED'].map(st => (
              <button
                key={st}
                onClick={() => handleStatusUpdate(st)}
                className={`btn btn-sm ${request.status === st ? 'btn-primary' : 'btn-secondary'}`}
                style={{ fontSize: '0.75rem', padding: '0.25rem 0.55rem' }}
              >
                {st}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="grid-2">
        {/* QR Code Viewer */}
        <QRCodeViewer
          qrCodeUrl={request.qr_code_url}
          activationCode={request.activation_code}
          smdpServer={request.smdp_server}
          requestId={request.request_code}
          operator={request.operator}
          eid={request.eid}
          createdAt={request.created_at}
        />

        {/* Details & Audit Trail */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {/* Plan & Device Information */}
          <div className="card">
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Layers size={18} color="var(--accent-cyan)" />
              Subscription & Device Details
            </h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', fontSize: '0.88rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '0.5rem' }}>
                <span style={{ color: 'var(--text-secondary)' }}>Carrier Network:</span>
                <strong>{request.operator}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '0.5rem' }}>
                <span style={{ color: 'var(--text-secondary)' }}>Plan Name:</span>
                <strong>{request.plan?.plan_name || 'Standard eSIM Plan'}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '0.5rem' }}>
                <span style={{ color: 'var(--text-secondary)' }}>Data Allowance:</span>
                <span>{request.plan?.data_per_day || '2 GB/day'}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '0.5rem' }}>
                <span style={{ color: 'var(--text-secondary)' }}>Target Device:</span>
                <span>{request.device?.device_name || 'Smartphone'} ({request.device?.os || 'Mobile'})</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '0.5rem' }}>
                <span style={{ color: 'var(--text-secondary)' }}>Payment Amount:</span>
                <span style={{ color: 'var(--accent-success)', fontWeight: 700 }}>
                  ₹{request.payment?.amount || request.plan?.price || 299} (Paid)
                </span>
              </div>
            </div>
          </div>

          {/* Lifecycle Audit Trail */}
          <div className="card">
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <History size={18} color="var(--accent-primary)" />
              Provisioning Audit Log
            </h3>

            {(!request.logs || request.logs.length === 0) ? (
              <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>No log entries recorded yet.</p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {request.logs.map(log => (
                  <div
                    key={log.id}
                    style={{
                      background: 'var(--bg-surface)',
                      border: '1px solid var(--border-subtle)',
                      padding: '0.75rem 1rem',
                      borderRadius: 'var(--radius-md)',
                      fontSize: '0.82rem'
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-muted)', fontSize: '0.75rem', marginBottom: '0.25rem' }}>
                      <span>Status: <strong style={{ color: '#fff' }}>{log.to_status}</strong></span>
                      <span>{new Date(log.created_at).toLocaleTimeString()}</span>
                    </div>
                    <div style={{ color: 'var(--text-secondary)' }}>{log.note}</div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      <InstallationGuide />
    </div>
  );
}
