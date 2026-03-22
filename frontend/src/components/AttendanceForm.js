import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { format } from 'date-fns';
import { FaCheckCircle, FaTimesCircle, FaUser, FaCalendarAlt, FaSave } from 'react-icons/fa';
import { attendanceAPI } from '../services/api';
import parseApiError from '../utils/errorParser';

function AttendanceForm({ employees, onSuccess }) {
  const [formData, setFormData] = useState({
    employee_id: '',
    date: format(new Date(), 'yyyy-MM-dd'),
    status: 'Present',
  });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [todayAtt, setTodayAtt] = useState([]);

  useEffect(() => {
    if (formData.date) {
      attendanceAPI.getByDate(formData.date)
        .then(r => setTodayAtt(r.data))
        .catch(() => {});
    }
  }, [formData.date]);

  const markedIds = todayAtt.map(r => r.employee_id);
  const available = employees.filter(e => !markedIds.includes(e.employee_id));

  const presentCount = todayAtt.filter(r => r.status === 'Present').length;
  const absentCount  = todayAtt.filter(r => r.status === 'Absent').length;

  // Build labeled lists for already-marked
  const empMap = {};
  employees.forEach(e => { empMap[e.employee_id] = e; });
  const presentNames = todayAtt
    .filter(r => r.status === 'Present')
    .map(r => (empMap[r.employee_id]?.full_name || r.employee_id));
  const absentNames = todayAtt
    .filter(r => r.status === 'Absent')
    .map(r => (empMap[r.employee_id]?.full_name || r.employee_id));

  const validate = () => {
    const e = {};
    if (!formData.employee_id) e.employee_id = 'Please select an employee';
    if (!formData.date) e.date = 'Date is required';
    return e;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(p => ({ ...p, [name]: value }));
    if (errors[name]) setErrors(p => ({ ...p, [name]: '' }));
  };

  const submit = async (data) => {
    const alreadyMarked = todayAtt.find(r => r.employee_id === data.employee_id);
    if (alreadyMarked) {
      toast.error('Attendance already marked for this employee today');
      return;
    }
    setIsSubmitting(true);
    try {
      await onSuccess(data);
      setFormData({ employee_id: '', date: format(new Date(), 'yyyy-MM-dd'), status: 'Present' });
      setErrors({});
      // Refresh today's records
      const r = await attendanceAPI.getByDate(data.date);
      setTodayAtt(r.data);
    } catch (err) {
      toast.error(parseApiError(err));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length > 0) { setErrors(errs); return; }
    submit(formData);
  };

  const quickMark = (status) => {
    if (!formData.employee_id) { toast.warning('Please select an employee first'); return; }
    submit({ ...formData, status });
  };

  return (
    <form onSubmit={handleSubmit}>
      {/* Mini stats */}
      <div className="att-stats-row">
        <div className="att-stat">
          <div className="att-stat-val purple">{employees.length}</div>
          <div className="att-stat-lbl">Total</div>
        </div>
        <div className="att-stat" title={presentNames.join(', ') || 'None'}>
          <div className="att-stat-val green">{presentCount}</div>
          <div className="att-stat-lbl">Present</div>
        </div>
        <div className="att-stat" title={absentNames.join(', ') || 'None'}>
          <div className="att-stat-val red">{absentCount}</div>
          <div className="att-stat-lbl">Absent</div>
        </div>
        <div className="att-stat">
          <div className="att-stat-val purple">{available.length}</div>
          <div className="att-stat-lbl">Remaining</div>
        </div>
      </div>

      <div style={{ height: '16px' }} />

      <div className="form-field">
        <label className="field-label"><FaUser /> Employee *</label>
        <select
          className={`field-select ${errors.employee_id ? 'err' : ''}`}
          name="employee_id" value={formData.employee_id}
          onChange={handleChange}
          disabled={isSubmitting || available.length === 0}
        >
          <option value="">Select employee...</option>
          {available.map(e => (
            <option key={e.employee_id} value={e.employee_id}>
              {e.full_name} — {e.employee_id}
            </option>
          ))}
        </select>
        {errors.employee_id && <div className="field-error">{errors.employee_id}</div>}
        {available.length === 0 && (
          <div className="warn-note">✅ All employees have been marked for today</div>
        )}
      </div>

      <div className="form-row">
        <div className="form-field">
          <label className="field-label"><FaCalendarAlt /> Date *</label>
          <input
            type="date"
            className={`field-input ${errors.date ? 'err' : ''}`}
            name="date" value={formData.date}
            onChange={handleChange}
            max={format(new Date(), 'yyyy-MM-dd')}
            disabled={isSubmitting}
          />
          {errors.date && <div className="field-error">{errors.date}</div>}
        </div>

        <div className="form-field">
          <label className="field-label">Status *</label>
          <select
            className="field-select"
            name="status" value={formData.status}
            onChange={handleChange} disabled={isSubmitting}
          >
            <option value="Present">Present</option>
            <option value="Absent">Absent</option>
          </select>
        </div>
      </div>

      {/* Quick mark */}
      {formData.employee_id && (
        <div className="form-field">
          <label className="field-label">Quick Mark</label>
          <div className="quick-chips">
            <button type="button" className="chip-present" onClick={() => quickMark('Present')} disabled={isSubmitting}>
              <FaCheckCircle /> Present
            </button>
            <button type="button" className="chip-absent" onClick={() => quickMark('Absent')} disabled={isSubmitting}>
              <FaTimesCircle /> Absent
            </button>
          </div>
        </div>
      )}

      <button
        type="submit"
        className="btn-primary"
        disabled={isSubmitting || available.length === 0}
        style={{ width: '100%', justifyContent: 'center', marginTop: '4px' }}
      >
        <FaSave />
        {isSubmitting ? 'Saving...' : 'Save Attendance'}
      </button>
    </form>
  );
}

export default AttendanceForm;