import { createContext, useState, useEffect, useContext, useCallback, useMemo } from 'react';
import axios from 'axios';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [subscription, setSubscription] = useState(null);
  const [school, setSchool] = useState(null);
  const [students, setStudents] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [googleAuthAvailable, setGoogleAuthAvailable] = useState(false);
  const [googleSimulated, setGoogleSimulated] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const savedSchool = localStorage.getItem('school');
    if (token) {
      const role = localStorage.getItem('role');
      const schoolData = savedSchool ? JSON.parse(savedSchool) : null;
      setUser({ token, role, school: schoolData });
      setSchool(schoolData);
    }
    axios.get('/api/auth/google/status')
      .then(res => {
        setGoogleAuthAvailable(res.data.available);
        setGoogleSimulated(res.data.simulated || false);
      })
      .catch(() => setGoogleAuthAvailable(false));
    setLoading(false);
  }, []);

  const setUserData = (data) => {
    localStorage.setItem('token', data.token);
    localStorage.setItem('role', data.role);
    if (data.school) {
      localStorage.setItem('school', JSON.stringify(data.school));
      setSchool(data.school);
    }
    setUser({ token: data.token, role: data.role, school: data.school });
    if (data.subscription) {
      setSubscription(data.subscription);
    }
  };

  const login = async (email, password, role) => {
    try {
      const res = await axios.post('/api/auth/login', { email, password, role });
      setUserData(res.data);
      return { success: true, role: res.data.role };
    } catch (err) {
      return {
        success: false,
        message: err.response?.data?.message || 'Login failed',
        code: err.response?.data?.code,
        email: err.response?.data?.email,
      };
    }
  };

  const register = async (data) => {
    try {
      const res = await axios.post('/api/auth/register', data);
      // Simple signup returns no token; the user logs in afterwards.
      if (res.data?.token) {
        setUserData(res.data);
        await checkSubscription();
      }
      return { success: true, role: res.data.role, data: res.data };
    } catch (err) {
      return { success: false, message: err.response?.data?.message || 'Registration failed' };
    }
  };

  const handleGoogleSimulate = async (email, name = '') => {
    try {
      const res = await axios.post('/api/auth/google-simulate', { email, name });
      setUserData(res.data);
      return { success: true, role: res.data.role, data: res.data };
    } catch (err) {
      return { success: false, message: err.response?.data?.message || 'Google sign-in failed' };
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    localStorage.removeItem('school');
    setUser(null);
    setSubscription(null);
    setSchool(null);
    setStudents([]);
    setTeachers([]);
  };

  const forgotPassword = async (email) => {
    try {
      await axios.post('/api/auth/forgot-password', { email });
      return { success: true };
    } catch (err) {
      return { success: false, message: err.response?.data?.message || 'Failed to send OTP' };
    }
  };

  const verifyOtp = async (email, otp) => {
    try {
      await axios.post('/api/auth/verify-otp', { email, otp });
      return { success: true };
    } catch (err) {
      return { success: false, message: err.response?.data?.message || 'OTP verification failed' };
    }
  };

  const resetPasswordOtp = async (email, password) => {
    try {
      await axios.post('/api/auth/reset-password-otp', { email, password });
      return { success: true };
    } catch (err) {
      return { success: false, message: err.response?.data?.message || 'Failed to reset password' };
    }
  };

  const checkSubscription = useCallback(async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return null;
      const res = await axios.get('/api/auth/subscription/status', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setSubscription(res.data);
      return res.data;
    } catch (err) {
      console.error('Failed to check subscription:', err);
      return null;
    }
  }, []);

  const getPlans = async () => {
    try {
      const res = await axios.get('/api/subscription/plans');
      return { success: true, plans: res.data.plans };
    } catch (err) {
      return { success: false, message: err.response?.data?.message || 'Failed to get plans' };
    }
  };

  const submitPayment = async (formData) => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.post('/api/subscription/payment', formData, {
        headers: { 
          Authorization: `Bearer ${token}`
        }
      });
      return { success: true, payment: res.data.payment };
    } catch (err) {
      return { success: false, message: err.response?.data?.message || 'Failed to submit payment' };
    }
  };

  const getPaymentHistory = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get('/api/subscription/payments/history', {
        headers: { Authorization: `Bearer ${token}` }
      });
      return { success: true, payments: res.data.payments };
    } catch (err) {
      return { success: false, message: err.response?.data?.message || 'Failed to get payment history' };
    }
  };

  const checkPendingPayment = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get('/api/subscription/payment/pending', {
        headers: { Authorization: `Bearer ${token}` }
      });
      return { success: true, pendingPayment: res.data.pendingPayment };
    } catch (err) {
      return { success: false, message: err.response?.data?.message || 'Failed to check pending payment' };
    }
  };

  // Super admin functions
  const getAllSchools = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get('/api/subscription/admin/schools', {
        headers: { Authorization: `Bearer ${token}` }
      });
      return { success: true, schools: res.data.schools };
    } catch (err) {
      return { success: false, message: err.response?.data?.message || 'Failed to get schools' };
    }
  };

  const getAllPayments = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get('/api/subscription/admin/payments', {
        headers: { Authorization: `Bearer ${token}` }
      });
      return { success: true, payments: res.data.payments };
    } catch (err) {
      return { success: false, message: err.response?.data?.message || 'Failed to get payments' };
    }
  };

  const approvePayment = async (paymentId) => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.post(`/api/subscription/admin/payment/${paymentId}/approve`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      return { success: true, data: res.data };
    } catch (err) {
      return { success: false, message: err.response?.data?.message || 'Failed to approve payment' };
    }
  };

  const rejectPayment = async (paymentId, reason) => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.post(`/api/subscription/admin/payment/${paymentId}/reject`, { reason }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      return { success: true, data: res.data };
    } catch (err) {
      return { success: false, message: err.response?.data?.message || 'Failed to reject payment' };
    }
  };

  const getSchoolDetails = async (schoolId) => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get(`/api/subscription/admin/school/${schoolId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      return { success: true, school: res.data.school, payments: res.data.payments };
    } catch (err) {
      return { success: false, message: err.response?.data?.message || 'Failed to get school details' };
    }
  };

  const toggleSuspendSchool = async (schoolId) => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.post(`/api/subscription/admin/school/${schoolId}/toggle-suspend`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      return { success: true, school: res.data.school };
    } catch (err) {
      return { success: false, message: err.response?.data?.message || 'Failed to toggle suspension' };
    }
  };

  const getAdminStats = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get('/api/subscription/admin/stats', {
        headers: { Authorization: `Bearer ${token}` }
      });
      return { success: true, stats: res.data.stats };
    } catch (err) {
      return { success: false, message: err.response?.data?.message || 'Failed to get stats' };
    }
  };

  const handleGoogleLogin = () => {
    window.location.href = 'http://localhost:5000/api/auth/google';
  };

  const updateSchool = (newSchoolData) => {
    localStorage.setItem('school', JSON.stringify(newSchoolData));
    setSchool(newSchoolData);
    setUser(prev => ({ ...prev, school: newSchoolData }));
  };

  const contextValue = useMemo(() => ({
    user, 
    loading, 
    login, 
    register, 
    logout, 
    forgotPassword, 
    verifyOtp,
    resetPasswordOtp,
    checkSubscription,
    getPlans,
    submitPayment,
    getPaymentHistory,
    checkPendingPayment,
    getAllSchools,
    getAllPayments,
    approvePayment,
    rejectPayment,
    getSchoolDetails,
    toggleSuspendSchool,
    getAdminStats,
    handleGoogleLogin,
    handleGoogleSimulate,
    subscription,
    setSubscription,
    setUser,
    school,
    updateSchool,
    students,
    setStudents,
    teachers,
    setTeachers,
    googleAuthAvailable,
    googleSimulated,
  }), [user, loading, subscription, school, googleAuthAvailable, googleSimulated, checkSubscription]);

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
