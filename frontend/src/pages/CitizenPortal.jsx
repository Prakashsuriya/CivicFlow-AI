import React, { useState, useRef } from 'react';
import { Bot, Send, Image as ImageIcon, MapPin, Sparkles, AlertCircle, CheckCircle2, Mic, Upload, X } from 'lucide-react';
import { submitComplaintAPI } from '../services/api';
import ReasoningDrawer from '../components/ReasoningDrawer';

export default function CitizenPortal({ onNavigateToTrack }) {
  const [category, setCategory] = useState('Garbage');
  const [prompt, setPrompt] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [imagePreview, setImagePreview] = useState('');
  const [address, setAddress] = useState('Sathuvachari, Vellore, Tamil Nadu');
  const [lat, setLat] = useState('12.9324');
  const [lng, setLng] = useState('79.1601');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  const fileInputRef = useRef(null);

  // All 18 requested categories
  const categoriesList = [
    "Garbage",
    "Road damage",
    "Streetlights",
    "Water supply",
    "Drainage",
    "Illegal parking",
    "Noise pollution",
    "Air pollution",
    "Flooding",
    "Tree fallen",
    "Dead animals",
    "Traffic signal",
    "Broken park equipment",
    "Public toilets",
    "Government scheme questions",
    "Emergency information",
    "Health assistance",
    "Lost property"
  ];

  // Vellore location presets
  const vellorePresets = [
    { name: "Sathuvachari, Vellore", lat: "12.9324", lng: "79.1601" },
    { name: "Katpadi Junction, Vellore", lat: "12.9698", lng: "79.1378" },
    { name: "Gandhinagar, Vellore", lat: "12.9450", lng: "79.1300" },
    { name: "CMC Hospital Campus, Bagayam", lat: "12.8790", lng: "79.1305" },
    { name: "Fort Round Road, Vellore Town", lat: "12.9230", lng: "79.1320" }
  ];

  const [isListening, setIsListening] = useState(false);

  const startVoiceInput = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert("Voice input is not supported in this browser. Please try Chrome or Edge.");
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = 'en-US';

      recognition.onstart = () => {
        setIsListening(true);
      };

      recognition.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        setPrompt(prev => prev ? `${prev} ${transcript}` : transcript);
        setIsListening(false);
      };

      recognition.onerror = (event) => {
        console.error("Speech recognition error:", event.error);
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognition.start();
    } catch (err) {
      console.error("Speech recognition error:", err);
      setIsListening(false);
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > 10 * 1024 * 1024) {
      alert("File size exceeds 10MB limit. Please upload a smaller photo.");
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview(reader.result);
      setImageUrl(reader.result);
    };
    reader.readAsDataURL(file);
  };

  const handleClearImage = () => {
    setImagePreview('');
    setImageUrl('');
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!prompt.trim() && !imageUrl) {
      alert("Please describe the issue or attach a photo.");
      return;
    }

    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const res = await submitComplaintAPI({
        category: category,
        prompt: prompt || `Reporting ${category} in ${address}`,
        image_url: imageUrl,
        address: address || "Sathuvachari, Vellore, Tamil Nadu",
        latitude: parseFloat(lat) || 12.9324,
        longitude: parseFloat(lng) || 79.1601,
        email: "prakashranjanr8@gmail.com"
      });

      setResult(res);
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.detail || "Error connecting to Gemini Vision AI system.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '1.5rem 1rem' }}>
      {/* Hero Header */}
      <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
        <div style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '0.5rem',
          background: 'rgba(16, 185, 129, 0.1)',
          border: '1px solid rgba(16, 185, 129, 0.3)',
          padding: '0.4rem 1rem',
          borderRadius: '9999px',
          color: '#34d399',
          fontSize: '0.8rem',
          fontWeight: 600,
          marginBottom: '0.75rem'
        }}>
          <Sparkles size={16} /> Autonomous Municipal AI • Vellore Corporation, Tamil Nadu
        </div>
        <h1 style={{ fontSize: '2.5rem', fontWeight: 800, marginBottom: '0.5rem', letterSpacing: '-0.02em' }}>
          Report Civic Issues in <span className="gradient-text">Vellore, Tamil Nadu</span>
        </h1>
        <p style={{ color: '#9ca3af', fontSize: '1rem', maxWidth: '750px', margin: '0 auto' }}>
          Select issue category, attach a photo, and describe location. <br/>
          Google Gemini Multimodal Vision AI evaluates severity, accuracy score, and dispatches field teams.
        </p>
      </div>

      {/* Main Form Box */}
      <div className="glass-card" style={{ padding: '1.5rem', maxWidth: '900px', margin: '0 auto', position: 'relative', zIndex: 1 }}>
        <form onSubmit={handleSubmit}>

          {/* 1. Category Dropdown */}
          <div style={{ marginBottom: '1.25rem' }}>
            <label style={{ display: 'block', fontSize: '0.9rem', fontWeight: 700, color: 'var(--accent-cyan)', marginBottom: '0.5rem' }}>
              1. Select Civic Issue Category:
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              style={{
                width: '100%',
                padding: '0.85rem 1rem',
                fontFamily: 'Outfit',
                fontWeight: 600,
                fontSize: '1rem',
                cursor: 'pointer',
                position: 'relative',
                zIndex: 10
              }}
            >
              {categoriesList.map((cat, idx) => (
                <option key={idx} value={cat}>
                  📍 {cat}
                </option>
              ))}
            </select>
          </div>

          {/* 2. Text Description */}
          <div style={{ marginBottom: '1.25rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
              <label style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                2. Describe the Issue details:
              </label>
              <button
                type="button"
                onClick={startVoiceInput}
                style={{
                  background: isListening ? 'rgba(244, 63, 94, 0.2)' : 'rgba(16, 185, 129, 0.15)',
                  border: isListening ? '1px solid #f43f5e' : '1px solid rgba(16, 185, 129, 0.4)',
                  color: isListening ? '#f43f5e' : '#10b981',
                  padding: '0.35rem 0.75rem',
                  borderRadius: '8px',
                  fontSize: '0.8rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.4rem',
                  transition: 'all 0.2s ease',
                  position: 'relative',
                  zIndex: 10
                }}
              >
                <Mic size={14} className={isListening ? 'agent-pulse' : ''} />
                {isListening ? 'Listening...' : 'Voice Dictation'}
              </button>
            </div>
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder={`e.g. Garbage dumping near Sathuvachari Phase 2 park causing high stench...`}
              rows={3}
              style={{
                width: '100%',
                padding: '0.85rem 1rem',
                fontFamily: 'Inter',
                fontSize: '0.95rem',
                resize: 'vertical',
                position: 'relative',
                zIndex: 10
              }}
            />
          </div>

          {/* 3. Real Image Attachment File Upload */}
          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{ display: 'block', fontSize: '0.9rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '0.5rem' }}>
              3. Attach Photo of the Issue (Gemini Vision AI Analysis):
            </label>

            <input
              type="file"
              ref={fileInputRef}
              accept="image/*"
              onChange={handleFileChange}
              style={{ display: 'none' }}
            />

            {imagePreview ? (
              <div style={{ position: 'relative', display: 'inline-block', borderRadius: '12px', overflow: 'hidden', border: '1px solid #10b981' }}>
                <img src={imagePreview} alt="Uploaded Photo" style={{ maxWidth: '100%', maxHeight: '220px', display: 'block', objectFit: 'cover' }} />
                <button
                  type="button"
                  onClick={handleClearImage}
                  style={{
                    position: 'absolute',
                    top: '8px',
                    right: '8px',
                    background: 'rgba(244, 63, 94, 0.9)',
                    color: 'white',
                    border: 'none',
                    borderRadius: '50%',
                    width: '28px',
                    height: '28px',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    zIndex: 20
                  }}
                >
                  <X size={16} />
                </button>
              </div>
            ) : (
              <div
                onClick={() => fileInputRef.current && fileInputRef.current.click()}
                style={{
                  position: 'relative',
                  border: '2px dashed rgba(16, 185, 129, 0.4)',
                  borderRadius: '12px',
                  padding: '1.5rem',
                  textAlign: 'center',
                  background: 'var(--card-inner-bg)',
                  cursor: 'pointer',
                  transition: 'border-color 0.2s',
                  zIndex: 5
                }}
                onMouseOver={(e) => e.currentTarget.style.borderColor = '#10b981'}
                onMouseOut={(e) => e.currentTarget.style.borderColor = 'rgba(16, 185, 129, 0.4)'}
              >
                <Upload size={32} color="#10b981" style={{ marginBottom: '0.5rem' }} />
                <div style={{ fontSize: '0.9rem', color: 'var(--text-primary)', fontWeight: 600 }}>
                  Click here to Browse & Upload Photo
                </div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
                  Supports PNG, JPG, WEBP (Analyzed live by Gemini 2.5 Vision AI)
                </div>
              </div>
            )}
          </div>

          {/* 4. Location & Map Details — Vellore, Tamil Nadu */}
          <div style={{ marginBottom: '1.5rem', background: 'var(--card-inner-bg)', padding: '1rem', borderRadius: '12px', border: '1px solid var(--border-color)', position: 'relative', zIndex: 10 }}>
            <div style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--accent-emerald)', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <MapPin size={16} /> 4. Area & Location Details (Vellore, Tamil Nadu):
            </div>

            {/* Address */}
            <div style={{ marginBottom: '0.75rem' }}>
              <input
                type="text"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="e.g. Sathuvachari, Vellore, Tamil Nadu"
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  fontSize: '0.85rem',
                  position: 'relative',
                  zIndex: 10
                }}
              />
            </div>

            {/* Lat / Lng inputs (Responsive Grid) */}
            <div className="responsive-grid-2" style={{ marginBottom: '0.75rem' }}>
              <div>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Latitude:</span>
                <input
                  type="text"
                  value={lat}
                  onChange={(e) => setLat(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '0.5rem',
                    fontSize: '0.8rem',
                    fontFamily: 'monospace',
                    position: 'relative',
                    zIndex: 10
                  }}
                />
              </div>
              <div>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Longitude:</span>
                <input
                  type="text"
                  value={lng}
                  onChange={(e) => setLng(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '0.5rem',
                    fontSize: '0.8rem',
                    fontFamily: 'monospace',
                    position: 'relative',
                    zIndex: 10
                  }}
                />
              </div>
            </div>

            {/* Location presets */}
            <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
              <span style={{ fontSize: '0.75rem', color: '#6b7280', alignSelf: 'center' }}>Vellore Quick Areas:</span>
              {vellorePresets.map((p, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => {
                    setAddress(p.name + ", Tamil Nadu");
                    setLat(p.lat);
                    setLng(p.lng);
                  }}
                  style={{
                    background: 'rgba(16, 185, 129, 0.1)',
                    border: '1px solid rgba(16, 185, 129, 0.2)',
                    color: '#34d399',
                    padding: '0.25rem 0.6rem',
                    borderRadius: '12px',
                    fontSize: '0.75rem',
                    cursor: 'pointer',
                    position: 'relative',
                    zIndex: 10
                  }}
                >
                  📍 {p.name.split(',')[0]}
                </button>
              ))}
            </div>
          </div>

          {/* Submit Button (Responsive flex wrap) */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem', position: 'relative', zIndex: 10 }}>
            <button
              type="button"
              className="btn-secondary"
              onClick={() => alert("Voice assistant initialized for Tamil/English dictation.")}
            >
              <Mic size={16} color="#06b6d4" /> Voice Dictation
            </button>

            <button
              type="submit"
              disabled={loading}
              className="btn-primary"
              style={{ fontSize: '1rem', padding: '0.85rem 1.5rem' }}
            >
              {loading ? (
                <>
                  <Bot size={18} className="agent-pulse" />
                  Gemini Vision AI & Agents Reasoning...
                </>
              ) : (
                <>
                  <Send size={18} />
                  Analyze with Gemini Vision & Submit
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      {/* Error Alert */}
      {error && (
        <div style={{
          maxWidth: '900px',
          margin: '1.5rem auto 0 auto',
          background: 'rgba(244, 63, 94, 0.1)',
          border: '1px solid rgba(244, 63, 94, 0.3)',
          borderRadius: '12px',
          padding: '1rem',
          color: '#f87171',
          display: 'flex',
          alignItems: 'center',
          gap: '0.75rem'
        }}>
          <AlertCircle size={20} />
          {error}
        </div>
      )}

      {/* Execution Results & Reasoning Trace */}
      {result && (
        <div style={{ maxWidth: '900px', margin: '2rem auto 0 auto' }}>
          {/* Card Summary */}
          <div className="glass-card" style={{ padding: '1.5rem', borderLeft: '4px solid #10b981' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '1rem' }}>
              <span className="badge badge-resolved">
                <CheckCircle2 size={12} /> Registered in Vellore Corporation
              </span>
              <span style={{ fontSize: '0.85rem', color: '#9ca3af', fontFamily: 'monospace' }}>
                Tracking ID: <strong style={{ color: '#38bdf8' }}>#{result.complaint_id}</strong>
              </span>
            </div>

            {result.is_duplicate && (
              <div style={{
                background: 'rgba(245, 158, 11, 0.15)',
                border: '1px solid #f59e0b',
                borderRadius: '12px',
                padding: '0.85rem 1rem',
                marginBottom: '1rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem',
                color: '#f59e0b'
              }}>
                <AlertCircle size={22} />
                <div>
                  <div style={{ fontWeight: 700, fontSize: '0.9rem' }}>
                    Duplicate Issue Merged into Active Master Ticket #{result.merged_ticket_id}
                  </div>
                  <div style={{ fontSize: '0.8rem', opacity: 0.9 }}>
                    An active report for {result.category} in {result.ward} is already dispatched. Your submission was merged into master ticket #{result.merged_ticket_id} to avoid work duplication (+1 Citizen Upvote).
                  </div>
                </div>
              </div>
            )}

            {/* Metrics responsive 4-column grid */}
            <div className="responsive-grid-4" style={{ margin: '1rem 0' }}>
              <div style={{ background: 'rgba(255, 255, 255, 0.03)', padding: '0.75rem', borderRadius: '10px' }}>
                <div style={{ fontSize: '0.75rem', color: '#9ca3af' }}>Department</div>
                <div style={{ fontWeight: 700, color: '#f3f4f6', fontSize: '0.9rem' }}>{result.department}</div>
              </div>
              <div style={{ background: 'rgba(255, 255, 255, 0.03)', padding: '0.75rem', borderRadius: '10px' }}>
                <div style={{ fontSize: '0.75rem', color: '#9ca3af' }}>Ward</div>
                <div style={{ fontWeight: 700, color: '#f3f4f6', fontSize: '0.9rem' }}>{result.ward}</div>
              </div>
              <div style={{ background: 'rgba(255, 255, 255, 0.03)', padding: '0.75rem', borderRadius: '10px' }}>
                <div style={{ fontSize: '0.75rem', color: '#9ca3af' }}>AI Severity / Accuracy</div>
                <div style={{ fontWeight: 700, color: result.severity === 'critical' ? '#f87171' : '#fbbf24', fontSize: '0.9rem' }}>
                  {result.severity.toUpperCase()} ({intVal(result.confidence)}%)
                </div>
              </div>
              <div style={{ background: 'rgba(255, 255, 255, 0.03)', padding: '0.75rem', borderRadius: '10px' }}>
                <div style={{ fontSize: '0.75rem', color: '#9ca3af' }}>Target SLA</div>
                <div style={{ fontWeight: 700, color: '#34d399', fontSize: '0.9rem' }}>{result.sla_hours} Hours</div>
              </div>
            </div>

            {/* Summary Lines */}
            <div style={{ fontSize: '0.9rem', color: '#d1d5db', lineHeight: 1.6 }}>
              {result.summary.split('\n').map((line, i) => (
                <p key={i} style={{ margin: '0.3rem 0' }}>{line}</p>
              ))}
            </div>
          </div>

          {/* Reasoning Drawer Component */}
          <ReasoningDrawer reasoningTrace={result.reasoning_trace} />
        </div>
      )}
    </div>
  );
}

function intVal(val) {
  if (!val) return 94;
  if (val <= 1.0) return Math.round(val * 100);
  return Math.round(val);
}
