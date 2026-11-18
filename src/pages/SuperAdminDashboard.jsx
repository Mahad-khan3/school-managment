import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { 
  Search, School, Users, DollarSign, Clock, CheckCircle, XCircle, LogOut,
  Ban, Eye, Calendar, User, Phone
} from 'lucide-react';

const SuperAdminDashboard = () => {
  const { logout, getAllSchools, getAllPayments, approvePayment, rejectPayment, getAdminStats, toggleSuspendSchool, getSchoolDetails } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('dashboard'); // dashboard, schools, payments
  const [schools, setSchools] = useState([]);
  const [payments, setPayments] = useState([]);
  const [stats, setStats] = useState(null);
  const [search, setSearch] = useState('');
  const [error, setError] = useState('');
  const [selectedSchool, setSelectedSchool] = useState(null);
  const [showSchoolDetails, setShowSchoolDetails] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectPaymentId, setRejectPaymentId] = useState(null);
  const [rejectReason, setRejectReason] = useState('');
  const [showScreenshot, setShowScreenshot] = useState(null);
  const [loadingScreenshot, setLoadingScreenshot] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setError('');
    try {
      const [schoolsRes, paymentsRes, statsRes] = await Promise.all([
        getAllSchools(),
        getAllPayments(),
        getAdminStats()
      ]);
      
      console.log('Schools Response:', schoolsRes);
      console.log('Payments Response:', paymentsRes);
      console.log('Stats Response:', statsRes);
      
      if (schoolsRes.success) {
        setSchools(schoolsRes.schools || []);
      } else {
        console.error('Schools Error:', schoolsRes.message);
      }
      
      if (paymentsRes.success) {
        setPayments(paymentsRes.payments || []);
      } else {
        console.error('Payments Error:', paymentsRes.message);
      }
      
      if (statsRes.success) {
        setStats(statsRes.stats);
      } else {
        console.error('Stats Error:', statsRes.message);
      }
      
    } catch (err) {
      console.error('Fetch Error:', err);
      setError(err.message || 'Failed to load data');
    }
  };

  const handleApprovePayment = async (paymentId) => {
    if (!confirm('Approve this payment?')) return;
    const res = await approvePayment(paymentId);
    if (res.success) {
      fetchData();
    } else {
      alert(res.message || 'Failed to approve payment');
    }
  };

  const handleRejectPayment = async (paymentId) => {
    setRejectPaymentId(paymentId);
    setRejectReason('');
    setShowRejectModal(true);
  };

  const confirmRejectPayment = async () => {
    if (!rejectReason.trim()) {
      alert('Please enter a rejection reason');
      return;
    }
    const res = await rejectPayment(rejectPaymentId, rejectReason);
    setShowRejectModal(false);
    setRejectPaymentId(null);
    setRejectReason('');
    if (res.success) {
      fetchData();
    } else {
      alert(res.message || 'Failed to reject payment');
    }
  };

  const handleToggleSuspend = async (schoolId) => {
    const res = await toggleSuspendSchool(schoolId);
    if (res.success) {
      fetchData();
    } else {
      alert(res.message || 'Failed to update school status');
    }
  };

  const handleViewSchool = async (schoolId) => {
    const res = await getSchoolDetails(schoolId);
    if (res.success) {
      setSelectedSchool({ school: res.school, payments: res.payments });
      setShowSchoolDetails(true);
    } else {
      alert(res.message || 'Failed to load school details');
    }
  };

  const fetchScreenshot = async (paymentId) => {
    setLoadingScreenshot(true);
    setShowScreenshot(null);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`/api/subscription/admin/payment/${paymentId}/screenshot`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.screenshot) {
        setShowScreenshot(data.screenshot);
      } else {
        alert('Screenshot not found');
      }
    } catch (err) {
      alert('Failed to load screenshot');
    }
    setLoadingScreenshot(false);
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return 'N/A';
    return new Date(dateStr).toLocaleDateString();
  };

  const formatTime = (dateStr) => {
    if (!dateStr) return 'N/A';
    return new Date(dateStr).toLocaleTimeString();
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'trial': return 'bg-[var(--warning-bg)] text-[var(--warning-text)]';
      case 'active': return 'bg-[var(--success-bg)] text-[var(--success-text)]';
      case 'expired': return 'bg-[var(--danger-bg)] text-[var(--danger-text)]';
      case 'suspended': return 'bg-[var(--danger-bg)] text-[var(--danger-text)]';
      case 'pending': return 'bg-[var(--warning-bg)] text-[var(--warning-text)]';
      case 'approved': return 'bg-[var(--success-bg)] text-[var(--success-text)]';
      case 'rejected': return 'bg-[var(--danger-bg)] text-[var(--danger-text)]';
      default: return 'bg-[var(--bg-input)] text-[var(--text-muted)]';
    }
  };

  const formatRemainingTime = (ms) => {
    if (!ms || ms <= 0) return 'Expired';
    const days = Math.floor(ms / (1000 * 60 * 60 * 24));
    const hours = Math.floor((ms % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((ms % (1000 * 60 * 60)) / (1000 * 60));
    return `${days}d ${hours}h ${minutes}m`;
  };

  const getPlanName = (plan) => {
    switch (plan) {
      case 'basic': return 'Basic';
      case 'advanced': return 'Advanced';
      case 'premium': return 'Premium';
      case 'trial': return 'Trial';
      default: return plan || 'Trial';
    }
  };

  const filteredSchools = schools.filter(s =>
    !search || 
    (s.schoolName && s.schoolName.toLowerCase().includes(search.toLowerCase())) ||
    (s.email && s.email.toLowerCase().includes(search.toLowerCase())) ||
    (s.adminName && s.adminName.toLowerCase().includes(search.toLowerCase()))
  );

  const filteredPayments = payments.filter(p =>
    !search ||
    (p.school?.schoolName && p.school.schoolName.toLowerCase().includes(search.toLowerCase())) ||
    (p.school?.email && p.school.email.toLowerCase().includes(search.toLowerCase())) ||
    (p.transactionId && p.transactionId.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="min-h-screen bg-[var(--bg-input)]">
      {/* Navbar */}
      <nav className="sticky top-0 z-50 bg-[var(--bg-header)] backdrop-blur-md border-b border-[var(--border-primary)]">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-36 h-14">
                <img src="/logo.png" alt="SchoolCRM Logo" className="w-full h-full object-contain" />
              </div>
            </div>
          <div className="flex items-center gap-4">
            <span className="text-[var(--text-secondary)] text-sm">Welcome, Super Admin</span>
            <button onClick={() => { logout(); navigate('/login') }}
              className="flex items-center gap-2 bg-[var(--danger-bg)] text-[var(--danger-text)] px-4 py-2 rounded-xl hover:bg-[var(--danger-bg)] transition">
              <LogOut size={16} /> Logout
            </button>
          </div>
        </div>
      </nav>

      {error && (
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="bg-[var(--danger-bg)] border border-[var(--danger-border)] rounded-xl p-4">
            <p className="text-[var(--danger-text)]">{error}</p>
          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Tabs */}
        <div className="flex gap-4 mb-8 border-b border-[var(--border-primary)]">
          <button
            onClick={() => setActiveTab('dashboard')}
            className={`pb-4 px-2 font-medium transition ${activeTab === 'dashboard' ? 'text-[var(--accent)] border-b-2 border-[var(--accent)]' : 'text-[var(--text-muted)] hover:text-[var(--text-primary)]'}`}
          >
            Dashboard
          </button>
          <button
            onClick={() => setActiveTab('schools')}
            className={`pb-4 px-2 font-medium transition ${activeTab === 'schools' ? 'text-[var(--accent)] border-b-2 border-[var(--accent)]' : 'text-[var(--text-muted)] hover:text-[var(--text-primary)]'}`}
          >
            Schools ({schools.length})
          </button>
          <button
            onClick={() => setActiveTab('payments')}
            className={`pb-4 px-2 font-medium transition ${activeTab === 'payments' ? 'text-[var(--accent)] border-b-2 border-[var(--accent)]' : 'text-[var(--text-muted)] hover:text-[var(--text-primary)]'}`}
          >
            Payment Requests ({payments.filter(p => p.paymentStatus === 'pending').length})
          </button>
        </div>

        {/* Dashboard Tab */}
        {activeTab === 'dashboard' && stats && (
          <>
            {/* Analytics Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-4 mb-8">
              {[
                { label: 'Total Schools', value: stats.totalSchools || 0, icon: School, color: 'from-[var(--accent)] to-[var(--accent-dark)]' },
                { label: 'Trial Schools', value: stats.trialSchools || 0, icon: Clock, color: 'from-yellow-600 to-yellow-400' },
                { label: 'Active Schools', value: stats.activeSchools || 0, icon: CheckCircle, color: 'from-green-600 to-green-400' },
                { label: 'Expired Schools', value: stats.expiredSchools || 0, icon: XCircle, color: 'from-red-600 to-red-400' },
                { label: 'Suspended Schools', value: stats.suspendedSchools || 0, icon: Ban, color: 'from-orange-600 to-orange-400' },
              ].map((stat, i) => {
                const Icon = stat.icon;
                return (
                  <div key={i} className="bg-[var(--bg-card)] border border-[var(--border-primary)] rounded-2xl p-5">
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="text-[var(--text-secondary)] text-sm mb-1">{stat.label}</p>
                        <p className="text-2xl font-bold text-[var(--text-primary)]">{stat.value}</p>
                      </div>
                      <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${stat.color} flex items-center justify-center`}>
                        <Icon size={20} className="text-[var(--text-primary)]" />
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
              {[
                { label: 'Pending Payments', value: stats.pendingPayments || 0, icon: Clock, color: 'from-yellow-600 to-yellow-400' },
                { label: 'Approved Payments', value: stats.approvedPayments || 0, icon: CheckCircle, color: 'from-green-600 to-green-400' },
                { label: 'Total Revenue', value: `PKR ${(stats.totalRevenue || 0).toLocaleString()}`, icon: DollarSign, color: 'from-amber-600 to-amber-400' },
              ].map((stat, i) => {
                const Icon = stat.icon;
                return (
                  <div key={i} className="bg-[var(--bg-card)] border border-[var(--border-primary)] rounded-2xl p-5">
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="text-[var(--text-secondary)] text-sm mb-1">{stat.label}</p>
                        <p className="text-2xl font-bold text-[var(--text-primary)]">{stat.value}</p>
                      </div>
                      <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${stat.color} flex items-center justify-center`}>
                        <Icon size={20} className="text-[var(--text-primary)]" />
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Recent Schools */}
              <div className="bg-[var(--bg-card)] border border-[var(--border-primary)] rounded-2xl p-6">
                <h3 className="text-lg font-bold text-[var(--text-primary)] mb-4">Recently Registered Schools</h3>
                {stats.recentSchools && stats.recentSchools.length > 0 ? (
                  <div className="space-y-3">
                    {stats.recentSchools.map((school, i) => (
                      <div key={i} className="flex items-center justify-between p-3 bg-[var(--bg-input)] rounded-xl">
                        <div>
                          <p className="text-[var(--text-primary)] font-medium">{school.schoolName || 'Unnamed School'}</p>
                          <p className="text-sm text-[var(--text-muted)]">{school.email}</p>
                        </div>
                        <p className="text-sm text-[var(--text-muted)]">{formatDate(school.signUpDate)}</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-[var(--text-muted)] text-center py-8">No recent schools</p>
                )}
              </div>

              {/* Expiring Soon */}
              <div className="bg-[var(--bg-card)] border border-[var(--border-primary)] rounded-2xl p-6">
                <h3 className="text-lg font-bold text-[var(--text-primary)] mb-4">Schools Expiring Soon</h3>
                {stats.expiringSoonSchools && stats.expiringSoonSchools.length > 0 ? (
                  <div className="space-y-3">
                    {stats.expiringSoonSchools.map((school, i) => (
                      <div key={i} className="flex items-center justify-between p-3 bg-[var(--bg-input)] rounded-xl">
                        <div>
                          <p className="text-[var(--text-primary)] font-medium">{school.schoolName || 'Unnamed School'}</p>
                          <p className="text-sm text-[var(--warning-text)]">{formatRemainingTime(school.remainingTime)}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-[var(--text-muted)] text-center py-8">No schools expiring soon</p>
                )}
              </div>
            </div>
          </>
        )}

        {/* Schools Tab */}
        {activeTab === 'schools' && (
          <>
            <div className="relative mb-6">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--text-secondary)]" size={18} />
              <input type="text" placeholder="Search schools by name, email, or admin..."
                value={search} onChange={(e) => setSearch(e.target.value)}
                className="w-full bg-[var(--bg-card)] border border-[var(--border-primary)] rounded-xl pl-12 pr-4 py-3 text-[var(--text-primary)] focus:border-[var(--accent)] focus:outline-none" />
            </div>

            <div className="bg-[var(--bg-card)] border border-[var(--border-primary)] rounded-2xl overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-[var(--border-primary)] bg-[var(--bg-input)]/50">
                      <th className="text-left py-4 px-6 text-[var(--text-secondary)] font-medium">School Name</th>
                      <th className="text-left py-4 px-6 text-[var(--text-secondary)] font-medium">Admin</th>
                      <th className="text-left py-4 px-6 text-[var(--text-secondary)] font-medium">Email</th>
                      <th className="text-left py-4 px-6 text-[var(--text-secondary)] font-medium">Sign Up</th>
                      <th className="text-left py-4 px-6 text-[var(--text-secondary)] font-medium">Last Login</th>
                      <th className="text-left py-4 px-6 text-[var(--text-secondary)] font-medium">Status</th>
                      <th className="text-left py-4 px-6 text-[var(--text-secondary)] font-medium">Remaining</th>
                      <th className="text-left py-4 px-6 text-[var(--text-secondary)] font-medium">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredSchools.length === 0 ? (
                      <tr>
                        <td colSpan="8" className="text-center py-12 text-[var(--text-secondary)]">No schools found</td>
                      </tr>
                    ) : (
                      filteredSchools.map((school) => (
                        <tr key={school._id} className="border-b border-[var(--border-primary)]/50 hover:bg-[var(--bg-hover)]">
                          <td className="py-4 px-6 text-[var(--text-primary)] font-medium">{school.schoolName || 'Unnamed School'}</td>
                          <td className="py-4 px-6 text-[var(--text-primary)]">{school.adminName || 'N/A'}</td>
                          <td className="py-4 px-6 text-[var(--text-primary)]">{school.email}</td>
                          <td className="py-4 px-6 text-[var(--text-muted)]">
                            {formatDate(school.signUpDate || school.createdAt)} {formatTime(school.signUpTime || school.createdAt)}
                          </td>
                          <td className="py-4 px-6 text-[var(--text-muted)]">
                            {formatDate(school.lastLoginDate || school.createdAt)} {formatTime(school.lastLoginTime || school.createdAt)}
                          </td>
                          <td className="py-4 px-6">
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(school.calculatedStatus || school.status || 'trial')}`}>
                              {(school.calculatedStatus || school.status || 'trial').charAt(0).toUpperCase() + (school.calculatedStatus || school.status || 'trial').slice(1)}
                            </span>
                          </td>
                          <td className="py-4 px-6 text-[var(--text-muted)]">
                            {formatRemainingTime(school.remainingTime)}
                          </td>
                          <td className="py-4 px-6">
                            <div className="flex gap-2">
                              <button onClick={() => handleViewSchool(school._id)}
                                className="flex items-center gap-1 bg-[var(--accent-light)] text-[var(--accent)] px-3 py-1.5 rounded-lg text-xs hover:bg-[var(--accent-light)] transition">
                                <Eye size={14} /> View
                              </button>
                              <button onClick={() => handleToggleSuspend(school._id)}
                                className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs transition ${
                                  school.status === 'suspended' || school.calculatedStatus === 'suspended'
                                    ? 'bg-[var(--success-bg)] text-[var(--success-text)] hover:bg-[var(--success-bg)]'
                                    : 'bg-[var(--danger-bg)] text-[var(--danger-text)] hover:bg-[var(--danger-bg)]'
                                }`}>
                                {school.status === 'suspended' || school.calculatedStatus === 'suspended' ? (
                                  <> <CheckCircle size={14} /> Activate </>
                                ) : (
                                  <> <Ban size={14} /> Suspend </>
                                )}
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}

        {/* Payments Tab */}
        {activeTab === 'payments' && (
          <>
            <div className="relative mb-6">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--text-secondary)]" size={18} />
              <input type="text" placeholder="Search payments by school name, email, or transaction ID..."
                value={search} onChange={(e) => setSearch(e.target.value)}
                className="w-full bg-[var(--bg-card)] border border-[var(--border-primary)] rounded-xl pl-12 pr-4 py-3 text-[var(--text-primary)] focus:border-[var(--accent)] focus:outline-none" />
            </div>

            <div className="bg-[var(--bg-card)] border border-[var(--border-primary)] rounded-2xl overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-[var(--border-primary)] bg-[var(--bg-input)]/50">
                      <th className="text-left py-4 px-6 text-[var(--text-secondary)] font-medium">School</th>
                      <th className="text-left py-4 px-6 text-[var(--text-secondary)] font-medium">Plan</th>
                      <th className="text-left py-4 px-6 text-[var(--text-secondary)] font-medium">Amount</th>
                      <th className="text-left py-4 px-6 text-[var(--text-secondary)] font-medium">Transaction ID</th>
                      <th className="text-left py-4 px-6 text-[var(--text-secondary)] font-medium">Screenshot</th>
                      <th className="text-left py-4 px-6 text-[var(--text-secondary)] font-medium">Date</th>
                      <th className="text-left py-4 px-6 text-[var(--text-secondary)] font-medium">Status</th>
                      <th className="text-left py-4 px-6 text-[var(--text-secondary)] font-medium">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredPayments.length === 0 ? (
                      <tr>
                        <td colSpan="8" className="text-center py-12 text-[var(--text-secondary)]">No payment requests found</td>
                      </tr>
                    ) : (
                      filteredPayments.map((payment) => (
                        <tr key={payment._id} className="border-b border-[var(--border-primary)]/50 hover:bg-[var(--bg-hover)]">
                          <td className="py-4 px-6 text-[var(--text-primary)] font-medium">{payment.school?.schoolName || 'Unknown School'}</td>
                          <td className="py-4 px-6 text-[var(--text-primary)]">{getPlanName(payment.plan)}</td>
                          <td className="py-4 px-6 text-[var(--text-primary)]">PKR {(payment.amount || 0).toLocaleString()}</td>
                      <td className="py-4 px-6 text-[var(--text-muted)] font-mono">{payment.transactionId}</td>
                      <td className="py-4 px-6">
                        {payment.hasScreenshot ? (
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => fetchScreenshot(payment._id)}
                              className="flex items-center gap-1 bg-[var(--accent)]/20 text-[var(--accent)] px-2 py-1.5 rounded-lg text-xs hover:bg-[var(--accent)]/30 transition"
                            >
                              <Eye size={14} /> View Screenshot
                            </button>
                          </div>
                        ) : (
                          <span className="text-[var(--text-muted)] text-sm">No screenshot</span>
                        )}
                      </td>
                      <td className="py-4 px-6 text-[var(--text-muted)]">
                        {formatDate(payment.paymentDate || payment.createdAt)} {formatTime(payment.paymentTime || payment.createdAt)}
                          </td>
                          <td className="py-4 px-6">
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(payment.paymentStatus)}`}>
                              {(payment.paymentStatus || 'pending').charAt(0).toUpperCase() + (payment.paymentStatus || 'pending').slice(1)}
                            </span>
                            {payment.paymentStatus === 'rejected' && payment.rejectionReason && (
                              <div className="mt-1 text-[10px] text-[var(--danger-text)] max-w-[150px] truncate" title={payment.rejectionReason}>
                                Reason: {payment.rejectionReason}
                              </div>
                            )}
                          </td>
                          <td className="py-4 px-6">
                            {payment.paymentStatus === 'pending' && (
                              <div className="flex gap-2">
                                <button onClick={() => handleApprovePayment(payment._id)}
                                  className="flex items-center gap-1 bg-[var(--success-bg)] text-[var(--success-text)] px-3 py-1.5 rounded-lg text-xs hover:bg-[var(--success-bg)] transition">
                                  <CheckCircle size={14} /> Approve
                                </button>
                                <button onClick={() => handleRejectPayment(payment._id)}
                                  className="flex items-center gap-1 bg-[var(--danger-bg)] text-[var(--danger-text)] px-3 py-1.5 rounded-lg text-xs hover:bg-[var(--danger-bg)] transition">
                                  <XCircle size={14} /> Reject
                                </button>
                              </div>
                            )}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}
      </div>

      {/* School Details Modal */}
      {showSchoolDetails && selectedSchool && (
        <div className="fixed inset-0 bg-[var(--bg-overlay)] flex items-center justify-center z-50 p-4">
          <div className="bg-[var(--bg-card)] border border-[var(--border-primary)] rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-[var(--border-primary)] flex items-center justify-between">
              <h2 className="text-xl font-bold text-[var(--text-primary)]">School Details</h2>
              <button onClick={() => { setShowSchoolDetails(false); setSelectedSchool(null); }}
                className="text-[var(--text-muted)] hover:text-[var(--text-primary)]">
                <XCircle size={24} />
              </button>
            </div>
            
            <div className="p-6">
              <div className="space-y-4 mb-8">
                <div>
                  <h3 className="text-[var(--text-muted)] text-sm mb-1">School Name</h3>
                  <p className="text-[var(--text-primary)] text-lg font-medium">{selectedSchool.school.schoolName || 'Unnamed School'}</p>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h3 className="text-[var(--text-muted)] text-sm mb-1">Admin Name</h3>
                    <p className="text-[var(--text-primary)] flex items-center gap-2">
                      <User size={16} className="text-[var(--accent)]" />
                      {selectedSchool.school.adminName || 'N/A'}
                    </p>
                  </div>
                  <div>
                    <h3 className="text-[var(--text-muted)] text-sm mb-1">Email</h3>
                    <p className="text-[var(--text-primary)]">{selectedSchool.school.email}</p>
                  </div>
                  <div>
                    <h3 className="text-[var(--text-muted)] text-sm mb-1">Phone</h3>
                    <p className="text-[var(--text-primary)] flex items-center gap-2">
                      <Phone size={16} className="text-[var(--accent)]" />
                      {selectedSchool.school.phone || 'N/A'}
                    </p>
                  </div>
                  <div>
                    <h3 className="text-[var(--text-muted)] text-sm mb-1">Status</h3>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(selectedSchool.school.status)}`}>
                      {(selectedSchool.school.status || 'trial').charAt(0).toUpperCase() + (selectedSchool.school.status || 'trial').slice(1)}
                    </span>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h3 className="text-[var(--text-muted)] text-sm mb-1">Sign Up Date</h3>
                    <p className="text-[var(--text-primary)] flex items-center gap-2">
                      <Calendar size={16} className="text-[var(--accent)]" />
                      {formatDate(selectedSchool.school.signUpDate || selectedSchool.school.createdAt)} {formatTime(selectedSchool.school.signUpTime || selectedSchool.school.createdAt)}
                    </p>
                  </div>
                  <div>
                    <h3 className="text-[var(--text-muted)] text-sm mb-1">Last Login</h3>
                    <p className="text-[var(--text-primary)] flex items-center gap-2">
                      <Clock size={16} className="text-[var(--accent)]" />
                      {formatDate(selectedSchool.school.lastLoginDate || selectedSchool.school.createdAt)} {formatTime(selectedSchool.school.lastLoginTime || selectedSchool.school.createdAt)}
                    </p>
                  </div>
                </div>
                {selectedSchool.school.subscription && (
                  <div className="pt-4 border-t border-[var(--border-primary)]">
                    <h3 className="text-[var(--text-primary)] font-medium mb-3">Current Subscription</h3>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-[var(--text-muted)] text-sm">Plan</p>
                        <p className="text-[var(--text-primary)]">{getPlanName(selectedSchool.school.subscription.plan)}</p>
                      </div>
                      {selectedSchool.school.subscription.plan !== 'trial' && (
                        <>
                          <div>
                            <p className="text-[var(--text-muted)] text-sm">Start Date</p>
                            <p className="text-[var(--text-primary)]">{formatDate(selectedSchool.school.subscription.subscriptionStartDate)}</p>
                          </div>
                          <div>
                            <p className="text-[var(--text-muted)] text-sm">End Date</p>
                            <p className="text-[var(--text-primary)]">{formatDate(selectedSchool.school.subscription.subscriptionEndDate)}</p>
                          </div>
                        </>
                      )}
                      {selectedSchool.school.subscription.plan === 'trial' && (
                        <>
                          <div>
                            <p className="text-[var(--text-muted)] text-sm">Trial Start</p>
                            <p className="text-[var(--text-primary)]">{formatDate(selectedSchool.school.subscription.trialStartDate)}</p>
                          </div>
                          <div>
                            <p className="text-[var(--text-muted)] text-sm">Trial End</p>
                            <p className="text-[var(--text-primary)]">{formatDate(selectedSchool.school.subscription.trialEndDate)}</p>
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                )}
              </div>

              <div className="pt-4 border-t border-[var(--border-primary)]">
                <h3 className="text-[var(--text-primary)] font-medium mb-4">Payment History</h3>
                {selectedSchool.payments && selectedSchool.payments.length > 0 ? (
                  <div className="space-y-3">
                    {selectedSchool.payments.map((payment, i) => (
                      <div key={i} className="bg-[var(--bg-input)] rounded-xl p-4">
                        <div className="flex items-center justify-between mb-2">
                          <div>
                            <p className="text-[var(--text-primary)] font-medium">{getPlanName(payment.plan)} Plan</p>
                            <p className="text-sm text-[var(--text-muted)]">PKR {(payment.amount || 0).toLocaleString()}</p>
                          </div>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(payment.paymentStatus)}`}>
                            {(payment.paymentStatus || 'pending').charAt(0).toUpperCase() + (payment.paymentStatus || 'pending').slice(1)}
                          </span>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                          <p className="text-[var(--text-muted)] font-mono">TXN: {payment.transactionId}</p>
                          <p className="text-[var(--text-muted)]">{formatDate(payment.paymentDate || payment.createdAt)}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-[var(--text-muted)] text-center py-4">No payment history</p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Reject Payment Modal */}
      {showRejectModal && (
        <div className="fixed inset-0 bg-[var(--bg-overlay)] z-50 flex items-center justify-center p-4" onClick={() => setShowRejectModal(false)}>
          <div className="bg-[var(--bg-card)] border border-[var(--border-primary)] rounded-2xl w-full max-w-md p-6" onClick={e => e.stopPropagation()}>
            <h3 className="text-xl font-bold text-[var(--text-primary)] mb-2">Reject Payment</h3>
            <p className="text-[var(--text-secondary)] text-sm mb-4">Enter the reason for rejecting this payment request.</p>
            <textarea
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              placeholder="Enter rejection reason..."
              className="w-full bg-[var(--bg-input)] border border-[var(--border-primary)] rounded-xl px-4 py-3 text-[var(--text-primary)] focus:border-[var(--accent)] focus:outline-none min-h-[100px] resize-none mb-4"
            />
            <div className="flex gap-3">
              <button onClick={() => setShowRejectModal(false)}
                className="flex-1 bg-[var(--border-primary)] text-[var(--text-primary)] py-3 rounded-xl font-semibold hover:opacity-90 transition">
                Cancel
              </button>
              <button onClick={confirmRejectPayment}
                disabled={!rejectReason.trim()}
                className="flex-1 bg-[var(--danger-text)] text-[var(--text-primary)] py-3 rounded-xl font-semibold hover:bg-[var(--danger-border)] transition disabled:opacity-50">
                Confirm Reject
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Screenshot Viewer Modal */}
      {(showScreenshot || loadingScreenshot) && (
        <div className="fixed inset-0 bg-[var(--bg-overlay)] z-50 flex items-center justify-center p-4" onClick={() => { setShowScreenshot(null); setLoadingScreenshot(false); }}>
          <div className="relative max-w-2xl w-full" onClick={e => e.stopPropagation()}>
            <button onClick={() => { setShowScreenshot(null); setLoadingScreenshot(false); }}
              className="absolute -top-10 right-0 text-[var(--text-primary)] hover:text-[var(--text-secondary)] transition">
              Close [X]
            </button>
            {loadingScreenshot && !showScreenshot ? (
              <div className="flex items-center justify-center py-20">
                <div className="w-8 h-8 border-2 border-[var(--accent)] border-t-transparent rounded-full animate-spin" />
              </div>
            ) : (
              <img src={showScreenshot} alt="Payment Screenshot" className="w-full rounded-xl border border-[var(--border-primary)]" />
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default SuperAdminDashboard;
