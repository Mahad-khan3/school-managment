import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { ArrowLeft } from 'lucide-react';

const SubscriptionPlan = () => {
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [plans, setPlans] = useState({});
  const [pendingPayment, setPendingPayment] = useState(null);
  const { getPlans, checkPendingPayment, checkSubscription, subscription } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    const plansResult = await getPlans();
    if (plansResult.success) {
      setPlans(plansResult.plans);
    }
    const pendingResult = await checkPendingPayment();
    if (pendingResult.success) {
      setPendingPayment(pendingResult.pendingPayment);
    }
  };

  const handleBuyNow = (planKey) => {
    setSelectedPlan(planKey);
    navigate('/payment', { state: { plan: planKey } });
  };

  const getStatusText = () => {
    if (!subscription) return '';
    switch (subscription.status) {
      case 'trial':
        return 'Free Trial';
      case 'active':
        return 'Active';
      case 'expired':
        return 'Expired';
      case 'suspended':
        return 'Suspended';
      default:
        return '';
    }
  };

  const formatTimeRemaining = (ms) => {
    if (!ms || ms <= 0) return 'Expired';
    const days = Math.floor(ms / (1000 * 60 * 60 * 24));
    const hours = Math.floor((ms % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((ms % (1000 * 60 * 60)) / (1000 * 60));
    return `${days} Days ${hours} Hours ${minutes} Minutes Remaining`;
  };

  const planFeatures = {
    basic: [
      'Free Initial Guidance',
      'limited students',
      'Student Admission Setup',
      'Teacher Management',
      'Fee Management System',
      'Fee Receipt Download',
      'Reports & Analytics'
    ],
    advanced: [
      'Everything in Basic',
      ' Up to 800 Students',
      'Supports Up to 3000 Students',
      'Complete Fee Structure Setup',
      'Student Data Entry Assistance',
      'Priority Technical Support',
      'Custom School Branding',
      'Advanced Reports & Analytics',
      'Data Export (Excel / PDF)',
      'Fast Issue Resolution',
      'Regular System Updates',
      'WhatsApp & Call Support'
    ],
    premium: [
      'Everything in Advanced',
      'Unlimited Student Capacity',
      'Lifetime Technical Support',
      'No Hidden Charges',
      'Fast Data Processing',
      'Premium Dashboard Experience',
      'Luxury Modern UI',
      'Dedicated Account Manager',
      'API Access',
      'Custom Features on Request',
      'Daily Backup & Security',
      'Advanced Reports & Insights',
      'Custom School Branding',
      'High Priority Support',
      'Free Future Improvements (Minor Updates)',
      'Performance Optimization',
      'Data Import & Migration',
      'Staff Training Session',
      '99.9% System Availability'
    ]
  };

  return (
    <div className="min-h-screen bg-[var(--bg-primary)] py-12 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <button
            onClick={() => navigate('/dashboard')}
            className="flex items-center gap-2 text-[var(--text-secondary)] hover:text-[var(--text-primary)] bg-[var(--bg-card)] border border-[var(--border-primary)] rounded-xl px-4 py-2.5 transition-all hover:border-[var(--accent)]/50"
          >
            <ArrowLeft size={18} />
            <span className="text-sm font-medium">Back to Portal</span>
          </button>
        </div>
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-[var(--text-primary)] mb-4">Subscription Plans</h1>
          {subscription && subscription.status !== 'suspended' && (
            <div className="inline-block bg-[var(--bg-card)] border border-[var(--border-primary)] rounded-xl px-6 py-3">
              <p className="text-[var(--text-secondary)]">
                Current Status: <span className={`font-bold ${subscription.status === 'active' ? 'text-[var(--success-text)]' : subscription.status === 'trial' ? 'text-[var(--warning-text)]' : 'text-[var(--danger-text)]'}`}>{getStatusText()}</span>
              </p>
              {subscription.remainingTime > 0 && (
                <p className="text-sm text-[var(--text-secondary)] mt-1">{formatTimeRemaining(subscription.remainingTime)}</p>
              )}
            </div>
          )}
          {pendingPayment && (
            <div className="mt-4 bg-[var(--warning-bg)] border border-[var(--warning-border)] rounded-xl px-6 py-4 max-w-md mx-auto">
              <p className="text-[var(--warning-text)] font-semibold">Payment Under Review</p>
              <p className="text-[var(--warning-text)] text-sm mt-1">Your payment is being processed. Please wait for admin approval.</p>
            </div>
          )}
          {subscription?.rejectionReason && (
            <div className="mt-4 bg-[var(--danger-bg)] border border-[var(--danger-border)] rounded-xl px-6 py-4 max-w-md mx-auto">
              <p className="text-[var(--danger-text)] font-semibold">Payment Rejected</p>
              <p className="text-[var(--danger-text)] text-sm mt-1">Reason: {subscription.rejectionReason}</p>
              <p className="text-[var(--danger-text)] text-sm">Please submit a new payment with correct details.</p>
            </div>
          )}
          {subscription?.status === 'suspended' && (
            <div className="mt-4 bg-[var(--danger-bg)] border border-[var(--danger-border)] rounded-xl px-6 py-4 max-w-md mx-auto">
              <p className="text-[var(--danger-text)] font-semibold">Account Suspended</p>
              <p className="text-[var(--danger-text)] text-sm mt-1">Please contact support to reactivate your account.</p>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Basic Plan */}
          <div className={`bg-[var(--bg-card)] border-2 rounded-3xl overflow-hidden transition-all hover:scale-105 ${selectedPlan === 'basic' ? 'border-[var(--accent)] shadow-xl shadow-[var(--accent)]/20' : 'border-[var(--border-primary)]'}`}>
            <div className="p-8">
              <h3 className="text-xl font-bold text-[var(--text-primary)] mb-2">Basic Plan</h3>
              <div className="text-4xl font-bold text-[var(--text-primary)] mb-1">
                {plans.basic?.price?.toLocaleString() || '6,000'} PKR
              </div>
              <p className="text-[var(--text-muted)] mb-6">/ month</p>
              
              <ul className="space-y-3 mb-8">
                {planFeatures.basic.map((feature, index) => (
                  <li key={index} className="flex items-center text-[var(--text-secondary)]">
                    <svg className="w-5 h-5 text-[var(--success-text)] mr-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    {feature}
                  </li>
                ))}
              </ul>
              
              <button
                onClick={() => handleBuyNow('basic')}
                disabled={!!pendingPayment}
                className="w-full bg-[var(--accent)] hover:bg-[var(--accent)] text-[var(--text-primary)] font-semibold py-3 px-6 rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Buy Now
              </button>
            </div>
          </div>

          {/* Advanced Plan */}
          <div className={`bg-[var(--bg-card)] border-2 rounded-3xl overflow-hidden transition-all hover:scale-105 ${selectedPlan === 'advanced' ? 'border-[var(--accent)] shadow-xl shadow-[var(--accent)]/20' : 'border-[var(--border-primary)]'}`}>
            <div className="bg-gradient-to-r from-[var(--accent)] to-[var(--accent-dark)] px-8 py-4 text-center">
              <span className="text-[var(--text-primary)] font-semibold text-sm uppercase tracking-wider">Most Popular</span>
            </div>
            <div className="p-8">
              <h3 className="text-xl font-bold text-[var(--text-primary)] mb-2">Advanced Plan</h3>
              <div className="text-4xl font-bold text-[var(--text-primary)] mb-1">
                {plans.advanced?.price?.toLocaleString() || '30,000'} PKR
              </div>
              <p className="text-[var(--text-muted)] mb-6">/ 6 months</p>
              
              <ul className="space-y-3 mb-8">
                {planFeatures.advanced.map((feature, index) => (
                  <li key={index} className="flex items-center text-[var(--text-secondary)]">
                    <svg className="w-5 h-5 text-[var(--success-text)] mr-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    {feature}
                  </li>
                ))}
              </ul>
              
              <button
                onClick={() => handleBuyNow('advanced')}
                disabled={!!pendingPayment}
                className="w-full bg-[var(--accent)] hover:bg-[var(--accent)] text-[var(--text-primary)] font-semibold py-3 px-6 rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Buy Now
              </button>
            </div>
          </div>

          {/* Premium Plan */}
          <div className={`bg-[var(--bg-card)] border-2 rounded-3xl overflow-hidden transition-all hover:scale-105 ${selectedPlan === 'premium' ? 'border-[var(--accent)] shadow-xl shadow-[var(--accent)]/20' : 'border-[var(--border-primary)]'}`}>
            <div className="p-8">
              <h3 className="text-xl font-bold text-[var(--text-primary)] mb-2">Premium Plan</h3>
              <div className="text-4xl font-bold text-[var(--text-primary)] mb-1">
                {plans.premium?.price?.toLocaleString() || '68,000'} PKR
              </div>
              <p className="text-[var(--text-muted)] mb-6">/ year</p>
              
              <ul className="space-y-3 mb-8">
                {planFeatures.premium.map((feature, index) => (
                  <li key={index} className="flex items-center text-[var(--text-secondary)]">
                    <svg className="w-5 h-5 text-[var(--success-text)] mr-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    {feature}
                  </li>
                ))}
              </ul>
              
              <button
                onClick={() => handleBuyNow('premium')}
                disabled={!!pendingPayment}
                className="w-full bg-[var(--accent)] hover:bg-[var(--accent)] text-[var(--text-primary)] font-semibold py-3 px-6 rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Buy Now
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SubscriptionPlan;
