import React, { useState, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Mic, Square, Volume2, Loader2 } from 'lucide-react';

interface VoiceMetrics {
  asrMs: number;
  llmMs: number;
  ttsMs: number;
  transcript: string;
  language: 'vi' | 'en';
}

export function VoiceDemoPanel() {
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [lastMetrics, setLastMetrics] = useState<VoiceMetrics | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        audioChunksRef.current.push(event.data);
      };

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/wav' });
        await processAudio(audioBlob);
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
    } catch (error) {
      console.error('Error accessing microphone:', error);
      alert('Unable to access microphone. Please check permissions.');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      setIsProcessing(true);
    }
  };

  const processAudio = async (audioBlob: Blob) => {
    // Simulate API calls with mock latencies
    const asrMs = 150 + Math.random() * 100;
    const llmMs = 200 + Math.random() * 150;
    const ttsMs = 100 + Math.random() * 80;

    // Mock transcript
    const mockTranscripts = {
      vi: 'Xin chào, tôi cần giúp đỡ với đơn hàng của tôi',
      en: 'Hello, I need help with my order',
    };

    const language = Math.random() > 0.5 ? 'vi' : 'en';

    setLastMetrics({
      asrMs: Math.round(asrMs),
      llmMs: Math.round(llmMs),
      ttsMs: Math.round(ttsMs),
      transcript: mockTranscripts[language],
      language,
    });

    setIsProcessing(false);

    // Play mock audio response
    playMockAudio();
  };

  const playMockAudio = () => {
    // Create a simple beep sound to simulate TTS
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);

    oscillator.frequency.value = 800;
    oscillator.type = 'sine';

    gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);

    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + 0.5);
  };

  return (
    <Card className="bg-card border-border">
      <CardHeader className="pb-3">
        <CardTitle className="text-base">Voice Demo Harness</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Recording Controls */}
        <div className="flex gap-2">
          {!isRecording ? (
            <Button
              onClick={startRecording}
              disabled={isProcessing}
              className="flex-1 bg-primary hover:bg-primary/90"
            >
              <Mic className="w-4 h-4 mr-2" />
              Start Recording
            </Button>
          ) : (
            <Button
              onClick={stopRecording}
              variant="destructive"
              className="flex-1"
            >
              <Square className="w-4 h-4 mr-2" />
              Stop Recording
            </Button>
          )}
          {isProcessing && <Loader2 className="w-4 h-4 animate-spin" />}
        </div>

        {/* Recording Indicator */}
        {isRecording && (
          <div className="flex items-center gap-2 p-3 bg-red-50 dark:bg-red-950/20 rounded-lg">
            <div className="w-2 h-2 bg-red-600 rounded-full animate-pulse" />
            <span className="text-sm text-red-600 dark:text-red-400">Recording...</span>
          </div>
        )}

        {/* Last Metrics */}
        {lastMetrics && (
          <div className="space-y-3 p-3 bg-muted rounded-lg">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Transcript</span>
              <Badge variant="outline">{lastMetrics.language.toUpperCase()}</Badge>
            </div>
            <p className="text-sm font-medium text-foreground italic">
              "{lastMetrics.transcript}"
            </p>

            <div className="grid grid-cols-3 gap-2 pt-2 border-t border-border">
              <div>
                <p className="text-xs text-muted-foreground mb-1">ASR</p>
                <p className="font-semibold text-sm">{lastMetrics.asrMs}ms</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground mb-1">LLM</p>
                <p className="font-semibold text-sm">{lastMetrics.llmMs}ms</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground mb-1">TTS</p>
                <p className="font-semibold text-sm">{lastMetrics.ttsMs}ms</p>
              </div>
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-border">
              <span className="text-xs text-muted-foreground">Total</span>
              <span className="font-semibold">
                {lastMetrics.asrMs + lastMetrics.llmMs + lastMetrics.ttsMs}ms
              </span>
            </div>
          </div>
        )}

        {/* Info */}
        <div className="p-3 bg-blue-50 dark:bg-blue-950/20 rounded-lg text-sm text-blue-900 dark:text-blue-100">
          <p className="font-semibold mb-1">Demo Mode</p>
          <p className="text-xs">
            This voice harness demonstrates the sentiment analysis pipeline. In production, this would integrate with a real ASR service and agent-assist system.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
