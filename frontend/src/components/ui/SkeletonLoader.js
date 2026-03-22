import React from 'react';

/**
 * Skeleton loading placeholder.
 * Props:
 *   rows: number of skeleton rows (default 5)
 *   type: 'table' | 'card' | 'kpi' (default 'table')
 */
function SkeletonLoader({ rows = 5, type = 'table' }) {
  if (type === 'kpi') {
    return (
      <div className="kpi-grid">
        {[1, 2, 3, 4].map(i => (
          <div key={i} className="kpi-chip skeleton-kpi">
            <div className="sk-icon-wrap sk-pulse" />
            <div className="sk-data">
              <div className="sk-value sk-pulse" />
              <div className="sk-label sk-pulse" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (type === 'card') {
    return (
      <div className="sk-card-wrap">
        {Array.from({ length: rows }).map((_, i) => (
          <div key={i} className="sk-card-row sk-pulse" style={{ width: `${85 - (i % 3) * 10}%` }} />
        ))}
      </div>
    );
  }

  // Default: table rows
  return (
    <div className="sk-table-wrap">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="sk-row">
          <div className="sk-avatar sk-pulse" />
          <div className="sk-col sk-pulse" style={{ width: '25%' }} />
          <div className="sk-col sk-pulse" style={{ width: '18%' }} />
          <div className="sk-col sk-pulse" style={{ width: '28%' }} />
          <div className="sk-col sk-pulse" style={{ width: '15%' }} />
        </div>
      ))}
    </div>
  );
}

export default SkeletonLoader;
