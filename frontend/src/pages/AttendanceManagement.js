import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { format } from 'date-fns';
import { attendanceAPI, employeeAPI } from '../services/api';
import AttendanceForm from '../components/AttendanceForm';
import AttendanceList from '../components/AttendanceList';
import { FaCalendarAlt, FaListAlt } from 'react-icons/fa';

function AttendanceManagement() {
  const [employees, setEmployees] = useState([]);
  const [attendance, setAttendance] = useState([]);
  const [selectedEmployee, setSelectedEmployee] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => { fetchEmployees(); }, []);

  const fetchEmployees = async () => {
    try {
      const res = await employeeAPI.getAll();
      setEmployees(res.data);
    } catch (err) {
      toast.error('Failed to fetch employees');
    }
  };

  const fetchAttendance = async (employeeId) => {
    if (!employeeId) return;
    try {
      setLoading(true);
      const res = await attendanceAPI.getByEmployee(employeeId);
      setAttendance(res.data);
    } catch (err) {
      toast.error('Failed to fetch attendance');
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAttendance = async (data) => {
    try {
      await attendanceAPI.mark(data);
      toast.success('Attendance marked!');
      if (data.employee_id === selectedEmployee) fetchAttendance(selectedEmployee);
    } catch (err) {
      throw err;
    }
  };

  const handleEmployeeSelect = (empId) => {
    setSelectedEmployee(empId);
    fetchAttendance(empId);
  };

  return (
    <div>
      <div className="section-header">
        <div className="section-title-group">
          <div className="section-title">
            <span className="title-accent"></span>
            Attendance
          </div>
          <div className="section-subtitle">Track and manage daily attendance records</div>
        </div>
      </div>

      <div className="split-layout">
        {/* Mark Attendance Form */}
        <div className="glass-card">
          <div className="card-header">
            <span className="card-title">
              <span className="card-icon purple"><FaCalendarAlt /></span>
              Mark Attendance
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
            <div className="spinner-wrap"><div className="ring"></div></div>
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
            <AttendanceList attendance={attendance} />
          )}
        </div>
      </div>
    </div>
  );
}

export default AttendanceManagement;