import { useState } from "react";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { AspectAnalysis } from "@/components/dashboard/AspectAnalysis";
import { TopKeywords } from "@/components/dashboard/TopKeywords";
import { FeedbackTable } from "@/components/dashboard/FeedbackTable";
import { useFeedback } from "@/hooks/useFeedback";

export default function SentimentDashboard() {
  const [channel, setChannel] = useState("All");
  const [dateFrom, setDateFrom] = useState<Date | undefined>(undefined);
  const [dateTo, setDateTo] = useState<Date | undefined>(undefined);
  const { data: feedback = [] } = useFeedback(channel, dateFrom, dateTo);

  return (
    <DashboardLayout>
      <div className="p-8">
        <DashboardHeader
          title="Advanced Sentiment Analysis & Key Topics"
          channel={channel}
          onChannelChange={setChannel}
          dateFrom={dateFrom}
          dateTo={dateTo}
          onDateFromChange={setDateFrom}
          onDateToChange={setDateTo}
        />

        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="col-span-2">
            <AspectAnalysis feedback={feedback} />
          </div>
          <TopKeywords feedback={feedback} />
        </div>

        <FeedbackTable feedback={feedback} />
      </div>
    </DashboardLayout>
  );
}
