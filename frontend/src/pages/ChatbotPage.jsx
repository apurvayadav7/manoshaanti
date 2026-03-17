import { useEffect, useMemo, useRef, useState } from 'react';
import { SendHorizonal } from 'lucide-react';
import ToggleSwitch from '../components/ToggleSwitch';
import { AutoSpeakToggle, MicButton, SpeakButton } from '../features/voice/VoiceControls';
import { createStt, isSttSupported } from '../features/voice/stt';
import { speak, stopSpeaking } from '../features/voice/tts';
import { useAuth } from '../context/AuthContext';
import { getApiError } from '../services/apiClient';
import { recognizeAsl, sendChatMessage, submitEmotion } from '../services/chatService';

const EMOTIONS = ['neutral', 'happy', 'sad', 'angry', 'fearful', 'surprised', 'disgusted'];
const FACE_API_SCRIPT_URL = 'https://cdn.jsdelivr.net/npm/face-api.js@0.22.2/dist/face-api.min.js';
const FACE_API_MODEL_URL = 'https://cdn.jsdelivr.net/gh/justadudewhohacks/face-api.js@master/weights';

function normalizeFaceEmotion(expressions) {
  if (!expressions || typeof expressions !== 'object') {
    return 'neutral';
  }

  let bestLabel = 'neutral';
  let bestScore = 0;

  for (const [label, score] of Object.entries(expressions)) {
    if (typeof score === 'number' && score > bestScore) {
      bestLabel = label;
      bestScore = score;
    }
  }

  if (bestScore < 0.5) {
    return 'neutral';
  }

  const mapped = bestLabel.toLowerCase();
  if (EMOTIONS.includes(mapped)) {
    return mapped;
  }

  return 'neutral';
}

export default function ChatbotPage() {
  const { user } = useAuth();
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const sttRef = useRef(null);
  const emotionHistoryRef = useRef([]);
  const processingRef = useRef(false);
  const [aslEnabled, setAslEnabled] = useState(false);
  const [emotion, setEmotion] = useState('neutral');
  const [aslSign, setAslSign] = useState('OFF');
  const [messages, setMessages] = useState([
    { role: 'assistant', content: 'Hi, I am Naina. I am here with you. How are you feeling today?' },
  ]);
  const [input, setInput] = useState('');
  const [cameraError, setCameraError] = useState('');
  const [chatError, setChatError] = useState('');
  const [emotionSyncError, setEmotionSyncError] = useState('');
  const [aslError, setAslError] = useState('');
  const [emotionModelReady, setEmotionModelReady] = useState(false);
  const [emotionModelError, setEmotionModelError] = useState('');
  const [autoSpeak, setAutoSpeak] = useState(false);
  const [listening, setListening] = useState(false);
  const [voiceError, setVoiceError] = useState('');
  const [sending, setSending] = useState(false);

  const sttSupported = useMemo(() => isSttSupported(), []);

  useEffect(() => {
    sttRef.current = createStt({
      onResult: (transcript) => {
        if (transcript) {
          setInput((prev) => (prev ? `${prev} ${transcript}`.trim() : transcript));
        }
      },
      onError: (errorCode) => {
        if (errorCode === 'not-allowed' || errorCode === 'service-not-allowed') {
          setVoiceError('Microphone permission denied. Please allow microphone access.');
        } else if (errorCode === 'no-speech') {
          setVoiceError('No speech detected. Please try again.');
        } else {
          setVoiceError('Voice input could not be processed. Please try again.');
        }
      },
      onEnd: () => setListening(false),
    });

    return () => {
      sttRef.current?.destroy?.();
      stopSpeaking();
    };
  }, []);

  useEffect(() => {
    let cancelled = false;

    async function ensureFaceApiLoaded() {
      try {
        if (!window.faceapi) {
          await new Promise((resolve, reject) => {
            const existingScript = document.querySelector('script[data-face-api="true"]');
            if (existingScript && window.faceapi) {
              resolve();
              return;
            }

            if (existingScript) {
              existingScript.addEventListener('load', () => resolve(), { once: true });
              existingScript.addEventListener('error', () => reject(new Error('Failed to load face-api script.')), { once: true });
              return;
            }

            const script = document.createElement('script');
            script.src = FACE_API_SCRIPT_URL;
            script.async = true;
            script.defer = true;
            script.setAttribute('data-face-api', 'true');
            script.onload = () => resolve();
            script.onerror = () => reject(new Error('Failed to load face-api script.'));
            document.body.appendChild(script);
          });
        }

        const faceapi = window.faceapi;
        await Promise.all([
          faceapi.nets.tinyFaceDetector.loadFromUri(FACE_API_MODEL_URL),
          faceapi.nets.faceExpressionNet.loadFromUri(FACE_API_MODEL_URL),
        ]);

        if (!cancelled) {
          setEmotionModelReady(true);
          setEmotionModelError('');
        }
      } catch {
        if (!cancelled) {
          setEmotionModelReady(false);
          setEmotionModelError('Face emotion model could not load. Check internet and retry.');
        }
      }
    }

    ensureFaceApiLoaded();

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    let stream;

    async function startCam() {
      try {
        stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false });
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      } catch {
        setCameraError('Camera access not available. Chat still works without camera insights.');
      }
    }

    startCam();

    return () => {
      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
      }
    };
  }, []);

  useEffect(() => {
    async function processFrame() {
      if (
        !videoRef.current
        || !canvasRef.current
        || videoRef.current.readyState < 2
        || processingRef.current
      ) {
        return;
      }

      processingRef.current = true;
      try {
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        canvas.width = 320;
        canvas.height = 180;
        ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);

        let nextEmotion = 'neutral';
        if (emotionModelReady && window.faceapi) {
          try {
            const faceapi = window.faceapi;
            const result = await faceapi
              .detectSingleFace(videoRef.current, new faceapi.TinyFaceDetectorOptions({ inputSize: 224, scoreThreshold: 0.5 }))
              .withFaceExpressions();

            if (result?.expressions) {
              const detected = normalizeFaceEmotion(result.expressions);
              emotionHistoryRef.current = [...emotionHistoryRef.current, detected].slice(-5);

              const emotionCounts = emotionHistoryRef.current.reduce((acc, value) => {
                acc[value] = (acc[value] || 0) + 1;
                return acc;
              }, {});

              const stableEmotion = emotionHistoryRef.current.reduce((best, current) => {
                if ((emotionCounts[current] || 0) >= (emotionCounts[best] || 0)) {
                  return current;
                }
                return best;
              }, detected);

              nextEmotion = EMOTIONS.includes(stableEmotion) ? stableEmotion : 'neutral';
              setEmotionModelError('');
            } else {
              emotionHistoryRef.current = [];
              nextEmotion = 'neutral';
            }
          } catch {
            nextEmotion = 'neutral';
            setEmotionModelError('Face emotion detection failed for this frame.');
          }
        }

        setEmotion(nextEmotion);

        try {
          await submitEmotion({ emotion: nextEmotion, userId: user?.id });
          setEmotionSyncError('');
        } catch (err) {
          setEmotionSyncError(getApiError(err, 'Emotion sync unavailable.'));
        }

        if (aslEnabled) {
          try {
            const frameBase64 = canvas.toDataURL('image/jpeg', 0.6);
            const response = await recognizeAsl({ frameBase64 });
            setAslSign(response?.hand_detected === false ? 'No hand detected' : (response?.gesture || 'No hand detected'));
            setAslError('');
          } catch (err) {
            setAslSign('ASL unavailable');
            setAslError(getApiError(err, 'ASL service unavailable. Start AI service on port 8000.'));
          }
        } else {
          setAslSign('OFF');
          setAslError('');
        }
      } finally {
        processingRef.current = false;
      }
    }

    processFrame();
    const interval = setInterval(processFrame, 1500);

    return () => clearInterval(interval);
  }, [aslEnabled, emotionModelReady, user?.id]);

  const canSend = useMemo(() => input.trim() && !sending, [input, sending]);

  function toggleListening() {
    if (!sttSupported) {
      setVoiceError('Voice input is not supported in this browser.');
      return;
    }

    setVoiceError('');

    if (listening) {
      sttRef.current?.stop?.();
      setListening(false);
      return;
    }

    try {
      sttRef.current?.start?.();
      setListening(true);
    } catch {
      setListening(false);
      setVoiceError('Voice input could not start. Please try again.');
    }
  }

  function speakMessage(messageText) {
    const result = speak(messageText, { language: 'en-US' });
    if (!result.ok && result.error) {
      setVoiceError(result.error);
    }
  }

  async function handleSend(event) {
    event.preventDefault();
    const message = input.trim();
    if (!message || sending) return;

    setChatError('');
    setSending(true);
    setInput('');
    setMessages((prev) => [...prev, { role: 'user', content: message }]);

    try {
      const data = await sendChatMessage({ message, userId: user?.id });
      const reply = data.reply || 'I am Naina, and I am listening.';
      setMessages((prev) => [...prev, { role: 'assistant', content: reply }]);
      if (autoSpeak) {
        speakMessage(reply);
      }
    } catch (err) {
      setChatError(getApiError(err, 'Chat service unavailable.'));
      setMessages((prev) => [
        ...prev,
        { role: 'assistant', content: 'I am Naina, and I am having trouble connecting right now. Please retry shortly.' },
      ]);
    } finally {
      setSending(false);
    }
  }

  return (
    <div className="page-container chat-layout">
      <aside className="soft-panel chat-side-panel">
        <h3>Camera Feedback</h3>
        <video ref={videoRef} autoPlay muted playsInline className="camera-preview" />
        <canvas ref={canvasRef} style={{ display: 'none' }} />
        <div className="meta-card">Emotion detected: <strong>{emotion}</strong></div>
        <div className="meta-card">ASL sign detected: <strong>{aslSign}</strong></div>
        <div className="meta-card">Face model: <strong>{emotionModelReady ? 'Ready' : 'Loading...'}</strong></div>
        <ToggleSwitch checked={aslEnabled} onChange={setAslEnabled} label="ASL Detection" />
        {cameraError ? <p className="error-text">{cameraError}</p> : null}
        {emotionModelError ? <p className="error-text">{emotionModelError}</p> : null}
        {emotionSyncError ? <p className="error-text">{emotionSyncError}</p> : null}
        {aslError ? <p className="error-text">{aslError}</p> : null}
      </aside>

      <section className="soft-panel chat-main-panel">
        <h2>Naina AI Chat</h2>
        <AutoSpeakToggle checked={autoSpeak} onChange={setAutoSpeak} />
        <div className="chat-thread">
          {messages.map((item, idx) => (
            <div key={`${item.role}-${idx}`} className={`bubble ${item.role === 'user' ? 'user' : 'assistant'}`}>
              <div className="bubble-content">{item.content}</div>
              {item.role === 'assistant' ? (
                <div className="bubble-actions">
                  <SpeakButton onClick={() => speakMessage(item.content)} />
                </div>
              ) : null}
            </div>
          ))}
        </div>

        <form className="chat-form" onSubmit={handleSend}>
          <input
            className="soft-input"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Share what is on your mind..."
          />
          <MicButton listening={listening} onClick={toggleListening} disabled={!sttSupported} />
          <button className="pill-btn primary" type="submit" disabled={!canSend}>
            <SendHorizonal size={16} /> Send
          </button>
        </form>

        {!sttSupported ? <p className="soft-note">Voice input is not supported in this browser.</p> : null}
        {voiceError ? <p className="error-text">{voiceError}</p> : null}

        {!user ? (
          <p className="soft-note">
            Anonymous mode: this chat is temporary and not permanently stored.
          </p>
        ) : null}
        {chatError ? <p className="error-text">{chatError}</p> : null}
      </section>
    </div>
  );
}
