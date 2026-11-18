import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import DashboardLayout from '../components/DashboardLayout';
import { Plus, Search, Edit, Trash2, X } from 'lucide-react';

const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
const genders = ['Male', 'Female'];

const initialForm = {
  name: '', phone: '', subjects: '', gender: '', salary: '', joiningDate: '', salaryMonth: months[new Date().getMonth()], salaryYear: new Date().getFullYear(),
  paidAmount: '0', paymentStatus: 'Unpaid', hasPreviousDue: false,
  pendingAmount: '', pendingDescription: '', pendingMonths: '',
  paidCurrentMonth: false,
};

const Teachers = () => {
  const [teachers, setTeachers] = useState([]);
  const [search, setSearch] = useState('');
  const [filters, setFilters] = useState({ gender: '' });
  const [showForm, setShowForm] = useState(false);
  const [editingTeacher, setEditingTeacher] = useState(null);
  const [form, setForm] = useState(initialForm);
  const navigate = useNavigate();

  useEffect(() => { fetchTeachers() }, []);

  const fetchTeachers = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get('/api/teachers', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setTeachers(res.data);
    } catch (err) {
      console.error('Failed to fetch teachers:', err);
    }
  };

  const filteredTeachers = useMemo(() => {
    let result = teachers;
    if (search) {
      result = result.filter(t =>
        t.name?.toLowerCase().includes(search.toLowerCase()) ||
        t.phone?.includes(search)
      );
    }
    if (filters.gender) result = result.filter(t => t.gender === filters.gender);
    return result;
  }, [search, filters, teachers]);

  const fetchTeacherSalaryData = async (teacherId) => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get(`/api/salaries/teacher/${teacherId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      return res.data;
    } catch (err) {
      console.error('Failed to fetch teacher salary data:', err);
      return null;
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      const data = {
        name: form.name,
        phone: form.phone,
        subjects: form.subjects.split(',').map(s => s.trim()).filter(Boolean),
        gender: form.gender,
        salary: Number(form.salary),
        joiningDate: form.joiningDate,
      };

      if (editingTeacher) {
        await axios.put(`/api/teachers/${editingTeacher._id}`, data, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (form.salaryMonth) {
          if (form.paidCurrentMonth) {
            await axios.post('/api/salaries', {
              teacher: editingTeacher._id,
              month: form.salaryMonth,
              year: form.salaryYear,
              monthlySalary: Number(form.salary),
              paidAmount: Number(form.salary),
            }, { headers: { Authorization: `Bearer ${token}` } });
          } else if (form.paymentStatus === 'Unpaid') {
            const salaryCheck = await axios.get(`/api/salaries/teacher/${editingTeacher._id}`, {
              headers: { Authorization: `Bearer ${token}` }
            });
            const existing = salaryCheck.data.find(s => s.month === form.salaryMonth && s.year === form.salaryYear);
            if (!existing) {
              await axios.post('/api/salaries', {
                teacher: editingTeacher._id,
                month: form.salaryMonth,
                year: form.salaryYear,
                monthlySalary: Number(form.salary),
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
            const monthIdx = months.indexOf(form.salaryMonth) - (i + 1);
            const dueMonth = monthIdx >= 0 ? months[monthIdx] : months[12 + monthIdx];
            const dueYear = monthIdx >= 0 ? form.salaryYear : form.salaryYear - 1;
            const existingDue = await axios.get(`/api/salaries/teacher/${editingTeacher._id}`, {
              headers: { Authorization: `Bearer ${token}` }
            });
            const hasEntry = existingDue.data.some(s => s.month === dueMonth && s.year === dueYear);
            if (!hasEntry) {
              await axios.post('/api/salaries', {
                teacher: editingTeacher._id,
                month: dueMonth,
                year: dueYear,
                monthlySalary: perMonthDue,
                paidAmount: 0,
              }, { headers: { Authorization: `Bearer ${token}` } });
            }
          }
        }
      } else {
        const teacherRes = await axios.post('/api/teachers', data, {
          headers: { Authorization: `Bearer ${token}` }
        });
        const newTeacher = teacherRes.data;

        if (form.salaryMonth) {
          const paidAmt = form.paidCurrentMonth ? Number(form.salary) : 0;
          await axios.post('/api/salaries', {
            teacher: newTeacher._id,
            month: form.salaryMonth,
            year: form.salaryYear,
            monthlySalary: Number(form.salary),
            paidAmount: paidAmt,
          }, { headers: { Authorization: `Bearer ${token}` } });
        }

        if (form.hasPreviousDue && form.pendingAmount && form.pendingMonths) {
          const dueMonths = parseInt(form.pendingMonths) || 1;
          const totalDueAmount = Number(form.pendingAmount);
          const perMonthDue = Math.round(totalDueAmount / dueMonths);
          for (let i = 0; i < dueMonths; i++) {
            const monthIdx = months.indexOf(form.salaryMonth) - (i + 1);
            const dueMonth = monthIdx >= 0 ? months[monthIdx] : months[12 + monthIdx];
            const dueYear = monthIdx >= 0 ? form.salaryYear : form.salaryYear - 1;
            await axios.post('/api/salaries', {
              teacher: newTeacher._id,
              month: dueMonth,
              year: dueYear,
              monthlySalary: perMonthDue,
              paidAmount: 0,
            }, { headers: { Authorization: `Bearer ${token}` } });
          }
        }
      }

      setShowForm(false);
      setEditingTeacher(null);
      setForm(initialForm);
      fetchTeachers();
    } catch (err) {
      console.error('Failed to save teacher:', err);
      alert('Failed to save teacher');
    }
  };

  const handleEdit = async (teacher) => {
    setEditingTeacher(teacher);
    const data = await fetchTeacherSalaryData(teacher._id);
    const latestSalary = data?.[0];
    setForm({
      name: teacher.name || '',
      phone: teacher.phone || '',
      subjects: (teacher.subjects || []).join(', '),
      gender: teacher.gender || '',
      salary: teacher.salary || '',
      joiningDate: teacher.joiningDate?.split('T')[0] || '',
      salaryMonth: latestSalary?.month || months[new Date().getMonth()],
      salaryYear: latestSalary?.year || new Date().getFullYear(),
      paidAmount: latestSalary?.paidAmount?.toString() || '0',
      paymentStatus: latestSalary?.paymentStatus || 'Unpaid',
      hasPreviousDue: false,
      pendingAmount: '',
      pendingDescription: '',
      pendingMonths: '',
      paidCurrentMonth: latestSalary?.paymentStatus === 'Paid',
    });
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this teacher? This will also delete all salary history.')) return;
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`/api/teachers/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchTeachers();
    } catch (err) {
      console.error('Failed to delete teacher:', err);
    }
  };

  return (
    <DashboardLayout>
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-6">
        <h2 className="text-2xl font-bold text-[var(--text-primary)]">Teacher Management</h2>
        <button
          onClick={() => { setShowForm(true); setEditingTeacher(null); setForm(initialForm) }}
          className="flex items-center gap-2 bg-gradient-to-r from-[var(--accent)] to-[var(--accent-dark)] text-[var(--text-primary)] px-5 py-2.5 rounded-xl font-semibold hover:opacity-90 transition w-full sm:w-auto justify-center"
        >
          <Plus size={18} /> Add Teacher
        </button>
      </div>

      {/* Search and Filters */}
      <div className="bg-[var(--bg-card)] border border-[var(--border-primary)] rounded-2xl p-4 mb-6">
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-secondary)]" size={18} />
            <input
              type="text"
              placeholder="Search by name or phone..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-[var(--bg-input)] border border-[var(--border-primary)] rounded-xl pl-10 pr-4 py-3 text-[var(--text-primary)] focus:border-[var(--accent)] focus:outline-none"
            />
          </div>
          <div className="flex flex-wrap gap-2">
            <select value={filters.gender} onChange={(e) => setFilters({...filters, gender: e.target.value})}
              className="bg-[var(--bg-input)] border border-[var(--border-primary)] rounded-xl px-3 sm:px-4 py-3 text-[var(--text-primary)] text-sm focus:border-[var(--accent)] focus:outline-none flex-1 min-w-[110px]">
              <option value="">All Genders</option>
              {genders.map(g => <option key={g} value={g}>{g}</option>)}
            </select>
            {(search || filters.gender) && (
              <button onClick={() => { setSearch(''); setFilters({gender:''}) }}
                className="flex items-center gap-1 text-[var(--text-secondary)] hover:text-[var(--text-primary)] px-3 py-2 text-sm">
                <X size={16} /> Clear
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Teacher List */}
      <div className="bg-[var(--bg-card)] border border-[var(--border-primary)] rounded-2xl overflow-x-auto">
        <table className="w-full text-sm min-w-[750px]">
          <thead>
            <tr className="border-b border-[var(--border-primary)] bg-[var(--bg-input)]/50">
              <th className="text-left py-3 px-4 sm:py-4 sm:px-6 text-[var(--text-secondary)] font-medium whitespace-nowrap">Name</th>
              <th className="text-left py-3 px-4 sm:py-4 sm:px-6 text-[var(--text-secondary)] font-medium whitespace-nowrap">Phone</th>
              <th className="text-left py-3 px-4 sm:py-4 sm:px-6 text-[var(--text-secondary)] font-medium whitespace-nowrap">Subjects</th>
              <th className="text-left py-3 px-4 sm:py-4 sm:px-6 text-[var(--text-secondary)] font-medium whitespace-nowrap">Gender</th>
              <th className="text-left py-3 px-4 sm:py-4 sm:px-6 text-[var(--text-secondary)] font-medium whitespace-nowrap">Monthly Salary</th>
              <th className="text-left py-3 px-4 sm:py-4 sm:px-6 text-[var(--text-secondary)] font-medium whitespace-nowrap">Joining Date</th>
              <th className="text-left py-3 px-4 sm:py-4 sm:px-6 text-[var(--text-secondary)] font-medium whitespace-nowrap">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredTeachers.length === 0 ? (
              <tr>
                <td colSpan="7" className="text-center py-12 text-[var(--text-secondary)]">No teachers found</td>
              </tr>
            ) : (
              filteredTeachers.map((teacher) => (
                <tr key={teacher._id} className="border-b border-[var(--border-primary)]/50 hover:bg-[var(--bg-hover)]">
                  <td className="py-3 px-4 sm:py-4 sm:px-6 text-[var(--text-primary)] font-medium whitespace-nowrap">{teacher.name}</td>
                  <td className="py-3 px-4 sm:py-4 sm:px-6 text-[var(--text-primary)] whitespace-nowrap">{teacher.phone}</td>
                  <td className="py-3 px-4 sm:py-4 sm:px-6 text-[var(--text-primary)] whitespace-nowrap">{(teacher.subjects || []).join(', ')}</td>
                  <td className="py-3 px-4 sm:py-4 sm:px-6 whitespace-nowrap">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      teacher.gender === 'Male' ? 'bg-[var(--accent-light)] text-[var(--accent)]' : 'bg-[var(--danger-bg)] text-[var(--danger-text)]'
                    }`}>
                      {teacher.gender || 'Not set'}
                    </span>
                  </td>
                  <td className="py-3 px-4 sm:py-4 sm:px-6 text-[var(--text-primary)] whitespace-nowrap">PKR {teacher.salary?.toLocaleString()}</td>
                  <td className="py-3 px-4 sm:py-4 sm:px-6 text-[var(--text-primary)] whitespace-nowrap">{teacher.joiningDate ? new Date(teacher.joiningDate).toLocaleDateString() : 'Not set'}</td>
                  <td className="py-3 px-4 sm:py-4 sm:px-6 whitespace-nowrap">
                    <div className="flex gap-2">
                      <button onClick={() => handleEdit(teacher)}
                        className="p-2 bg-[var(--accent-light)] text-[var(--accent)] rounded-lg hover:bg-[var(--accent-light)] transition">
                        <Edit size={16} />
                      </button>
                      <button onClick={() => handleDelete(teacher._id)}
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

      {/* Add/Edit Teacher Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-[var(--bg-overlay)] z-50 flex items-center justify-center p-4">
          <div className="bg-[var(--bg-card)] border border-[var(--border-primary)] rounded-3xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-[var(--bg-card)] border-b border-[var(--border-primary)] p-6 flex items-center justify-between">
              <h3 className="text-xl font-bold text-[var(--text-primary)]">
                {editingTeacher ? 'Edit Teacher' : 'Add New Teacher'}
              </h3>
              <button onClick={() => { setShowForm(false); setEditingTeacher(null) }}
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
                    <label className="block text-[var(--text-primary)] mb-2 text-sm">Teacher Name</label>
                    <input type="text" value={form.name} onChange={(e) => setForm({...form, name: e.target.value})}
                      className="w-full bg-[var(--bg-input)] border border-[var(--border-primary)] rounded-xl px-4 py-3 text-[var(--text-primary)] focus:border-[var(--accent)] focus:outline-none" required />
                  </div>
                  <div>
                    <label className="block text-[var(--text-primary)] mb-2 text-sm">Phone Number</label>
                    <input type="text" value={form.phone} onChange={(e) => setForm({...form, phone: e.target.value})}
                      className="w-full bg-[var(--bg-input)] border border-[var(--border-primary)] rounded-xl px-4 py-3 text-[var(--text-primary)] focus:border-[var(--accent)] focus:outline-none" required />
                  </div>
                  <div>
                    <label className="block text-[var(--text-primary)] mb-2 text-sm">Gender</label>
                    <select value={form.gender} onChange={(e) => setForm({...form, gender: e.target.value})}
                      className="w-full bg-[var(--bg-input)] border border-[var(--border-primary)] rounded-xl px-4 py-3 text-[var(--text-primary)] focus:border-[var(--accent)] focus:outline-none" required>
                      <option value="">Select Gender</option>
                      {genders.map(g => <option key={g} value={g}>{g}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-[var(--text-primary)] mb-2 text-sm">Joining Date</label>
                    <input type="date" value={form.joiningDate} onChange={(e) => setForm({...form, joiningDate: e.target.value})}
                      className="w-full bg-[var(--bg-input)] border border-[var(--border-primary)] rounded-xl px-4 py-3 text-[var(--text-primary)] focus:border-[var(--accent)] focus:outline-none" required />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-[var(--text-primary)] mb-2 text-sm">Subjects (comma separated)</label>
                    <input type="text" value={form.subjects} onChange={(e) => setForm({...form, subjects: e.target.value})}
                      className="w-full bg-[var(--bg-input)] border border-[var(--border-primary)] rounded-xl px-4 py-3 text-[var(--text-primary)] focus:border-[var(--accent)] focus:outline-none" required />
                  </div>
                </div>
              </div>

              {/* Salary Information */}
              <div className="border-t border-[var(--border-primary)] pt-6">
                <h4 className="text-lg font-semibold text-[var(--text-primary)] mb-4">Salary Information</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[var(--text-primary)] mb-2 text-sm">Monthly Salary (PKR)</label>
                    <input type="number" value={form.salary} onChange={(e) => setForm({...form, salary: e.target.value})}
                      className="w-full bg-[var(--bg-input)] border border-[var(--border-primary)] rounded-xl px-4 py-3 text-[var(--text-primary)] focus:border-[var(--accent)] focus:outline-none" required />
                  </div>
                  <div>
                    <label className="block text-[var(--text-primary)] mb-2 text-sm">Salary Month</label>
                    <select value={form.salaryMonth} onChange={(e) => setForm({...form, salaryMonth: e.target.value})}
                      className="w-full bg-[var(--bg-input)] border border-[var(--border-primary)] rounded-xl px-4 py-3 text-[var(--text-primary)] focus:border-[var(--accent)] focus:outline-none">
                      {months.map(m => <option key={m} value={m}>{m}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-[var(--text-primary)] mb-2 text-sm">Year</label>
                    <select value={form.salaryYear} onChange={(e) => setForm({...form, salaryYear: Number(e.target.value)})}
                      className="w-full bg-[var(--bg-input)] border border-[var(--border-primary)] rounded-xl px-4 py-3 text-[var(--text-primary)] focus:border-[var(--accent)] focus:outline-none">
                      {[new Date().getFullYear() - 1, new Date().getFullYear(), new Date().getFullYear() + 1].map(y => (
                        <option key={y} value={y}>{y}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {!editingTeacher && (
                  <div className="mt-4">
                    <label className="flex items-center gap-3 text-[var(--text-primary)]">
                      <input type="checkbox" checked={form.paidCurrentMonth}
                        onChange={(e) => setForm({...form, paidCurrentMonth: e.target.checked, paidAmount: e.target.checked ? form.salary : '0'})}
                        className="w-5 h-5 rounded border-[var(--border-primary)] bg-[var(--bg-input)] text-[var(--accent)] focus:ring-[var(--accent)]" />
                      <span>Current Month Salary Paid</span>
                    </label>
                  </div>
                )}

                {editingTeacher && form.paymentStatus && (
                  <div className="mt-4 p-4 bg-[var(--bg-input)] rounded-xl">
                    <p className="text-[var(--text-primary)] text-sm">
                      Current Month Salary Status: {' '}
                      <span className={`font-semibold ${
                        form.paymentStatus === 'Paid' ? 'text-[var(--success-text)]' :
                        form.paymentStatus === 'Partially Paid' ? 'text-[var(--warning-text)]' : 'text-[var(--danger-text)]'
                      }`}>{form.paymentStatus}</span>
                    </p>
                    <p className="text-[var(--text-primary)] text-sm mt-1">
                      Month: {form.salaryMonth} {form.salaryYear}
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
                {editingTeacher ? 'Update Teacher' : 'Add Teacher'}
              </button>
            </form>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
};

export default Teachers;
