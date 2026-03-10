
import { format } from 'date-fns';
import { FaCalendar, FaUser } from 'react-icons/fa';
import '../styles/AttendanceList.css';

function AttendanceList({ attendance, employee }) {
  if (!attendance || attendance.length === 0) {
    return (
      <div className="attendance-empty">
        <div className="empty-icon">
          <FaCalendar />
        </div>
        <p>No attendance records found</p>
      </div>
    );
  }

  return (
    <div className="attendance-list">
      {employee && (
        <div className="attendance-header">
          <div className="employee-info">
            <div className="employee-icon">
              <FaUser />
            </div>
            <div>
              <h3>{employee.full_name}</h3>
              <p className="employee-id">ID: {employee.employee_id}</p>
            </div>
          </div>
          <div className="attendance-summary">
            <div className="summary-item">
              <span className="summary-label">Total Days</span>
              <span className="summary-value">{attendance.length}</span>
            </div>
            <div className="summary-item">
              <span className="summary-label">Present</span>
              <span className="summary-value present">
                {attendance.filter(a => a.status === 'Present').length}
              </span>
            </div>
            <div className="summary-item">
              <span className="summary-label">Absent</span>
              <span className="summary-value absent">
                {attendance.filter(a => a.status === 'Absent').length}
              </span>
            </div>
          </div>
        </div>
      )}

      <div className="attendance-table-container">
        <table className="attendance-table">
          <thead>
            <tr>
              <th>Date</th>
              <th>Day</th>
              <th>Status</th>
              <th>Employee ID</th>
            </tr>
          </thead>
          <tbody>
            {attendance.map((record) => (
              <tr key={`${record.employee_id}-${record.date}`}>
                <td>
                  <div className="date-cell">
                    <span className="date-day">
                      {format(new Date(record.date), 'dd')}
                    </span>
                    <span className="date-month">
                      {format(new Date(record.date), 'MMM')}
                    </span>
                    <span className="date-year">
                      {format(new Date(record.date), 'yyyy')}
                    </span>
                  </div>
                </td>
                <td>
                  <span className="day-name">
                    {format(new Date(record.date), 'EEEE')}
                  </span>
                </td>
                <td>
                  <span className={`status-badge status-${record.status.toLowerCase()}`}>
                    {record.status}
                  </span>
                </td>
                <td>
                  <span className="attendance-employee-id">
                    {record.employee_id}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default AttendanceList;