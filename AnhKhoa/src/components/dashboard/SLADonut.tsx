import { Card } from "@/components/ui/card";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
} from "recharts";
import type { Ticket } from "@/hooks/useTickets";

export function SLADonut({ tickets }: { tickets: Ticket[] }) {
  const resolved = tickets.filter(
    (t) => t.status === "Resolved" || t.status === "Closed"
  );
  const compliant = resolved.filter(
    (t) => t.handling_time_seconds != null && t.handling_time_seconds < 900
  ).length;
  const total = resolved.length;
  const rate = total > 0 ? Math.round((compliant / total) * 100) : 0;

  const data = [
    { name: "Compliant", value: rate },
    { name: "Non-compliant", value: 100 - rate },
  ];

  return (
    <Card className="p-5 flex flex-col items-center">
      <h3 className="font-semibold text-foreground mb-4 self-start">
        SLA Response Compliance
      </h3>
      <div className="relative w-48 h-48">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={80}
              startAngle={90}
              endAngle={-270}
              dataKey="value"
              strokeWidth={0}
            >
              <Cell fill="hsl(142 71% 45%)" />
              <Cell fill="hsl(220 14% 96%)" />
            </Pie>
          </PieChart>
        </ResponsiveContainer>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-3xl font-bold">{rate}%</span>
        </div>
      </div>
      <p className="text-sm text-muted-foreground mt-2">
        Phản hồi trong &lt; 15 phút
      </p>
    </Card>
  );
}
