import React, { useState } from 'react';
import {
  Settings as SettingsIcon,
  IndianRupee,
  Save,
  RotateCcw,
  Plus,
  Trash2,
  Edit2,
  HelpCircle,
  AlertCircle
} from 'lucide-react';
import { useCampaign } from '../context/CampaignContext';
import { calcBudgetSummary, calcCostPerRegistration } from '../utils/metrics';
import Modal from '../components/Modal';

export default function Settings() {
  const {
    settings,
    budget,
    registrations,
    updateSettings,
    updateBudget,
    addToast
  } = useCampaign();

  // Settings form state
  const [formData, setFormData] = useState({
    campaignName: settings?.campaignName || 'Build Your First AI Project in 60 Minutes',
    registrationTarget: settings?.registrationTarget || 500,
    campaignDuration: settings?.campaignDuration || 7,
    startDate: settings?.startDate ? settings.startDate.slice(0, 10) : new Date().toISOString().slice(0, 10),
    plannedBudget: settings?.plannedBudget || 2000,
    baseUrl: settings?.baseUrl || 'https://workshop.nxtwave.in/register'
  });
  const [formErrors, setFormErrors] = useState({});

  // Budget calculations
  const { totalPlanned, totalSpent, remaining } = calcBudgetSummary(budget);
  const costPerReg = calcCostPerRegistration(totalSpent, registrations.length);

  // Edit Budget Entry Modal
  const [editingBudgetEntry, setEditingBudgetEntry] = useState(null);
  const [budgetModalOpen, setBudgetModalOpen] = useState(false);
  const [budgetFormData, setBudgetFormData] = useState({
    category: '',
    plannedAmount: 0,
    actualSpent: 0,
    notes: ''
  });

  const handleSettingsSubmit = (e) => {
    e.preventDefault();
    const errors = {};

    if (!formData.campaignName.trim()) {
      errors.campaignName = 'Campaign name is required.';
    }

    const target = parseInt(formData.registrationTarget, 10);
    if (isNaN(target) || target <= 0) {
      errors.registrationTarget = 'Registration target must be a positive number.';
    }

    const duration = parseInt(formData.campaignDuration, 10);
    if (isNaN(duration) || duration <= 0) {
      errors.campaignDuration = 'Campaign duration must be at least 1 day.';
    }

    const plannedBudget = parseFloat(formData.plannedBudget);
    if (isNaN(plannedBudget) || plannedBudget < 0) {
      errors.plannedBudget = 'Planned budget must be non-negative.';
    }

    if (!formData.baseUrl.trim()) {
      errors.baseUrl = 'Campaign base URL is required for referral link generation.';
    }

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    updateSettings({
      ...settings,
      campaignName: formData.campaignName.trim(),
      registrationTarget: target,
      campaignDuration: duration,
      startDate: new Date(formData.startDate).toISOString(),
      plannedBudget: plannedBudget,
      baseUrl: formData.baseUrl.trim()
    });

    setFormErrors({});
    addToast('Campaign settings updated successfully.', 'success');
  };

  const handleOpenEditBudget = (entry) => {
    setEditingBudgetEntry(entry);
    setBudgetFormData({
      category: entry.category || '',
      plannedAmount: entry.plannedAmount || 0,
      actualSpent: entry.actualSpent || 0,
      notes: entry.notes || ''
    });
    setBudgetModalOpen(true);
  };

  const handleSaveBudgetEntry = (e) => {
    e.preventDefault();
    if (!budgetFormData.category.trim()) {
      addToast('Category name is required.', 'error');
      return;
    }

    const planned = Math.max(0, parseFloat(budgetFormData.plannedAmount) || 0);
    const spent = Math.max(0, parseFloat(budgetFormData.actualSpent) || 0);

    const updated = budget.map((b) =>
      b.id === editingBudgetEntry.id
        ? {
            ...b,
            category: budgetFormData.category.trim(),
            plannedAmount: planned,
            actualSpent: spent,
            notes: budgetFormData.notes.trim()
          }
        : b
    );

    updateBudget(updated);
    addToast(`Updated budget category "${budgetFormData.category}".`, 'success');
    setBudgetModalOpen(false);
  };

  return (
    <div className="settings-page">
      {/* Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">Campaign Settings & Budget</h1>
          <p className="page-subtitle">
            Configure campaign benchmarks, URL parameters, and track financial allocations
          </p>
        </div>
      </div>

      {/* Grid: Settings form + Budget */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 'var(--space-6)' }}>
        {/* Campaign Configuration Form */}
        <div className="card">
          <div className="card-header">
            <div>
              <h2 className="card-title">Campaign Configuration Parameters</h2>
              <p className="card-subtitle">
                Operational parameters governing the 7-day campus sprint
              </p>
            </div>
          </div>

          <form onSubmit={handleSettingsSubmit}>
            <div className="form-group">
              <label className="form-label">
                Campaign / Workshop Name <span className="form-required">*</span>
              </label>
              <input
                type="text"
                className="form-input"
                value={formData.campaignName}
                onChange={(e) => setFormData({ ...formData, campaignName: e.target.value })}
              />
              {formErrors.campaignName && <div className="form-error">{formErrors.campaignName}</div>}
            </div>

            <div className="form-row">
              <div className="form-group">
                <label className="form-label">
                  Registration Goal Target <span className="form-required">*</span>
                </label>
                <input
                  type="number"
                  min="1"
                  className="form-input"
                  value={formData.registrationTarget}
                  onChange={(e) => setFormData({ ...formData, registrationTarget: e.target.value })}
                />
                <div className="form-hint">Standard goal: 500 engineering students.</div>
                {formErrors.registrationTarget && <div className="form-error">{formErrors.registrationTarget}</div>}
              </div>

              <div className="form-group">
                <label className="form-label">
                  Duration (Days) <span className="form-required">*</span>
                </label>
                <input
                  type="number"
                  min="1"
                  max="30"
                  className="form-input"
                  value={formData.campaignDuration}
                  onChange={(e) => setFormData({ ...formData, campaignDuration: e.target.value })}
                />
                <div className="form-hint">Standard duration: 7 days.</div>
                {formErrors.campaignDuration && <div className="form-error">{formErrors.campaignDuration}</div>}
              </div>

              <div className="form-group">
                <label className="form-label">Campaign Start Date</label>
                <input
                  type="date"
                  className="form-input"
                  value={formData.startDate}
                  onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label className="form-label">
                  Planned Campaign Budget (₹) <span className="form-required">*</span>
                </label>
                <input
                  type="number"
                  min="0"
                  className="form-input"
                  value={formData.plannedBudget}
                  onChange={(e) => setFormData({ ...formData, plannedBudget: e.target.value })}
                />
                <div className="form-hint">Total available budget ceiling: ₹2,000.</div>
                {formErrors.plannedBudget && <div className="form-error">{formErrors.plannedBudget}</div>}
              </div>

              <div className="form-group">
                <label className="form-label">
                  Base Registration URL <span className="form-required">*</span>
                </label>
                <input
                  type="url"
                  className="form-input"
                  value={formData.baseUrl}
                  onChange={(e) => setFormData({ ...formData, baseUrl: e.target.value })}
                  placeholder="https://workshop.nxtwave.in/register"
                />
                <div className="form-hint">Used to construct ambassador referral links (?ref=CODE).</div>
                {formErrors.baseUrl && <div className="form-error">{formErrors.baseUrl}</div>}
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 'var(--space-4)' }}>
              <button type="submit" className="btn btn-primary">
                <Save size={16} />
                <span>Save Campaign Settings</span>
              </button>
            </div>
          </form>
        </div>

        {/* Budget Tracking Section */}
        <div className="card">
          <div className="card-header">
            <div>
              <h2 className="card-title">Budget Allocation & Actual Expenditure</h2>
              <p className="card-subtitle">
                Total Budget: ₹{settings?.plannedBudget?.toLocaleString('en-IN') || '2,000'} | Planned vs Actual Spend Tracking
              </p>
            </div>
          </div>

          {/* Budget KPI Row */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
              gap: 'var(--space-4)',
              marginBottom: 'var(--space-6)'
            }}
          >
            <div style={{ padding: 'var(--space-4)', borderRadius: 'var(--radius-md)', backgroundColor: 'var(--color-bg)', border: '1px solid var(--color-border)' }}>
              <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-secondary)', textTransform: 'uppercase' }}>
                Total Planned Allocation
              </div>
              <div style={{ fontSize: 'var(--font-size-xl)', fontWeight: 'bold', color: 'var(--color-text)' }}>
                ₹{totalPlanned.toLocaleString('en-IN')}
              </div>
            </div>

            <div style={{ padding: 'var(--space-4)', borderRadius: 'var(--radius-md)', backgroundColor: 'var(--color-bg)', border: '1px solid var(--color-border)' }}>
              <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-secondary)', textTransform: 'uppercase' }}>
                Actual Money Spent
              </div>
              <div style={{ fontSize: 'var(--font-size-xl)', fontWeight: 'bold', color: 'var(--color-accent-hover)' }}>
                ₹{totalSpent.toLocaleString('en-IN')}
              </div>
            </div>

            <div style={{ padding: 'var(--space-4)', borderRadius: 'var(--radius-md)', backgroundColor: 'var(--color-bg)', border: '1px solid var(--color-border)' }}>
              <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-secondary)', textTransform: 'uppercase' }}>
                Remaining Unspent
              </div>
              <div style={{ fontSize: 'var(--font-size-xl)', fontWeight: 'bold', color: remaining >= 0 ? 'var(--color-text)' : 'var(--color-danger)' }}>
                ₹{remaining.toLocaleString('en-IN')}
              </div>
            </div>

            <div style={{ padding: 'var(--space-4)', borderRadius: 'var(--radius-md)', backgroundColor: 'var(--color-bg)', border: '1px solid var(--color-border)' }}>
              <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-secondary)', textTransform: 'uppercase' }}>
                Cost Per Unique Registration
              </div>
              <div style={{ fontSize: 'var(--font-size-xl)', fontWeight: 'bold', color: 'var(--color-primary)' }}>
                {costPerReg !== null ? `₹${costPerReg.toFixed(2)}` : 'Not available yet'}
              </div>
              <div style={{ fontSize: '10px', color: 'var(--color-text-muted)' }}>
                {registrations.length > 0 ? `${registrations.length} registrations` : 'Zero registrations'}
              </div>
            </div>
          </div>

          {/* Budget Table */}
          <div className="data-table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Expense Category</th>
                  <th style={{ textAlign: 'right' }}>Planned Allocation</th>
                  <th style={{ textAlign: 'right' }}>Actual Spent</th>
                  <th style={{ textAlign: 'right' }}>Remaining</th>
                  <th>Notes</th>
                  <th style={{ textAlign: 'center', width: 70 }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {budget.map((entry) => {
                  const planned = entry.plannedAmount || 0;
                  const spent = entry.actualSpent || 0;
                  const diff = planned - spent;

                  return (
                    <tr key={entry.id}>
                      <td style={{ fontWeight: 'var(--font-weight-medium)', color: 'var(--color-text)' }}>
                        {entry.category}
                      </td>
                      <td style={{ textAlign: 'right' }}>
                        ₹{planned.toLocaleString('en-IN')}
                      </td>
                      <td style={{ textAlign: 'right', fontWeight: 'bold' }}>
                        ₹{spent.toLocaleString('en-IN')}
                      </td>
                      <td style={{ textAlign: 'right', color: diff >= 0 ? 'var(--color-accent-hover)' : 'var(--color-danger)' }}>
                        ₹{diff.toLocaleString('en-IN')}
                      </td>
                      <td style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-secondary)' }}>
                        {entry.notes}
                      </td>
                      <td style={{ textAlign: 'center' }}>
                        <button
                          type="button"
                          className="btn-icon btn-ghost btn-sm"
                          onClick={() => handleOpenEditBudget(entry)}
                          title="Record actual spend or edit category"
                        >
                          <Edit2 size={15} />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
              <tfoot>
                <tr style={{ backgroundColor: 'var(--color-bg)', fontWeight: 'bold' }}>
                  <td style={{ padding: '12px 16px' }}>Total Campaign Budget</td>
                  <td style={{ textAlign: 'right', padding: '12px 16px' }}>
                    ₹{totalPlanned.toLocaleString('en-IN')}
                  </td>
                  <td style={{ textAlign: 'right', padding: '12px 16px', color: 'var(--color-accent-hover)' }}>
                    ₹{totalSpent.toLocaleString('en-IN')}
                  </td>
                  <td style={{ textAlign: 'right', padding: '12px 16px' }}>
                    ₹{remaining.toLocaleString('en-IN')}
                  </td>
                  <td colSpan={2} style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-secondary)' }}>
                    Contingency reserve is preserved unless explicitly spent
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>
      </div>

      {/* Edit Budget Entry Modal */}
      {editingBudgetEntry && (
        <Modal
          isOpen={budgetModalOpen}
          onClose={() => setBudgetModalOpen(false)}
          title={`Edit Budget Category: ${editingBudgetEntry.category}`}
        >
          <form onSubmit={handleSaveBudgetEntry}>
            <div className="form-group">
              <label className="form-label">Category Name</label>
              <input
                type="text"
                className="form-input"
                value={budgetFormData.category}
                onChange={(e) => setBudgetFormData({ ...budgetFormData, category: e.target.value })}
              />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Planned Allocation (₹)</label>
                <input
                  type="number"
                  min="0"
                  className="form-input"
                  value={budgetFormData.plannedAmount}
                  onChange={(e) => setBudgetFormData({ ...budgetFormData, plannedAmount: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Actual Expenditure (₹)</label>
                <input
                  type="number"
                  min="0"
                  className="form-input"
                  value={budgetFormData.actualSpent}
                  onChange={(e) => setBudgetFormData({ ...budgetFormData, actualSpent: e.target.value })}
                />
                <div className="form-hint">Enter only genuine expenses incurred.</div>
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Notes / Description</label>
              <textarea
                className="form-textarea"
                rows={3}
                value={budgetFormData.notes}
                onChange={(e) => setBudgetFormData({ ...budgetFormData, notes: e.target.value })}
              />
            </div>

            <div className="modal-footer" style={{ padding: 0, borderTop: 'none' }}>
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => setBudgetModalOpen(false)}
              >
                Cancel
              </button>
              <button type="submit" className="btn btn-primary">
                Save Budget Entry
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}
