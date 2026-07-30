import React, { useEffect, useState } from 'react';
import { getComplaintsAPI, updateComplaintStatusAPI } from '../services/api';
import { ShieldAlert, Filter, CheckCircle, Clock, UserCheck, RefreshCw } from 'lucide-react';

export default function AdminDashboard() {
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterDept, setFilterDept] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [updatingId, setUpdatingId] = useState(null);

  useEffect(() => {
    fetchComplaints();
  }, [filterDept, filterStatus]);

  useEffect(() => {
    let ws;
    try {
      const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
      const wsUrl = import.meta.env.VITE_WS_URL || `${protocol}//${window.location.hostname}:8000/ws/feed`;
      ws = new WebSocket(wsUrl);

      ws.onmessage = (event) => {
        try {
          const msg = JSON.parse(event.data);
          if (msg.event === 'NEW_COMPLAINT' || msg.event === 'STATUS_UPDATE') {
            fetchComplaints();
          }
        } catch (e) {}
      };
    } catch (e) {}

    return () => {
      if (ws) ws.close();
    };
  }, []);

  const fetchComplaints = async () => {
    setLoading(true);
    try {
      const filters = {};
      if (filterStatus) filters.status = filterStatus;
      const data = await getComplaintsAPI(filters);
      setComplaints(data.complaints || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (complaintId, newStatus) => {
    setUpdatingId(complaintId);
    try {
      await updateComplaintStatusAPI(complaintId, {
        status: newStatus,
        reasoning_notes: `Status transitioned to ${newStatus} by Municipal Officer on duty.`,
        updated_by: "Vellore Admin Officer"
      });
      await fetchComplaints();
    } catch (err) {
      console.error(err);
    } finally {
      setUpdatingId(null);
    }
  };

  return (
    <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '1.5rem 1rem' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.5rem' }}>
        <div>
          <h1 style={{ fontSize: '1.8rem', fontWeight: 800 }}>Department Officer & Admin Queue</h1>
          <p style={{ color: '#9ca3af', fontSize: '0.9rem' }}>
            Monitor incoming civic complaints in Vellore Corporation, manage field dispatch, and resolve issues.
          </p>
        </div>

        <button 
          onClick={fetchComplaints}
          className="btn-secondary"
        >
          <RefreshCw size={16} /> Refresh Feed
        </button>
      </div>

      {/* Filter Toolbar */}
      <div className="glass-card" style={{ padding: '1rem 1.25rem', marginBottom: '1.5rem', display: 'flex', gap: '1rem', alignItems: 'center', flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#9ca3af', fontSize: '0.85rem' }}>
          <Filter size={16} /> Filter Queue:
        </div>

        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          style={{
            padding: '0.5rem 1rem',
            borderRadius: '8px',
            fontSize: '0.85rem'
          }}
        >
          <option value="">All Statuses</option>
          <option value="submitted">Submitted</option>
          <option value="in_progress">In Progress</option>
          <option value="resolved">Resolved</option>
        </select>
      </div>

      {/* Complaint Queue Table (Overflow Auto for Mobile) */}
      <div className="glass-card" style={{ overflowX: 'auto' }}>
        {loading ? (
          <div style={{ padding: '3rem', textAlign: 'center', color: '#9ca3af' }}>
            Loading Complaint Feed...
          </div>
        ) : complaints.length === 0 ? (
          <div style={{ padding: '3rem', textAlign: 'center', color: '#9ca3af' }}>
            No complaints found matching filters.
          </div>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.85rem', minWidth: '700px' }}>
            <thead>
              <tr style={{ background: 'rgba(255, 255, 255, 0.03)', borderBottom: '1px solid rgba(255, 255, 255, 0.08)', color: '#9ca3af' }}>
                <th style={{ padding: '0.85rem' }}>Tracking ID</th>
                <th style={{ padding: '0.85rem' }}>Issue Title</th>
                <th style={{ padding: '0.85rem' }}>Category & Ward</th>
                <th style={{ padding: '0.85rem' }}>Department</th>
                <th style={{ padding: '0.85rem' }}>Severity & SLA</th>
                <th style={{ padding: '0.85rem' }}>Status</th>
                <th style={{ padding: '0.85rem' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {complaints.map((c) => (
                <tr key={c.id} style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.05)' }}>
                  <td style={{ padding: '0.85rem', fontFamily: 'monospace', fontWeight: 700, color: '#38bdf8' }}>
                    #{c.id}
                  </td>
                  <td style={{ padding: '0.85rem', fontWeight: 600 }}>
                    {c.title}
                    <div style={{ fontSize: '0.75rem', color: '#9ca3af', fontWeight: 400 }}>{c.address}</div>
                  </td>
                  <td style={{ padding: '0.85rem' }}>
                    <div>{c.category}</div>
                    <div style={{ fontSize: '0.75rem', color: '#34d399' }}>{c.ward}</div>
                  </td>
                  <td style={{ padding: '0.85rem' }}>
                    <div>{c.department_name}</div>
                    <div style={{ fontSize: '0.75rem', color: '#9ca3af', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                      <UserCheck size={12} /> {c.assigned_worker_name}
                    </div>
                  </td>
                  <td style={{ padding: '0.85rem' }}>
                    <span style={{
                      color: c.severity === 'critical' ? '#f87171' : c.severity === 'high' ? '#fbbf24' : '#60a5fa',
                      fontWeight: 700,
                      textTransform: 'uppercase',
                      fontSize: '0.75rem'
                    }}>
                      {c.severity}
                    </span>
                    <div style={{ fontSize: '0.75rem', color: '#9ca3af', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                      <Clock size={12} /> {c.estimated_sla_hours}h Target
                    </div>
                  </td>
                  <td style={{ padding: '0.85rem' }}>
                    <span className={`badge badge-${c.status}`}>
                      {c.status.replace('_', ' ')}
                    </span>
                  </td>
                  <td style={{ padding: '0.85rem' }}>
                    <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
                      {c.status !== 'in_progress' && c.status !== 'resolved' && (
                        <button
                          onClick={() => handleStatusChange(c.id, 'in_progress')}
                          disabled={updatingId === c.id}
                          style={{
                            background: 'rgba(245, 158, 11, 0.2)',
                            border: '1px solid rgba(245, 158, 11, 0.4)',
                            color: '#fbbf24',
                            padding: '0.25rem 0.5rem',
                            borderRadius: '6px',
                            fontSize: '0.75rem',
                            cursor: 'pointer'
                          }}
                        >
                          In Progress
                        </button>
                      )}
                      {c.status !== 'resolved' && (
                        <button
                          onClick={() => handleStatusChange(c.id, 'resolved')}
                          disabled={updatingId === c.id}
                          style={{
                            background: 'rgba(16, 185, 129, 0.2)',
                            border: '1px solid rgba(16, 185, 129, 0.4)',
                            color: '#34d399',
                            padding: '0.25rem 0.5rem',
                            borderRadius: '6px',
                            fontSize: '0.75rem',
                            cursor: 'pointer'
                          }}
                        >
                          Resolve
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
