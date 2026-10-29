import React from 'react';
import {
  LayoutDashboard,
  Users,
  Award,
  Radio,
  Settings,
  Sparkles,
  X
} from 'lucide-react';

export default function Sidebar({ currentPage, onNavigate, mobileOpen, onCloseMobile }) {
  const navItems = [
    { id: 'overview', label: 'Overview', icon: LayoutDashboard },
    { id: 'registrations', label: 'Registrations', icon: Users },
    { id: 'ambassadors', label: 'Ambassadors', icon: Award },
    { id: 'channels', label: 'Campaign Channels', icon: Radio },
    { id: 'settings', label: 'Campaign Settings', icon: Settings },
  ];

  return (
    <>
      <div
        className={`sidebar-overlay ${mobileOpen ? 'active' : ''}`}
        onClick={onCloseMobile}
        aria-hidden="true"
      />
      <aside className={`sidebar ${mobileOpen ? 'open' : ''}`} aria-label="Sidebar navigation">
        <div className="sidebar-brand">
          <div className="sidebar-brand-header">
            <div className="kpi-icon accent" style={{ width: 34, height: 34 }}>
              <Sparkles size={18} />
            </div>
            <div>
              <div className="sidebar-brand-title">
                Project 500
              </div>
              <div className="sidebar-brand-subtitle">
                Campus Growth Tracker
              </div>
            </div>
            {mobileOpen && (
              <button
                className="btn-icon btn-ghost"
                onClick={onCloseMobile}
                style={{ marginLeft: 'auto', color: '#ffffff' }}
                aria-label="Close menu"
              >
                <X size={20} />
              </button>
            )}
          </div>
        </div>

        <nav aria-label="Main Navigation">
          <ul className="sidebar-nav">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentPage === item.id;
              return (
                <li key={item.id}>
                  <button
                    className={`sidebar-nav-item ${isActive ? 'active' : ''}`}
                    onClick={() => {
                      onNavigate(item.id);
                      if (onCloseMobile) onCloseMobile();
                    }}
                    style={{ width: '100%', border: 'none', background: isActive ? undefined : 'transparent' }}
                  >
                    <Icon className="nav-icon" />
                    <span>{item.label}</span>
                  </button>
                </li>
              );
            })}
          </ul>
        </nav>

        <div className="sidebar-footer">
          <span className="badge badge-simulation" style={{ width: 'fit-content' }}>
            Simulated Campaign
          </span>
          <div style={{ fontSize: 'var(--font-size-xs)', color: 'rgba(255, 255, 255, 0.55)', lineHeight: 1.4 }}>
            NxtWave Growth Simulation<br />Target: 500 in 7 Days
          </div>
        </div>
      </aside>
    </>
  );
}
