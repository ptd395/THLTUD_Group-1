import React from 'react';
import { SentimentConfigForm } from '@/components/SentimentConfigForm';
import { Button } from '@/components/ui/button';
import { useLocation } from 'wouter';
import { ArrowLeft } from 'lucide-react';

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
  const [, navigate] = useLocation();

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Sentiment Configuration</h1>
            <p className="text-sm text-muted-foreground">Customize sentiment analysis behavior and thresholds</p>
          </div>
          <Button
            variant="outline"
            onClick={() => navigate('/demo')}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Demo
          </Button>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 py-8">
        <SentimentConfigForm />
      </main>
    </div>
  );
}
