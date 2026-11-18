import { useState, useEffect, useMemo, useRef } from 'react';
import axios from 'axios';
import DashboardLayout from '../components/DashboardLayout';
import { Download, Search, CheckCircle, XCircle, AlertTriangle, DollarSign } from 'lucide-react';

const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

const FeeManagement = () => {
  const now = new Date();
  const [selectedMonth, setSelectedMonth] = useState(months[now.getMonth()]);
  const [selectedYear, setSelectedYear] = useState(now.getFullYear());
  const [fees, setFees] = useState([]);
  const [allFees, setAllFees] = useState([]);
  const [students, setStudents] = useState([]);
  const [activeTab, setActiveTab] = useState('paid');
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [paymentAmount, setPaymentAmount] = useState('');
  const [processing, setProcessing] = useState(false);

  const hasMounted = useRef(false);
  const [dataLoaded, setDataLoaded] = useState(false);

  useEffect(() => {
    if (!hasMounted.current) {
      hasMounted.current = true;
      fetchInitialData();
    } else {
      fetchMonthFees();
    }
  }, [selectedMonth, selectedYear]);

  const fetchInitialData = async () => {
    try {
      const token = localStorage.getItem('token');
      const headers = { Authorization: `Bearer ${token}` };
      const [feesRes, allFeesRes, studentsRes] = await Promise.all([
        axios.get(`/api/fees?month=${selectedMonth}&year=${selectedYear}`, { headers }),
        axios.get('/api/fees', { headers }),
        axios.get('/api/students', { headers })
      ]);
      setFees(feesRes.data);
      setAllFees(allFeesRes.data);
      setStudents(studentsRes.data);
      setDataLoaded(true);
    } catch (err) {
      console.error('Failed to fetch data:', err);
    }
  };

  const fetchMonthFees = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get(`/api/fees?month=${selectedMonth}&year=${selectedYear}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setFees(res.data);
    } catch (err) {
      console.error('Failed to fetch fees:', err);
    }
  };

  const paidStudents = useMemo(() => fees.filter(f => f.paymentStatus === 'Paid').map(f => f.student?._id), [fees]);
  const unpaidStudents = useMemo(() => students.filter(s => !paidStudents.includes(s._id)), [students, paidStudents]);

  const pendingDues = useMemo(() => students.filter(s => {
    const studentFees = allFees.filter(f => f.student?._id === s._id);
    return studentFees.some(f => f.remainingAmount > 0);
  }), [students, allFees]);

  const refreshData = async () => {
    const token = localStorage.getItem('token');
    const headers = { Authorization: `Bearer ${token}` };
    const [feesRes, allFeesRes] = await Promise.all([
      axios.get(`/api/fees?month=${selectedMonth}&year=${selectedYear}`, { headers }),
      axios.get('/api/fees', { headers })
    ]);
    setFees(feesRes.data);
    setAllFees(allFeesRes.data);
  };

  const handlePayment = async () => {
    if (!selectedStudent || !paymentAmount) return;
    setProcessing(true);
    try {
      const token = localStorage.getItem('token');
      await axios.post('/api/fees', {
        student: selectedStudent._id,
        month: selectedMonth,
        year: selectedYear,
        monthlyFee: selectedStudent.monthlyFee,
        paidAmount: Number(paymentAmount),
      }, { headers: { Authorization: `Bearer ${token}` } });
      setShowPaymentModal(false);
      setPaymentAmount('');
      setSelectedStudent(null);
      refreshData();
    } catch (err) {
      console.error('Payment failed:', err);
      alert('Payment failed');
    }
    setProcessing(false);
  };

  const handleClearAllDues = async (student) => {
    if (!confirm(`Clear all pending dues for ${student.name}?`)) return;
    setProcessing(true);
    try {
      const token = localStorage.getItem('token');
      await axios.post(`/api/fees/pay-all/${student._id}`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      refreshData();
    } catch (err) {
      console.error('Failed to clear dues:', err);
      alert('Failed to clear dues');
    }
    setProcessing(false);
  };

  const generateReceipt = async (fee) => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get(`/api/fees/receipt/month/${fee._id}`, {
        headers: { Authorization: `Bearer ${token}` },
        responseType: 'blob'
      });
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `receipt-${fee.receiptNumber || fee._id}.html`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      console.error('Failed to download receipt:', err);
    }
  };

  const renderStudentList = (studentList, showPayButton = false) => (
    <div className="space-y-3">
      {studentList.length === 0 ? (
        <div className="text-center py-12 text-[var(--text-secondary)]">No students in this category</div>
      ) : (
        studentList.map(student => {
          const fee = fees.find(f => f.student?._id === student._id);
          return (
              <div key={student._id} className="bg-[var(--bg-card)] border border-[var(--border-primary)] rounded-xl p-4 flex items-center justify-between">
                <div>
                  <h4 className="text-[var(--text-primary)] font-semibold">{student.name}</h4>
                  <p className="text-[var(--text-secondary)] text-sm">{student.fatherName} | {student.class} - {student.section}</p>
                  <p className="text-[var(--text-secondary)] text-sm">Monthly Fee: PKR {student.monthlyFee?.toLocaleString()}</p>
                {fee && (
                  <div className="flex gap-2 mt-1 text-xs">
                    {fee.paidAmount > 0 && <span className="text-[var(--success-text)]">Paid: PKR {fee.paidAmount?.toLocaleString()}</span>}
                    {fee.remainingAmount > 0 && <span className="text-[var(--danger-text)]">Due: PKR {fee.remainingAmount?.toLocaleString()}</span>}
                  </div>
                )}
              </div>
              <div className="flex items-center gap-2">
                {fee?.paymentStatus === 'Paid' && (
                  <button onClick={() => generateReceipt(fee)}
                    className="p-2 bg-[var(--accent)]/20 text-[var(--accent)] rounded-lg hover:bg-[var(--accent)]/30 transition">
                    <Download size={16} />
                  </button>
                )}
                {showPayButton && (
                  <>
                    <button
                      onClick={() => { setSelectedStudent(student); setPaymentAmount(String(student.monthlyFee)); setShowPaymentModal(true) }}
                      className="bg-gradient-to-r from-[var(--accent)] to-[var(--accent-dark)] text-[var(--text-primary)] px-4 py-2 rounded-lg text-sm font-semibold hover:opacity-90 transition"
                    >
                      Pay Now
                    </button>
                    <button
                      onClick={() => handleClearAllDues(student)}
                      className="bg-[var(--success-text)] text-[var(--text-primary)] px-4 py-2 rounded-lg text-sm font-semibold hover:opacity-90 transition"
                    >
                      Clear All Dues
                    </button>
                  </>
                )}
              </div>
            </div>
          )
        })
      )}
    </div>
  );

  return (
    <DashboardLayout>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-[var(--text-primary)]">Fee Management</h2>
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

      {/* Tabs */}
      <div className="flex gap-2 mb-6">
        {[
          { id: 'paid', label: 'Paid Students', icon: CheckCircle, color: 'text-[var(--success-text)]' },
          { id: 'unpaid', label: 'Unpaid Students', icon: XCircle, color: 'text-[var(--danger-text)]' },
          { id: 'pending', label: 'Pending Dues', icon: AlertTriangle, color: 'text-[var(--warning-text)]' },
        ].map(tab => {
          const Icon = tab.icon;
          const count = tab.id === 'paid' ? fees.filter(f => f.paymentStatus === 'Paid').length
            : tab.id === 'unpaid' ? unpaidStudents.length
            : allFees.filter(f => f.remainingAmount > 0).length;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-5 py-3 rounded-xl font-medium text-sm transition-all ${
                activeTab === tab.id
                  ? 'bg-[var(--accent)]/20 border border-[var(--accent)]/30 text-[var(--text-primary)]'
                  : 'bg-[var(--bg-card)] border border-[var(--border-primary)] text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
              }`}
            >
              <Icon size={18} className={tab.color} />
              {tab.label}
              <span className="bg-[var(--bg-input)] px-2 py-0.5 rounded-full text-xs">{count}</span>
            </button>
          )
        })}
      </div>

      {/* Content */}
      {activeTab === 'paid' && (
        <div>
          {renderStudentList(students.filter(s => {
            const fee = fees.find(f => f.student?._id === s._id);
            return fee?.paymentStatus === 'Paid';
          }))}
        </div>
      )}

      {activeTab === 'unpaid' && (
        <div>
          {renderStudentList(unpaidStudents, true)}
        </div>
      )}

      {activeTab === 'pending' && (
        <div>
          {renderStudentList(
            students.filter(s => allFees.some(f => f.student?._id === s._id && f.remainingAmount > 0)),
            true
          )}
        </div>
      )}

      {/* Payment Modal */}
      {showPaymentModal && selectedStudent && (
        <div className="fixed inset-0 bg-[var(--bg-overlay)] z-50 flex items-center justify-center p-4">
          <div className="bg-[var(--bg-card)] border border-[var(--border-primary)] rounded-3xl w-full max-w-md p-6">
            <h3 className="text-xl font-bold text-[var(--text-primary)] mb-6">Record Payment</h3>
            <div className="space-y-4 mb-6">
              <div className="text-[var(--text-secondary)]">
                <p>Student: <span className="text-[var(--text-primary)] font-semibold">{selectedStudent.name}</span></p>
                <p>Month: <span className="text-[var(--text-primary)]">{selectedMonth} {selectedYear}</span></p>
                <p>Monthly Fee: <span className="text-[var(--text-primary)]">PKR {selectedStudent.monthlyFee?.toLocaleString()}</span></p>
              </div>
              <div>
                <label className="block text-[var(--text-primary)] mb-2 text-sm">Payment Amount (PKR)</label>
                <input type="number" value={paymentAmount} onChange={(e) => setPaymentAmount(e.target.value)}
                  max={selectedStudent.monthlyFee}
                  className="w-full bg-[var(--bg-input)] border border-[var(--border-primary)] rounded-xl px-4 py-3 text-[var(--text-primary)] focus:border-[var(--accent)] focus:outline-none" />
              </div>
            </div>
            <div className="flex gap-3">
              <button onClick={() => setShowPaymentModal(false)}
                className="flex-1 bg-[var(--border-primary)] text-[var(--text-primary)] py-3 rounded-xl font-semibold hover:opacity-90 transition">
                Cancel
              </button>
              <button onClick={handlePayment} disabled={processing}
                className="flex-1 bg-gradient-to-r from-[var(--accent)] to-[var(--accent-dark)] text-[var(--text-primary)] py-3 rounded-xl font-semibold hover:opacity-90 transition disabled:opacity-50">
                {processing ? 'Processing...' : `Pay PKR ${Number(paymentAmount).toLocaleString()}`}
              </button>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
};

export default FeeManagement;
