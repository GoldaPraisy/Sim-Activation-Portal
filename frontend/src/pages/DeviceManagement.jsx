import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getMyDevices, registerDevice, deleteDevice, validateEID } from '../services/api';
import {
  Smartphone,
  Plus,
  Trash2,
  CheckCircle2,
  AlertCircle,
  Zap,
  Info,
  Apple,
  ShieldCheck
} from 'lucide-react';
import toast from 'react-hot-toast';

export default function DeviceManagement() {
  const [devices, setDevices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    device_name: '',
    device_model: '',
    os: 'iOS 17.5',
    device_type: 'iPhone',
    eid: '',
    imei: ''
  });
  const [customDeviceType, setCustomDeviceType] = useState('');

  // Live EID Validation state
  const [eidValidationStatus, setEidValidationStatus] = useState({
    isValid: false,
    message: '',
    formatted: ''
  });

  useEffect(() => {
    fetchDevices();
  }, []);

  const fetchDevices = async () => {
    try {
      const res = await getMyDevices();
      if (res.data.success) {
        setDevices(res.data.devices || []);
      }
    } catch (err) {
      toast.error('Failed to load registered devices.');
    } finally {
      setLoading(false);
    }
  };

  const handleEidChange = (e) => {
    const val = e.target.value;
    setFormData(prev => ({ ...prev, eid: val }));

    const clean = val.replace(/[\s-]/g, '').trim();
    if (!clean) {
      setEidValidationStatus({ isValid: false, message: '', formatted: '' });
      return;
    }

    if (clean.length !== 32) {
      setEidValidationStatus({
        isValid: false,
        message: `Must be exactly 32 digits long (${clean.length}/32 entered)`,
        formatted: ''
      });
      return;
    }

    if (!/^[0-9A-Fa-f]{32}$/.test(clean)) {
      setEidValidationStatus({
        isValid: false,
        message: 'Invalid characters. Only digits 0-9 and hex A-F are allowed.',
        formatted: ''
      });
      return;
    }

    // Valid 32-digit EID
    const formatted = clean.match(/.{1,4}/g)?.join(' ') || clean;
    setEidValidationStatus({
      isValid: true,
      message: clean.startsWith('89') ? 'Valid GSMA Telecom EID format (starts with 89)' : 'Valid 32-digit EID identifier',
      formatted
    });
  };

  const handleSampleEidFill = (type) => {
    if (type === 'iphone') {
      setFormData({
        device_name: 'iPhone 15 Pro',
        device_model: 'A3106 Global',
        os: 'iOS 17.5',
        device_type: 'iPhone',
        eid: '89049032000000000000000000001001',
        imei: '354890123456789'
      });
      setEidValidationStatus({
        isValid: true,
        message: 'Valid GSMA Telecom EID format (starts with 89)',
        formatted: '8904 9032 0000 0000 0000 0000 1001'
      });
    } else {
      setFormData({
        device_name: 'Samsung Galaxy S24 Ultra',
        device_model: 'SM-S928B',
        os: 'Android 14 (One UI 6.1)',
        device_type: 'Android',
        eid: '89049032000000000000000000002002',
        imei: '359123456789012'
      });
      setEidValidationStatus({
        isValid: true,
        message: 'Valid GSMA Telecom EID format (starts with 89)',
        formatted: '8904 9032 0000 0000 0000 0000 2002'
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.device_name || !formData.eid) {
      toast.error('Device name and 32-digit EID are required.');
      return;
    }

    if (!eidValidationStatus.isValid) {
      toast.error('Please enter a valid 32-digit EID.');
      return;
    }

    setIsSubmitting(true);
    try {
      const submitPayload = {
        ...formData,
        device_type: formData.device_type === 'Other' ? (customDeviceType || 'Other') : formData.device_type
      };
      const res = await registerDevice(submitPayload);
      if (res.data.success) {
        toast.success(res.data.message);
        setFormData({
          device_name: '',
          device_model: '',
          os: 'iOS 17.5',
          device_type: 'iPhone',
          eid: '',
          imei: ''
        });
        setCustomDeviceType('');
        setEidValidationStatus({ isValid: false, message: '', formatted: '' });
        fetchDevices();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to register device.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to remove this registered device?')) return;
    try {
      const res = await deleteDevice(id);
      if (res.data.success) {
        toast.success('Device removed.');
        setDevices(prev => prev.filter(d => d.id !== id));
      }
    } catch (err) {
      toast.error('Failed to remove device.');
    }
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">
            <Smartphone size={28} color="var(--accent-cyan)" />
            Device & EID Management
          </h1>
          <p className="page-subtitle">
            Register your eSIM-capable smartphones and tablets using their unique 32-digit eUICC ID (EID).
          </p>
        </div>
      </div>

      <div className="grid-2">
        {/* Registration Form */}
        <div className="card card-glass card-glow-cyan">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 700 }}>Register New Device</h2>
            <div style={{ display: 'flex', gap: '0.4rem' }}>
              <button
                type="button"
                onClick={() => handleSampleEidFill('iphone')}
                className="btn btn-secondary btn-sm"
                style={{ fontSize: '0.75rem', padding: '0.25rem 0.55rem' }}
                title="Fill Sample iPhone EID"
              >
                Sample iPhone
              </button>
              <button
                type="button"
                onClick={() => handleSampleEidFill('android')}
                className="btn btn-secondary btn-sm"
                style={{ fontSize: '0.75rem', padding: '0.25rem 0.55rem' }}
                title="Fill Sample Galaxy EID"
              >
                Sample Galaxy
              </button>
            </div>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label">Device Name / Nickname *</label>
              <input
                type="text"
                className="form-input"
                value={formData.device_name}
                onChange={(e) => setFormData({ ...formData, device_name: e.target.value })}
                placeholder="e.g. iPhone 15 Pro / Pixel 8"
                required
              />
            </div>

            <div className="grid-2">
              <div className="form-group">
                <label className="form-label">Device Type *</label>
                <select
                  className="form-select"
                  value={formData.device_type}
                  onChange={(e) => setFormData({ ...formData, device_type: e.target.value })}
                >
                  <option value="iPhone">Apple iPhone</option>
                  <option value="Android">Android Phone</option>
                  <option value="iPad">Apple iPad</option>
                  <option value="Other">Other Devices</option>
                </select>
              </div>

              {formData.device_type === 'Other' && (
                <div className="form-group" style={{ gridColumn: 'span 2', marginTop: '-0.5rem' }}>
                  <label className="form-label">Specify Custom Device Type *</label>
                  <input
                    type="text"
                    className="form-input"
                    value={customDeviceType}
                    onChange={(e) => setCustomDeviceType(e.target.value)}
                    placeholder="e.g. Smart Watch, Windows Laptop, Router"
                    required={formData.device_type === 'Other'}
                  />
                </div>
              )}

              <div className="form-group">
                <label className="form-label">Operating System *</label>
                <input
                  type="text"
                  className="form-input"
                  value={formData.os}
                  onChange={(e) => setFormData({ ...formData, os: e.target.value })}
                  placeholder="e.g. iOS 17.5 / Android 14"
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">
                32-Digit EID (Embedded Identity Document) *
              </label>
              <input
                type="text"
                className="form-input"
                style={{ fontFamily: 'var(--font-mono)', fontSize: '0.9rem' }}
                value={formData.eid}
                onChange={handleEidChange}
                placeholder="89049032000000000000000000000001"
                maxLength={36}
                required
              />

              {/* Live EID Status Message */}
              {formData.eid && (
                <div style={{ marginTop: '0.5rem', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  {eidValidationStatus.isValid ? (
                    <>
                      <CheckCircle2 size={16} color="var(--accent-success)" />
                      <span style={{ color: 'var(--accent-success)', fontWeight: 600 }}>
                        {eidValidationStatus.message}
                      </span>
                    </>
                  ) : (
                    <>
                      <AlertCircle size={16} color="var(--accent-danger)" />
                      <span style={{ color: 'var(--accent-danger)' }}>
                        {eidValidationStatus.message}
                      </span>
                    </>
                  )}
                </div>
              )}

              {eidValidationStatus.formatted && (
                <div style={{ marginTop: '0.5rem' }}>
                  <div className="eid-display">
                    {eidValidationStatus.formatted}
                  </div>
                </div>
              )}
            </div>

            <div className="form-group">
              <label className="form-label">Optional 15-Digit IMEI</label>
              <input
                type="text"
                className="form-input"
                style={{ fontFamily: 'var(--font-mono)' }}
                value={formData.imei}
                onChange={(e) => setFormData({ ...formData, imei: e.target.value })}
                placeholder="354890123456789"
                maxLength={18}
              />
            </div>

            <button
              type="submit"
              disabled={isSubmitting || !eidValidationStatus.isValid}
              className="btn btn-cyan btn-lg"
              style={{ width: '100%', marginTop: '0.5rem' }}
            >
              {isSubmitting ? (
                <>
                  <div className="spinner" style={{ width: 18, height: 18 }} />
                  <span>Validating EID with Carrier...</span>
                </>
              ) : (
                <>
                  <Plus size={16} />
                  <span>Register Device EID</span>
                </>
              )}
            </button>
          </form>
        </div>

        {/* Registered Devices List */}
        <div>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '1.25rem' }}>
            Registered Devices ({devices.length})
          </h2>

          {loading ? (
            <div style={{ display: 'flex', justifyContent: 'center', padding: '3rem' }}>
              <div className="spinner" style={{ width: 32, height: 32 }} />
            </div>
          ) : devices.length === 0 ? (
            <div className="card" style={{ textAlign: 'center', padding: '3rem 1.5rem', color: 'var(--text-muted)' }}>
              <Smartphone size={48} style={{ opacity: 0.4, marginBottom: '0.75rem' }} />
              <div style={{ fontWeight: 600, fontSize: '1.05rem', color: 'var(--text-primary)' }}>No Registered Devices</div>
              <p style={{ fontSize: '0.85rem', marginTop: '0.25rem' }}>
                Use the form on the left or click "Sample iPhone" to add your first eSIM device.
              </p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {devices.map(dev => (
                <div key={dev.id} className="card">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <span style={{ fontWeight: 800, fontSize: '1.1rem' }}>{dev.device_name}</span>
                        <span className="badge badge-cyan">{dev.device_type}</span>
                        <span className="badge badge-primary">{dev.os}</span>
                      </div>
                      <div style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', marginTop: '0.35rem' }}>
                        Model: {dev.device_model || 'Standard'} • Registered: {new Date(dev.created_at).toLocaleDateString()}
                      </div>
                    </div>

                    <button
                      onClick={() => handleDelete(dev.id)}
                      className="btn btn-secondary btn-sm"
                      style={{ color: 'var(--accent-danger)', border: 'none' }}
                      title="Delete Device"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>

                  <div style={{ marginTop: '1rem' }}>
                    <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '0.2rem' }}>
                      Validated 32-Digit EID
                    </div>
                    <div className="eid-display" style={{ fontSize: '0.85rem' }}>
                      {dev.eid.match(/.{1,4}/g)?.join(' ') || dev.eid}
                    </div>
                  </div>

                  <div style={{ marginTop: '1rem', display: 'flex', justifyContent: 'flex-end' }}>
                    <Link
                      to="/activate"
                      state={{ preselectedDeviceId: dev.id, preselectedEid: dev.eid }}
                      className="btn btn-primary btn-sm"
                    >
                      <Zap size={14} />
                      <span>Activate eSIM on this Device</span>
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
