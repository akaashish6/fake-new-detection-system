import React, { useState } from 'react';
import { FileText, Link, Image as ImageIcon, Upload, X, Sparkles } from 'lucide-react';

export default function InputForm({ onSubmit, isLoading }) {
  const [inputType, setInputType] = useState('text');
  const [textInput, setTextInput] = useState('');
  const [urlInput, setUrlInput] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [dragActive, setDragActive] = useState(false);

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

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
  };

  const removeImage = () => {
    setSelectedFile(null);
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
      setPreviewUrl(null);
    }
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
    }

    onSubmit(formData);
  };

  const handleSampleClick = (sampleText) => {
    setInputType('text');
    setTextInput(sampleText);
  };

  return (
    <div className="glass-panel" style={{ padding: '2rem' }}>
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
          News Article Link
        </button>
        <button
          type="button"
          className={`input-tab ${inputType === 'image' ? 'active' : ''}`}
          onClick={() => setInputType('image')}
        >
          <ImageIcon size={18} />
          Screenshot Upload
        </button>
      </div>

      <form onSubmit={handleSubmit}>
        {inputType === 'text' && (
          <div className="form-group">
            <label className="form-label">Paste Claim or Forward Message</label>
            <textarea
              className="custom-textarea"
              placeholder="Paste news claim, viral WhatsApp message, or tweet (supports English, Hindi & Hinglish)..."
              value={textInput}
              onChange={(e) => setTextInput(e.target.value)}
              required
            />
            <div style={{ marginTop: '0.75rem', display: 'flex', gap: '0.5rem', flexWrap: 'wrap', alignItems: 'center' }}>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Try sample:</span>
              <button
                type="button"
                onClick={() => handleSampleClick('PM Modi announces 3 months free 5G recharge scheme for all Indian users')}
                style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border-color)', color: 'var(--text-secondary)', padding: '0.2rem 0.6rem', borderRadius: '4px', fontSize: '0.75rem', cursor: 'pointer' }}
              >
                Free 5G Recharge Claim
              </button>
              <button
                type="button"
                onClick={() => handleSampleClick('2000 rupaye ke note me GPS chip hai jo zameen ke neeche bhi track karegi')}
                style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border-color)', color: 'var(--text-secondary)', padding: '0.2rem 0.6rem', borderRadius: '4px', fontSize: '0.75rem', cursor: 'pointer' }}
              >
                Hinglish Note GPS Rumor
              </button>
            </div>
          </div>
        )}

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

        {inputType === 'image' && (
          <div className="form-group">
            <label className="form-label">Upload Screenshot of Social Post or News Clippings</label>
            {!selectedFile ? (
              <div
                className={`dropzone ${dragActive ? 'drag-active' : ''}`}
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
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

        <button type="submit" className="submit-btn" disabled={isLoading}>
          <Sparkles size={20} />
          {isLoading ? 'Processing Fact Check...' : 'Fact Check with Gemini AI'}
        </button>
      </form>
    </div>
  );
}
