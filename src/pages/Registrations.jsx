import React, { useState, useMemo, useEffect, useRef } from 'react';
import {
  Users,
  Plus,
  Trash2,
  Search,
  Filter,
  CheckCircle,
  AlertCircle,
  Calendar,
  School,
  Mail,
  Award,
  Info,
  ChevronLeft,
  ChevronRight,
  Upload,
  FileText
} from 'lucide-react';
import { useCampaign } from '../context/CampaignContext';
import { isValidReferralCode } from '../utils/referralCodes';
import { validateAndProcessImport } from '../utils/csvImport';
import Modal from '../components/Modal';
import ConfirmDialog from '../components/ConfirmDialog';
import SearchBar from '../components/SearchBar';
import EmptyState from '../components/EmptyState';

const PAGE_SIZE = 10;

export default function Registrations({ initialRefCode, onClearRefCode }) {
  const {
    registrations,
    ambassadors,
    addRegistration,
    deleteRegistration,
    updateRegistrations,
    addToast
  } = useCampaign();

  // Search, filter, pagination
  const [searchQuery, setSearchQuery] = useState('');
  const [channelFilter, setChannelFilter] = useState('all');
  const [ambassadorFilter, setAmbassadorFilter] = useState('all');
  const [sortOrder, setSortOrder] = useState('desc'); // desc = newest first
  const [currentPage, setCurrentPage] = useState(1);

  // Add Registration Modal
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    college: '',
    discoveryChannel: 'college-club',
    referralCode: ''
  });
  const [formErrors, setFormErrors] = useState({});

  // CSV Import State
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [importPreview, setImportPreview] = useState(null);
  const [importError, setImportError] = useState(null);
  const fileInputRef = useRef(null);

  // Delete Confirm Dialog
  const [deleteTarget, setDeleteTarget] = useState(null);

  // If initialRefCode arrived from URL ?ref=CODE, open modal with code prefilled
  useEffect(() => {
    if (initialRefCode) {
      setFormData({
        name: '',
        email: '',
        college: '',
        discoveryChannel: 'college-club',
        referralCode: initialRefCode
      });
      setIsAddModalOpen(true);
      if (onClearRefCode) onClearRefCode();
    }
  }, [initialRefCode, onClearRefCode]);

  // Channel labels map
  const channelDisplayNames = {
    'college-club': 'College Club / Ambassador',
    'whatsapp': 'WhatsApp Community',
    'linkedin': 'LinkedIn / Organic',
    'other': 'Other Source'
  };

  // Ambassador map for quick lookup
  const ambassadorMap = useMemo(() => {
    const map = {};
    ambassadors.forEach((a) => {
      map[a.id] = a;
    });
    return map;
  }, [ambassadors]);

  // Filtering and sorting
  const filteredRegistrations = useMemo(() => {
    let result = [...registrations];

    // Search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      result = result.filter(
        (r) =>
          r.name?.toLowerCase().includes(q) ||
          r.email?.toLowerCase().includes(q) ||
          r.college?.toLowerCase().includes(q) ||
          r.referralCode?.toLowerCase().includes(q)
      );
    }

    // Filter by channel
    if (channelFilter !== 'all') {
      result = result.filter((r) => r.discoveryChannel === channelFilter);
    }

    // Filter by ambassador
    if (ambassadorFilter !== 'all') {
      if (ambassadorFilter === 'none') {
        result = result.filter((r) => !r.ambassadorId);
      } else {
        result = result.filter((r) => r.ambassadorId === ambassadorFilter);
      }
    }

    // Sort by registration date
    result.sort((a, b) => {
      const timeA = new Date(a.registeredAt).getTime() || 0;
      const timeB = new Date(b.registeredAt).getTime() || 0;
      return sortOrder === 'desc' ? timeB - timeA : timeA - timeB;
    });

    return result;
  }, [registrations, searchQuery, channelFilter, ambassadorFilter, sortOrder]);

  // Pagination calculation
  const totalPages = Math.max(1, Math.ceil(filteredRegistrations.length / PAGE_SIZE));
  const paginatedRegistrations = useMemo(() => {
    const start = (currentPage - 1) * PAGE_SIZE;
    return filteredRegistrations.slice(start, start + PAGE_SIZE);
  }, [filteredRegistrations, currentPage]);

  const handleOpenAddModal = () => {
    setFormData({
      name: '',
      email: '',
      college: '',
      discoveryChannel: 'college-club',
      referralCode: ''
    });
    setFormErrors({});
    setIsAddModalOpen(true);
  };

  const validateForm = () => {
    const errors = {};

    if (!formData.name.trim()) {
      errors.name = 'Student name is required.';
    }

    // Email validation & duplicate check
    const normalizedEmail = formData.email.trim().toLowerCase();
    if (!normalizedEmail) {
      errors.email = 'Email address is required.';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail)) {
      errors.email = 'Please enter a valid email format (e.g. student@college.edu).';
    } else {
      const isDuplicate = registrations.some(
        (r) => r.email && r.email.trim().toLowerCase() === normalizedEmail
      );
      if (isDuplicate) {
        errors.email = `A registration with "${normalizedEmail}" already exists. Each student can only register once.`;
      }
    }

    if (!formData.college.trim()) {
      errors.college = 'College name is required.';
    }

    if (!formData.discoveryChannel) {
      errors.discoveryChannel = 'Please select a discovery channel.';
    }

    // Referral code validation
    if (formData.referralCode.trim()) {
      const code = formData.referralCode.trim().toUpperCase();
      const matchedAmbassador = isValidReferralCode(code, ambassadors);
      if (!matchedAmbassador) {
        errors.referralCode = `Referral code "${code}" is invalid. No active or inactive ambassador has this code. Leave empty if none.`;
      }
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmitRegistration = (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    const normalizedEmail = formData.email.trim().toLowerCase();
    const code = formData.referralCode.trim().toUpperCase();
    const matchedAmbassador = code ? isValidReferralCode(code, ambassadors) : null;

    const newRecord = {
      name: formData.name.trim(),
      email: normalizedEmail,
      college: formData.college.trim(),
      discoveryChannel: formData.discoveryChannel,
      referralCode: matchedAmbassador ? code : '',
      ambassadorId: matchedAmbassador ? matchedAmbassador.id : ''
    };

    addRegistration(newRecord);

    const attributionMsg = matchedAmbassador
      ? ` Attributed to ambassador ${matchedAmbassador.name} (${code}).`
      : '';
    addToast(`Successfully registered "${newRecord.name}".${attributionMsg}`, 'success');

    setIsAddModalOpen(false);
  };

  const handleDeleteConfirm = () => {
    if (deleteTarget) {
      deleteRegistration(deleteTarget.id);
      addToast(`Deleted registration for "${deleteTarget.name}". Metrics updated.`, 'info');
      setDeleteTarget(null);
    }
  };

  const handleOpenImportModal = () => {
    setImportPreview(null);
    setImportError(null);
    setIsImportModalOpen(true);
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.name.endsWith('.csv') && file.type !== 'text/csv') {
      setImportError('Please select a valid .csv file.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const text = event.target?.result || '';
        const result = validateAndProcessImport(text, registrations, ambassadors);
        setImportPreview(result);
        setImportError(null);
      } catch (err) {
        setImportError(err.message || 'Failed to parse CSV file.');
        setImportPreview(null);
      }
    };
    reader.onerror = () => {
      setImportError('Error reading file from disk.');
    };
    reader.readAsText(file);
  };

  const handleExecuteImport = () => {
    if (!importPreview || !importPreview.valid || importPreview.valid.length === 0) {
      addToast('No valid new records to import.', 'error');
      return;
    }

    updateRegistrations((prev) => [...prev, ...importPreview.valid]);
    addToast(
      `Imported ${importPreview.valid.length} new registrations. (${importPreview.duplicates.length} duplicate emails skipped).`,
      'success'
    );
    setIsImportModalOpen(false);
  };

  return (
    <div className="registrations-page">
      {/* Page Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">Registration Management</h1>
          <p className="page-subtitle">
            Search, filter, attribute, and audit individual workshop registrations
          </p>
        </div>
        <div style={{ display: 'flex', gap: 'var(--space-3)' }}>
          <button className="btn btn-secondary" onClick={handleOpenImportModal}>
            <Upload size={16} />
            <span>Import CSV</span>
          </button>
          <button className="btn btn-primary" onClick={handleOpenAddModal}>
            <Plus size={16} />
            <span>Add Registration</span>
          </button>
        </div>
      </div>

      {/* Attribution Logic Explanatory Callout */}
      <div
        className="card"
        style={{
          backgroundColor: 'var(--color-info-light)',
          borderColor: '#bfdbfe',
          padding: 'var(--space-4) var(--space-5)',
          display: 'flex',
          alignItems: 'flex-start',
          gap: 'var(--space-3)'
        }}
      >
        <Info size={18} style={{ color: 'var(--color-info)', flexShrink: 0, marginTop: 2 }} />
        <div style={{ fontSize: 'var(--font-size-xs)', color: '#1e3a8a', lineHeight: 1.5 }}>
          <strong>Attribution Model Rule:</strong> Primary channel analytics count each registration exactly once based on the student&apos;s self-reported <em>Discovery Channel</em>. If a valid <em>Referral Code</em> is supplied, the registration is separately attributed to the corresponding ambassador for reward leaderboards and incentive tracking without double-counting channel totals.
        </div>
      </div>

      {/* Toolbar: Search & Filters */}
      <div
        className="registrations-toolbar"
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: 'var(--space-4)',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}
      >
        <div style={{ display: 'flex', gap: 'var(--space-3)', flexWrap: 'wrap', flex: 1 }}>
          <SearchBar
            value={searchQuery}
            onChange={(val) => {
              setSearchQuery(val);
              setCurrentPage(1);
            }}
            placeholder="Search by student, email, college, or code..."
          />

          {/* Channel Filter */}
          <select
            className="form-select"
            style={{ width: 'auto', minWidth: 160 }}
            value={channelFilter}
            onChange={(e) => {
              setChannelFilter(e.target.value);
              setCurrentPage(1);
            }}
          >
            <option value="all">All Channels</option>
            <option value="college-club">College Clubs</option>
            <option value="whatsapp">WhatsApp</option>
            <option value="linkedin">LinkedIn / Organic</option>
            <option value="other">Other Sources</option>
          </select>

          {/* Ambassador Filter */}
          <select
            className="form-select"
            style={{ width: 'auto', minWidth: 170 }}
            value={ambassadorFilter}
            onChange={(e) => {
              setAmbassadorFilter(e.target.value);
              setCurrentPage(1);
            }}
          >
            <option value="all">All Referral Sources</option>
            <option value="none">Direct / No Ambassador</option>
            {ambassadors.map((a) => (
              <option key={a.id} value={a.id}>
                {a.name} ({a.referralCode})
              </option>
            ))}
          </select>

          {/* Sort order toggle */}
          <button
            type="button"
            className="btn btn-secondary btn-sm"
            onClick={() => setSortOrder(sortOrder === 'desc' ? 'asc' : 'desc')}
            title="Toggle sort date"
          >
            Date: {sortOrder === 'desc' ? 'Newest First' : 'Oldest First'}
          </button>
        </div>

        <div style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-secondary)' }}>
          Showing <strong>{filteredRegistrations.length}</strong> of {registrations.length} registrations
        </div>
      </div>

      {/* Registrations Data Table */}
      {filteredRegistrations.length === 0 ? (
        <EmptyState
          icon={Users}
          title={searchQuery || channelFilter !== 'all' || ambassadorFilter !== 'all' ? 'No registrations match filters' : 'No registrations yet'}
          description={
            searchQuery || channelFilter !== 'all' || ambassadorFilter !== 'all'
              ? 'Try clearing the search query or changing your channel filter.'
              : 'Add your first registration to track workshop signups.'
          }
          actionLabel={searchQuery || channelFilter !== 'all' || ambassadorFilter !== 'all' ? 'Reset Filters' : 'Add Registration'}
          onAction={() => {
            if (searchQuery || channelFilter !== 'all' || ambassadorFilter !== 'all') {
              setSearchQuery('');
              setChannelFilter('all');
              setAmbassadorFilter('all');
              setCurrentPage(1);
            } else {
              handleOpenAddModal();
            }
          }}
        />
      ) : (
        <div className="data-table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>Student</th>
                <th>College</th>
                <th>Discovery Channel</th>
                <th>Attributed Ambassador</th>
                <th>Registered Date</th>
                <th>Status</th>
                <th style={{ textAlign: 'center', width: 60 }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {paginatedRegistrations.map((reg) => {
                const ambassador = reg.ambassadorId ? ambassadorMap[reg.ambassadorId] : null;
                const regDate = reg.registeredAt
                  ? new Date(reg.registeredAt).toLocaleDateString('en-IN', {
                      day: 'numeric',
                      month: 'short',
                      hour: '2-digit',
                      minute: '2-digit'
                    })
                  : 'N/A';

                return (
                  <tr key={reg.id}>
                    <td>
                      <div style={{ fontWeight: 'var(--font-weight-semibold)', color: 'var(--color-text)' }}>
                        {reg.name}
                      </div>
                      <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)', display: 'flex', alignItems: 'center', gap: 4 }}>
                        <Mail size={11} /> {reg.email}
                      </div>
                    </td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <School size={14} style={{ color: 'var(--color-text-muted)' }} />
                        <span>{reg.college}</span>
                      </div>
                    </td>
                    <td>
                      <span className="badge badge-channel">
                        {channelDisplayNames[reg.discoveryChannel] || reg.discoveryChannel}
                      </span>
                    </td>
                    <td>
                      {ambassador ? (
                        <div>
                          <div style={{ fontWeight: 'var(--font-weight-medium)', display: 'flex', alignItems: 'center', gap: 4 }}>
                            <Award size={13} style={{ color: 'var(--color-accent)' }} />
                            <span>{ambassador.name}</span>
                          </div>
                          <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)' }}>
                            <code>{reg.referralCode}</code>
                          </div>
                        </div>
                      ) : reg.referralCode ? (
                        <div>
                          <code>{reg.referralCode}</code>
                          <span style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)', display: 'block' }}>Unlinked code</span>
                        </div>
                      ) : (
                        <span style={{ color: 'var(--color-text-muted)', fontSize: 'var(--font-size-xs)' }}>
                          Direct / Organic
                        </span>
                      )}
                    </td>
                    <td style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-secondary)', whiteSpace: 'nowrap' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                        <Calendar size={12} />
                        <span>{regDate}</span>
                      </div>
                    </td>
                    <td>
                      <span className="badge badge-active" style={{ textTransform: 'capitalize' }}>
                        {reg.status || 'Confirmed'}
                      </span>
                    </td>
                    <td style={{ textAlign: 'center' }}>
                      <button
                        type="button"
                        className="btn-icon btn-ghost btn-sm"
                        onClick={() => setDeleteTarget(reg)}
                        title="Delete registration record"
                        style={{ color: 'var(--color-danger)' }}
                      >
                        <Trash2 size={15} />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Pagination Footer */}
      {filteredRegistrations.length > PAGE_SIZE && (
        <div className="pagination" style={{ marginTop: 'var(--space-4)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-secondary)' }}>
            Page {currentPage} of {totalPages}
          </div>
          <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
            <button
              className="btn btn-secondary btn-sm"
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
            >
              <ChevronLeft size={14} /> Previous
            </button>
            <button
              className="btn btn-secondary btn-sm"
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
            >
              Next <ChevronRight size={14} />
            </button>
          </div>
        </div>
      )}

      {/* Add Registration Modal */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Add Workshop Registration"
      >
        <form onSubmit={handleSubmitRegistration}>
          <div className="form-group">
            <label className="form-label">
              Student Full Name <span className="form-required">*</span>
            </label>
            <input
              type="text"
              className="form-input"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="e.g. Ananya Sharma"
              autoFocus
            />
            {formErrors.name && <div className="form-error">{formErrors.name}</div>}
          </div>

          <div className="form-group">
            <label className="form-label">
              Email Address <span className="form-required">*</span>
            </label>
            <input
              type="email"
              className="form-input"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              placeholder="e.g. ananya.sharma@demo.example"
            />
            <div className="form-hint">Must be unique; duplicate registrations are rejected.</div>
            {formErrors.email && <div className="form-error">{formErrors.email}</div>}
          </div>

          <div className="form-group">
            <label className="form-label">
              College / Campus <span className="form-required">*</span>
            </label>
            <input
              type="text"
              className="form-input"
              value={formData.college}
              onChange={(e) => setFormData({ ...formData, college: e.target.value })}
              placeholder="e.g. IIT Hyderabad"
            />
            {formErrors.college && <div className="form-error">{formErrors.college}</div>}
          </div>

          <div className="form-group">
            <label className="form-label">
              Discovery Channel <span className="form-required">*</span>
            </label>
            <select
              className="form-select"
              value={formData.discoveryChannel}
              onChange={(e) => setFormData({ ...formData, discoveryChannel: e.target.value })}
            >
              <option value="college-club">College club or student ambassador</option>
              <option value="whatsapp">WhatsApp communities</option>
              <option value="linkedin">LinkedIn and organic referrals</option>
              <option value="other">Other / Direct</option>
            </select>
            <div className="form-hint">Used for primary channel breakdown (no double-counting).</div>
            {formErrors.discoveryChannel && <div className="form-error">{formErrors.discoveryChannel}</div>}
          </div>

          <div className="form-group">
            <label className="form-label">
              Referral Code <span style={{ color: 'var(--color-text-muted)', fontSize: 'var(--font-size-xs)' }}>(Optional)</span>
            </label>
            <input
              type="text"
              className="form-input"
              style={{ fontFamily: 'var(--font-mono)', textTransform: 'uppercase' }}
              value={formData.referralCode}
              onChange={(e) => setFormData({ ...formData, referralCode: e.target.value.toUpperCase() })}
              placeholder="e.g. CAMPUS_RAHUL_42"
            />
            <div className="form-hint">
              If supplied, must match an existing ambassador code to attribute attribution credits.
            </div>
            {formErrors.referralCode && <div className="form-error">{formErrors.referralCode}</div>}
          </div>

          <div className="modal-footer" style={{ padding: 0, marginTop: 'var(--space-6)', borderTop: 'none' }}>
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => setIsAddModalOpen(false)}
            >
              Cancel
            </button>
            <button type="submit" className="btn btn-primary">
              Register Student
            </button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={Boolean(deleteTarget)}
        title="Delete Registration Record?"
        message={`Are you sure you want to remove the registration for "${deleteTarget?.name}" (${deleteTarget?.email})? All affected ambassador attribution numbers and dashboard KPI totals will immediately recalculate.`}
        confirmLabel="Delete Registration"
        cancelLabel="Keep Record"
        isDanger={true}
        onConfirm={handleDeleteConfirm}
        onCancel={() => setDeleteTarget(null)}
      />

      {/* CSV Import Modal */}
      <Modal
        isOpen={isImportModalOpen}
        onClose={() => setIsImportModalOpen(false)}
        title="Import Registrations from CSV"
        maxWidth={640}
      >
        <div>
          <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-secondary)', marginBottom: 'var(--space-4)' }}>
            Upload a CSV file containing columns for <strong>Name</strong>, <strong>Email</strong>, and <strong>College</strong>. Optional columns: <strong>Discovery Channel</strong>, <strong>Referral Code</strong>.
          </p>

          <div
            style={{
              border: '2px dashed var(--color-border)',
              borderRadius: 'var(--radius-lg)',
              padding: 'var(--space-6)',
              textAlign: 'center',
              backgroundColor: 'var(--color-bg)',
              marginBottom: 'var(--space-5)',
              cursor: 'pointer'
            }}
            onClick={() => fileInputRef.current?.click()}
          >
            <Upload size={32} style={{ color: 'var(--color-text-muted)', margin: '0 auto var(--space-2)' }} />
            <div style={{ fontSize: 'var(--font-size-sm)', fontWeight: 'var(--font-weight-medium)', color: 'var(--color-text)' }}>
              Click to select a CSV file from your computer
            </div>
            <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)', marginTop: 4 }}>
              Supports standard CSV format with UTF-8 encoding
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept=".csv,text/csv"
              style={{ display: 'none' }}
              onChange={handleFileChange}
            />
          </div>

          {importError && (
            <div
              style={{
                backgroundColor: 'var(--color-danger-light)',
                border: '1px solid #fca5a5',
                borderRadius: 'var(--radius-md)',
                padding: 'var(--space-3) var(--space-4)',
                color: 'var(--color-danger)',
                fontSize: 'var(--font-size-sm)',
                marginBottom: 'var(--space-4)',
                display: 'flex',
                alignItems: 'center',
                gap: 8
              }}
            >
              <AlertCircle size={16} style={{ flexShrink: 0 }} />
              <span>{importError}</span>
            </div>
          )}

          {importPreview && (
            <div>
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(3, 1fr)',
                  gap: 'var(--space-3)',
                  marginBottom: 'var(--space-4)'
                }}
              >
                <div style={{ padding: 'var(--space-3)', borderRadius: 'var(--radius-md)', backgroundColor: 'var(--color-accent-light)', textAlign: 'center' }}>
                  <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-accent-hover)', fontWeight: 'bold' }}>Valid to Import</div>
                  <div style={{ fontSize: 'var(--font-size-xl)', fontWeight: 'bold', color: 'var(--color-accent-hover)' }}>{importPreview.valid.length}</div>
                </div>
                <div style={{ padding: 'var(--space-3)', borderRadius: 'var(--radius-md)', backgroundColor: 'var(--color-warning-light)', textAlign: 'center' }}>
                  <div style={{ fontSize: 'var(--font-size-xs)', color: '#92400e', fontWeight: 'bold' }}>Duplicates (Skipped)</div>
                  <div style={{ fontSize: 'var(--font-size-xl)', fontWeight: 'bold', color: '#92400e' }}>{importPreview.duplicates.length}</div>
                </div>
                <div style={{ padding: 'var(--space-3)', borderRadius: 'var(--radius-md)', backgroundColor: 'var(--color-danger-light)', textAlign: 'center' }}>
                  <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-danger)', fontWeight: 'bold' }}>Invalid / Corrupt</div>
                  <div style={{ fontSize: 'var(--font-size-xl)', fontWeight: 'bold', color: 'var(--color-danger)' }}>{importPreview.invalid.length}</div>
                </div>
              </div>

              {/* Preview table of valid records */}
              {importPreview.valid.length > 0 && (
                <div style={{ maxHeight: 180, overflowY: 'auto', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-md)', marginBottom: 'var(--space-4)' }}>
                  <table className="data-table" style={{ fontSize: 'var(--font-size-xs)' }}>
                    <thead>
                      <tr>
                        <th>Student Name</th>
                        <th>Email</th>
                        <th>College</th>
                        <th>Channel</th>
                      </tr>
                    </thead>
                    <tbody>
                      {importPreview.valid.slice(0, 10).map((r, i) => (
                        <tr key={i}>
                          <td>{r.name}</td>
                          <td>{r.email}</td>
                          <td>{r.college}</td>
                          <td>{r.discoveryChannel}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {importPreview.valid.length > 10 && (
                    <div style={{ padding: '6px 12px', fontSize: '11px', color: 'var(--color-text-secondary)', textAlign: 'center', background: 'var(--color-bg)' }}>
                      ...and {importPreview.valid.length - 10} more rows
                    </div>
                  )}
                </div>
              )}

              {/* Duplicate details */}
              {importPreview.duplicates.length > 0 && (
                <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-warning)', marginBottom: 'var(--space-3)' }}>
                  ⚠️ {importPreview.duplicates.length} emails were identified as duplicates and will be skipped to prevent double-registration.
                </div>
              )}
            </div>
          )}

          <div className="modal-footer" style={{ padding: 0, marginTop: 'var(--space-6)', borderTop: 'none' }}>
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => setIsImportModalOpen(false)}
            >
              Cancel
            </button>
            <button
              type="button"
              className="btn btn-primary"
              disabled={!importPreview || importPreview.valid.length === 0}
              onClick={handleExecuteImport}
            >
              Import {importPreview?.valid?.length || 0} Records
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
