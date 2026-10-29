import React, { useState } from 'react';
import Sidebar from './Sidebar';
import Header from './Header';
import Toast from '../Toast';
import { useCampaign } from '../../context/CampaignContext';

export default function Shell({ currentPage, onNavigate, children }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const { toasts } = useCampaign();

  return (
    <div className="app-layout">
      <Sidebar
        currentPage={currentPage}
        onNavigate={onNavigate}
        mobileOpen={mobileOpen}
        onCloseMobile={() => setMobileOpen(false)}
      />

      <div className="main-area">
        <Header onOpenMobile={() => setMobileOpen(true)} />
        <main className="content">
          <div className="content-inner">
            {children}
          </div>
        </main>
      </div>

      <Toast toasts={toasts} />
    </div>
  );
}
