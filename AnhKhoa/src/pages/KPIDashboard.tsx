import { useState } from "react";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import {
  TicketProductivityCard,
  AverageHandlingTimeCard,
  SentimentCard,
  AIAssistCard,
} from "@/components/dashboard/KPICard";
import { WorkloadTimeline } from "@/components/dashboard/WorkloadTimeline";
import { SLADonut } from "@/components/dashboard/SLADonut";
import { HighAttentionTable } from "@/components/dashboard/HighAttentionTable";
import { useTickets } from "@/hooks/useTickets";

export default function KPIDashboard() {
  const [channel, setChannel] = useState("All");
  const [dateFrom, setDateFrom] = useState<Date | undefined>(undefined);
  const [dateTo, setDateTo] = useState<Date | undefined>(undefined);
  const { data: tickets = [] } = useTickets(channel, dateFrom, dateTo);

  const resolved = tickets.filter(
    (t) => t.status === "Resolved" || t.status === "Closed"
  ).length;
  const total = tickets.length;

  const avgHandling =
    tickets
      .filter((t) => t.handling_time_seconds != null)
      .reduce((sum, t) => sum + (t.handling_time_seconds || 0), 0) /
    (tickets.filter((t) => t.handling_time_seconds != null).length || 1);

  const positive = tickets.filter((t) => t.sentiment === "Positive").length;
  const neutral = tickets.filter((t) => t.sentiment === "Neutral").length;
  const negative = tickets.filter((t) => t.sentiment === "Negative").length;

  const aiAssisted = tickets.filter((t) => t.ai_assisted).length;
  const aiRate = total > 0 ? Math.round((aiAssisted / total) * 100) : 0;

  return (
    <DashboardLayout>
      <div className="p-8">
        <DashboardHeader
          title="Agent KPI Dashboard"
          subtitle="Theo dõi hiệu suất cá nhân, SLA và cảm xúc khách hàng theo thời gian thực"
          channel={channel}
          onChannelChange={setChannel}
          dateFrom={dateFrom}
          dateTo={dateTo}
          onDateFromChange={setDateFrom}
          onDateToChange={setDateTo}
        />

        <div className="grid grid-cols-4 gap-4 mb-6">
          <TicketProductivityCard resolved={resolved} total={total} />
          <AverageHandlingTimeCard seconds={Math.round(avgHandling)} />
          <SentimentCard
            positive={positive}
            neutral={neutral}
            negative={negative}
          />
          <AIAssistCard rate={aiRate} />
        </div>

        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="col-span-2">
            <WorkloadTimeline tickets={tickets} />
          </div>
          <SLADonut tickets={tickets} />
        </div>

        <HighAttentionTable tickets={tickets} />
      </div>
    </DashboardLayout>
  );
}
