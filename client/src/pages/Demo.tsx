import React from 'react';
import { ChatPanel } from '@/components/ChatPanel';
import { SentimentPanel } from '@/components/SentimentPanel';
import { MetricsPanel } from '@/components/MetricsPanel';
import { VoiceDemoPanel } from '@/components/VoiceDemoPanel';
import { Button } from '@/components/ui/button';
import { useLocation } from 'wouter';
import { Settings, Home } from 'lucide-react';

/**
 * Demo Screen: /demo
 * Main interface for chatbot sentiment analysis demonstration
 * 
 * Design Philosophy: Modern Data Dashboard
 * - Asymmetric layout with chat on left, analytics on right
 * - Real-time sentiment visualization with trend charts
 * - Voice demo harness for showcasing ASR/TTS pipeline
 */
export default function Demo() {
  const [, navigate] = useLocation();

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">AI Support Copilot</h1>
            <p className="text-sm text-muted-foreground">Sentiment Analysis Demo</p>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => navigate('/')}
              className="flex items-center gap-2"
            >
              <Home className="w-4 h-4" />
              Home
            </Button>
            <Button
              onClick={() => navigate('/settings/sentiment')}
              className="bg-primary hover:bg-primary/90 flex items-center gap-2"
            >
              <Settings className="w-4 h-4" />
              Settings
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column: Chat */}
          <div className="lg:col-span-2 space-y-6">
            <ChatPanel />
            <VoiceDemoPanel />
          </div>

          {/* Right Column: Analytics */}
          <div className="space-y-6">
            <SentimentPanel />
            <MetricsPanel />
          </div>
        </div>
      </main>
    </div>
  );
}
