import { useState } from 'react';
import { CreditCard, QrCode, Building, Lock, CheckCircle, ShieldCheck, X, ArrowRight } from 'lucide-react';
import { processPayment } from '../services/api';
import toast from 'react-hot-toast';

export default function PaymentModal({
  isOpen,
  onClose,
  plan,
  requestId,
  onPaymentSuccess
}) {
  const [paymentMethod, setPaymentMethod] = useState('MOCK_UPI');
  const [isProcessing, setIsProcessing] = useState(false);
  const [cardNumber, setCardNumber] = useState('4532 •••• •••• 8892');
  const [cardExpiry, setCardExpiry] = useState('08/28');
  const [cardCvv, setCardCvv] = useState('889');
  const [upiId, setUpiId] = useState('subscriber@okaxis');

  if (!isOpen || !plan) return null;

  const basePrice = Number(plan.price);
  const tax = Number((basePrice * 0.18).toFixed(2));
  const totalAmount = Number((basePrice + tax).toFixed(2));

  const handlePayNow = async (e) => {
    e.preventDefault();
    setIsProcessing(true);

    // Simulate realistic 1.2s payment gateway handshake
    setTimeout(async () => {
      try {
        const res = await processPayment({
          planId: plan.id,
          requestId: requestId || 'pending-activation',
          paymentMethod,
          paymentDetails: {
            method: paymentMethod,
            payer: paymentMethod === 'MOCK_UPI' ? upiId : 'Test Cardholder'
          }
        });

        if (res.data.success) {
          toast.success('Mock Payment Successful!');
          if (onPaymentSuccess) {
            onPaymentSuccess(res.data.payment);
          }
          onClose();
        } else {
          toast.error(res.data.message || 'Payment simulation rejected.');
        }
      } catch (err) {
        toast.error('Payment gateway error. Please retry.');
      } finally {
        setIsProcessing(false);
      }
    }, 1200);
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
          <div>
            <h3 style={{ fontSize: '1.3rem', fontWeight: 800 }}>Telecom Checkout</h3>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              Simulated Payment Gateway (Test Mode)
            </span>
          </div>
          <button onClick={onClose} style={{ color: 'var(--text-muted)', padding: '0.4rem' }}>
            <X size={20} />
          </button>
        </div>

        {/* Plan Summary Card */}
        <div
          style={{
            background: 'var(--bg-surface)',
            border: '1px solid var(--border-subtle)',
            borderRadius: 'var(--radius-md)',
            padding: '1.1rem',
            marginBottom: '1.5rem'
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
            <span style={{ fontWeight: 700, color: 'var(--text-primary)' }}>{plan.plan_name} ({plan.operator})</span>
            <span className="badge badge-primary">{plan.validity_days} Days</span>
          </div>
          
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '0.4rem' }}>
            <span>Base Subscription</span>
            <span>₹{basePrice.toFixed(2)}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '0.2rem' }}>
            <span>Telecom GST (18%)</span>
            <span>₹{tax.toFixed(2)}</span>
          </div>
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              fontSize: '1.1rem',
              fontWeight: 800,
              color: 'var(--text-primary)',
              marginTop: '0.75rem',
              paddingTop: '0.75rem',
              borderTop: '1px solid var(--border-subtle)'
            }}
          >
            <span>Total Payable</span>
            <span style={{ color: '#38bdf8' }}>₹{totalAmount.toFixed(2)}</span>
          </div>
        </div>

        {/* Payment Methods */}
        <div style={{ marginBottom: '1.5rem' }}>
          <label className="form-label">Select Payment Method</label>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.6rem' }}>
            <button
              type="button"
              onClick={() => setPaymentMethod('MOCK_UPI')}
              className={`btn btn-sm ${paymentMethod === 'MOCK_UPI' ? 'btn-primary' : 'btn-secondary'}`}
              style={{ fontSize: '0.8rem', padding: '0.6rem' }}
            >
              <QrCode size={16} />
              <span>UPI / QR</span>
            </button>
            <button
              type="button"
              onClick={() => setPaymentMethod('MOCK_CARD')}
              className={`btn btn-sm ${paymentMethod === 'MOCK_CARD' ? 'btn-primary' : 'btn-secondary'}`}
              style={{ fontSize: '0.8rem', padding: '0.6rem' }}
            >
              <CreditCard size={16} />
              <span>Cards</span>
            </button>
            <button
              type="button"
              onClick={() => setPaymentMethod('MOCK_NETBANKING')}
              className={`btn btn-sm ${paymentMethod === 'MOCK_NETBANKING' ? 'btn-primary' : 'btn-secondary'}`}
              style={{ fontSize: '0.8rem', padding: '0.6rem' }}
            >
              <Building size={16} />
              <span>NetBanking</span>
            </button>
          </div>
        </div>

        {/* Form Inputs based on selected method */}
        <form onSubmit={handlePayNow}>
          {paymentMethod === 'MOCK_UPI' && (
            <div className="form-group">
              <label className="form-label">Virtual Payment Address (VPA / UPI ID)</label>
              <input
                type="text"
                className="form-input"
                value={upiId}
                onChange={(e) => setUpiId(e.target.value)}
                placeholder="username@okaxis or 9876543210@paytm"
                required
              />
              <div className="form-hint">Supports Google Pay, PhonePe, Paytm, and BHIM simulation.</div>
            </div>
          )}

          {paymentMethod === 'MOCK_CARD' && (
            <div>
              <div className="form-group">
                <label className="form-label">Card Number</label>
                <input
                  type="text"
                  className="form-input"
                  value={cardNumber}
                  onChange={(e) => setCardNumber(e.target.value)}
                  placeholder="4532 0000 0000 8892"
                  required
                />
              </div>
              <div className="grid-2">
                <div className="form-group">
                  <label className="form-label">Expiry (MM/YY)</label>
                  <input
                    type="text"
                    className="form-input"
                    value={cardExpiry}
                    onChange={(e) => setCardExpiry(e.target.value)}
                    placeholder="08/28"
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">CVV</label>
                  <input
                    type="password"
                    className="form-input"
                    value={cardCvv}
                    onChange={(e) => setCardCvv(e.target.value)}
                    placeholder="889"
                    maxLength={3}
                    required
                  />
                </div>
              </div>
            </div>
          )}

          {paymentMethod === 'MOCK_NETBANKING' && (
            <div className="form-group">
              <label className="form-label">Select Bank</label>
              <select className="form-select">
                <option>HDFC Bank (Simulated)</option>
                <option>State Bank of India (Simulated)</option>
                <option>ICICI Bank (Simulated)</option>
                <option>Axis Bank (Simulated)</option>
              </select>
            </div>
          )}

          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              color: 'var(--accent-success)',
              fontSize: '0.78rem',
              margin: '1rem 0 1.5rem'
            }}
          >
            <ShieldCheck size={16} />
            <span>256-Bit Encrypted Mock Payment Gateway Sandbox</span>
          </div>

          <button
            type="submit"
            disabled={isProcessing}
            className="btn btn-primary"
            style={{ width: '100%', justifyContent: 'center' }}
          >
            {isProcessing ? (
              <>
                <div className="spinner" style={{ width: 18, height: 18 }} />
                <span>Authorizing Payment...</span>
              </>
            ) : (
              <>
                <Lock size={16} />
                <span>Pay ₹{totalAmount.toFixed(2)} & Provision eSIM</span>
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
