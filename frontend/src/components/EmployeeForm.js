import React, { useState } from 'react';
import { FaUser, FaEnvelope, FaIdBadge, FaBuilding, FaUserPlus } from 'react-icons/fa';

const DEPARTMENTS = [
  'Engineering', 'Marketing', 'Sales', 'Human Resources',
  'Finance', 'Operations', 'IT Support', 'Research & Development',
  'Customer Support', 'Product Management'
];

function EmployeeForm({ onSubmit, initialData }) {
  const [formData, setFormData] = useState(initialData || {
    employee_id: '', full_name: '', email: '', department: '',
  });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validate = () => {
    const e = {};
    if (!formData.employee_id.trim()) e.employee_id = 'Employee ID is required';
    else if (!/^[A-Za-z0-9_-]+$/.test(formData.employee_id))
      e.employee_id = 'Only letters, numbers, underscores and hyphens';
    if (!formData.full_name.trim()) e.full_name = 'Full name is required';
    if (!formData.email.trim()) e.email = 'Email is required';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) e.email = 'Invalid email format';
    if (!formData.department) e.department = 'Department is required';
    return e;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(p => ({ ...p, [name]: value }));
    if (errors[name]) setErrors(p => ({ ...p, [name]: '' }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length > 0) { setErrors(errs); return; }
    setIsSubmitting(true);
    try {
      await onSubmit(formData);
      if (!initialData) setFormData({ employee_id: '', full_name: '', email: '', department: '' });
      setErrors({});
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="form-row">
        <div className="form-field">
          <label className="field-label"><FaIdBadge /> Employee ID *</label>
          <input
            className={`field-input ${errors.employee_id ? 'err' : ''}`}
            name="employee_id" value={formData.employee_id}
            onChange={handleChange} placeholder="e.g. E101"
            disabled={isSubmitting || !!initialData}
          />
          {errors.employee_id && <div className="field-error">{errors.employee_id}</div>}
        </div>
        <div className="form-field">
          <label className="field-label"><FaUser /> Full Name *</label>
          <input
            className={`field-input ${errors.full_name ? 'err' : ''}`}
            name="full_name" value={formData.full_name}
            onChange={handleChange} placeholder="e.g. John Doe"
            disabled={isSubmitting}
          />
          {errors.full_name && <div className="field-error">{errors.full_name}</div>}
        </div>
      </div>

      <div className="form-field">
        <label className="field-label"><FaEnvelope /> Email Address *</label>
        <input
          type="email"
          className={`field-input ${errors.email ? 'err' : ''}`}
          name="email" value={formData.email}
          onChange={handleChange} placeholder="john.doe@company.com"
          disabled={isSubmitting}
        />
        {errors.email && <div className="field-error">{errors.email}</div>}
      </div>

      <div className="form-field">
        <label className="field-label"><FaBuilding /> Department *</label>
        <select
          className={`field-select ${errors.department ? 'err' : ''}`}
          name="department" value={formData.department}
          onChange={handleChange} disabled={isSubmitting}
        >
          <option value="">Select department...</option>
          {DEPARTMENTS.map(d => <option key={d} value={d}>{d}</option>)}
        </select>
        {errors.department && <div className="field-error">{errors.department}</div>}
      </div>

      <div style={{ display: 'flex', gap: '10px', marginTop: '8px' }}>
        {initialData && (
          <button type="button" className="btn-ghost" onClick={() => window.history.back()} disabled={isSubmitting}>
            Cancel
          </button>
        )}
        <button type="submit" className="btn-primary" disabled={isSubmitting} style={{ flex: 1, justifyContent: 'center' }}>
          <FaUserPlus />
          {isSubmitting ? 'Saving...' : initialData ? 'Update Employee' : 'Add Employee'}
        </button>
      </div>
    </form>
  );
}

export default EmployeeForm;