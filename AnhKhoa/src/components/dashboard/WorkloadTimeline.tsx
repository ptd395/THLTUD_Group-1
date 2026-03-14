import { Card } from "@/components/ui/card";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import type { Ticket } from "@/hooks/useTickets";

export function WorkloadTimeline({ tickets }: { tickets: Ticket[] }) {
  // Group tickets by hour
  const hourMap = new Map<string, { resolved: number; newT: number }>();

  tickets.forEach((t) => {
    const hour = new Date(t.created_at).getHours();
    const label = `${String(hour).padStart(2, "0")}:00`;
    const entry = hourMap.get(label) || { resolved: 0, newT: 0 };
    entry.newT++;
    if (t.status === "Resolved" || t.status === "Closed") entry.resolved++;
    hourMap.set(label, entry);
  });

  const data = Array.from(hourMap.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([time, v]) => ({
      time,
      "Tickets đã xử lý": v.resolved,
      "Ticket mới": v.newT,
    }));

  return (
    <Card className="p-5">
      <h3 className="font-semibold text-foreground mb-4">Workload Timeline</h3>
      <ResponsiveContainer width="100%" height={280}>
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="hsl(220 13% 91%)" />
          <XAxis dataKey="time" fontSize={12} />
          <YAxis fontSize={12} />
          <Tooltip />
          <Legend />
          <Line
            type="monotone"
            dataKey="Tickets đã xử lý"
            stroke="hsl(224 76% 48%)"
            strokeWidth={2}
            dot={false}
          />
          <Line
            type="monotone"
            dataKey="Ticket mới"
            stroke="hsl(200 80% 70%)"
            strokeWidth={2}
            dot={false}
          />
        </LineChart>
      </ResponsiveContainer>
    </Card>
  );
}
