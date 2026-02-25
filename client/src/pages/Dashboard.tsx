import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { TrendingUp, Users, MessageSquare, AlertTriangle, Zap, Clock } from 'lucide-react';
import { trpc } from '@/lib/trpc';

const SERVICE_LABELS = {
  1: { vi: 'Tra cứu đơn hàng', en: 'Order Lookup' },
  2: { vi: 'Đổi trả', en: 'Return/Exchange' },
  3: { vi: 'Bảo hành', en: 'Warranty' },
  4: { vi: 'Giá/Thông tin sản phẩm', en: 'Pricing/Product' },
  5: { vi: 'Lỗi kỹ thuật', en: 'Technical Issue' },
  6: { vi: 'Gặp nhân viên', en: 'Human Handoff' },
};

const SENTIMENT_COLORS = {
  positive: '#10b981',
  neutral: '#f59e0b',
  negative: '#ef4444',
};

export default function Dashboard() {
  const [range, setRange] = useState<'7d' | '30d'>('7d');
  const [channel, setChannel] = useState<string>('');
  const [language, setLanguage] = useState<string>('');
  const [serviceLabel, setServiceLabel] = useState<string>('');

  // Fetch metrics overview
  const { data: overview, isLoading } = trpc.metrics.overview.useQuery({
    range,
    channel: channel || undefined,
    language: language || undefined,
    serviceLabel: serviceLabel ? parseInt(serviceLabel) : undefined,
  });

  // Fetch escalations
  const { data: escalations } = trpc.metrics.escalations.useQuery({
    range,
    channel: channel || undefined,
    language: language || undefined,
    limit: 5,
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background p-6">
        <div className="max-w-7xl mx-auto">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-muted rounded w-1/3"></div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {[1, 2, 3].map(i => (
                <div key={i} className="h-32 bg-muted rounded"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!overview) {
    return (
      <div className="min-h-screen bg-background p-6">
        <div className="max-w-7xl mx-auto">
          <p className="text-muted-foreground">Unable to load dashboard data</p>
        </div>
      </div>
    );
  }

  // Prepare chart data
  const sentimentChartData = [
    { name: 'Positive', value: overview.breakdownBySentiment.positive, fill: SENTIMENT_COLORS.positive },
    { name: 'Neutral', value: overview.breakdownBySentiment.neutral, fill: SENTIMENT_COLORS.neutral },
    { name: 'Negative', value: overview.breakdownBySentiment.negative, fill: SENTIMENT_COLORS.negative },
  ].filter(d => d.value > 0);

  const labelChartData = Object.entries(overview.breakdownByLabel)
    .map(([label, count]) => ({
      name: SERVICE_LABELS[parseInt(label) as keyof typeof SERVICE_LABELS]?.vi || `Label ${label}`,
      count,
      label: parseInt(label),
    }))
    .filter(d => d.count > 0)
    .sort((a, b) => b.count - a.count);

  const languageChartData = [
    { name: 'Vietnamese', value: overview.breakdownByLanguage.vi },
    { name: 'English', value: overview.breakdownByLanguage.en },
  ].filter(d => d.value > 0);

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b border-border bg-card sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <h1 className="text-3xl font-bold text-foreground mb-4">Metrics Dashboard</h1>
          
          {/* Filters */}
          <div className="flex flex-wrap gap-4">
            <div className="flex items-center gap-2">
              <label className="text-sm font-medium text-muted-foreground">Date Range:</label>
              <Select value={range} onValueChange={(v: any) => setRange(v)}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="7d">Last 7 days</SelectItem>
                  <SelectItem value="30d">Last 30 days</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center gap-2">
              <label className="text-sm font-medium text-muted-foreground">Channel:</label>
              <Select value={channel} onValueChange={setChannel}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="All channels" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All channels</SelectItem>
                  <SelectItem value="web_chat">Web Chat</SelectItem>
                  <SelectItem value="voice_demo">Voice Demo</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center gap-2">
              <label className="text-sm font-medium text-muted-foreground">Language:</label>
              <Select value={language} onValueChange={setLanguage}>
                <SelectTrigger className="w-32">
                  <SelectValue placeholder="All languages" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All languages</SelectItem>
                  <SelectItem value="vi">Vietnamese</SelectItem>
                  <SelectItem value="en">English</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center gap-2">
              <label className="text-sm font-medium text-muted-foreground">Service Label:</label>
              <Select value={serviceLabel} onValueChange={setServiceLabel}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="All labels" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All labels</SelectItem>
                  {Object.entries(SERVICE_LABELS).map(([num, labels]) => (
                    <SelectItem key={num} value={num}>
                      {labels.vi}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-6 py-6 space-y-6">
        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <Card className="bg-card border-border">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <MessageSquare className="w-4 h-4" />
                Total Interactions
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-foreground">{overview.kpis.totalInteractions}</div>
              <p className="text-xs text-muted-foreground mt-1">User messages</p>
            </CardContent>
          </Card>

          <Card className="bg-card border-border">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <Users className="w-4 h-4" />
                Total Sessions
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-foreground">{overview.kpis.totalSessions}</div>
              <p className="text-xs text-muted-foreground mt-1">Unique conversations</p>
            </CardContent>
          </Card>

          <Card className="bg-card border-border">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <TrendingUp className="w-4 h-4" />
                Avg Sentiment
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-foreground">{overview.kpis.avgSentiment.toFixed(2)}</div>
              <p className="text-xs text-muted-foreground mt-1">-1.0 to 1.0 scale</p>
            </CardContent>
          </Card>

          <Card className="bg-card border-border">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <AlertTriangle className="w-4 h-4" />
                Negative Rate
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-foreground">{overview.kpis.negativeRate.toFixed(1)}%</div>
              <p className="text-xs text-muted-foreground mt-1">Negative messages</p>
            </CardContent>
          </Card>

          <Card className="bg-card border-border">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <Zap className="w-4 h-4" />
                Escalation Rate
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-foreground">{overview.kpis.escalationRate.toFixed(1)}%</div>
              <p className="text-xs text-muted-foreground mt-1">Escalated interactions</p>
            </CardContent>
          </Card>

          <Card className="bg-card border-border">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <Clock className="w-4 h-4" />
                Avg Latency
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-foreground">{overview.kpis.avgLatency}ms</div>
              <p className="text-xs text-muted-foreground mt-1">Response time</p>
            </CardContent>
          </Card>
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Time Series Chart */}
          {overview.seriesByDay.length > 0 && (
            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle>Interactions Over Time</CardTitle>
                <CardDescription>Daily interaction count</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={overview.seriesByDay}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                    <XAxis dataKey="date" stroke="#6b7280" />
                    <YAxis stroke="#6b7280" />
                    <Tooltip contentStyle={{ backgroundColor: '#1f2937', border: 'none', borderRadius: '8px' }} />
                    <Line type="monotone" dataKey="interactions" stroke="#3b82f6" strokeWidth={2} dot={{ fill: '#3b82f6' }} />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          )}

          {/* Service Label Breakdown */}
          {labelChartData.length > 0 && (
            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle>Service Label Distribution</CardTitle>
                <CardDescription>Interactions by category</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={labelChartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                    <XAxis dataKey="name" stroke="#6b7280" angle={-45} textAnchor="end" height={80} />
                    <YAxis stroke="#6b7280" />
                    <Tooltip contentStyle={{ backgroundColor: '#1f2937', border: 'none', borderRadius: '8px' }} />
                    <Bar dataKey="count" fill="#3b82f6" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          )}

          {/* Sentiment Distribution */}
          {sentimentChartData.length > 0 && (
            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle>Sentiment Distribution</CardTitle>
                <CardDescription>Breakdown by sentiment</CardDescription>
              </CardHeader>
              <CardContent className="flex justify-center">
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={sentimentChartData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, value }) => `${name}: ${value}`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {sentimentChartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.fill} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          )}

          {/* Language Split */}
          {languageChartData.length > 0 && (
            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle>Language Distribution</CardTitle>
                <CardDescription>Vietnamese vs English</CardDescription>
              </CardHeader>
              <CardContent className="flex justify-center">
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={languageChartData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, value }) => `${name}: ${value}`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      <Cell fill="#8b5cf6" />
                      <Cell fill="#06b6d4" />
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Top Negative Labels Table */}
        {overview.topNegativeLabels.length > 0 && (
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle>Top Negative Service Labels</CardTitle>
              <CardDescription>Service labels with highest negative sentiment rate</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="border-b border-border">
                    <tr className="text-muted-foreground">
                      <th className="text-left py-3 px-4 font-medium">Service Label</th>
                      <th className="text-right py-3 px-4 font-medium">Count</th>
                      <th className="text-right py-3 px-4 font-medium">Negative Rate</th>
                      <th className="text-right py-3 px-4 font-medium">Avg Sentiment</th>
                    </tr>
                  </thead>
                  <tbody>
                    {overview.topNegativeLabels.map((item, idx) => (
                      <tr key={idx} className="border-b border-border hover:bg-muted/50">
                        <td className="py-3 px-4">
                          <span className="font-medium text-foreground">
                            {SERVICE_LABELS[item.serviceLabel as keyof typeof SERVICE_LABELS]?.vi}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-right text-foreground">{item.count}</td>
                        <td className="py-3 px-4 text-right">
                          <span className={item.negativeRate > 30 ? 'text-red-500 font-medium' : 'text-foreground'}>
                            {item.negativeRate.toFixed(1)}%
                          </span>
                        </td>
                        <td className="py-3 px-4 text-right text-foreground">{item.avgSentiment.toFixed(2)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Recent Escalations */}
        {escalations && escalations.length > 0 && (
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle>Recent Escalations</CardTitle>
              <CardDescription>Latest escalated sessions</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {escalations.map((event, idx) => (
                  <div key={idx} className="p-3 bg-muted rounded-lg border border-border">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <p className="font-medium text-foreground">Session: {event.sessionId.slice(0, 8)}...</p>
                        <p className="text-xs text-muted-foreground mt-1">
                          {new Date(event.ts).toLocaleString()}
                        </p>
                      </div>
                      <span className="text-xs px-2 py-1 bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100 rounded">
                        Escalated
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground">{event.messageText?.slice(0, 100)}...</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Empty State */}
        {overview.kpis.totalInteractions === 0 && (
          <Card className="bg-card border-border">
            <CardContent className="py-12 text-center">
              <p className="text-muted-foreground mb-4">No data available for the selected period</p>
              <p className="text-sm text-muted-foreground">Start a conversation in the demo to see metrics</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
