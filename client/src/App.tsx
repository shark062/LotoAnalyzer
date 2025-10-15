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
import ManualPicker from "@/pages/ManualPicker"; // Import the new page


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
      <Route path="/manual-picker" component={ManualPicker} /> {/* Add the new route */}
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  // Registrar Service Worker para modo offline
  useEffect(() => {
    if ('serviceWorker' in navigator) {
      window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js')
          .then((registration) => {
            console.log('🦈 SW registrado com sucesso:', registration.scope);
          })
          .catch((error) => {
            console.log('🦈 SW falhou ao registrar:', error);
          });
      });
    }

    // Handle online/offline status
    const handleOnline = () => {
      console.log('🌐 Aplicação online');
    };

    const handleOffline = () => {
      console.log('📴 Aplicação offline - usando cache');
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
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