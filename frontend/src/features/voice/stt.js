function getRecognitionConstructor() {
  if (typeof window === 'undefined') return null;
  return window.SpeechRecognition || window.webkitSpeechRecognition || null;
}

export function isSttSupported() {
  return Boolean(getRecognitionConstructor());
}

export function createStt({ onResult, onError, onEnd } = {}) {
  const RecognitionCtor = getRecognitionConstructor();
  if (!RecognitionCtor) {
    return {
      supported: false,
      start: () => {},
      stop: () => {},
      destroy: () => {},
    };
  }

  const recognition = new RecognitionCtor();
  recognition.lang = 'en-US';
  recognition.continuous = false;
  recognition.interimResults = false;

  recognition.onresult = (event) => {
    const transcript = event?.results?.[0]?.[0]?.transcript || '';
    if (typeof onResult === 'function') {
      onResult(transcript.trim());
    }
  };

  recognition.onerror = (event) => {
    if (typeof onError === 'function') {
      onError(event?.error || 'unknown');
    }
  };

  recognition.onend = () => {
    if (typeof onEnd === 'function') {
      onEnd();
    }
  };

  return {
    supported: true,
    start: () => recognition.start(),
    stop: () => recognition.stop(),
    destroy: () => recognition.abort(),
  };
}
