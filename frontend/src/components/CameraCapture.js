import React, { useRef, useState, useCallback, useEffect } from 'react';
import './CameraCapture.css';

/**
 * CameraCapture
 * Props:
 *   onCapture(file) — called with a File object when user takes a photo
 *   onClose()       — called when user wants to go back to upload mode
 */
export default function CameraCapture({ onCapture, onClose }) {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const streamRef = useRef(null);
  const [cameraReady, setCameraReady] = useState(false);
  const [error, setError] = useState('');
  const [facingMode, setFacingMode] = useState('environment'); // back camera
  const [flash, setFlash] = useState(false);
  const [captured, setCaptured] = useState(null); // preview of captured image

  // ── Start camera stream ────────────────────────────────────────────────────
  const startCamera = useCallback(async (facing) => {
    // Stop any existing stream
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(t => t.stop());
    }
    setCameraReady(false);
    setError('');

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: facing,
          width: { ideal: 1920 },
          height: { ideal: 1080 },
        },
        audio: false,
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.onloadedmetadata = () => {
          videoRef.current.play();
          setCameraReady(true);
        };
      }
    } catch (err) {
      console.error('Camera error:', err);
      if (err.name === 'NotAllowedError') {
        setError('Camera access denied. Please allow camera permission and try again.');
      } else if (err.name === 'NotFoundError') {
        setError('No camera found on this device.');
      } else {
        setError('Could not access camera. Please try again.');
      }
    }
  }, []);

  // Start on mount, cleanup on unmount
  useEffect(() => {
    startCamera(facingMode);
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(t => t.stop());
      }
    };
  }, [startCamera, facingMode]);

  // ── Switch camera ──────────────────────────────────────────────────────────
  const handleSwitchCamera = useCallback(() => {
    const newFacing = facingMode === 'environment' ? 'user' : 'environment';
    setFacingMode(newFacing);
    setCaptured(null);
    startCamera(newFacing);
  }, [facingMode, startCamera]);

  // ── Capture photo ──────────────────────────────────────────────────────────
  const handleCapture = useCallback(() => {
    if (!videoRef.current || !canvasRef.current) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    const ctx = canvas.getContext('2d');
    ctx.drawImage(video, 0, 0);

    // Flash effect
    setFlash(true);
    setTimeout(() => setFlash(false), 200);

    // Convert to blob → File
    canvas.toBlob(
      (blob) => {
        if (blob) {
          const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
          const file = new File([blob], `cattle-capture-${timestamp}.jpg`, {
            type: 'image/jpeg',
          });
          setCaptured(URL.createObjectURL(blob));

          // Stop the live stream once captured
          if (streamRef.current) {
            streamRef.current.getTracks().forEach(t => t.stop());
          }

          // Store file for later use
          canvasRef.current._capturedFile = file;
        }
      },
      'image/jpeg',
      0.92
    );
  }, []);

  // ── Use captured photo ─────────────────────────────────────────────────────
  const handleUsePhoto = useCallback(() => {
    if (canvasRef.current?._capturedFile) {
      onCapture(canvasRef.current._capturedFile);
    }
  }, [onCapture]);

  // ── Retake photo ───────────────────────────────────────────────────────────
  const handleRetake = useCallback(() => {
    setCaptured(null);
    startCamera(facingMode);
  }, [facingMode, startCamera]);

  return (
    <div className="camera-wrapper">
      {/* ── Camera viewport ── */}
      <div className="camera-viewport">
        {/* Flash overlay */}
        {flash && <div className="camera-flash" />}

        {/* Loading state */}
        {!cameraReady && !error && !captured && (
          <div className="camera-loading">
            <div className="camera-loading-spinner" />
            <p>Starting camera…</p>
          </div>
        )}

        {/* Error state */}
        {error && (
          <div className="camera-error">
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
              <line x1="9" y1="13" x2="15" y2="13" />
            </svg>
            <p>{error}</p>
            <button className="btn-ghost camera-error-btn" onClick={onClose}>
              Go Back
            </button>
          </div>
        )}

        {/* Live video feed */}
        <video
          ref={videoRef}
          className={`camera-video ${cameraReady && !captured ? 'visible' : ''}`}
          autoPlay
          playsInline
          muted
        />

        {/* Captured preview */}
        {captured && (
          <img src={captured} alt="Captured" className="camera-captured-img" />
        )}

        {/* Hidden canvas for capture */}
        <canvas ref={canvasRef} style={{ display: 'none' }} />

        {/* Corner guides */}
        {cameraReady && !captured && (
          <div className="camera-guides">
            <span className="guide-corner tl" />
            <span className="guide-corner tr" />
            <span className="guide-corner bl" />
            <span className="guide-corner br" />
            <p className="guide-text">Position the cattle within frame</p>
          </div>
        )}
      </div>

      {/* ── Controls ── */}
      <div className="camera-controls">
        {!captured ? (
          <>
            <button
              className="camera-btn-secondary"
              onClick={onClose}
              title="Back to upload"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M19 12H5M12 19l-7-7 7-7" />
              </svg>
            </button>

            <button
              className="camera-btn-shutter"
              onClick={handleCapture}
              disabled={!cameraReady}
              title="Take photo"
            >
              <span className="shutter-inner" />
            </button>

            <button
              className="camera-btn-secondary"
              onClick={handleSwitchCamera}
              disabled={!cameraReady}
              title="Switch camera"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M21 2v6h-6M3 12A9 9 0 0 1 15.47 3.47L21 8M3 22v-6h6M21 12A9 9 0 0 1 8.53 20.53L3 16" />
              </svg>
            </button>
          </>
        ) : (
          <>
            <button className="camera-btn-retake" onClick={handleRetake}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M21 2v6h-6M3 12A9 9 0 0 1 15.47 3.47L21 8" />
              </svg>
              Retake
            </button>

            <button className="camera-btn-use" onClick={handleUsePhoto}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="20 6 9 17 4 12" />
              </svg>
              Use Photo
            </button>
          </>
        )}
      </div>
    </div>
  );
}
