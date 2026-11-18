import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import DashboardLayout from '../components/DashboardLayout';
import { Plus, Search, Edit, Trash2, X } from 'lucide-react';

const classes = ['Nursery', 'KG', 'Class 1', 'Class 2', 'Class 3', 'Class 4', 'Class 5', 'Class 6', 'Class 7', 'Class 8', 'Class 9', 'Class 10'];
const sections = ['A', 'B', 'C', 'D', 'Null Section'];
const genders = ['Male', 'Female'];
const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

const initialForm = {
  name: '', fatherName: '', studentPhone: '', parentPhone: '',
  admissionDate: '', address: '', class: '', section: '', gender: '',
  monthlyFee: '', feeMonth: months[new Date().getMonth()], feeYear: new Date().getFullYear(),
  paidAmount: '0', paymentStatus: 'Unpaid', hasPreviousDue: false,
  pendingAmount: '', pendingDescription: '', pendingMonths: '',
  paidCurrentMonth: false,
};

const Students = () => {
  const [students, setStudents] = useState([]);
  const [search, setSearch] = useState('');
  const [filters, setFilters] = useState({ class: '', section: '', gender: '' });
  const [showForm, setShowForm] = useState(false);
  const [editingStudent, setEditingStudent] = useState(null);
  const [form, setForm] = useState(initialForm);
  const navigate = useNavigate();

  useEffect(() => { fetchStudents() }, []);

  const fetchStudents = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get('/api/students', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setStudents(res.data);
    } catch (err) {
      console.error('Failed to fetch students:', err);
    }
  };

  const filteredStudents = useMemo(() => {
    let result = students;
    if (search) {
      result = result.filter(s =>
        s.name?.toLowerCase().includes(search.toLowerCase()) ||
        s.fatherName?.toLowerCase().includes(search.toLowerCase()) ||
        s.studentPhone?.includes(search)
      );
    }
    if (filters.class) result = result.filter(s => s.class === filters.class);
    if (filters.section) result = result.filter(s => s.section === filters.section);
    if (filters.gender) result = result.filter(s => s.gender === filters.gender);
    return result;
  }, [search, filters, students]);

  const fetchStudentFeeData = async (studentId) => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get(`/api/students/${studentId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      return res.data;
    } catch (err) {
      console.error('Failed to fetch student fee data:', err);
      return null;
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      const data = {
        name: form.name,
        fatherName: form.fatherName,
        studentPhone: form.studentPhone,
        parentPhone: form.parentPhone,
        admissionDate: form.admissionDate,
        address: form.address,
        class: form.class,
        section: form.section,
        gender: form.gender,
        monthlyFee: Number(form.monthlyFee),
      };

      if (editingStudent) {
                    await axios.put(`/api/students/${editingStudent._id}`, data, {
                      headers: { Authorization: `Bearer ${token}` }
                    });
                    if (form.feeMonth) {
                      if (form.paidCurrentMonth) {
                        await axios.post('/api/fees', {
                          student: editingStudent._id,
                          month: form.feeMonth,
                          year: form.feeYear,
                          monthlyFee: Number(form.monthlyFee),
                          paidAmount: Number(form.monthlyFee),
                        }, { headers: { Authorization: `Bearer ${token}` } });
                      } else if (form.paymentStatus === 'Unpaid') {
                        const feeCheck = await axios.get(`/api/fees/student/${editingStudent._id}`, {
                          headers: { Authorization: `Bearer ${token}` }
                        });
                        const existing = feeCheck.data.find(f => f.month === form.feeMonth && f.year === form.feeYear);
                        if (!existing) {
                          await axios.post('/api/fees', {
                            student: editingStudent._id,
                            month: form.feeMonth,
                            year: form.feeYear,
                            monthlyFee: Number(form.monthlyFee),
                            paidAmount: 0,
                          }, { headers: { Authorization: `Bearer ${token}` } });
                        }
                      }
                    }
        if (form.hasPreviousDue && form.pendingAmount && !form.paidCurrentMonth) {
          const dueMonths = parseInt(form.pendingMonths) || 1;
          const totalDueAmount = Number(form.pendingAmount);
          const perMonthDue = Math.round(totalDueAmount / dueMonths);
          for (let i = 0; i < dueMonths; i++) {
            const monthIdx = months.indexOf(form.feeMonth) - (i + 1);
            const dueMonth = monthIdx >= 0 ? months[monthIdx] : months[12 + monthIdx];
            const dueYear = monthIdx >= 0 ? form.feeYear : form.feeYear - 1;
            const existingDue = await axios.get(`/api/fees/student/${editingStudent._id}`, {
              headers: { Authorization: `Bearer ${token}` }
            });
            const hasEntry = existingDue.data.some(f => f.month === dueMonth && f.year === dueYear);
            if (!hasEntry) {
              await axios.post('/api/fees', {
                student: editingStudent._id,
                month: dueMonth,
                year: dueYear,
                monthlyFee: perMonthDue,
                paidAmount: 0,
              }, { headers: { Authorization: `Bearer ${token}` } });
            }
          }
        }
      } else {
        const studentRes = await axios.post('/api/students', data, {
          headers: { Authorization: `Bearer ${token}` }
        });
        const newStudent = studentRes.data;

        if (form.feeMonth) {
          const paidAmt = form.paidCurrentMonth ? Number(form.monthlyFee) : 0;
          await axios.post('/api/fees', {
            student: newStudent._id,
            month: form.feeMonth,
            year: form.feeYear,
            monthlyFee: Number(form.monthlyFee),
            paidAmount: paidAmt,
          }, { headers: { Authorization: `Bearer ${token}` } });
        }

        if (form.hasPreviousDue && form.pendingAmount && form.pendingMonths) {
          const dueMonths = parseInt(form.pendingMonths) || 1;
          const totalDueAmount = Number(form.pendingAmount);
          const perMonthDue = Math.round(totalDueAmount / dueMonths);
          for (let i = 0; i < dueMonths; i++) {
            const monthIdx = months.indexOf(form.feeMonth) - (i + 1);
            const dueMonth = monthIdx >= 0 ? months[monthIdx] : months[12 + monthIdx];
            const dueYear = monthIdx >= 0 ? form.feeYear : form.feeYear - 1;
            await axios.post('/api/fees', {
              student: newStudent._id,
              month: dueMonth,
              year: dueYear,
              monthlyFee: perMonthDue,
              paidAmount: 0,
            }, { headers: { Authorization: `Bearer ${token}` } });
          }
        }
      }

      setShowForm(false);
      setEditingStudent(null);
      setForm(initialForm);
      fetchStudents();
    } catch (err) {
      console.error('Failed to save student:', err);
      alert(err.response?.data?.message || 'Failed to save student');
    }
  };

  const handleEdit = async (student) => {
    setEditingStudent(student);
    const data = await fetchStudentFeeData(student._id);
    const latestFee = data?.feeHistory?.[0];
    setForm({
      name: student.name || '',
      fatherName: student.fatherName || '',
      studentPhone: student.studentPhone || '',
      parentPhone: student.parentPhone || '',
      admissionDate: student.admissionDate?.split('T')[0] || '',
      address: student.address || '',
      class: student.class || '',
      section: student.section || '',
      gender: student.gender || '',
      monthlyFee: student.monthlyFee || '',
      feeMonth: latestFee?.month || months[new Date().getMonth()],
      feeYear: latestFee?.year || new Date().getFullYear(),
      paidAmount: latestFee?.paidAmount?.toString() || '0',
      paymentStatus: latestFee?.paymentStatus || 'Unpaid',
      hasPreviousDue: false,
      pendingAmount: '',
      pendingDescription: '',
      pendingMonths: '',
      paidCurrentMonth: latestFee?.paymentStatus === 'Paid',
    });
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this student? This will also delete all fee history.')) return;
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`/api/students/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchStudents();
    } catch (err) {
      console.error('Failed to delete student:', err);
    }
  };

  return (
    <DashboardLayout>
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-6">
        <h2 className="text-2xl font-bold text-[var(--text-primary)]">Student Management</h2>
        <button
          onClick={() => { setShowForm(true); setEditingStudent(null); setForm(initialForm) }}
          className="flex items-center gap-2 bg-gradient-to-r from-[var(--accent)] to-[var(--accent-dark)] text-[var(--text-primary)] px-5 py-2.5 rounded-xl font-semibold hover:opacity-90 transition w-full sm:w-auto justify-center"
        >
          <Plus size={18} /> Add Student
        </button>
      </div>

      {/* Search and Filters */}
      <div className="bg-[var(--bg-card)] border border-[var(--border-primary)] rounded-2xl p-4 mb-6">
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-secondary)]" size={18} />
            <input
              type="text"
              placeholder="Search by name, father name, or phone..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-[var(--bg-input)] border border-[var(--border-primary)] rounded-xl pl-10 pr-4 py-3 text-[var(--text-primary)] focus:border-[var(--accent)] focus:outline-none"
            />
          </div>
          <div className="flex flex-wrap gap-2">
            <select value={filters.class} onChange={(e) => setFilters({...filters, class: e.target.value})}
              className="bg-[var(--bg-input)] border border-[var(--border-primary)] rounded-xl px-3 sm:px-4 py-3 text-[var(--text-primary)] text-sm focus:border-[var(--accent)] focus:outline-none flex-1 min-w-[130px]">
              <option value="">All Classes</option>
              {classes.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
            <select value={filters.section} onChange={(e) => setFilters({...filters, section: e.target.value})}
              className="bg-[var(--bg-input)] border border-[var(--border-primary)] rounded-xl px-3 sm:px-4 py-3 text-[var(--text-primary)] text-sm focus:border-[var(--accent)] focus:outline-none flex-1 min-w-[110px]">
              <option value="">All Sections</option>
              {sections.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
            <select value={filters.gender} onChange={(e) => setFilters({...filters, gender: e.target.value})}
              className="bg-[var(--bg-input)] border border-[var(--border-primary)] rounded-xl px-3 sm:px-4 py-3 text-[var(--text-primary)] text-sm focus:border-[var(--accent)] focus:outline-none flex-1 min-w-[110px]">
              <option value="">All Genders</option>
              {genders.map(g => <option key={g} value={g}>{g}</option>)}
            </select>
            {(search || filters.class || filters.section || filters.gender) && (
              <button onClick={() => { setSearch(''); setFilters({class:'', section:'', gender:''}) }}
                className="flex items-center gap-1 text-[var(--text-secondary)] hover:text-[var(--text-primary)] px-3 py-2 text-sm">
                <X size={16} /> Clear
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Student List */}
      <div className="bg-[var(--bg-card)] border border-[var(--border-primary)] rounded-2xl overflow-x-auto">
        <table className="w-full text-sm min-w-[750px]">
          <thead>
            <tr className="border-b border-[var(--border-primary)] bg-[var(--bg-input)]/50">
              <th className="text-left py-3 px-4 sm:py-4 sm:px-6 text-[var(--text-secondary)] font-medium whitespace-nowrap">Name</th>
              <th className="text-left py-3 px-4 sm:py-4 sm:px-6 text-[var(--text-secondary)] font-medium whitespace-nowrap">Father Name</th>
              <th className="text-left py-3 px-4 sm:py-4 sm:px-6 text-[var(--text-secondary)] font-medium whitespace-nowrap">Class</th>
              <th className="text-left py-3 px-4 sm:py-4 sm:px-6 text-[var(--text-secondary)] font-medium whitespace-nowrap">Section</th>
              <th className="text-left py-3 px-4 sm:py-4 sm:px-6 text-[var(--text-secondary)] font-medium whitespace-nowrap">Gender</th>
              <th className="text-left py-3 px-4 sm:py-4 sm:px-6 text-[var(--text-secondary)] font-medium whitespace-nowrap">Monthly Fee</th>
              <th className="text-left py-3 px-4 sm:py-4 sm:px-6 text-[var(--text-secondary)] font-medium whitespace-nowrap">Phone</th>
              <th className="text-left py-3 px-4 sm:py-4 sm:px-6 text-[var(--text-secondary)] font-medium whitespace-nowrap">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredStudents.length === 0 ? (
              <tr>
                <td colSpan="8" className="text-center py-12 text-[var(--text-secondary)]">No students found</td>
              </tr>
            ) : (
              filteredStudents.map((student) => (
                <tr key={student._id} className="border-b border-[var(--border-primary)]/50 hover:bg-[var(--bg-hover)]">
                  <td className="py-3 px-4 sm:py-4 sm:px-6 text-[var(--text-primary)] font-medium whitespace-nowrap">{student.name}</td>
                  <td className="py-3 px-4 sm:py-4 sm:px-6 text-[var(--text-primary)] whitespace-nowrap">{student.fatherName}</td>
                  <td className="py-3 px-4 sm:py-4 sm:px-6 text-[var(--text-primary)] whitespace-nowrap">{student.class}</td>
                  <td className="py-3 px-4 sm:py-4 sm:px-6 text-[var(--text-primary)] whitespace-nowrap">{student.section}</td>
                  <td className="py-3 px-4 sm:py-4 sm:px-6 whitespace-nowrap">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      student.gender === 'Male' ? 'bg-[var(--accent-light)] text-[var(--accent)]' : 'bg-[var(--danger-bg)] text-[var(--danger-text)]'
                    }`}>
                      {student.gender}
                    </span>
                  </td>
                  <td className="py-3 px-4 sm:py-4 sm:px-6 text-[var(--text-primary)] whitespace-nowrap">PKR {student.monthlyFee?.toLocaleString()}</td>
                  <td className="py-3 px-4 sm:py-4 sm:px-6 text-[var(--text-primary)] whitespace-nowrap">{student.studentPhone || student.parentPhone}</td>
                  <td className="py-3 px-4 sm:py-4 sm:px-6 whitespace-nowrap">
                    <div className="flex gap-2">
                      <button onClick={() => handleEdit(student)}
                        className="p-2 bg-[var(--accent-light)] text-[var(--accent)] rounded-lg hover:bg-[var(--accent-light)] transition">
                        <Edit size={16} />
                      </button>
                      <button onClick={() => handleDelete(student._id)}
                        className="p-2 bg-[var(--danger-bg)] text-[var(--danger-text)] rounded-lg hover:bg-[var(--danger-bg)] transition">
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Add/Edit Student Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-[var(--bg-overlay)] z-50 flex items-center justify-center p-4">
          <div className="bg-[var(--bg-card)] border border-[var(--border-primary)] rounded-3xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-[var(--bg-card)] border-b border-[var(--border-primary)] p-6 flex items-center justify-between">
              <h3 className="text-xl font-bold text-[var(--text-primary)]">
                {editingStudent ? 'Edit Student' : 'Add New Student'}
              </h3>
              <button onClick={() => { setShowForm(false); setEditingStudent(null) }}
                className="text-[var(--text-secondary)] hover:text-[var(--text-primary)]">
                <X size={24} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              {/* Personal Information */}
              <div>
                <h4 className="text-lg font-semibold text-[var(--text-primary)] mb-4">Personal Information</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[var(--text-primary)] mb-2 text-sm">Student Name</label>
                    <input type="text" value={form.name} onChange={(e) => setForm({...form, name: e.target.value})}
                      className="w-full bg-[var(--bg-input)] border border-[var(--border-primary)] rounded-xl px-4 py-3 text-[var(--text-primary)] focus:border-[var(--accent)] focus:outline-none" required />
                  </div>
                  <div>
                    <label className="block text-[var(--text-primary)] mb-2 text-sm">Father Name</label>
                    <input type="text" value={form.fatherName} onChange={(e) => setForm({...form, fatherName: e.target.value})}
                      className="w-full bg-[var(--bg-input)] border border-[var(--border-primary)] rounded-xl px-4 py-3 text-[var(--text-primary)] focus:border-[var(--accent)] focus:outline-none" required />
                  </div>
                  <div>
                    <label className="block text-[var(--text-primary)] mb-2 text-sm">Student Phone</label>
                    <input type="text" value={form.studentPhone} onChange={(e) => setForm({...form, studentPhone: e.target.value})}
                      className="w-full bg-[var(--bg-input)] border border-[var(--border-primary)] rounded-xl px-4 py-3 text-[var(--text-primary)] focus:border-[var(--accent)] focus:outline-none" />
                  </div>
                  <div>
                    <label className="block text-[var(--text-primary)] mb-2 text-sm">Parent Phone</label>
                    <input type="text" value={form.parentPhone} onChange={(e) => setForm({...form, parentPhone: e.target.value})}
                      className="w-full bg-[var(--bg-input)] border border-[var(--border-primary)] rounded-xl px-4 py-3 text-[var(--text-primary)] focus:border-[var(--accent)] focus:outline-none" required />
                  </div>
                  <div>
                    <label className="block text-[var(--text-primary)] mb-2 text-sm">Admission Date</label>
                    <input type="date" value={form.admissionDate} onChange={(e) => setForm({...form, admissionDate: e.target.value})}
                      className="w-full bg-[var(--bg-input)] border border-[var(--border-primary)] rounded-xl px-4 py-3 text-[var(--text-primary)] focus:border-[var(--accent)] focus:outline-none" required />
                  </div>
                  <div>
                    <label className="block text-[var(--text-primary)] mb-2 text-sm">Class</label>
                    <select value={form.class} onChange={(e) => setForm({...form, class: e.target.value})}
                      className="w-full bg-[var(--bg-input)] border border-[var(--border-primary)] rounded-xl px-4 py-3 text-[var(--text-primary)] focus:border-[var(--accent)] focus:outline-none" required>
                      <option value="">Select Class</option>
                      {classes.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-[var(--text-primary)] mb-2 text-sm">Section</label>
                    <select value={form.section} onChange={(e) => setForm({...form, section: e.target.value})}
                      className="w-full bg-[var(--bg-input)] border border-[var(--border-primary)] rounded-xl px-4 py-3 text-[var(--text-primary)] focus:border-[var(--accent)] focus:outline-none" required>
                      <option value="">Select Section</option>
                      {sections.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-[var(--text-primary)] mb-2 text-sm">Gender</label>
                    <select value={form.gender} onChange={(e) => setForm({...form, gender: e.target.value})}
                      className="w-full bg-[var(--bg-input)] border border-[var(--border-primary)] rounded-xl px-4 py-3 text-[var(--text-primary)] focus:border-[var(--accent)] focus:outline-none" required>
                      <option value="">Select Gender</option>
                      {genders.map(g => <option key={g} value={g}>{g}</option>)}
                    </select>
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-[var(--text-primary)] mb-2 text-sm">Address</label>
                    <textarea value={form.address} onChange={(e) => setForm({...form, address: e.target.value})}
                      className="w-full bg-[var(--bg-input)] border border-[var(--border-primary)] rounded-xl px-4 py-3 text-[var(--text-primary)] focus:border-[var(--accent)] focus:outline-none resize-none" rows="2" required />
                  </div>
                </div>
              </div>

              {/* Fee Information */}
              <div className="border-t border-[var(--border-primary)] pt-6">
                <h4 className="text-lg font-semibold text-[var(--text-primary)] mb-4">Fee Information</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[var(--text-primary)] mb-2 text-sm">Monthly Fee (PKR)</label>
                    <input type="number" value={form.monthlyFee} onChange={(e) => setForm({...form, monthlyFee: e.target.value})}
                      className="w-full bg-[var(--bg-input)] border border-[var(--border-primary)] rounded-xl px-4 py-3 text-[var(--text-primary)] focus:border-[var(--accent)] focus:outline-none" required />
                  </div>
                  <div>
                    <label className="block text-[var(--text-primary)] mb-2 text-sm">Fee Month</label>
                    <select value={form.feeMonth} onChange={(e) => setForm({...form, feeMonth: e.target.value})}
                      className="w-full bg-[var(--bg-input)] border border-[var(--border-primary)] rounded-xl px-4 py-3 text-[var(--text-primary)] focus:border-[var(--accent)] focus:outline-none">
                      {months.map(m => <option key={m} value={m}>{m}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-[var(--text-primary)] mb-2 text-sm">Year</label>
                    <select value={form.feeYear} onChange={(e) => setForm({...form, feeYear: Number(e.target.value)})}
                      className="w-full bg-[var(--bg-input)] border border-[var(--border-primary)] rounded-xl px-4 py-3 text-[var(--text-primary)] focus:border-[var(--accent)] focus:outline-none">
                      {[new Date().getFullYear() - 1, new Date().getFullYear(), new Date().getFullYear() + 1].map(y => (
                        <option key={y} value={y}>{y}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {!editingStudent && (
                  <div className="mt-4">
                    <label className="flex items-center gap-3 text-[var(--text-primary)]">
                      <input type="checkbox" checked={form.paidCurrentMonth}
                        onChange={(e) => setForm({...form, paidCurrentMonth: e.target.checked, paidAmount: e.target.checked ? form.monthlyFee : '0'})}
                        className="w-5 h-5 rounded border-[var(--border-primary)] bg-[var(--bg-input)] text-[var(--accent)] focus:ring-[var(--accent)]" />
                      <span>Current Month Fee Paid</span>
                    </label>
                  </div>
                )}

                {editingStudent && form.paymentStatus && (
                  <div className="mt-4 p-4 bg-[var(--bg-input)] rounded-xl">
                    <p className="text-[var(--text-primary)] text-sm">
                      Current Month Fee Status: {' '}
                      <span className={`font-semibold ${
                        form.paymentStatus === 'Paid' ? 'text-[var(--success-text)]' :
                        form.paymentStatus === 'Partially Paid' ? 'text-[var(--warning-text)]' : 'text-[var(--danger-text)]'
                      }`}>{form.paymentStatus}</span>
                    </p>
                    <p className="text-[var(--text-primary)] text-sm mt-1">
                      Month: {form.feeMonth} {form.feeYear}
                    </p>
                    <p className="text-[var(--text-primary)] text-sm mt-1">
                      Paid: PKR {Number(form.paidAmount).toLocaleString()} 
                    </p>
                    <label className="flex items-center gap-3 text-[var(--text-primary)] mt-3">
                      <input type="checkbox" checked={form.paidCurrentMonth}
                        onChange={(e) => setForm({...form, paidCurrentMonth: e.target.checked})}
                        className="w-5 h-5 rounded border-[var(--border-primary)] bg-[var(--bg-input)] text-[var(--accent)] focus:ring-[var(--accent)]" />
                      <span>Mark as Paid (if not already)</span>
                    </label>
                  </div>
                )}
              </div>

              {/* Previous Pending Dues */}
              <div className="border-t border-[var(--border-primary)] pt-6">
                <label className="flex items-center gap-3 text-[var(--text-primary)] mb-4">
                  <input type="checkbox" checked={form.hasPreviousDue}
                    onChange={(e) => setForm({...form, hasPreviousDue: e.target.checked})}
                    className="w-5 h-5 rounded border-[var(--border-primary)] bg-[var(--bg-input)] text-[var(--accent)] focus:ring-[var(--accent)]" />
                  <span className="font-semibold">Previous Unpaid Dues</span>
                </label>
                {form.hasPreviousDue && (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-[var(--text-primary)] mb-2 text-sm">Total Due Amount (PKR)</label>
                      <input type="number" value={form.pendingAmount} onChange={(e) => setForm({...form, pendingAmount: e.target.value})}
                        className="w-full bg-[var(--bg-input)] border border-[var(--border-primary)] rounded-xl px-4 py-3 text-[var(--text-primary)] focus:border-[var(--accent)] focus:outline-none" />
                    </div>
                    <div>
                      <label className="block text-[var(--text-primary)] mb-2 text-sm">Description</label>
                      <input type="text" value={form.pendingDescription} onChange={(e) => setForm({...form, pendingDescription: e.target.value})}
                        className="w-full bg-[var(--bg-input)] border border-[var(--border-primary)] rounded-xl px-4 py-3 text-[var(--text-primary)] focus:border-[var(--accent)] focus:outline-none" />
                    </div>
                    <div>
                      <label className="block text-[var(--text-primary)] mb-2 text-sm">Number of Months</label>
                      <input type="number" value={form.pendingMonths} onChange={(e) => setForm({...form, pendingMonths: e.target.value})}
                        placeholder="e.g. 2"
                        className="w-full bg-[var(--bg-input)] border border-[var(--border-primary)] rounded-xl px-4 py-3 text-[var(--text-primary)] focus:border-[var(--accent)] focus:outline-none" />
                    </div>
                  </div>
                )}
              </div>

              <button type="submit"
                className="w-full bg-gradient-to-r from-[var(--accent)] to-[var(--accent-dark)] text-[var(--text-primary)] py-4 rounded-xl font-bold text-lg hover:opacity-90 transition">
                {editingStudent ? 'Update Student' : 'Add Student'}
              </button>
            </form>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
};

export default Students;
