import React, { useState, useEffect } from 'react';
import { getComplaintDetailAPI } from '../services/api';
import { Search, MapPin, ShieldAlert, CheckCircle2, History, Sparkles, ShieldCheck, Clock, UserCheck, AlertCircle } from 'lucide-react';
import AIDecisionTrace from '../components/AIDecisionTrace';
import ExplainabilityPanel from '../components/ExplainabilityPanel';

export default function TrackComplaint({ initialComplaintId = "CF-2026-9999" }) {
  const [complaintId, setComplaintId] = useState(initialComplaintId);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const [traceOpen, setTraceOpen] = useState(false);
  const [explainOpen, setExplainOpen] = useState(false);

  const quickDemoIds = ["CF-2026-9999", "CF-2026-2001", "CF-2026-2002", "CF-2026-2003"];

  const fetchDetail = async (idToFetch) => {
    const cleanId = idToFetch.replace(/^[#\s]+/, '').trim();
    if (!cleanId) return;

    setLoading(true);
    setError(null);

    try {
      const res = await getComplaintDetailAPI(encodeURIComponent(cleanId));
      if (!res || !res.id) {
        setError(`Complaint ID '${cleanId}' not found. Try searching for flagship demo incident CF-2026-9999.`);
      } else {
        setData(res);
      }
    } catch (err) {
      setError(`Complaint ID '${cleanId}' not found. Try searching for flagship demo incident CF-2026-9999.`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (initialComplaintId) {
      fetchDetail(initialComplaintId);
    }
  }, [initialComplaintId]);

  useEffect(() => {
    let ws;
    try {
      const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
      const wsUrl = import.meta.env.VITE_WS_URL || `${protocol}//${window.location.hostname}:8000/ws/feed`;
      ws = new WebSocket(wsUrl);

      ws.onmessage = (event) => {
        try {
          const msg = JSON.parse(event.data);
          if (msg.event === 'STATUS_UPDATE' && data && msg.complaint_id === data.id) {
            getComplaintDetailAPI(data.id).then(res => setData(res)).catch(() => {});
          }
        } catch (e) {}
      };
    } catch (e) {}

    return () => {
      if (ws) ws.close();
    };
  }, [data?.id]);

  const handleSearch = (e) => {
    if (e) e.preventDefault();
    fetchDetail(complaintId);
  };

  const getAuthorityColor = (authority, domain) => {
    if ((domain || "").includes("utility") || (authority || "").includes("TANGEDCO")) return "#f59e0b";
    if ((domain || "").includes("residential") || (authority || "").includes("Greenwood")) return "#8b5cf6";
    return "#3b82f6";
  };

  return (
    <div style={{ maxWidth: '960px', margin: '0 auto', padding: '2rem 1rem' }}>
      {/* Title */}
      <div style={{ textAlign: 'center', marginBottom: '1.75rem' }}>
        <div style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '0.4rem',
          backgroundColor: 'rgba(16, 185, 129, 0.15)',
          color: '#10b981',
          padding: '0.35rem 0.85rem',
          borderRadius: '9999px',
          fontSize: '0.78rem',
          fontWeight: 700,
          marginBottom: '0.75rem'
        }}>
          <Sparkles size={14} /> Persisted Infrastructure Audit Ledger
        </div>
        <h1 style={{ fontSize: '2.2rem', fontWeight: 800, margin: '0 0 0.5rem 0', fontFamily: 'Outfit' }}>
          Track Incident Status & Decision Audit
        </h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', margin: 0 }}>
          Inspect complete multi-agent reasoning, assigned authorities, SLAs, and lifecycle progression.
        </p>
      </div>

      {/* Search Bar & Quick Demo Selectors */}
      <div className="glass-card" style={{ padding: '1.25rem', marginBottom: '1.5rem' }}>
        <form onSubmit={handleSearch} style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', marginBottom: '1rem' }}>
          <div style={{ position: 'relative', flex: 1, minWidth: '240px' }}>
            <Search size={18} color="var(--text-muted)" style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)' }} />
            <input
              type="text"
              value={complaintId}
              onChange={(e) => setComplaintId(e.target.value)}
              placeholder="Enter Incident ID (e.g. CF-2026-9999 or #CF-2026-2001)"
              style={{
                width: '100%',
                padding: '0.75rem 1rem 0.75rem 2.8rem',
                fontFamily: 'monospace',
                fontSize: '0.95rem',
                boxSizing: 'border-box'
              }}
            />
          </div>

          <button type="submit" disabled={loading} className="btn-primary">
            {loading ? "Searching Ledger..." : "Lookup Incident Status"}
          </button>
        </form>

        {/* 1-Click Quick Demo Selectors */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600 }}>
            ⚡ 1-Click Demo Incident IDs:
          </span>
          {quickDemoIds.map(id => (
            <button
              key={id}
              onClick={() => { setComplaintId(id); fetchDetail(id); }}
              style={{
                background: complaintId === id ? 'linear-gradient(135deg, #10b981, #059669)' : 'rgba(255, 255, 255, 0.05)',
                color: complaintId === id ? '#ffffff' : 'var(--text-secondary)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                padding: '0.25rem 0.6rem',
                borderRadius: '6px',
                fontSize: '0.75rem',
                fontFamily: 'monospace',
                fontWeight: 700,
                cursor: 'pointer'
              }}
            >
              #{id}
            </button>
          ))}
        </div>
      </div>

      {/* Error */}
      {error && (
        <div style={{ padding: '1rem', background: 'rgba(244, 63, 94, 0.1)', border: '1px solid rgba(244, 63, 94, 0.3)', borderRadius: '10px', color: '#f87171', textAlign: 'center', marginBottom: '1.5rem' }}>
          ⚠️ {error}
        </div>
      )}

      {/* Result Card */}
      {data && data.id && (
        <div className="glass-card" style={{ padding: '1.75rem', marginBottom: '2rem' }}>
          {/* Header Bar */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.5rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '1.25rem' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
                <span style={{ fontSize: '0.75rem', color: '#10b981', fontFamily: 'monospace', fontWeight: 800 }}>
                  INCIDENT TICKET #{data.id}
                </span>
                <span style={{
                  backgroundColor: `${getAuthorityColor(data.responsible_authority, data.domain_type)}20`,
                  color: getAuthorityColor(data.responsible_authority, data.domain_type),
                  border: `1px solid ${getAuthorityColor(data.responsible_authority, data.domain_type)}40`,
                  padding: '0.15rem 0.5rem',
                  borderRadius: '9999px',
                  fontSize: '0.7rem',
                  fontWeight: 700
                }}>
                  {data.domain_type ? data.domain_type.replace('_', ' ').toUpperCase() : 'PUBLIC INFRASTRUCTURE'}
                </span>
              </div>

              <h2 style={{ fontSize: '1.45rem', fontWeight: 800, margin: '0 0 0.3rem 0', color: 'var(--text-primary)', fontFamily: 'Outfit' }}>
                {data.title}
              </h2>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', margin: 0, lineHeight: 1.5 }}>
                {data.description}
              </p>
            </div>

            <div style={{ textAlign: 'right' }}>
              <span className={`badge badge-${data.status || 'submitted'}`} style={{ fontSize: '0.85rem', padding: '0.4rem 0.95rem', textTransform: 'capitalize' }}>
                {(data.status || 'submitted').replace('_', ' ')}
              </span>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '0.4rem', fontFamily: 'monospace' }}>
                SLA Target: {data.estimated_sla_hours} Hours
              </div>
            </div>
          </div>

          {/* Current Stage Indicator Stepper */}
          <div style={{
            backgroundColor: 'rgba(0, 0, 0, 0.3)',
            border: '1px solid rgba(16, 185, 129, 0.3)',
            borderRadius: '12px',
            padding: '1rem 1.25rem',
            marginBottom: '1.5rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '0.75rem'
          }}>
            <div>
              <div style={{ fontSize: '0.7rem', color: '#10b981', fontWeight: 700, textTransform: 'uppercase' }}>
                Current Operational Lifecycle Stage
              </div>
              <div style={{ fontSize: '1rem', fontWeight: 800, color: '#ffffff', fontFamily: 'Outfit', marginTop: '0.2rem' }}>
                {data.current_stage || "Stage 3: Auto-Routed to Operational Department"}
              </div>
            </div>

            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <button
                onClick={() => setExplainOpen(true)}
                style={{
                  background: 'rgba(6, 182, 212, 0.15)',
                  border: '1px solid rgba(6, 182, 212, 0.4)',
                  color: '#06b6d4',
                  padding: '0.4rem 0.75rem',
                  borderRadius: '6px',
                  fontSize: '0.75rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.3rem'
                }}
              >
                <ShieldCheck size={14} /> Explainability
              </button>

              <button
                onClick={() => setTraceOpen(true)}
                style={{
                  background: 'rgba(16, 185, 129, 0.2)',
                  border: '1px solid rgba(16, 185, 129, 0.5)',
                  color: '#10b981',
                  padding: '0.4rem 0.75rem',
                  borderRadius: '6px',
                  fontSize: '0.75rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.3rem'
                }}
              >
                <Sparkles size={14} /> Decision Trace
              </button>
            </div>
          </div>

          {/* Key Meta Grid */}
          <div className="responsive-grid-4" style={{ marginBottom: '1.5rem', gap: '1rem' }}>
            <div style={{ background: 'rgba(255, 255, 255, 0.03)', border: '1px solid var(--border-color)', padding: '0.85rem', borderRadius: '10px' }}>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase' }}>Responsible Authority</div>
              <div style={{ fontWeight: 800, color: '#ffffff', fontSize: '0.9rem', marginTop: '0.2rem' }}>
                {data.responsible_authority}
              </div>
            </div>

            <div style={{ background: 'rgba(255, 255, 255, 0.03)', border: '1px solid var(--border-color)', padding: '0.85rem', borderRadius: '10px' }}>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase' }}>Assigned Department</div>
              <div style={{ fontWeight: 800, color: '#10b981', fontSize: '0.9rem', marginTop: '0.2rem' }}>
                {data.department || "Unassigned"}
              </div>
            </div>

            <div style={{ background: 'rgba(255, 255, 255, 0.03)', border: '1px solid var(--border-color)', padding: '0.85rem', borderRadius: '10px' }}>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase' }}>Field Officer / Worker</div>
              <div style={{ fontWeight: 800, color: '#38bdf8', fontSize: '0.9rem', marginTop: '0.2rem' }}>
                {data.assigned_worker || "Senior Field Officer"}
              </div>
            </div>

            <div style={{ background: 'rgba(255, 255, 255, 0.03)', border: '1px solid var(--border-color)', padding: '0.85rem', borderRadius: '10px' }}>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase' }}>Ward / Jurisdiction</div>
              <div style={{ fontWeight: 800, color: '#fbbf24', fontSize: '0.9rem', marginTop: '0.2rem' }}>
                {data.ward || "Vellore Zone"}
              </div>
            </div>
          </div>

          {/* AI Ownership Reasoning Box */}
          <div style={{
            backgroundColor: 'rgba(0, 0, 0, 0.25)',
            borderLeft: '3px solid #10b981',
            padding: '1rem',
            borderRadius: '8px',
            marginBottom: '1.75rem'
          }}>
            <div style={{ fontSize: '0.72rem', color: '#10b981', fontWeight: 700, textTransform: 'uppercase', marginBottom: '0.3rem' }}>
              AI Ownership Decision Rationale
            </div>
            <p style={{ margin: 0, fontSize: '0.88rem', color: '#d1d5db', lineHeight: 1.5 }}>
              {data.ownership_reasoning}
            </p>
          </div>

          {/* Audit Timeline */}
          <h3 style={{ fontSize: '1.05rem', fontWeight: 800, marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-primary)', fontFamily: 'Outfit' }}>
            <History size={18} color="#10b981" /> Immutable Incident Audit Trail
          </h3>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {(data.status_history || []).map((log, idx) => (
              <div key={idx} style={{
                background: 'rgba(255, 255, 255, 0.02)',
                border: '1px solid var(--border-color)',
                padding: '0.85rem 1.1rem',
                borderRadius: '10px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: '0.5rem'
              }}>
                <div>
                  <span style={{ fontSize: '0.78rem', color: '#10b981', fontWeight: 800 }}>
                    🤖 {log.updated_by}
                  </span>
                  <div style={{ fontSize: '0.85rem', color: '#d1d5db', margin: '0.2rem 0', lineHeight: 1.4 }}>
                    {log.reasoning_notes}
                  </div>
                </div>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontFamily: 'monospace' }}>
                  {new Date(log.timestamp).toLocaleString()}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Decision Trace Drawer Modal */}
      <AIDecisionTrace
        isOpen={traceOpen}
        onClose={() => setTraceOpen(false)}
        reasoningTrace={[]}
        domainType={data?.domain_type}
        responsibleAuthority={data?.responsible_authority}
      />

      {/* Explainability Panel Modal */}
      <ExplainabilityPanel
        isOpen={explainOpen}
        onClose={() => setExplainOpen(false)}
        domainType={data?.domain_type}
        responsibleAuthority={data?.responsible_authority}
        reasoning={data?.ownership_reasoning}
        checklist={data?.explainability_checklist}
        confidenceLevel="96%"
      />
    </div>
  );
}
