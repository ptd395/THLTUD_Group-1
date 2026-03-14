import { Card } from "@/components/ui/card";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Cell,
  LabelList,
} from "recharts";
import type { Ticket } from "@/hooks/useTickets";

const COLORS = {
  Negative: "hsl(0 72% 51%)",
  Normal: "hsl(220 10% 70%)",
  Positive: "hsl(142 71% 45%)",
};

export function ChannelSentimentChart({ tickets }: { tickets: Ticket[] }) {
  const channels = ["WhatsApp", "Messenger", "Website", "Email"];

  const data = channels.map((ch) => {
    const chTickets = tickets.filter((t) => t.channel === ch);
    const total = chTickets.length || 1;
    const neg = chTickets.filter((t) => t.sentiment === "Negative").length;
    const neu = chTickets.filter((t) => t.sentiment === "Neutral").length;
    const pos = chTickets.filter((t) => t.sentiment === "Positive").length;

    return {
      channel: ch,
      Negative: Math.round((neg / total) * 100),
      Normal: Math.round((neu / total) * 100),
      Positive: Math.round((pos / total) * 100),
    };
  });

  return (
    <Card className="p-6">
      <ResponsiveContainer width="100%" height={500}>
        <BarChart data={data} barSize={60}>
          <CartesianGrid strokeDasharray="3 3" stroke="hsl(220 13% 91%)" />
          <XAxis dataKey="channel" fontSize={13} />
          <YAxis
            fontSize={12}
            tickFormatter={(v) => `${v}%`}
            domain={[0, 100]}
          />
          <Tooltip formatter={(v: number) => `${v}%`} />
          <Legend />
          <Bar dataKey="Negative" stackId="a" fill={COLORS.Negative}>
            <LabelList dataKey="Negative" position="center" fill="#fff" formatter={(v: number) => `${v}%`} fontSize={12} />
          </Bar>
          <Bar dataKey="Normal" stackId="a" fill={COLORS.Normal}>
            <LabelList dataKey="Normal" position="center" fill="#fff" formatter={(v: number) => `${v}%`} fontSize={12} />
          </Bar>
          <Bar dataKey="Positive" stackId="a" fill={COLORS.Positive}>
            <LabelList dataKey="Positive" position="center" fill="#fff" formatter={(v: number) => `${v}%`} fontSize={12} />
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </Card>
  );
}
