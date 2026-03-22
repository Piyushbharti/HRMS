import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { employeeAPI } from '../services/api';
import EmployeeForm from '../components/EmployeeForm';
import EmployeeList from '../components/EmployeeList';
import { FaPlus, FaUsers } from 'react-icons/fa';
import SkeletonLoader from '../components/ui/SkeletonLoader';
import ConfirmModal from '../components/ui/ConfirmModal';
import parseApiError from '../utils/errorParser';

function EmployeeManagement() {
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null); // { id, name }

  useEffect(() => { fetchEmployees(); }, []);

  const fetchEmployees = async () => {
    try {
      setLoading(true);
      const res = await employeeAPI.getAll();
      setEmployees(res.data);
    } catch (err) {
      toast.error(parseApiError(err));
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
      const msg = parseApiError(err);
      toast.error(msg);
      throw err;
    }
  };

  const confirmDelete = (empId) => {
    const emp = employees.find(e => e.employee_id === empId);
    setDeleteTarget({ id: empId, name: emp?.full_name || empId });
  };

  const handleDeleteConfirmed = async () => {
    if (!deleteTarget) return;
    try {
      await employeeAPI.delete(deleteTarget.id);
      toast.success(`${deleteTarget.name} has been removed`);
      fetchEmployees();
    } catch (err) {
      toast.error(parseApiError(err));
    } finally {
      setDeleteTarget(null);
    }
  };

  return (
    <div>
      <div className="section-header">
        <div className="section-title-group">
          <div className="section-title">
            <span className="title-accent" />
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
            <div style={{ padding: '16px' }}>
              <SkeletonLoader rows={5} type="table" />
            </div>
          ) : (
            <EmployeeList employees={employees} onDelete={confirmDelete} />
          )}
        </div>
      </div>

      {/* Confirm Delete Modal */}
      <ConfirmModal
        open={!!deleteTarget}
        title="Delete Employee"
        message={`Remove "${deleteTarget?.name}"? All their attendance records will also be deleted.`}
        confirmLabel="Delete"
        cancelLabel="Keep"
        variant="danger"
        onConfirm={handleDeleteConfirmed}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
}

export default EmployeeManagement;