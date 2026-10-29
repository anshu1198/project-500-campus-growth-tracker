import React from 'react';

export default function KPICard({ label, value, subtext, icon: Icon, variant = 'accent', changeText, isPositive }) {
  return (
    <div className="kpi-card">
      {Icon && (
        <div className={`kpi-icon ${variant}`}>
          <Icon size={20} />
        </div>
      )}
      <div className="kpi-content">
        <div className="kpi-label">{label}</div>
        <div className="kpi-value">{value}</div>
        {subtext && (
          <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-secondary)', marginTop: 2 }}>
            {subtext}
          </div>
        )}
        {changeText && (
          <div className={`kpi-change ${isPositive ? 'positive' : 'negative'}`}>
            {changeText}
          </div>
        )}
      </div>
    </div>
  );
}
