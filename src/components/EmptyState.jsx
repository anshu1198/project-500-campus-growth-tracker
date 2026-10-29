import React from 'react';
import { Inbox } from 'lucide-react';

export default function EmptyState({
  icon: Icon = Inbox,
  title = 'No records found',
  description = 'There is no data to display currently.',
  actionLabel,
  onAction
}) {
  return (
    <div className="empty-state">
      <div className="empty-state-icon">
        <Icon size={48} />
      </div>
      <h3 className="empty-state-title">{title}</h3>
      <p className="empty-state-text">{description}</p>
      {actionLabel && onAction && (
        <button
          type="button"
          className="btn btn-primary btn-sm"
          onClick={onAction}
          style={{ marginTop: 'var(--space-4)' }}
        >
          {actionLabel}
        </button>
      )}
    </div>
  );
}
