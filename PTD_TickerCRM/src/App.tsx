import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { TicketProvider } from "@/context/TicketContext";
import AppLayout from "@/components/AppLayout";
import Index from "./pages/Index.tsx";
import NotFound from "./pages/NotFound.tsx";
import TicketListPage from "./pages/TicketListPage.tsx";
import TicketProcessPage from "./pages/TicketProcessPage.tsx";
import TicketDetailPage from "./pages/TicketDetailPage.tsx";
import TicketClosedPage from "./pages/TicketClosedPage.tsx";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <TicketProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route element={<AppLayout />}>
              <Route path="/" element={<Index />} />
              <Route path="/tickets" element={<TicketListPage />} />
              <Route path="/tickets/process/:id" element={<TicketProcessPage />} />
              <Route path="/tickets/detail/:id" element={<TicketDetailPage />} />
              <Route path="/tickets/closed/:id" element={<TicketClosedPage />} />
            </Route>
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TicketProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
