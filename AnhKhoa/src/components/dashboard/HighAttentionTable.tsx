import { Card } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import type { Ticket } from "@/hooks/useTickets";

export function HighAttentionTable({ tickets }: { tickets: Ticket[] }) {
  // Show open tickets with negative sentiment sorted by waiting time
  const highAttention = tickets
    .filter((t) => t.sentiment === "Negative" && t.status === "Open")
    .sort((a, b) => b.waiting_time_minutes - a.waiting_time_minutes)
    .slice(0, 10);

  return (
    <Card className="p-5">
      <h3 className="font-semibold text-foreground mb-4">
        High Attention Tickets
      </h3>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Ticket</TableHead>
            <TableHead>Issue</TableHead>
            <TableHead>Sentiment</TableHead>
            <TableHead>Waiting Time</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {highAttention.map((t) => (
            <TableRow key={t.id}>
              <TableCell className="font-medium">{t.ticket_number}</TableCell>
              <TableCell>{t.issue}</TableCell>
              <TableCell>
                <Badge
                  variant="destructive"
                  className="rounded-full px-4"
                >
                  Negative
                </Badge>
              </TableCell>
              <TableCell>{t.waiting_time_minutes} mins</TableCell>
            </TableRow>
          ))}
          {highAttention.length === 0 && (
            <TableRow>
              <TableCell colSpan={4} className="text-center text-muted-foreground">
                Không có ticket cần chú ý
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </Card>
  );
}
