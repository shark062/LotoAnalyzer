import { useState } from "react";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { 
  Menu, 
  Flame, 
  Dice6, 
  Trophy, 
  Brain, 
  Info, 
  Home,
  Zap,
  History
} from "lucide-react";

export default function Navigation() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [location] = useLocation();

  const navItems = [
    { href: "/", label: "Dashboard", icon: Home },
    { href: "/heat-map", label: "Mapa de Calor", icon: Flame, emoji: "🔥❄️♨️" },
    { href: "/generator", label: "Gerador", icon: Dice6, emoji: "🔮" },
    { href: "/results", label: "Resultados", icon: Trophy, emoji: "📊" },
    { href: "/ai-analysis", label: "IA Análises", icon: Brain, emoji: "🤖" },
    { href: "/information", label: "Informações", icon: Info, emoji: "📚" },
  ];

  const quickActions = [
    { 
      action: () => window.location.href = "/generator",
      label: "Gerar Jogos Rápido",
      icon: Zap,
      variant: "primary" as const
    },
    { 
      action: () => window.location.href = "/results",
      label: "Ver Resultados",
      icon: History,
      variant: "secondary" as const
    },
  ];

  return (
    <>
      {/* Header */}
      <header className="relative z-50 border-b border-border/50 bg-card/80 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <Link href="/" className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-primary to-secondary rounded-lg flex items-center justify-center neon-border">
                <span className="text-xl">🦈</span>
              </div>
              <div>
                <h1 className="text-xl font-bold neon-text text-primary">SHARK LOTO 💵</h1>
                <p className="text-xs text-muted-foreground font-mono">Powered by Shark062</p>
              </div>
            </Link>

            {/* Mobile Menu Button */}
            <Button
              variant="outline"
              size="sm"
              className="lg:hidden"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              data-testid="mobile-menu-toggle"
            >
              <Menu className="h-4 w-4" />
            </Button>

            {/* Desktop Menu */}
            <nav className="hidden lg:flex items-center space-x-6">
              {navItems.slice(1).map((item) => {
                const Icon = item.icon;
                const isActive = location === item.href;
                
                return (
                  <Link 
                    key={item.href} 
                    href={item.href}
                    className={`flex items-center space-x-2 transition-all duration-300 ${
                      isActive 
                        ? "text-primary" 
                        : "text-muted-foreground hover:text-primary"
                    }`}
                    data-testid={`nav-link-${item.label.toLowerCase().replace(/\s+/g, '-')}`}
                  >
                    <Icon className="h-4 w-4" />
                    <span>{item.label}</span>
                    {item.emoji && <span className="text-xs">{item.emoji}</span>}
                  </Link>
                );
              })}
            </nav>
          </div>
        </div>
      </header>

      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black/90 z-40 lg:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
          data-testid="mobile-menu-overlay"
        >
          <div className="container mx-auto px-4 py-8">
            <nav className="space-y-6">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = location === item.href;
                
                return (
                  <Link 
                    key={item.href}
                    href={item.href}
                    className={`flex items-center space-x-4 text-lg transition-all duration-300 p-4 rounded-lg ${
                      isActive 
                        ? "text-primary bg-card/40" 
                        : "text-muted-foreground hover:text-primary hover:bg-card/20"
                    }`}
                    onClick={() => setIsMobileMenuOpen(false)}
                    data-testid={`mobile-nav-link-${item.label.toLowerCase().replace(/\s+/g, '-')}`}
                  >
                    <Icon className="h-6 w-6" />
                    <span>{item.label}</span>
                    {item.emoji && <span className="text-xs opacity-60">{item.emoji}</span>}
                  </Link>
                );
              })}
            </nav>
          </div>
        </div>
      )}

      {/* Quick Actions - Desktop Only */}
      <div className="hidden lg:block fixed top-24 right-6 z-40">
        <div className="space-y-3">
          {quickActions.map((action, index) => {
            const Icon = action.icon;
            return (
              <Button
                key={index}
                onClick={action.action}
                variant={action.variant === "primary" ? "default" : "secondary"}
                size="sm"
                className={`shadow-lg transition-all duration-300 ${
                  action.variant === "primary" 
                    ? "bg-gradient-to-r from-primary to-secondary hover:animate-glow neon-border" 
                    : "bg-gradient-to-r from-accent to-neon-gold hover:animate-glow neon-border"
                }`}
                data-testid={`quick-action-${action.label.toLowerCase().replace(/\s+/g, '-')}`}
              >
                <Icon className="h-4 w-4 mr-2" />
                {action.label}
              </Button>
            );
          })}
        </div>
      </div>
    </>
  );
}
