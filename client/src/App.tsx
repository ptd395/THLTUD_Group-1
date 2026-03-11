import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import Home from "@/pages/Home";
import Demo from "@/pages/Demo";
import Settings from "@/pages/Settings";
import Dashboard from "@/pages/Dashboard";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import AppTaskbarLayout from "./components/AppTaskbarLayout";
import { ThemeProvider } from "./contexts/ThemeContext";
import { SentimentProvider } from "./contexts/SentimentContext";

function HomeRoute() {
  return (
    <AppTaskbarLayout>
      <Home />
    </AppTaskbarLayout>
  );
}

function DemoRoute() {
  return (
    <AppTaskbarLayout>
      <Demo />
    </AppTaskbarLayout>
  );
}

function SettingsRoute() {
  return (
    <AppTaskbarLayout>
      <Settings />
    </AppTaskbarLayout>
  );
}

function DashboardRoute() {
  return (
    <AppTaskbarLayout>
      <Dashboard />
    </AppTaskbarLayout>
  );
}

function Router() {
  // make sure to consider if you need authentication for certain routes
  return (
    <Switch>
      <Route path={"/"} component={HomeRoute} />
      <Route path={"/demo"} component={DemoRoute} />
      <Route path={"/settings/sentiment"} component={SettingsRoute} />
      <Route path={"/dashboard"} component={DashboardRoute} />
      <Route path={"/404"} component={NotFound} />
      {/* Final fallback route */}
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="light">
        <SentimentProvider>
          <TooltipProvider>
            <Toaster />
            <Router />
          </TooltipProvider>
        </SentimentProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
