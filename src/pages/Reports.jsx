import { useState, useEffect } from 'react';
import axios from 'axios';
import DashboardLayout from '../components/DashboardLayout';
import { BarChart3, Calendar } from 'lucide-react';

const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

const Reports = () => {
  const now = new Date();
  const [selectedMonth, setSelectedMonth] = useState(months[now.getMonth()]);
  const [selectedYear, setSelectedYear] = useState(now.getFullYear());
  const [analytics, setAnalytics] = useState(null);

  useEffect(() => {
    fetchData();
  }, [selectedMonth, selectedYear]);

  const fetchData = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get(`/api/dashboard/reports?month=${selectedMonth}&year=${selectedYear}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setAnalytics(res.data);
    } catch (err) {
      console.error('Failed to fetch reports:', err);
    }
  };

  return (
    <DashboardLayout>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-[var(--text-primary)]">Reports</h2>
        <div className="flex gap-3">
          <select value={selectedMonth} onChange={(e) => setSelectedMonth(e.target.value)}
            className="bg-[var(--bg-input)] border border-[var(--border-primary)] rounded-xl px-4 py-2.5 text-[var(--text-primary)] focus:border-[var(--accent)] focus:outline-none">
            {months.map(m => <option key={m} value={m}>{m}</option>)}
          </select>
          <select value={selectedYear} onChange={(e) => setSelectedYear(Number(e.target.value))}
            className="bg-[var(--bg-input)] border border-[var(--border-primary)] rounded-xl px-4 py-2.5 text-[var(--text-primary)] focus:border-[var(--accent)] focus:outline-none">
            {[now.getFullYear() - 1, now.getFullYear(), now.getFullYear() + 1].map(y => (
              <option key={y} value={y}>{y}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Revenue Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <div className="bg-[var(--bg-card)] border border-[var(--border-primary)] rounded-2xl p-6">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-xl bg-[var(--accent)]/20 flex items-center justify-center">
              <BarChart3 size={20} className="text-[var(--accent)]" />
            </div>
            <div>
              <p className="text-[var(--text-secondary)] text-sm">Expected Revenue</p>
              <p className="text-2xl font-bold text-[var(--text-primary)]">PKR {(analytics?.expectedRevenue || 0).toLocaleString()}</p>
            </div>
          </div>
          <p className="text-[var(--text-secondary)] text-xs">Total monthly fees of {analytics?.totalStudents || 0} active students</p>
        </div>

        <div className="bg-[var(--bg-card)] border border-[var(--border-primary)] rounded-2xl p-6">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-xl bg-[var(--success-bg)] flex items-center justify-center">
              <BarChart3 size={20} className="text-[var(--success-text)]" />
            </div>
            <div>
              <p className="text-[var(--text-secondary)] text-sm">Generated Revenue</p>
              <p className="text-2xl font-bold text-[var(--success-text)]">PKR {(analytics?.generatedRevenue || 0).toLocaleString()}</p>
            </div>
          </div>
          <p className="text-[var(--text-secondary)] text-xs">Fees collected in {selectedMonth}</p>
        </div>

        <div className="bg-[var(--bg-card)] border border-[var(--border-primary)] rounded-2xl p-6">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-xl bg-[var(--danger-bg)] flex items-center justify-center">
              <BarChart3 size={20} className="text-[var(--danger-text)]" />
            </div>
            <div>
              <p className="text-[var(--text-secondary)] text-sm">Remaining Revenue</p>
              <p className="text-2xl font-bold text-[var(--danger-text)]">PKR {(analytics?.remainingRevenue || 0).toLocaleString()}</p>
            </div>
          </div>
          <p className="text-[var(--text-secondary)] text-xs">Pending collection for {selectedMonth}</p>
        </div>
      </div>

      {/* Historical Data */}
      {analytics?.history?.length > 0 && (
        <div className="bg-[var(--bg-card)] border border-[var(--border-primary)] rounded-2xl p-6">
          <h3 className="text-lg font-bold text-[var(--text-primary)] mb-4">Historical Data (Last 6 Months)</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[var(--border-primary)]">
                  <th className="text-left py-3 px-4 text-[var(--text-secondary)] font-medium">Month</th>
                  <th className="text-left py-3 px-4 text-[var(--text-secondary)] font-medium">Students</th>
                  <th className="text-left py-3 px-4 text-[var(--text-secondary)] font-medium">Expected</th>
                  <th className="text-left py-3 px-4 text-[var(--text-secondary)] font-medium">Collected</th>
                  <th className="text-left py-3 px-4 text-[var(--text-secondary)] font-medium">Pending</th>
                </tr>
              </thead>
              <tbody>
                {analytics.history.map((h, i) => (
                  <tr key={i} className="border-b border-[var(--border-primary)]/50 hover:bg-[var(--bg-hover)]">
                    <td className="py-3 px-4 text-[var(--text-primary)] font-medium">{['','Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'][h.month]} {h.year}</td>
                    <td className="py-3 px-4 text-[var(--text-primary)]">{h.totalStudents}</td>
                    <td className="py-3 px-4 text-[var(--text-primary)]">PKR {h.expectedRevenue?.toLocaleString()}</td>
                    <td className="py-3 px-4 text-[var(--success-text)]">PKR {h.collectedFees?.toLocaleString()}</td>
                    <td className="py-3 px-4 text-[var(--danger-text)]">PKR {h.pendingDues?.toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
};

export default Reports;
