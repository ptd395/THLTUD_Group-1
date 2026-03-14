import { Card } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { Feedback } from "@/hooks/useFeedback";
import { cn } from "@/lib/utils";

export function FeedbackTable({ feedback }: { feedback: Feedback[] }) {
  return (
    <Card className="p-5">
      <h3 className="font-semibold text-foreground mb-4">
        Representative Customer Feedback (Common Issues)
      </h3>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Customer</TableHead>
            <TableHead>Aspect</TableHead>
            <TableHead>Setiment</TableHead>
            <TableHead>Summary</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {feedback.slice(0, 10).map((f) => (
            <TableRow key={f.id}>
              <TableCell className="font-medium">{f.customer_name}</TableCell>
              <TableCell>{f.aspect}</TableCell>
              <TableCell>
                <span
                  className={cn(
                    "font-medium",
                    f.sentiment === "Negative" && "text-destructive",
                    f.sentiment === "Positive" && "text-success",
                    f.sentiment === "Neutral" && "text-warning"
                  )}
                >
                  {f.sentiment}
                </span>
              </TableCell>
              <TableCell className="max-w-md">{f.summary}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </Card>
  );
}
