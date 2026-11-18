import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';

const ForgotPassword = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await axios.post('/api/auth/forgot-password', { email });
      navigate('/verify-otp', { state: { email } });
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to send OTP');
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen animated-bg" style={{ background: 'var(--bg-primary)', color: 'var(--text-primary)' }}>
      <div className="p-4">
        <button onClick={() => navigate('/')} className="flex items-center gap-2 transition-colors duration-200" style={{ color: 'var(--text-secondary)' }}>
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18"/>
          </svg>
          Back to Website
        </button>
      </div>

      <div className="flex items-center justify-center py-4 px-4">
        <div className="max-w-md w-full p-8 rounded-2xl transition-all duration-300"
          style={{ background: 'var(--bg-card)', border: '1px solid var(--border-primary)', boxShadow: '0 10px 40px rgba(0,0,0,0.08)' }}>

          <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-6" style={{ background: 'linear-gradient(135deg, var(--accent), var(--accent-dark))' }}>
            <svg className="w-8 h-8 text-[var(--text-primary)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
            </svg>
          </div>

          <h2 className="text-3xl font-bold text-center mb-3" style={{ color: 'var(--text-primary)' }}>Forgot Password?</h2>
          <p className="text-center mb-8" style={{ color: 'var(--text-muted)' }}>No worries! Enter your email and we'll send you a 6-digit OTP to reset your password.</p>

          {error && <div className="p-4 rounded-xl mb-6 border bg-[var(--danger-bg)] text-[var(--danger-text)] border-[var(--danger-border)]">{error}</div>}

          <form onSubmit={handleSubmit}>
            <div className="mb-6">
              <label className="block mb-3 font-medium" style={{ color: 'var(--text-primary)' }}>Email Address</label>
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required placeholder="you@school.com"
                className="w-full px-5 py-4 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500/20 transition-all duration-200 border"
                style={{ background: 'var(--bg-input)', borderColor: 'var(--border-primary)', color: 'var(--text-primary)' }} />
            </div>

            <button type="submit" disabled={loading}
              className="w-full py-4 rounded-xl font-bold text-lg transition-all duration-200 text-[var(--text-primary)] disabled:opacity-50 hover:shadow-lg hover:shadow-[var(--accent)]/20"
              style={{ background: 'linear-gradient(135deg, var(--accent), var(--accent-dark))' }}>
              {loading ? 'Sending OTP...' : 'Send OTP'}
            </button>
          </form>

          <div className="mt-8 text-center">
            <Link to="/login" className="font-medium transition-colors duration-200 hover:underline" style={{ color: 'var(--accent)' }}>Back to Login</Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
