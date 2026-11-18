import { Fragment, useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import {
  GraduationCap,
  BookOpen,
  Calendar,
  ChartColumn,
  User,
  Lock,
  Eye,
  EyeOff,
  ArrowRight,
  LoaderCircle,
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import schoolBg from '../school.webp';
import RoleTabs from '../components/auth/RoleTabs';
import InputField from '../components/auth/InputField';
import SocialButtons from '../components/auth/SocialButtons';

// Left-hand feature highlights.
const FEATURES = [
  { icon: BookOpen, label: 'Students\nManagement' },
  { icon: Calendar, label: 'Attendance\nTracking' },
  { icon: ChartColumn, label: 'Reports &\nAnalytics' },
];

// Landing route for each role after a successful login.
const ROLE_HOME = {
  Admin: '/dashboard',
  Teacher: '/dashboard',
  Student: '/dashboard',
  Parent: '/dashboard',
};

const Login = () => {
  const { user, login } = useAuth();
  const navigate = useNavigate();

  const [selectedRole, setSelectedRole] = useState('Admin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  // Restore a remembered email address on first render.
  useEffect(() => {
    const savedEmail = localStorage.getItem('rememberedEmail');
    if (savedEmail) {
      setEmail(savedEmail);
      setRememberMe(true);
    }
  }, []);

  // If the user is already authenticated, send them to their dashboard.
  useEffect(() => {
    if (user) {
      navigate(user.role === 'superadmin' ? '/super-admin' : '/dashboard', { replace: true });
    }
  }, [user, navigate]);

  const validate = () => {
    const nextErrors = {};
    const username = email.trim();
    if (username.length < 3) {
      nextErrors.email = 'Username must be at least 3 characters';
    } else if (/\s/.test(username)) {
      nextErrors.email = 'Username cannot contain spaces';
    }
    if (password.length < 4) {
      nextErrors.password = 'Password must be at least 4 characters';
    }
    return nextErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const nextErrors = validate();
    setErrors(nextErrors);

    if (Object.keys(nextErrors).length > 0) {
      toast.error('Please fix the highlighted fields');
      return;
    }

    setLoading(true);
    try {
      // AuthContext POSTs { email, password, role } to /api/auth/login via axios.
      const result = await login(email.trim(), password, selectedRole.toLowerCase());

      if (result.success) {
        if (rememberMe) {
          localStorage.setItem('rememberedEmail', email.trim());
        } else {
          localStorage.removeItem('rememberedEmail');
        }
        toast.success(`Welcome back, ${selectedRole}!`);
        const target = result.role === 'superadmin' ? '/super-admin' : ROLE_HOME[selectedRole];
        navigate(target, { replace: true });
      } else {
        toast.error(result.message || 'Login failed. Please try again.');
      }
    } catch {
      toast.error('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen w-full overflow-hidden font-poppins">
      {/* Full-screen background image */}
      <img
        src={schoolBg}
        alt="MF School campus"
        className="absolute inset-0 h-full w-full object-cover"
      />
      <div className="relative z-10 mx-auto flex min-h-screen w-full max-w-[1440px] flex-col lg:flex-row">
        {/* ================= LEFT: HERO / BRANDING ================= */}
        <section className="flex-1 px-6 pb-6 pt-8 sm:px-10 lg:flex lg:flex-col lg:px-16 lg:py-12">
          {/* Logo (always visible) */}
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-[#7c3aed] to-[#6d28d9] shadow-lg shadow-purple-500/30">
              <GraduationCap className="h-6 w-6 text-white" strokeWidth={2.2} />
            </div>
            <div>
              <h1 className="text-xl font-bold leading-tight text-white drop-shadow">MF School Portal</h1>
              <p className="text-xs text-white/80 drop-shadow">Smart Education. Better Future.</p>
            </div>
          </div>

          {/* Hero content - hidden on small screens */}
          <div className="mt-14 hidden sm:block lg:mt-24">
            <h2 className="font-poppins text-6xl font-extrabold italic leading-[0.95] text-white drop-shadow-lg sm:text-7xl xl:text-[88px]">
              Welcome{' '}
              <span className="relative inline-block -rotate-[4deg] text-[#a78bfa] drop-shadow-lg">
                Back!
                {/* Curved underline swoosh */}
                <svg
                  className="absolute -bottom-3 left-0 h-5 w-full"
                  viewBox="0 0 200 20"
                  fill="none"
                  preserveAspectRatio="none"
                  aria-hidden="true"
                >
                  <path
                    d="M3 14C45 4 125 2 197 10"
                    stroke="#7c3aed"
                    strokeWidth="6"
                    strokeLinecap="round"
                  />
                </svg>
              </span>
            </h2>

            <div className="mt-12">
              <p className="text-xl font-bold text-white drop-shadow sm:text-2xl">Manage Your School Smartly</p>
              <p className="mt-1 text-lg font-semibold text-white drop-shadow">with Our Advanced Portal 🚀</p>
            </div>

            {/* Feature icons row */}
            <div className="mt-10 flex items-stretch gap-5 sm:gap-7">
              {FEATURES.map(({ icon: Icon, label }, index) => (
                <Fragment key={label}>
                  {index > 0 && <div className="w-px self-stretch bg-gray-300/70" />}
                  <div className="flex w-20 flex-col items-center text-center sm:w-24">
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#ede9fe]">
                      <Icon className="h-6 w-6 text-[#7c3aed]" strokeWidth={2} />
                    </div>
                    <p className="mt-2 whitespace-pre-line text-xs font-semibold leading-tight text-white drop-shadow">
                      {label}
                    </p>
                  </div>
                </Fragment>
              ))}
            </div>
          </div>
        </section>

        {/* ================= RIGHT: LOGIN CARD ================= */}
        <section className="flex flex-1 items-center justify-center px-4 pb-10 sm:px-10 lg:px-16">
          <div className="w-[90%] max-w-[420px] rounded-2xl border border-white/60 bg-white/90 p-7 shadow-xl shadow-purple-500/20 backdrop-blur-md transition-all duration-300 sm:p-8">
            {/* Role tabs */}
            <RoleTabs value={selectedRole} onChange={setSelectedRole} />

            {/* Heading */}
            <div className="mt-6 text-center">
              <h3 className="text-[22px] font-bold text-[#1e1b4b]">Login to Your Account</h3>
              <p className="mt-1 text-sm text-gray-500">Enter your credentials to continue</p>
            </div>

            {/* Form */}
            <form className="mt-6 space-y-4" onSubmit={handleSubmit} noValidate>
              <InputField
                icon={User}
                type="text"
                name="username"
                placeholder="Enter Username"
                autoComplete="username"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (errors.email) setErrors((prev) => ({ ...prev, email: '' }));
                }}
                error={errors.email}
              />

              <InputField
                icon={Lock}
                type={showPassword ? 'text' : 'password'}
                name="password"
                placeholder="Enter Password"
                autoComplete="current-password"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  if (errors.password) setErrors((prev) => ({ ...prev, password: '' }));
                }}
                error={errors.password}
                rightElement={
                  <button
                    type="button"
                    onClick={() => setShowPassword((prev) => !prev)}
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                    className="flex h-9 w-9 items-center justify-center rounded-lg text-gray-400 transition-colors duration-200 hover:text-[#7c3aed]"
                  >
                    {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                }
              />

              {/* Remember me + forgot password */}
              <div className="flex items-center justify-between">
                <label className="flex cursor-pointer select-none items-center gap-2 text-sm text-gray-600">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="h-4 w-4 rounded border-gray-300 accent-[#7c3aed]"
                  />
                  Remember Me
                </label>
                <Link
                  to="/forgot-password"
                  className="text-sm font-semibold text-[#7c3aed] transition-colors duration-200 hover:underline"
                >
                  Forgot Password?
                </Link>
              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={loading}
                className="group flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#8b5cf6] to-[#7c3aed] font-bold text-white transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-purple-500/40 disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:translate-y-0 disabled:hover:shadow-none"
              >
                {loading ? (
                  <>
                    <LoaderCircle className="h-5 w-5 animate-spin" />
                    Logging in...
                  </>
                ) : (
                  <>
                    Login
                    <ArrowRight className="h-5 w-5 transition-transform duration-200 group-hover:translate-x-1" />
                  </>
                )}
              </button>
            </form>

            {/* Divider */}
            <div className="my-6 flex items-center gap-3">
              <div className="h-px flex-1 bg-gray-200" />
              <span className="text-xs text-gray-400">or continue with</span>
              <div className="h-px flex-1 bg-gray-200" />
            </div>

            {/* Social buttons */}
            <SocialButtons
              onSelect={(provider) => toast(`${provider} sign-in is coming soon`, { icon: '🔗' })}
            />

            {/* Footer */}
            <p className="mt-6 text-center text-xs text-gray-500">
              Don't have an account?{' '}
              <Link
                to="/register"
                className="font-semibold text-[#7c3aed] transition-colors duration-200 hover:underline"
              >
                Sign Up
              </Link>
            </p>
          </div>
        </section>
      </div>
    </div>
  );
};

export default Login;
