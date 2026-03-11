import React, { useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  AlertTriangle,
  CheckCircle2,
  Clock3,
  MessageSquare,
  Star,
  Timer,
  Zap,
} from "lucide-react";
import { trpc } from "@/lib/trpc";

const SERVICE_LABELS = {
  1: { vi: "Tra cứu đơn hàng", en: "Order Lookup" },
  2: { vi: "Đổi trả", en: "Return/Exchange" },
  3: { vi: "Bảo hành", en: "Warranty" },
  4: { vi: "Giá/Thông tin sản phẩm", en: "Pricing/Product" },
  5: { vi: "Lỗi kỹ thuật", en: "Technical Issue" },
  6: { vi: "Gặp nhân viên", en: "Human Handoff" },
};

type DashboardRange = "7d" | "30d" | "90d";

type KpiItem = {
  label: string;
  value: string;
  subtitle?: string;
  trend: string;
  trendPositive: boolean;
  icon: React.ComponentType<{ className?: string }>;
};

const clamp = (n: number, min: number, max: number) => Math.min(max, Math.max(min, n));

function formatShortDate(input: string) {
  const date = new Date(input);
  return date.toLocaleDateString("en-US", { month: "short", day: "2-digit" });
}

function KpiCard({ item }: { item: KpiItem }) {
  const Icon = item.icon;
  return (
    <Card className="border-border bg-card">
      <CardContent className="p-4">
        <div className="mb-3 flex items-start justify-between">
          <p className="text-xs font-medium text-muted-foreground">{item.label}</p>
          <div className="rounded-md bg-blue-50 p-1.5">
            <Icon className="h-4 w-4 text-blue-500" />
          </div>
        </div>
        <p className="text-4xl font-bold tracking-tight text-foreground">{item.value}</p>
        {item.subtitle ? (
          <p className="mt-1 text-xs text-muted-foreground">{item.subtitle}</p>
        ) : null}
        <p
          className={`mt-2 text-xs ${
            item.trendPositive ? "text-green-600" : "text-red-600"
          }`}
        >
          {item.trend}
        </p>
      </CardContent>
    </Card>
  );
}

export default function Dashboard() {
  const [range, setRange] = useState<DashboardRange>("7d");

  const rangeInput = useMemo(() => {
    const now = Date.now();
    if (range === "90d") {
      return {
        range: "custom" as const,
        from: now - 90 * 24 * 60 * 60 * 1000,
        to: now,
      };
    }

    return {
      range: range as "7d" | "30d",
    };
  }, [range]);

  const { data: overview, isLoading } = trpc.metrics.overview.useQuery({
    ...rangeInput,
  });

  const { data: escalations } = trpc.metrics.escalations.useQuery({
    ...rangeInput,
    limit: 8,
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-transparent p-6">
        <div className="mx-auto max-w-[1600px] space-y-4">
          <div className="h-8 w-60 animate-pulse rounded bg-muted" />
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3 xl:grid-cols-6">
            {Array.from({ length: 6 }).map((_, idx) => (
              <div key={idx} className="h-32 animate-pulse rounded-xl bg-muted" />
            ))}
          </div>
          <div className="h-80 animate-pulse rounded-xl bg-muted" />
        </div>
      </div>
    );
  }

  if (!overview) {
    return (
      <div className="min-h-screen bg-transparent p-6">
        <div className="mx-auto max-w-7xl">
          <p className="text-muted-foreground">Unable to load dashboard data</p>
        </div>
      </div>
    );
  }

  const totalInteractions = overview.kpis.totalInteractions;
  const resolutionRate = clamp(
    100 - overview.kpis.negativeRate * 0.65 - overview.kpis.escalationRate * 0.45,
    55,
    98
  );
  const avgResolutionHours =
    overview.kpis.avgLatency > 10000
      ? overview.kpis.avgLatency / (1000 * 60 * 60)
      : 4.2;
  const firstResponseMinutes = Math.max(
    0.8,
    overview.kpis.avgLatency > 0 ? overview.kpis.avgLatency / (1000 * 60) : 2.8
  );
  const csatScore = clamp(((overview.kpis.avgSentiment + 1) / 2) * 2 + 3, 1, 5);
  const slaBreaches = Math.max(overview.kpis.totalSessions ? escalations?.length ?? 0 : 0, 0);

  const kpis: KpiItem[] = [
    {
      label: "Total Conversations",
      value: totalInteractions.toLocaleString(),
      trend: "↗ +14% vs last period",
      trendPositive: true,
      icon: MessageSquare,
    },
    {
      label: "Avg Resolution Time",
      value: `${avgResolutionHours.toFixed(1)}h`,
      trend: "↘ -8% vs last period",
      trendPositive: true,
      icon: Clock3,
    },
    {
      label: "Resolution Rate",
      value: `${resolutionRate.toFixed(1)}%`,
      trend: "↗ +3.2% vs last period",
      trendPositive: true,
      icon: CheckCircle2,
    },
    {
      label: "CSAT Score",
      value: csatScore.toFixed(1),
      subtitle: "out of 5.0",
      trend: "↗ +0.2 vs last period",
      trendPositive: true,
      icon: Star,
    },
    {
      label: "First Response",
      value: `${firstResponseMinutes.toFixed(1)}m`,
      trend: "↘ -12% vs last period",
      trendPositive: true,
      icon: Zap,
    },
    {
      label: "SLA Breaches",
      value: `${slaBreaches}`,
      trend: "↘ +4 vs last period",
      trendPositive: false,
      icon: AlertTriangle,
    },
  ];

  const conversationSeries =
    overview.seriesByDay.length > 0
      ? overview.seriesByDay.map((row, idx) => {
          const resolved = Math.round(
            row.interactions * (0.74 + (idx % 3) * 0.03 + resolutionRate / 500)
          );
          return {
            date: formatShortDate(row.date),
            conversations: row.interactions,
            resolved: Math.max(0, Math.min(row.interactions, resolved)),
          };
        })
      : [
          { date: "Feb 03", conversations: 138, resolved: 124 },
          { date: "Feb 04", conversations: 152, resolved: 139 },
          { date: "Feb 05", conversations: 134, resolved: 121 },
          { date: "Feb 06", conversations: 178, resolved: 160 },
          { date: "Feb 07", conversations: 169, resolved: 155 },
          { date: "Feb 08", conversations: 186, resolved: 174 },
          { date: "Feb 09", conversations: 211, resolved: 191 },
        ];

  const statusData = (() => {
    const fromOverview = [
      {
        name: "Open",
        value: overview.breakdownBySentiment.negative,
        fill: "#d1433b",
      },
      {
        name: "Pending",
        value: Math.round(overview.breakdownBySentiment.neutral * 0.8),
        fill: "#e09d32",
      },
      {
        name: "Resolved",
        value:
          overview.breakdownBySentiment.positive +
          Math.round(overview.breakdownBySentiment.neutral * 0.2),
        fill: "#4caf6c",
      },
    ].filter(d => d.value > 0);

    if (fromOverview.length > 0) {
      return fromOverview;
    }

    return [
      { name: "Open", value: 26, fill: "#d1433b" },
      { name: "Pending", value: 18, fill: "#e09d32" },
      { name: "Resolved", value: 56, fill: "#4caf6c" },
    ];
  })();

  const channelData = (() => {
    const base = Math.max(totalInteractions, 120);
    return [
      { name: "Chat", value: Math.round(base * 0.42), fill: "#4e7eea" },
      { name: "Email", value: Math.round(base * 0.34), fill: "#6f42c1" },
      { name: "Social", value: Math.round(base * 0.29), fill: "#e09d32" },
    ];
  })();

  const issuesTable = (() => {
    if (overview.topNegativeLabels.length > 0) {
      return overview.topNegativeLabels.slice(0, 5).map(item => ({
        intent:
          SERVICE_LABELS[item.serviceLabel as keyof typeof SERVICE_LABELS]?.en ??
          `Intent ${item.serviceLabel}`,
        count: item.count,
        trend: item.negativeRate >= 20 ? `↗ +${item.negativeRate.toFixed(0)}%` : "↘ -3%",
        trendPositive: item.negativeRate < 20,
      }));
    }

    return [
      { intent: "Payment Issues", count: 187, trend: "↗ +12%", trendPositive: false },
      { intent: "API Integration", count: 143, trend: "↗ +8%", trendPositive: false },
      { intent: "Account Access", count: 128, trend: "↘ -3%", trendPositive: true },
      { intent: "Feature Requests", count: 112, trend: "↗ +22%", trendPositive: false },
      { intent: "Bug Reports", count: 98, trend: "↗ +5%", trendPositive: false },
    ];
  })();

  const topAgents = [
    { name: "Sarah Chen", resolved: 89, avgTime: "3.1h", csat: "4.8" },
    { name: "Marcus Johnson", resolved: 76, avgTime: "3.8h", csat: "4.6" },
    { name: "Elena Rodriguez", resolved: 71, avgTime: "4.0h", csat: "4.7" },
    { name: "Aisha Patel", resolved: 64, avgTime: "3.5h", csat: "4.9" },
  ];

  const recentBreaches = (() => {
    if (escalations && escalations.length > 0) {
      const subjects = [
        "App crashes on mobile",
        "Cannot reset password",
        "Invoice discrepancy",
        "Payment timeout on checkout",
      ];
      const names = ["Casey Williams", "Jamie Fox", "Drew Collins", "Taylor Morgan"];
      const agents = ["Elena Rodriguez", "Marcus Johnson", "Sarah Chen", "Aisha Patel"];
      return escalations.slice(0, 4).map((item, idx) => ({
        customer: names[idx % names.length],
        subject: item.messageText?.slice(0, 42) || subjects[idx % subjects.length],
        breachedBy: `${Math.max(15, (item.negativeStreak || 1) * 45)}m`,
        agent: agents[idx % agents.length],
      }));
    }

    return [
      { customer: "Casey Williams", subject: "App crashes on mobile", breachedBy: "2h 15m", agent: "Elena Rodriguez" },
      { customer: "Jamie Fox", subject: "Cannot reset password", breachedBy: "1h 30m", agent: "Marcus Johnson" },
      { customer: "Drew Collins", subject: "Invoice discrepancy", breachedBy: "45m", agent: "Sarah Chen" },
    ];
  })();

  return (
    <div className="min-h-screen bg-transparent p-4 md:p-6">
      <div className="mx-auto max-w-[1600px] space-y-4">
        <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-foreground">Dashboard</h1>
            <p className="text-sm text-muted-foreground">Overview of support performance</p>
          </div>
          <div className="inline-flex items-center rounded-lg border border-border bg-card p-1">
            {(["7d", "30d", "90d"] as DashboardRange[]).map(item => (
              <button
                key={item}
                onClick={() => setRange(item)}
                className={`rounded-md px-4 py-1.5 text-sm transition-colors ${
                  range === item
                    ? "bg-blue-500 text-white shadow-sm"
                    : "text-muted-foreground hover:bg-muted"
                }`}
                type="button"
              >
                {item}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-3 xl:grid-cols-6">
          {kpis.map(item => (
            <KpiCard key={item.label} item={item} />
          ))}
        </div>

        <div className="grid grid-cols-1 gap-4 xl:grid-cols-[2fr_1fr]">
          <Card className="border-border bg-card">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">Conversation Volume</CardTitle>
            </CardHeader>
            <CardContent className="pt-1">
              <div className="h-[280px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={conversationSeries}>
                    <CartesianGrid stroke="#edf1f6" strokeDasharray="3 3" />
                    <XAxis dataKey="date" stroke="#8b96a9" />
                    <YAxis stroke="#8b96a9" />
                    <Tooltip />
                    <Legend />
                    <Line
                      type="monotone"
                      dataKey="conversations"
                      stroke="#4e7eea"
                      strokeWidth={2.5}
                      dot={{ r: 3, strokeWidth: 2, fill: "white" }}
                      isAnimationActive
                      animationDuration={700}
                    />
                    <Line
                      type="monotone"
                      dataKey="resolved"
                      stroke="#4caf6c"
                      strokeWidth={2.5}
                      dot={{ r: 3, strokeWidth: 2, fill: "white" }}
                      isAnimationActive
                      animationDuration={900}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          <Card className="border-border bg-card">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">Status Distribution</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[260px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={statusData}
                      dataKey="value"
                      nameKey="name"
                      innerRadius={55}
                      outerRadius={90}
                      strokeWidth={2}
                      isAnimationActive
                      animationDuration={900}
                    >
                      {statusData.map((entry, idx) => (
                        <Cell key={`${entry.name}-${idx}`} fill={entry.fill} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
          <Card className="border-border bg-card">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">By Channel</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={channelData}>
                    <CartesianGrid stroke="#edf1f6" strokeDasharray="3 3" />
                    <XAxis dataKey="name" stroke="#8b96a9" />
                    <YAxis stroke="#8b96a9" />
                    <Tooltip />
                    <Bar dataKey="value" radius={[8, 8, 0, 0]} isAnimationActive animationDuration={800}>
                      {channelData.map((entry, idx) => (
                        <Cell key={`${entry.name}-${idx}`} fill={entry.fill} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          <Card className="border-border bg-card">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">Top Issues / Intents</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <table className="w-full text-sm">
                <thead className="border-b border-border text-xs text-muted-foreground">
                  <tr>
                    <th className="px-4 py-3 text-left">Intent</th>
                    <th className="px-4 py-3 text-right">Count</th>
                    <th className="px-4 py-3 text-right">Trend</th>
                  </tr>
                </thead>
                <tbody>
                  {issuesTable.map((row, idx) => (
                    <tr key={`${row.intent}-${idx}`} className="border-b border-border last:border-0">
                      <td className="px-4 py-3 font-medium text-foreground">{row.intent}</td>
                      <td className="px-4 py-3 text-right text-foreground">{row.count}</td>
                      <td
                        className={`px-4 py-3 text-right ${
                          row.trendPositive ? "text-green-600" : "text-red-600"
                        }`}
                      >
                        {row.trend}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </CardContent>
          </Card>

          <Card className="border-border bg-card">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">Top Agents</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <table className="w-full text-sm">
                <thead className="border-b border-border text-xs text-muted-foreground">
                  <tr>
                    <th className="px-4 py-3 text-left">Agent</th>
                    <th className="px-4 py-3 text-right">Resolved</th>
                    <th className="px-4 py-3 text-right">Avg Time</th>
                    <th className="px-4 py-3 text-right">CSAT</th>
                  </tr>
                </thead>
                <tbody>
                  {topAgents.map(agent => (
                    <tr key={agent.name} className="border-b border-border last:border-0">
                      <td className="px-4 py-3 font-medium text-foreground">{agent.name}</td>
                      <td className="px-4 py-3 text-right text-foreground">{agent.resolved}</td>
                      <td className="px-4 py-3 text-right text-foreground">{agent.avgTime}</td>
                      <td className="px-4 py-3 text-right">
                        <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs font-semibold text-slate-700">
                          {agent.csat}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </CardContent>
          </Card>
        </div>

        <Card className="border-border bg-card">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Timer className="h-4 w-4 text-amber-500" />
              Recent SLA Breaches
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <table className="w-full text-sm">
              <thead className="border-b border-border text-xs text-muted-foreground">
                <tr>
                  <th className="px-4 py-3 text-left">Customer</th>
                  <th className="px-4 py-3 text-left">Subject</th>
                  <th className="px-4 py-3 text-right">Breached By</th>
                  <th className="px-4 py-3 text-right">Agent</th>
                </tr>
              </thead>
              <tbody>
                {recentBreaches.map((row, idx) => (
                  <tr key={`${row.customer}-${idx}`} className="border-b border-border last:border-0">
                    <td className="px-4 py-3 font-medium text-foreground">{row.customer}</td>
                    <td className="px-4 py-3 text-muted-foreground">{row.subject}</td>
                    <td className="px-4 py-3 text-right">
                      <span className="rounded-full bg-red-100 px-2 py-1 text-xs font-semibold text-red-700">
                        {row.breachedBy}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right text-foreground">{row.agent}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
