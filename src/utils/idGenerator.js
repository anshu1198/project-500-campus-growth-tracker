/**
 * Project 500 — Campus Growth Tracker
 * Unique ID generator with standard crypto fallback.
 */

export function generateId() {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  return `${Date.now()}-${Math.random().toString(36).substring(2, 11)}`;
}
