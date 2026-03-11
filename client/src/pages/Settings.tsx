import React from 'react';
import { SentimentConfigForm } from '@/components/SentimentConfigForm';

/**
 * Settings Screen: /settings/sentiment
 * Configuration interface for sentiment analysis behavior
 * 
 * Design Philosophy: Modern Data Dashboard
 * - Tabbed interface for organized configuration
 * - Live preview for immediate feedback
 * - Clear threshold visualization
 */
export default function Settings() {
  return (
    <div className="min-h-screen bg-transparent">
      {/* Header */}
      <header className="border-b border-slate-200 bg-transparent">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Sentiment Configuration</h1>
            <p className="text-sm text-muted-foreground">Customize sentiment analysis behavior and thresholds</p>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 py-8">
        <SentimentConfigForm />
      </main>
    </div>
  );
}
