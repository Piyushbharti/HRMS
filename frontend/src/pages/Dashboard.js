import React, { useState, useEffect } from 'react';
import { employeeAPI, attendanceAPI } from '../services/api';
import { format } from 'date-fns';
import { FaUsers, FaCalendarCheck, FaCalendarTimes, FaChartBar } from 'react-icons/fa';
import { toast } from 'react-toastify';
import NameList from '../components/ui/NameList';
import SkeletonLoader from '../components/ui/SkeletonLoader';
import parseApiError from '../utils/errorParser';

function Dashboard() {
  const [stats, setStats] = useState({ totalEmployees: 0, todayPresent: 0, todayAbsent: 0 });
  const [recentEmployees, setRecentEmployees] = useState([]);
  const [presentEmployees, setPresentEmployees] = useState([]);
  const [absentEmployees, setAbsentEmployees] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { fetchDashboardData(); }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const today = format(new Date(), 'yyyy-MM-dd');
      const [empRes, attRes] = await Promise.all([
        employeeAPI.getAll(),
        attendanceAPI.getByDate(today),
      ]);
      const employees = empRes.data;
      const todayAtt = attRes.data;

      // Build employee lookup map
      const empMap = {};
      employees.forEach(e => { empMap[e.employee_id] = e; });

      const presentRecs = todayAtt.filter(r => r.status === 'Present');
      const absentRecs  = todayAtt.filter(r => r.status === 'Absent');
      const presentCount = presentRecs.length;

      setStats({
        totalEmployees: employees.length,
        todayPresent: presentCount,
        todayAbsent: employees.length - presentCount,
      });
      setRecentEmployees(employees.slice(0, 6));

      // Resolve names
      setPresentEmployees(presentRecs.map(r => empMap[r.employee_id] || { full_name: r.employee_id, employee_id: r.employee_id }));
      setAbsentEmployees(absentRecs.map(r => empMap[r.employee_id] || { full_name: r.employee_id, employee_id: r.employee_id }));
    } catch (err) {
      toast.error(parseApiError(err));
    } finally {
      setLoading(false);
    }
  };

  const attendanceRate = stats.totalEmployees > 0
    ? Math.round((stats.todayPresent / stats.totalEmployees) * 100)
    : 0;

  return (
    <div>
      <div className="section-header">
        <div className="section-title-group">
          <div className="section-title">
            <span className="title-accent" />
            Overview
          </div>
          <div className="section-subtitle">
            {format(new Date(), 'EEEE, MMMM d yyyy')} — Real-time workforce snapshot
          </div>
        </div>
      </div>

      {/* KPI Strip */}
      {loading ? (
        <SkeletonLoader type="kpi" />
      ) : (
        <div className="kpi-grid">
          <div className="kpi-chip">
            <div className="kpi-icon-wrap v1"><FaUsers /></div>
            <div className="kpi-data">
              <div className="kpi-value">{stats.totalEmployees}</div>
              <div className="kpi-label">Total Employees</div>
            </div>
          </div>
          <div className="kpi-chip">
            <div className="kpi-icon-wrap v2"><FaCalendarCheck /></div>
            <div className="kpi-data">
              <div className="kpi-value">{stats.todayPresent}</div>
              <div className="kpi-label">Present Today</div>
            </div>
          </div>
          <div className="kpi-chip">
            <div className="kpi-icon-wrap v3"><FaCalendarTimes /></div>
            <div className="kpi-data">
              <div className="kpi-value">{stats.todayAbsent}</div>
              <div className="kpi-label">Absent Today</div>
            </div>
          </div>
          <div className="kpi-chip">
            <div className="kpi-icon-wrap v4"><FaChartBar /></div>
            <div className="kpi-data">
              <div className="kpi-value">{attendanceRate}%</div>
              <div className="kpi-label">Attendance Rate</div>
              <div className="kpi-progress-bar">
                <div className="kpi-progress-fill" style={{ width: `${attendanceRate}%` }} />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Today's Attendance Name Lists */}
      {!loading && stats.totalEmployees > 0 && (
        <div className="dash-name-grid">
          <NameList
            title="Present Today"
            variant="present"
            employees={presentEmployees}
            collapsible
          />
          <NameList
            title="Absent Today"
            variant="absent"
            employees={absentEmployees}
            collapsible
          />
        </div>
      )}

      {/* Recent Employees */}
      <div className="glass-card" style={{ marginTop: '24px' }}>
        <div className="card-header">
          <span className="card-title">
            <span className="card-icon purple"><FaUsers /></span>
            Recent Employees
          </span>
          <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
            Last {recentEmployees.length} added
          </span>
        </div>

        {loading ? (
          <div style={{ padding: '16px' }}>
            <SkeletonLoader rows={4} type="table" />
          </div>
        ) : recentEmployees.length === 0 ? (
          <div className="empty-panel">
            <div className="empty-icon-wrap">👥</div>
            <div className="empty-title">No Employees Yet</div>
            <div className="empty-desc">Go to Employees to add your first team member</div>
          </div>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th>Employee</th>
                <th>ID</th>
                <th>Email</th>
                <th>Department</th>
              </tr>
            </thead>
            <tbody>
              {recentEmployees.map(emp => (
                <tr key={emp.employee_id}>
                  <td>
                    <div className="emp-cell">
                      <div className="avatar">{emp.full_name.charAt(0).toUpperCase()}</div>
                      <span className="emp-name">{emp.full_name}</span>
                    </div>
                  </td>
                  <td><span className="emp-id-pill">{emp.employee_id}</span></td>
                  <td><a className="email-link" href={`mailto:${emp.email}`}>{emp.email}</a></td>
                  <td><span className="dept-tag">{emp.department}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

export default Dashboard;