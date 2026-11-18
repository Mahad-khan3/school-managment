import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const PaymentPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { submitPayment, getPlans } = useAuth();
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [plans, setPlans] = useState({});
  const [transactionId, setTransactionId] = useState('');
  const [screenshot, setScreenshot] = useState(null);
  const [screenshotLoading, setScreenshotLoading] = useState(false);
  const [loading, setLoading] = useState(false);
  const [copiedField, setCopiedField] = useState(null);

  useEffect(() => {
    const planFromState = location.state?.plan;
    if (!planFromState) {
      navigate('/subscription-plan');
      return;
    }
    setSelectedPlan(planFromState);
    loadPlans();
  }, [location.state]);

  const loadPlans = async () => {
    const result = await getPlans();
    if (result.success) {
      setPlans(result.plans);
    }
  };

  const handleCopy = (text, field) => {
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const compressImage = (file) => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const maxSize = 800;
          let { width, height } = img;
          if (width > maxSize || height > maxSize) {
            if (width > height) { height = (height / width) * maxSize; width = maxSize; }
            else { width = (width / height) * maxSize; height = maxSize; }
          }
          canvas.width = width;
          canvas.height = height;
          canvas.getContext('2d').drawImage(img, 0, 0, width, height);
          canvas.toBlob((blob) => {
            resolve(new File([blob], file.name, { type: 'image/jpeg' }));
          }, 'image/jpeg', 0.7);
        };
        img.src = e.target.result;
      };
      reader.readAsDataURL(file);
    });
  };

  const handleFileChange = async (e) => {
    if (e.target.files[0]) {
      const file = e.target.files[0];
      if (file.size > 1024 * 1024) {
        setScreenshot(null);
        setScreenshotLoading(true);
        const compressed = await compressImage(file);
        setScreenshot(compressed);
        setScreenshotLoading(false);
      } else {
        setScreenshot(file);
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!transactionId || !screenshot) {
      alert('Please fill in all fields and upload a screenshot');
      return;
    }

    setLoading(true);
    const formData = new FormData();
    formData.append('plan', selectedPlan);
    formData.append('transactionId', transactionId);
    formData.append('screenshot', screenshot);

    const result = await submitPayment(formData);
    setLoading(false);

    if (result.success) {
      alert('Payment submitted successfully! Waiting for admin approval.');
      navigate('/subscription-plan');
    } else {
      alert(result.message || 'Failed to submit payment');
    }
  };

  const paymentDetails = {
    easypaisa: {
      title: 'Easypaisa',
      number: '03438226543',
      accountName: 'Muhammad Faizan',
      accountTitle: 'Muhammad Faizan'
    },
    jazzcash: {
      title: 'JazzCash',
      number: '03438226543',
      accountName: 'Muhammad Faizan',
      accountTitle: 'Muhammad Faizan'
    },
    bank: {
      title: 'Bank Transfer',
      bankName: 'United Bank Limited (UBL)',
      accountName: 'TEHREEM ARSHAD',
      accountTitle: 'TEHREEM ARSHAD',
      accountNumber: '2181344649822',
      iban: 'PK98UNIL0109000344649822'
    }
  };

  const planInfo = plans[selectedPlan];

  return (
    <div className="min-h-screen bg-[var(--bg-primary)] py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <button
          onClick={() => navigate('/subscription-plan')}
          className="mb-8 text-[var(--text-muted)] hover:text-[var(--text-primary)] flex items-center"
        >
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back to Plans
        </button>

        <div className="bg-[var(--bg-card)] border border-[var(--border-primary)] rounded-3xl p-8">
          <h1 className="text-3xl font-bold text-[var(--text-primary)] mb-2">Complete Your Payment</h1>
          {planInfo && (
            <p className="text-[var(--text-muted)] mb-8">
              Selected Plan: <span className="text-[var(--accent)] font-semibold">{selectedPlan.charAt(0).toUpperCase() + selectedPlan.slice(1)}</span> - {planInfo.price?.toLocaleString() || ''} PKR
            </p>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <h2 className="text-xl font-semibold text-[var(--text-primary)] mb-6">Payment Methods</h2>

              {/* EasyPaisa */}
              <div className="bg-[var(--bg-primary)] border border-[var(--border-primary)] rounded-xl p-4 mb-4">
                <h3 className="text-[var(--text-primary)] font-semibold mb-3">{paymentDetails.easypaisa.title}</h3>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[var(--text-secondary)]">Account Number:</span>
                    <div className="flex items-center">
                      <span className="text-[var(--text-muted)] mr-2">{paymentDetails.easypaisa.number}</span>
                      <button
                        onClick={() => handleCopy(paymentDetails.easypaisa.number, 'easypaisa')}
                        className="text-[var(--accent)] hover:text-[var(--accent)]"
                      >
                        {copiedField === 'easypaisa' ? 'Copied!' : 'Copy'}
                      </button>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-[var(--text-secondary)]">Account Title:</span>
                    <div className="flex items-center">
                      <span className="text-[var(--text-muted)] mr-2">{paymentDetails.easypaisa.accountTitle}</span>
                      <button
                        onClick={() => handleCopy(paymentDetails.easypaisa.accountTitle, 'easypaisa-title')}
                        className="text-[var(--accent)] hover:text-[var(--accent)]"
                      >
                        {copiedField === 'easypaisa-title' ? 'Copied!' : 'Copy'}
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* JazzCash */}
              <div className="bg-[var(--bg-primary)] border border-[var(--border-primary)] rounded-xl p-4 mb-4">
                <h3 className="text-[var(--text-primary)] font-semibold mb-3">{paymentDetails.jazzcash.title}</h3>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[var(--text-secondary)]">Account Number:</span>
                    <div className="flex items-center">
                      <span className="text-[var(--text-muted)] mr-2">{paymentDetails.jazzcash.number}</span>
                      <button
                        onClick={() => handleCopy(paymentDetails.jazzcash.number, 'jazzcash')}
                        className="text-[var(--accent)] hover:text-[var(--accent)]"
                      >
                        {copiedField === 'jazzcash' ? 'Copied!' : 'Copy'}
                      </button>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-[var(--text-secondary)]">Account Title:</span>
                    <div className="flex items-center">
                      <span className="text-[var(--text-muted)] mr-2">{paymentDetails.jazzcash.accountTitle}</span>
                      <button
                        onClick={() => handleCopy(paymentDetails.jazzcash.accountTitle, 'jazzcash-title')}
                        className="text-[var(--accent)] hover:text-[var(--accent)]"
                      >
                        {copiedField === 'jazzcash-title' ? 'Copied!' : 'Copy'}
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Bank Transfer */}
              <div className="bg-[var(--bg-primary)] border border-[var(--border-primary)] rounded-xl p-4">
                <h3 className="text-[var(--text-primary)] font-semibold mb-3">{paymentDetails.bank.title}</h3>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[var(--text-secondary)]">Bank:</span>
                    <span className="text-[var(--text-muted)]">{paymentDetails.bank.bankName}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-[var(--text-secondary)]">Account Title:</span>
                    <div className="flex items-center">
                      <span className="text-[var(--text-muted)] mr-2">{paymentDetails.bank.accountTitle}</span>
                      <button
                        onClick={() => handleCopy(paymentDetails.bank.accountTitle, 'bank-title')}
                        className="text-[var(--accent)] hover:text-[var(--accent)]"
                      >
                        {copiedField === 'bank-title' ? 'Copied!' : 'Copy'}
                      </button>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-[var(--text-secondary)]">Account Number:</span>
                    <div className="flex items-center">
                      <span className="text-[var(--text-muted)] mr-2">{paymentDetails.bank.accountNumber}</span>
                      <button
                        onClick={() => handleCopy(paymentDetails.bank.accountNumber, 'bank-account')}
                        className="text-[var(--accent)] hover:text-[var(--accent)]"
                      >
                        {copiedField === 'bank-account' ? 'Copied!' : 'Copy'}
                      </button>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-[var(--text-secondary)]">IBAN:</span>
                    <div className="flex items-center">
                      <span className="text-[var(--text-muted)] mr-2">{paymentDetails.bank.iban}</span>
                      <button
                        onClick={() => handleCopy(paymentDetails.bank.iban, 'iban')}
                        className="text-[var(--accent)] hover:text-[var(--accent)]"
                      >
                        {copiedField === 'iban' ? 'Copied!' : 'Copy'}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div>
              <h2 className="text-xl font-semibold text-[var(--text-primary)] mb-6">Submit Payment Proof</h2>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label className="block text-[var(--text-secondary)] mb-2">Transaction ID</label>
                  <input
                    type="text"
                    value={transactionId}
                    onChange={(e) => setTransactionId(e.target.value)}
                    className="w-full bg-[var(--bg-primary)] border border-[var(--border-primary)] rounded-xl px-4 py-3 text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent)]"
                    placeholder="Enter transaction ID"
                    required
                  />
                </div>

                <div>
                  <label className="block text-[var(--text-secondary)] mb-2">Payment Screenshot</label>
                  <div className="border-2 border-dashed border-[var(--border-primary)] rounded-xl p-6 text-center">
                    <input
                      type="file"
                      id="screenshot"
                      accept="image/*"
                      onChange={handleFileChange}
                      className="hidden"
                      required
                    />
                    <label
                      htmlFor="screenshot"
                      className="cursor-pointer"
                    >
                      {screenshotLoading ? (
                        <div>
                          <div className="w-8 h-8 border-2 border-[var(--accent)] border-t-transparent rounded-full animate-spin mx-auto mb-2" />
                          <p className="text-[var(--text-muted)]">Compressing image...</p>
                        </div>
                      ) : screenshot ? (
                        <div>
                          <svg className="w-12 h-12 text-[var(--success-text)] mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                          <p className="text-[var(--success-text)]">{screenshot.name}</p>
                        </div>
                      ) : (
                        <div>
                          <svg className="w-12 h-12 text-[var(--accent)] mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                          <p className="text-[var(--text-muted)]">Click to upload screenshot</p>
                          <p className="text-xs text-[var(--text-muted)] mt-1">PNG, JPG up to 2MB</p>
                        </div>
                      )}
                    </label>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading || screenshotLoading}
                  className="w-full bg-[var(--accent)] hover:bg-[var(--accent)] text-[var(--text-primary)] font-semibold py-3 px-6 rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? 'Submitting...' : 'Submit Payment'}
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentPage;
