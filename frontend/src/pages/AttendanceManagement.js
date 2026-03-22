import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { format } from 'date-fns';
import { attendanceAPI, employeeAPI } from '../services/api';
import AttendanceForm from '../components/AttendanceForm';
import AttendanceList from '../components/AttendanceList';
import { FaCalendarAlt, FaListAlt, FaCalendarDay } from 'react-icons/fa';
import parseApiError from '../utils/errorParser';
import SkeletonLoader from '../components/ui/SkeletonLoader';
import { useNavigate } from 'react-router-dom';

function AttendanceManagement() {
  const [employees, setEmployees] = useState([]);
  const [attendance, setAttendance] = useState([]);
  const [selectedEmployee, setSelectedEmployee] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => { fetchEmployees(); }, []);

  const fetchEmployees = async () => {
    try {
      const res = await employeeAPI.getAll();
      setEmployees(res.data);
    } catch (err) {
      toast.error(parseApiError(err));
    }
  };

  const fetchAttendance = async (employeeId) => {
    if (!employeeId) return;
    try {
      setLoading(true);
      const res = await attendanceAPI.getByEmployee(employeeId);
      setAttendance(res.data);
    } catch (err) {
      toast.error(parseApiError(err));
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAttendance = async (data) => {
    try {
      await attendanceAPI.mark(data);
      toast.success('Attendance marked successfully!');
      if (data.employee_id === selectedEmployee) fetchAttendance(selectedEmployee);
    } catch (err) {
      // Re-throw so AttendanceForm can catch and display in its own try/catch
      throw err;
    }
  };

  const handleEmployeeSelect = (empId) => {
    setSelectedEmployee(empId);
    fetchAttendance(empId);
  };

  const selectedEmpObj = employees.find(e => e.employee_id === selectedEmployee);

  return (
    <div>
      <div className="section-header">
        <div className="section-title-group">
          <div className="section-title">
            <span className="title-accent" />
            Attendance
          </div>
          <div className="section-subtitle">Track and manage daily attendance records</div>
        </div>
        <button
          className="btn-ghost"
          onClick={() => navigate('/attendance/date')}
          style={{ display: 'flex', alignItems: 'center', gap: '7px' }}
        >
          <FaCalendarDay />
          Date View
        </button>
      </div>

      <div className="split-layout">
        {/* Mark Attendance Form */}
        <div className="glass-card">
          <div className="card-header">
            <span className="card-title">
              <span className="card-icon purple"><FaCalendarAlt /></span>
              Mark Attendance
            </span>
            <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
              {format(new Date(), 'MMM d, yyyy')}
            </span>
          </div>
          <div className="card-body">
            <AttendanceForm employees={employees} onSuccess={handleMarkAttendance} />
          </div>
        </div>

        {/* Records Panel */}
        <div className="glass-card">
          <div className="card-header">
            <span className="card-title">
              <span className="card-icon indigo"><FaListAlt /></span>
              Attendance Records
            </span>
          </div>

          {/* Employee selector */}
          <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border)' }}>
            <select
              className="ctrl-select"
              style={{ width: '100%' }}
              value={selectedEmployee}
              onChange={e => handleEmployeeSelect(e.target.value)}
            >
              <option value="">— Select an employee to view records —</option>
              {employees.map(emp => (
                <option key={emp.employee_id} value={emp.employee_id}>
                  {emp.full_name} ({emp.employee_id})
                </option>
              ))}
            </select>
          </div>

          {loading ? (
            <div style={{ padding: '16px' }}>
              <SkeletonLoader rows={5} type="table" />
            </div>
          ) : !selectedEmployee ? (
            <div className="empty-panel">
              <div className="empty-icon-wrap">📋</div>
              <div className="empty-title">No Employee Selected</div>
              <div className="empty-desc">Choose an employee above to view their attendance history</div>
            </div>
          ) : attendance.length === 0 ? (
            <div className="empty-panel">
              <div className="empty-icon-wrap">📅</div>
              <div className="empty-title">No Records Found</div>
              <div className="empty-desc">No attendance has been marked for this employee yet</div>
            </div>
          ) : (
            <AttendanceList attendance={attendance} employee={selectedEmpObj} employees={employees} />
          )}
        </div>
      </div>
    </div>
  );
}

export default AttendanceManagement;