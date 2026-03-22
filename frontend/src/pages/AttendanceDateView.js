import React, { useState, useEffect, useCallback } from 'react';
import { format } from 'date-fns';
import { FaUsers, FaCalendarCheck, FaCalendarTimes, FaChartBar, FaCalendarAlt, FaSyncAlt } from 'react-icons/fa';
import { attendanceAPI, employeeAPI } from '../services/api';
import parseApiError from '../utils/errorParser';
import NameList from '../components/ui/NameList';
import SkeletonLoader from '../components/ui/SkeletonLoader';
import { toast } from 'react-toastify';

function AttendanceDateView() {
  const [date, setDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [employees, setEmployees] = useState([]);
  const [attendance, setAttendance] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [empRes, attRes] = await Promise.all([
        employeeAPI.getAll(),
        attendanceAPI.getByDate(date),
      ]);
      setEmployees(empRes.data);
      setAttendance(attRes.data);
    } catch (err) {
      toast.error(parseApiError(err));
    } finally {
      setLoading(false);
    }
  }, [date]);

  useEffect(() => { fetchData(); }, [fetchData]);

  // Build employee lookup map
  const empMap = {};
  employees.forEach(e => { empMap[e.employee_id] = e; });

  const presentRecords = attendance.filter(r => r.status === 'Present');
  const absentRecords  = attendance.filter(r => r.status === 'Absent');

  const markedIds = attendance.map(r => r.employee_id);
  const notMarked = employees.filter(e => !markedIds.includes(e.employee_id));

  const rate = employees.length > 0
    ? Math.round((presentRecords.length / employees.length) * 100)
    : 0;

  const presentEmployees = presentRecords.map(r => empMap[r.employee_id] || { full_name: r.employee_id, employee_id: r.employee_id });
  const absentEmployees  = absentRecords.map(r => empMap[r.employee_id]  || { full_name: r.employee_id, employee_id: r.employee_id });

  return (
    <div>
      {/* Header */}
      <div className="section-header">
        <div className="section-title-group">
          <div className="section-title">
            <span className="title-accent" />
            Date-wise Attendance
          </div>
          <div className="section-subtitle">
            View present and absent employees for any date
          </div>
        </div>

        <div className="adv-controls">
          <div className="date-picker-wrap">
            <FaCalendarAlt className="dp-icon" />
            <input
              type="date"
              className="field-input adv-date-input"
              value={date}
              max={format(new Date(), 'yyyy-MM-dd')}
              onChange={e => setDate(e.target.value)}
            />
          </div>
          <button className="btn-ghost" onClick={fetchData} title="Refresh" style={{ height: '42px', padding: '0 14px' }}>
            <FaSyncAlt />
          </button>
        </div>
      </div>

      {/* KPI strip */}
      {loading ? (
        <SkeletonLoader type="kpi" />
      ) : (
        <div className="kpi-grid" style={{ marginBottom: '28px' }}>
          <div className="kpi-chip">
            <div className="kpi-icon-wrap v1"><FaUsers /></div>
            <div className="kpi-data">
              <div className="kpi-value">{employees.length}</div>
              <div className="kpi-label">Total Employees</div>
            </div>
          </div>
          <div className="kpi-chip">
            <div className="kpi-icon-wrap v2"><FaCalendarCheck /></div>
            <div className="kpi-data">
              <div className="kpi-value">{presentRecords.length}</div>
              <div className="kpi-label">Present</div>
            </div>
          </div>
          <div className="kpi-chip">
            <div className="kpi-icon-wrap v3"><FaCalendarTimes /></div>
            <div className="kpi-data">
              <div className="kpi-value">{absentRecords.length}</div>
              <div className="kpi-label">Absent</div>
            </div>
          </div>
          <div className="kpi-chip">
            <div className="kpi-icon-wrap v4"><FaChartBar /></div>
            <div className="kpi-data">
              <div className="kpi-value">{rate}%</div>
              <div className="kpi-label">Attendance Rate</div>
              <div className="kpi-progress-bar">
                <div className="kpi-progress-fill" style={{ width: `${rate}%` }} />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Name lists */}
      {loading ? (
        <div className="glass-card" style={{ padding: '24px' }}>
          <SkeletonLoader rows={6} type="card" />
        </div>
      ) : (
        <div className="adv-name-grid">
          {/* Present */}
          <div className="glass-card" style={{ overflow: 'hidden' }}>
            <div className="card-header">
              <span className="card-title">
                <span className="card-icon green"><FaCalendarCheck /></span>
                Present Employees
              </span>
              <span className="count-badge present-badge">{presentRecords.length} present</span>
            </div>
            <div className="card-body" style={{ padding: '16px' }}>
              <NameList
                title="Present"
                variant="present"
                employees={presentEmployees}
                collapsible={false}
              />
            </div>
          </div>

          {/* Absent */}
          <div className="glass-card" style={{ overflow: 'hidden' }}>
            <div className="card-header">
              <span className="card-title">
                <span className="card-icon red"><FaCalendarTimes /></span>
                Absent Employees
              </span>
              <span className="count-badge absent-badge">{absentRecords.length} absent</span>
            </div>
            <div className="card-body" style={{ padding: '16px' }}>
              <NameList
                title="Absent"
                variant="absent"
                employees={absentEmployees}
                collapsible={false}
              />
            </div>
          </div>
        </div>
      )}

      {/* Not yet marked */}
      {!loading && notMarked.length > 0 && (
        <div className="glass-card" style={{ marginTop: '24px', overflow: 'hidden' }}>
          <div className="card-header">
            <span className="card-title">
              <span className="card-icon indigo">⏳</span>
              Not Yet Marked
            </span>
            <span className="count-badge">{notMarked.length} pending</span>
          </div>
          <div className="card-body" style={{ padding: '16px' }}>
            <NameList
              title="Not Marked"
              variant="neutral"
              employees={notMarked}
              collapsible={false}
            />
          </div>
        </div>
      )}

      {/* Empty state: no employees at all */}
      {!loading && employees.length === 0 && (
        <div className="empty-panel">
          <div className="empty-icon-wrap">📋</div>
          <div className="empty-title">No Employees Found</div>
          <div className="empty-desc">Add employees first to track attendance</div>
        </div>
      )}
    </div>
  );
}

export default AttendanceDateView;
