import React, { useEffect } from "react";
import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import NotFound from "@/pages/not-found";
import Home from "@/pages/Home";
import HeatMap from "@/pages/HeatMap";
import Generator from "@/pages/Generator";
import Results from "@/pages/Results";
import AIAnalysis from "@/pages/AIAnalysis";
import AIMetrics from "@/pages/AIMetrics";
import Information from "@/pages/Information";
import AdvancedDashboard from "@/components/AdvancedDashboard";
function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/heat-map" component={HeatMap} />
      <Route path="/generator" component={Generator} />
      <Route path="/results" component={Results} />
      <Route path="/ai-analysis" component={AIAnalysis} />
      <Route path="/ai-metrics" component={AIMetrics} />
      <Route path="/information" component={Information} />
      <Route path="/advanced-dashboard" component={AdvancedDashboard} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  // Initialize app (Service Worker registration removed for standalone deployment)
  useEffect(() => {
    // App initialization
    console.log('🦈 Shark Loterias initialized');
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <div className="min-h-screen bg-black text-foreground">
        <Toaster />
        <Router />
      </div>
    </QueryClientProvider>
  );
}

export default App;