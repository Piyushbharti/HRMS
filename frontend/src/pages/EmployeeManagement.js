import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { employeeAPI } from '../services/api';
import EmployeeForm from '../components/EmployeeForm';
import EmployeeList from '../components/EmployeeList';
import { FaPlus, FaUsers } from 'react-icons/fa';

function EmployeeManagement() {
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);

  useEffect(() => { fetchEmployees(); }, []);

  const fetchEmployees = async () => {
    try {
      setLoading(true);
      const res = await employeeAPI.getAll();
      setEmployees(res.data);
    } catch (err) {
      toast.error('Failed to fetch employees');
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = async (data) => {
    try {
      await employeeAPI.create(data);
      toast.success('Employee added successfully!');
      setShowForm(false);
      fetchEmployees();
    } catch (err) {
      const msg = err.response?.data?.detail || Object.values(err.response?.data || {})[0]?.[0] || 'Failed to add employee';
      toast.error(msg);
      throw err;
    }
  };

  const handleDelete = async (empId) => {
    if (!window.confirm(`Delete employee ${empId}? This will also remove their attendance records.`)) return;
    try {
      await employeeAPI.delete(empId);
      toast.success('Employee removed');
      fetchEmployees();
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Delete failed');
    }
  };

  return (
    <div>
      <div className="section-header">
        <div className="section-title-group">
          <div className="section-title">
            <span className="title-accent"></span>
            Employees
          </div>
          <div className="section-subtitle">Manage your workforce records</div>
        </div>
        <button className="btn-primary" onClick={() => setShowForm(!showForm)}>
          <FaPlus />
          {showForm ? 'Cancel' : 'Add Employee'}
        </button>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
        {/* Add Form */}
        {showForm && (
          <div className="glass-card">
            <div className="card-header">
              <span className="card-title">
                <span className="card-icon purple"><FaPlus /></span>
                New Employee
              </span>
            </div>
            <div className="card-body">
              <EmployeeForm onSubmit={handleAdd} />
            </div>
          </div>
        )}

        {/* Employee List */}
        <div className="glass-card">
          <div className="card-header">
            <span className="card-title">
              <span className="card-icon indigo"><FaUsers /></span>
              Employee Directory
            </span>
            <span className="count-badge">{employees.length} total</span>
          </div>
          {loading ? (
            <div className="spinner-wrap"><div className="ring"></div></div>
          ) : (
            <EmployeeList employees={employees} onDelete={handleDelete} />
          )}
        </div>
      </div>
    </div>
  );
}

export default EmployeeManagement;