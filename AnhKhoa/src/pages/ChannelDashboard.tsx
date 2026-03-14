import { useState } from "react";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { ChannelSentimentChart } from "@/components/dashboard/ChannelSentimentChart";
import { useTickets } from "@/hooks/useTickets";

export default function ChannelDashboard() {
  const [channel, setChannel] = useState("All");
  const [dateFrom, setDateFrom] = useState<Date | undefined>(undefined);
  const [dateTo, setDateTo] = useState<Date | undefined>(undefined);
  const { data: tickets = [] } = useTickets(channel, dateFrom, dateTo);

  return (
    <DashboardLayout>
      <div className="p-8">
        <DashboardHeader
          title="Multi-channel Sentiment Analysis"
          channel={channel}
          onChannelChange={setChannel}
          dateFrom={dateFrom}
          dateTo={dateTo}
          onDateFromChange={setDateFrom}
          onDateToChange={setDateTo}
        />
        <ChannelSentimentChart tickets={tickets} />
      </div>
    </DashboardLayout>
  );
}
