/**
 * Project 500 — Campus Growth Tracker
 * Referral code utilities for campus ambassador attribution.
 */

export function generateReferralCode(name) {
  const cleanName = (typeof name === 'string' ? name : '').trim();
  const firstWord = cleanName.split(/\s+/)[0] || 'AMB';
  const prefix = firstWord.toUpperCase().replace(/[^A-Z]/g, '').slice(0, 8) || 'AMB';
  const suffix = String(Math.floor(Math.random() * 90) + 10);
  return `CAMPUS_${prefix}_${suffix}`;
}

export function isValidReferralCode(code, ambassadors) {
  if (!code || typeof code !== 'string') return null;
  const list = Array.isArray(ambassadors) ? ambassadors : [];
  const normalized = code.trim();
  return list.find(a => a && a.referralCode === normalized) || null;
}

export function isCodeUnique(code, ambassadors, excludeId = null) {
  if (!code || typeof code !== 'string') return false;
  const list = Array.isArray(ambassadors) ? ambassadors : [];
  const normalized = code.trim();
  return !list.some(a => a && a.referralCode === normalized && a.id !== excludeId);
}

export function generateShareableUrl(baseUrl, code) {
  const safeCode = code ? encodeURIComponent(String(code).trim()) : '';
  if (!baseUrl) return `?ref=${safeCode}`;
  const trimmed = baseUrl.trim();
  const separator = trimmed.includes('?') ? '&' : '?';
  return `${trimmed}${separator}ref=${safeCode}`;
}
