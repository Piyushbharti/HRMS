import React, { useState } from 'react';

/**
 * Panel showing a list of employee names grouped by attendance status.
 * Props:
 *   title: string
 *   variant: 'present' | 'absent' | 'neutral'
 *   employees: Array<{ full_name, employee_id, department? }>
 *   count: number (shown in header chip)
 *   collapsible: boolean (default true)
 */
function NameList({ title, variant = 'present', employees = [], count, collapsible = true }) {
  const [open, setOpen] = useState(true);

  const displayCount = count !== undefined ? count : employees.length;

  return (
    <div className={`name-list-panel nl-${variant}`}>
      <div
        className="nl-header"
        onClick={collapsible ? () => setOpen(o => !o) : undefined}
        style={{ cursor: collapsible ? 'pointer' : 'default' }}
      >
        <div className="nl-title-row">
          <span className={`nl-dot nl-dot-${variant}`} />
          <span className="nl-title">{title}</span>
        </div>
        <div className="nl-header-right">
          <span className={`nl-count-chip nc-${variant}`}>{displayCount}</span>
          {collapsible && (
            <span className="nl-chevron">{open ? '▲' : '▼'}</span>
          )}
        </div>
      </div>

      {open && (
        <div className="nl-body">
          {employees.length === 0 ? (
            <div className="nl-empty">No employees in this group</div>
          ) : (
            <ul className="nl-list">
              {employees.map((emp, idx) => (
                <li key={emp.employee_id || idx} className="nl-item">
                  <div className={`nl-avatar nl-avatar-${variant}`}>
                    {(emp.full_name || '?').charAt(0).toUpperCase()}
                  </div>
                  <div className="nl-info">
                    <span className="nl-name">{emp.full_name}</span>
                    {emp.employee_id && (
                      <span className="nl-id">{emp.employee_id}</span>
                    )}
                  </div>
                  {emp.department && (
                    <span className="nl-dept-tag">{emp.department}</span>
                  )}
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}

export default NameList;
