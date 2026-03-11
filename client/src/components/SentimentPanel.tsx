import React, { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useSentiment } from '@/contexts/SentimentContext';
import { getSentimentColor, calculateMetrics, checkEscalationTrigger } from '@/lib/sentiment';
import { AlertCircle, TrendingDown, TrendingUp } from 'lucide-react';

export function SentimentPanel() {
  const { config, conversationHistory } = useSentiment();

  const sentiments = useMemo(() => {
    return conversationHistory.map((item, index) => ({
      turn: index + 1,
      score: item.sentiment.score,
      label: item.sentiment.label,
    }));
  }, [conversationHistory]);

  const metrics = useMemo(() => {
    const sentimentScores = conversationHistory.map(h => h.sentiment);
    return calculateMetrics(sentimentScores, config);
  }, [conversationHistory, config]);

  const triggers = useMemo(() => {
    const sentimentScores = conversationHistory.map(h => h.sentiment);
    return checkEscalationTrigger(sentimentScores, config);
  }, [conversationHistory, config]);

  const currentSentiment = conversationHistory.length > 0
    ? conversationHistory[conversationHistory.length - 1].sentiment
    : null;

  const gaugeValue = currentSentiment ? ((currentSentiment.score + 1) / 2) * 100 : 50;
  const clampedGaugeValue = Math.min(98, Math.max(2, gaugeValue));

  return (
    <div className="space-y-4">
      {/* Current Sentiment Card */}
      <Card className="bg-card border-border">
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Current Sentiment</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {currentSentiment ? (
            <>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Sentiment</p>
                  <Badge
                    style={{
                      backgroundColor: getSentimentColor(currentSentiment.score),
                      color: 'white',
                    }}
                  >
                    {currentSentiment.label}
                  </Badge>
                </div>
                <div className="text-right">
                  <p className="text-sm text-muted-foreground mb-1">Score</p>
                  <p className="text-2xl font-bold text-foreground">
                    {currentSentiment.score.toFixed(2)}
                  </p>
                </div>
              </div>

              {/* Gauge */}
              <div className="space-y-2">
                <p className="text-xs text-muted-foreground">Sentiment Range</p>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-muted-foreground">Negative</span>
                  <div className="relative h-6 flex-1">
                    <div className="absolute inset-x-0 top-1/2 h-2 -translate-y-1/2 rounded-full bg-gradient-to-r from-red-500 via-amber-500 to-green-500" />
                    <div
                      className="absolute top-1/2 h-4 w-4 -translate-x-1/2 -translate-y-1/2 rounded-full bg-foreground shadow-lg transition-[left] duration-300"
                      style={{ left: `${clampedGaugeValue}%` }}
                    />
                  </div>
                  <span className="text-xs text-muted-foreground">Positive</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 pt-2">
                <div className="text-xs">
                  <p className="text-muted-foreground mb-1">Confidence</p>
                  <p className="font-semibold">{(currentSentiment.confidence * 100).toFixed(0)}%</p>
                </div>
                <div className="text-xs">
                  <p className="text-muted-foreground mb-1">Turns</p>
                  <p className="font-semibold">{conversationHistory.length}</p>
                </div>
              </div>
            </>
          ) : (
            <p className="text-sm text-muted-foreground text-center py-4">No sentiment data yet</p>
          )}
        </CardContent>
      </Card>

      {/* Sentiment Trend Chart */}
      {sentiments.length > 0 && (
        <Card className="bg-card border-border">
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Sentiment Trend</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={sentiments}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="turn" stroke="#6b7280" />
                <YAxis domain={[-1, 1]} stroke="#6b7280" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#fff',
                    border: '1px solid #e5e7eb',
                    borderRadius: '0.5rem',
                  }}
                  formatter={(value: any) => value.toFixed(2)}
                />
                <Line
                  type="monotone"
                  dataKey="score"
                  stroke="#1e40af"
                  dot={{ fill: '#1e40af', r: 4 }}
                  activeDot={{ r: 6 }}
                  strokeWidth={2}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}

      {/* Triggers & Alerts */}
      {config.triggers.enableEscalation && (
        <Card className={`border-border ${triggers.escalationSuggested ? 'bg-red-50 dark:bg-red-950/20' : 'bg-card'}`}>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              {triggers.escalationSuggested && <AlertCircle className="w-5 h-5 text-red-600" />}
              Escalation Status
            </CardTitle>
          </CardHeader>
          <CardContent>
            {triggers.escalationSuggested ? (
              <div className="space-y-2">
                <Badge variant="destructive">Escalation Suggested</Badge>
                <p className="text-sm text-muted-foreground">
                  Negative streak: <span className="font-semibold">{triggers.negativeStreak}</span> turns
                </p>
                <div className="mt-3 p-2 bg-red-100 dark:bg-red-900/30 rounded text-sm text-red-900 dark:text-red-100">
                  Consider offering assistance or escalating to a specialist.
                </div>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">No escalation needed</p>
            )}
          </CardContent>
        </Card>
      )}

      {/* Metrics Summary */}
      {conversationHistory.length > 0 && (
        <Card className="bg-card border-border">
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Metrics Summary</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {config.metricsSelection.avgSentiment && (
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Average Sentiment</span>
                <span className="font-semibold flex items-center gap-1">
                  {metrics.avgSentiment.toFixed(2)}
                  {metrics.avgSentiment > 0 ? (
                    <TrendingUp className="w-4 h-4 text-green-600" />
                  ) : (
                    <TrendingDown className="w-4 h-4 text-red-600" />
                  )}
                </span>
              </div>
            )}
            {config.metricsSelection.negativeRate && (
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Negative Rate</span>
                <span className="font-semibold">{(metrics.negativeRate * 100).toFixed(1)}%</span>
              </div>
            )}
            {config.metricsSelection.volatility && (
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Volatility</span>
                <span className="font-semibold">{metrics.volatility.toFixed(2)}</span>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
