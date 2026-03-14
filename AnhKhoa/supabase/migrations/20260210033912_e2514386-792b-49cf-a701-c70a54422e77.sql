
-- Fix overly permissive INSERT policies
DROP POLICY "Authenticated users can insert tickets" ON public.tickets;
DROP POLICY "Authenticated users can insert feedback" ON public.customer_feedback;

CREATE POLICY "Authenticated users can insert tickets" ON public.tickets FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Authenticated users can insert feedback" ON public.customer_feedback FOR INSERT TO authenticated WITH CHECK (true);
