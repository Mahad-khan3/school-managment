import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import DashboardLayout from '../components/DashboardLayout';
import {
  Search, Users, CheckCircle2, Crown, IdCard, Wallet, Calendar, TrendingUp,
  Printer, ChevronDown, ChevronUp, TriangleAlert, Clock, Send, Sparkles, Plus,
  ArrowRight, X
} from 'lucide-react';

const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
const classes = ['Nursery', 'KG', 'Class 1', 'Class 2', 'Class 3', 'Class 4', 'Class 5', 'Class 6', 'Class 7', 'Class 8', 'Class 9', 'Class 10'];

const formatPKR = (n) => `PKR ${(Number(n) || 0).toLocaleString()}`;
const shortDate = (d) => {
  if (!d) return '—';
  const dt = new Date(d);
  if (Number.isNaN(dt.getTime())) return '—';
  return dt.toLocaleString('en-US', { month: 'short', year: 'numeric' });
};
const studentIdLabel = (s) => {
  const year = new Date(s.admissionDate || s.createdAt || Date.now()).getFullYear();
  const suffix = (s._id || '').slice(-3).toUpperCase() || '001';
  return `STU-${year}-${suffix}`;
};
const initials = (name = '') => name.trim().split(/\s+/).slice(0, 2).map(p => p[0]?.toUpperCase() || '').join('') || 'S';

const StudentProfiles = () => {
  const [students, setStudents] = useState([]);
  const [feeHistories, setFeeHistories] = useState({});
  const [search, setSearch] = useState('');
  const [filterClass, setFilterClass] = useState('');
  const [expandedStudent, setExpandedStudent] = useState(null);
  const [processing, setProcessing] = useState({});
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [payMonth, setPayMonth] = useState(months[new Date().getMonth()]);
  const [payYear, setPayYear] = useState(new Date().getFullYear());
  const [payAmount, setPayAmount] = useState('');
  const [payFull, setPayFull] = useState(true);
  const [feeChanges, setFeeChanges] = useState({});
  const [savingChanges, setSavingChanges] = useState(false);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => { fetchStudents(); }, []);

  const fetchFeeHistory = async (studentId) => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get(`/api/fees/student/${studentId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      return res.data;
    } catch (err) {
      console.error('Failed to fetch fee history:', err);
      return [];
    }
  };

  const fetchStudents = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const res = await axios.get('/api/students', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setStudents(res.data);
      const feeResults = await Promise.all(res.data.map(s => fetchFeeHistory(s._id)));
      const histories = {};
      feeResults.forEach((feeData, i) => {
        const latestMap = {};
        (feeData || []).forEach(f => {
          const key = `${f.month}-${f.year}`;
          if (!latestMap[key] || new Date(f.createdAt) > new Date(latestMap[key].createdAt)) {
            latestMap[key] = f;
          }
        });
        histories[res.data[i]._id] = Object.values(latestMap);
      });
      setFeeHistories(histories);
    } catch (err) {
      console.error('Failed to fetch students:', err);
    } finally {
      setLoading(false);
    }
  };

  const refreshStudentFees = async (studentId) => {
    const feeData = await fetchFeeHistory(studentId);
    const latestMap = {};
    (feeData || []).forEach(f => {
      const key = `${f.month}-${f.year}`;
      if (!latestMap[key] || new Date(f.createdAt) > new Date(latestMap[key].createdAt)) {
        latestMap[key] = f;
      }
    });
    setFeeHistories(prev => ({ ...prev, [studentId]: Object.values(latestMap) }));
  };

  const handleFeePayment = async () => {
    if (!selectedStudent || !payMonth) return;
    const payKey = `${selectedStudent._id}-${payMonth}-${payYear}`;
    setProcessing(prev => ({ ...prev, [payKey]: true }));
    try {
      const token = localStorage.getItem('token');
      const monthlyFee = selectedStudent.monthlyFee;
      const paidAmount = payFull ? monthlyFee : (Number(payAmount) || 0);
      await axios.post('/api/fees', {
        student: selectedStudent._id,
        month: payMonth,
        year: payYear,
        monthlyFee,
        paidAmount,
      }, { headers: { Authorization: `Bearer ${token}` } });
      await refreshStudentFees(selectedStudent._id);
      setShowPaymentModal(false);
      setSelectedStudent(null);
      setPayAmount('');
      setPayFull(true);
    } catch (err) {
      console.error('Payment failed:', err);
      alert(err.response?.data?.message || 'Payment failed');
    }
    setProcessing(prev => ({ ...prev, [payKey]: false }));
  };

  const getHistory = (studentId) => feeHistories[studentId] || [];

  const getStudentStatus = (student) => {
    const history = getHistory(student._id);
    const now = new Date();
    const currentMonth = months[now.getMonth()];
    const currentYear = now.getFullYear();
    const currentFee = history.find(f => f.month === currentMonth && f.year === currentYear);
    const hasUnpaidDues = history.some(f => (f.remainingAmount || 0) > 0);
    return currentFee && currentFee.paymentStatus === 'Paid' && !hasUnpaidDues ? 'paid' : 'unpaid';
  };

  const getTotalDue = (student) => getHistory(student._id).reduce((sum, f) => sum + (f.remainingAmount || 0), 0);
  const getTotalPaid = (student) => getHistory(student._id).reduce((sum, f) => sum + (f.paidAmount || 0), 0);
  const getCurrentMonthStatus = (student) => {
    const now = new Date();
    const currentMonth = months[now.getMonth()];
    const currentYear = now.getFullYear();
    const fee = getHistory(student._id).find(f => f.month === currentMonth && f.year === currentYear);
    return fee || { paymentStatus: 'Unpaid', monthlyFee: student.monthlyFee, paidAmount: 0, remainingAmount: student.monthlyFee };
  };

  const filteredStudents = useMemo(() => students.filter(s => {
    const q = search.toLowerCase().trim();
    const matchSearch = !q || s.name?.toLowerCase().includes(q) || s.fatherName?.toLowerCase().includes(q);
    const matchClass = !filterClass || s.class === filterClass;
    return matchSearch && matchClass;
  }), [students, search, filterClass]);

  const classOptions = useMemo(() => {
    const fromData = Array.from(new Set(students.map(s => s.class).filter(Boolean)));
    return Array.from(new Set([...classes, ...fromData]));
  }, [students]);

  const generateReceipt = async (student) => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get(`/api/fees/receipt/${student._id}`, {
        headers: { Authorization: `Bearer ${token}` },
        responseType: 'blob'
      });
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `fee-statement-${(student.name || 'student').replace(/\s+/g, '-').toLowerCase()}.html`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Failed to download receipt:', err);
      alert('Failed to download report');
    }
  };

  const sendReminder = (student) => {
    const phone = (student.parentPhone || student.studentPhone || '').replace(/\D/g, '');
    const due = getTotalDue(student);
    const msg = `Dear Parent, this is a reminder that fee dues of ${formatPKR(due)} are pending for ${student.name} (${student.class} - ${student.section}). Please clear dues at your earliest convenience.`;
    if (phone) {
      window.open(`https://wa.me/${phone.startsWith('0') ? '92' + phone.slice(1) : phone}?text=${encodeURIComponent(msg)}`, '_blank');
    } else {
      alert('No phone number available for this student.');
    }
  };

  const openPaymentModal = (student) => {
    setSelectedStudent(student);
    setPayMonth(months[new Date().getMonth()]);
    setPayYear(new Date().getFullYear());
    setPayAmount(String(student.monthlyFee || 0));
    setPayFull(true);
    setShowPaymentModal(true);
  };

  return (
    <DashboardLayout>
      <div className="relative">
        {/* Page Banner */}
        <div className="relative overflow-hidden rounded-[24px] mb-6 p-5 sm:p-7 bg-white/40 backdrop-blur-xl border border-white/60 shadow-[0_8px_24px_rgba(124,58,237,0.12)]">
          <div className="pointer-events-none absolute inset-y-0 right-0 w-[55%] min-w-[260px] opacity-70">
            <div className="absolute inset-0 bg-gradient-to-l from-[#DDD6FE]/60 via-[#FBCFE8]/30 to-transparent" />
            <div className="absolute right-8 top-6 h-24 w-40 rounded-2xl bg-[#C4B5FD]/50 blur-[2px]" />
            <div className="absolute right-24 top-14 h-16 w-24 rounded-xl bg-[#FBCFE8]/60" />
            <div className="absolute right-4 bottom-4 h-20 w-56 rounded-2xl bg-[#A5B4FC]/30" />
          </div>
          <div className="relative flex items-center gap-4 sm:gap-5">
            <div className="flex h-[70px] w-[70px] items-center justify-center rounded-[22px] bg-white/60 backdrop-blur-md border border-white/70 shadow-[0_8px_20px_rgba(124,58,237,0.15)] text-[#6D28D9]">
              <Users size={34} strokeWidth={1.8} />
            </div>
            <div>
              <h1 className="text-[28px] sm:text-[32px] leading-tight font-bold text-[#1E1B4B]">Student Profiles</h1>
              <p className="mt-1 text-[14px] sm:text-[15px] font-medium text-[#6B7280]">Manage and view student details, fees &amp; status</p>
            </div>
          </div>
        </div>

        {/* Toolbar */}
        <div className="mb-6 flex flex-col gap-3 lg:flex-row lg:items-center">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-[#7C3AED]" size={18} />
            <input
              type="text"
              placeholder="Search by name or father name..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-full bg-white/70 backdrop-blur-md border border-white/70 pl-11 pr-4 py-3.5 text-[15px] text-[#1E1B4B] placeholder:text-[#8B85A3] shadow-[0_4px_14px_rgba(124,58,237,0.08)] focus:outline-none focus:ring-2 focus:ring-[#7C3AED]/30 transition"
            />
          </div>
          <div className="flex gap-3">
            <div className="relative min-w-[170px] flex-1 lg:flex-none">
              <select
                value={filterClass}
                onChange={(e) => setFilterClass(e.target.value)}
                className="w-full appearance-none rounded-full bg-white/80 backdrop-blur-md border border-white/70 px-5 pr-10 py-3.5 text-[14px] font-medium text-[#1E1B4B] shadow-[0_4px_14px_rgba(124,58,237,0.08)] focus:outline-none focus:ring-2 focus:ring-[#7C3AED]/30"
              >
                <option value="">All Classes</option>
                {classOptions.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
              <ChevronDown size={16} className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-[#6B7280]" />
            </div>
            <button
              onClick={() => navigate('/students')}
              className="inline-flex items-center justify-center gap-2 rounded-full bg-gradient-to-r from-[#2E1A87] to-[#4C1D95] px-5 py-3.5 text-[14px] font-semibold text-white shadow-[0_8px_20px_rgba(46,26,135,0.28)] hover:shadow-[0_12px_26px_rgba(46,26,135,0.38)] hover:-translate-y-0.5 transition-all duration-200 whitespace-nowrap"
            >
              <Plus size={18} /> Add Student
            </button>
          </div>
        </div>

        {/* Cards */}
        {loading ? (
          <div className="flex items-center justify-center py-20 text-[#6B7280]">
            <div className="h-8 w-8 rounded-full border-2 border-[#7C3AED] border-t-transparent animate-spin" />
          </div>
        ) : filteredStudents.length === 0 ? (
          <div className="text-center py-16 rounded-[24px] bg-white/50 backdrop-blur-md border border-white/60 text-[#6B7280]">
            No students found
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {filteredStudents.map((student) => {
              const status = getStudentStatus(student);
              const paid = status === 'paid';
              const totalDue = getTotalDue(student);
              const totalPaid = getTotalPaid(student);
              const current = getCurrentMonthStatus(student);
              const now = new Date();
              const currentMonthName = months[now.getMonth()];
              const isExpanded = expandedStudent === student._id;
              const history = getHistory(student._id);

              return (
                <div
                  key={student._id}
                  className={`relative overflow-hidden rounded-[24px] border-[1.5px] p-5 sm:p-6 backdrop-blur-xl shadow-[0_8px_24px_rgba(124,58,237,0.12)] transition-all duration-200 hover:-translate-y-1 hover:shadow-[0_14px_32px_rgba(124,58,237,0.18)] ${
                    paid
                      ? 'border-[rgba(16,185,129,0.4)] bg-gradient-to-br from-white/80 to-emerald-50/70'
                      : 'border-[rgba(239,68,68,0.35)] bg-gradient-to-br from-white/80 to-rose-50/70'
                  }`}
                >
                  <div className={`pointer-events-none absolute -bottom-10 -right-10 h-40 w-56 rounded-full blur-2xl ${paid ? 'bg-emerald-200/40' : 'bg-rose-200/40'}`} />

                  {/* Top badges */}
                  <div className="relative flex items-start justify-between gap-2 mb-4">
                    <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[13px] font-medium border ${
                      paid ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-rose-50 text-rose-600 border-rose-200'
                    }`}>
                      {paid ? <CheckCircle2 size={15} /> : <TriangleAlert size={15} />}
                      {paid ? 'Paid Student' : 'Unpaid Student'}
                    </span>
                    <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[13px] font-medium border ${
                      paid ? 'bg-lime-50 text-lime-700 border-lime-200' : 'bg-pink-50 text-pink-600 border-pink-200'
                    }`}>
                      {paid ? <Crown size={14} /> : <Clock size={14} />}
                      {paid ? 'Active' : 'Pending'}
                    </span>
                  </div>

                  {/* Identity row */}
                  <div className="relative flex flex-col sm:flex-row sm:items-center gap-4 mb-5">
                    <div className="flex items-center gap-4 flex-1 min-w-0">
                      <div className="relative shrink-0">
                        <div className={`hexagon h-[90px] w-[90px] flex items-center justify-center text-white text-2xl font-bold shadow-inner ${paid ? 'bg-gradient-to-br from-[#8B5CF6] to-[#6D28D9]' : 'bg-gradient-to-br from-[#A78BFA] to-[#7C3AED]'}`}>
                          {student.photo ? <img src={student.photo} alt="" className="h-full w-full object-cover" /> : initials(student.name)}
                        </div>
                        <span className={`absolute -bottom-1 -right-1 flex h-7 w-7 items-center justify-center rounded-full border-2 border-white text-white shadow ${paid ? 'bg-emerald-500' : 'bg-rose-500'}`}>
                          {paid ? <CheckCircle2 size={14} /> : <span className="text-[13px] font-bold">!</span>}
                        </span>
                      </div>
                      <div className="min-w-0">
                        <h3 className="text-[22px] sm:text-[24px] font-bold text-[#1E1B4B] truncate">{student.name}</h3>
                        <div className="mt-1 flex flex-wrap items-center gap-2">
                          <span className="inline-flex items-center gap-1.5 rounded-full bg-[#DDD6FE] text-[#5B21B6] px-3 py-1 text-[13px] font-medium">
                            <Users size={13} /> {student.class} – {student.section}
                          </span>
                        </div>
                        <p className="mt-1.5 flex items-center gap-1.5 text-[13px] text-[#6B7280]">
                          <IdCard size={14} /> ID: {studentIdLabel(student)}
                        </p>
                      </div>
                    </div>
                    <div className="hidden sm:block w-px self-stretch bg-gradient-to-b from-transparent via-[#C4B5FD] to-transparent" />
                    <div className={`shrink-0 rounded-2xl px-4 py-3 min-w-[150px] border ${paid ? 'bg-emerald-50/80 border-emerald-200/70' : 'bg-rose-50/80 border-rose-200/70'}`}>
                      <div className="flex items-center gap-2 text-[13px] font-medium text-[#6B7280]">
                        <Wallet size={15} className={paid ? 'text-emerald-600' : 'text-rose-500'} />
                        {paid ? 'Total Paid' : 'Total Due'}
                      </div>
                      <div className={`mt-1 text-[20px] font-bold ${paid ? 'text-emerald-700' : 'text-rose-700'}`}>
                        {formatPKR(paid ? totalPaid : totalDue)}
                      </div>
                    </div>
                  </div>

                  {/* Info + status box */}
                  <div className="relative grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
                    <div className="rounded-2xl bg-white/70 backdrop-blur border border-white/70 p-4 space-y-2.5 text-[14px]">
                      <div className="flex items-center justify-between gap-3">
                        <span className="text-[#6B7280] font-medium">Monthly Fee</span>
                        <span className="text-[#1E1B4B] font-semibold">{formatPKR(student.monthlyFee)}</span>
                      </div>
                      <div className="flex items-center justify-between gap-3">
                        <span className="text-[#6B7280] font-medium">Current Month ({currentMonthName})</span>
                        {current.paymentStatus === 'Paid' ? (
                          <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 text-emerald-700 px-2.5 py-1 text-[12px] font-semibold"><CheckCircle2 size={13} /> Paid</span>
                        ) : (
                          <span className="inline-flex items-center gap-1 rounded-full bg-rose-100 text-rose-600 px-2.5 py-1 text-[12px] font-semibold">Unpaid <span className="font-bold">!</span></span>
                        )}
                      </div>
                      <div className="flex items-center justify-between gap-3">
                        <span className="text-[#6B7280] font-medium">Total Paid</span>
                        <span className="text-[#1E1B4B] font-bold">{formatPKR(totalPaid)}</span>
                      </div>
                      {!paid && (
                        <div className="pt-1 mt-1 border-t border-rose-100">
                          <div className="flex items-center gap-2 text-[13px] font-semibold text-[#1E1B4B] mb-1.5">
                            <span className="h-2 w-2 rounded-full bg-rose-500" /> Fee Details
                          </div>
                          <div className="flex items-center justify-between text-[13px]">
                            <span className="text-[#6B7280]">Total Due</span>
                            <span className="font-bold text-rose-700">{formatPKR(totalDue)}</span>
                          </div>
                        </div>
                      )}
                    </div>

                    {paid ? (
                      <div className="rounded-2xl bg-emerald-50/80 border border-emerald-200/70 p-4 flex flex-col items-center justify-center text-center">
                        <div className="relative mb-2">
                          <div className="h-14 w-14 rounded-full bg-emerald-500 text-white flex items-center justify-center shadow-[0_8px_18px_rgba(16,185,129,0.35)]">
                            <CheckCircle2 size={30} />
                          </div>
                          <Sparkles size={16} className="absolute -top-1 -right-3 text-emerald-400" />
                          <Sparkles size={12} className="absolute -bottom-1 -left-3 text-emerald-300" />
                        </div>
                        <p className="text-[18px] font-bold text-emerald-700">All Clear!</p>
                        <p className="text-[13px] text-emerald-700/80 mt-0.5">No dues pending</p>
                      </div>
                    ) : (
                      <div className="rounded-2xl bg-rose-50/80 border border-rose-200/70 p-4 flex flex-col justify-center">
                        <div className="flex items-start gap-3">
                          <div className="mt-0.5 flex h-10 w-10 items-center justify-center rounded-full bg-rose-100 text-rose-600">
                            <TriangleAlert size={22} />
                          </div>
                          <div className="flex-1">
                            <p className="text-[16px] font-bold text-rose-700">Fee Pending!</p>
                            <p className="text-[13px] text-rose-700/80 mt-0.5">Please clear your dues as soon as possible.</p>
                          </div>
                        </div>
                        <button
                          onClick={() => openPaymentModal(student)}
                          className="mt-3 inline-flex items-center justify-center gap-2 self-start rounded-full bg-gradient-to-r from-[#EF4444] to-[#DC2626] px-4 py-2 text-[13px] font-semibold text-white shadow-[0_6px_16px_rgba(239,68,68,0.3)] hover:shadow-[0_10px_20px_rgba(239,68,68,0.4)] hover:-translate-y-0.5 transition-all"
                        >
                          Pay Now <ArrowRight size={15} />
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Footer meta */}
                  <div className="relative flex flex-wrap items-center gap-x-4 gap-y-1 text-[13px] text-[#6B7280] mb-4">
                    <span className="inline-flex items-center gap-1.5"><Calendar size={14} /> Joined: {shortDate(student.admissionDate || student.createdAt)}</span>
                    <span className="text-[#C4B5FD]">|</span>
                    <span className="inline-flex items-center gap-1.5"><TrendingUp size={14} /> Attendance: {student.attendance ?? '—'}</span>
                  </div>

                  {/* Actions */}
                  <div className="relative flex flex-wrap gap-2">
                    <button
                      onClick={() => setExpandedStudent(isExpanded ? null : student._id)}
                      className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-[#2E1A87] to-[#4C1D95] px-4 py-2.5 text-[13px] font-semibold text-white shadow-[0_6px_16px_rgba(46,26,135,0.25)] hover:shadow-[0_10px_20px_rgba(46,26,135,0.35)] hover:-translate-y-0.5 transition-all"
                    >
                      View Details <ArrowRight size={15} />
                    </button>
                    <button
                      onClick={() => generateReceipt(student)}
                      className="inline-flex items-center gap-2 rounded-full bg-white/80 border border-white/70 px-4 py-2.5 text-[13px] font-semibold text-[#1E1B4B] shadow-[0_4px_12px_rgba(124,58,237,0.08)] hover:bg-white hover:-translate-y-0.5 transition-all"
                    >
                      <Printer size={15} /> Print Report
                    </button>
                    {!paid && (
                      <button
                        onClick={() => sendReminder(student)}
                        className="inline-flex items-center gap-2 rounded-full bg-white/80 border border-white/70 px-4 py-2.5 text-[13px] font-semibold text-[#1E1B4B] shadow-[0_4px_12px_rgba(124,58,237,0.08)] hover:bg-white hover:-translate-y-0.5 transition-all"
                      >
                        <Send size={15} /> Send Reminder
                      </button>
                    )}
                  </div>

                  {/* Expanded details / fee history */}
                  {isExpanded && (
                    <div className="relative mt-4 border-t border-white/70 pt-4 space-y-2">
                      <div className="flex items-center justify-between mb-1">
                        <p className="text-[14px] font-semibold text-[#1E1B4B]">Fee History</p>
                        <button onClick={() => setExpandedStudent(null)} className="text-[#6B7280] hover:text-[#1E1B4B]"><ChevronUp size={16} /></button>
                      </div>
                      {history.length === 0 ? (
                        <p className="text-[13px] text-[#6B7280] text-center py-2">No fee history yet</p>
                      ) : history
                        .slice()
                        .sort((a, b) => (b.year - a.year) || ((b.monthIndex ?? months.indexOf(b.month)) - (a.monthIndex ?? months.indexOf(a.month))))
                        .map((fee) => {
                          const isPaidFee = fee.paymentStatus === 'Paid';
                          const change = feeChanges[student._id]?.[fee._id];
                          const pendingStatus = change || fee.paymentStatus;
                          const isPendingPaid = pendingStatus === 'Paid';
                          return (
                            <div key={fee._id || `${fee.month}-${fee.year}`} className="flex items-center justify-between gap-3 rounded-xl bg-white/60 border border-white/70 p-3 text-[13px]">
                              <div className="flex items-center gap-2 min-w-0">
                                <input
                                  type="checkbox"
                                  checked={isPendingPaid}
                                  onChange={() => {
                                    setFeeChanges(prev => {
                                      const studentChanges = prev[student._id] || {};
                                      const newStatus = isPendingPaid ? 'Unpaid' : 'Paid';
                                      const next = { ...studentChanges, [fee._id]: newStatus };
                                      if (newStatus === fee.paymentStatus) delete next[fee._id];
                                      return { ...prev, [student._id]: next };
                                    });
                                  }}
                                  className="h-4 w-4 rounded border-[#C4B5FD] text-[#7C3AED] focus:ring-[#7C3AED]"
                                />
                                <span className="font-medium text-[#1E1B4B]">{fee.month} {fee.year}</span>
                                <span className={`px-2 py-0.5 rounded-full text-[11px] font-semibold ${
                                  change
                                    ? (isPendingPaid ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-600')
                                    : isPaidFee ? 'bg-emerald-100 text-emerald-700'
                                    : fee.paymentStatus === 'Partially Paid' ? 'bg-amber-100 text-amber-700'
                                    : 'bg-rose-100 text-rose-600'
                                }`}>
                                  {change ? (isPendingPaid ? 'Paid' : 'Unpaid') : fee.paymentStatus}
                                </span>
                              </div>
                              <div className="flex items-center gap-3 shrink-0">
                                <div className="text-right">
                                  <div className="text-[#1E1B4B] font-medium">{formatPKR(fee.paidAmount)}</div>
                                  {(fee.remainingAmount || 0) > 0 && <div className="text-rose-600 text-[12px]">Due: {formatPKR(fee.remainingAmount)}</div>}
                                </div>
                                {isPaidFee && !change && fee._id && (
                                  <button
                                    onClick={() => {
                                      axios.get(`/api/fees/receipt/month/${fee._id}`, {
                                        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
                                        responseType: 'blob'
                                      }).then(res => {
                                        const url = window.URL.createObjectURL(new Blob([res.data]));
                                        const link = document.createElement('a');
                                        link.href = url;
                                        link.setAttribute('download', `receipt-${fee.receiptNumber || fee._id}.html`);
                                        document.body.appendChild(link);
                                        link.click();
                                        link.remove();
                                        window.URL.revokeObjectURL(url);
                                      }).catch(console.error);
                                    }}
                                    className="p-1.5 rounded-lg bg-[#EDE9FE] text-[#6D28D9] hover:bg-[#DDD6FE] transition"
                                    title="Download receipt"
                                  >
                                    <Printer size={14} />
                                  </button>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      {Object.keys(feeChanges[student._id] || {}).length > 0 && (
                        <button
                          onClick={async () => {
                            const token = localStorage.getItem('token');
                            const entries = Object.entries(feeChanges[student._id] || {});
                            if (entries.length === 0) return;
                            setSavingChanges(true);
                            try {
                              await Promise.all(entries.map(([feeId, paymentStatus]) =>
                                axios.put(`/api/fees/${feeId}`, { paymentStatus }, { headers: { Authorization: `Bearer ${token}` } })
                              ));
                              setFeeChanges(prev => { const next = { ...prev }; delete next[student._id]; return next; });
                              await refreshStudentFees(student._id);
                            } catch (err) {
                              console.error('Failed to update fee status:', err);
                              alert(err.response?.data?.message || 'Failed to update fee status');
                            }
                            setSavingChanges(false);
                          }}
                          disabled={savingChanges}
                          className="w-full mt-1 py-2.5 rounded-xl bg-gradient-to-r from-[#2E1A87] to-[#4C1D95] text-white text-[13px] font-semibold shadow-[0_6px_16px_rgba(46,26,135,0.25)] hover:opacity-95 transition disabled:opacity-50"
                        >
                          {savingChanges ? 'Saving...' : `Save ${Object.keys(feeChanges[student._id] || {}).length} change(s)`}
                        </button>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Payment Modal */}
      {showPaymentModal && selectedStudent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#1E1B4B]/40 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-[24px] bg-white/90 backdrop-blur-xl border border-white/70 shadow-[0_20px_50px_rgba(30,27,75,0.25)] p-6">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="text-[20px] font-bold text-[#1E1B4B]">Pay Monthly Fee</h3>
                <p className="text-[14px] text-[#6B7280] mt-0.5">{selectedStudent.name} · {selectedStudent.class} {selectedStudent.section}</p>
              </div>
              <button onClick={() => setShowPaymentModal(false)} className="text-[#6B7280] hover:text-[#1E1B4B]"><X size={20} /></button>
            </div>

            <div className="space-y-4 mb-6">
              <div>
                <label className="block text-[#1E1B4B] mb-2 text-[14px] font-medium">Select Month</label>
                <div className="grid grid-cols-2 gap-3">
                  <select value={payMonth} onChange={(e) => setPayMonth(e.target.value)}
                    className="rounded-xl bg-white/80 border border-[#DDD6FE] px-4 py-3 text-[#1E1B4B] focus:outline-none focus:ring-2 focus:ring-[#7C3AED]/30">
                    {months.map(m => <option key={m} value={m}>{m}</option>)}
                  </select>
                  <select value={payYear} onChange={(e) => setPayYear(Number(e.target.value))}
                    className="rounded-xl bg-white/80 border border-[#DDD6FE] px-4 py-3 text-[#1E1B4B] focus:outline-none focus:ring-2 focus:ring-[#7C3AED]/30">
                    {[new Date().getFullYear() - 1, new Date().getFullYear(), new Date().getFullYear() + 1].map(y => (
                      <option key={y} value={y}>{y}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="flex items-center gap-3 text-[#1E1B4B] mb-3 text-[14px]">
                  <input type="checkbox" checked={payFull}
                    onChange={(e) => { setPayFull(e.target.checked); if (e.target.checked) setPayAmount(String(selectedStudent.monthlyFee || 0)); }}
                    className="h-5 w-5 rounded border-[#C4B5FD] text-[#7C3AED] focus:ring-[#7C3AED]" />
                  <span>Pay full fee for {payMonth} {payYear} ({formatPKR(selectedStudent.monthlyFee)})</span>
                </label>
                {!payFull && (
                  <div>
                    <label className="block text-[#1E1B4B] mb-2 text-[14px] font-medium">Partial amount (PKR)</label>
                    <input type="number" value={payAmount} onChange={(e) => setPayAmount(e.target.value)}
                      max={selectedStudent.monthlyFee}
                      className="w-full rounded-xl bg-white/80 border border-[#DDD6FE] px-4 py-3 text-[#1E1B4B] focus:outline-none focus:ring-2 focus:ring-[#7C3AED]/30" />
                  </div>
                )}
              </div>

              <div className="rounded-xl bg-[#F5F3FF] border border-[#DDD6FE] p-4 space-y-2 text-[14px]">
                <div className="flex justify-between"><span className="text-[#6B7280]">Monthly Fee</span><span className="text-[#1E1B4B] font-medium">{formatPKR(selectedStudent.monthlyFee)}</span></div>
                <div className="flex justify-between"><span className="text-[#6B7280]">To Pay</span><span className="font-bold text-[#6D28D9]">{formatPKR(payFull ? selectedStudent.monthlyFee : (Number(payAmount) || 0))}</span></div>
              </div>
            </div>

            <div className="flex gap-3">
              <button onClick={() => setShowPaymentModal(false)}
                className="flex-1 rounded-full bg-white border border-[#DDD6FE] text-[#1E1B4B] py-3 font-semibold hover:bg-[#F5F3FF] transition">
                Cancel
              </button>
              <button onClick={handleFeePayment} disabled={processing[`${selectedStudent._id}-${payMonth}-${payYear}`]}
                className="flex-1 rounded-full bg-gradient-to-r from-[#2E1A87] to-[#4C1D95] text-white py-3 font-semibold shadow-[0_8px_20px_rgba(46,26,135,0.28)] hover:opacity-95 transition disabled:opacity-50">
                {processing[`${selectedStudent._id}-${payMonth}-${payYear}`] ? 'Processing...' : 'Pay Now'}
              </button>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
};

export default StudentProfiles;
