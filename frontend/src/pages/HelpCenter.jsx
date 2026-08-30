import { useState } from 'react';
import { HelpCircle, Info, Smartphone, FileText, ChevronDown, Search } from 'lucide-react';

export default function HelpCenter() {
  const [activeTab, setActiveTab] = useState('identifiers'); // identifiers | simtypes | faqs
  const [searchQuery, setSearchQuery] = useState('');
  const [faqOpen, setFaqOpen] = useState({});

  const toggleFaq = (idx) => {
    setFaqOpen(prev => ({ ...prev, [idx]: !prev[idx] }));
  };

  const faqs = [
    {
      q: 'Why does the website say "API Waking Up..." on first load?',
      a: 'This application is hosted on Render.com free tier, which puts the backend server to sleep after 15 minutes of inactivity. When you visit the site, the server takes about 30–50 seconds to boot back up. Once it wakes up, the portal runs instantly.'
    },
    {
      q: 'How do I download and install an eSIM profile?',
      a: 'After completing payment for an eSIM, a QR code and activation string (LPA) will be displayed. Open your phone\'s Settings → Cellular/Mobile Data → Add eSIM, and scan the QR code. The profile will download from our SM-DP+ server immediately.'
    },
    {
      q: 'How long does a physical SIM card take to arrive?',
      a: 'Once physical SIM activation is requested and checked out, we dispatch the SIM card within 24 hours. Delivery typically takes 2–4 business days depending on your location. You will receive SMS updates with tracking details.'
    },
    {
      q: 'Is the payment gateway real?',
      a: 'Yes, if the administrator has configured the Razorpay gateway keys, payments are processed securely through real UPI, Cards, or NetBanking. If running in Sandbox mode, a simulator is presented for testing purposes.'
    },
    {
      q: 'Can I reuse an eSIM QR code on a second phone?',
      a: 'No. In accordance with GSMA specifications, each provisioned eSIM profile is uniquely tied to your device EID and can only be downloaded once. To switch phones, you must request a new eSIM profile.'
    }
  ];

  const filteredFaqs = faqs.filter(f => 
    f.q.toLowerCase().includes(searchQuery.toLowerCase()) || 
    f.a.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div style={{ maxWidth: '900px', margin: '0 auto' }}>
      <div className="page-header" style={{ marginBottom: '2rem' }}>
        <div>
          <h1 className="page-title">
            <HelpCircle size={28} color="var(--accent-warning)" />
            Help & Support Center
          </h1>
          <p className="page-subtitle">
            Find instructions on how to get EID, IMEI identifiers, configure eSIM profiles, and check FAQs.
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '2rem', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '0.75rem' }}>
        <button
          onClick={() => setActiveTab('identifiers')}
          className={`btn btn-sm ${activeTab === 'identifiers' ? 'btn-primary' : 'btn-secondary'}`}
          style={{ border: 'none', borderRadius: 'var(--radius-md)', padding: '0.5rem 1rem' }}
        >
          <Smartphone size={16} />
          <span>Finding EID & IMEI</span>
        </button>
        <button
          onClick={() => setActiveTab('simtypes')}
          className={`btn btn-sm ${activeTab === 'simtypes' ? 'btn-primary' : 'btn-secondary'}`}
          style={{ border: 'none', borderRadius: 'var(--radius-md)', padding: '0.5rem 1rem' }}
        >
          <Info size={16} />
          <span>eSIM vs Physical SIM</span>
        </button>
        <button
          onClick={() => setActiveTab('faqs')}
          className={`btn btn-sm ${activeTab === 'faqs' ? 'btn-primary' : 'btn-secondary'}`}
          style={{ border: 'none', borderRadius: 'var(--radius-md)', padding: '0.5rem 1rem' }}
        >
          <FileText size={16} />
          <span>FAQs</span>
        </button>
      </div>

      {/* TAB 1: IDENTIFIERS GUIDE */}
      {activeTab === 'identifiers' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div className="card card-glass">
            <h3 style={{ fontSize: '1.25rem', fontWeight: 800, marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span style={{ fontSize: '1.5rem' }}>🎯</span> How to Find your 32-Digit EID
            </h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', lineHeight: 1.6, marginBottom: '1.25rem' }}>
              The EID (Embedded Identity Document) is a unique 32-digit serial number pre-soldered into eSIM-compatible hardware. You need this ID so carriers can provision profiles directly to your chip.
            </p>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.25rem' }}>
              <div style={{ background: 'var(--bg-surface)', padding: '1.25rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}>
                <div style={{ fontWeight: 800, marginBottom: '0.5rem', color: 'var(--accent-cyan)' }}>For Apple iPhone / iPad:</div>
                <ol style={{ paddingLeft: '1.25rem', fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.7 }}>
                  <li>Open the <strong>Settings</strong> app on your device.</li>
                  <li>Navigate to <strong>General</strong> and tap <strong>About</strong>.</li>
                  <li>Scroll down to find the <strong>EID</strong> label.</li>
                  <li>Press and hold the EID number to copy it to your clipboard.</li>
                </ol>
              </div>

              <div style={{ background: 'var(--bg-surface)', padding: '1.25rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}>
                <div style={{ fontWeight: 800, marginBottom: '0.5rem', color: 'var(--accent-primary)' }}>For Android (Samsung, Google Pixel):</div>
                <ol style={{ paddingLeft: '1.25rem', fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.7 }}>
                  <li>Go to <strong>Settings</strong> → <strong>About Phone</strong>.</li>
                  <li>Tap on <strong>Status Information</strong> or <strong>SIM Status</strong>.</li>
                  <li>Look for the 32-digit <strong>EID</strong> field.</li>
                  <li>Alternatively, search for "EID" in the Settings search bar.</li>
                </ol>
              </div>
            </div>

            <div style={{ marginTop: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'rgba(56, 189, 248, 0.1)', padding: '0.85rem 1rem', borderRadius: 'var(--radius-md)', border: '1px solid rgba(56, 189, 248, 0.2)' }}>
              <Info size={16} color="var(--accent-cyan)" />
              <span style={{ fontSize: '0.82rem', color: 'var(--text-primary)' }}>
                <strong>Quick Dialer Code Shortcut:</strong> Open your dialer keypad and type <strong>*#06#</strong>. A device hardware dialog will instantly pop up showing EID and IMEI codes.
              </span>
            </div>
          </div>

          <div className="card card-glass">
            <h3 style={{ fontSize: '1.25rem', fontWeight: 800, marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span style={{ fontSize: '1.5rem' }}>📱</span> How to Find your 15-Digit IMEI
            </h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', lineHeight: 1.6, marginBottom: '1.25rem' }}>
              The IMEI (International Mobile Equipment Identity) is a 15-digit global standard identification number assigned to verify device integrity.
            </p>

            <ul style={{ paddingLeft: '1.25rem', fontSize: '0.88rem', color: 'var(--text-secondary)', lineHeight: 1.8, display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <li><strong>Physical Keypad:</strong> Dial <strong>*#06#</strong> on your phone. The IMEI will be displayed immediately.</li>
              <li><strong>Settings App:</strong> Check <strong>Settings</strong> → <strong>About Phone</strong> → Scroll to <strong>IMEI</strong> (Slot 1 / Slot 2).</li>
              <li><strong>Retail Box:</strong> Look at the barcode sticker on your original phone packaging box.</li>
              <li><strong>SIM Tray:</strong> On iPhones and some Samsung models, the IMEI is printed in micro-font directly on the metal SIM tray slide.</li>
            </ul>
          </div>
        </div>
      )}

      {/* TAB 2: eSIM VS PHYSICAL SIM */}
      {activeTab === 'simtypes' && (
        <div className="card card-glass" style={{ padding: '2rem' }}>
          <h3 style={{ fontSize: '1.35rem', fontWeight: 800, marginBottom: '1rem' }}>Understanding SIM Cards</h3>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', lineHeight: 1.6, marginBottom: '2rem' }}>
            We support both standard physical SIM deliveries and next-generation digital eSIM profiles. Choose the method that best matches your device compatibility.
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.5rem' }}>
            <div style={{ border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-lg)', padding: '1.5rem', background: 'var(--bg-surface)' }}>
              <div style={{ fontSize: '2.5rem', marginBottom: '0.75rem' }}>📶</div>
              <h4 style={{ fontSize: '1.15rem', fontWeight: 800, marginBottom: '0.5rem', color: 'var(--accent-cyan)' }}>eSIM (Embedded Digital)</h4>
              <ul style={{ paddingLeft: '1.25rem', fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.8 }}>
                <li><strong>No waiting time:</strong> Download and activate immediately via QR code scanning.</li>
                <li><strong>Multi-Profile:</strong> Store up to 5 carrier profiles and toggle them in phone settings.</li>
                <li><strong>Security:</strong> Cannot be stolen or physically swapped from lost handsets.</li>
                <li>Requires an eSIM compatible modern smartphone.</li>
              </ul>
            </div>

            <div style={{ border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-lg)', padding: '1.5rem', background: 'var(--bg-surface)' }}>
              <div style={{ fontSize: '2.5rem', marginBottom: '0.75rem' }}>📦</div>
              <h4 style={{ fontSize: '1.15rem', fontWeight: 800, marginBottom: '0.5rem', color: 'var(--accent-primary)' }}>Physical SIM (Traditional Chip)</h4>
              <ul style={{ paddingLeft: '1.25rem', fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.8 }}>
                <li><strong>Global support:</strong> Works on 100% of standard GSM smartphones and modems.</li>
                <li><strong>Plug & Play:</strong> Just slide the plastic chip tray in to connect.</li>
                <li><strong>Courier Dispatch:</strong> Takes 2-4 days for standard shipping delivery.</li>
                <li>Cannot hold multiple phone number profiles on a single chip.</li>
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: FAQs */}
      {activeTab === 'faqs' && (
        <div>
          <div style={{ position: 'relative', marginBottom: '1.5rem' }}>
            <Search size={16} color="var(--text-muted)" style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)' }} />
            <input
              type="text"
              className="form-input"
              style={{ paddingLeft: '2.4rem' }}
              placeholder="Search frequently asked questions..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {filteredFaqs.map((f, idx) => (
              <div
                key={idx}
                className="card"
                style={{
                  background: 'var(--bg-surface)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: 'var(--radius-md)',
                  padding: '1.1rem 1.25rem',
                  cursor: 'pointer'
                }}
                onClick={() => toggleFaq(idx)}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontWeight: 700, fontSize: '0.95rem', color: '#fff' }}>{f.q}</span>
                  <ChevronDown
                    size={18}
                    color="var(--text-muted)"
                    style={{
                      transform: faqOpen[idx] ? 'rotate(180deg)' : 'rotate(0deg)',
                      transition: 'transform 0.2s ease'
                    }}
                  />
                </div>
                {faqOpen[idx] && (
                  <div
                    style={{
                      marginTop: '0.75rem',
                      paddingTop: '0.75rem',
                      borderTop: '1px solid rgba(255,255,255,0.07)',
                      fontSize: '0.88rem',
                      color: 'var(--text-secondary)',
                      lineHeight: 1.6
                    }}
                  >
                    {f.a}
                  </div>
                )}
              </div>
            ))}

            {filteredFaqs.length === 0 && (
              <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                No FAQs matched your search keyword.
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
