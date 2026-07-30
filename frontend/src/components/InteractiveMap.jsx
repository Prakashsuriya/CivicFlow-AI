import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import { getComplaintsAPI } from '../services/api';
import { MapPin, ShieldAlert, CheckCircle2, Clock, Filter, RefreshCw } from 'lucide-react';

const createCustomIcon = (color) => {
  return L.divIcon({
    className: 'custom-leaflet-marker',
    html: `<div style="
      background-color: ${color};
      width: 20px;
      height: 20px;
      border-radius: 50%;
      border: 3px solid #0f172a;
      box-shadow: 0 0 12px ${color};
    "></div>`,
    iconSize: [22, 22],
    iconAnchor: [11, 11]
  });
};

const redIcon = createCustomIcon('#f43f5e');
const amberIcon = createCustomIcon('#f59e0b');
const blueIcon = createCustomIcon('#3b82f6');
const greenIcon = createCustomIcon('#10b981');

export default function InteractiveMap() {
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState('all');

  useEffect(() => {
    fetchMapPoints();

    let ws;
    try {
      const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
      const wsUrl = import.meta.env.VITE_WS_URL || `${protocol}//${window.location.hostname}:8000/ws/feed`;
      ws = new WebSocket(wsUrl);

      ws.onmessage = (event) => {
        try {
          const msg = JSON.parse(event.data);
          if (msg.event === 'NEW_COMPLAINT' || msg.event === 'STATUS_UPDATE') {
            fetchMapPoints();
          }
        } catch (e) {}
      };
    } catch (e) {}

    return () => {
      if (ws) ws.close();
    };
  }, []);

  const fetchMapPoints = async () => {
    setLoading(true);
    try {
      const data = await getComplaintsAPI();
      setComplaints(data.complaints || []);
    } catch (err) {
      console.error("Map fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  const getMarkerIcon = (severity, status) => {
    if (status === 'resolved') return greenIcon;
    if (severity === 'critical') return redIcon;
    if (severity === 'high') return amberIcon;
    return blueIcon;
  };

  const filteredComplaints = complaints.filter(c => {
    if (filterStatus === 'all') return true;
    return c.status === filterStatus;
  });

  return (
    <div className="glass-card" style={{ padding: '1.5rem', height: '100%' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem', marginBottom: '1rem' }}>
        <div>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--text-primary)' }}>Vellore Municipal Ward Live Map</h2>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
            Real-time geospatial distribution of active & resolved civic complaints ({filteredComplaints.length} Total Shown)
          </p>
        </div>

        {/* Filter Controls & Legend */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
          {/* Status Filter Dropdown */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <Filter size={14} color="var(--text-muted)" />
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              style={{
                padding: '0.35rem 0.75rem',
                borderRadius: '8px',
                fontSize: '0.8rem',
                fontWeight: 600
              }}
            >
              <option value="all">All Complaints ({complaints.length})</option>
              <option value="submitted">Submitted</option>
              <option value="in_progress">In Progress</option>
              <option value="resolved">Resolved</option>
            </select>
          </div>

          {/* Color Legend */}
          <div style={{ display: 'flex', gap: '0.75rem', fontSize: '0.75rem', fontWeight: 600 }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', color: '#f87171' }}>
              <span style={{ width: 10, height: 10, borderRadius: '50%', backgroundColor: '#f43f5e' }}></span> Critical
            </span>
            <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', color: '#fbbf24' }}>
              <span style={{ width: 10, height: 10, borderRadius: '50%', backgroundColor: '#f59e0b' }}></span> High
            </span>
            <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', color: '#60a5fa' }}>
              <span style={{ width: 10, height: 10, borderRadius: '50%', backgroundColor: '#3b82f6' }}></span> Medium/Low
            </span>
            <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', color: '#34d399' }}>
              <span style={{ width: 10, height: 10, borderRadius: '50%', backgroundColor: '#10b981' }}></span> Resolved
            </span>
          </div>
        </div>
      </div>

      <div style={{ height: '550px', borderRadius: '12px', overflow: 'hidden', border: '1px solid var(--border-color)' }}>
        {loading ? (
          <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)' }}>
            Loading Dynamic Ward Map Points for Vellore...
          </div>
        ) : (
          <MapContainer 
            center={[12.9165, 79.1325]} 
            zoom={13} 
            scrollWheelZoom={true}
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            {filteredComplaints.map((pt) => (
              <Marker 
                key={pt.id} 
                position={[pt.latitude || 12.9165, pt.longitude || 79.1325]}
                icon={getMarkerIcon(pt.severity, pt.status)}
              >
                <Popup>
                  <div style={{ padding: '0.2rem', minWidth: '180px' }}>
                    <div style={{ fontWeight: 700, fontSize: '0.9rem', color: '#f8fafc' }}>
                      {pt.title || `${pt.category} Issue`}
                    </div>
                    <div style={{ fontSize: '0.75rem', color: '#94a3b8', margin: '0.2rem 0' }}>
                      ID: <span style={{ fontFamily: 'monospace', color: '#38bdf8' }}>#{pt.id}</span>
                    </div>
                    <div style={{ fontSize: '0.75rem', color: '#cbd5e1' }}>
                      Category: {pt.category}
                    </div>
                    <div style={{ fontSize: '0.75rem', color: '#cbd5e1' }}>
                      Ward: {pt.ward}
                    </div>
                    <div style={{ fontSize: '0.75rem', color: '#cbd5e1' }}>
                      Department: {pt.department_name || "Unassigned"}
                    </div>
                    <div style={{ marginTop: '0.4rem' }}>
                      <span className={`badge badge-${pt.status}`}>
                        {pt.status.replace('_', ' ')}
                      </span>
                    </div>
                  </div>
                </Popup>
              </Marker>
            ))}
          </MapContainer>
        )}
      </div>
    </div>
  );
}
