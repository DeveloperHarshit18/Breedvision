import React, { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import CameraCapture from './CameraCapture';
import './UploadZone.css';

/**
 * UploadZone
 * Props:
 *   onFileSelected(file) — called when user picks a valid image
 *   preview              — object URL string of the currently selected file (or null)
 */
export default function UploadZone({ onFileSelected, preview }) {
  const [dragError, setDragError] = useState('');
  const [mode, setMode] = useState('upload'); // 'upload' | 'camera'

  const onDrop = useCallback(
    (acceptedFiles, rejectedFiles) => {
      setDragError('');

      if (rejectedFiles.length > 0) {
        const reason = rejectedFiles[0].errors?.[0]?.code;
        if (reason === 'file-too-large') {
          setDragError('File is too large. Maximum size is 10 MB.');
        } else if (reason === 'file-invalid-type') {
          setDragError('Invalid file type. Please upload a JPG, PNG, or WebP image.');
        } else {
          setDragError('Could not accept that file. Please try another.');
        }
        return;
      }

      if (acceptedFiles.length > 0) {
        onFileSelected(acceptedFiles[0]);
      }
    },
    [onFileSelected]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'image/jpeg': [], 'image/png': [], 'image/webp': [] },
    maxSize: 10 * 1024 * 1024, // 10 MB
    multiple: false,
  });

  // When camera captures a photo, treat it like a file selection
  const handleCameraCapture = useCallback((file) => {
    setMode('upload'); // switch back to upload mode to show preview
    onFileSelected(file);
  }, [onFileSelected]);

  return (
    <div className="upload-zone-wrapper">
      {/* ── Mode toggle tabs ── */}
      {!preview && (
        <div className="upload-mode-toggle">
          <button
            className={`mode-tab ${mode === 'upload' ? 'active' : ''}`}
            onClick={() => setMode('upload')}
            id="upload-tab-btn"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
              <polyline points="17 8 12 3 7 8" />
              <line x1="12" y1="3" x2="12" y2="15" />
            </svg>
            Upload
          </button>
          <button
            className={`mode-tab ${mode === 'camera' ? 'active' : ''}`}
            onClick={() => setMode('camera')}
            id="camera-tab-btn"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
              <circle cx="12" cy="13" r="4" />
            </svg>
            Camera
          </button>
        </div>
      )}

      {/* ── Camera mode ── */}
      {mode === 'camera' && !preview && (
        <CameraCapture
          onCapture={handleCameraCapture}
          onClose={() => setMode('upload')}
        />
      )}

      {/* ── Upload / Dropzone mode ── */}
      {(mode === 'upload' || preview) && (
        <div
          {...getRootProps()}
          className={`upload-zone ${isDragActive ? 'dragging' : ''} ${preview ? 'has-preview' : ''}`}
        >
          <input {...getInputProps()} />

          {preview ? (
            <div className="preview-container">
              <img src={preview} alt="Preview" className="preview-image" />
              <div className="preview-overlay">
                <span className="preview-change-hint">Click or drag to change image</span>
              </div>
            </div>
          ) : (
            <div className="upload-placeholder">
              <div className="upload-icon-ring">
                <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                  <polyline points="17 8 12 3 7 8" />
                  <line x1="12" y1="3" x2="12" y2="15" />
                </svg>
              </div>
              <p className="upload-title">
                {isDragActive ? 'Drop the image here…' : 'Drag & drop a cattle image'}
              </p>
              <p className="upload-sub">or click to browse your files</p>
              <p className="upload-formats">JPG · PNG · WebP · max 10 MB</p>
            </div>
          )}
        </div>
      )}

      {dragError && (
        <p className="upload-error" role="alert">
          ⚠ {dragError}
        </p>
      )}
    </div>
  );
}
