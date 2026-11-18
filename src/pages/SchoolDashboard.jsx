import { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '../components/DashboardLayout';
import {
  Users, User, UserRound, BookUser, Wallet, AlertTriangle, TrendingUp, Globe, Clock,
  ArrowRight, BarChart3, CheckCircle2, Trophy, Printer, Calendar,
} from 'lucide-react';

const SectionHeading = ({ icon: Icon, title, subtitle, iconClass, action }) => (
  <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
    <div className="flex items-center gap-3">
      <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl ring-1 ring-white/30 ${iconClass}`}>
        <Icon size={20} />
      </span>
      <div>
        <h2 className="text-[22px] font-bold leading-tight text-[var(--text-primary)]">{title}</h2>
        {subtitle && (
          <p className="mt-0.5 text-[13px] font-normal text-[var(--text-secondary)]">{subtitle}</p>
        )}
      </div>
    </div>
    {action}
  </div>
);

const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

const SchoolDashboard = () => {
  const navigate = useNavigate();
  const [analytics, setAnalytics] = useState(null);
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

  useEffect(() => {
    fetchAnalytics(selectedMonth, selectedYear);
  }, [selectedMonth, selectedYear]);

  const fetchAnalytics = async (m, y) => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get(`/api/dashboard?month=${m}&year=${y}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setAnalytics(res.data);
    } catch (err) {
      console.error('Failed to fetch analytics:', err);
    }
  };

  const handlePrint = () => window.print();
  const selMonthName = monthNames[selectedMonth - 1] || '';
  const yearOptions = [selectedYear - 1, selectedYear, selectedYear + 1];

  const statCards = [
    {
      label: 'Total Students',
      value: analytics?.totalStudents || 0,
      icon: Users,
      gradient: 'from-[#8B5CF6] to-[#6D28D9]',
      tint: 'from-violet-500/15 to-white/55 dark:from-violet-500/20 dark:to-white/[0.03]',
      wave: '#7C3AED',
      glow: '0 12px 26px rgba(124,58,237,0.35)',
    },
    {
      label: 'Boys',
      value: analytics?.boys || 0,
      icon: User,
      gradient: 'from-[#60A5FA] to-[#2563EB]',
      tint: 'from-blue-500/15 to-white/55 dark:from-blue-500/20 dark:to-white/[0.03]',
      wave: '#3B82F6',
      glow: '0 12px 26px rgba(59,130,246,0.35)',
    },
    {
      label: 'Girls',
      value: analytics?.girls || 0,
      icon: UserRound,
      gradient: 'from-[#F472B6] to-[#DB2777]',
      tint: 'from-pink-500/15 to-white/55 dark:from-pink-500/20 dark:to-white/[0.03]',
      wave: '#EC4899',
      glow: '0 12px 26px rgba(236,72,153,0.35)',
    },
    {
      label: 'Total Teachers',
      value: analytics?.totalTeachers || 0,
      icon: BookUser,
      gradient: 'from-[#34D399] to-[#059669]',
      tint: 'from-emerald-500/15 to-white/55 dark:from-emerald-500/20 dark:to-white/[0.03]',
      wave: '#10B981',
      glow: '0 12px 26px rgba(16,185,129,0.35)',
    },
  ];

  const revenueCards = [
    {
      label: 'Total Fees',
      value: analytics?.expectedRevenue || 0,
      icon: Wallet,
      tint: 'from-violet-500/15 to-white/55 dark:from-violet-500/20 dark:to-white/[0.03]',
      labelClass: 'text-[#7C3AED] dark:text-[#C4B5FD]',
      gradient: 'from-[#A78BFA] to-[#6D28D9]',
      wave: '#7C3AED',
      glow: '0 10px 22px rgba(124,58,237,0.4)',
      caption: 'Sum of all active students monthly fees',
    },
    {
      label: 'Collected Fees',
      value: analytics?.collectedFees || 0,
      icon: CheckCircle2,
      tint: 'from-blue-500/15 to-white/55 dark:from-blue-500/20 dark:to-white/[0.03]',
      labelClass: 'text-[#2563EB] dark:text-[#93C5FD]',
      gradient: 'from-[#60A5FA] to-[#2563EB]',
      wave: '#3B82F6',
      glow: '0 10px 22px rgba(59,130,246,0.4)',
      caption: 'Fees collected this month',
    },
    {
      label: 'Remaining Fees',
      value: analytics?.remainingFees || 0,
      icon: Clock,
      tint: 'from-emerald-500/15 to-white/55 dark:from-emerald-500/20 dark:to-white/[0.03]',
      labelClass: 'text-[#059669] dark:text-[#6EE7B7]',
      gradient: 'from-[#34D399] to-[#059669]',
      wave: '#10B981',
      glow: '0 10px 22px rgba(16,185,129,0.4)',
      caption: 'Pending collection this month',
    },
    {
      label: 'Pending Dues',
      value: analytics?.pendingDues || 0,
      icon: AlertTriangle,
      tint: 'from-orange-500/15 to-white/55 dark:from-orange-500/20 dark:to-white/[0.03]',
      labelClass: 'text-[#EA580C] dark:text-[#FDBA74]',
      gradient: 'from-[#FB923C] to-[#EA580C]',
      wave: '#F97316',
      glow: '0 10px 22px rgba(249,115,22,0.4)',
      caption: 'Total outstanding across all months',
    },
  ];

  const salaryStats = [
    {
      label: 'Total Teacher Salaries',
      value: analytics?.totalTeacherSalaries || 0,
      icon: Wallet,
      color: 'text-[#7C3AED] dark:text-[#C4B5FD]',
      bg: 'bg-violet-500/10',
    },
    {
      label: 'Paid Salaries',
      value: analytics?.paidTeacherSalaries || 0,
      icon: CheckCircle2,
      color: 'text-[#059669] dark:text-[#6EE7B7]',
      bg: 'bg-emerald-500/10',
    },
    {
      label: 'Pending Salaries',
      value: analytics?.remainingTeacherSalaries || 0,
      icon: AlertTriangle,
      color: 'text-[#EA580C] dark:text-[#FDBA74]',
      bg: 'bg-orange-500/10',
    },
    {
      label: 'Net Revenue',
      value: analytics?.netRevenue || 0,
      icon: TrendingUp,
      color: (analytics?.netRevenue || 0) >= 0
        ? 'text-[#059669] dark:text-[#6EE7B7]'
        : 'text-[#DC2626] dark:text-[#FCA5A5]',
      bg: 'bg-blue-500/10',
    },
  ];

  const totalSalaries = analytics?.totalTeacherSalaries || 0;
  const paidSalaries = analytics?.paidTeacherSalaries || 0;
  const paidPct = totalSalaries > 0 ? Math.min(100, Math.round((paidSalaries / totalSalaries) * 100)) : 0;

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="print-only hidden print:block mb-4 text-center">
          <h1 className="text-2xl font-bold text-[#1E1B4B]">Dashboard Report - {selMonthName} {selectedYear}</h1>
          <p className="text-sm text-[#6B7280]">Printed on {new Date().toLocaleDateString()}</p>
        </div>

        {/* Dashboard overview */}
        <section>
          <SectionHeading
            icon={BarChart3}
            iconClass="bg-gradient-to-br from-[#8B5CF6] to-[#6D28D9] text-white shadow-[0_8px_18px_rgba(124,58,237,0.35)]"
            title="Dashboard Overview"
            subtitle="Quick overview of your school activities"
            action={
              <div className="flex flex-wrap items-center gap-2 no-print">
                <div className="glass-pill inline-flex items-center gap-2 rounded-full px-3 py-2">
                  <Calendar size={15} className="text-[#7C3AED]" />
                  <select
                    value={selectedMonth}
                    onChange={(e) => setSelectedMonth(Number(e.target.value))}
                    className="bg-transparent text-[13px] font-medium text-[var(--text-primary)] outline-none cursor-pointer"
                  >
                    {monthNames.map((m, i) => <option key={m} value={i + 1}>{m}</option>)}
                  </select>
                  <select
                    value={selectedYear}
                    onChange={(e) => setSelectedYear(Number(e.target.value))}
                    className="bg-transparent text-[13px] font-medium text-[var(--text-primary)] outline-none cursor-pointer"
                  >
                    {yearOptions.map(y => <option key={y} value={y}>{y}</option>)}
                  </select>
                </div>
                <button
                  onClick={handlePrint}
                  className="btn-dark ripple-btn inline-flex items-center gap-2 rounded-full px-4 py-2.5 text-[13px] font-semibold"
                >
                  <Printer size={16} /> Print Dashboard
                </button>
                <button
                  onClick={() => window.open('/', '_blank')}
                  className="glass-pill lift inline-flex items-center gap-2 rounded-full px-4 py-2.5 text-[13px] font-semibold text-[var(--text-primary)]"
                >
                  <Globe size={16} className="text-[#7C3AED] dark:text-[#C4B5FD]" />
                  Website
                </button>
              </div>
            }
          />

          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-4">
            {statCards.map((stat) => {
              const Icon = stat.icon;
              return (
                <div
                  key={stat.label}
                  className={`glass-card lift group relative overflow-hidden bg-gradient-to-br ${stat.tint} p-5 ring-1 ring-transparent transition-all hover:ring-white/70 dark:hover:ring-white/15`}
                >
                  <div
                    className="pointer-events-none absolute -right-8 -top-10 h-28 w-28 rounded-full opacity-25 blur-2xl"
                    style={{ background: stat.wave }}
                  />
                  <span className={`pointer-events-none absolute inset-x-6 top-0 h-[3px] rounded-full bg-gradient-to-r ${stat.gradient}`} />
                  <div className="relative z-10 flex items-center gap-4">
                    <div
                      className={`relative flex h-[70px] w-[70px] shrink-0 items-center justify-center rounded-full bg-gradient-to-br ${stat.gradient}`}
                      style={{ boxShadow: stat.glow }}
                    >
                      <span className="absolute inset-[5px] rounded-full border border-white/40" />
                      <Icon size={30} className="relative text-white" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-[15px] font-medium text-[var(--text-secondary)]">{stat.label}</p>
                      <div className="mt-1 flex flex-wrap items-center gap-2">
                        <p className={`bg-gradient-to-br ${stat.gradient} bg-clip-text text-[32px] font-bold leading-none text-transparent`}>
                          {Number(stat.value).toLocaleString()}
                        </p>
                        <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/15 px-2 py-0.5 text-[11px] font-semibold text-emerald-600 dark:text-emerald-300">
                          <TrendingUp size={11} /> 0%
                        </span>
                      </div>
                    </div>
                  </div>
                  <svg
                    className="pointer-events-none absolute -bottom-1 right-0 z-0 h-16 w-40 opacity-70"
                    viewBox="0 0 160 60"
                    fill="none"
                    preserveAspectRatio="none"
                    aria-hidden="true"
                  >
                    <path
                      d="M0 44C24 12 44 54 68 34C92 14 112 50 136 28C146 19 153 21 160 16V60H0V44Z"
                      fill={stat.wave}
                      opacity="0.18"
                    />
                    <path
                      d="M0 44C24 12 44 54 68 34C92 14 112 50 136 28C146 19 153 21 160 16"
                      stroke={stat.wave}
                      strokeWidth="2"
                      opacity="0.5"
                    />
                  </svg>
                </div>
              );
            })}
          </div>
        </section>

        {/* Revenue overview */}
        <section>
          <SectionHeading
            icon={Wallet}
            iconClass="bg-gradient-to-br from-[#60A5FA] to-[#2563EB] text-white shadow-[0_8px_18px_rgba(59,130,246,0.35)]"
            title="Revenue Overview"
          />

          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-4">
            {revenueCards.map((card) => {
              const Icon = card.icon;
              return (
                <div
                  key={card.label}
                  className={`glass-card lift relative overflow-hidden bg-gradient-to-br ${card.tint} p-5 ring-1 ring-transparent transition-all hover:ring-white/70 dark:hover:ring-white/15`}
                >
                  <div
                    className="pointer-events-none absolute -right-8 -top-10 h-24 w-24 rounded-full opacity-20 blur-2xl"
                    style={{ background: card.wave }}
                  />
                  <span className={`pointer-events-none absolute inset-x-5 top-0 h-[3px] rounded-full bg-gradient-to-r ${card.gradient}`} />
                  <div className="pr-14">
                    <p className={`text-[13px] font-semibold ${card.labelClass}`}>{card.label}</p>
                    <p className="mt-2 text-[26px] font-bold leading-none text-[var(--text-primary)]">
                      PKR {Number(card.value).toLocaleString()}
                    </p>
                    <p className="mt-2 text-[12px] font-normal leading-snug text-[var(--text-secondary)]">
                      {card.caption}
                    </p>
                  </div>
                  <div
                    className={`absolute right-4 top-4 flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br ${card.gradient} text-white ring-1 ring-white/40`}
                    style={{ boxShadow: card.glow }}
                  >
                    <Icon size={22} />
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* Teacher salaries */}
        <section>
          <SectionHeading
            icon={Trophy}
            iconClass="bg-gradient-to-br from-[#FBBF24] to-[#F59E0B] text-white shadow-[0_8px_18px_rgba(245,158,11,0.35)]"
            title="Teacher Salaries"
            action={
              <button
                onClick={() => navigate('/reports')}
                className="btn-dark ripple-btn inline-flex items-center gap-1.5 rounded-full px-4 py-2.5 text-[13px] font-semibold"
              >
                View Details <ArrowRight size={14} />
              </button>
            }
          />

          <div className="glass-card relative overflow-hidden p-5 sm:p-6">
            <div className="pointer-events-none absolute -right-10 -top-12 h-40 w-40 rounded-full bg-[#FBBF24]/20 blur-3xl" />
            <span className="pointer-events-none absolute inset-x-6 top-0 h-[3px] rounded-full bg-gradient-to-r from-[#FBBF24] to-[#F59E0B]" />
            <div className="relative grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
              {salaryStats.map((stat) => {
                const Icon = stat.icon;
                return (
                  <div
                    key={stat.label}
                    className="rounded-2xl bg-white/40 p-4 ring-1 ring-white/50 transition-all duration-200 hover:-translate-y-0.5 hover:bg-white/55 hover:shadow-[0_10px_24px_rgba(124,58,237,0.12)] dark:bg-white/[0.04] dark:ring-white/10 dark:hover:bg-white/[0.07]"
                  >
                    <div className="flex items-center gap-3">
                      <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${stat.bg} ${stat.color}`}>
                        <Icon size={18} />
                      </span>
                      <div className="min-w-0">
                        <p className="text-[12px] font-medium text-[var(--text-secondary)]">{stat.label}</p>
                        <p className={`mt-0.5 truncate text-[18px] font-bold ${stat.color}`}>
                          PKR {Number(stat.value).toLocaleString()}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="mt-5">
              <div className="mb-2 flex items-center justify-between text-[12px]">
                <span className="text-[var(--text-secondary)]">Salary disbursement progress</span>
                <span className="font-semibold text-[var(--text-primary)]">{paidPct}%</span>
              </div>
              <div className="h-2.5 w-full overflow-hidden rounded-full bg-[var(--bg-hover)] ring-1 ring-white/40 dark:ring-white/5">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-[#8B5CF6] via-[#7C3AED] to-[#10B981] shadow-[0_0_12px_rgba(124,58,237,0.45)] transition-all duration-500"
                  style={{ width: `${paidPct}%` }}
                />
              </div>
            </div>
          </div>
        </section>

        {/* Historical analytics */}
        {analytics?.history?.length > 0 && (
          <section>
            <SectionHeading
              icon={BarChart3}
              iconClass="bg-gradient-to-br from-[#8B5CF6] to-[#6D28D9] text-white shadow-[0_8px_18px_rgba(124,58,237,0.35)]"
              title="Historical Analytics"
              subtitle="Last 6 months of school activity"
            />
            <div className="glass-card overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full min-w-[640px] text-sm">
                  <thead>
                    <tr className="border-b border-[var(--border-soft)] bg-gradient-to-r from-[#F5F3FF]/80 to-transparent dark:from-white/[0.04]">
                      <th className="px-5 py-3.5 text-left font-medium text-[var(--text-secondary)]">Month</th>
                      <th className="px-5 py-3.5 text-left font-medium text-[var(--text-secondary)]">Students</th>
                      <th className="px-5 py-3.5 text-left font-medium text-[var(--text-secondary)]">Teachers</th>
                      <th className="px-5 py-3.5 text-left font-medium text-[var(--text-secondary)]">Expected</th>
                      <th className="px-5 py-3.5 text-left font-medium text-[var(--text-secondary)]">Collected</th>
                      <th className="px-5 py-3.5 text-left font-medium text-[var(--text-secondary)]">Pending</th>
                    </tr>
                  </thead>
                  <tbody>
                    {analytics.history.map((h, i) => (
                      <tr
                        key={`${h.year}-${h.month}-${i}`}
                        className="border-b border-[var(--border-soft)] transition-colors last:border-0 hover:bg-[var(--bg-hover)]"
                      >
                        <td className="px-5 py-3.5 font-medium text-[var(--text-primary)]">
                          {['', 'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'][h.month]} {h.year}
                        </td>
                        <td className="px-5 py-3.5 text-[var(--text-primary)]">{h.totalStudents}</td>
                        <td className="px-5 py-3.5 text-[var(--text-primary)]">{h.totalTeachers}</td>
                        <td className="px-5 py-3.5 text-[var(--text-primary)]">PKR {h.expectedRevenue?.toLocaleString()}</td>
                        <td className="px-5 py-3.5 font-medium text-[var(--success-text)]">PKR {h.collectedFees?.toLocaleString()}</td>
                        <td className="px-5 py-3.5 font-medium text-[var(--danger-text)]">PKR {h.pendingDues?.toLocaleString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </section>
        )}
      </div>
    </DashboardLayout>
  );
};

export default SchoolDashboard;
