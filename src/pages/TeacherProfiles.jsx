import { useState, useEffect, useMemo } from 'react';
import axios from 'axios';
import DashboardLayout from '../components/DashboardLayout';
import { Search, ChevronDown, ChevronUp, Download, DollarSign } from 'lucide-react';

const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

const TeacherProfiles = () => {
  const [teachers, setTeachers] = useState([]);
  const [salaryHistories, setSalaryHistories] = useState({});
  const [search, setSearch] = useState('');
  const [expandedTeacher, setExpandedTeacher] = useState(null);
  const [processing, setProcessing] = useState({});
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedTeacher, setSelectedTeacher] = useState(null);
  const [payMonth, setPayMonth] = useState(months[new Date().getMonth()]);
  const [payYear, setPayYear] = useState(new Date().getFullYear());
  const [payAmount, setPayAmount] = useState('');
  const [payFull, setPayFull] = useState(true);
  const [unpaidChanges, setUnpaidChanges] = useState({});
  const [savingUnpaid, setSavingUnpaid] = useState(false);

  useEffect(() => { fetchTeachers() }, []);

  const fetchTeachers = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get('/api/teachers', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setTeachers(res.data);
      const salaryResults = await Promise.all(res.data.map(t => fetchSalaryHistory(t._id)));
      const histories = {};
      salaryResults.forEach((salaryData, i) => {
        const latestMap = {};
        salaryData.forEach(s => {
          const key = `${s.month}-${s.year}`;
          if (!latestMap[key] || new Date(s.createdAt) > new Date(latestMap[key].createdAt)) {
            latestMap[key] = s;
          }
        });
        histories[res.data[i]._id] = Object.values(latestMap);
      });
      setSalaryHistories(histories);
    } catch (err) {
      console.error('Failed to fetch teachers:', err);
    }
  };

  const fetchSalaryHistory = async (teacherId) => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get(`/api/salaries/teacher/${teacherId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      return res.data;
    } catch (err) {
      console.error('Failed to fetch salary history:', err);
      return [];
    }
  };

  const handleSalaryPayment = async () => {
    if (!selectedTeacher || !payMonth) return;
    const payKey = `${selectedTeacher._id}-${payMonth}-${payYear}`;
    setProcessing(prev => ({ ...prev, [payKey]: true }));
    try {
      const token = localStorage.getItem('token');
      const monthlySalary = selectedTeacher.salary;
      const paidAmount = payFull ? monthlySalary : (Number(payAmount) || 0);
      await axios.post('/api/salaries', {
        teacher: selectedTeacher._id,
        month: payMonth,
        year: payYear,
        monthlySalary,
        paidAmount,
      }, { headers: { Authorization: `Bearer ${token}` } });
      fetchSalaryHistory(selectedTeacher._id);
      setShowPaymentModal(false);
      setSelectedTeacher(null);
      setPayAmount('');
      setPayFull(true);
    } catch (err) {
      console.error('Payment failed:', err);
      alert('Payment failed');
    }
    setProcessing(prev => ({ ...prev, [payKey]: false }));
  };

  const getTeacherStatus = (teacher) => {
    const history = salaryHistories[teacher._id] || [];
    const now = new Date();
    const currentMonth = months[now.getMonth()];
    const currentYear = now.getFullYear();
    const currentSalary = history.find(s => s.month === currentMonth && s.year === currentYear);
    const hasUnpaidDues = history.some(s => s.remainingAmount > 0);
    if (currentSalary && currentSalary.paymentStatus === 'Paid' && !hasUnpaidDues) {
      return 'green';
    }
    return 'red';
  };

  const getTotalDue = (teacher) => {
    const history = salaryHistories[teacher._id] || [];
    return history.reduce((sum, s) => sum + (s.remainingAmount || 0), 0);
  };

  const getTotalPaid = (teacher) => {
    const history = salaryHistories[teacher._id] || [];
    return history.reduce((sum, s) => sum + (s.paidAmount || 0), 0);
  };

  const getCurrentMonthStatus = (teacher) => {
    const history = salaryHistories[teacher._id] || [];
    const now = new Date();
    const currentMonth = months[now.getMonth()];
    const currentYear = now.getFullYear();
    const salary = history.find(s => s.month === currentMonth && s.year === currentYear);
    return salary || { paymentStatus: 'Unpaid', monthlySalary: teacher.salary, paidAmount: 0, remainingAmount: teacher.salary };
  };

  const getUnpaidMonths = (teacher) => {
    const history = salaryHistories[teacher._id] || [];
    return history.filter(s => s.remainingAmount > 0);
  };

  const filteredTeachers = useMemo(() => teachers.filter(t => {
    const matchSearch = !search || t.name?.toLowerCase().includes(search.toLowerCase());
    return matchSearch;
  }), [teachers, search]);

  const openPaymentModal = (teacher) => {
    setSelectedTeacher(teacher);
    setPayMonth(months[new Date().getMonth()]);
    setPayYear(new Date().getFullYear());
    setPayAmount(String(teacher.salary));
    setPayFull(true);
    setShowPaymentModal(true);
  };

  const generateReceipt = async (teacher) => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get(`/api/fees/salary/receipt/${teacher._id}`, {
        headers: { Authorization: `Bearer ${token}` },
        responseType: 'blob'
      });
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `salary-statement-${teacher.name.replace(/\s+/g, '-').toLowerCase()}.html`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      console.error('Failed to download receipt:', err);
    }
  };

  return (
    <DashboardLayout>
      <h2 className="text-2xl font-bold text-[var(--text-primary)] mb-6">Teacher Profiles</h2>

      <div className="bg-[var(--bg-card)] border border-[var(--border-primary)] rounded-2xl p-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-secondary)]" size={18} />
          <input
            type="text"
            placeholder="Search by teacher name..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-[var(--bg-input)] border border-[var(--border-primary)] rounded-xl pl-10 pr-4 py-3 text-[var(--text-primary)] focus:border-[var(--accent)] focus:outline-none"
          />
        </div>
      </div>

      {filteredTeachers.length === 0 ? (
        <div className="text-center py-12 text-[var(--text-secondary)]">No teachers found</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredTeachers.map((teacher) => {
            const status = getTeacherStatus(teacher);
            const totalDue = getTotalDue(teacher);
            const totalPaid = getTotalPaid(teacher);
            const currentMonthStatus = getCurrentMonthStatus(teacher);
            const unpaidMonths = getUnpaidMonths(teacher);
            const now = new Date();
            const currentMonthName = months[now.getMonth()];

            return (
              <div key={teacher._id} className={`rounded-2xl border p-5 transition-all ${
                status === 'green'
                  ? 'bg-gradient-to-br from-green-500/10 to-green-500/5 border-[var(--success-border)]'
                  : 'bg-gradient-to-br from-red-500/10 to-red-500/5 border-[var(--danger-border)]'
              }`}>
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="text-lg font-bold text-[var(--text-primary)]">{teacher.name}</h3>
                    <p className="text-[var(--text-secondary)] text-sm">{(teacher.subjects || []).join(', ')}</p>
                  </div>
                  <div className={`w-3 h-3 rounded-full ${
                    status === 'green' ? 'bg-[var(--success-text)] shadow-lg shadow-[var(--success-text)]/50' : 'bg-[var(--danger-text)] shadow-lg shadow-[var(--danger-text)]/50'
                  }`} />
                </div>

                <div className="space-y-2 text-sm mb-4">
                  <div className="flex justify-between">
                    <span className="text-[var(--text-secondary)]">Phone</span>
                    <span className="text-[var(--text-primary)]">{teacher.phone}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[var(--text-secondary)]">Monthly Salary</span>
                    <span className="text-[var(--text-primary)] font-medium">PKR {teacher.salary?.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[var(--text-secondary)]">Current Month ({currentMonthName})</span>
                    <span className={`font-medium ${
                      currentMonthStatus.paymentStatus === 'Paid' ? 'text-[var(--success-text)]' : 'text-[var(--danger-text)]'
                    }`}>
                      {currentMonthStatus.paymentStatus}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[var(--text-secondary)]">Total Paid</span>
                    <span className="font-bold text-[var(--success-text)]">PKR {totalPaid.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[var(--text-secondary)]">Total Due</span>
                    <span className={`font-bold ${totalDue > 0 ? 'text-[var(--danger-text)]' : 'text-[var(--success-text)]'}`}>
                      PKR {totalDue.toLocaleString()}
                    </span>
                  </div>
                </div>

                {unpaidMonths.length > 0 && (
                  <div className="mb-3 p-2 bg-[var(--danger-bg)] border border-[var(--danger-border)] rounded-lg">
                    <p className="text-[var(--danger-text)] text-xs font-medium">
                      {unpaidMonths.length} month{unpaidMonths.length > 1 ? 's' : ''} unpaid
                    </p>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {unpaidMonths.slice(0, 3).map((s, i) => (
                        <span key={i} className="text-[10px] bg-[var(--danger-bg)] text-[var(--danger-text)] px-2 py-0.5 rounded">
                          {s.month} {s.year}
                        </span>
                      ))}
                      {unpaidMonths.length > 3 && (
                        <span className="text-[10px] text-[var(--danger-text)]">+{unpaidMonths.length - 3} more</span>
                      )}
                    </div>
                  </div>
                )}

                <div className="flex gap-2">
                  <button
                    onClick={() => openPaymentModal(teacher)}
                    className="flex-1 bg-gradient-to-r from-[var(--accent)] to-[var(--accent-dark)] text-[var(--text-primary)] py-2.5 rounded-xl font-semibold text-sm hover:opacity-90 transition flex items-center justify-center gap-2"
                  >
                    <DollarSign size={16} /> Pay Salary
                  </button>
                  <button
                    onClick={() => generateReceipt(teacher)}
                    className="p-2.5 bg-[var(--accent)]/20 text-[var(--accent)] rounded-xl hover:bg-[var(--accent)]/30 transition"
                    title="Download Salary Statement"
                  >
                    <Download size={18} />
                  </button>
                </div>

                <button
                  onClick={() => {
                    setExpandedTeacher(expandedTeacher === teacher._id ? null : teacher._id);
                    setUnpaidChanges(prev => {
                      const next = { ...prev };
                      delete next[teacher._id];
                      return next;
                    });
                  }}
                  className="w-full flex items-center justify-center gap-1 text-[var(--text-secondary)] hover:text-[var(--text-primary)] py-2 text-sm transition mt-2"
                >
                  {expandedTeacher === teacher._id ? (
                    <>Less History <ChevronUp size={16} /></>
                  ) : (
                    <>View Salary History <ChevronDown size={16} /></>
                  )}
                </button>

                {expandedTeacher === teacher._id && (
                  <div className="mt-2 border-t border-[var(--border-primary)] pt-3 space-y-2">
                    {(salaryHistories[teacher._id] || []).map((salary, i) => {
                      const isPaid = salary.paymentStatus === 'Paid';
                      const isUnchecking = unpaidChanges[teacher._id]?.includes(salary._id);
                      return (
                        <div key={i} className="flex items-center justify-between text-xs bg-[var(--bg-input)]/50 rounded-lg p-3">
                          <div className="flex items-center gap-2">
                            {isPaid && (
                              <input
                                type="checkbox"
                                checked={!isUnchecking}
                                onChange={() => {
                                  setUnpaidChanges(prev => {
                                    const current = prev[teacher._id] || [];
                                    const updated = isUnchecking
                                      ? current.filter(id => id !== salary._id)
                                      : [...current, salary._id];
                                    return { ...prev, [teacher._id]: updated };
                                  });
                                }}
                                className="w-4 h-4 rounded border-[var(--border-primary)] bg-[var(--bg-input)] text-[var(--accent)] focus:ring-[var(--accent)]"
                              />
                            )}
                            <div>
                              <span className="text-[var(--text-primary)] font-medium">{salary.month} {salary.year}</span>
                              <span className={`ml-2 px-2 py-0.5 rounded-full text-xs font-medium ${
                                isUnchecking ? 'bg-[var(--danger-bg)] text-[var(--danger-text)]' :
                                salary.paymentStatus === 'Paid' ? 'bg-[var(--success-bg)] text-[var(--success-text)]' :
                                salary.paymentStatus === 'Partially Paid' ? 'bg-[var(--warning-bg)] text-[var(--warning-text)]' :
                                'bg-[var(--danger-bg)] text-[var(--danger-text)]'
                              }`}>
                                {isUnchecking ? 'Unpaid' : salary.paymentStatus}
                              </span>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <div className="text-right">
                              <div className="text-[var(--text-primary)]">PKR {salary.paidAmount?.toLocaleString()}</div>
                              {salary.remainingAmount > 0 && (
                                <div className="text-[var(--danger-text)]">Due: PKR {salary.remainingAmount?.toLocaleString()}</div>
                              )}
                            </div>
                            {isPaid && !isUnchecking && (
                              <button onClick={async () => {
                                try {
                                  const token = localStorage.getItem('token');
                                  const res = await axios.get(`/api/fees/salary/receipt/month/${salary._id}`, {
                                    headers: { Authorization: `Bearer ${token}` },
                                    responseType: 'blob'
                                  });
                                  const url = window.URL.createObjectURL(new Blob([res.data]));
                                  const link = document.createElement('a');
                                  link.href = url;
                                  link.setAttribute('download', `salary-receipt-${salary.receiptNumber || salary._id}.html`);
                                  document.body.appendChild(link);
                                  link.click();
                                  link.remove();
                                } catch (err) {
                                  console.error('Failed to download receipt:', err);
                                }
                              }}
                                className="p-1.5 bg-[var(--accent)]/20 text-[var(--accent)] rounded-lg hover:bg-[var(--accent)]/30 transition">
                                <Download size={14} />
                              </button>
                            )}
                          </div>
                        </div>
                      );
                    })}
                    {(salaryHistories[teacher._id] || []).length === 0 && (
                      <p className="text-[var(--text-secondary)] text-xs text-center py-2">No salary history yet</p>
                    )}
                    {(unpaidChanges[teacher._id] || []).length > 0 && (
                      <button
                        onClick={async () => {
                          setSavingUnpaid(true);
                          const token = localStorage.getItem('token');
                          const ids = unpaidChanges[teacher._id] || [];
                          try {
                            for (const salaryId of ids) {
                              await axios.put(`/api/salaries/${salaryId}`, { paidAmount: 0 }, {
                                headers: { Authorization: `Bearer ${token}` }
                              });
                            }
                            setUnpaidChanges(prev => {
                              const next = { ...prev };
                              delete next[teacher._id];
                              return next;
                            });
                            fetchSalaryHistory(teacher._id);
                          } catch (err) {
                            console.error('Failed to mark as unpaid:', err);
                            alert('Failed to update salary status');
                          }
                          setSavingUnpaid(false);
                        }}
                        disabled={savingUnpaid}
                        className="w-full py-2 bg-[var(--danger-text)] hover:bg-[var(--danger-border)] text-[var(--text-primary)] rounded-lg text-sm font-semibold transition disabled:opacity-50"
                      >
                        {savingUnpaid ? 'Saving...' : `Mark ${(unpaidChanges[teacher._id] || []).length} salary(s) as Unpaid`}
                      </button>
                    )}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}

      {showPaymentModal && selectedTeacher && (
        <div className="fixed inset-0 bg-[var(--bg-overlay)] z-50 flex items-center justify-center p-4">
          <div className="bg-[var(--bg-card)] border border-[var(--border-primary)] rounded-3xl w-full max-w-md p-6">
            <h3 className="text-xl font-bold text-[var(--text-primary)] mb-2">Pay Monthly Salary</h3>
            <p className="text-[var(--text-secondary)] text-sm mb-6">{selectedTeacher.name} - {(selectedTeacher.subjects || []).join(', ')}</p>

            <div className="space-y-4 mb-6">
              <div>
                <label className="block text-[var(--text-primary)] mb-2 text-sm">Select Month</label>
                <div className="grid grid-cols-2 gap-3">
                  <select value={payMonth} onChange={(e) => setPayMonth(e.target.value)}
                    className="bg-[var(--bg-input)] border border-[var(--border-primary)] rounded-xl px-4 py-3 text-[var(--text-primary)] focus:border-[var(--accent)] focus:outline-none">
                    {months.map(m => <option key={m} value={m}>{m}</option>)}
                  </select>
                  <select value={payYear} onChange={(e) => setPayYear(Number(e.target.value))}
                    className="bg-[var(--bg-input)] border border-[var(--border-primary)] rounded-xl px-4 py-3 text-[var(--text-primary)] focus:border-[var(--accent)] focus:outline-none">
                    {[new Date().getFullYear() - 1, new Date().getFullYear(), new Date().getFullYear() + 1].map(y => (
                      <option key={y} value={y}>{y}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="flex items-center gap-3 text-[var(--text-primary)] mb-3">
                  <input type="checkbox" checked={payFull}
                    onChange={(e) => { setPayFull(e.target.checked); if (e.target.checked) setPayAmount(String(selectedTeacher.salary)) }}
                    className="w-5 h-5 rounded border-[var(--border-primary)] bg-[var(--bg-input)] text-[var(--accent)] focus:ring-[var(--accent)]" />
                  <span>Pay Full Monthly Salary for {payMonth} {payYear} (PKR {selectedTeacher.salary?.toLocaleString()})</span>
                </label>
                {!payFull && (
                  <div>
                    <label className="block text-[var(--text-primary)] mb-2 text-sm">Partial Payment for {payMonth} {payYear} (PKR)</label>
                    <input type="number" value={payAmount} onChange={(e) => setPayAmount(e.target.value)}
                      max={selectedTeacher.salary}
                      className="w-full bg-[var(--bg-input)] border border-[var(--border-primary)] rounded-xl px-4 py-3 text-[var(--text-primary)] focus:border-[var(--accent)] focus:outline-none" />
                  </div>
                )}
              </div>

              <div className="bg-[var(--bg-input)] rounded-xl p-4 space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-[var(--text-secondary)]">Monthly Salary</span>
                  <span className="text-[var(--text-primary)]">PKR {selectedTeacher.salary?.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[var(--text-secondary)]">To Pay</span>
                  <span className="font-bold text-[var(--accent)]">PKR {(payFull ? selectedTeacher.salary : (Number(payAmount) || 0)).toLocaleString()}</span>
                </div>
              </div>
            </div>

            <div className="flex gap-3">
              <button onClick={() => setShowPaymentModal(false)}
                className="flex-1 bg-[var(--border-primary)] text-[var(--text-primary)] py-3 rounded-xl font-semibold hover:opacity-90 transition">
                Cancel
              </button>
              <button onClick={handleSalaryPayment} disabled={processing[`${selectedTeacher._id}-${payMonth}-${payYear}`]}
                className="flex-1 bg-gradient-to-r from-[var(--accent)] to-[var(--accent-dark)] text-[var(--text-primary)] py-3 rounded-xl font-semibold hover:opacity-90 transition disabled:opacity-50">
                {processing[`${selectedTeacher._id}-${payMonth}-${payYear}`] ? 'Processing...' : `Pay Now`}
              </button>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
};

export default TeacherProfiles;
