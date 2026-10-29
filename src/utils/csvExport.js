/**
 * Project 500 — Campus Growth Tracker
 * CSV export utilities for registrations, ambassadors, and channel summaries.
 */

export function escapeCSV(value) {
  if (value === null || value === undefined) return '';
  const str = String(value);
  if (str.includes(',') || str.includes('"') || str.includes('\n') || str.includes('\r')) {
    return '"' + str.replace(/"/g, '""') + '"';
  }
  return str;
}

function formatDate() {
  return new Date().toISOString().slice(0, 10);
}

export function downloadCSV(csvString, filename) {
  const bom = '\uFEFF';
  const blob = new Blob([bom + csvString], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export function exportRegistrationsCSV(registrations) {
  const headers = ['ID', 'Name', 'Email', 'College', 'Discovery Channel', 'Referral Code', 'Ambassador ID', 'Registration Date', 'Status'];
  const list = Array.isArray(registrations) ? registrations : [];
  const rows = list.map(r => [
    r.id || '',
    r.name || '',
    r.email || '',
    r.college || '',
    r.discoveryChannel || '',
    r.referralCode || '',
    r.ambassadorId || '',
    r.registeredAt || '',
    r.status || ''
  ].map(escapeCSV).join(','));

  const csv = [headers.join(','), ...rows].join('\n');
  downloadCSV(csv, `project500_registrations_${formatDate()}.csv`);
}

export function exportAmbassadorsCSV(ambassadors, registrations) {
  const headers = ['ID', 'Name', 'College', 'Email', 'Referral Code', 'Status', 'Registrations'];
  const ambList = Array.isArray(ambassadors) ? ambassadors : [];
  const regList = Array.isArray(registrations) ? registrations : [];

  const rows = ambList.map(a => {
    const count = regList.filter(r => r && r.ambassadorId === a.id).length;
    return [
      a.id || '',
      a.name || '',
      a.college || '',
      a.email || '',
      a.referralCode || '',
      a.status || '',
      count
    ].map(escapeCSV).join(',');
  });

  const csv = [headers.join(','), ...rows].join('\n');
  downloadCSV(csv, `project500_ambassadors_${formatDate()}.csv`);
}

export function exportChannelSummaryCSV(channels, registrations) {
  const headers = ['Channel', 'Target', 'Actual Registrations', 'Progress %'];
  const channelMap = {
    'college-club': 'College Club / Ambassador',
    'whatsapp': 'WhatsApp',
    'linkedin': 'LinkedIn / Organic',
    'other': 'Other'
  };
  const chList = Array.isArray(channels) ? channels : [];
  const regList = Array.isArray(registrations) ? registrations : [];

  const rows = chList.map(ch => {
    const count = regList.filter(r => r && r.discoveryChannel === ch.id).length;
    const pct = ch.target > 0 ? ((count / ch.target) * 100).toFixed(1) : '0.0';
    return [
      channelMap[ch.id] || ch.name || ch.id,
      ch.target ?? 0,
      count,
      pct + '%'
    ].map(escapeCSV).join(',');
  });

  const csv = [headers.join(','), ...rows].join('\n');
  downloadCSV(csv, `project500_channels_${formatDate()}.csv`);
}
