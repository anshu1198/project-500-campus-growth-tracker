import React, { useState } from 'react';
import { Menu, Download, RotateCcw, Target, Calendar } from 'lucide-react';
import { useCampaign } from '../../context/CampaignContext';
import { exportRegistrationsCSV } from '../../utils/csvExport';
import ConfirmDialog from '../ConfirmDialog';

export default function Header({ onOpenMobile }) {
  const { registrations, settings, resetData, addToast } = useCampaign();
  const [showResetConfirm, setShowResetConfirm] = useState(false);

  const handleExport = () => {
    try {
      exportRegistrationsCSV(registrations);
      addToast('Registration data exported to CSV successfully.', 'success');
    } catch (err) {
      addToast('Failed to export CSV: ' + err.message, 'error');
    }
  };

  const handleResetConfirm = () => {
    resetData();
    setShowResetConfirm(false);
  };

  return (
    <>
      <header className="header" role="banner">
        <div className="header-left">
          <button
            className="mobile-menu-toggle"
            onClick={onOpenMobile}
            aria-label="Open navigation menu"
          >
            <Menu size={20} />
          </button>

          <div>
            <div className="campaign-name">
              {settings?.campaignName || 'Build Your First AI Project in 60 Minutes'}
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', marginTop: 2, flexWrap: 'wrap' }}>
              <span className="badge badge-simulation">Simulation</span>
              <span style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-secondary)', display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                <Calendar size={12} /> {settings?.campaignDuration || 7} Days
              </span>
              <span style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-secondary)', display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                <Target size={12} /> Target: {settings?.registrationTarget || 500}
              </span>
            </div>
          </div>
        </div>

        <div className="header-right">
          <button
            className="btn btn-secondary btn-sm"
            onClick={handleExport}
            title="Export all registration records as CSV"
          >
            <Download size={14} />
            <span className="btn-text">Export CSV</span>
          </button>

          <button
            className="btn btn-secondary btn-sm"
            onClick={() => setShowResetConfirm(true)}
            title="Reset demo data back to default simulated state"
          >
            <RotateCcw size={14} />
            <span className="btn-text">Reset Demo</span>
          </button>
        </div>
      </header>

      <ConfirmDialog
        isOpen={showResetConfirm}
        title="Reset Demo Data?"
        message="This will restore the original fictional seed dataset of registrations, ambassadors, channels, and budget. Any custom additions will be reverted. This action cannot be undone."
        confirmLabel="Reset Demo Data"
        cancelLabel="Cancel"
        isDanger={true}
        onConfirm={handleResetConfirm}
        onCancel={() => setShowResetConfirm(false)}
      />
    </>
  );
}
