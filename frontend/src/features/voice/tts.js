export function isTtsSupported() {
  return typeof window !== 'undefined' && 'speechSynthesis' in window && 'SpeechSynthesisUtterance' in window;
}

export function stopSpeaking() {
  if (!isTtsSupported()) return;
  window.speechSynthesis.cancel();
}

export function speak(text, options = {}) {
  if (!isTtsSupported()) {
    return { ok: false, error: 'Text-to-speech is not supported in this browser.' };
  }

  const trimmed = (text || '').toString().trim();
  if (!trimmed) {
    return { ok: false, error: 'No text available to speak.' };
  }

  const utterance = new window.SpeechSynthesisUtterance(trimmed);
  utterance.lang = options.language || 'en-US';
  utterance.rate = typeof options.rate === 'number' ? options.rate : 1;
  utterance.pitch = typeof options.pitch === 'number' ? options.pitch : 1;
  utterance.volume = typeof options.volume === 'number' ? options.volume : 1;

  window.speechSynthesis.cancel();
  window.speechSynthesis.speak(utterance);

  return { ok: true };
}
