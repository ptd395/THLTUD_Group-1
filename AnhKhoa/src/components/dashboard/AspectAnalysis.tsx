import { Card } from "@/components/ui/card";
import type { Feedback } from "@/hooks/useFeedback";

const ASPECT_CONFIG: Record<string, { negative: string; neutral: string; positive: string; negLabel: string; neuLabel: string; posLabel: string }> = {
  Shipping: {
    negative: "Slow / Broken", neutral: "Normal", positive: "Fast",
    negLabel: "Slow / Broken", neuLabel: "Normal", posLabel: "Fast",
  },
  Pricing: {
    negative: "Expensive / Not worth it", neutral: "Acceptable", positive: "Cheap",
    negLabel: "Expensive / Not worth it", neuLabel: "Acceptable", posLabel: "Cheap",
  },
  Quality: {
    negative: "Technical error", neutral: "Temporarily okay", positive: "Good / Durable",
    negLabel: "Technical error", neuLabel: "Temporarily okay", posLabel: "Good / Durable",
  },
  "Staff Attitude": {
    negative: "Listless", neutral: "Normal", positive: "Enthusiastic / Friendly",
    negLabel: "Listless", neuLabel: "Normal", posLabel: "Enthusiastic / Friendly",
  },
};

function AspectBar({
  label,
  negPct,
  neuPct,
  posPct,
  config,
  mainProblem,
}: {
  label: string;
  negPct: number;
  neuPct: number;
  posPct: number;
  config: (typeof ASPECT_CONFIG)[string];
  mainProblem?: string;
}) {
  return (
    <div className="mb-5">
      <p className="font-medium text-sm mb-2">{label}</p>
      <div className="flex h-7 rounded-md overflow-hidden text-xs font-medium">
        {negPct > 0 && (
          <div
            className="flex items-center justify-center text-destructive-foreground"
            style={{ width: `${negPct}%`, backgroundColor: "hsl(0 72% 51%)" }}
          >
            {negPct}%
          </div>
        )}
        {neuPct > 0 && (
          <div
            className="flex items-center justify-center"
            style={{ width: `${neuPct}%`, backgroundColor: "hsl(220 10% 80%)" }}
          >
            {neuPct}%
          </div>
        )}
        {posPct > 0 && (
          <div
            className="flex items-center justify-center text-success-foreground"
            style={{ width: `${posPct}%`, backgroundColor: "hsl(142 71% 45%)" }}
          >
            {posPct}%
          </div>
        )}
      </div>
      <div className="flex gap-4 mt-1.5 text-xs text-muted-foreground">
        <span className="flex items-center gap-1">
          <span className="w-2.5 h-2.5 rounded-sm inline-block" style={{ backgroundColor: "hsl(0 72% 51%)" }} />
          {config.negLabel}
        </span>
        <span className="flex items-center gap-1">
          <span className="w-2.5 h-2.5 rounded-sm inline-block" style={{ backgroundColor: "hsl(220 10% 80%)" }} />
          {config.neuLabel}
        </span>
        <span className="flex items-center gap-1">
          <span className="w-2.5 h-2.5 rounded-sm inline-block" style={{ backgroundColor: "hsl(142 71% 45%)" }} />
          {config.posLabel}
        </span>
      </div>
      {mainProblem && (
        <p className="text-xs text-muted-foreground mt-1">
          Main problem: {mainProblem}
        </p>
      )}
    </div>
  );
}

export function AspectAnalysis({ feedback }: { feedback: Feedback[] }) {
  const aspects = ["Shipping", "Pricing", "Quality", "Staff Attitude"];

  return (
    <Card className="p-5">
      <h3 className="font-semibold text-foreground mb-4">
        Aspect-based Analysis
      </h3>
      {aspects.map((aspect, i) => {
        const items = feedback.filter((f) => f.aspect === aspect);
        const total = items.length || 1;
        const neg = items.filter((f) => f.sentiment === "Negative").length;
        const neu = items.filter((f) => f.sentiment === "Neutral").length;
        const pos = items.filter((f) => f.sentiment === "Positive").length;

        const config = ASPECT_CONFIG[aspect];
        const mainProblems: Record<string, string> = {
          Shipping: "Long shipping time",
        };

        return (
          <div key={aspect}>
            <p className="text-sm font-semibold mb-1">
              {i + 1}. {aspect}
            </p>
            <AspectBar
              label=""
              negPct={Math.round((neg / total) * 100)}
              neuPct={Math.round((neu / total) * 100)}
              posPct={Math.round((pos / total) * 100)}
              config={config}
              mainProblem={mainProblems[aspect]}
            />
          </div>
        );
      })}
    </Card>
  );
}
