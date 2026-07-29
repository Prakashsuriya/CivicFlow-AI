import React, { useState } from 'react';
import { Cpu, Eye, MapPin, BookOpen, GitFork, Database, Bell, BarChart2, ChevronDown, ChevronUp, CheckCircle2 } from 'lucide-react';

export default function ReasoningDrawer({ reasoningTrace }) {
  const [expandedIndex, setExpandedIndex] = useState(0);

  if (!reasoningTrace || reasoningTrace.length === 0) {
    return null;
  }

  const getAgentIcon = (agentName) => {
    if (agentName.includes("Vision")) return Eye;
    if (agentName.includes("Location")) return MapPin;
    if (agentName.includes("Knowledge")) return BookOpen;
    if (agentName.includes("Routing")) return GitFork;
    if (agentName.includes("Complaint")) return Database;
    if (agentName.includes("Notification")) return Bell;
    if (agentName.includes("Analytics")) return BarChart2;
    return Cpu;
  };

  return (
    <div className="glass-card" style={{ padding: '1.5rem', marginTop: '1.5rem', border: '1px solid rgba(16, 185, 129, 0.3)' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div style={{
            background: 'rgba(16, 185, 129, 0.15)',
            padding: '0.5rem',
            borderRadius: '10px',
            color: '#34d399'
          }}>
            <Cpu size={20} className="agent-pulse" />
          </div>
          <div>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, margin: 0 }}>
              Autonomous Agent Execution Trace
            </h3>
            <p style={{ fontSize: '0.8rem', color: '#9ca3af', margin: 0 }}>
              Google ADK Orchestration & Step-by-Step Tool Selection ({reasoningTrace.length} Steps)
            </p>
          </div>
        </div>
        <span className="badge badge-resolved">
          <CheckCircle2 size={12} /> Execution Complete
        </span>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
        {reasoningTrace.map((step, idx) => {
          const Icon = getAgentIcon(step.agent);
          const isExpanded = expandedIndex === idx;

          return (
            <div
              key={idx}
              style={{
                background: 'rgba(17, 24, 39, 0.6)',
                border: isExpanded ? '1px solid rgba(16, 185, 129, 0.4)' : '1px solid rgba(255, 255, 255, 0.05)',
                borderRadius: '12px',
                overflow: 'hidden',
                transition: 'all 0.2s ease'
              }}
            >
              {/* Header Header Bar */}
              <div
                onClick={() => setExpandedIndex(isExpanded ? -1 : idx)}
                style={{
                  padding: '0.85rem 1.25rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  cursor: 'pointer',
                  background: isExpanded ? 'rgba(16, 185, 129, 0.08)' : 'transparent'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <div style={{
                    background: 'rgba(255, 255, 255, 0.05)',
                    padding: '0.4rem',
                    borderRadius: '8px',
                    color: '#38bdf8'
                  }}>
                    <Icon size={16} />
                  </div>
                  <div>
                    <span style={{ fontSize: '0.75rem', color: '#10b981', fontWeight: 700, marginRight: '0.5rem' }}>
                      {step.step}
                    </span>
                    <span style={{ fontSize: '0.9rem', fontWeight: 600, color: '#f3f4f6' }}>
                      {step.agent}
                    </span>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <span style={{ fontSize: '0.75rem', color: '#6b7280', fontFamily: 'monospace' }}>
                    +{step.timestamp}s
                  </span>
                  {isExpanded ? <ChevronUp size={16} color="#9ca3af" /> : <ChevronDown size={16} color="#9ca3af" />}
                </div>
              </div>

              {/* Accordion Detail Body */}
              {isExpanded && (
                <div style={{ padding: '1rem 1.25rem', borderTop: '1px solid rgba(255, 255, 255, 0.05)', fontSize: '0.85rem' }}>
                  <div style={{ marginBottom: '0.5rem' }}>
                    <span style={{ color: '#9ca3af', fontWeight: 600 }}>Thought Process: </span>
                    <span style={{ color: '#d1d5db' }}>{step.thought}</span>
                  </div>
                  <div style={{ marginBottom: '0.75rem' }}>
                    <span style={{ color: '#9ca3af', fontWeight: 600 }}>Action Executed: </span>
                    <span style={{ color: '#34d399', fontFamily: 'monospace' }}>{step.action}</span>
                  </div>

                  <div style={{
                    background: 'rgba(0, 0, 0, 0.4)',
                    padding: '0.75rem',
                    borderRadius: '8px',
                    fontFamily: 'monospace',
                    fontSize: '0.75rem',
                    color: '#94a3b8',
                    overflowX: 'auto'
                  }}>
                    {typeof step.result === 'object' 
                      ? JSON.stringify(step.result, null, 2)
                      : String(step.result)
                    }
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
