/**
 * Speech Recognition Service
 * Handles speech-to-text conversion for Vietnamese and English using Web Speech API
 */

export type SpeechLanguage = 'vi' | 'en';

export interface SpeechRecognitionConfig {
  language: SpeechLanguage;
  continuous?: boolean;
  interimResults?: boolean;
}

export interface SpeechRecognitionResult {
  transcript: string;
  isFinal: boolean;
  confidence: number;
}

export interface SpeechRecognitionError {
  error: string;
  message: string;
}

// Language codes for Web Speech API
const LANGUAGE_CODES: Record<SpeechLanguage, string> = {
  vi: 'vi-VN',
  en: 'en-US',
};

// Get the appropriate Speech Recognition API
function getSpeechRecognition(): any {
  const SpeechRecognitionAPI =
    (window as any).SpeechRecognition ||
    (window as any).webkitSpeechRecognition ||
    (window as any).mozSpeechRecognition ||
    (window as any).msSpeechRecognition;

  return SpeechRecognitionAPI || null;
}

/**
 * Check if browser supports Web Speech API
 */
export function isSpeechRecognitionSupported(): boolean {
  return getSpeechRecognition() !== null;
}

/**
 * Create and configure speech recognition instance
 */
export function createSpeechRecognizer(config: SpeechRecognitionConfig) {
  const SpeechRecognitionAPI = getSpeechRecognition();

  if (!SpeechRecognitionAPI) {
    throw new Error('Speech Recognition API is not supported in this browser');
  }

  const recognition = new SpeechRecognitionAPI();

  // Set language
  recognition.lang = LANGUAGE_CODES[config.language];

  // Configure options
  recognition.continuous = config.continuous ?? false;
  recognition.interimResults = config.interimResults ?? true;
  recognition.maxAlternatives = 1;

  return recognition;
}

/**
 * Start speech recognition and return results via callbacks
 */
export function startSpeechRecognition(
  config: SpeechRecognitionConfig,
  onResult: (result: SpeechRecognitionResult) => void,
  onError: (error: SpeechRecognitionError) => void,
  onEnd: () => void
): () => void {
  try {
    const recognition = createSpeechRecognizer(config);

    recognition.onstart = () => {
      console.log('[Speech] Recognition started');
    };

    recognition.onresult = (event: any) => {
      let interimTranscript = '';
      let finalTranscript = '';
      let confidence = 0;

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript;
        confidence = event.results[i][0].confidence;

        if (event.results[i].isFinal) {
          finalTranscript += transcript + ' ';
        } else {
          interimTranscript += transcript;
        }
      }

      const isFinal = finalTranscript.length > 0;
      const transcript = isFinal ? finalTranscript.trim() : interimTranscript;

      if (transcript) {
        onResult({
          transcript,
          isFinal,
          confidence: Math.round(confidence * 100),
        });
      }
    };

    recognition.onerror = (event: any) => {
      const errorMap: Record<string, string> = {
        'no-speech': 'No speech was detected. Please try again.',
        'audio-capture': 'No microphone was found. Ensure that it is connected.',
        'network': 'Network error occurred.',
        'aborted': 'Speech recognition was aborted.',
        'service-not-allowed': 'Speech recognition service is not allowed.',
        'bad-grammar': 'Grammar error occurred.',
        'unknown': 'An unknown error occurred.',
      };

      const errorMessage = errorMap[event.error] || `Error: ${event.error}`;

      onError({
        error: event.error,
        message: errorMessage,
      });

      console.error('[Speech] Error:', event.error);
    };

    recognition.onend = () => {
      console.log('[Speech] Recognition ended');
      onEnd();
    };

    // Start recognition
    recognition.start();

    // Return stop function
    return () => {
      recognition.stop();
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    onError({
      error: 'initialization',
      message: errorMessage,
    });
    onEnd();
    return () => {};
  }
}

/**
 * Get language name for display
 */
export function getLanguageName(language: SpeechLanguage): string {
  return language === 'vi' ? 'Tiếng Việt' : 'English';
}

/**
 * Detect language from text (simple heuristic for UI purposes)
 */
export function detectLanguageFromText(text: string): SpeechLanguage {
  const vietnameseChars = /[àáảãạăằắẳẵặâầấẩẫậèéẻẽẹêềếểễệìíỉĩịòóỏõọôồốổỗộơờớởỡợùúủũụưừứửữựỳýỷỹỵđ]/i;
  return vietnameseChars.test(text) ? 'vi' : 'en';
}
