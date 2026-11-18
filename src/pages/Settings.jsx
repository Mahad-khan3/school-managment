import { useState } from 'react';
import axios from 'axios';
import DashboardLayout from '../components/DashboardLayout';
import { useAuth } from '../contexts/AuthContext';
import { Camera, Save } from 'lucide-react';

const Settings = () => {
  const { school, updateSchool } = useAuth();
  const [form, setForm] = useState({
    schoolName: school?.schoolName || '',
    address: school?.address || '',
    phone: school?.phone || '',
    password: '',
    confirmPassword: '',
  });
  const [logo, setLogo] = useState(null);
  const [logoPreview, setLogoPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleLogoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setLogo(file);
      setLogoPreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    if (form.password && form.password !== form.confirmPassword) {
      setMessage('Passwords do not match');
      return;
    }
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const formData = new FormData();
      formData.append('schoolName', form.schoolName);
      formData.append('address', form.address);
      formData.append('phone', form.phone);
      if (form.password) formData.append('password', form.password);
      if (logo) formData.append('logo', logo);
      const res = await axios.put('/api/settings', formData, {
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'multipart/form-data' },
      });
      updateSchool({ ...school, schoolName: form.schoolName, address: form.address, phone: form.phone, logo: res.data.logo });
      setMessage('Settings saved successfully!');
    } catch (err) {
      setMessage(err.response?.data?.message || 'Failed to save settings. Make sure you selected a valid image file.');
    }
    setLoading(false);
  };

  const currentLogo = logoPreview || (school?.logo ? school.logo : null);

  const inputStyle = "w-full rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-purple-500/20 transition-all duration-200 border";

  return (
    <DashboardLayout>
      <h2 className="text-2xl font-bold mb-6" style={{ color: 'var(--text-primary)' }}>School Settings</h2>

      {message && (
        <div className={`mb-6 px-6 py-3 rounded-xl border ${
          message.includes('success') ? 'bg-[var(--success-bg)] border-[var(--success-border)] text-[var(--success-text)]' : 'bg-[var(--danger-bg)] border-[var(--danger-border)] text-[var(--danger-text)]'
        }`}>
          {message}
        </div>
      )}

      <div className="max-w-2xl p-8 rounded-2xl transition-all duration-300"
        style={{ background: 'var(--bg-card)', border: '1px solid var(--border-primary)', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Logo Upload */}
          <div className="flex items-center gap-6">
            <div className="relative">
              <div className="w-24 h-24 rounded-2xl flex items-center justify-center overflow-hidden" style={{ background: 'linear-gradient(135deg, var(--accent), var(--accent-dark))' }}>
                {currentLogo ? (
                  <img src={currentLogo} alt="School Logo" className="w-full h-full object-cover" />
                ) : (
                  <Camera size={32} className="text-[var(--text-muted)]" />
                )}
              </div>
              <label className="absolute -bottom-2 -right-2 w-8 h-8 rounded-full flex items-center justify-center cursor-pointer transition-colors duration-200"
                style={{ background: 'var(--accent)' }}>
                <Camera size={14} className="text-[var(--text-primary)]" />
                <input type="file" accept="image/*" onChange={handleLogoChange} className="hidden" />
              </label>
            </div>
            <div>
              <p className="font-semibold" style={{ color: 'var(--text-primary)' }}>School Logo</p>
              <p className="text-sm" style={{ color: 'var(--text-muted)' }}>Upload your school logo (PNG, JPG)</p>
            </div>
          </div>

          {/* School Name */}
          <div>
            <label className="block mb-2 text-sm font-medium" style={{ color: 'var(--text-primary)' }}>School Name</label>
            <input type="text" value={form.schoolName} onChange={(e) => setForm({...form, schoolName: e.target.value})}
              className={inputStyle}
              style={{ background: 'var(--bg-input)', borderColor: 'var(--border-primary)', color: 'var(--text-primary)' }} />
          </div>

          {/* Address */}
          <div>
            <label className="block mb-2 text-sm font-medium" style={{ color: 'var(--text-primary)' }}>Address</label>
            <textarea value={form.address} onChange={(e) => setForm({...form, address: e.target.value})} rows="2"
              className={inputStyle + " resize-none"}
              style={{ background: 'var(--bg-input)', borderColor: 'var(--border-primary)', color: 'var(--text-primary)' }} />
          </div>

          {/* Phone */}
          <div>
            <label className="block mb-2 text-sm font-medium" style={{ color: 'var(--text-primary)' }}>Phone Number</label>
            <input type="text" value={form.phone} onChange={(e) => setForm({...form, phone: e.target.value})}
              className={inputStyle}
              style={{ background: 'var(--bg-input)', borderColor: 'var(--border-primary)', color: 'var(--text-primary)' }} />
          </div>

          {/* Change Password */}
          <div className="pt-6" style={{ borderTop: '1px solid var(--border-primary)' }}>
            <h4 className="text-lg font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>Change Password</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block mb-2 text-sm font-medium" style={{ color: 'var(--text-primary)' }}>New Password</label>
                <div className="relative">
                  <input type={showPassword ? "text" : "password"} value={form.password} onChange={(e) => setForm({...form, password: e.target.value})}
                    className={inputStyle + " pr-12"}
                    style={{ background: 'var(--bg-input)', borderColor: 'var(--border-primary)', color: 'var(--text-primary)' }} />
                  <button type="button" onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 transition-colors duration-200" style={{ color: 'var(--accent)' }}>
                    {showPassword ? (
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.879L21 21" /></svg>
                    ) : (
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                    )}
                  </button>
                </div>
              </div>
              <div>
                <label className="block mb-2 text-sm font-medium" style={{ color: 'var(--text-primary)' }}>Confirm Password</label>
                <div className="relative">
                  <input type={showConfirmPassword ? "text" : "password"} value={form.confirmPassword} onChange={(e) => setForm({...form, confirmPassword: e.target.value})}
                    className={inputStyle + " pr-12"}
                    style={{ background: 'var(--bg-input)', borderColor: 'var(--border-primary)', color: 'var(--text-primary)' }} />
                  <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 transition-colors duration-200" style={{ color: 'var(--accent)' }}>
                    {showConfirmPassword ? (
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.879L21 21" /></svg>
                    ) : (
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>

          <button type="submit" disabled={loading}
            className="flex items-center justify-center gap-2 text-[var(--text-primary)] w-full py-4 rounded-xl font-bold text-lg transition-all duration-200 disabled:opacity-50 hover:shadow-lg hover:shadow-[var(--accent)]/20"
            style={{ background: 'linear-gradient(135deg, var(--accent), var(--accent-dark))' }}>
            <Save size={20} />
            {loading ? 'Saving...' : 'Save Settings'}
          </button>
        </form>
      </div>
    </DashboardLayout>
  );
};

export default Settings;
