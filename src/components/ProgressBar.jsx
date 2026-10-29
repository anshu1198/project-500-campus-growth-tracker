import React from 'react';

export default function ProgressBar({ value = 0, max = 100, variant = 'accent', size = 'default', showLabel = false }) {
  const percentage = max > 0 ? Math.min(100, Math.max(0, (value / max) * 100)) : 0;

  return (
    <div style={{ width: '100%' }}>
      {showLabel && (
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 'var(--font-size-xs)', marginBottom: 4 }}>
          <span style={{ color: 'var(--color-text-secondary)' }}>{value} / {max}</span>
          <span style={{ fontWeight: 'var(--font-weight-semibold)', color: 'var(--color-text)' }}>
            {percentage.toFixed(1)}%
          </span>
        </div>
      )}
      <div className={`progress-bar ${size === 'lg' ? 'lg' : ''}`} role="progressbar" aria-valuenow={value} aria-valuemin={0} aria-valuemax={max}>
        <div
          className={`progress-bar-fill ${variant}`}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}
