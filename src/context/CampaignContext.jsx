/**
 * Project 500 — Campus Growth Tracker
 * Global CampaignContext providing single source of truth for campaign analytics,
 * ambassadors, registrations, channels, budget, and system settings.
 */

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import * as storage from '../data/storage';
import {
  getSeedRegistrations,
  getSeedAmbassadors,
  getSeedChannels,
  getSeedBudget,
  getDefaultSettings
} from '../data/seedData';
import { generateId } from '../utils/idGenerator';

const CampaignContext = createContext(null);

export function CampaignProvider({ children }) {
  const [registrations, setRegistrations] = useState([]);
  const [ambassadors, setAmbassadors] = useState([]);
  const [channels, setChannels] = useState([]);
  const [budget, setBudget] = useState([]);
  const [settings, setSettings] = useState(getDefaultSettings());
  const [toasts, setToasts] = useState([]);

  // Initialize: load from localStorage or populate initial seed datasets
  useEffect(() => {
    const storedSettings = storage.loadSettings();
    if (storedSettings) {
      setSettings(storedSettings);
    }

    const storedRegs = storage.loadRegistrations();
    const storedAmbs = storage.loadAmbassadors();
    const storedChannels = storage.loadChannels();
    const storedBudget = storage.loadBudget();

    if (storedRegs.length > 0 || storedAmbs.length > 0 || storage.hasBeenSeeded()) {
      setRegistrations(storedRegs);
      setAmbassadors(storedAmbs);
      setChannels(storedChannels.length > 0 ? storedChannels : getSeedChannels());
      setBudget(storedBudget.length > 0 ? storedBudget : getSeedBudget());
    } else {
      // First time initialization: seed realistic data
      const seedRegs = getSeedRegistrations();
      const seedAmbs = getSeedAmbassadors();
      const seedChannels = getSeedChannels();
      const seedBudget = getSeedBudget();
      const defaultSettings = getDefaultSettings();

      setRegistrations(seedRegs);
      setAmbassadors(seedAmbs);
      setChannels(seedChannels);
      setBudget(seedBudget);
      setSettings(defaultSettings);

      storage.saveRegistrations(seedRegs);
      storage.saveAmbassadors(seedAmbs);
      storage.saveChannels(seedChannels);
      storage.saveBudget(seedBudget);
      storage.saveSettings(defaultSettings);
      storage.markSeeded();
    }
  }, []);

  // Persist changes to registrations
  const updateRegistrations = useCallback((updater) => {
    setRegistrations(prev => {
      const next = typeof updater === 'function' ? updater(prev) : updater;
      storage.saveRegistrations(next);
      return next;
    });
  }, []);

  // Persist changes to ambassadors
  const updateAmbassadors = useCallback((updater) => {
    setAmbassadors(prev => {
      const next = typeof updater === 'function' ? updater(prev) : updater;
      storage.saveAmbassadors(next);
      return next;
    });
  }, []);

  // Persist changes to channels
  const updateChannels = useCallback((updater) => {
    setChannels(prev => {
      const next = typeof updater === 'function' ? updater(prev) : updater;
      storage.saveChannels(next);
      return next;
    });
  }, []);

  // Persist changes to budget entries
  const updateBudget = useCallback((updater) => {
    setBudget(prev => {
      const next = typeof updater === 'function' ? updater(prev) : updater;
      storage.saveBudget(next);
      return next;
    });
  }, []);

  // Persist changes to campaign settings
  const updateSettings = useCallback((newSettings) => {
    setSettings(newSettings);
    storage.saveSettings(newSettings);
  }, []);

  // CRUD: Add a registration
  const addRegistration = useCallback((reg) => {
    const newReg = {
      registeredAt: new Date().toISOString(),
      status: 'confirmed',
      ...reg,
      id: reg?.id || generateId()
    };
    updateRegistrations(prev => [...prev, newReg]);
    return newReg;
  }, [updateRegistrations]);

  // CRUD: Delete a registration
  const deleteRegistration = useCallback((id) => {
    updateRegistrations(prev => prev.filter(r => r && r.id !== id));
  }, [updateRegistrations]);

  // CRUD: Add an ambassador
  const addAmbassador = useCallback((amb) => {
    const newAmb = {
      status: 'active',
      ...amb,
      id: amb?.id || generateId()
    };
    updateAmbassadors(prev => [...prev, newAmb]);
    return newAmb;
  }, [updateAmbassadors]);

  // CRUD: Update an ambassador
  const updateAmbassador = useCallback((id, updates) => {
    updateAmbassadors(prev => prev.map(a => (a && a.id === id ? { ...a, ...updates } : a)));
  }, [updateAmbassadors]);

  // CRUD: Toggle ambassador status between active and inactive
  const toggleAmbassadorStatus = useCallback((id) => {
    updateAmbassadors(prev => prev.map(a => {
      if (!a || a.id !== id) return a;
      return { ...a, status: a.status === 'active' ? 'inactive' : 'active' };
    }));
  }, [updateAmbassadors]);

  // Toast notifications management
  const addToast = useCallback((message, type = 'success') => {
    const id = generateId();
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 4000);
  }, []);

  // Reset all application data back to default simulated state
  const resetData = useCallback(() => {
    storage.clearAllData();
    const seedRegs = getSeedRegistrations();
    const seedAmbs = getSeedAmbassadors();
    const seedChannels = getSeedChannels();
    const seedBudget = getSeedBudget();
    const defaultSettings = getDefaultSettings();

    setRegistrations(seedRegs);
    setAmbassadors(seedAmbs);
    setChannels(seedChannels);
    setBudget(seedBudget);
    setSettings(defaultSettings);

    storage.saveRegistrations(seedRegs);
    storage.saveAmbassadors(seedAmbs);
    storage.saveChannels(seedChannels);
    storage.saveBudget(seedBudget);
    storage.saveSettings(defaultSettings);
    storage.markSeeded();

    addToast('Demo data has been reset to defaults.', 'success');
  }, [addToast]);

  const value = {
    registrations,
    ambassadors,
    channels,
    budget,
    settings,
    toasts,
    addRegistration,
    deleteRegistration,
    updateRegistrations,
    addAmbassador,
    updateAmbassador,
    toggleAmbassadorStatus,
    updateAmbassadors,
    updateChannels,
    updateBudget,
    updateSettings,
    addToast,
    resetData
  };

  return (
    <CampaignContext.Provider value={value}>
      {children}
    </CampaignContext.Provider>
  );
}

export function useCampaign() {
  const context = useContext(CampaignContext);
  if (!context) {
    throw new Error('useCampaign must be used within a CampaignProvider');
  }
  return context;
}
