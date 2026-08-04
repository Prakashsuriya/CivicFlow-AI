import React, { useState } from 'react';
import Navbar from './components/Navbar';
import CitizenPortal from './pages/CitizenPortal';
import InteractiveMap from './components/InteractiveMap';
import AdminDashboard from './pages/AdminDashboard';
import AssetsPage from './pages/AssetsPage';
import CopilotPage from './pages/CopilotPage';
import AnalyticsPage from './pages/AnalyticsPage';
import KnowledgePage from './pages/KnowledgePage';
import TrackComplaint from './pages/TrackComplaint';
import PlatformStatusWidget from './components/PlatformStatusWidget';

export default function App() {
  const [activeTab, setActiveTab] = useState('citizen');
  const [operatingMode, setOperatingMode] = useState('auto_detect');
  const [selectedComplaintId, setSelectedComplaintId] = useState('CF-2026-9999');

  const handleNavigateToTrack = (complaintId) => {
    if (complaintId) {
      setSelectedComplaintId(complaintId);
    }
    setActiveTab('track');
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', backgroundColor: '#0b0f19' }}>
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        operatingMode={operatingMode}
        setOperatingMode={setOperatingMode}
      />
      
      <main style={{ flex: 1, paddingBottom: '3rem' }}>
        {activeTab === 'citizen' && <CitizenPortal operatingMode={operatingMode} onNavigateToTrack={handleNavigateToTrack} />}
        {activeTab === 'admin' && <AdminDashboard operatingMode={operatingMode} />}
        {activeTab === 'assets' && <AssetsPage />}
        {activeTab === 'copilot' && <CopilotPage />}
        {activeTab === 'map' && <div style={{ maxWidth: '1440px', margin: '0 auto', padding: '2rem 1rem' }}><InteractiveMap /></div>}
        {activeTab === 'analytics' && <AnalyticsPage />}
        {activeTab === 'knowledge' && <KnowledgePage />}
        {activeTab === 'track' && <TrackComplaint initialComplaintId={selectedComplaintId} />}
      </main>

      {/* Floating Multi-Agent Platform Status Widget */}
      <PlatformStatusWidget />

      <footer style={{
        textAlign: 'center',
        padding: '1.5rem',
        borderTop: '1px solid rgba(255, 255, 255, 0.08)',
        fontSize: '0.85rem',
        color: '#6b7280'
      }}>
        CivicFlow AI — Google AI Agent Builder Series 2026 Finale Submission. Autonomous Infrastructure AI Operating System.
      </footer>
    </div>
  );
}
