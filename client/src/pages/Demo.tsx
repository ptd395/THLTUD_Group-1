import React from 'react';
import { ChatPanel } from '@/components/ChatPanel';
import { SentimentPanel } from '@/components/SentimentPanel';
import { MetricsPanel } from '@/components/MetricsPanel';
import { VoiceDemoPanel } from '@/components/VoiceDemoPanel';

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
  return (
    <div className="min-h-screen bg-transparent">
      {/* Header */}
      <header className="border-b border-slate-200 bg-transparent">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Nova Tech Copilot</h1>
            <p className="text-sm text-muted-foreground">Sentiment Analysis Demo</p>
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
