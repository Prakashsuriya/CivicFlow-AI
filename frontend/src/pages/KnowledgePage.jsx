import React, { useState } from 'react';
import { queryRAGKnowledgeAPI } from '../services/api';
import { BookOpen, Search, Sparkles, FileText, CheckCircle2 } from 'lucide-react';

export default function KnowledgePage() {
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState(null);

  const sampleQueries = [
    "What is the SLA time for sanitation and garbage collection?",
    "Rainwater harvesting property tax subsidy scheme",
    "Emergency contacts for flooding and disaster management",
    "What are the fines for illegal construction material dumping?"
  ];

  const handleSearch = async (e) => {
    if (e) e.preventDefault();
    if (!query.trim()) return;

    setLoading(true);
    try {
      const res = await queryRAGKnowledgeAPI(query);
      setResults(res.results || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handlePresetClick = (txt) => {
    setQuery(txt);
    setLoading(true);
    queryRAGKnowledgeAPI(txt)
      .then((res) => setResults(res.results || []))
      .finally(() => setLoading(false));
  };

  return (
    <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '2rem 1rem' }}>
      {/* Title */}
      <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
        <div style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '0.5rem',
          background: 'rgba(6, 182, 212, 0.1)',
          border: '1px solid rgba(6, 182, 212, 0.3)',
          padding: '0.4rem 1rem',
          borderRadius: '9999px',
          color: '#38bdf8',
          fontSize: '0.85rem',
          fontWeight: 600,
          marginBottom: '1rem'
        }}>
          <BookOpen size={16} /> Grounded ChromaDB Vector RAG Engine
        </div>
        <h1 style={{ fontSize: '2.5rem', fontWeight: 800 }}>
          Municipal Rulebook & Scheme Knowledge Base
        </h1>
        <p style={{ color: '#9ca3af', fontSize: '1rem', maxWidth: '650px', margin: '0.5rem auto 0 auto' }}>
          Retrieve verified municipal bylaws, SLA commitments, disaster hotlines, and public welfare schemes. Zero hallucination guaranteed.
        </p>
      </div>

      {/* Search Input */}
      <div className="glass-card" style={{ padding: '1.5rem', maxWidth: '800px', margin: '0 auto 2rem auto' }}>
        <form onSubmit={handleSearch} style={{ display: 'flex', gap: '0.75rem' }}>
          <div style={{ position: 'relative', flex: 1 }}>
            <Search size={18} color="#9ca3af" style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)' }} />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Ask any question regarding municipal rules, SLAs, emergency contacts..."
              style={{
                width: '100%',
                padding: '0.85rem 1rem 0.85rem 2.8rem',
                fontSize: '0.95rem'
              }}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn-primary"
          >
            {loading ? "Searching RAG..." : "Search Vector DB"}
          </button>
        </form>

        {/* Presets */}
        <div style={{ marginTop: '1rem', display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
          <span style={{ fontSize: '0.75rem', color: '#6b7280', alignSelf: 'center' }}>Suggested:</span>
          {sampleQueries.map((q, idx) => (
            <button
              key={idx}
              onClick={() => handlePresetClick(q)}
              style={{
                background: 'rgba(255, 255, 255, 0.04)',
                border: '1px solid rgba(255, 255, 255, 0.08)',
                color: '#9ca3af',
                padding: '0.3rem 0.7rem',
                borderRadius: '16px',
                fontSize: '0.75rem',
                cursor: 'pointer'
              }}
            >
              {q}
            </button>
          ))}
        </div>
      </div>

      {/* RAG Results Display */}
      {results && (
        <div style={{ maxWidth: '800px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <h3 style={{ fontSize: '1rem', color: '#34d399', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <CheckCircle2 size={18} /> {results.length} Grounded Source Citations Retrieved
          </h3>

          {results.map((res, idx) => (
            <div key={idx} className="glass-card" style={{ padding: '1.25rem', borderLeft: '3px solid #06b6d4' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                <FileText size={16} color="#38bdf8" />
                <span style={{ fontSize: '0.8rem', color: '#38bdf8', fontWeight: 700, fontFamily: 'monospace' }}>
                  Source: {res.source}
                </span>
              </div>
              <div style={{ fontSize: '0.9rem', color: '#e2e8f0', lineHeight: 1.6, whitespace: 'pre-line' }}>
                {res.content}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
