import React, { useState } from 'react';
import {
  Radio,
  Edit2,
  AlertTriangle,
  CheckCircle,
  Users,
  Target,
  Percent,
  Share2
} from 'lucide-react';
import { useCampaign } from '../context/CampaignContext';
import { calcChannelBreakdown } from '../utils/metrics';
import ProgressBar from '../components/ProgressBar';
import Modal from '../components/Modal';

export default function Channels() {
  const { registrations, channels, settings, updateChannels, addToast } = useCampaign();

  const totalRegs = registrations.length;
  const overallTarget = settings?.registrationTarget || 500;

  // Breakdown
  const channelMetrics = calcChannelBreakdown(registrations, channels);

  // Sum of channel targets
  const sumOfChannelTargets = channels.reduce((sum, ch) => sum + (Number(ch.target) || 0), 0);
  const targetsMismatch = sumOfChannelTargets !== overallTarget;

  // Modal for editing channel targets
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [targetEdits, setTargetEdits] = useState({});

  const handleOpenEditModal = () => {
    const edits = {};
    channels.forEach((ch) => {
      edits[ch.id] = ch.target;
    });
    setTargetEdits(edits);
    setIsEditModalOpen(true);
  };

  const handleSaveTargets = (e) => {
    e.preventDefault();

    const updated = channels.map((ch) => ({
      ...ch,
      target: Math.max(0, parseInt(targetEdits[ch.id], 10) || 0)
    }));

    updateChannels(updated);
    addToast('Channel registration targets updated.', 'success');
    setIsEditModalOpen(false);
  };

  const modalSum = Object.values(targetEdits).reduce(
    (sum, val) => sum + (parseInt(val, 10) || 0),
    0
  );

  return (
    <div className="channels-page">
      {/* Page Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">Campaign Acquisition Channels</h1>
          <p className="page-subtitle">
            Track planned vs actual registration performance across primary distribution funnels
          </p>
        </div>
        <div>
          <button className="btn btn-secondary" onClick={handleOpenEditModal}>
            <Edit2 size={16} />
            <span>Edit Channel Targets</span>
          </button>
        </div>
      </div>

      {/* Warning banner if channel targets mismatch overall target */}
      {targetsMismatch && (
        <div
          className="card channel-warning"
          style={{
            backgroundColor: 'var(--color-warning-light)',
            borderColor: '#fde68a',
            padding: 'var(--space-4) var(--space-5)',
            marginBottom: 'var(--space-6)',
            display: 'flex',
            alignItems: 'flex-start',
            gap: 'var(--space-3)'
          }}
        >
          <AlertTriangle size={20} style={{ color: 'var(--color-warning)', flexShrink: 0, marginTop: 2 }} />
          <div>
            <div style={{ fontWeight: 'var(--font-weight-semibold)', color: '#92400e', fontSize: 'var(--font-size-sm)' }}>
              Channel Target Sum Mismatch
            </div>
            <div style={{ fontSize: 'var(--font-size-xs)', color: '#b45309', marginTop: 2 }}>
              The sum of channel targets is <strong>{sumOfChannelTargets}</strong>, which does not match the overall campaign goal of <strong>{overallTarget}</strong> registrations. Consider adjusting individual channel targets.
            </div>
          </div>
        </div>
      )}

      {/* Channels Grid */}
      <div className="channels-grid">
        {channelMetrics.map((ch) => {
          const shareOfTotal = totalRegs > 0 ? (ch.actual / totalRegs) * 100 : 0;
          const targetAchievedPct = ch.target > 0 ? (ch.actual / ch.target) * 100 : 0;

          return (
            <div key={ch.channelId} className="card channel-card">
              <div className="channel-header" style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)', marginBottom: 'var(--space-4)' }}>
                <div className="kpi-icon accent" style={{ width: 36, height: 36 }}>
                  <Radio size={18} />
                </div>
                <div>
                  <h3 className="card-title" style={{ fontSize: 'var(--font-size-base)' }}>
                    {ch.channelName}
                  </h3>
                  <span className="badge badge-channel" style={{ fontSize: '10px', marginTop: 2 }}>
                    ID: {ch.channelId}
                  </span>
                </div>
              </div>

              {/* Progress Bar */}
              <div style={{ marginBottom: 'var(--space-4)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 'var(--font-size-xs)', marginBottom: 4 }}>
                  <span style={{ color: 'var(--color-text-secondary)' }}>Target Progress</span>
                  <span style={{ fontWeight: 'bold', color: 'var(--color-text)' }}>
                    {targetAchievedPct.toFixed(1)}%
                  </span>
                </div>
                <ProgressBar value={ch.actual} max={ch.target} variant="accent" size="lg" />
              </div>

              {/* Stats Grid */}
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr 1fr',
                  gap: 'var(--space-3)',
                  paddingTop: 'var(--space-3)',
                  borderTop: '1px solid var(--color-border-light)'
                }}
              >
                <div>
                  <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-secondary)' }}>
                    Actual Registrations
                  </div>
                  <div style={{ fontSize: 'var(--font-size-xl)', fontWeight: 'bold', color: 'var(--color-text)' }}>
                    {ch.actual}
                  </div>
                </div>

                <div>
                  <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-secondary)' }}>
                    Planned Target
                  </div>
                  <div style={{ fontSize: 'var(--font-size-xl)', fontWeight: 'bold', color: 'var(--color-text)' }}>
                    {ch.target}
                  </div>
                </div>

                <div>
                  <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-secondary)' }}>
                    Share of Total Signups
                  </div>
                  <div style={{ fontSize: 'var(--font-size-md)', fontWeight: 'semibold', color: 'var(--color-primary)' }}>
                    {shareOfTotal.toFixed(1)}%
                  </div>
                </div>

                <div>
                  <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-secondary)' }}>
                    Remaining to Goal
                  </div>
                  <div style={{ fontSize: 'var(--font-size-md)', fontWeight: 'semibold', color: ch.actual >= ch.target ? 'var(--color-accent-hover)' : 'var(--color-text-secondary)' }}>
                    {Math.max(0, ch.target - ch.actual)}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Attribution Methodology Details */}
      <div className="card" style={{ marginTop: 'var(--space-6)' }}>
        <h3 className="card-title" style={{ marginBottom: 'var(--space-3)' }}>
          Attribution Methodology & Deduplication Rules
        </h3>
        <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-secondary)', lineHeight: 1.6, marginBottom: 'var(--space-3)' }}>
          Every registration is guaranteed to be attributed to exactly one primary channel to prevent double-counting.
          When a student registers, their selected discovery source categorises the registration as follows:
        </p>
        <ul style={{ paddingLeft: 'var(--space-5)', fontSize: 'var(--font-size-sm)', color: 'var(--color-text)', lineHeight: 1.8 }}>
          <li>
            <strong>College Clubs & Student Ambassadors:</strong> Students hearing about the workshop via on-campus tech clubs, student ambassadors, or campus WhatsApp broadcasts.
          </li>
          <li>
            <strong>WhatsApp Communities:</strong> Students joining directly from regional developer groups, batch groups, or alumni chat groups.
          </li>
          <li>
            <strong>LinkedIn & Organic:</strong> Students discovering the workshop via organic posts, founder updates, or mutual student shares.
          </li>
        </ul>
      </div>

      {/* Edit Targets Modal */}
      <Modal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        title="Configure Channel Registration Targets"
      >
        <form onSubmit={handleSaveTargets}>
          <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-secondary)', marginBottom: 'var(--space-5)' }}>
            Adjust the planned registration goals for each marketing funnel. Overall campaign target is <strong>{overallTarget}</strong>.
          </p>

          {channels.map((ch) => (
            <div key={ch.id} className="form-group">
              <label className="form-label">{ch.name}</label>
              <input
                type="number"
                min="0"
                className="form-input"
                value={targetEdits[ch.id] || 0}
                onChange={(e) =>
                  setTargetEdits({
                    ...targetEdits,
                    [ch.id]: e.target.value
                  })
                }
              />
            </div>
          ))}

          <div
            style={{
              padding: 'var(--space-3)',
              borderRadius: 'var(--radius-md)',
              backgroundColor: modalSum === overallTarget ? 'var(--color-accent-light)' : 'var(--color-warning-light)',
              fontSize: 'var(--font-size-xs)',
              marginBottom: 'var(--space-5)',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}
          >
            <span>
              Total Allocated: <strong>{modalSum}</strong> / {overallTarget}
            </span>
            <span>
              {modalSum === overallTarget ? (
                <span style={{ color: 'var(--color-accent-hover)', fontWeight: 'bold' }}>✓ Matches Target</span>
              ) : (
                <span style={{ color: 'var(--color-warning)', fontWeight: 'bold' }}>
                  Difference: {modalSum - overallTarget > 0 ? `+${modalSum - overallTarget}` : modalSum - overallTarget}
                </span>
              )}
            </span>
          </div>

          <div className="modal-footer" style={{ padding: 0, borderTop: 'none' }}>
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => setIsEditModalOpen(false)}
            >
              Cancel
            </button>
            <button type="submit" className="btn btn-primary">
              Save Channel Targets
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
