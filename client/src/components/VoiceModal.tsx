import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { X, Mic, RotateCcw } from 'lucide-react';
import {
  isSpeechRecognitionSupported,
  startSpeechRecognition,
  type SpeechLanguage,
} from '@/lib/speechRecognition';

interface VoiceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onTranscript: (text: string) => void;
  language: SpeechLanguage;
  onLanguageChange: (language: SpeechLanguage) => void;
}

export default function VoiceModal({
  isOpen,
  onClose,
  onTranscript,
  language,
  onLanguageChange,
}: VoiceModalProps) {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [interimTranscript, setInterimTranscript] = useState('');
  const [confidence, setConfidence] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [isSupported] = useState(isSpeechRecognitionSupported());
  const [waveformBars, setWaveformBars] = useState<number[]>(Array(12).fill(0.2));
  const stopRecognitionRef = useRef<() => void>(() => {});
  const waveformIntervalRef = useRef<NodeJS.Timeout | undefined>(undefined);

  const animateWaveform = () => {
    waveformIntervalRef.current = setInterval(() => {
      setWaveformBars((prev: number[]) =>
        prev.map(() => Math.random() * 0.8 + 0.2)
      );
    }, 100);
  };

  const stopWaveformAnimation = () => {
    if (waveformIntervalRef.current !== undefined) {
      clearInterval(waveformIntervalRef.current);
    }
    setWaveformBars(Array(12).fill(0.2));
  };

  const handleStartListening = () => {
    if (!isSupported) {
      setError('Speech recognition is not supported in your browser');
      return;
    }

    setError(null);
    setTranscript('');
    setInterimTranscript('');
    setConfidence(0);
    setIsListening(true);
    animateWaveform();

    stopRecognitionRef.current = startSpeechRecognition(
      { language, continuous: false, interimResults: true },
      (result) => {
        if (result.isFinal) {
          setTranscript(result.transcript);
          setInterimTranscript('');
          setConfidence(result.confidence);
        } else {
          setInterimTranscript(result.transcript);
        }
      },
      (error) => {
        setError(error.message);
        setIsListening(false);
        stopWaveformAnimation();
      },
      () => {
        setIsListening(false);
        stopWaveformAnimation();
      }
    );
  };

  const handleStopListening = () => {
    stopRecognitionRef.current();
    setIsListening(false);
    stopWaveformAnimation();
  };

  const handleSendTranscript = () => {
    if (transcript.trim()) {
      onTranscript(transcript);
      handleClose();
    }
  };

  const handleClose = () => {
    if (isListening) {
      handleStopListening();
    }
    setTranscript('');
    setInterimTranscript('');
    setConfidence(0);
    setError(null);
    onClose();
  };

  const handleReset = () => {
    if (isListening) {
      handleStopListening();
    }
    setTranscript('');
    setInterimTranscript('');
    setConfidence(0);
    setError(null);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-card rounded-lg border border-border shadow-lg max-w-md w-full mx-4">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-border">
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-semibold text-foreground">Voice Input</h2>
            {isListening && (
              <Badge className="bg-red-500 animate-pulse">LIVE</Badge>
            )}
          </div>
          <button
            onClick={handleClose}
            className="text-muted-foreground hover:text-foreground transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Language Selection */}
          <div className="flex items-center gap-2">
            <label className="text-sm font-medium text-foreground">Language:</label>
            <Select value={language} onValueChange={(value: any) => onLanguageChange(value)}>
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="vi">Tiếng Việt</SelectItem>
                <SelectItem value="en">English</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Waveform Visualization */}
          <div className="flex items-center justify-center gap-1 h-20 bg-muted/30 rounded-lg p-4">
            {waveformBars.map((height, i) => (
              <div
                key={i}
                className="flex-1 bg-gradient-to-t from-primary to-primary/60 rounded-full transition-all duration-100"
                style={{
                  height: `${Math.max(20, height * 100)}%`,
                  opacity: isListening ? 1 : 0.3,
                }}
              />
            ))}
          </div>

          {/* Transcription Display */}
          <div className="space-y-2">
            {transcript && (
              <div className="p-3 bg-primary/10 border border-primary/30 rounded-lg">
                <p className="text-sm text-foreground font-medium">{transcript}</p>
                {confidence > 0 && (
                  <div className="mt-2 flex items-center gap-2">
                    <Badge variant="outline" className="text-xs">
                      {confidence}% confidence
                    </Badge>
                  </div>
                )}
              </div>
            )}

            {interimTranscript && !transcript && (
              <div className="p-3 bg-muted/50 rounded-lg border border-border">
                <p className="text-sm text-muted-foreground italic">{interimTranscript}</p>
              </div>
            )}

            {!transcript && !interimTranscript && !isListening && (
              <div className="p-3 text-center text-muted-foreground">
                <p className="text-sm">Click "Start Recording" and speak clearly</p>
              </div>
            )}
          </div>

          {/* Error Display */}
          {error && (
            <div className="p-3 bg-destructive/10 border border-destructive rounded-lg">
              <p className="text-sm text-destructive">{error}</p>
            </div>
          )}

          {/* Controls */}
          <div className="flex gap-2">
            {!isListening ? (
              <Button
                onClick={handleStartListening}
                className="flex-1 bg-primary hover:bg-primary/90 gap-2"
              >
                <Mic className="w-4 h-4" />
                Start Recording
              </Button>
            ) : (
              <Button
                onClick={handleStopListening}
                variant="destructive"
                className="flex-1 gap-2"
              >
                Stop Recording
              </Button>
            )}

            {transcript && (
              <Button
                onClick={handleReset}
                variant="outline"
                size="icon"
                title="Reset"
              >
                <RotateCcw className="w-4 h-4" />
              </Button>
            )}
          </div>

          {/* Action Buttons */}
          {transcript && (
            <div className="flex gap-2 pt-2">
              <Button
                onClick={handleSendTranscript}
                className="flex-1 bg-primary hover:bg-primary/90"
              >
                Use Transcript & Send
              </Button>
              <Button
                onClick={handleClose}
                variant="outline"
                className="flex-1"
              >
                Cancel
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
