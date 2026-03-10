import React, { useState } from 'react';
import { FaTrash, FaEye, FaSearch, FaFilter, FaUserTie } from 'react-icons/fa';

function EmployeeList({ employees, onDelete, onView }) {
  const [search, setSearch] = useState('');
  const [dept, setDept] = useState('');
  const [sortField, setSortField] = useState('employee_id');
  const [sortDir, setSortDir] = useState('asc');

  const departments = [...new Set(employees.map(e => e.department))].sort();

  const filtered = employees
    .filter(e => {
      const q = search.toLowerCase();
      return (
        (!q || e.full_name.toLowerCase().includes(q) || e.employee_id.toLowerCase().includes(q) || e.email.toLowerCase().includes(q)) &&
        (!dept || e.department === dept)
      );
    })
    .sort((a, b) => {
      let av = (a[sortField] || '').toLowerCase();
      let bv = (b[sortField] || '').toLowerCase();
      return sortDir === 'asc' ? (av > bv ? 1 : -1) : (av < bv ? 1 : -1);
    });

  const handleSort = (f) => {
    if (sortField === f) setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    else { setSortField(f); setSortDir('asc'); }
  };

  const sortIcon = (f) => sortField === f ? (sortDir === 'asc' ? ' ↑' : ' ↓') : '';

  if (employees.length === 0) {
    return (
      <div className="empty-panel">
        <div className="empty-icon-wrap"><FaUserTie /></div>
        <div className="empty-title">No Employees Yet</div>
        <div className="empty-desc">Use the Add Employee button to get started</div>
      </div>
    );
  }

  return (
    <div>
      {/* Controls */}
      <div className="controls-row">
        <div className="search-wrap">
          <FaSearch />
          <input
            className="ctrl-input"
            placeholder="Search by name, ID or email..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
        <select className="ctrl-select" value={dept} onChange={e => setDept(e.target.value)}>
          <option value="">All Departments</option>
          {departments.map(d => <option key={d} value={d}>{d}</option>)}
        </select>
        <span className="count-badge">{filtered.length} / {employees.length}</span>
      </div>

      {filtered.length === 0 ? (
        <div className="empty-panel">
          <div className="empty-title">No matches found</div>
          <div className="empty-desc">Try adjusting your search or filter</div>
        </div>
      ) : (
        <table className="data-table">
          <thead>
            <tr>
              <th onClick={() => handleSort('full_name')}>Employee{sortIcon('full_name')}</th>
              <th onClick={() => handleSort('employee_id')}>ID{sortIcon('employee_id')}</th>
              <th onClick={() => handleSort('email')}>Email{sortIcon('email')}</th>
              <th onClick={() => handleSort('department')}>Department{sortIcon('department')}</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(emp => (
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
                <td>
                  <div className="row-actions">
                    {onView && (
                      <button className="icon-btn view" onClick={() => onView(emp.employee_id)} title="View">
                        <FaEye />
                      </button>
                    )}
                    <button className="icon-btn del" onClick={() => onDelete(emp.employee_id)} title="Delete">
                      <FaTrash />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

export default EmployeeList;