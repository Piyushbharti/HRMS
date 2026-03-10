import React, { useState } from 'react';
import { format, parseISO, isToday, isYesterday, isThisWeek, isSameMonth } from 'date-fns';
import { FaCalendarCheck, FaCalendarTimes, FaSearch, FaFilter, FaDownload } from 'react-icons/fa';

function AttendanceList({ attendance, employee }) {
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [filterRange, setFilterRange] = useState('all');
  const [sortDir, setSortDir] = useState('desc');

  if (!attendance || attendance.length === 0) {
    return (
      <div className="empty-panel">
        <div className="empty-icon-wrap"><FaCalendarCheck /></div>
        <div className="empty-title">No Records</div>
        <div className="empty-desc">No attendance has been marked yet</div>
      </div>
    );
  }

  const totalDays = attendance.length;
  const presentDays = attendance.filter(a => a.status === 'Present').length;
  const absentDays  = attendance.filter(a => a.status === 'Absent').length;
  const rate = totalDays > 0 ? Math.round((presentDays / totalDays) * 100) : 0;

  const filtered = attendance
    .filter(r => {
      if (search && !r.employee_id.toLowerCase().includes(search.toLowerCase())) return false;
      if (filterStatus && r.status !== filterStatus) return false;
      const d = parseISO(r.date);
      switch (filterRange) {
        case 'today':     return isToday(d);
        case 'yesterday': return isYesterday(d);
        case 'thisWeek':  return isThisWeek(d);
        case 'thisMonth': return isSameMonth(d, new Date());
        default: return true;
      }
    })
    .sort((a, b) => {
      const da = new Date(a.date), db = new Date(b.date);
      return sortDir === 'asc' ? da - db : db - da;
    });

  const handleExport = () => {
    const csv = [
      ['Date', 'Day', 'Employee ID', 'Status'],
      ...attendance.map(r => [r.date, format(parseISO(r.date), 'EEEE'), r.employee_id, r.status])
    ].map(row => row.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `attendance_${employee?.employee_id || 'export'}_${format(new Date(), 'yyyy-MM-dd')}.csv`;
    a.click();
  };

  return (
    <div>
      {/* Summary strip */}
      <div className="att-stats-row">
        <div className="att-stat">
          <div className="att-stat-val purple">{totalDays}</div>
          <div className="att-stat-lbl">Total</div>
        </div>
        <div className="att-stat">
          <div className="att-stat-val green">{presentDays}</div>
          <div className="att-stat-lbl">Present</div>
        </div>
        <div className="att-stat">
          <div className="att-stat-val gray">{absentDays}</div>
          <div className="att-stat-lbl">Absent</div>
        </div>
        <div className="att-stat">
          <div className="att-stat-val purple">{rate}%</div>
          <div className="att-stat-lbl">Rate</div>
        </div>
      </div>

      {/* Controls */}
      <div className="controls-row">
        <div className="search-wrap">
          <FaSearch />
          <input
            className="ctrl-input"
            placeholder="Search by employee ID..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
        <select className="ctrl-select" value={filterStatus} onChange={e => setFilterStatus(e.target.value)}>
          <option value="">All Status</option>
          <option value="Present">Present</option>
          <option value="Absent">Absent</option>
        </select>
        <select className="ctrl-select" value={filterRange} onChange={e => setFilterRange(e.target.value)}>
          <option value="all">All Time</option>
          <option value="today">Today</option>
          <option value="yesterday">Yesterday</option>
          <option value="thisWeek">This Week</option>
          <option value="thisMonth">This Month</option>
        </select>
        <button
          className="btn-ghost"
          style={{ height: '38px', padding: '0 12px' }}
          onClick={() => setSortDir(d => d === 'asc' ? 'desc' : 'asc')}
          title="Toggle sort"
        >
          Date {sortDir === 'asc' ? '↑' : '↓'}
        </button>
        <button className="btn-ghost" style={{ height: '38px', padding: '0 12px' }} onClick={handleExport} title="Export CSV">
          <FaDownload />
        </button>
        <span className="count-badge">{filtered.length} records</span>
      </div>

      {filtered.length === 0 ? (
        <div className="empty-panel">
          <div className="empty-title">No matches</div>
          <div className="empty-desc">Try changing the filters</div>
        </div>
      ) : (
        <table className="data-table">
          <thead>
            <tr>
              <th>Date</th>
              <th>Day</th>
              <th>Employee</th>
              <th>Status</th>
              <th>Note</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(r => {
              const d = parseISO(r.date);
              const todayRow = isToday(d);
              return (
                <tr key={`${r.employee_id}-${r.date}`} style={todayRow ? { background: '#faf5ff' } : {}}>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ fontWeight: 700, fontSize: '14px' }}>{format(d, 'dd')}</span>
                      <span style={{ color: 'var(--text-secondary)', fontSize: '12px' }}>{format(d, 'MMM yyyy')}</span>
                      {todayRow && <span style={{ background: '#ede9fe', color: 'var(--accent)', fontSize: '10px', fontWeight: 700, padding: '2px 7px', borderRadius: '12px' }}>today</span>}
                    </div>
                  </td>
                  <td style={{ color: 'var(--text-secondary)', fontSize: '13px' }}>{format(d, 'EEEE')}</td>
                  <td><span className="emp-id-pill">{r.employee_id}</span></td>
                  <td>
                    <span className={`status-pill ${r.status === 'Present' ? 'present' : 'absent'}`}>
                      <span className={`dot ${r.status === 'Present' ? 'green' : 'red'}`}></span>
                      {r.status}
                    </span>
                  </td>
                  <td style={{ color: 'var(--text-muted)', fontSize: '12.5px' }}>
                    {r.status === 'Present' ? 'Regular attendance' : 'Leave / Absent'}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      )}
    </div>
  );
}

export default AttendanceList;