import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { lazy, Suspense, useEffect, useState } from 'react';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { ToastProvider } from './contexts/ToastContext';
import { ThemeProvider } from './contexts/ThemeContext';
import ProtectedRoute from './components/ProtectedRoute';

const AboutUs = lazy(() => import('./pages/AboutUs'));
const Login = lazy(() => import('./pages/Login'));
const Register = lazy(() => import('./pages/Register'));
const ForgotPassword = lazy(() => import('./pages/ForgotPassword'));
const VerifyOTP = lazy(() => import('./pages/VerifyOTP'));
const ResetPassword = lazy(() => import('./pages/ResetPassword'));
const VerifyEmail = lazy(() => import('./pages/VerifyEmail'));
const AuthCallback = lazy(() => import('./pages/AuthCallback'));
const SchoolDashboard = lazy(() => import('./pages/SchoolDashboard'));
const SuperAdminDashboard = lazy(() => import('./pages/SuperAdminDashboard'));
const Students = lazy(() => import('./pages/Students'));
const StudentProfiles = lazy(() => import('./pages/StudentProfiles'));
const FeeManagement = lazy(() => import('./pages/FeeManagement'));
const Teachers = lazy(() => import('./pages/Teachers'));
const TeacherProfiles = lazy(() => import('./pages/TeacherProfiles'));
const Reports = lazy(() => import('./pages/Reports'));
const Settings = lazy(() => import('./pages/Settings'));

const PageTransition = ({ children }) => {
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    requestAnimationFrame(() => setVisible(true));
  }, []);
  return (
    <div className={`transition-all duration-200 ease-out ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'}`}>
      {children}
    </div>
  );
};

const LoadingFallback = () => (
  <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--bg-primary)' }}>
    <div className="w-8 h-8 border-2 border-[var(--accent)] border-t-transparent rounded-full animate-spin" />
  </div>
);

const RootRedirect = () => {
  const { user, loading } = useAuth();
  if (loading) return <LoadingFallback />;
  if (user) return <Navigate to={user.role === 'superadmin' ? '/super-admin' : '/dashboard'} replace />;
  return <Navigate to="/login" replace />;
};

function App() {
  return (
    <AuthProvider>
      <ThemeProvider>
        <ToastProvider>
          <Toaster position="top-right" toastOptions={{ duration: 4000 }} />
          <Router>
            <div className="min-h-screen" style={{ background: 'var(--bg-primary)' }}>
            <Suspense fallback={<LoadingFallback />}>
            <Routes>
            <Route path="/" element={<RootRedirect />} />
            <Route path="/about-us" element={<PageTransition><AboutUs /></PageTransition>} />
            <Route path="/login" element={<PageTransition><Login /></PageTransition>} />
            <Route path="/register" element={<PageTransition><Register /></PageTransition>} />
            <Route path="/forgot-password" element={<PageTransition><ForgotPassword /></PageTransition>} />
            <Route path="/verify-otp" element={<PageTransition><VerifyOTP /></PageTransition>} />
            <Route path="/reset-password" element={<PageTransition><ResetPassword /></PageTransition>} />
            <Route path="/verify-email" element={<PageTransition><VerifyEmail /></PageTransition>} />
            <Route path="/auth/callback" element={<PageTransition><AuthCallback /></PageTransition>} />
            <Route path="/dashboard" element={
              <ProtectedRoute>
                <PageTransition><SchoolDashboard /></PageTransition>
              </ProtectedRoute>
            } />
            <Route path="/students" element={
              <ProtectedRoute>
                <PageTransition><Students /></PageTransition>
              </ProtectedRoute>
            } />
            <Route path="/student-profiles" element={
              <ProtectedRoute>
                <PageTransition><StudentProfiles /></PageTransition>
              </ProtectedRoute>
            } />
            <Route path="/fee-management" element={
              <ProtectedRoute>
                <PageTransition><FeeManagement /></PageTransition>
              </ProtectedRoute>
            } />
            <Route path="/teachers" element={
              <ProtectedRoute>
                <PageTransition><Teachers /></PageTransition>
              </ProtectedRoute>
            } />
            <Route path="/teacher-profiles" element={
              <ProtectedRoute>
                <PageTransition><TeacherProfiles /></PageTransition>
              </ProtectedRoute>
            } />
            <Route path="/reports" element={
              <ProtectedRoute>
                <PageTransition><Reports /></PageTransition>
              </ProtectedRoute>
            } />
            <Route path="/settings" element={
              <ProtectedRoute>
                <PageTransition><Settings /></PageTransition>
              </ProtectedRoute>
            } />
            <Route path="/super-admin" element={
              <ProtectedRoute requireSuperAdmin>
                <PageTransition><SuperAdminDashboard /></PageTransition>
              </ProtectedRoute>
            } />
          </Routes>
          </Suspense>
        </div>
        </Router>
        </ToastProvider>
      </ThemeProvider>
    </AuthProvider>
  );
}

export default App;
