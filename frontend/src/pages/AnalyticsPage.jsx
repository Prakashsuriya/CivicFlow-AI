import React, { useEffect, useState } from 'react';
import { getAnalyticsOverviewAPI } from '../services/api';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { TrendingUp, CheckCircle, Clock, Layers, Download, Printer } from 'lucide-react';

export default function AnalyticsPage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      const res = await getAnalyticsOverviewAPI();
      setData(res);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleExportCSV = () => {
    if (!data) return;
    const { metrics, categories, wards } = data;
    const rows = [
      ["Metric", "Value"],
      ["Total Complaints", metrics.total_complaints],
      ["Resolution Rate", `${metrics.resolution_rate_pct}%`],
      ["In Progress", metrics.in_progress],
      ["Avg Resolution SLA Hours", metrics.avg_resolution_hours],
      [],
      ["Category", "Count"],
      ...categories.map(c => [c.name, c.value]),
      [],
      ["Ward", "Complaint Count"],
      ...wards.map(w => [w.name, w.count])
    ];

    const csvContent = "data:text/csv;charset=utf-8," + rows.map(e => e.join(",")).join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "vellore_civicflow_analytics.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (loading || !data) {
    return (
      <div style={{ textAlign: 'center', padding: '4rem', color: '#9ca3af' }}>
        Loading Municipal Performance Analytics...
      </div>
    );
  }

  const { metrics, categories, wards } = data;
  const COLORS = ['#10b981', '#06b6d4', '#3b82f6', '#f59e0b', '#8b5cf6', '#f43f5e'];

  return (
    <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '1.5rem 1rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.5rem' }}>
        <div>
          <h1 style={{ fontSize: '1.8rem', fontWeight: 800 }}>Vellore Municipal Intelligence & Analytics</h1>
          <p style={{ color: '#9ca3af', fontSize: '0.9rem' }}>
            Real-time AI metrics, ward complaint density, and resolution efficiency index across Vellore Wards.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <button
            onClick={handleExportCSV}
            className="btn-secondary"
            style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', padding: '0.5rem 1rem', fontSize: '0.85rem' }}
          >
            <Download size={16} color="#34d399" /> Export CSV Data
          </button>
          <button
            onClick={() => window.print()}
            className="btn-primary"
            style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', padding: '0.5rem 1rem', fontSize: '0.85rem' }}
          >
            <Printer size={16} /> Printable PDF Report
          </button>
        </div>
      </div>

      {/* KPI Cards Responsive Grid */}
      <div className="responsive-grid-4" style={{ marginBottom: '1.5rem' }}>
        <div className="glass-card" style={{ padding: '1.25rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', color: '#9ca3af', fontSize: '0.85rem' }}>
            <span>Total Complaints</span>
            <Layers size={18} color="#38bdf8" />
          </div>
          <div style={{ fontSize: '1.8rem', fontWeight: 800, marginTop: '0.4rem', color: '#f9fafb' }}>
            {metrics.total_complaints}
          </div>
          <div style={{ fontSize: '0.75rem', color: '#34d399', marginTop: '0.2rem' }}>
            All Vellore Wards Combined
          </div>
        </div>

        <div className="glass-card" style={{ padding: '1.25rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', color: '#9ca3af', fontSize: '0.85rem' }}>
            <span>Resolution Rate</span>
            <CheckCircle size={18} color="#10b981" />
          </div>
          <div style={{ fontSize: '1.8rem', fontWeight: 800, marginTop: '0.4rem', color: '#10b981' }}>
            {metrics.resolution_rate_pct}%
          </div>
          <div style={{ fontSize: '0.75rem', color: '#34d399', marginTop: '0.2rem' }}>
            Target: &gt;90% SLA Compliance
          </div>
        </div>

        <div className="glass-card" style={{ padding: '1.25rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', color: '#9ca3af', fontSize: '0.85rem' }}>
            <span>In Progress</span>
            <Clock size={18} color="#f59e0b" />
          </div>
          <div style={{ fontSize: '1.8rem', fontWeight: 800, marginTop: '0.4rem', color: '#fbbf24' }}>
            {metrics.in_progress}
          </div>
          <div style={{ fontSize: '0.75rem', color: '#fbbf24', marginTop: '0.2rem' }}>
            Active Field Work
          </div>
        </div>

        <div className="glass-card" style={{ padding: '1.25rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', color: '#9ca3af', fontSize: '0.85rem' }}>
            <span>Avg Resolution SLA</span>
            <TrendingUp size={18} color="#8b5cf6" />
          </div>
          <div style={{ fontSize: '1.8rem', fontWeight: 800, marginTop: '0.4rem', color: '#a78bfa' }}>
            {metrics.avg_resolution_hours}h
          </div>
          <div style={{ fontSize: '0.75rem', color: '#a78bfa', marginTop: '0.2rem' }}>
            Average Turnaround
          </div>
        </div>
      </div>

      {/* Charts Grid Responsive */}
      <div className="responsive-grid-2">
        {/* Wards Bar Chart */}
        <div className="glass-card" style={{ padding: '1.25rem' }}>
          <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '1rem' }}>
            Complaints by Vellore Ward
          </h3>
          <div style={{ height: '280px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={wards}>
                <XAxis dataKey="ward" stroke="#9ca3af" fontSize={10} interval={0} angle={-15} textAnchor="end" />
                <YAxis stroke="#9ca3af" fontSize={12} />
                <Tooltip contentStyle={{ background: '#1e293b', border: 'none', borderRadius: '8px' }} />
                <Bar dataKey="count" fill="#10b981" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Categories Pie Chart */}
        <div className="glass-card" style={{ padding: '1.25rem' }}>
          <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '1rem' }}>
            Distribution by Issue Category
          </h3>
          <div style={{ height: '280px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={categories}
                  dataKey="count"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={90}
                  label={(entry) => `${entry.name}: ${entry.count}`}
                >
                  {categories.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ background: '#1e293b', border: 'none', borderRadius: '8px' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}
