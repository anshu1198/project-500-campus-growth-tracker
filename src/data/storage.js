/**
 * Project 500 — Campus Growth Tracker
 * LocalStorage persistence layer with versioning and fail-safe error handling.
 */

const STORAGE_VERSION = 'v1';

const KEYS = {
  registrations: `project500_${STORAGE_VERSION}_registrations`,
  ambassadors: `project500_${STORAGE_VERSION}_ambassadors`,
  channels: `project500_${STORAGE_VERSION}_channels`,
  budget: `project500_${STORAGE_VERSION}_budget`,
  settings: `project500_${STORAGE_VERSION}_settings`,
  seeded: `project500_${STORAGE_VERSION}_seeded`
};

function safeGet(key, fallback) {
  try {
    if (typeof localStorage === 'undefined') return fallback;
    const raw = localStorage.getItem(key);
    if (raw === null) return fallback;
    const parsed = JSON.parse(raw);
    return parsed !== undefined ? parsed : fallback;
  } catch (err) {
    console.warn(`Failed to read "${key}" from localStorage:`, err);
    return fallback;
  }
}

function safeSet(key, value) {
  try {
    if (typeof localStorage === 'undefined') return;
    localStorage.setItem(key, JSON.stringify(value));
  } catch (e) {
    console.error(`Failed to save "${key}" to localStorage:`, e);
  }
}

export function loadRegistrations() {
  return safeGet(KEYS.registrations, []);
}

export function saveRegistrations(data) {
  safeSet(KEYS.registrations, data);
}

export function loadAmbassadors() {
  return safeGet(KEYS.ambassadors, []);
}

export function saveAmbassadors(data) {
  safeSet(KEYS.ambassadors, data);
}

export function loadChannels() {
  return safeGet(KEYS.channels, []);
}

export function saveChannels(data) {
  safeSet(KEYS.channels, data);
}

export function loadBudget() {
  return safeGet(KEYS.budget, []);
}

export function saveBudget(data) {
  safeSet(KEYS.budget, data);
}

export function loadSettings() {
  return safeGet(KEYS.settings, null);
}

export function saveSettings(data) {
  safeSet(KEYS.settings, data);
}

export function hasBeenSeeded() {
  return safeGet(KEYS.seeded, false);
}

export function markSeeded() {
  safeSet(KEYS.seeded, true);
}

export function clearAllData() {
  if (typeof localStorage === 'undefined') return;
  Object.values(KEYS).forEach(key => {
    try {
      localStorage.removeItem(key);
    } catch (e) {
      console.warn(`Failed to remove key "${key}":`, e);
    }
  });
}
