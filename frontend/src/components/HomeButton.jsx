import { Link, useLocation } from 'react-router-dom';
import { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { Camera, CameraOff, Home, LayoutDashboard, Mic, MicOff } from 'lucide-react';

const CAMERA_ENABLED_KEY = 'manoshaanti_camera_enabled';
const MIC_ENABLED_KEY = 'manoshaanti_mic_enabled';

export default function HomeButton() {
  const location = useLocation();
  const isEntryPage = location.pathname === '/entry' || location.pathname === '/';
  const streamRef = useRef(null);
  const [showPrompt, setShowPrompt] = useState(false);
  const [cameraEnabled, setCameraEnabled] = useState(() => localStorage.getItem(CAMERA_ENABLED_KEY) !== '0');
  const [micEnabled, setMicEnabled] = useState(() => localStorage.getItem(MIC_ENABLED_KEY) !== '0');
  const [mediaError, setMediaError] = useState('');

  useEffect(() => {
    let mounted = true;

    async function checkStartupPermissions() {
      if (!navigator.mediaDevices?.getUserMedia) {
        if (mounted) {
          setShowPrompt(true);
        }
        return;
      }

      try {
        if (!navigator.permissions?.query) {
          if (mounted) {
            setShowPrompt(true);
          }
          return;
        }

        const [camStatus, micStatus] = await Promise.all([
          navigator.permissions.query({ name: 'camera' }),
          navigator.permissions.query({ name: 'microphone' }),
        ]);

        const fullyGranted = camStatus.state === 'granted' && micStatus.state === 'granted';
        if (mounted) {
          setShowPrompt(!fullyGranted);
        }

        if (!fullyGranted && camStatus.state !== 'denied' && micStatus.state !== 'denied') {
          const granted = await requestMediaAccess();
          if (mounted) {
            setShowPrompt(!granted);
          }
        }
      } catch {
        if (mounted) {
          setShowPrompt(true);
        }
      }
    }

    checkStartupPermissions();

    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    localStorage.setItem(CAMERA_ENABLED_KEY, cameraEnabled ? '1' : '0');
  }, [cameraEnabled]);

  useEffect(() => {
    localStorage.setItem(MIC_ENABLED_KEY, micEnabled ? '1' : '0');
  }, [micEnabled]);

  useEffect(() => () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
  }, []);

  function applyTrackState() {
    if (!streamRef.current) return;
    streamRef.current.getVideoTracks().forEach((track) => {
      track.enabled = cameraEnabled;
    });
    streamRef.current.getAudioTracks().forEach((track) => {
      track.enabled = micEnabled;
    });
  }

  async function requestMediaAccess() {
    setMediaError('');
    try {
      if (!navigator.mediaDevices?.getUserMedia) {
        setMediaError('Camera/mic controls are not supported in this browser.');
        return false;
      }

      if (!streamRef.current) {
        streamRef.current = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      }
      applyTrackState();
      return true;
    } catch {
      setMediaError('Permission denied or device unavailable. You can retry anytime.');
      return false;
    }
  }

  async function handleAllowAccess() {
    const granted = await requestMediaAccess();
    if (granted) {
      setShowPrompt(false);
    }
  }

  function handleDismissPrompt() {
    setShowPrompt(false);
  }

  async function toggleCamera() {
    const next = !cameraEnabled;
    setCameraEnabled(next);
    if (!streamRef.current && next) {
      await requestMediaAccess();
    }
    applyTrackState();
  }

  async function toggleMic() {
    const next = !micEnabled;
    setMicEnabled(next);
    if (!streamRef.current && next) {
      await requestMediaAccess();
    }
    applyTrackState();
  }

  return (
    <>
      <motion.div
        className="home-button-wrap"
        initial={{ opacity: 0, x: -16 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Link to="/entry" className="home-fab" aria-label="Home">
          <Home size={18} /> Home
        </Link>
      </motion.div>

      {showPrompt ? (
        <motion.div
          className="media-permission-card"
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35 }}
        >
          <p>
            For accessibility, allow camera and microphone access so voice and visual support features can be used.
          </p>
          <div className="media-permission-actions">
            <button type="button" className="pill-btn primary" onClick={handleAllowAccess}>
              Allow Access
            </button>
            <button type="button" className="pill-btn" onClick={handleDismissPrompt}>
              Maybe Later
            </button>
          </div>
        </motion.div>
      ) : null}

      {mediaError ? <p className="media-error-text">{mediaError}</p> : null}

      {isEntryPage ? (
        <>
          <motion.div
            className="mini-media-stack"
            initial={{ opacity: 0, x: 16 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.45 }}
          >
            <button
              type="button"
              className={`mini-media-btn ${cameraEnabled ? 'on' : 'off'}`}
              onClick={toggleCamera}
              aria-label={cameraEnabled ? 'Turn camera off' : 'Turn camera on'}
            >
              {cameraEnabled ? <Camera size={14} /> : <CameraOff size={14} />}
            </button>
            <button
              type="button"
              className={`mini-media-btn ${micEnabled ? 'on' : 'off'}`}
              onClick={toggleMic}
              aria-label={micEnabled ? 'Turn microphone off' : 'Turn microphone on'}
            >
              {micEnabled ? <Mic size={14} /> : <MicOff size={14} />}
            </button>
          </motion.div>

          <motion.div
            className="dashboard-button-wrap"
            initial={{ opacity: 0, x: 16 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Link to="/dashboard" className="home-fab" aria-label="Dashboard">
              <LayoutDashboard size={18} /> Dashboard
            </Link>
          </motion.div>
        </>
      ) : null}
    </>
  );
}
