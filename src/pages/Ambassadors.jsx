import React, { useState, useMemo } from 'react';
import {
  Award,
  Plus,
  Copy,
  Check,
  ExternalLink,
  Edit2,
  Power,
  Search,
  School,
  Mail,
  UserCheck
} from 'lucide-react';
import { useCampaign } from '../context/CampaignContext';
import {
  calcAmbassadorRegistrations,
  calcAmbassadorShare,
  calcAmbassadorLeaderboard
} from '../utils/metrics';
import {
  generateReferralCode,
  isCodeUnique,
  generateShareableUrl
} from '../utils/referralCodes';
import Modal from '../components/Modal';
import SearchBar from '../components/SearchBar';
import EmptyState from '../components/EmptyState';

export default function Ambassadors() {
  const {
    ambassadors,
    registrations,
    settings,
    addAmbassador,
    updateAmbassador,
    toggleAmbassadorStatus,
    addToast
  } = useCampaign();

  const [searchQuery, setSearchQuery] = useState('');
  const [copiedCode, setCopiedCode] = useState(null);
  const [copiedUrl, setCopiedUrl] = useState(null);

  // Modal State for Add / Edit
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingAmbassador, setEditingAmbassador] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    college: '',
    email: '',
    referralCode: '',
    status: 'active'
  });
  const [formErrors, setFormErrors] = useState({});

  // Leaderboard data
  const leaderboard = useMemo(() => {
    return calcAmbassadorLeaderboard(ambassadors, registrations);
  }, [ambassadors, registrations]);

  // Filtered ambassadors
  const filteredAmbassadors = useMemo(() => {
    if (!searchQuery.trim()) return leaderboard;
    const q = searchQuery.toLowerCase().trim();
    return leaderboard.filter(
      (a) =>
        a.name?.toLowerCase().includes(q) ||
        a.college?.toLowerCase().includes(q) ||
        a.referralCode?.toLowerCase().includes(q)
    );
  }, [leaderboard, searchQuery]);

  const handleOpenAdd = () => {
    setEditingAmbassador(null);
    setFormData({
      name: '',
      college: '',
      email: '',
      referralCode: '',
      status: 'active'
    });
    setFormErrors({});
    setIsModalOpen(true);
  };

  const handleOpenEdit = (amb) => {
    setEditingAmbassador(amb);
    setFormData({
      name: amb.name || '',
      college: amb.college || '',
      email: amb.email || '',
      referralCode: amb.referralCode || '',
      status: amb.status || 'active'
    });
    setFormErrors({});
    setIsModalOpen(true);
  };

  const handleNameChange = (val) => {
    setFormData((prev) => {
      const next = { ...prev, name: val };
      // Auto-generate code if adding new and code hasn't been manually set or is empty
      if (!editingAmbassador && (!prev.referralCode || prev.referralCode.startsWith('CAMPUS_'))) {
        if (val.trim()) {
          next.referralCode = generateReferralCode(val);
        }
      }
      return next;
    });
  };

  const validateForm = () => {
    const errors = {};
    if (!formData.name.trim()) errors.name = 'Ambassador name is required.';
    if (!formData.college.trim()) errors.college = 'College name is required.';
    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email.trim())) {
      errors.email = 'Please provide a valid email format (e.g. name@demo.example).';
    }
    if (!formData.referralCode.trim()) {
      errors.referralCode = 'Referral code is required.';
    } else {
      const code = formData.referralCode.trim().toUpperCase();
      if (!isCodeUnique(code, ambassadors, editingAmbassador?.id)) {
        errors.referralCode = `Referral code "${code}" is already assigned to another ambassador.`;
      }
    }
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSave = (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    const payload = {
      name: formData.name.trim(),
      college: formData.college.trim(),
      email: formData.email.trim() ? formData.email.trim() : null,
      referralCode: formData.referralCode.trim().toUpperCase(),
      status: formData.status
    };

    if (editingAmbassador) {
      updateAmbassador(editingAmbassador.id, payload);
      addToast(`Updated ambassador "${payload.name}".`, 'success');
    } else {
      addAmbassador(payload);
      addToast(`Added new ambassador "${payload.name}" with code ${payload.referralCode}.`, 'success');
    }
    setIsModalOpen(false);
  };

  const handleCopyCode = (code) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    addToast(`Copied code "${code}" to clipboard.`, 'success');
    setTimeout(() => setCopiedCode(null), 2500);
  };

  const handleCopyUrl = (code) => {
    const url = generateShareableUrl(settings?.baseUrl, code);
    navigator.clipboard.writeText(url);
    setCopiedUrl(code);
    addToast(`Copied referral URL to clipboard: ${url}`, 'success');
    setTimeout(() => setCopiedUrl(null), 2500);
  };

  return (
    <div className="ambassadors-page">
      {/* Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">Ambassador Management & Leaderboard</h1>
          <p className="page-subtitle">
            Manage student campus ambassadors, generate unique referral links, and track attributed conversions
          </p>
        </div>
        <div style={{ display: 'flex', gap: 'var(--space-3)' }}>
          <button className="btn btn-primary" onClick={handleOpenAdd}>
            <Plus size={16} />
            <span>Add Ambassador</span>
          </button>
        </div>
      </div>

      {/* Toolbar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-5)', flexWrap: 'wrap', gap: 'var(--space-4)' }}>
        <SearchBar
          value={searchQuery}
          onChange={setSearchQuery}
          placeholder="Search by name, college, or referral code..."
        />
        <div style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-secondary)' }}>
          Showing <strong>{filteredAmbassadors.length}</strong> of {ambassadors.length} ambassadors
        </div>
      </div>

      {/* Main Table / Leaderboard */}
      {filteredAmbassadors.length === 0 ? (
        <EmptyState
          icon={Award}
          title={searchQuery ? 'No ambassadors match your search' : 'No ambassadors registered yet'}
          description={
            searchQuery
              ? 'Try adjusting your search terms or clearing the filter.'
              : 'Add campus ambassadors to distribute unique referral codes and track workshop signups.'
          }
          actionLabel={searchQuery ? 'Clear Search' : 'Add First Ambassador'}
          onAction={searchQuery ? () => setSearchQuery('') : handleOpenAdd}
        />
      ) : (
        <div className="data-table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th style={{ width: 60 }}>Rank</th>
                <th>Ambassador</th>
                <th>College Campus</th>
                <th>Referral Code</th>
                <th>Status</th>
                <th style={{ textAlign: 'right' }}>Registrations</th>
                <th style={{ textAlign: 'right' }}>Campaign Share</th>
                <th style={{ textAlign: 'center', width: 140 }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredAmbassadors.map((amb, index) => {
                const regCount = amb.registrationCount;
                const sharePct = amb.share;
                const isTop3 = index < 3 && regCount > 0;

                return (
                  <tr key={amb.id}>
                    <td>
                      <div
                        className="leaderboard-rank"
                        style={{
                          fontWeight: 'bold',
                          color: isTop3 ? 'var(--color-accent-hover)' : 'var(--color-text-secondary)',
                          fontSize: isTop3 ? '1rem' : '0.875rem'
                        }}
                      >
                        #{index + 1}
                      </div>
                    </td>
                    <td>
                      <div style={{ fontWeight: 'var(--font-weight-semibold)', color: 'var(--color-text)' }}>
                        {amb.name}
                      </div>
                      {amb.email && (
                        <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)', display: 'flex', alignItems: 'center', gap: 4 }}>
                          <Mail size={11} /> {amb.email}
                        </div>
                      )}
                    </td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <School size={14} style={{ color: 'var(--color-text-muted)' }} />
                        <span>{amb.college}</span>
                      </div>
                    </td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <code style={{
                          backgroundColor: 'var(--color-border-light)',
                          padding: '3px 6px',
                          borderRadius: 'var(--radius-sm)',
                          fontSize: 'var(--font-size-xs)',
                          fontFamily: 'var(--font-mono)',
                          fontWeight: 'bold',
                          color: 'var(--color-primary)'
                        }}>
                          {amb.referralCode}
                        </code>
                        <button
                          className="btn-icon btn-ghost btn-sm"
                          onClick={() => handleCopyCode(amb.referralCode)}
                          title="Copy referral code"
                        >
                          {copiedCode === amb.referralCode ? <Check size={14} style={{ color: 'var(--color-accent)' }} /> : <Copy size={14} />}
                        </button>
                        <button
                          className="btn-icon btn-ghost btn-sm"
                          onClick={() => handleCopyUrl(amb.referralCode)}
                          title="Copy shareable campaign URL (?ref=CODE)"
                        >
                          {copiedUrl === amb.referralCode ? <Check size={14} style={{ color: 'var(--color-accent)' }} /> : <ExternalLink size={14} />}
                        </button>
                      </div>
                    </td>
                    <td>
                      <span className={`badge ${amb.status === 'active' ? 'badge-active' : 'badge-inactive'}`}>
                        {amb.status === 'active' ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td style={{ textAlign: 'right', fontWeight: 'var(--font-weight-bold)', fontSize: 'var(--font-size-md)' }}>
                      {regCount}
                    </td>
                    <td style={{ textAlign: 'right', color: 'var(--color-text-secondary)', fontSize: 'var(--font-size-sm)' }}>
                      {sharePct.toFixed(1)}%
                    </td>
                    <td style={{ textAlign: 'center' }}>
                      <div style={{ display: 'inline-flex', gap: 4 }}>
                        <button
                          className="btn-icon btn-ghost btn-sm"
                          onClick={() => handleOpenEdit(amb)}
                          title="Edit ambassador details"
                        >
                          <Edit2 size={15} />
                        </button>
                        <button
                          className="btn-icon btn-ghost btn-sm"
                          onClick={() => {
                            toggleAmbassadorStatus(amb.id);
                            const nextStatus = amb.status === 'active' ? 'inactive' : 'active';
                            addToast(`Ambassador ${amb.name} marked as ${nextStatus}. Historical registrations preserved.`, 'info');
                          }}
                          title={amb.status === 'active' ? 'Deactivate ambassador' : 'Activate ambassador'}
                          style={{ color: amb.status === 'active' ? 'var(--color-warning)' : 'var(--color-accent)' }}
                        >
                          <Power size={15} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Add / Edit Ambassador Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingAmbassador ? 'Edit Campus Ambassador' : 'Add Campus Ambassador'}
      >
        <form onSubmit={handleSave}>
          <div className="form-group">
            <label className="form-label">
              Ambassador Full Name <span className="form-required">*</span>
            </label>
            <input
              type="text"
              className="form-input"
              value={formData.name}
              onChange={(e) => handleNameChange(e.target.value)}
              placeholder="e.g. Rahul Sharma"
              autoFocus
            />
            {formErrors.name && <div className="form-error">{formErrors.name}</div>}
          </div>

          <div className="form-group">
            <label className="form-label">
              College / University Campus <span className="form-required">*</span>
            </label>
            <input
              type="text"
              className="form-input"
              value={formData.college}
              onChange={(e) => setFormData({ ...formData, college: e.target.value })}
              placeholder="e.g. JNTU Hyderabad"
            />
            {formErrors.college && <div className="form-error">{formErrors.college}</div>}
          </div>

          <div className="form-group">
            <label className="form-label">
              Contact Email <span style={{ color: 'var(--color-text-muted)', fontSize: 'var(--font-size-xs)' }}>(Simulated demo data)</span>
            </label>
            <input
              type="email"
              className="form-input"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              placeholder="e.g. rahul.sharma@demo.example"
            />
            {formErrors.email && <div className="form-error">{formErrors.email}</div>}
          </div>

          <div className="form-group">
            <label className="form-label">
              Unique Referral Code <span className="form-required">*</span>
            </label>
            <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
              <input
                type="text"
                className="form-input"
                style={{ fontFamily: 'var(--font-mono)', textTransform: 'uppercase' }}
                value={formData.referralCode}
                onChange={(e) => setFormData({ ...formData, referralCode: e.target.value.toUpperCase() })}
                placeholder="e.g. CAMPUS_RAHUL_42"
              />
              <button
                type="button"
                className="btn btn-secondary btn-sm"
                onClick={() => {
                  if (formData.name.trim()) {
                    setFormData({ ...formData, referralCode: generateReferralCode(formData.name) });
                  } else {
                    addToast('Enter ambassador name first to generate a code.', 'info');
                  }
                }}
              >
                Regenerate
              </button>
            </div>
            <div className="form-hint">Used in URLs: <code>?ref={formData.referralCode || 'CODE'}</code></div>
            {formErrors.referralCode && <div className="form-error">{formErrors.referralCode}</div>}
          </div>

          <div className="form-group">
            <label className="form-label">Status</label>
            <select
              className="form-select"
              value={formData.status}
              onChange={(e) => setFormData({ ...formData, status: e.target.value })}
            >
              <option value="active">Active (Eligible for new referrals)</option>
              <option value="inactive">Inactive (Historical referrals preserved)</option>
            </select>
          </div>

          <div className="modal-footer" style={{ padding: 0, marginTop: 'var(--space-6)', borderTop: 'none' }}>
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => setIsModalOpen(false)}
            >
              Cancel
            </button>
            <button type="submit" className="btn btn-primary">
              {editingAmbassador ? 'Save Changes' : 'Create Ambassador'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
