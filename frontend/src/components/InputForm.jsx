import React, { useState, useRef, useEffect } from 'react';
import {
  FileText,
  Link as LinkIcon,
  Image as ImageIcon,
  Mic,
  Upload,
  X,
  Sparkles,
  Square,
  Radio,
  CheckCircle2,
  Volume2,
  ArrowRight,
  Info
} from 'lucide-react';

export default function InputForm({ onSubmit, isLoading, defaultType = 'text' }) {
  const [inputType, setInputType] = useState(defaultType);
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
    if (defaultType) {
      setInputType(defaultType);
    }
  }, [defaultType]);

  useEffect(() => {
    return () => {
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

  const handleSampleClick = (sample) => {
    setInputType('text');
    setTextInput(sample);
  };

  const sampleClaims = [
    {
      title: '5G Free Recharge',
      tag: 'Scam Alert',
      text: 'PM Modi announces 3 months free 5G recharge scheme for all Indian users via forward link.'
    },
    {
      title: 'GPS Chip in Currency',
      tag: 'Viral Rumor',
      text: '2000 rupaye ke note me radioactive GPS chip hai jo zameen ke neeche bhi track karegi.'
    },
    {
      title: 'Election WhatsApp Voting',
      tag: 'Misleading',
      text: 'Election Commission announced that voters can now cast votes and update voter ID cards via official WhatsApp bot.'
    }
  ];

  return (
    <div className="clay-verify-container">
      {/* 4 Large Claymorphic Input Selector Cards */}
      <div className="clay-modality-selector-grid">
        <button
          type="button"
          className={`clay-selector-card ${inputType === 'text' ? 'active' : ''}`}
          onClick={() => setInputType('text')}
        >
          <div className="selector-icon-box">
            <FileText size={22} />
          </div>
          <div className="selector-text-box">
            <span className="selector-title">TEXT CLAIM</span>
            <span className="selector-desc">Paste claim, message or social media post</span>
          </div>
          {inputType === 'text' && <span className="selector-active-indicator" />}
        </button>

        <button
          type="button"
          className={`clay-selector-card ${inputType === 'url' ? 'active' : ''}`}
          onClick={() => setInputType('url')}
        >
          <div className="selector-icon-box">
            <LinkIcon size={22} />
          </div>
          <div className="selector-text-box">
            <span className="selector-title">NEWS URL</span>
            <span className="selector-desc">Check a news article or webpage</span>
          </div>
          {inputType === 'url' && <span className="selector-active-indicator" />}
        </button>

        <button
          type="button"
          className={`clay-selector-card ${inputType === 'image' ? 'active' : ''}`}
          onClick={() => setInputType('image')}
        >
          <div className="selector-icon-box">
            <ImageIcon size={22} />
          </div>
          <div className="selector-text-box">
            <span className="selector-title">SCREENSHOT</span>
            <span className="selector-desc">Upload a screenshot or image for ELA forensics</span>
          </div>
          {inputType === 'image' && <span className="selector-active-indicator" />}
        </button>

        <button
          type="button"
          className={`clay-selector-card ${inputType === 'audio' ? 'active' : ''}`}
          onClick={() => setInputType('audio')}
        >
          <div className="selector-icon-box">
            <Mic size={22} />
          </div>
          <div className="selector-text-box">
            <span className="selector-title">VOICE NOTE</span>
            <span className="selector-desc">Upload or record voice notes & audio clips</span>
          </div>
          {inputType === 'audio' && <span className="selector-active-indicator" />}
        </button>
      </div>

      {/* Main Claymorphic Form Box */}
      <div className="clay-card clay-form-card">
        <form onSubmit={handleSubmit}>
          {/* TAB 1: TEXT CLAIM */}
          {inputType === 'text' && (
            <div className="clay-form-group">
              <div className="form-group-header">
                <label className="clay-label">
                  Paste WhatsApp Forward, Social Post or Headline
                </label>
                <span className="clay-badge-subtle">
                  Supports English, Hindi & Hinglish
                </span>
              </div>

              <div className="clay-textarea-wrapper">
                <textarea
                  className="clay-textarea"
                  placeholder="Paste news claim, viral WhatsApp message, quote, or social post here..."
                  value={textInput}
                  onChange={(e) => setTextInput(e.target.value)}
                  maxLength={5000}
                  rows={5}
                  required
                />
                <div className="clay-textarea-meta">
                  <span className="char-counter">{textInput.length} / 5000 characters</span>
                  <span className="nlp-ready-indicator">
                    <Sparkles size={13} />
                    Multilingual NLP Ready
                  </span>
                </div>
              </div>

              {/* Sample Claims Carousel / Quick Test Pills */}
              <div className="clay-sample-bar">
                <span className="sample-bar-label">Try a common claim:</span>
                <div className="sample-pills-wrap">
                  {sampleClaims.map((item, idx) => (
                    <button
                      key={idx}
                      type="button"
                      className="clay-sample-pill"
                      onClick={() => handleSampleClick(item.text)}
                      title={`Load: ${item.text}`}
                    >
                      <span className="sample-pill-dot" />
                      <span className="sample-pill-name">{item.title}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: NEWS URL */}
          {inputType === 'url' && (
            <div className="clay-form-group">
              <div className="form-group-header">
                <label className="clay-label">News Article or Webpage URL</label>
                <span className="clay-badge-subtle">Real-Time Domain & Content Audit</span>
              </div>

              <div className="clay-input-wrapper">
                <div className="input-icon-box">
                  <LinkIcon size={18} />
                </div>
                <input
                  type="url"
                  className="clay-input"
                  placeholder="https://example-news-site.com/investigation/1234"
                  value={urlInput}
                  onChange={(e) => setUrlInput(e.target.value)}
                  required
                />
              </div>

              <p className="clay-hint-text">
                <Info size={14} className="hint-icon" />
                EeraFact will extract the core claims, verify domain legitimacy, and cross-reference stories against trusted sources.
              </p>
            </div>
          )}

          {/* TAB 3: IMAGE / SCREENSHOT */}
          {inputType === 'image' && (
            <div className="clay-form-group">
              <div className="form-group-header">
                <label className="clay-label">Upload Screenshot of News Clipping or Social Post</label>
                <span className="clay-badge-subtle">Digital Forensic ELA Heatmap</span>
              </div>

              {!selectedFile ? (
                <div
                  className={`clay-dropzone ${dragActive ? 'drag-active' : ''}`}
                  onDrop={handleDrop}
                  onDragOver={(e) => {
                    e.preventDefault();
                    setDragActive(true);
                  }}
                  onDragLeave={() => setDragActive(false)}
                  onClick={() => document.getElementById('clay-image-upload').click()}
                >
                  <div className="dropzone-clay-icon">
                    <Upload size={28} />
                  </div>
                  <div className="dropzone-text">
                    <p className="dropzone-primary-text">
                      Drag & Drop screenshot here, or <span className="dropzone-link">browse files</span>
                    </p>
                    <p className="dropzone-sub-text">
                      Supports PNG, JPG, WEBP screenshots of posts, newspaper clippings, or notices
                    </p>
                  </div>
                  <input
                    id="clay-image-upload"
                    type="file"
                    accept="image/*"
                    style={{ display: 'none' }}
                    onChange={(e) => e.target.files && handleFileChange(e.target.files[0])}
                  />
                </div>
              ) : (
                <div className="clay-image-preview-box">
                  <div className="preview-img-wrap">
                    <img src={previewUrl} alt="Uploaded preview" className="clay-preview-img" />
                    <button
                      type="button"
                      className="clay-remove-btn"
                      onClick={removeImage}
                      title="Remove image"
                    >
                      <X size={16} />
                    </button>
                  </div>
                  <div className="preview-info-box">
                    <div className="preview-file-name">{selectedFile.name}</div>
                    <div className="preview-file-meta">
                      {(selectedFile.size / 1024).toFixed(1)} KB • Ready for OCR & Forensic ELA Scan
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 4: AUDIO / VOICE NOTE */}
          {inputType === 'audio' && (
            <div className="clay-form-group">
              <div className="form-group-header">
                <label className="clay-label">WhatsApp Voice Note & Speech Verification</label>
                <div className="clay-pill-switch">
                  <button
                    type="button"
                    className={`clay-switch-btn ${audioMode === 'upload' ? 'active' : ''}`}
                    onClick={() => setAudioMode('upload')}
                  >
                    Upload File
                  </button>
                  <button
                    type="button"
                    className={`clay-switch-btn ${audioMode === 'record' ? 'active' : ''}`}
                    onClick={() => setAudioMode('record')}
                  >
                    Record Mic
                  </button>
                </div>
              </div>

              {/* Mode A: Upload Audio */}
              {audioMode === 'upload' && (
                <>
                  {!audioFile ? (
                    <div
                      className={`clay-dropzone ${audioDragActive ? 'drag-active' : ''}`}
                      onDrop={handleAudioDrop}
                      onDragOver={(e) => {
                        e.preventDefault();
                        setAudioDragActive(true);
                      }}
                      onDragLeave={() => setAudioDragActive(false)}
                      onClick={() => document.getElementById('clay-audio-upload').click()}
                    >
                      <div className="dropzone-clay-icon audio-tint">
                        <Volume2 size={28} />
                      </div>
                      <div className="dropzone-text">
                        <p className="dropzone-primary-text">
                          Drag & Drop audio note or <span className="dropzone-link">browse voice clip</span>
                        </p>
                        <p className="dropzone-sub-text">
                          Supports MP3, M4A, OGG, WAV, OPUS, AAC (Hindi, Hinglish & English speech)
                        </p>
                      </div>
                      <input
                        id="clay-audio-upload"
                        type="file"
                        accept="audio/*,.mp3,.wav,.ogg,.m4a,.opus,.aac,.webm"
                        style={{ display: 'none' }}
                        onChange={(e) => e.target.files && handleAudioFileChange(e.target.files[0])}
                      />
                    </div>
                  ) : (
                    <div className="clay-audio-preview-box">
                      <div className="audio-meta-left">
                        <div className="audio-status-icon">
                          <CheckCircle2 size={22} />
                        </div>
                        <div>
                          <div className="audio-filename">{audioFile.name || 'Voice Note Attached'}</div>
                          <div className="audio-filesize">
                            {(audioFile.size / 1024).toFixed(1)} KB • Ready for Speech-to-Fact Audit
                          </div>
                        </div>
                      </div>

                      <div className="audio-controls-right">
                        {audioPreviewUrl && (
                          <audio controls src={audioPreviewUrl} className="clay-audio-player" />
                        )}
                        <button
                          type="button"
                          className="clay-btn clay-btn-danger clay-btn-sm"
                          onClick={removeAudio}
                        >
                          <X size={15} />
                          <span>Remove</span>
                        </button>
                      </div>
                    </div>
                  )}
                </>
              )}

              {/* Mode B: Record Live Mic */}
              {audioMode === 'record' && (
                <div className="clay-recorder-card">
                  {!audioFile && !isRecording && (
                    <div className="recorder-idle-state">
                      <div className="recorder-mic-avatar">
                        <Mic size={32} />
                      </div>
                      <h4 className="recorder-prompt">Record Voice Note with Microphone</h4>
                      <p className="recorder-instructions">
                        Speak the rumor or play audio near your microphone (supports English, Hindi, and regional speech).
                      </p>
                      <button
                        type="button"
                        className="clay-btn clay-btn-danger clay-btn-md"
                        onClick={startRecording}
                      >
                        <Radio size={16} />
                        <span>Start Recording</span>
                      </button>
                    </div>
                  )}

                  {isRecording && (
                    <div className="recorder-live-state">
                      <div className="recorder-live-indicator">
                        <span className="recording-pulse-ring" />
                        <Radio size={32} className="recording-icon" />
                      </div>
                      <div className="recording-live-timer">
                        Recording: {formatTimer(recordTimer)}
                      </div>
                      <p className="recording-status-text">
                        Listening to audio stream... Speak clearly into your microphone.
                      </p>
                      <button
                        type="button"
                        className="clay-btn clay-btn-danger clay-btn-md"
                        onClick={stopRecording}
                      >
                        <Square size={16} />
                        <span>Stop & Attach Recording</span>
                      </button>
                    </div>
                  )}

                  {audioFile && !isRecording && (
                    <div className="recorder-completed-state">
                      <div className="recorder-check-avatar">
                        <CheckCircle2 size={26} />
                      </div>
                      <h4 className="recorder-prompt">Voice Note Captured ({formatTimer(recordTimer)})</h4>
                      <p className="recorder-instructions">
                        Preview your recording below or re-record if needed before verification.
                      </p>
                      <div className="recorder-playback-row">
                        <audio controls src={audioPreviewUrl} className="clay-audio-player" />
                        <button
                          type="button"
                          className="clay-btn clay-btn-secondary clay-btn-sm"
                          onClick={removeAudio}
                        >
                          Re-record
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Submit Action Button */}
          <div className="clay-form-submit-row">
            <button
              type="submit"
              className="clay-btn clay-btn-primary clay-btn-submit"
              disabled={isLoading || (inputType === 'audio' && !audioFile) || (inputType === 'image' && !selectedFile)}
            >
              <Sparkles size={19} />
              <span>{isLoading ? 'Verifying with EeraFact...' : 'Verify Claim with EeraFact AI'}</span>
              <ArrowRight size={18} />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
