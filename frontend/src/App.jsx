import React, { useState } from 'react';
import Navbar from './components/Navbar';
import CitizenPortal from './pages/CitizenPortal';
import InteractiveMap from './components/InteractiveMap';
import AdminDashboard from './pages/AdminDashboard';
import AnalyticsPage from './pages/AnalyticsPage';
import KnowledgePage from './pages/KnowledgePage';
import TrackComplaint from './pages/TrackComplaint';

export default function App() {
  const [activeTab, setActiveTab] = useState('citizen');

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', backgroundColor: '#0b0f19' }}>
      <Navbar activeTab={activeTab} setActiveTab={setActiveTab} />
      
      <main style={{ flex: 1, paddingBottom: '3rem' }}>
        {activeTab === 'citizen' && <CitizenPortal onNavigateToTrack={() => setActiveTab('track')} />}
        {activeTab === 'map' && <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '2rem 1rem' }}><InteractiveMap /></div>}
        {activeTab === 'admin' && <AdminDashboard />}
        {activeTab === 'analytics' && <AnalyticsPage />}
        {activeTab === 'knowledge' && <KnowledgePage />}
        {activeTab === 'track' && <TrackComplaint />}
      </main>

      <footer style={{
        textAlign: 'center',
        padding: '1.5rem',
        borderTop: '1px solid rgba(255, 255, 255, 0.08)',
        fontSize: '0.85rem',
        color: '#6b7280'
      }}>
        CivicFlow AI — Google AI Agent Builder Series 2026 Submission. Built with Google ADK, FastAPI, ChromaDB RAG, and React.
      </footer>
    </div>
  );
}
