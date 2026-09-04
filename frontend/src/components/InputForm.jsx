import React, { useState, useRef, useEffect } from 'react';
import { FileText, Link, Image as ImageIcon, Mic, Upload, X, Sparkles, Square, Play, Volume2, Radio, CheckCircle2 } from 'lucide-react';

export default function InputForm({ onSubmit, isLoading }) {
  const [inputType, setInputType] = useState('text');
  const [textInput, setTextInput] = useState('');
  const [urlInput, setUrlInput] = useState('');
  
  // Image State
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [dragActive, setDragActive] = useState(false);

  // Audio State
  const [audioMode, setAudioMode] = useState('upload'); // 'upload' | 'record'
  const [audioFile, setAudioFile] = useState(null);
  const [audioPreviewUrl, setAudioPreviewUrl] = useState(null);
  const [isRecording, setIsRecording] = useState(false);
  const [recordTimer, setRecordTimer] = useState(0);
  const [audioDragActive, setAudioDragActive] = useState(false);

  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const timerIntervalRef = useRef(null);
  const streamRef = useRef(null);

  useEffect(() => {
    return () => {
      // Cleanup audio stream and timers on unmount
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
      }
      if (previewUrl) URL.revokeObjectURL(previewUrl);
      if (audioPreviewUrl) URL.revokeObjectURL(audioPreviewUrl);
    };
  }, []);

  // Image Handlers
  const handleFileChange = (file) => {
    if (file && file.type.startsWith('image/')) {
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileChange(e.dataTransfer.files[0]);
    }
  };

  const removeImage = () => {
    setSelectedFile(null);
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
      setPreviewUrl(null);
    }
  };

  // Audio Handlers
  const handleAudioFileChange = (file) => {
    if (file && (file.type.startsWith('audio/') || file.name.match(/\.(mp3|wav|ogg|m4a|aac|opus|webm)$/i))) {
      setAudioFile(file);
      setAudioPreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleAudioDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setAudioDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleAudioFileChange(e.dataTransfer.files[0]);
    }
  };

  const removeAudio = () => {
    setAudioFile(null);
    if (audioPreviewUrl) {
      URL.revokeObjectURL(audioPreviewUrl);
      setAudioPreviewUrl(null);
    }
    if (isRecording) {
      stopRecording();
    }
  };

  const startRecording = async () => {
    try {
      audioChunksRef.current = [];
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;

      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const mimeType = mediaRecorder.mimeType || 'audio/webm';
        const audioBlob = new Blob(audioChunksRef.current, { type: mimeType });
        const recordedFile = new File([audioBlob], `voice_note_${Date.now()}.webm`, { type: mimeType });
        setAudioFile(recordedFile);
        setAudioPreviewUrl(URL.createObjectURL(recordedFile));
        
        // Stop stream tracks
        if (streamRef.current) {
          streamRef.current.getTracks().forEach((track) => track.stop());
        }
      };

      mediaRecorder.start(100);
      setIsRecording(true);
      setRecordTimer(0);

      timerIntervalRef.current = setInterval(() => {
        setRecordTimer((prev) => prev + 1);
      }, 1000);
    } catch (err) {
      alert('Microphone access denied or not available. Please allow microphone permissions in your browser.');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current);
      }
    }
  };

  const formatTimer = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append('type', inputType);

    if (inputType === 'text') {
      if (!textInput.trim()) return;
      formData.append('text', textInput.trim());
    } else if (inputType === 'url') {
      if (!urlInput.trim()) return;
      formData.append('url', urlInput.trim());
    } else if (inputType === 'image') {
      if (!selectedFile) return;
      formData.append('image', selectedFile);
    } else if (inputType === 'audio') {
      if (!audioFile) {
        alert('Please upload an audio file or record a voice note first.');
        return;
      }
      formData.append('audio', audioFile);
    }

    onSubmit(formData);
  };

  const handleSampleClick = (sampleText) => {
    setInputType('text');
    setTextInput(sampleText);
  };

  return (
    <div className="glass-panel glass-panel-glow" style={{ padding: '2.25rem' }}>
      {/* 4 Input Tabs */}
      <div className="input-tabs">
        <button
          type="button"
          className={`input-tab ${inputType === 'text' ? 'active' : ''}`}
          onClick={() => setInputType('text')}
        >
          <FileText size={18} />
          Text / Claim
        </button>
        <button
          type="button"
          className={`input-tab ${inputType === 'url' ? 'active' : ''}`}
          onClick={() => setInputType('url')}
        >
          <Link size={18} />
          News URL
        </button>
        <button
          type="button"
          className={`input-tab ${inputType === 'image' ? 'active' : ''}`}
          onClick={() => setInputType('image')}
        >
          <ImageIcon size={18} />
          Screenshot
        </button>
        <button
          type="button"
          className={`input-tab ${inputType === 'audio' ? 'active' : ''}`}
          onClick={() => setInputType('audio')}
        >
          <Mic size={18} />
          Audio / Voice Note
        </button>
      </div>

      <form onSubmit={handleSubmit}>
        {/* TAB 1: TEXT CLAIM */}
        {inputType === 'text' && (
          <div className="form-group">
            <label className="form-label">Paste your claim or forward message</label>
            <div className="textarea-container">
              <textarea
                className="custom-textarea"
                placeholder="Paste news claim, viral WhatsApp message, or tweet (supports English, Hindi & Hinglish)..."
                value={textInput}
                onChange={(e) => setTextInput(e.target.value)}
                maxLength={5000}
                required
              />
              <div className="textarea-footer">
                <span className="char-count">{textInput.length} / 5000</span>
                <span className="ai-ready-badge">
                  <Sparkles size={14} /> AI Ready
                </span>
              </div>
            </div>

            <div className="sample-pills-row">
              <span className="sample-label">Try an example:</span>
              <button
                type="button"
                onClick={() => handleSampleClick('PM Modi announces 3 months free 5G recharge scheme for all Indian users')}
                className="sample-pill-ref"
              >
                ⚡ 5G Recharge Scam
              </button>
              <button
                type="button"
                onClick={() => handleSampleClick('2000 rupaye ke note me GPS chip hai jo zameen ke neeche bhi track karegi')}
                className="sample-pill-ref"
              >
                📍 Hinglish GPS Rumor
              </button>
              <button
                type="button"
                onClick={() => handleSampleClick('Election Commission announced voter ID card updates via WhatsApp link')}
                className="sample-pill-ref"
              >
                🗳️ Election Viral Claim
              </button>
            </div>
          </div>
        )}

        {/* TAB 2: URL */}
        {inputType === 'url' && (
          <div className="form-group">
            <label className="form-label">News Article URL</label>
            <input
              type="url"
              className="custom-input"
              placeholder="https://example-news-site.com/article/123"
              value={urlInput}
              onChange={(e) => setUrlInput(e.target.value)}
              required
            />
          </div>
        )}

        {/* TAB 3: SCREENSHOT */}
        {inputType === 'image' && (
          <div className="form-group">
            <label className="form-label">Upload Screenshot of Social Post or News Clippings</label>
            {!selectedFile ? (
              <div
                className={`dropzone ${dragActive ? 'drag-active' : ''}`}
                onDrop={handleDrop}
                onDragOver={(e) => { e.preventDefault(); setDragActive(true); }}
                onDragLeave={() => setDragActive(false)}
                onClick={() => document.getElementById('file-upload-input').click()}
              >
                <div className="dropzone-icon">
                  <Upload size={24} />
                </div>
                <div>
                  <p style={{ fontWeight: 600, color: 'var(--text-primary)' }}>
                    Drag & Drop screenshot here, or browse
                  </p>
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
                    Supports PNG, JPG, WEBP screenshots of posts, forwards, or headlines
                  </p>
                </div>
                <input
                  id="file-upload-input"
                  type="file"
                  accept="image/*"
                  style={{ display: 'none' }}
                  onChange={(e) => e.target.files && handleFileChange(e.target.files[0])}
                />
              </div>
            ) : (
              <div className="image-preview-container">
                <img src={previewUrl} alt="Upload preview" className="image-preview" />
                <button type="button" className="remove-image-btn" onClick={removeImage}>
                  <X size={18} />
                </button>
              </div>
            )}
          </div>
        )}

        {/* TAB 4: AUDIO / VOICE NOTE */}
        {inputType === 'audio' && (
          <div className="form-group">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem', flexWrap: 'wrap', gap: '0.5rem' }}>
              <label className="form-label">WhatsApp Voice Note & Audio Fact-Checking</label>
              
              {/* Audio Mode Switcher */}
              <div style={{ display: 'flex', gap: '0.35rem', background: 'rgba(0,0,0,0.25)', padding: '3px', borderRadius: 'var(--radius-sm)' }}>
                <button
                  type="button"
                  onClick={() => setAudioMode('upload')}
                  style={{
                    background: audioMode === 'upload' ? 'var(--accent-cyan)' : 'transparent',
                    color: audioMode === 'upload' ? '#000' : 'var(--text-secondary)',
                    border: 'none',
                    padding: '0.3rem 0.75rem',
                    borderRadius: '4px',
                    fontSize: '0.8rem',
                    fontWeight: 600,
                    cursor: 'pointer'
                  }}
                >
                  📁 Upload Audio File
                </button>
                <button
                  type="button"
                  onClick={() => setAudioMode('record')}
                  style={{
                    background: audioMode === 'record' ? 'var(--accent-cyan)' : 'transparent',
                    color: audioMode === 'record' ? '#000' : 'var(--text-secondary)',
                    border: 'none',
                    padding: '0.3rem 0.75rem',
                    borderRadius: '4px',
                    fontSize: '0.8rem',
                    fontWeight: 600,
                    cursor: 'pointer'
                  }}
                >
                  🎙️ Record with Mic
                </button>
              </div>
            </div>

            {/* Mode A: Upload Audio File */}
            {audioMode === 'upload' && (
              <>
                {!audioFile ? (
                  <div
                    className={`dropzone ${audioDragActive ? 'drag-active' : ''}`}
                    onDrop={handleAudioDrop}
                    onDragOver={(e) => { e.preventDefault(); setAudioDragActive(true); }}
                    onDragLeave={() => setAudioDragActive(false)}
                    onClick={() => document.getElementById('audio-file-input').click()}
                  >
                    <div className="dropzone-icon" style={{ background: 'rgba(14, 165, 233, 0.15)', color: 'var(--accent-cyan)' }}>
                      <Volume2 size={24} />
                    </div>
                    <div>
                      <p style={{ fontWeight: 600, color: 'var(--text-primary)' }}>
                        Drag & Drop WhatsApp Voice Note or Audio File
                      </p>
                      <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
                        Supports MP3, M4A, OGG, WAV, OPUS, AAC (Hindi, Hinglish & Regional speech)
                      </p>
                    </div>
                    <input
                      id="audio-file-input"
                      type="file"
                      accept="audio/*,.mp3,.wav,.ogg,.m4a,.opus,.aac,.webm"
                      style={{ display: 'none' }}
                      onChange={(e) => e.target.files && handleAudioFileChange(e.target.files[0])}
                    />
                  </div>
                ) : (
                  <div style={{ background: 'rgba(15, 23, 42, 0.8)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)', padding: '1.25rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem', flexWrap: 'wrap' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                      <div style={{ width: 42, height: 42, background: 'rgba(16, 185, 129, 0.15)', color: 'var(--verdict-real)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <CheckCircle2 size={22} />
                      </div>
                      <div>
                        <div style={{ fontWeight: 600, color: 'var(--text-primary)', fontSize: '0.95rem' }}>
                          {audioFile.name || 'Voice Note Attached'}
                        </div>
                        <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                          {(audioFile.size / 1024).toFixed(1)} KB • Ready for speech fact-checking
                        </div>
                      </div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                      {audioPreviewUrl && (
                        <audio controls src={audioPreviewUrl} style={{ height: '36px', maxWidth: '240px' }} />
                      )}
                      <button
                        type="button"
                        onClick={removeAudio}
                        style={{ background: 'rgba(239, 68, 68, 0.15)', border: '1px solid rgba(239, 68, 68, 0.3)', color: '#f87171', padding: '0.4rem 0.8rem', borderRadius: 'var(--radius-sm)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.85rem' }}
                      >
                        <X size={15} /> Remove
                      </button>
                    </div>
                  </div>
                )}
              </>
            )}

            {/* Mode B: Record Live with Microphone */}
            {audioMode === 'record' && (
              <div style={{ background: 'rgba(15, 23, 42, 0.8)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)', padding: '2rem', textAlign: 'center' }}>
                {!audioFile && !isRecording && (
                  <div>
                    <div style={{ width: 64, height: 64, margin: '0 auto 1rem', background: 'rgba(14, 165, 233, 0.15)', color: 'var(--accent-cyan)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <Mic size={32} />
                    </div>
                    <p style={{ fontWeight: 600, color: 'var(--text-primary)', fontSize: '1.05rem', marginBottom: '0.35rem' }}>
                      Click below to start recording voice note
                    </p>
                    <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '1.5rem' }}>
                      Speak the rumor or play WhatsApp audio near your microphone (Hindi, Hinglish or English)
                    </p>
                    <button
                      type="button"
                      onClick={startRecording}
                      style={{
                        background: 'linear-gradient(135deg, #ef4444, #dc2626)',
                        color: 'white',
                        border: 'none',
                        padding: '0.75rem 1.75rem',
                        borderRadius: '50px',
                        fontWeight: 600,
                        fontSize: '0.95rem',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                        cursor: 'pointer',
                        boxShadow: '0 0 20px rgba(239, 68, 68, 0.4)'
                      }}
                    >
                      <Radio size={18} />
                      Start Voice Recording
                    </button>
                  </div>
                )}

                {isRecording && (
                  <div>
                    <div style={{ width: 72, height: 72, margin: '0 auto 1rem', background: 'rgba(239, 68, 68, 0.2)', border: '2px solid #ef4444', color: '#ef4444', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', animation: 'pulse 1.5s infinite' }}>
                      <Radio size={36} />
                    </div>
                    <div style={{ fontSize: '1.5rem', fontWeight: 700, fontFamily: 'monospace', color: '#ef4444', marginBottom: '0.5rem' }}>
                      🔴 Recording: {formatTimer(recordTimer)}
                    </div>
                    <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '1.5rem' }}>
                      Listening... Speak clearly into your microphone
                    </p>
                    <button
                      type="button"
                      onClick={stopRecording}
                      style={{
                        background: '#ef4444',
                        color: 'white',
                        border: 'none',
                        padding: '0.75rem 1.75rem',
                        borderRadius: '50px',
                        fontWeight: 600,
                        fontSize: '0.95rem',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                        cursor: 'pointer',
                        boxShadow: '0 0 20px rgba(239, 68, 68, 0.6)'
                      }}
                    >
                      <Square size={16} />
                      Stop & Save Recording
                    </button>
                  </div>
                )}

                {audioFile && !isRecording && (
                  <div>
                    <div style={{ width: 54, height: 54, margin: '0 auto 0.75rem', background: 'rgba(16, 185, 129, 0.15)', color: 'var(--verdict-real)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <CheckCircle2 size={28} />
                    </div>
                    <p style={{ fontWeight: 600, color: 'var(--text-primary)', marginBottom: '0.25rem' }}>
                      Voice Note Recorded Successfully ({formatTimer(recordTimer)})
                    </p>
                    <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '1rem' }}>
                      Listen to your recording below, or click Verify Claim
                    </p>

                    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap', marginBottom: '1rem' }}>
                      <audio controls src={audioPreviewUrl} style={{ height: '38px' }} />
                      <button
                        type="button"
                        onClick={removeAudio}
                        style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid var(--border-color)', color: 'var(--text-secondary)', padding: '0.5rem 1rem', borderRadius: 'var(--radius-sm)', cursor: 'pointer', fontSize: '0.85rem' }}
                      >
                        Re-record Audio
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        <button type="submit" className="submit-btn" disabled={isLoading || (inputType === 'audio' && !audioFile)}>
          <Sparkles size={20} />
          {isLoading ? 'Processing...' : 'Analyze with EeraFact AI'}
        </button>
      </form>
    </div>
  );
}

