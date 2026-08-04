import React, { useState } from 'react';
import { Bot, ChevronUp, ChevronDown, CheckCircle2, Cpu, ShieldCheck } from 'lucide-react';

export default function PlatformStatusWidget() {
  const [isExpanded, setIsExpanded] = useState(false);

  const agents = [
    { name: "Vision Agent", role: "Gemini 2.5 Multimodal Visual Inspector", latency: "120ms", status: "online" },
    { name: "Location Agent", role: "Spatial Geocoding & Ward Mapper", latency: "45ms", status: "online" },
    { name: "Civic Context", role: "Infrastructure Ownership Evaluator", latency: "85ms", status: "online" },
    { name: "Knowledge Agent", role: "Grounded RAG Policy Search (ChromaDB)", latency: "60ms", status: "online" },
    { name: "Routing Agent", role: "Department Sub-Routing & SLA Target", latency: "30ms", status: "online" },
    { name: "Digital Twin", role: "Asset Telemetry & Health Tracker", latency: "50ms", status: "online" },
    { name: "Notification Agent", role: "Dynamic Authority Dispatcher", latency: "90ms", status: "online" },
    { name: "Analytics Agent", role: "Ward Density & Heatmap Engine", latency: "70ms", status: "online" },
    { name: "Operations Copilot", role: "Executive Assistant & Action Planner", latency: "110ms", status: "online" }
  ];

  return (
    <div style={{
      position: 'fixed',
      bottom: '1.25rem',
      right: '1.25rem',
      zIndex: 1500,
      fontFamily: 'Outfit, sans-serif'
    }}>
      {/* Expanded Modal Box */}
      {isExpanded && (
        <div style={{
          backgroundColor: '#0d111a',
          border: '1px solid rgba(16, 185, 129, 0.4)',
          borderRadius: '16px',
          padding: '1.25rem',
          width: '340px',
          boxShadow: '0 20px 40px rgba(0, 0, 0, 0.7)',
          marginBottom: '0.75rem',
          backdropFilter: 'blur(16px)',
          animation: 'fadeInUp 0.25s ease-out'
        }}>
          {/* Widget Header */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem', borderBottom: '1px solid rgba(255, 255, 255, 0.08)', paddingBottom: '0.75rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <div style={{ background: 'linear-gradient(135deg, #10b981, #06b6d4)', padding: '0.4rem', borderRadius: '8px', color: '#fff' }}>
                <Cpu size={18} />
              </div>
              <div>
                <h4 style={{ margin: 0, fontSize: '0.95rem', color: '#ffffff', fontWeight: 800 }}>
                  Multi-Agent Platform Status
                </h4>
                <div style={{ fontSize: '0.7rem', color: '#10b981', fontWeight: 700 }}>
                  9/9 Autonomous Agents Online
                </div>
              </div>
            </div>

            <button
              onClick={() => setIsExpanded(false)}
              style={{
                background: 'rgba(255, 255, 255, 0.05)',
                border: 'none',
                color: 'var(--text-muted)',
                borderRadius: '6px',
                padding: '0.2rem',
                cursor: 'pointer'
              }}
            >
              <ChevronDown size={18} />
            </button>
          </div>

          {/* Agent Status List */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.55rem', maxHeight: '320px', overflowY: 'auto' }}>
            {agents.map((ag, idx) => (
              <div key={idx} style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                backgroundColor: 'rgba(255, 255, 255, 0.03)',
                border: '1px solid rgba(255, 255, 255, 0.06)',
                padding: '0.45rem 0.65rem',
                borderRadius: '8px'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <span style={{
                    width: '8px',
                    height: '8px',
                    borderRadius: '50%',
                    backgroundColor: '#10b981',
                    boxShadow: '0 0 8px #10b981'
                  }} />
                  <div>
                    <div style={{ fontSize: '0.8rem', fontWeight: 700, color: '#ffffff' }}>
                      {ag.name}
                    </div>
                    <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>
                      {ag.role}
                    </div>
                  </div>
                </div>

                <div style={{ textAlign: 'right' }}>
                  <span style={{ fontSize: '0.65rem', color: '#10b981', fontFamily: 'monospace', fontWeight: 700 }}>
                    🟢 {ag.latency}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Floating Pill Button */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        style={{
          background: 'linear-gradient(135deg, #0d111a 0%, #161f30 100%)',
          border: '1px solid rgba(16, 185, 129, 0.4)',
          color: '#ffffff',
          padding: '0.55rem 0.95rem',
          borderRadius: '9999px',
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
          cursor: 'pointer',
          boxShadow: '0 8px 25px rgba(0, 0, 0, 0.6), 0 0 15px rgba(16, 185, 129, 0.2)',
          transition: 'all 0.2s ease',
          fontSize: '0.8rem',
          fontWeight: 700
        }}
      >
        <span style={{
          width: '8px',
          height: '8px',
          borderRadius: '50%',
          backgroundColor: '#10b981',
          boxShadow: '0 0 10px #10b981'
        }} />
        <span>Platform Status: 9/9 Agents 🟢</span>
        {isExpanded ? <ChevronDown size={14} color="#10b981" /> : <ChevronUp size={14} color="#10b981" />}
      </button>
    </div>
  );
}
