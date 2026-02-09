import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Clock, Zap, MessageSquare, AlertTriangle } from 'lucide-react';

interface MetricsPanelProps {
  llmLatency?: number;
  totalLatency?: number;
  messageCount?: number;
  escalationCount?: number;
}

export function MetricsPanel({
  llmLatency = 245,
  totalLatency = 312,
  messageCount = 0,
  escalationCount = 0,
}: MetricsPanelProps) {
  return (
    <div className="space-y-4">
      {/* Latency Cards */}
      <div className="grid grid-cols-2 gap-3">
        <Card className="bg-card border-border">
          <CardContent className="pt-4">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs text-muted-foreground mb-1">LLM Latency</p>
                <p className="text-2xl font-bold text-foreground">{llmLatency}ms</p>
              </div>
              <Zap className="w-5 h-5 text-amber-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card border-border">
          <CardContent className="pt-4">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs text-muted-foreground mb-1">Total Latency</p>
                <p className="text-2xl font-bold text-foreground">{totalLatency}ms</p>
              </div>
              <Clock className="w-5 h-5 text-blue-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Conversation Metrics */}
      <Card className="bg-card border-border">
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <MessageSquare className="w-5 h-5" />
            Conversation Stats
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Total Messages</span>
            <span className="font-semibold text-lg">{messageCount}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Average Response Time</span>
            <span className="font-semibold">{totalLatency}ms</span>
          </div>
        </CardContent>
      </Card>

      {/* Escalation Metrics */}
      <Card className={`border-border ${escalationCount > 0 ? 'bg-red-50 dark:bg-red-950/20' : 'bg-card'}`}>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <AlertTriangle className={`w-5 h-5 ${escalationCount > 0 ? 'text-red-600' : 'text-muted-foreground'}`} />
            Escalations
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Total Escalations</span>
            <span className={`font-semibold text-lg ${escalationCount > 0 ? 'text-red-600' : 'text-foreground'}`}>
              {escalationCount}
            </span>
          </div>
        </CardContent>
      </Card>

      {/* Performance Indicator */}
      <Card className="bg-card border-border">
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Performance</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-muted-foreground">Response Speed</span>
              <span className="text-xs font-semibold text-green-600">Good</span>
            </div>
            <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
              <div className="h-full bg-green-500" style={{ width: '85%' }} />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
