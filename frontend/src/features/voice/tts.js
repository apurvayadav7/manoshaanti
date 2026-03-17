export function isTtsSupported() {
  return typeof window !== 'undefined' && 'speechSynthesis' in window && 'SpeechSynthesisUtterance' in window;
}

function scoreVoice(voice, language) {
  const name = (voice?.name || '').toLowerCase();
  const lang = (voice?.lang || '').toLowerCase();
  const normalizedLang = (language || 'en-us').toLowerCase();
  const langPrefix = normalizedLang.split('-')[0];

  let score = 0;

  if (lang === normalizedLang) score += 25;
  if (lang.startsWith(langPrefix)) score += 12;

  // Prefer voices commonly perceived as soft/feminine for wellness narration.
  if (/(female|woman|zira|jenny|aria|samantha|victoria|karen|moira|eva|emma|amy|salli|joanna|serena|sonia|natasha)/.test(name)) {
    score += 40;
  }

  if (/(male|man|david|mark|george|james|alex|guy)/.test(name)) {
    score -= 30;
  }

  if (/(neural|natural|enhanced|premium)/.test(name)) {
    score += 8;
  }

  return score;
}

function pickPreferredVoice(language) {
  const voices = window.speechSynthesis.getVoices() || [];
  if (!voices.length) return null;

  const ranked = [...voices].sort((a, b) => scoreVoice(b, language) - scoreVoice(a, language));
  return ranked[0] || null;
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
  const language = options.language || 'en-US';
  const preferredVoice = pickPreferredVoice(language);

  utterance.lang = preferredVoice?.lang || language;
  if (preferredVoice) {
    utterance.voice = preferredVoice;
  }

  // Slightly slower rate and softer pitch for a calmer speaking style.
  utterance.rate = typeof options.rate === 'number' ? options.rate : 0.92;
  utterance.pitch = typeof options.pitch === 'number' ? options.pitch : 1.06;
  utterance.volume = typeof options.volume === 'number' ? options.volume : 1;

  window.speechSynthesis.cancel();
  window.speechSynthesis.speak(utterance);

  return { ok: true };
}
