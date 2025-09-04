import { useState } from "react";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Menu, 
  Flame, 
  Dice6, 
  Trophy, 
  Brain, 
  Info, 
  Home,
  Zap,
  History,
  BarChart3,
  Settings,
  User,
  TrendingUp
} from "lucide-react";
import sharkLogo from "@assets/Logo Futurista da Shark Loterias_1757013773517.png";

export default function Navigation() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [location] = useLocation();

  const navItems = [
    { 
      href: "/", 
      label: "Dashboard", 
      icon: Home, 
      emoji: "🏠",
      description: "Painel principal com visão geral"
    },
    { 
      href: "/heat-map", 
      label: "Mapa de Calor", 
      icon: Flame, 
      emoji: "🔥❄️♨️",
      description: "Análise de números quentes e frios"
    },
    { 
      href: "/generator", 
      label: "Gerador", 
      icon: Dice6, 
      emoji: "🔮",
      description: "Gerar jogos inteligentes"
    },
    { 
      href: "/results", 
      label: "Resultados", 
      icon: Trophy, 
      emoji: "📊",
      description: "Histórico de sorteios e prêmios"
    },
    { 
      href: "/ai-analysis", 
      label: "IA Análises", 
      icon: Brain, 
      emoji: "🤖",
      description: "Análises avançadas com inteligência artificial"
    },
    { 
      href: "/information", 
      label: "Informações", 
      icon: Info, 
      emoji: "📚",
      description: "Guia completo das modalidades"
    },
  ];

  const quickActions = [
    { 
      action: () => window.location.href = "/generator",
      label: "Gerar Jogos Rápido",
      icon: Zap,
      variant: "primary" as const,
      tooltip: "Gerar jogos com IA instantaneamente"
    },
    { 
      action: () => window.location.href = "/results",
      label: "Ver Resultados",
      icon: History,
      variant: "secondary" as const,
      tooltip: "Verificar últimos resultados"
    },
    { 
      action: () => window.location.href = "/heat-map",
      label: "Análise Rápida",
      icon: TrendingUp,
      variant: "outline" as const,
      tooltip: "Visualizar tendências dos números"
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
              <div className="w-12 h-12 bg-gradient-to-br from-primary to-secondary rounded-xl flex items-center justify-center animate-pulse overflow-hidden">
                <img 
                  src={sharkLogo} 
                  alt="Shark Loterias Logo" 
                  className="w-10 h-10 object-contain"
                  onError={(e) => {
                    e.currentTarget.style.display = 'none';
                    e.currentTarget.parentElement!.innerHTML = '<span class="text-2xl">🦈</span>';
                  }}
                />
              </div>
              <div>
                <h1 className="text-xl font-bold neon-text text-primary">SHARK LOTO 💵</h1>
                <p className="text-xs text-muted-foreground font-mono">Powered by Shark062 ⚡</p>
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
              <span className="ml-2 text-xs">Menu</span>
            </Button>

            {/* Desktop Navigation Tabs */}
            <div className="hidden lg:block">
              <Tabs value={location === "/" ? "/" : location} className="w-auto">
                <TabsList className="bg-card/50 backdrop-blur-sm border border-border/50 p-1">
                  {navItems.map((item) => {
                    const Icon = item.icon;
                    const isActive = location === item.href;
                    
                    return (
                      <TabsTrigger 
                        key={item.href}
                        value={item.href}
                        className={`flex items-center space-x-2 px-4 py-2 transition-all duration-300 ${
                          isActive 
                            ? "bg-primary text-primary-foreground shadow-lg neon-glow" 
                            : "hover:bg-muted/50 hover:text-primary"
                        }`}
                        onClick={() => window.location.href = item.href}
                        data-testid={`nav-tab-${item.label.toLowerCase().replace(/\s+/g, '-')}`}
                      >
                        <Icon className="h-4 w-4" />
                        <span className="font-medium">{item.label}</span>
                        <span className="text-xs opacity-70">{item.emoji}</span>
                      </TabsTrigger>
                    );
                  })}
                </TabsList>
              </Tabs>
            </div>
          </div>

          {/* Secondary Navigation Bar - Desktop Only */}
          <div className="hidden lg:flex items-center justify-between mt-4 pt-3 border-t border-border/30">
            <div className="flex items-center space-x-2 text-xs text-muted-foreground">
              <div className="flex items-center space-x-1 bg-neon-green/10 text-neon-green px-2 py-1 rounded-full border border-neon-green/30">
                <div className="w-1.5 h-1.5 bg-neon-green rounded-full animate-pulse"></div>
                <span className="font-mono">Dados Oficiais Caixa</span>
              </div>
              <div className="flex items-center space-x-1 bg-secondary/10 text-secondary px-2 py-1 rounded-full border border-secondary/30">
                <Brain className="w-3 h-3" />
                <span className="font-mono">IA Ativa</span>
              </div>
              <div className="flex items-center space-x-1 bg-accent/10 text-accent px-2 py-1 rounded-full border border-accent/30">
                <BarChart3 className="w-3 h-3" />
                <span className="font-mono">Análise em Tempo Real</span>
              </div>
            </div>

            {/* Current Page Info */}
            <div className="text-xs text-muted-foreground">
              {navItems.find(item => item.href === location)?.description || "Navegação principal"}
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black/95 z-40 lg:hidden backdrop-blur-sm"
          onClick={() => setIsMobileMenuOpen(false)}
          data-testid="mobile-menu-overlay"
        >
          <div className="container mx-auto px-4 py-8">
            {/* Mobile Header */}
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-br from-primary to-secondary rounded-lg flex items-center justify-center">
                  <span className="text-xl">🦈</span>
                </div>
                <div>
                  <h2 className="text-lg font-bold neon-text text-primary">SHARK LOTO</h2>
                  <p className="text-xs text-muted-foreground">Menu Principal</p>
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsMobileMenuOpen(false)}
                className="text-muted-foreground hover:text-primary"
              >
                ✕
              </Button>
            </div>

            {/* Mobile Navigation */}
            <nav className="space-y-4">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = location === item.href;
                
                return (
                  <Link 
                    key={item.href}
                    href={item.href}
                    className={`flex items-center justify-between p-4 rounded-xl transition-all duration-300 group ${
                      isActive 
                        ? "text-primary bg-primary/10 border border-primary/30" 
                        : "text-muted-foreground hover:text-primary hover:bg-card/40 border border-transparent"
                    }`}
                    onClick={() => setIsMobileMenuOpen(false)}
                    data-testid={`mobile-nav-link-${item.label.toLowerCase().replace(/\s+/g, '-')}`}
                  >
                    <div className="flex items-center space-x-4">
                      <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                        isActive ? 'bg-primary text-primary-foreground' : 'bg-muted/30 group-hover:bg-primary/20'
                      }`}>
                        <Icon className="h-5 w-5" />
                      </div>
                      <div>
                        <div className="font-medium text-lg">{item.label}</div>
                        <div className="text-xs opacity-70">{item.description}</div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="text-lg">{item.emoji}</span>
                      <span className="text-xs">→</span>
                    </div>
                  </Link>
                );
              })}
            </nav>

            {/* Mobile Quick Actions */}
            <div className="mt-8 pt-6 border-t border-border/50">
              <h3 className="text-sm font-medium text-muted-foreground mb-4">Ações Rápidas</h3>
              <div className="grid grid-cols-1 gap-3">
                {quickActions.map((action, index) => {
                  const Icon = action.icon;
                  return (
                    <Button
                      key={index}
                      onClick={() => {
                        action.action();
                        setIsMobileMenuOpen(false);
                      }}
                      variant={action.variant === "primary" ? "default" : action.variant as any}
                      className={`justify-start h-12 ${
                        action.variant === "primary" 
                          ? "bg-gradient-to-r from-primary to-secondary" 
                          : ""
                      }`}
                      data-testid={`mobile-quick-action-${action.label.toLowerCase().replace(/\s+/g, '-')}`}
                    >
                      <Icon className="h-5 w-5 mr-3" />
                      <div className="text-left">
                        <div className="font-medium">{action.label}</div>
                        <div className="text-xs opacity-70">{action.tooltip}</div>
                      </div>
                    </Button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Quick Actions - Desktop Only */}
      <div className="hidden lg:block fixed top-32 right-6 z-40">
        <div className="space-y-3">
          <div className="text-xs text-muted-foreground text-center mb-2 font-mono">
            ⚡ Ações Rápidas
          </div>
          {quickActions.map((action, index) => {
            const Icon = action.icon;
            return (
              <Button
                key={index}
                onClick={action.action}
                variant={action.variant === "primary" ? "default" : action.variant as any}
                size="sm"
                className={`w-full shadow-lg transition-all duration-300 group relative ${
                  action.variant === "primary" 
                    ? "bg-gradient-to-r from-primary to-secondary hover:animate-glow" 
                    : action.variant === "secondary"
                    ? "bg-gradient-to-r from-accent to-neon-gold hover:animate-glow"
                    : "border-2 border-dashed border-primary/30 hover:border-primary hover:bg-primary/10"
                }`}
                data-testid={`quick-action-${action.label.toLowerCase().replace(/\s+/g, '-')}`}
                title={action.tooltip}
              >
                <Icon className="h-4 w-4 mr-2" />
                {action.label}
                
                {/* Tooltip */}
                <div className="absolute right-full mr-3 top-1/2 -translate-y-1/2 bg-card border border-border/50 rounded-lg px-3 py-2 text-xs text-foreground opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none whitespace-nowrap backdrop-blur-sm">
                  {action.tooltip}
                  <div className="absolute left-full top-1/2 -translate-y-1/2 border-4 border-transparent border-l-border/50"></div>
                </div>
              </Button>
            );
          })}
          
          {/* Status Indicator */}
          <div className="mt-4 p-3 bg-card/50 border border-border/50 rounded-lg backdrop-blur-sm">
            <div className="text-xs text-center space-y-1">
              <div className="flex items-center justify-center space-x-1 text-neon-green">
                <div className="w-2 h-2 bg-neon-green rounded-full animate-pulse"></div>
                <span>Sistema Online</span>
              </div>
              <div className="text-muted-foreground">
                IA Ativa • Dados Atualizados
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
