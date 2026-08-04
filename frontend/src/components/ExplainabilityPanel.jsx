import React from 'react';
import { X, CheckCircle2, ShieldCheck, HelpCircle, AlertTriangle } from 'lucide-react';

export default function ExplainabilityPanel({ isOpen, onClose, domainType, responsibleAuthority, reasoning, checklist, confidenceLevel = "96%", overrideDetails }) {
  if (!isOpen) return null;

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.75)',
      backdropFilter: 'blur(8px)',
      zIndex: 2100,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '1rem',
      animation: 'fadeIn 0.2s ease-out'
    }}>
      <div style={{
        width: '100%',
        maxWidth: '600px',
        backgroundColor: '#0f172a',
        border: '1px solid rgba(16, 185, 129, 0.4)',
        borderRadius: '16px',
        boxShadow: '0 20px 50px rgba(0, 0, 0, 0.7)',
        overflow: 'hidden'
      }}>
        {/* Modal Header */}
        <div style={{
          padding: '1.25rem 1.5rem',
          borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
          background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.15) 0%, rgba(6, 182, 212, 0.05) 100%)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{
              background: 'linear-gradient(135deg, #10b981, #06b6d4)',
              padding: '0.5rem',
              borderRadius: '10px',
              color: '#ffffff'
            }}>
              <ShieldCheck size={22} />
            </div>
            <div>
              <h3 style={{ margin: 0, fontSize: '1.1rem', color: '#ffffff', fontFamily: 'Outfit' }}>
                AI Ownership & Jurisdiction Explainability
              </h3>
              <span style={{ fontSize: '0.72rem', color: '#10b981', fontWeight: 600 }}>
                Transparent Multi-Agent Decision Rationale & Visual Evidence
              </span>
            </div>
          </div>
          <button
            onClick={onClose}
            style={{
              background: 'rgba(255, 255, 255, 0.05)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              color: 'var(--text-muted)',
              padding: '0.4rem',
              borderRadius: '6px',
              cursor: 'pointer'
            }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Modal Body */}
        <div style={{ padding: '1.5rem', maxHeight: '80vh', overflowY: 'auto' }}>
          {/* Question Banner */}
          <div style={{
            backgroundColor: 'rgba(255, 255, 255, 0.03)',
            border: '1px solid rgba(255, 255, 255, 0.08)',
            borderRadius: '12px',
            padding: '1rem',
            marginBottom: '1.25rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem'
          }}>
            <HelpCircle size={24} color="#06b6d4" />
            <div>
              <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>
                Decision Query
              </span>
              <h4 style={{ margin: 0, fontSize: '0.95rem', color: '#ffffff', fontFamily: 'Outfit' }}>
                Why did Civic Context Intelligence choose {responsibleAuthority || 'Municipality'}?
              </h4>
            </div>
          </div>

          {/* Override Alert Card if Triggered */}
          {overrideDetails && (
            <div style={{
              backgroundColor: 'rgba(245, 158, 11, 0.1)',
              border: '1px solid rgba(245, 158, 11, 0.4)',
              borderRadius: '12px',
              padding: '1rem',
              marginBottom: '1.25rem'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#f59e0b', fontSize: '0.85rem', fontWeight: 800, marginBottom: '0.5rem' }}>
                <AlertTriangle size={18} /> Intelligent AI Override Triggered
              </div>
              <div style={{ fontSize: '0.8rem', color: '#d1d5db', lineHeight: 1.5 }}>
                <div><strong style={{ color: '#ffffff' }}>Manual Mode Selected:</strong> {overrideDetails.manual_mode}</div>
                <div><strong style={{ color: '#ffffff' }}>Ownership Analysis:</strong> {overrideDetails.ownership_analysis}</div>
                <div><strong style={{ color: '#ffffff' }}>Detected Asset:</strong> {overrideDetails.detected_asset}</div>
                <div><strong style={{ color: '#ffffff' }}>Responsible Authority:</strong> {overrideDetails.responsible_authority}</div>
                <div><strong style={{ color: '#ffffff' }}>Reason:</strong> {overrideDetails.reason}</div>
                <div style={{ color: '#10b981', fontWeight: 700, marginTop: '0.3rem' }}>
                  👉 <strong>Suggested Override:</strong> {overrideDetails.suggested_override}
                </div>
              </div>
            </div>
          )}

          {/* Reasoning Synthesis */}
          <div style={{ marginBottom: '1.25rem' }}>
            <label style={{ fontSize: '0.75rem', color: '#10b981', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Autonomous Reasoning Synthesis
            </label>
            <p style={{
              margin: '0.4rem 0 0 0',
              fontSize: '0.88rem',
              color: '#d1d5db',
              lineHeight: 1.5,
              background: 'rgba(0, 0, 0, 0.3)',
              padding: '0.85rem',
              borderRadius: '8px',
              borderLeft: '3px solid #10b981'
            }}>
              {reasoning || "The Civic Context Intelligence Agent evaluated visual signatures, spatial boundary geocoding, and landmark keywords to determine jurisdiction."}
            </p>
          </div>

          {/* Visual Evidence Checklist */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.6rem' }}>
              <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase' }}>
                Verified Decision Criteria & Visual Evidence
              </label>
              <span style={{
                fontSize: '0.72rem',
                backgroundColor: 'rgba(16, 185, 129, 0.2)',
                color: '#10b981',
                border: '1px solid rgba(16, 185, 129, 0.4)',
                padding: '0.15rem 0.55rem',
                borderRadius: '4px',
                fontWeight: 800,
                fontFamily: 'monospace'
              }}>
                Confidence: {confidenceLevel}
              </span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              {checklist && checklist.length > 0 ? (
                checklist.map((item, idx) => (
                  <div key={idx} style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.65rem',
                    background: 'rgba(255, 255, 255, 0.02)',
                    border: '1px solid rgba(255, 255, 255, 0.06)',
                    padding: '0.6rem 0.85rem',
                    borderRadius: '8px',
                    fontSize: '0.85rem',
                    color: '#e2e8f0'
                  }}>
                    <CheckCircle2 size={16} color="#10b981" />
                    <span>{item}</span>
                  </div>
                ))
              ) : (
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.65rem',
                  background: 'rgba(255, 255, 255, 0.02)',
                  padding: '0.6rem 0.85rem',
                  borderRadius: '8px',
                  fontSize: '0.85rem',
                  color: '#e2e8f0'
                }}>
                  <CheckCircle2 size={16} color="#10b981" />
                  <span>Spatial GPS & Ward Boundary criteria matched</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div style={{
          padding: '1rem 1.5rem',
          borderTop: '1px solid rgba(255, 255, 255, 0.08)',
          backgroundColor: 'rgba(0, 0, 0, 0.3)',
          textAlign: 'right'
        }}>
          <button
            onClick={onClose}
            style={{
              background: 'linear-gradient(135deg, #10b981, #059669)',
              color: '#ffffff',
              border: 'none',
              padding: '0.5rem 1.25rem',
              borderRadius: '8px',
              fontWeight: 700,
              fontSize: '0.85rem',
              cursor: 'pointer'
            }}
          >
            Understand AI Decision
          </button>
        </div>
      </div>
    </div>
  );
}
