import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import { getAnalyticsOverviewAPI } from '../services/api';
import { MapPin, ShieldAlert, CheckCircle2, Clock } from 'lucide-react';

const createCustomIcon = (color) => {
  return L.divIcon({
    className: 'custom-leaflet-marker',
    html: `<div style="
      background-color: ${color};
      width: 18px;
      height: 18px;
      border-radius: 50%;
      border: 3px solid #0f172a;
      box-shadow: 0 0 10px ${color};
    "></div>`,
    iconSize: [20, 20],
    iconAnchor: [10, 10]
  });
};

const redIcon = createCustomIcon('#f43f5e');
const amberIcon = createCustomIcon('#f59e0b');
const blueIcon = createCustomIcon('#3b82f6');
const greenIcon = createCustomIcon('#10b981');

export default function InteractiveMap() {
  const [points, setPoints] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMapPoints();
  }, []);

  const fetchMapPoints = async () => {
    try {
      const data = await getAnalyticsOverviewAPI();
      setPoints(data.heatmap_points || []);
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

  return (
    <div className="glass-card" style={{ padding: '1.5rem', height: '100%' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
        <div>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 700 }}>Vellore Municipal Ward Live Map</h2>
          <p style={{ fontSize: '0.85rem', color: '#9ca3af' }}>
            Real-time geospatial distribution of active civic complaints in Vellore Corporation, Tamil Nadu
          </p>
        </div>
        
        <div style={{ display: 'flex', gap: '1rem', fontSize: '0.75rem', fontWeight: 600 }}>
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

      <div style={{ height: '550px', borderRadius: '12px', overflow: 'hidden', border: '1px solid rgba(255, 255, 255, 0.1)' }}>
        {loading ? (
          <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#9ca3af' }}>
            Loading Map Points for Vellore...
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
            {points.map((pt) => (
              <Marker 
                key={pt.id} 
                position={[pt.lat || 12.9165, pt.lng || 79.1325]}
                icon={getMarkerIcon(pt.severity, pt.status)}
              >
                <Popup>
                  <div style={{ padding: '0.2rem', minWidth: '180px' }}>
                    <div style={{ fontWeight: 700, fontSize: '0.9rem', color: '#f8fafc' }}>
                      {pt.title}
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
