import React, { useState, useEffect } from 'react';
import { getComplaintDetailAPI } from '../services/api';
import { Search, MapPin, UserCheck, Clock, ShieldAlert, CheckCircle2, History, Radio } from 'lucide-react';

export default function TrackComplaint() {
  const [complaintId, setComplaintId] = useState('');
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    let ws;
    try {
      const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
      const wsUrl = `${protocol}//${window.location.hostname}:8000/ws/feed`;
      ws = new WebSocket(wsUrl);

      ws.onmessage = (event) => {
        try {
          const msg = JSON.parse(event.data);
          if (msg.event === 'STATUS_UPDATE' && data && msg.complaint_id === data.id) {
            // Auto refresh complaint detail
            getComplaintDetailAPI(data.id).then(res => setData(res)).catch(() => {});
          }
        } catch (e) {}
      };
    } catch (e) {}

    return () => {
      if (ws) ws.close();
    };
  }, [data?.id]);

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!complaintId.trim()) return;

    setLoading(true);
    setError(null);
    setData(null);

    try {
      const res = await getComplaintDetailAPI(complaintId.trim());
      setData(res);
    } catch (err) {
      setError("Complaint ID not found. Try searching for sample ID 'CF-2026-2001'.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: '900px', margin: '0 auto', padding: '1.5rem 1rem' }}>
      {/* Title */}
      <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
        <h1 style={{ fontSize: '2.2rem', fontWeight: 800 }}>Track Complaint Status</h1>
        <p style={{ color: '#9ca3af', fontSize: '0.95rem' }}>
          Enter your unique tracking ID to view real-time resolution audit logs in Vellore.
        </p>
      </div>

      {/* Search Bar */}
      <div className="glass-card" style={{ padding: '1.25rem', marginBottom: '1.5rem' }}>
        <form onSubmit={handleSearch} style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
          <div style={{ position: 'relative', flex: 1, minWidth: '220px' }}>
            <Search size={18} color="#9ca3af" style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)' }} />
            <input
              type="text"
              value={complaintId}
              onChange={(e) => setComplaintId(e.target.value)}
              placeholder="Enter Complaint ID (e.g. CF-2026-2001)"
              style={{
                width: '100%',
                padding: '0.75rem 1rem 0.75rem 2.8rem',
                fontFamily: 'monospace',
                fontSize: '0.95rem'
              }}
            />
          </div>

          <button type="submit" disabled={loading} className="btn-primary">
            {loading ? "Searching..." : "Lookup Status"}
          </button>
        </form>
      </div>

      {/* Error */}
      {error && (
        <div style={{ padding: '1rem', background: 'rgba(244, 63, 94, 0.1)', border: '1px solid rgba(244, 63, 94, 0.3)', borderRadius: '10px', color: '#f87171', textAlign: 'center' }}>
          {error}
        </div>
      )}

      {/* Result Card & History Timeline */}
      {data && (
        <div className="glass-card" style={{ padding: '1.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '1.25rem', borderBottom: '1px solid rgba(255, 255, 255, 0.08)', paddingBottom: '1rem' }}>
            <div>
              <span style={{ fontSize: '0.75rem', color: '#9ca3af', fontFamily: 'monospace' }}>COMPLAINT #{data.id}</span>
              <h2 style={{ fontSize: '1.3rem', fontWeight: 700, margin: '0.2rem 0' }}>{data.title}</h2>
              <p style={{ color: '#d1d5db', fontSize: '0.85rem', margin: 0 }}>{data.description}</p>
            </div>
            <span className={`badge badge-${data.status}`} style={{ fontSize: '0.8rem', padding: '0.35rem 0.85rem' }}>
              {data.status.replace('_', ' ')}
            </span>
          </div>

          {/* Key Meta Grid Responsive */}
          <div className="responsive-grid-4" style={{ marginBottom: '1.5rem' }}>
            <div style={{ background: 'rgba(255, 255, 255, 0.03)', padding: '0.75rem', borderRadius: '8px' }}>
              <div style={{ fontSize: '0.75rem', color: '#9ca3af' }}>Department</div>
              <div style={{ fontWeight: 700, color: '#f9fafb', fontSize: '0.85rem' }}>{data.department}</div>
            </div>
            <div style={{ background: 'rgba(255, 255, 255, 0.03)', padding: '0.75rem', borderRadius: '8px' }}>
              <div style={{ fontSize: '0.75rem', color: '#9ca3af' }}>Ward</div>
              <div style={{ fontWeight: 700, color: '#34d399', fontSize: '0.85rem' }}>{data.ward}</div>
            </div>
            <div style={{ background: 'rgba(255, 255, 255, 0.03)', padding: '0.75rem', borderRadius: '8px' }}>
              <div style={{ fontSize: '0.75rem', color: '#9ca3af' }}>Field Officer</div>
              <div style={{ fontWeight: 700, color: '#38bdf8', fontSize: '0.85rem' }}>{data.assigned_worker || "Unassigned"}</div>
            </div>
            <div style={{ background: 'rgba(255, 255, 255, 0.03)', padding: '0.75rem', borderRadius: '8px' }}>
              <div style={{ fontSize: '0.75rem', color: '#9ca3af' }}>SLA Target</div>
              <div style={{ fontWeight: 700, color: '#fbbf24', fontSize: '0.85rem' }}>{data.estimated_sla_hours} Hours</div>
            </div>
          </div>

          {/* Audit Timeline */}
          <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <History size={18} color="#10b981" /> Lifecycle Audit Trail
          </h3>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {data.status_history.map((log, idx) => (
              <div key={idx} style={{
                background: 'rgba(17, 24, 39, 0.6)',
                border: '1px solid rgba(255, 255, 255, 0.05)',
                padding: '0.75rem 1rem',
                borderRadius: '8px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: '0.5rem'
              }}>
                <div>
                  <span style={{ fontSize: '0.75rem', color: '#10b981', fontWeight: 700 }}>
                    {log.updated_by}
                  </span>
                  <div style={{ fontSize: '0.85rem', color: '#e2e8f0', margin: '0.2rem 0' }}>
                    {log.reasoning_notes}
                  </div>
                </div>
                <div style={{ fontSize: '0.75rem', color: '#9ca3af', fontFamily: 'monospace' }}>
                  {new Date(log.timestamp).toLocaleString()}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
