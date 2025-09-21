import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useEffect } from "react";
import NotFound from "@/pages/not-found";
import Home from "@/pages/Home";
import HeatMap from "@/pages/HeatMap";
import Generator from "@/pages/Generator";
import Results from "@/pages/Results";
import AIAnalysis from "@/pages/AIAnalysis";
import Information from "@/pages/Information";
import cyberpunkShark from "@assets/cyberpunk-shark-icon_1757013800834.png";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/heat-map" component={HeatMap} />
      <Route path="/generator" component={Generator} />
      <Route path="/results" component={Results} />
      <Route path="/ai-analysis" component={AIAnalysis} />
      <Route path="/information" component={Information} />
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
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <div className="min-h-screen bg-background text-foreground" style={{ backgroundColor: 'hsl(240, 15%, 3%)' }}>
          {/* Cyberpunk Shark Background */}
          <div 
            className="fixed inset-0 opacity-10 pointer-events-none"
            style={{
              backgroundImage: `url(${cyberpunkShark})`,
              backgroundSize: 'contain',
              backgroundRepeat: 'no-repeat',
              backgroundPosition: 'center',
              backgroundAttachment: 'fixed'
            }}
          ></div>
          
          <Toaster />
          <Router />
        </div>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
