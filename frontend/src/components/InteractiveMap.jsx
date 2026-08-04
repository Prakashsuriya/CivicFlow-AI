import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { getComplaintsAPI } from '../services/api';
import { MapPin, ShieldAlert, CheckCircle2, Clock, Filter, RefreshCw } from 'lucide-react';

const createCustomIcon = (color) => {
  return L.divIcon({
    className: 'custom-leaflet-marker',
    html: `<div style="
      background-color: ${color};
      width: 24px;
      height: 24px;
      border-radius: 50%;
      border: 3px solid #ffffff;
      box-shadow: 0 0 12px ${color}, 0 2px 8px rgba(0,0,0,0.3);
    "></div>`,
    iconSize: [26, 26],
    iconAnchor: [13, 13]
  });
};

const redIcon = createCustomIcon('#ef4444');
const amberIcon = createCustomIcon('#f59e0b');
const blueIcon = createCustomIcon('#3b82f6');
const greenIcon = createCustomIcon('#10b981');

// Helper to ensure Leaflet invalidates size on render
function MapController() {
  const map = useMap();
  useEffect(() => {
    setTimeout(() => {
      map.invalidateSize();
    }, 250);
  }, [map]);
  return null;
}

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

  const coordCounts = {};
  const processedComplaints = filteredComplaints.map(pt => {
    const rawLat = pt.latitude || 12.9698;
    const rawLng = pt.longitude || 79.1378;
    const key = `${rawLat.toFixed(4)}_${rawLng.toFixed(4)}`;
    
    const count = coordCounts[key] || 0;
    coordCounts[key] = count + 1;

    let lat = rawLat;
    let lng = rawLng;

    if (count > 0) {
      const angle = count * 1.25;
      const distance = 0.00045 * Math.sqrt(count);
      lat = rawLat + distance * Math.cos(angle);
      lng = rawLng + distance * Math.sin(angle);
    }

    return { ...pt, displayLat: lat, displayLng: lng };
  });

  return (
    <div style={{
      backgroundColor: '#ffffff',
      borderRadius: '16px',
      padding: '1.5rem',
      width: '100%',
      minHeight: '680px',
      border: '1px solid #e2e8f0',
      boxShadow: '0 10px 30px rgba(0,0,0,0.08)'
    }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.25rem' }}>
        <div>
          <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#0f172a', fontFamily: 'Outfit', margin: 0 }}>
            Vellore Municipal Ward Live Geospatial Map (Light Mode)
          </h2>
          <p style={{ fontSize: '0.88rem', color: '#64748b', margin: '0.2rem 0 0 0' }}>
            Real-time geospatial distribution of active & resolved infrastructure incidents ({processedComplaints.length} Total Shown)
          </p>
        </div>

        {/* Filter Controls & Legend */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
          <button
            onClick={fetchMapPoints}
            style={{
              background: '#f1f5f9',
              border: '1px solid #cbd5e1',
              color: '#334155',
              padding: '0.4rem 0.85rem',
              borderRadius: '8px',
              fontSize: '0.82rem',
              fontWeight: 700,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.3rem'
            }}
          >
            <RefreshCw size={13} /> Refresh Map
          </button>

          {/* Status Filter Dropdown */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <Filter size={15} color="#64748b" />
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              style={{
                backgroundColor: '#ffffff',
                color: '#0f172a',
                border: '1px solid #cbd5e1',
                padding: '0.4rem 0.85rem',
                borderRadius: '8px',
                fontSize: '0.82rem',
                fontWeight: 700
              }}
            >
              <option value="all">All Complaints ({complaints.length})</option>
              <option value="submitted">Submitted</option>
              <option value="in_progress">In Progress</option>
              <option value="resolved">Resolved</option>
            </select>
          </div>

          {/* Color Legend */}
          <div style={{ display: 'flex', gap: '0.85rem', fontSize: '0.78rem', fontWeight: 700 }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', color: '#ef4444' }}>
              <span style={{ width: 10, height: 10, borderRadius: '50%', backgroundColor: '#ef4444' }}></span> Critical
            </span>
            <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', color: '#d97706' }}>
              <span style={{ width: 10, height: 10, borderRadius: '50%', backgroundColor: '#f59e0b' }}></span> High
            </span>
            <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', color: '#2563eb' }}>
              <span style={{ width: 10, height: 10, borderRadius: '50%', backgroundColor: '#3b82f6' }}></span> Medium
            </span>
            <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', color: '#059669' }}>
              <span style={{ width: 10, height: 10, borderRadius: '50%', backgroundColor: '#10b981' }}></span> Resolved
            </span>
          </div>
        </div>
      </div>

      <div style={{ height: '580px', width: '100%', borderRadius: '14px', overflow: 'hidden', border: '1px solid #cbd5e1', position: 'relative' }}>
        {loading ? (
          <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#2563eb', fontWeight: 700, backgroundColor: '#f8fafc' }}>
            <span>Loading Bright OpenStreetMap Live Tiles for Vellore Wards...</span>
          </div>
        ) : (
          <MapContainer 
            center={[12.9698, 79.1378]} 
            zoom={13} 
            scrollWheelZoom={true}
            style={{ height: '100%', width: '100%' }}
          >
            <MapController />
            {/* CartoDB Voyager Light Mode Tiles for maximum visibility */}
            <TileLayer
              attribution='&copy; <a href="https://carto.com/attributions">CARTO</a> &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
              url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
            />
            {processedComplaints.map((pt) => (
              <Marker 
                key={pt.id} 
                position={[pt.displayLat, pt.displayLng]}
                icon={getMarkerIcon(pt.severity, pt.status)}
              >
                <Popup>
                  <div style={{ padding: '0.3rem', minWidth: '200px', fontFamily: 'Outfit, sans-serif', color: '#0f172a' }}>
                    <div style={{ fontWeight: 800, fontSize: '0.95rem', color: '#0f172a' }}>
                      {pt.title || `${pt.category} Issue`}
                    </div>
                    <div style={{ fontSize: '0.78rem', color: '#059669', margin: '0.25rem 0', fontFamily: 'monospace', fontWeight: 800 }}>
                      Ticket #{pt.id}
                    </div>
                    <div style={{ fontSize: '0.78rem', color: '#334155' }}>
                      <strong>Authority:</strong> {pt.responsible_authority || "Municipal Corporation"}
                    </div>
                    <div style={{ fontSize: '0.78rem', color: '#334155' }}>
                      <strong>Category:</strong> {pt.category}
                    </div>
                    <div style={{ fontSize: '0.78rem', color: '#334155' }}>
                      <strong>Ward:</strong> {pt.ward || "Vellore Ward"}
                    </div>
                    <div style={{ fontSize: '0.78rem', color: '#334155' }}>
                      <strong>Department:</strong> {pt.department_name || "Unassigned"}
                    </div>
                    <div style={{ marginTop: '0.5rem' }}>
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
