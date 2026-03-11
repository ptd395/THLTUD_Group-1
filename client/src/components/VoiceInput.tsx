import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Mic, MicOff, Volume2, AlertCircle } from 'lucide-react';
import {
  isSpeechRecognitionSupported,
  startSpeechRecognition,
  type SpeechLanguage,
  getLanguageName,
} from '@/lib/speechRecognition';

interface VoiceInputProps {
  onTranscript: (text: string) => void;
  language: SpeechLanguage;
  onLanguageChange: (language: SpeechLanguage) => void;
}

export default function VoiceInput({ onTranscript, language, onLanguageChange }: VoiceInputProps) {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [interimTranscript, setInterimTranscript] = useState('');
  const [confidence, setConfidence] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [isSupported] = useState(isSpeechRecognitionSupported());
  const stopRecognitionRef = useRef<() => void>(() => {});

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
      },
      () => {
        setIsListening(false);
      }
    );
  };

  const handleStopListening = () => {
    stopRecognitionRef.current();
    setIsListening(false);
  };

  const handleSendTranscript = () => {
    if (transcript.trim()) {
      onTranscript(transcript);
      setTranscript('');
      setInterimTranscript('');
      setConfidence(0);
    }
  };

  const handleClear = () => {
    setTranscript('');
    setInterimTranscript('');
    setConfidence(0);
    setError(null);
  };

  if (!isSupported) {
    return (
      <div className="p-4 bg-destructive/10 border border-destructive rounded-lg flex items-start gap-3">
        <AlertCircle className="w-5 h-5 text-destructive flex-shrink-0 mt-0.5" />
        <div>
          <p className="font-medium text-destructive">Speech Recognition Not Supported</p>
          <p className="text-sm text-destructive/80">
            Your browser doesn't support speech recognition. Please use Chrome, Edge, or Safari.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-3 p-4 bg-card border border-border rounded-lg">
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

      {/* Recording Status */}
      {isListening && (
        <div className="flex items-center gap-2 text-primary">
          <Volume2 className="w-4 h-4 animate-pulse" />
          <span className="text-sm font-medium">Listening...</span>
        </div>
      )}

      {/* Transcript Display */}
      <div className="space-y-2">
        {transcript && (
          <div className="p-3 bg-muted rounded border border-border">
            <p className="text-sm text-foreground">{transcript}</p>
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
          <div className="p-3 bg-muted/50 rounded border border-border italic text-muted-foreground">
            <p className="text-sm">{interimTranscript}</p>
          </div>
        )}
      </div>

      {/* Error Display */}
      {error && (
        <div className="p-3 bg-destructive/10 border border-destructive rounded">
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
            <MicOff className="w-4 h-4" />
            Stop Recording
          </Button>
        )}

        {transcript && (
          <>
            <Button onClick={handleClear} variant="outline">
              Clear
            </Button>
            <Button onClick={handleSendTranscript} className="flex-1 bg-primary hover:bg-primary/90">
              Send
            </Button>
          </>
        )}
      </div>

      {/* Info Text */}
      <p className="text-xs text-muted-foreground">
        Click "Start Recording" and speak clearly. The transcription will appear below.
      </p>
    </div>
  );
}
