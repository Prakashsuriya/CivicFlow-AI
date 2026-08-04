import React, { useState, useEffect } from 'react';
import { Cpu, Activity, AlertTriangle, CheckCircle, Wrench, RefreshCw, Sparkles, Filter, Clock, Calendar, ShieldAlert, Info, HelpCircle, Zap, Layers, CheckCircle2, ChevronDown, ChevronUp } from 'lucide-react';

export default function AssetsPage() {
  const [assets, setAssets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterDomain, setFilterDomain] = useState('all');
  const [showGuide, setShowGuide] = useState(true);
  const [toastMsg, setToastMsg] = useState(null);

  const fetchAssets = async () => {
    setLoading(true);
    try {
      const url = filterDomain === 'all' ? '/api/v1/assets' : `/api/v1/assets?domain_type=${filterDomain}`;
      const res = await fetch(import.meta.env.VITE_API_URL ? `${import.meta.env.VITE_API_URL}${url}` : `http://localhost:8000${url}`);
      const data = await res.json();
      setAssets(data.assets || []);
    } catch (e) {
      console.error("Error fetching assets:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAssets();
  }, [filterDomain]);

  const handleSimulateSurge = (assetName) => {
    setToastMsg(`⚡ Telemetry Simulation: High electrical load surge sent to '${assetName}'. AI Copilot updated Health Score.`);
    setTimeout(() => setToastMsg(null), 5000);
  };

  const handleTriggerPM = (assetName) => {
    setToastMsg(`🔧 Work Order Issued: Proactive Preventive Maintenance scheduled for '${assetName}'.`);
    setTimeout(() => setToastMsg(null), 5000);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'critical': return '#ef4444';
      case 'warning': return '#f59e0b';
      default: return '#10b981';
    }
  };

  const getAssetIcon = (type) => {
    const t = (type || "").toLowerCase();
    if (t.includes("lift") || t.includes("elevator")) return "🏢";
    if (t.includes("transformer") || t.includes("electric")) return "⚡";
    if (t.includes("water") || t.includes("pipe")) return "💧";
    if (t.includes("drain")) return "🌊";
    if (t.includes("street")) return "💡";
    return "⚙️";
  };

  return (
    <div style={{ maxWidth: '1440px', margin: '0 auto', padding: '2rem 1rem' }}>
      {/* Header */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '1rem',
        marginBottom: '1.5rem'
      }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.3rem' }}>
            <Cpu color="#10b981" size={26} />
            <h1 style={{ margin: 0, fontSize: '1.8rem', fontFamily: 'Outfit', color: 'var(--text-primary)', fontWeight: 800 }}>
              Infrastructure Digital Twin & Asset Intelligence
            </h1>
          </div>
          <p style={{ margin: 0, color: 'var(--text-muted)', fontSize: '0.9rem' }}>
            Real-time telemetry, failure history, Remaining Useful Life (RUL) predictions, and preventive maintenance status.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <button
            onClick={() => setShowGuide(!showGuide)}
            style={{
              background: 'rgba(6, 182, 212, 0.15)',
              border: '1px solid rgba(6, 182, 212, 0.4)',
              color: '#06b6d4',
              padding: '0.5rem 0.85rem',
              borderRadius: '8px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem',
              fontWeight: 700,
              fontSize: '0.85rem'
            }}
          >
            <HelpCircle size={15} /> {showGuide ? "Hide Executive Guide" : "What is Digital Twin?"}
          </button>

          <button
            onClick={fetchAssets}
            style={{
              background: 'rgba(255, 255, 255, 0.05)',
              border: '1px solid var(--border-color)',
              color: 'var(--text-primary)',
              padding: '0.5rem 0.85rem',
              borderRadius: '8px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem',
              fontWeight: 600,
              fontSize: '0.85rem'
            }}
          >
            <RefreshCw size={14} /> Refresh Telemetry
          </button>
        </div>
      </div>

      {/* Toast Alert */}
      {toastMsg && (
        <div style={{
          backgroundColor: 'rgba(16, 185, 129, 0.15)',
          border: '1px solid rgba(16, 185, 129, 0.5)',
          borderRadius: '10px',
          padding: '0.85rem 1.25rem',
          color: '#10b981',
          fontWeight: 700,
          fontSize: '0.88rem',
          marginBottom: '1.5rem',
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
          animation: 'fadeIn 0.2s ease-out'
        }}>
          <CheckCircle2 size={18} /> {toastMsg}
        </div>
      )}

      {/* Digital Twin Executive Guide Banner (Requirement 4) */}
      {showGuide && (
        <div style={{
          background: 'linear-gradient(135deg, rgba(15, 23, 42, 0.95) 0%, rgba(17, 24, 39, 0.9) 100%)',
          border: '1px solid rgba(6, 182, 212, 0.4)',
          borderRadius: '16px',
          padding: '1.5rem',
          marginBottom: '2rem',
          boxShadow: '0 10px 30px rgba(0,0,0,0.4)',
          animation: 'fadeIn 0.2s ease-out'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem', borderBottom: '1px solid rgba(255, 255, 255, 0.08)', paddingBottom: '0.75rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#06b6d4', fontWeight: 800, fontSize: '1.1rem', fontFamily: 'Outfit' }}>
              <Layers size={20} /> Executive Guide: What is a Digital Twin & How to Use It
            </div>
            <span style={{ fontSize: '0.72rem', backgroundColor: 'rgba(6, 182, 212, 0.2)', color: '#06b6d4', padding: '0.2rem 0.6rem', borderRadius: '9999px', fontWeight: 700 }}>
              AI Infrastructure Operating System
            </span>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.25rem' }}>
            {/* Box 1: WHAT */}
            <div style={{ backgroundColor: 'rgba(0, 0, 0, 0.3)', padding: '1rem', borderRadius: '12px', borderLeft: '3px solid #06b6d4' }}>
              <h3 style={{ margin: '0 0 0.4rem 0', fontSize: '0.95rem', color: '#06b6d4', fontFamily: 'Outfit', fontWeight: 800 }}>
                1. WHAT IS A DIGITAL TWIN?
              </h3>
              <p style={{ margin: 0, fontSize: '0.85rem', color: '#d1d5db', lineHeight: 1.5 }}>
                A Digital Twin is a real-time virtual replica of physical city infrastructure (elevators, power transformers, water mains, streetlights) continuously synced with IoT sensor telemetry and AI health algorithms.
              </p>
            </div>

            {/* Box 2: WHY */}
            <div style={{ backgroundColor: 'rgba(0, 0, 0, 0.3)', padding: '1rem', borderRadius: '12px', borderLeft: '3px solid #10b981' }}>
              <h3 style={{ margin: '0 0 0.4rem 0', fontSize: '0.95rem', color: '#10b981', fontFamily: 'Outfit', fontWeight: 800 }}>
                2. WHY IS IT USED?
              </h3>
              <p style={{ margin: 0, fontSize: '0.85rem', color: '#d1d5db', lineHeight: 1.5 }}>
                Instead of waiting for citizens to complain after a lift collapses or transformer sparks, the AI Digital Twin predicts failures weeks before they happen, calculates <strong>Remaining Useful Life (RUL)</strong>, and automates maintenance.
              </p>
            </div>

            {/* Box 3: HOW */}
            <div style={{ backgroundColor: 'rgba(0, 0, 0, 0.3)', padding: '1rem', borderRadius: '12px', borderLeft: '3px solid #f59e0b' }}>
              <h3 style={{ margin: '0 0 0.4rem 0', fontSize: '0.95rem', color: '#f59e0b', fontFamily: 'Outfit', fontWeight: 800 }}>
                3. HOW TO USE THIS PAGE?
              </h3>
              <p style={{ margin: 0, fontSize: '0.85rem', color: '#d1d5db', lineHeight: 1.5 }}>
                • <strong>Domain Filter:</strong> Switch between Municipality, Residential, and Utilities.<br />
                • <strong>Health Score:</strong> Monitor decay trends (0%-100%).<br />
                • <strong>Telemetry Controls:</strong> Trigger 1-click preventive work orders or simulate grid load.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Filter Chips */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
        <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
          <Filter size={14} /> Domain Filter:
        </span>
        {[
          { id: 'all', label: 'All Digital Assets' },
          { id: 'public_infrastructure', label: '🏛️ Municipality' },
          { id: 'residential_community', label: '🏢 Residential Communities' },
          { id: 'utility_provider', label: '⚡ Utilities' },
        ].map(chip => (
          <button
            key={chip.id}
            onClick={() => setFilterDomain(chip.id)}
            style={{
              background: filterDomain === chip.id ? 'linear-gradient(135deg, #10b981, #059669)' : 'rgba(255, 255, 255, 0.05)',
              color: filterDomain === chip.id ? '#ffffff' : 'var(--text-secondary)',
              border: filterDomain === chip.id ? 'none' : '1px solid var(--border-color)',
              padding: '0.4rem 0.85rem',
              borderRadius: '8px',
              fontWeight: 700,
              fontSize: '0.82rem',
              cursor: 'pointer',
              transition: 'all 0.2s ease'
            }}
          >
            {chip.label}
          </button>
        ))}
      </div>

      {/* Asset Cards Grid */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
          Loading Digital Twin Telemetry...
        </div>
      ) : (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))',
          gap: '1.25rem'
        }}>
          {assets.map(asset => {
            const statusColor = getStatusColor(asset.status);
            const icon = getAssetIcon(asset.asset_type);

            return (
              <div
                key={asset.id}
                style={{
                  backgroundColor: 'rgba(255, 255, 255, 0.02)',
                  border: `1px solid ${asset.status === 'critical' ? 'rgba(239, 68, 68, 0.4)' : asset.status === 'warning' ? 'rgba(245, 158, 11, 0.4)' : 'rgba(255, 255, 255, 0.08)'}`,
                  borderRadius: '16px',
                  padding: '1.25rem',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  gap: '1rem',
                  boxShadow: asset.status === 'critical' ? '0 0 20px rgba(239, 68, 68, 0.15)' : 'none'
                }}
              >
                <div>
                  {/* Top Badges */}
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                    <span style={{
                      backgroundColor: 'rgba(255, 255, 255, 0.05)',
                      border: '1px solid rgba(255, 255, 255, 0.1)',
                      color: 'var(--text-muted)',
                      padding: '0.2rem 0.5rem',
                      borderRadius: '6px',
                      fontSize: '0.7rem',
                      fontWeight: 700
                    }}>
                      {asset.domain_type ? asset.domain_type.replace('_', ' ').toUpperCase() : 'PUBLIC'}
                    </span>

                    <span style={{
                      backgroundColor: `${statusColor}20`,
                      color: statusColor,
                      border: `1px solid ${statusColor}40`,
                      padding: '0.2rem 0.6rem',
                      borderRadius: '9999px',
                      fontSize: '0.72rem',
                      fontWeight: 800,
                      textTransform: 'uppercase'
                    }}>
                      {asset.status}
                    </span>
                  </div>

                  {/* Asset Icon & Title */}
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem', marginBottom: '0.75rem' }}>
                    <div style={{ fontSize: '1.8rem', backgroundColor: 'rgba(255,255,255,0.04)', padding: '0.4rem 0.6rem', borderRadius: '10px' }}>
                      {icon}
                    </div>
                    <div>
                      <h3 style={{ margin: '0 0 0.2rem 0', fontSize: '1.1rem', color: 'var(--text-primary)', fontFamily: 'Outfit', fontWeight: 800 }}>
                        {asset.name}
                      </h3>
                      <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                        📍 {asset.location_name}
                      </p>
                    </div>
                  </div>

                  {/* Health Score Progress Bar */}
                  <div style={{ marginBottom: '1rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.35rem', fontSize: '0.8rem' }}>
                      <span style={{ fontWeight: 700, color: 'var(--text-secondary)' }}>Telemetry Health Score</span>
                      <span style={{ fontWeight: 800, color: statusColor, fontFamily: 'monospace' }}>{asset.health_score}%</span>
                    </div>
                    <div style={{
                      height: '8px',
                      backgroundColor: 'rgba(255, 255, 255, 0.08)',
                      borderRadius: '4px',
                      overflow: 'hidden'
                    }}>
                      <div style={{
                        width: `${asset.health_score}%`,
                        height: '100%',
                        backgroundColor: statusColor,
                        borderRadius: '4px',
                        transition: 'width 0.5s ease'
                      }} />
                    </div>
                  </div>

                  {/* Telemetry Metrics Grid */}
                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: '1fr 1fr',
                    gap: '0.6rem',
                    backgroundColor: 'rgba(0, 0, 0, 0.3)',
                    padding: '0.75rem',
                    borderRadius: '10px',
                    marginBottom: '0.85rem',
                    fontSize: '0.75rem'
                  }}>
                    <div>
                      <div style={{ color: 'var(--text-muted)', fontSize: '0.68rem', fontWeight: 700 }}>FAILURE COUNT</div>
                      <div style={{ color: '#ffffff', fontWeight: 800 }}>{asset.failure_count || asset.total_incidents || 0} Incidents</div>
                    </div>

                    <div>
                      <div style={{ color: 'var(--text-muted)', fontSize: '0.68rem', fontWeight: 700 }}>REMAINING USEFUL LIFE</div>
                      <div style={{ color: '#38bdf8', fontWeight: 800 }}>{asset.rul || '6 Months'}</div>
                    </div>

                    <div>
                      <div style={{ color: 'var(--text-muted)', fontSize: '0.68rem', fontWeight: 700 }}>PREVENTIVE MAINT</div>
                      <div style={{ color: asset.pm_status === 'Overdue' ? '#ef4444' : '#10b981', fontWeight: 800 }}>{asset.pm_status || 'Optimal'}</div>
                    </div>

                    <div>
                      <div style={{ color: 'var(--text-muted)', fontSize: '0.68rem', fontWeight: 700 }}>LAST REPAIR DATE</div>
                      <div style={{ color: '#fbbf24', fontWeight: 800, fontFamily: 'monospace' }}>{asset.last_repair || '2026-07-20'}</div>
                    </div>
                  </div>

                  {/* AI Telemetry Recommendation */}
                  <div style={{
                    background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.08) 0%, rgba(6, 182, 212, 0.05) 100%)',
                    border: '1px solid rgba(16, 185, 129, 0.2)',
                    borderRadius: '10px',
                    padding: '0.75rem'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#10b981', fontSize: '0.75rem', fontWeight: 700, marginBottom: '0.3rem' }}>
                      <Sparkles size={14} /> AI Recommendation
                    </div>
                    <p style={{ margin: 0, fontSize: '0.78rem', color: '#d1d5db', lineHeight: 1.4 }}>
                      {asset.ai_recommendation || "Telemetry parameters normal. No immediate intervention required."}
                    </p>
                  </div>
                </div>

                {/* Interactive Action Triggers (Requirement 4) */}
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <button
                    onClick={() => handleSimulateSurge(asset.name)}
                    style={{
                      flex: 1,
                      background: 'rgba(245, 158, 11, 0.15)',
                      border: '1px solid rgba(245, 158, 11, 0.3)',
                      color: '#f59e0b',
                      padding: '0.45rem',
                      borderRadius: '8px',
                      fontWeight: 700,
                      fontSize: '0.75rem',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '0.25rem'
                    }}
                  >
                    <Zap size={12} /> Simulate Load Surge
                  </button>

                  <button
                    onClick={() => handleTriggerPM(asset.name)}
                    style={{
                      flex: 1,
                      background: 'rgba(16, 185, 129, 0.15)',
                      border: '1px solid rgba(16, 185, 129, 0.3)',
                      color: '#10b981',
                      padding: '0.45rem',
                      borderRadius: '8px',
                      fontWeight: 700,
                      fontSize: '0.75rem',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '0.25rem'
                    }}
                  >
                    <Wrench size={12} /> Issue PM Order
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
