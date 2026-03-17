import { Mic, MicOff, Volume2 } from 'lucide-react';

export function MicButton({ listening, onClick, disabled }) {
  return (
    <button
      type="button"
      className={`pill-btn voice-btn ${listening ? 'listening' : ''}`}
      onClick={onClick}
      disabled={disabled}
      aria-label={listening ? 'Stop voice input' : 'Start voice input'}
      title={listening ? 'Stop listening' : 'Speak message'}
    >
      {listening ? <MicOff size={16} /> : <Mic size={16} />}
      {listening ? 'Listening...' : 'Speak'}
    </button>
  );
}

export function SpeakButton({ onClick, disabled }) {
  return (
    <button
      type="button"
      className="pill-btn voice-btn inline"
      onClick={onClick}
      disabled={disabled}
      aria-label="Read message aloud"
      title="Read message aloud"
    >
      <Volume2 size={14} /> Speak
    </button>
  );
}

export function AutoSpeakToggle({ checked, onChange }) {
  return (
    <label className="voice-toggle">
      <span>Auto read chatbot responses</span>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        className={`toggle-switch ${checked ? 'on' : ''}`}
        onClick={() => onChange(!checked)}
      >
        <span className="toggle-knob" />
      </button>
    </label>
  );
}
