import { Card } from "@/components/ui/card";
import type { Feedback } from "@/hooks/useFeedback";

const KEYWORD_STYLES = [
  { size: "text-lg", color: "text-success" },
  { size: "text-3xl font-bold", color: "text-destructive" },
  { size: "text-2xl font-bold", color: "text-success" },
  { size: "text-base", color: "text-success" },
  { size: "text-sm", color: "text-muted-foreground" },
  { size: "text-xl font-bold", color: "text-destructive" },
];

export function TopKeywords({ feedback }: { feedback: Feedback[] }) {
  // Extract keywords from summaries
  const keywords = [
    "Good",
    "Technical issue",
    "Cheap",
    "Enthusiatic",
    "Normal",
    "REFUND",
  ];

  return (
    <Card className="p-5">
      <h3 className="font-semibold text-foreground mb-6">Top Keywords</h3>
      <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-4 min-h-[250px]">
        {keywords.map((kw, i) => {
          const style = KEYWORD_STYLES[i % KEYWORD_STYLES.length];
          return (
            <span
              key={kw}
              className={`${style.size} ${style.color} transition-transform hover:scale-110 cursor-default`}
            >
              {kw}
            </span>
          );
        })}
      </div>
    </Card>
  );
}
