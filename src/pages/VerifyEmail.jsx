import { useState, useRef, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';

const VerifyEmail = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const email = location.state?.email;
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [resendTimer, setResendTimer] = useState(60);
  const [resendLoading, setResendLoading] = useState(false);
  const inputRefs = useRef([]);

  useEffect(() => {
    if (!email) { navigate('/register'); return; }
    inputRefs.current[0]?.focus();
  }, [email, navigate]);

  useEffect(() => {
    if (resendTimer > 0) {
      const timer = setTimeout(() => setResendTimer(resendTimer - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [resendTimer]);

  const handleChange = (index, value) => {
    if (!/^\d*$/.test(value)) return;
    const newOtp = [...otp];
    newOtp[index] = value.slice(-1);
    setOtp(newOtp);
    if (value && index < 5) inputRefs.current[index + 1]?.focus();
  };

  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) inputRefs.current[index - 1]?.focus();
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    const newOtp = pasted.split('').concat(Array(6).fill('')).slice(0, 6);
    setOtp(newOtp);
    const nextEmpty = newOtp.findIndex(v => !v);
    inputRefs.current[nextEmpty === -1 ? 5 : nextEmpty]?.focus();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    const otpValue = otp.join('');
    if (otpValue.length !== 6) { setError('Please enter the complete 6-digit OTP'); return; }
    setLoading(true);
    try {
      const res = await axios.post('/api/auth/verify-registration', { email, otp: otpValue });
      localStorage.setItem('token', res.data.token);
      localStorage.setItem('role', res.data.role);
      if (res.data.school) localStorage.setItem('school', JSON.stringify(res.data.school));
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Verification failed');
      setOtp(['', '', '', '', '', '']);
      inputRefs.current[0]?.focus();
    }
    setLoading(false);
  };

  const handleResend = async () => {
    setResendLoading(true);
    setError('');
    try {
      await axios.post('/api/auth/resend-registration-otp', { email });
      setResendTimer(60);
      setOtp(['', '', '', '', '', '']);
      inputRefs.current[0]?.focus();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to resend OTP');
    }
    setResendLoading(false);
  };

  return (
    <div className="min-h-screen animated-bg" style={{ background: 'var(--bg-primary)', color: 'var(--text-primary)' }}>
      <div className="p-4">
        <button onClick={() => navigate('/register')} className="flex items-center gap-2 transition-colors duration-200" style={{ color: 'var(--text-secondary)' }}>
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18"/>
          </svg>
          Back
        </button>
      </div>

      <div className="flex items-center justify-center py-4 px-4">
        <div className="max-w-md w-full p-8 rounded-2xl transition-all duration-300"
          style={{ background: 'var(--bg-card)', border: '1px solid var(--border-primary)', boxShadow: '0 10px 40px rgba(0,0,0,0.08)' }}>

          <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-6" style={{ background: 'linear-gradient(135deg, var(--accent), var(--accent-dark))' }}>
            <svg className="w-8 h-8 text-[var(--text-primary)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
          </div>

          <h2 className="text-3xl font-bold text-center mb-3" style={{ color: 'var(--text-primary)' }}>Verify Your Email</h2>
          <p className="text-center mb-2" style={{ color: 'var(--text-muted)' }}>Enter the 6-digit code sent to</p>
          <p className="text-center font-semibold mb-8" style={{ color: 'var(--accent)' }}>{email}</p>

          {error && <div className="p-4 rounded-xl mb-6 border bg-[var(--danger-bg)] text-[var(--danger-text)] border-[var(--danger-border)]">{error}</div>}

          <form onSubmit={handleSubmit}>
            <div className="flex justify-center gap-3 mb-8">
              {otp.map((digit, index) => (
                <input key={index} ref={(el) => (inputRefs.current[index] = el)} type="text" inputMode="numeric" maxLength={1} value={digit}
                  onChange={(e) => handleChange(index, e.target.value)} onKeyDown={(e) => handleKeyDown(index, e)} onPaste={handlePaste}
                  className="w-12 h-14 text-center text-xl font-bold rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500/20 transition-all duration-200 border"
                  style={{ background: 'var(--bg-input)', borderColor: 'var(--border-primary)', color: 'var(--text-primary)' }}
                />
              ))}
            </div>

            <button type="submit" disabled={loading}
              className="w-full py-4 rounded-xl font-bold text-lg transition-all duration-200 text-[var(--text-primary)] disabled:opacity-50 hover:shadow-lg hover:shadow-[var(--accent)]/20"
              style={{ background: 'linear-gradient(135deg, var(--accent), var(--accent-dark))' }}>
              {loading ? 'Verifying...' : 'Verify Email'}
            </button>
          </form>

          <div className="mt-8 text-center">
            {resendTimer > 0 ? (
              <p style={{ color: 'var(--text-muted)' }}>Resend OTP in <span className="font-semibold" style={{ color: 'var(--accent)' }}>{resendTimer}s</span></p>
            ) : (
              <button onClick={handleResend} disabled={resendLoading} className="font-medium transition-colors duration-200 hover:underline disabled:opacity-50" style={{ color: 'var(--accent)' }}>
                {resendLoading ? 'Sending...' : 'Resend OTP'}
              </button>
            )}
          </div>

          <div className="mt-4 text-center">
            <Link to="/login" className="text-sm transition-colors duration-200 hover:underline" style={{ color: 'var(--text-muted)' }}>Back to Login</Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VerifyEmail;
