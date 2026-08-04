import React, { useState, useRef } from 'react';
import { Bot, Send, MapPin, Sparkles, CheckCircle2, Upload, X, ShieldCheck, Cpu, AlertTriangle, ArrowRight, Camera, RefreshCw, HelpCircle, Building, Home, Compass } from 'lucide-react';
import { submitComplaintAPI } from '../services/api';
import AIDecisionTrace from '../components/AIDecisionTrace';
import ExplainabilityPanel from '../components/ExplainabilityPanel';

export default function CitizenPortal({ onNavigateToTrack, operatingMode = "auto_detect" }) {
  const [selectedScenario, setSelectedScenario] = useState('');
  const [isOtherScenario, setIsOtherScenario] = useState(false);

  const [prompt, setPrompt] = useState('');
  const [category, setCategory] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [imagePreview, setImagePreview] = useState('');

  // Location fields for Municipality
  const [address, setAddress] = useState('Katpadi Main Road, Katpadi, Vellore, Tamil Nadu');
  const [lat, setLat] = useState('12.9698');
  const [lng, setLng] = useState('79.1378');

  // Location fields for Residential Communities
  const [buildingName, setBuildingName] = useState('Greenwood Heights Block A');
  const [floorNumber, setFloorNumber] = useState('Floor 1');
  const [roomNumber, setRoomNumber] = useState('Flat 20');
  const [extraDetails, setExtraDetails] = useState('');

  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  const [traceOpen, setTraceOpen] = useState(false);
  const [explainOpen, setExplainOpen] = useState(false);

  // WebRTC Camera Modal State
  const [cameraModalOpen, setCameraModalOpen] = useState(false);
  const [cameraError, setCameraError] = useState(null);
  const videoRef = useRef(null);
  const streamRef = useRef(null);

  const fileInputRef = useRef(null);

  // Expanded Dropdown Scenario Lists per Mode (Requirement 2 & 4)
  const scenariosByMode = {
    public_infrastructure: [
      {
        id: "muni_1",
        label: "Garbage Overflow near Gandhi Market",
        prompt: "Massive garbage heap overflowing near Gandhi Market causing severe stench on the main road.",
        category: "Garbage",
        image: "https://images.unsplash.com/photo-1530587191325-3db32d826c18",
        address: "Gandhi Market, Katpadi Main Road, Katpadi, Vellore",
        lat: "12.9698", lng: "79.1378"
      },
      {
        id: "muni_2",
        label: "Deep Pothole on Katpadi Main Road",
        prompt: "Dangerous 8-inch deep asphalt pothole near Katpadi Flyover causing traffic bottleneck.",
        category: "Road damage",
        image: "https://images.unsplash.com/photo-1515162816999-a0c47dc192f7",
        address: "Katpadi Flyover Junction, Katpadi, Vellore",
        lat: "12.9698", lng: "79.1378"
      },
      {
        id: "muni_3",
        label: "Streetlight Grid Failure at Sathuvachari",
        prompt: "12 consecutive streetlights dark on Sathuvachari Phase 2 main arterial road.",
        category: "Streetlights",
        image: "https://images.unsplash.com/photo-1509114397022-ed747cca3f65",
        address: "Sathuvachari Phase 2 Arterial Road, Vellore",
        lat: "12.9324", lng: "79.1601"
      },
      {
        id: "muni_4",
        label: "Stormwater Drain Clogged near CMC Hospital",
        prompt: "Monsoon stormwater drain blocked with plastic debris gushing water onto Bagayam road.",
        category: "Drainage",
        image: "https://images.unsplash.com/photo-1541888946425-d0fbb186c5f3",
        address: "Bagayam Road near CMC College Gate, Vellore",
        lat: "12.8790", lng: "79.1305"
      },
      {
        id: "muni_5",
        label: "Illegal Commercial Dumping at Railway Junction",
        prompt: "Unclassified industrial waste dumping near Katpadi Railway Junction approach ramp.",
        category: "Garbage",
        image: "https://images.unsplash.com/photo-1605600659873-d808a13e4d2a",
        address: "Katpadi Railway Junction Ramp, Katpadi, Vellore",
        lat: "12.9698", lng: "79.1378"
      },
      {
        id: "muni_6",
        label: "Fallen Tree Blocking Road near Fort Round",
        prompt: "Large banyan tree branch collapsed blocking vehicular lane at Fort Round road.",
        category: "Tree fallen",
        image: "https://images.unsplash.com/photo-1542601906990-b4d3fb778b09",
        address: "Fort Round Approach Road, Vellore Town",
        lat: "12.9165", lng: "79.1325"
      },
      {
        id: "muni_7",
        label: "Public Water Tank Pipe Leakage",
        prompt: "Municipal overhead reservoir distribution valve leaking clean water into street.",
        category: "Water supply",
        image: "https://images.unsplash.com/photo-1585704032915-c3400ca199e7",
        address: "Gandhinagar Main Tank Premises, Ward 3, Vellore",
        lat: "12.9450", lng: "79.1450"
      },
      {
        id: "muni_8",
        label: "Traffic Signal Malfunction at Chittoor Bus Stand",
        prompt: "Traffic light control cabinet flickering red/green simultaneously creating intersection hazard.",
        category: "Traffic signal",
        image: "https://images.unsplash.com/photo-1508873696983-2df515122519",
        address: "Chittoor Bus Stand Intersection, Katpadi, Vellore",
        lat: "12.9698", lng: "79.1378"
      },
      { id: "other", label: "Other (Type Custom Issue...)" }
    ],

    residential_community: [
      {
        id: "res_1",
        label: "Elevator Stuck in Block A Shaft",
        prompt: "Elevator in Tower A, Greenwood Heights stuck between 3rd and 4th floors with strange grinding noise.",
        category: "Lift / Elevator",
        image: "https://images.unsplash.com/photo-1581092160607-ee22621dd758",
        building: "Greenwood Heights Block A",
        floor: "Floor 4",
        room: "Flat 402",
        extra: "Stuck between 3rd and 4th floor elevator shaft"
      },
      {
        id: "res_2",
        label: "Corridor Water Leakage on 3rd Floor",
        prompt: "High pressure potable water pipe burst flooding 3rd floor resident hallway.",
        category: "Water supply",
        image: "https://images.unsplash.com/photo-1585704032915-c3400ca199e7",
        building: "Orchid Heights Tower B",
        floor: "Floor 3",
        room: "Flat 305",
        extra: "Main utility riser pipe behind stairwell B"
      },
      {
        id: "res_3",
        label: "Intercom / Access Control Offline at Gate 1",
        prompt: "Main gate RFID vehicle boom barrier and visitor intercom offline.",
        category: "Electrical Transformer",
        image: "https://images.unsplash.com/photo-1558002038-1055907df827",
        building: "Vellore Palm Meadows Gate 1",
        floor: "Ground Floor",
        room: "Security Cabin 1",
        extra: "Main entrance gate access control panel"
      },
      {
        id: "res_4",
        label: "Clubhouse Power Outage & Circuit Trip",
        prompt: "Tripped 3-phase circuit breaker causing complete blackout in community clubhouse.",
        category: "Electrical Transformer",
        image: "https://images.unsplash.com/photo-1473341304170-971dccb5ac1e",
        building: "Greenwood Heights Clubhouse",
        floor: "Ground Floor",
        room: "Main Switch Room",
        extra: "Panel B 3-phase main circuit breaker"
      },
      {
        id: "res_5",
        label: "Garbage Overflow in Apartment Service Area",
        prompt: "Solid waste bins overflowing in Block A service duct corridor causing foul odor.",
        category: "Garbage",
        image: "https://images.unsplash.com/photo-1530587191325-3db32d826c18",
        building: "Greenwood Heights Block A",
        floor: "Floor 1",
        room: "Flat 20",
        extra: "Service elevator refuse collection area"
      },
      {
        id: "res_6",
        label: "Basement Parking Water Seepage",
        prompt: "Underground basement parking B2 wall seepage near pillars 14-16.",
        category: "Drainage",
        image: "https://images.unsplash.com/photo-1541888946425-d0fbb186c5f3",
        building: "Orchid Heights Basement B2",
        floor: "Basement B2",
        room: "Parking Bay 14",
        extra: "Retaining wall drainage sumps"
      },
      {
        id: "res_7",
        label: "CCTV Security Camera Offline in Block B",
        prompt: "4 corridor surveillance cameras un-powered after thunderstorm.",
        category: "Electrical Transformer",
        image: "https://images.unsplash.com/photo-1558002038-1055907df827",
        building: "Greenwood Heights Block B",
        floor: "Floor 2",
        room: "NVR Rack B",
        extra: "2nd floor corridor CCTV junction box"
      },
      {
        id: "res_8",
        label: "Swimming Pool Filtration System Failure",
        prompt: "Main recirculation pump emitting high pitched squeal and failing to filter pool.",
        category: "Water supply",
        image: "https://images.unsplash.com/photo-1585704032915-c3400ca199e7",
        building: "Greenwood Heights Amenity Deck",
        floor: "Podium Level",
        room: "Pump Room 1",
        extra: "Sand filter pressure vessel #2"
      },
      { id: "other", label: "Other (Type Custom Issue...)" }
    ],

    auto_detect: [
      {
        id: "auto_1",
        label: "Scenario 1: Public Garbage (Municipality)",
        prompt: "Massive garbage heap overflowing near Gandhi Market causing severe stench on the main road.",
        category: "Garbage",
        image: "https://images.unsplash.com/photo-1530587191325-3db32d826c18",
        address: "Gandhi Market, Katpadi Main Road, Katpadi, Vellore"
      },
      {
        id: "auto_2",
        label: "Scenario 2: Elevator Failure (Residential)",
        prompt: "Elevator in Tower A, Greenwood Heights stuck between 3rd and 4th floors with strange grinding noise.",
        category: "Lift / Elevator",
        image: "https://images.unsplash.com/photo-1581092160607-ee22621dd758",
        address: "Greenwood Heights Gated Society, Block A, Katpadi, Vellore"
      },
      {
        id: "auto_3",
        label: "Scenario 3: Transformer Sparking (Utility)",
        prompt: "High voltage power transformer near Katpadi Junction is sparking heavily and emitting black smoke outside campus gate.",
        category: "Electrical Transformer",
        image: "https://images.unsplash.com/photo-1473341304170-971dccb5ac1e",
        address: "Katpadi Junction Approach Road, Katpadi, Vellore"
      },
      {
        id: "auto_4",
        label: "Scenario 4: Main Water Pipeline Burst (Utility)",
        prompt: "State TWAD bulk water main distribution conduit burst gushing water onto Bagayam road.",
        category: "Water supply",
        image: "https://images.unsplash.com/photo-1585704032915-c3400ca199e7",
        address: "Bagayam Road, Near CMC College Campus, Vellore"
      },
      {
        id: "auto_5",
        label: "Scenario 5: High Voltage Overhead Cable Sagging",
        prompt: "TANGEDCO 11kV distribution line hanging dangerously low over market street.",
        category: "Electrical Transformer",
        image: "https://images.unsplash.com/photo-1473341304170-971dccb5ac1e",
        address: "Sathuvachari Market Street, Ward 2, Vellore"
      },
      {
        id: "auto_6",
        label: "Scenario 6: Corridor Water Leakage in Apartment",
        prompt: "High pressure potable water pipe burst flooding 3rd floor resident hallway.",
        category: "Water supply",
        image: "https://images.unsplash.com/photo-1585704032915-c3400ca199e7",
        address: "Orchid Heights Tower B, Floor 3, Flat 305, Katpadi"
      },
      { id: "other", label: "Other (Type Custom Issue...)" }
    ]
  };

  const currentScenarios = scenariosByMode[operatingMode] || scenariosByMode.auto_detect;

  const handleScenarioSelect = (scId) => {
    setSelectedScenario(scId);
    if (scId === 'other') {
      setIsOtherScenario(true);
      setPrompt('');
      setCategory('');
      setResult(null);
      setError(null);
      return;
    }

    setIsOtherScenario(false);
    const item = currentScenarios.find(s => s.id === scId);
    if (!item) return;

    setPrompt(item.prompt);
    setCategory(item.category);
    setImageUrl(item.image);
    setImagePreview(item.image);

    if (item.address) setAddress(item.address);
    if (item.lat) setLat(item.lat);
    if (item.lng) setLng(item.lng);

    if (item.building) setBuildingName(item.building);
    if (item.floor) setFloorNumber(item.floor);
    if (item.room) setRoomNumber(item.room);
    if (item.extra) setExtraDetails(item.extra);

    setResult(null);
    setError(null);
  };

  // WebRTC Camera Handler
  const openCamera = async () => {
    setCameraError(null);
    setCameraModalOpen(true);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment', width: { ideal: 1280 }, height: { ideal: 720 } }
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (err) {
      console.error("Camera access error:", err);
      setCameraError("Camera access denied or unavailable. Please upload a file instead.");
    }
  };

  const capturePhoto = () => {
    if (!videoRef.current) return;
    const canvas = document.createElement('canvas');
    canvas.width = videoRef.current.videoWidth || 640;
    canvas.height = videoRef.current.videoHeight || 480;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
    const dataUrl = canvas.toDataURL('image/jpeg');

    setImagePreview(dataUrl);
    setImageUrl(dataUrl);
    closeCamera();
  };

  const closeCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    setCameraModalOpen(false);
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > 10 * 1024 * 1024) {
      alert("File size exceeds 10MB limit.");
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview(reader.result);
      setImageUrl(reader.result);
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Enforce Mandatory Photo Evidence
    if (!imagePreview && !imageUrl) {
      setError("❌ Photo Evidence is mandatory for Google Gemini Multimodal Vision inspection. Please upload or capture a photo.");
      return;
    }

    // Enforce Mode-Specific Mandatory Fields
    if (operatingMode === "public_infrastructure") {
      if (!address.trim()) {
        setError("❌ Street Address is mandatory for Municipal routing.");
        return;
      }
    } else if (operatingMode === "residential_community") {
      if (!buildingName.trim() || !floorNumber.trim() || !roomNumber.trim()) {
        setError("❌ Building Name, Floor Number, and House/Room Number are MANDATORY for Residential Society routing.");
        return;
      }
    }

    setLoading(true);
    setError(null);
    setResult(null);

    // Sanitize Lat/Lng to ensure they are valid floats (Prevents 500 error!)
    const cleanLat = lat && !isNaN(parseFloat(lat)) ? parseFloat(lat) : 12.9698;
    const cleanLng = lng && !isNaN(parseFloat(lng)) ? parseFloat(lng) : 79.1378;

    // Build final combined address string
    let finalAddress = address;
    if (operatingMode === "residential_community") {
      finalAddress = `${buildingName}, ${floorNumber}, ${roomNumber}${extraDetails ? ` (${extraDetails})` : ''}, Katpadi, Vellore`;
    }

    try {
      const payload = {
        prompt: prompt || `Reported ${category || 'infrastructure'} issue`,
        category: category || undefined,
        image_url: imageUrl || undefined,
        address: finalAddress,
        latitude: cleanLat,
        longitude: cleanLng,
        email: "judge@hackathon2026.gov",
        operating_mode: operatingMode || "auto_detect"
      };

      const data = await submitComplaintAPI(payload);
      setResult(data);
    } catch (err) {
      console.error(err);
      setError(err.message || "Failed to dispatch incident. Please check server connection.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: '1240px', margin: '0 auto', padding: '2rem 1rem' }}>
      {/* Top Banner Header */}
      <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
        <div style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '0.5rem',
          backgroundColor: 'rgba(16, 185, 129, 0.1)',
          border: '1px solid rgba(16, 185, 129, 0.3)',
          padding: '0.4rem 1rem',
          borderRadius: '9999px',
          color: '#10b981',
          fontSize: '0.8rem',
          fontWeight: 800,
          marginBottom: '1rem'
        }}>
          <Sparkles size={16} /> Autonomous Infrastructure AI Operating System
        </div>

        <h1 style={{ fontSize: '2.4rem', fontWeight: 800, color: 'var(--text-primary)', fontFamily: 'Outfit', margin: '0 0 0.5rem 0' }}>
          Smart Infrastructure Incident Dispatcher
        </h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '1rem', maxWidth: '780px', margin: '0 auto' }}>
          Powered by 8 specialized AI agents (Gemini Vision, Spatial Geocoder, Civic Ownership Intelligence, ChromaDB RAG, SLA Router, and Asset Digital Twin).
        </p>
      </div>

      {/* Mode-Specific Issue Scenarios Dropdown (Requirement 2 & 4) */}
      <div style={{
        backgroundColor: 'rgba(255, 255, 255, 0.02)',
        border: '1px solid rgba(16, 185, 129, 0.3)',
        borderRadius: '16px',
        padding: '1.25rem 1.5rem',
        marginBottom: '2rem',
        background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.08) 0%, rgba(6, 182, 212, 0.04) 100%)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem', flexWrap: 'wrap', gap: '0.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#10b981', fontWeight: 800, fontSize: '0.92rem' }}>
            <Compass size={18} /> Select Pre-Defined Issue Scenario for Mode: <span style={{ color: '#ffffff', textTransform: 'uppercase' }}>{operatingMode.replace('_', ' ')}</span>
          </div>

          <span style={{ fontSize: '0.72rem', backgroundColor: 'rgba(16, 185, 129, 0.2)', color: '#10b981', padding: '0.2rem 0.65rem', borderRadius: '9999px', fontWeight: 800 }}>
            ⚡ Auto-Fills Vision & Telemetry ({currentScenarios.length} Options Available)
          </span>
        </div>

        <select
          value={selectedScenario}
          onChange={(e) => handleScenarioSelect(e.target.value)}
          style={{
            width: '100%',
            padding: '0.75rem 1rem',
            borderRadius: '10px',
            fontSize: '0.9rem',
            fontWeight: 700,
            cursor: 'pointer'
          }}
        >
          <option value="">-- Choose an Infrastructure Scenario Dropdown Option --</option>
          {currentScenarios.map(sc => (
            <option key={sc.id} value={sc.id}>
              {sc.label}
            </option>
          ))}
        </select>
      </div>

      {/* Main Incident Dispatch Form */}
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        <div className="glass-card" style={{ padding: '2rem' }}>
          
          {/* Issue Description Textbox */}
          <div style={{ marginBottom: '1.75rem' }}>
            <label style={{ display: 'block', fontWeight: 800, fontSize: '0.95rem', color: 'var(--text-primary)', marginBottom: '0.5rem' }}>
              Describe the Infrastructure Issue {isOtherScenario && <span style={{ color: '#10b981' }}>(Custom Option Selected)</span>}
            </label>
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="e.g. Electrical Transformer Sparking outside Katpadi Junction, or Garbage overflow in the Apartment area..."
              rows={3}
              style={{
                width: '100%',
                padding: '0.85rem 1rem',
                borderRadius: '10px',
                fontSize: '0.92rem',
                lineHeight: 1.5,
                outline: 'none'
              }}
            />
          </div>

          {/* Photo Evidence & Location Details Grid */}
          <div style={{ gridTemplateColumns: '1fr 1fr', gap: '1.5rem', display: 'grid', marginBottom: '1.75rem' }}>
            
            {/* Photo Evidence Area */}
            <div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                <label style={{ fontWeight: 800, fontSize: '0.9rem', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <Upload size={16} color="#10b981" /> Photo Evidence (Multimodal Vision) <span style={{ color: '#ef4444' }}>*Mandatory</span>
                </label>

                {/* Camera Capture Button */}
                <button
                  type="button"
                  onClick={openCamera}
                  style={{
                    background: 'linear-gradient(135deg, #06b6d4, #0284c7)',
                    color: '#ffffff',
                    border: 'none',
                    padding: '0.3rem 0.65rem',
                    borderRadius: '6px',
                    fontSize: '0.75rem',
                    fontWeight: 800,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.3rem'
                  }}
                >
                  <Camera size={14} /> Take Photo with Camera
                </button>
              </div>

              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                accept="image/*"
                capture="environment"
                style={{ display: 'none' }}
              />

              {imagePreview ? (
                <div style={{ position: 'relative', borderRadius: '12px', overflow: 'hidden', height: '160px', border: '1px solid rgba(16, 185, 129, 0.4)' }}>
                  <img src={imagePreview} alt="Evidence" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  <button
                    type="button"
                    onClick={() => { setImagePreview(''); setImageUrl(''); }}
                    style={{
                      position: 'absolute',
                      top: '8px',
                      right: '8px',
                      backgroundColor: 'rgba(0, 0, 0, 0.7)',
                      color: '#ffffff',
                      border: 'none',
                      borderRadius: '50%',
                      width: '26px',
                      height: '26px',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}
                  >
                    <X size={14} />
                  </button>
                </div>
              ) : (
                <div
                  onClick={() => fileInputRef.current?.click()}
                  style={{
                    border: '2px dashed rgba(16, 185, 129, 0.4)',
                    borderRadius: '12px',
                    height: '160px',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    backgroundColor: 'rgba(0, 0, 0, 0.2)',
                    transition: 'all 0.2s ease'
                  }}
                >
                  <Upload size={28} color="#10b981" />
                  <span style={{ fontSize: '0.85rem', color: '#ffffff', fontWeight: 700, marginTop: '0.5rem' }}>
                    Click to upload photo or drag & drop
                  </span>
                  <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                    PNG, JPG, WEBP up to 10MB
                  </span>
                </div>
              )}
            </div>

            {/* Mode-Specific Location Inputs */}
            <div>
              <label style={{ display: 'block', fontWeight: 800, fontSize: '0.9rem', color: 'var(--text-primary)', marginBottom: '0.5rem' }}>
                📍 Incident Location Details ({operatingMode === 'residential_community' ? 'Residential Society' : 'Municipality / Public'})
              </label>

              {operatingMode === 'residential_community' ? (
                /* Residential Society Mandatory Fields */
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
                  <div>
                    <label style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 700 }}>BUILDING / TOWER NAME *</label>
                    <input
                      type="text"
                      value={buildingName}
                      onChange={(e) => setBuildingName(e.target.value)}
                      placeholder="e.g. Greenwood Heights Block A"
                      style={{ width: '100%', padding: '0.5rem 0.75rem', borderRadius: '6px', fontSize: '0.85rem' }}
                    />
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
                    <div>
                      <label style={{ fontSize: '0.72rem', color: '#ef4444', fontWeight: 800 }}>FLOOR NUMBER (MANDATORY) *</label>
                      <input
                        type="text"
                        value={floorNumber}
                        onChange={(e) => setFloorNumber(e.target.value)}
                        placeholder="e.g. Floor 1"
                        style={{ width: '100%', padding: '0.5rem 0.75rem', borderRadius: '6px', fontSize: '0.85rem', border: '1px solid rgba(239, 68, 68, 0.4)' }}
                      />
                    </div>

                    <div>
                      <label style={{ fontSize: '0.72rem', color: '#ef4444', fontWeight: 800 }}>HOUSE / FLAT NUMBER (MANDATORY) *</label>
                      <input
                        type="text"
                        value={roomNumber}
                        onChange={(e) => setRoomNumber(e.target.value)}
                        placeholder="e.g. Flat 20"
                        style={{ width: '100%', padding: '0.5rem 0.75rem', borderRadius: '6px', fontSize: '0.85rem', border: '1px solid rgba(239, 68, 68, 0.4)' }}
                      />
                    </div>
                  </div>

                  <div>
                    <label style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 700 }}>EXTRA PLACE DETAILS (OPTIONAL)</label>
                    <input
                      type="text"
                      value={extraDetails}
                      onChange={(e) => setExtraDetails(e.target.value)}
                      placeholder="e.g. Service refuse chute area"
                      style={{ width: '100%', padding: '0.5rem 0.75rem', borderRadius: '6px', fontSize: '0.85rem' }}
                    />
                  </div>
                </div>
              ) : (
                /* Municipal Mode Address + Lat/Lng Fields */
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
                  <div>
                    <label style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 700 }}>STREET ADDRESS *</label>
                    <input
                      type="text"
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      placeholder="e.g. Katpadi Main Road, Katpadi, Vellore"
                      style={{ width: '100%', padding: '0.5rem 0.75rem', borderRadius: '6px', fontSize: '0.85rem' }}
                    />
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
                    <div>
                      <label style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 700 }}>LATITUDE *</label>
                      <input
                        type="text"
                        value={lat}
                        onChange={(e) => setLat(e.target.value)}
                        placeholder="12.9698"
                        style={{ width: '100%', padding: '0.5rem 0.75rem', borderRadius: '6px', fontSize: '0.85rem' }}
                      />
                    </div>

                    <div>
                      <label style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 700 }}>LONGITUDE *</label>
                      <input
                        type="text"
                        value={lng}
                        onChange={(e) => setLng(e.target.value)}
                        placeholder="79.1378"
                        style={{ width: '100%', padding: '0.5rem 0.75rem', borderRadius: '6px', fontSize: '0.85rem' }}
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Validation Error Alert */}
          {error && (
            <div style={{
              backgroundColor: 'rgba(239, 68, 68, 0.15)',
              border: '1px solid rgba(239, 68, 68, 0.4)',
              borderRadius: '10px',
              padding: '0.85rem 1rem',
              color: '#ef4444',
              fontWeight: 700,
              fontSize: '0.88rem',
              marginBottom: '1rem'
            }}>
              {error}
            </div>
          )}

          {/* Submit Action Button */}
          <button
            type="submit"
            disabled={loading}
            style={{
              width: '100%',
              background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
              color: '#ffffff',
              border: 'none',
              padding: '0.9rem',
              borderRadius: '12px',
              fontWeight: 800,
              fontSize: '1rem',
              fontFamily: 'Outfit',
              cursor: loading ? 'not-allowed' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.5rem',
              boxShadow: '0 6px 20px rgba(16, 185, 129, 0.35)',
              transition: 'all 0.2s ease'
            }}
          >
            {loading ? (
              <> <RefreshCw className="animate-spin" size={18} /> Executing 8-Agent Autonomous Pipeline... </>
            ) : (
              <> <Send size={18} /> Dispatch Incident to Multi-Agent Platform </>
            )}
          </button>
        </div>
      </form>

      {/* Dispatched Incident Output Drawer */}
      {result && (
        <div style={{ marginTop: '2rem', animation: 'fadeInUp 0.3s ease-out' }}>
          
          {/* Smart AI Ownership Alert */}
          {result.override_detected && (
            <div style={{
              backgroundColor: 'rgba(245, 158, 11, 0.15)',
              border: '1px solid rgba(245, 158, 11, 0.4)',
              borderRadius: '14px',
              padding: '1.25rem',
              marginBottom: '1.5rem',
              color: '#fbbf24'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 800, fontSize: '1rem', marginBottom: '0.3rem' }}>
                <AlertTriangle size={20} /> Intelligent AI Ownership Override Alert
              </div>
              <p style={{ margin: '0 0 0.5rem 0', fontSize: '0.88rem', color: '#fef3c7', lineHeight: 1.4 }}>
                {result.override_details?.reason || "Public utility electricity infrastructure detected outside gated community boundary."}
              </p>
              <div style={{ fontSize: '0.8rem', fontWeight: 800, color: '#ffffff', backgroundColor: 'rgba(0,0,0,0.3)', padding: '0.5rem', borderRadius: '6px' }}>
                👉 Suggested Override: {result.suggested_override || "Switch routing to Utility Provider."}
              </div>
            </div>
          )}

          {/* Success Summary Header Card */}
          <div style={{
            background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.15) 0%, rgba(6, 182, 212, 0.08) 100%)',
            border: '1px solid rgba(16, 185, 129, 0.4)',
            borderRadius: '16px',
            padding: '1.5rem',
            marginBottom: '1.5rem'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem', marginBottom: '1rem' }}>
              <div>
                <span style={{ fontSize: '0.72rem', color: '#10b981', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  Incident Registered & Dispatched
                </span>
                <h2 style={{ margin: '0.2rem 0 0 0', fontSize: '1.5rem', color: '#ffffff', fontFamily: 'Outfit', fontWeight: 800 }}>
                  Ticket #{result.complaint_id}
                </h2>
              </div>

              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <button
                  onClick={() => setTraceOpen(true)}
                  style={{
                    background: 'rgba(16, 185, 129, 0.2)',
                    border: '1px solid rgba(16, 185, 129, 0.4)',
                    color: '#10b981',
                    padding: '0.45rem 0.85rem',
                    borderRadius: '8px',
                    fontWeight: 800,
                    fontSize: '0.8rem',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.3rem'
                  }}
                >
                  <Cpu size={14} /> View 10-Step AI Decision Trace
                </button>

                {onNavigateToTrack && (
                  <button
                    onClick={() => onNavigateToTrack(result.complaint_id)}
                    style={{
                      background: 'linear-gradient(135deg, #10b981, #059669)',
                      color: '#ffffff',
                      border: 'none',
                      padding: '0.45rem 0.85rem',
                      borderRadius: '8px',
                      fontWeight: 800,
                      fontSize: '0.8rem',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.3rem'
                    }}
                  >
                    Track Incident Lifecycle <ArrowRight size={14} />
                  </button>
                )}
              </div>
            </div>

            <div style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem', display: 'grid', marginBottom: '1rem' }}>
              <div>
                <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase' }}>RESPONSIBLE AUTHORITY</div>
                <div style={{ fontSize: '1rem', fontWeight: 800, color: '#10b981', marginTop: '0.2rem' }}>
                  {result.responsible_authority}
                </div>
              </div>

              <div>
                <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase' }}>ASSIGNED DEPARTMENT</div>
                <div style={{ fontSize: '0.95rem', fontWeight: 800, color: '#ffffff', marginTop: '0.2rem' }}>
                  {result.department} ({result.sla_hours} hrs Target)
                </div>
              </div>

              {result.asset && (
                <div>
                  <div style={{ fontSize: '0.7rem', color: '#8b5cf6', fontWeight: 700, textTransform: 'uppercase' }}>LINKED DIGITAL TWIN ASSET</div>
                  <div style={{ fontSize: '0.95rem', fontWeight: 800, color: '#ffffff', marginTop: '0.2rem' }}>
                    {result.asset.asset_name} ({result.asset.health_score}% Health)
                  </div>
                </div>
              )}
            </div>

            <p style={{ margin: 0, fontSize: '0.88rem', color: '#d1d5db', lineHeight: 1.5 }}>
              <strong style={{ color: '#10b981' }}>AI Ownership Rationale:</strong> {result.ownership_reasoning}
            </p>
          </div>
        </div>
      )}

      {/* WebRTC Live Camera Capture Modal */}
      {cameraModalOpen && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.85)',
          backdropFilter: 'blur(10px)',
          zIndex: 3000,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '1rem'
        }}>
          <div style={{
            width: '100%', maxWidth: '640px',
            backgroundColor: '#0f172a',
            border: '1px solid rgba(16, 185, 129, 0.4)',
            borderRadius: '16px',
            padding: '1.5rem'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#10b981', fontWeight: 800, fontSize: '1.1rem' }}>
                <Camera size={20} /> Live Camera Photo Capture
              </div>
              <button onClick={closeCamera} style={{ background: 'none', border: 'none', color: '#ffffff', cursor: 'pointer' }}>
                <X size={20} />
              </button>
            </div>

            {cameraError ? (
              <div style={{ padding: '2rem', textAlign: 'center', color: '#ef4444', fontWeight: 700 }}>
                {cameraError}
              </div>
            ) : (
              <div style={{ position: 'relative', borderRadius: '12px', overflow: 'hidden', backgroundColor: '#000000', marginBottom: '1.25rem' }}>
                <video ref={videoRef} autoPlay playsInline style={{ width: '100%', maxHeight: '400px', objectFit: 'cover' }} />
              </div>
            )}

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
              <button
                onClick={closeCamera}
                style={{
                  background: 'rgba(255, 255, 255, 0.05)',
                  border: '1px solid var(--border-color)',
                  color: 'var(--text-secondary)',
                  padding: '0.6rem 1rem',
                  borderRadius: '8px',
                  fontWeight: 600
                }}
              >
                Cancel
              </button>

              {!cameraError && (
                <button
                  onClick={capturePhoto}
                  style={{
                    background: 'linear-gradient(135deg, #10b981, #059669)',
                    color: '#ffffff',
                    border: 'none',
                    padding: '0.6rem 1.25rem',
                    borderRadius: '8px',
                    fontWeight: 800,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.35rem'
                  }}
                >
                  <Camera size={16} /> Capture Snapshot
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Decision Trace Modal */}
      {result && (
        <AIDecisionTrace
          isOpen={traceOpen}
          onClose={() => setTraceOpen(false)}
          reasoningTrace={result.reasoning_trace || []}
          domainType={result.domain_type}
          responsibleAuthority={result.responsible_authority}
        />
      )}
    </div>
  );
}
