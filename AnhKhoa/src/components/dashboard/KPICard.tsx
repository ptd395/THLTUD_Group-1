import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { CheckCircle } from "lucide-react";

interface KPICardProps {
  title: string;
  children: React.ReactNode;
  className?: string;
}

export function KPICard({ title, children, className }: KPICardProps) {
  return (
    <Card className={cn("p-5", className)}>
      <p className="text-sm font-medium text-muted-foreground mb-2">{title}</p>
      {children}
    </Card>
  );
}

export function TicketProductivityCard({
  resolved,
  total,
}: {
  resolved: number;
  total: number;
}) {
  const pct = total > 0 ? Math.round((resolved / total) * 100) : 0;
  return (
    <KPICard title="Ticket Productivity">
      <div className="flex items-baseline gap-4">
        <span className="text-3xl font-bold">{pct}%</span>
        <span className="text-2xl font-semibold text-muted-foreground">
          {resolved}/{total}
        </span>
      </div>
      <div className="w-full h-2 bg-muted rounded-full mt-3 overflow-hidden">
        <div
          className="h-full bg-success rounded-full transition-all"
          style={{ width: `${pct}%` }}
        />
      </div>
      <p className="text-xs text-muted-foreground mt-2">
        Hoàn thành / Tổng ticket
      </p>
    </KPICard>
  );
}

export function AverageHandlingTimeCard({ seconds }: { seconds: number }) {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  const underSLA = seconds < 900; // 15 min
  return (
    <KPICard title="Average Handling Time">
      <span className="text-3xl font-bold">
        {m}m {String(s).padStart(2, "0")}s
      </span>
      <div className="flex items-center gap-1.5 mt-2">
        {underSLA && <CheckCircle className="w-4 h-4 text-success" />}
        <span className={cn("text-sm", underSLA ? "text-success" : "text-destructive")}>
          {underSLA ? "Dưới ngưỡng SLA (15 phút)" : "Vượt ngưỡng SLA"}
        </span>
      </div>
    </KPICard>
  );
}

export function SentimentCard({
  positive,
  neutral,
  negative,
}: {
  positive: number;
  neutral: number;
  negative: number;
}) {
  const total = positive + neutral + negative;
  const pP = total > 0 ? Math.round((positive / total) * 100) : 0;
  const pNeu = total > 0 ? Math.round((neutral / total) * 100) : 0;
  const pN = total > 0 ? Math.round((negative / total) * 100) : 0;

  const dominant = pP >= pNeu && pP >= pN ? "Positive" : pN >= pNeu ? "Negative" : "Neutral";

  return (
    <KPICard title="Customer Sentiment">
      <span
        className={cn(
          "text-2xl font-bold",
          dominant === "Positive" && "text-success",
          dominant === "Negative" && "text-destructive",
          dominant === "Neutral" && "text-warning"
        )}
      >
        {dominant}
      </span>
      <p className="text-xs text-muted-foreground mt-2">
        {pP}% tích cực · {pNeu}% trung tính · {pN}% tiêu cực
      </p>
    </KPICard>
  );
}

export function AIAssistCard({ rate }: { rate: number }) {
  return (
    <KPICard title="AI Assist Usage">
      <span className="text-3xl font-bold">{rate}%</span>
      <p className="text-xs text-muted-foreground mt-2">
        Tỷ lệ áp dụng gợi ý AI
      </p>
    </KPICard>
  );
}
