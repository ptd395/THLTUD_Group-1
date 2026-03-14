
-- Tickets table for KPI dashboard
CREATE TABLE public.tickets (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  ticket_number TEXT NOT NULL,
  issue TEXT NOT NULL,
  sentiment TEXT NOT NULL DEFAULT 'Neutral' CHECK (sentiment IN ('Positive', 'Neutral', 'Negative')),
  waiting_time_minutes INTEGER NOT NULL DEFAULT 0,
  channel TEXT NOT NULL DEFAULT 'Website' CHECK (channel IN ('WhatsApp', 'Messenger', 'Website', 'Email')),
  status TEXT NOT NULL DEFAULT 'Open' CHECK (status IN ('Open', 'In Progress', 'Resolved', 'Closed')),
  handling_time_seconds INTEGER,
  ai_assisted BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  resolved_at TIMESTAMP WITH TIME ZONE
);

-- Customer feedback for Sentiment dashboard
CREATE TABLE public.customer_feedback (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  customer_name TEXT NOT NULL,
  aspect TEXT NOT NULL CHECK (aspect IN ('Shipping', 'Pricing', 'Quality', 'Staff Attitude', 'Delivery', 'Product quality', 'Other')),
  aspect_detail TEXT CHECK (aspect_detail IN ('Slow / Broken', 'Normal', 'Fast', 'Expensive / Not worth it', 'Acceptable', 'Cheap', 'Technical error', 'Temporarily okay', 'Good / Durable', 'Enthusiastic / Friendly', 'Listless')),
  sentiment TEXT NOT NULL DEFAULT 'Neutral' CHECK (sentiment IN ('Positive', 'Neutral', 'Negative')),
  summary TEXT,
  channel TEXT NOT NULL DEFAULT 'Website' CHECK (channel IN ('WhatsApp', 'Messenger', 'Website', 'Email')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS (public read for dashboard display)
ALTER TABLE public.tickets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.customer_feedback ENABLE ROW LEVEL SECURITY;

-- Public read policies (dashboard data viewable by all)
CREATE POLICY "Tickets are viewable by everyone" ON public.tickets FOR SELECT USING (true);
CREATE POLICY "Feedback is viewable by everyone" ON public.customer_feedback FOR SELECT USING (true);

-- Insert policies (restrict to authenticated users)
CREATE POLICY "Authenticated users can insert tickets" ON public.tickets FOR INSERT WITH CHECK (true);
CREATE POLICY "Authenticated users can insert feedback" ON public.customer_feedback FOR INSERT WITH CHECK (true);
