import React from 'react';

/**
 * Reusable KPI / stat card.
 * Props: icon, value, label, variant ('purple'|'green'|'red'|'indigo'), trend (optional)
 */
function StatCard({ icon, value, label, variant = 'purple', trend }) {
  return (
    <div className="kpi-chip">
      <div className={`kpi-icon-wrap v-${variant}`}>
        {icon}
      </div>
      <div className="kpi-data">
        <div className="kpi-value">{value}</div>
        <div className="kpi-label">{label}</div>
        {trend !== undefined && (
          <div className={`kpi-trend ${trend >= 0 ? 'up' : 'down'}`}>
            {trend >= 0 ? '▲' : '▼'} {Math.abs(trend)}%
          </div>
        )}
      </div>
    </div>
  );
}

export default StatCard;
