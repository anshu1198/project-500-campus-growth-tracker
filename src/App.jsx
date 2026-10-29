import { useState, useEffect } from 'react';
import { CampaignProvider } from './context/CampaignContext';
import Shell from './components/Layout/Shell';
import Overview from './pages/Overview';
import Registrations from './pages/Registrations';
import Ambassadors from './pages/Ambassadors';
import Channels from './pages/Channels';
import Settings from './pages/Settings';

const PAGES = {
  overview: Overview,
  registrations: Registrations,
  ambassadors: Ambassadors,
  channels: Channels,
  settings: Settings,
};

export default function App() {
  const [currentPage, setCurrentPage] = useState('overview');

  // Read ?ref= from URL on mount (for referral prefill)
  const [initialRefCode, setInitialRefCode] = useState(null);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const ref = params.get('ref');
    if (ref) {
      setInitialRefCode(ref.trim());
      setCurrentPage('registrations');
    }
  }, []);

  const PageComponent = PAGES[currentPage] || Overview;

  return (
    <CampaignProvider>
      <Shell currentPage={currentPage} onNavigate={setCurrentPage}>
        <PageComponent
          initialRefCode={currentPage === 'registrations' ? initialRefCode : undefined}
          onClearRefCode={() => setInitialRefCode(null)}
        />
      </Shell>
    </CampaignProvider>
  );
}
