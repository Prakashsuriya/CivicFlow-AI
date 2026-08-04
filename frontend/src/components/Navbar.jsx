import React, { useState, useEffect } from 'react';
import { Bot, MapPin, ShieldAlert, BarChart3, BookOpen, Search, Sun, Moon, Cpu, Sparkles, Sliders } from 'lucide-react';

export default function Navbar({ activeTab, setActiveTab, operatingMode, setOperatingMode }) {
  const [theme, setTheme] = useState(() => localStorage.getItem('theme') || 'dark');
  const [wsStatus, setWsStatus] = useState('Connecting');

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
  }, [theme]);

  useEffect(() => {
    let ws;
    try {
      const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
      const wsUrl = import.meta.env.VITE_WS_URL || `${protocol}//${window.location.hostname}:8000/ws/feed`;
      ws = new WebSocket(wsUrl);

      ws.onopen = () => setWsStatus('Live WS Connected');
      ws.onerror = () => setWsStatus('WS Offline');
      ws.onclose = () => setWsStatus('WS Closed');
    } catch (e) {
      setWsStatus('WS Error');
    }
    return () => {
      if (ws) ws.close();
    };
  }, []);

  const toggleTheme = () => {
    setTheme(prev => prev === 'dark' ? 'light' : 'dark');
  };

  const navItems = [
    { id: 'citizen', label: 'Smart Incident Dispatcher', icon: Bot },
    { id: 'admin', label: 'Operations Center', icon: ShieldAlert },
    { id: 'assets', label: 'Digital Twin & Assets', icon: Cpu },
    { id: 'copilot', label: 'Operations Copilot', icon: Sparkles },
    { id: 'map', label: 'Ward Map', icon: MapPin },
    { id: 'knowledge', label: 'Knowledge (RAG)', icon: BookOpen },
    { id: 'track', label: 'Track ID', icon: Search },
  ];

  const operatingModes = [
    { id: 'auto_detect', label: '⚡ Smart AI', title: 'Autonomous AI Ownership Detection' },
    { id: 'public_infrastructure', label: '🏛️ Municipality', title: 'Public Infrastructure View' },
    { id: 'residential_community', label: '🏢 Residential Communities', title: 'Apartments & Gated Societies View' },
  ];

  return (
    <nav style={{
      background: theme === 'light' ? 'rgba(255, 255, 255, 0.95)' : 'rgba(11, 15, 25, 0.95)',
      backdropFilter: 'blur(16px)',
      borderBottom: theme === 'light' ? '1px solid rgba(0, 0, 0, 0.08)' : '1px solid rgba(255, 255, 255, 0.08)',
      position: 'sticky',
      top: 0,
      zIndex: 1000,
      padding: '0.6rem 1rem',
      transition: 'background 0.3s ease'
    }}>
      <div style={{
        maxWidth: '1440px',
        margin: '0 auto',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '0.75rem'
      }}>
        {/* Brand Logo & Tagline */}
        <div 
          onClick={() => setActiveTab('citizen')}
          style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', cursor: 'pointer' }}
        >
          <div style={{
            background: 'linear-gradient(135deg, #10b981 0%, #06b6d4 100%)',
            padding: '0.5rem',
            borderRadius: '10px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 0 15px rgba(16, 185, 129, 0.4)'
          }}>
            <Bot size={22} color="#ffffff" />
          </div>
          <div>
            <div style={{ fontFamily: 'Outfit', fontWeight: 800, fontSize: '1.2rem', letterSpacing: '-0.02em', lineHeight: 1.1, color: 'var(--text-primary)' }}>
              CivicFlow <span style={{ background: 'linear-gradient(135deg, #10b981, #06b6d4)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>AI</span>
            </div>
            <div style={{ fontSize: '0.62rem', color: '#10b981', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 700 }}>
              Autonomous Infrastructure Operations Platform
            </div>
          </div>
        </div>

        {/* Operating Mode Selector Pill Group */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.25rem',
          background: 'rgba(255, 255, 255, 0.05)',
          padding: '0.25rem',
          borderRadius: '10px',
          border: '1px solid rgba(255, 255, 255, 0.1)'
        }}>
          <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 600, padding: '0 0.4rem', display: 'flex', alignItems: 'center', gap: '0.2rem' }}>
            <Sliders size={12} />
            <span>Mode:</span>
          </div>
          {operatingModes.map(mode => {
            const isSelected = (operatingMode || 'auto_detect') === mode.id;
            return (
              <button
                key={mode.id}
                onClick={() => setOperatingMode && setOperatingMode(mode.id)}
                title={mode.title}
                style={{
                  background: isSelected ? 'linear-gradient(135deg, #10b981, #059669)' : 'transparent',
                  color: isSelected ? '#ffffff' : 'var(--text-secondary)',
                  border: 'none',
                  padding: '0.3rem 0.6rem',
                  borderRadius: '6px',
                  fontFamily: 'Outfit',
                  fontWeight: isSelected ? 700 : 500,
                  fontSize: '0.75rem',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  boxShadow: isSelected ? '0 0 10px rgba(16, 185, 129, 0.4)' : 'none'
                }}
              >
                {mode.label}
              </button>
            );
          })}
        </div>

        {/* Desktop Navigation Tabs */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.35rem',
          overflowX: 'auto',
          maxWidth: '100%'
        }}>
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                style={{
                  background: isActive ? 'rgba(16, 185, 129, 0.15)' : 'transparent',
                  color: isActive ? '#10b981' : 'var(--text-secondary)',
                  border: isActive ? '1px solid rgba(16, 185, 129, 0.3)' : '1px solid transparent',
                  padding: '0.4rem 0.75rem',
                  borderRadius: '8px',
                  fontFamily: 'Outfit',
                  fontWeight: 600,
                  fontSize: '0.82rem',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.35rem',
                  whiteSpace: 'nowrap',
                  transition: 'all 0.2s ease'
                }}
              >
                <Icon size={14} />
                {item.label}
              </button>
            );
          })}
        </div>

        {/* Right Section: Theme Toggle & Live System Badge */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <button
            onClick={toggleTheme}
            title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} Mode`}
            style={{
              background: theme === 'light' ? '#e2e8f0' : 'rgba(255, 255, 255, 0.08)',
              border: '1px solid var(--border-color)',
              color: 'var(--text-primary)',
              padding: '0.35rem 0.55rem',
              borderRadius: '8px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.35rem',
              fontSize: '0.75rem',
              fontWeight: 600
            }}
          >
            {theme === 'dark' ? <Sun size={14} color="#f59e0b" /> : <Moon size={14} color="#8b5cf6" />}
          </button>

          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.35rem',
            background: 'rgba(16, 185, 129, 0.1)',
            border: '1px solid rgba(16, 185, 129, 0.2)',
            padding: '0.3rem 0.65rem',
            borderRadius: '9999px',
            fontSize: '0.72rem',
            color: '#10b981',
            fontWeight: 600
          }}>
            <span style={{
              width: '6px',
              height: '6px',
              borderRadius: '50%',
              backgroundColor: '#10b981',
              boxShadow: '0 0 6px #10b981'
            }}></span>
            <span>{wsStatus}</span>
          </div>
        </div>
      </div>
    </nav>
  );
}
