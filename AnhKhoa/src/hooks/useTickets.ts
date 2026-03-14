import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { Tables } from "@/integrations/supabase/types";

export type Ticket = Tables<"tickets">;

export function useTickets(channel?: string, dateFrom?: Date, dateTo?: Date) {
  return useQuery({
    queryKey: ["tickets", channel, dateFrom?.toISOString(), dateTo?.toISOString()],
    queryFn: async () => {
      let query = supabase.from("tickets").select("*");
      if (channel && channel !== "All") {
        query = query.eq("channel", channel);
      }
      if (dateFrom) {
        query = query.gte("created_at", dateFrom.toISOString());
      }
      if (dateTo) {
        const end = new Date(dateTo);
        end.setHours(23, 59, 59, 999);
        query = query.lte("created_at", end.toISOString());
      }
      const { data, error } = await query.order("created_at", { ascending: false });
      if (error) throw error;
      return data as Ticket[];
    },
  });
}
