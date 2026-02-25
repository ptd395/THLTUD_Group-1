import React from 'react';
import { useAuth } from '@/_core/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useLocation } from 'wouter';
import { MessageSquare, Settings, Zap, BarChart3, Mic, ArrowRight } from 'lucide-react';

/**
 * Home Landing Page: /
 * Introduction to AI Support Copilot MVP
 * 
 * Design Philosophy: Modern Data Dashboard
 * - Clear value proposition
 * - Feature highlights with icons
 * - Direct CTA to demo
 */
export default function Home() {
  // The userAuth hooks provides authentication state
  // To implement login/logout functionality, simply call logout() or redirect to getLoginUrl()
  let { user, loading, error, isAuthenticated, logout } = useAuth();

  const [, navigate] = useLocation();

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <h1 className="text-3xl font-bold text-foreground">AI Support Copilot</h1>
          <p className="text-muted-foreground">Real-time sentiment analysis for support teams</p>
        </div>
      </header>

      {/* Hero Section */}
      <section className="max-w-6xl mx-auto px-4 py-12">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-foreground mb-4">
            Understand Customer Sentiment in Real Time
          </h2>
          <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
            The AI Support Copilot analyzes customer sentiment across multilingual conversations,
            providing agents with actionable insights and escalation alerts to improve support outcomes.
          </p>
          <Button
            onClick={() => navigate('/demo')}
            className="bg-primary hover:bg-primary/90 text-lg px-8 py-6 h-auto flex items-center gap-2"
          >
            Launch Demo
            <ArrowRight className="w-5 h-5" />
          </Button>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          {/* Feature 1: Multilingual */}
          <Card className="bg-card border-border hover:shadow-lg transition-shadow">
            <CardHeader>
              <MessageSquare className="w-8 h-8 text-primary mb-2" />
              <CardTitle>Multilingual Support</CardTitle>
              <CardDescription>Vietnamese & English</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Automatic language detection with consistent sentiment scoring across languages
              </p>
            </CardContent>
          </Card>

          {/* Feature 2: Real-time Analysis */}
          <Card className="bg-card border-border hover:shadow-lg transition-shadow">
            <CardHeader>
              <Zap className="w-8 h-8 text-amber-500 mb-2" />
              <CardTitle>Real-time Analysis</CardTitle>
              <CardDescription>Instant Insights</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Analyze sentiment as conversations happen with live trend visualization
              </p>
            </CardContent>
          </Card>

          {/* Feature 3: Metrics Dashboard */}
          <Card className="bg-card border-border hover:shadow-lg transition-shadow">
            <CardHeader>
              <BarChart3 className="w-8 h-8 text-blue-500 mb-2" />
              <CardTitle>Metrics Dashboard</CardTitle>
              <CardDescription>Comprehensive Insights</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Track average sentiment, negative rates, volatility, and escalation counts
              </p>
            </CardContent>
          </Card>

          {/* Feature 4: Configuration */}
          <Card className="bg-card border-border hover:shadow-lg transition-shadow">
            <CardHeader>
              <Settings className="w-8 h-8 text-cyan-500 mb-2" />
              <CardTitle>Configurable Thresholds</CardTitle>
              <CardDescription>Customizable Rules</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Adjust sentiment thresholds and escalation triggers to match your workflow
              </p>
            </CardContent>
          </Card>

          {/* Feature 5: Voice Demo */}
          <Card className="bg-card border-border hover:shadow-lg transition-shadow">
            <CardHeader>
              <Mic className="w-8 h-8 text-red-500 mb-2" />
              <CardTitle>Voice Demo Harness</CardTitle>
              <CardDescription>ASR/TTS Pipeline</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Showcase voice transcription and sentiment analysis with latency breakdown
              </p>
            </CardContent>
          </Card>

          {/* Feature 6: Escalation Alerts */}
          <Card className="bg-card border-border hover:shadow-lg transition-shadow">
            <CardHeader>
              <AlertTriangle className="w-8 h-8 text-orange-500 mb-2" />
              <CardTitle>Smart Escalation</CardTitle>
              <CardDescription>Proactive Alerts</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Automatic escalation suggestions based on sentiment trends and thresholds
              </p>
            </CardContent>
          </Card>
        </div>

        {/* CTA Section */}
        <div className="bg-primary/5 border border-primary/20 rounded-lg p-8 text-center">
          <h3 className="text-2xl font-bold text-foreground mb-3">Ready to See It in Action?</h3>
          <p className="text-muted-foreground mb-6">
            Launch the demo to experience real-time sentiment analysis with multilingual support
          </p>
          <Button
            onClick={() => navigate('/demo')}
            className="bg-primary hover:bg-primary/90 px-8 py-3 h-auto"
          >
            Start Demo Now
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border bg-card mt-12">
        <div className="max-w-6xl mx-auto px-4 py-6 text-center text-sm text-muted-foreground">
          <p>AI Support Copilot MVP • Sentiment Analysis & Metrics Configuration</p>
        </div>
      </footer>
    </div>
  );
}

// Missing icon import - add this
const AlertTriangle = ({ className }: { className: string }) => (
  <svg
    className={className}
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M12 9v2m0 4v2m0 0v2m0-6v-2m0 0V7a2 2 0 012-2h2.586a1 1 0 00.707-.293l1.414-1.414A2 2 0 0021 4.172V6a2 2 0 01-2 2h-2.586a1 1 0 00-.707.293l-1.414 1.414A2 2 0 003 12m0 0v2a2 2 0 002 2h2.586a1 1 0 00.707-.293l1.414-1.414A2 2 0 0012 12m0 0V9"
    />
  </svg>
);
