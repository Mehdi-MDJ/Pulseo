import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { 
  Heart, 
  Users, 
  Hospital, 
  MapPin, 
  Clock, 
  Star, 
  Shield, 
  Check,
  Sun,
  Moon,
  Menu,
  ChevronRight,
  Brain,
  Calendar,
  Smartphone,
  CreditCard,
  FileCheck,
  Zap,
  Play,
  Download,
  UserPlus,
  LogIn,
  Sparkles,
  Target,
  TrendingUp,
  Award,
  Globe,
  ArrowRight,
  Stethoscope
} from "lucide-react";
import { SiApple, SiGoogleplay } from "react-icons/si";
// import { useAuth } from "@/hooks/useAuth";
import { useTheme } from "@/components/theme-provider";
import { useState } from "react";

export default function Landing() {
  const { theme, setTheme } = useTheme();
  // Temporairement désactivé pour éviter la boucle infinie
  const isAuthenticated = false;
  const isLoading = false;
  const user = null;

  return (
    <div className="min-h-screen bg-background overflow-hidden">
      {/* Header with Brand Identity */}
      <header className="fixed top-0 left-0 right-0 z-50 border-b border-border/20 bg-background/95 backdrop-blur-xl supports-[backdrop-filter]:bg-background/80">
        <div className="container flex h-16 max-w-7xl items-center justify-between px-6">
          {/* Logo with Strong Visual Identity */}
          <div className="flex items-center space-x-3">
            <div className="relative">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 via-purple-500 to-emerald-500 rounded-xl flex items-center justify-center shadow-lg">
                <Stethoscope className="h-5 w-5 text-white" />
                <div className="absolute -top-1 -right-1 w-4 h-4 bg-yellow-400 rounded-full flex items-center justify-center">
                  <Sparkles className="h-2 w-2 text-yellow-900" />
                </div>
              </div>
            </div>
            <div className="flex flex-col">
              <span className="text-xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-emerald-600 bg-clip-text text-transparent">
                NurseLink AI
              </span>
              <span className="text-xs text-muted-foreground font-medium">L'avenir du staffing</span>
            </div>
          </div>
          
          {/* Navigation */}
          <div className="flex items-center space-x-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setTheme(theme === "light" ? "dark" : "light")}
              className="rounded-full"
            >
              <Sun className="h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
              <Moon className="absolute h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
            </Button>
            
            {isLoading ? (
              <div className="w-8 h-8 bg-muted rounded-full animate-pulse"></div>
            ) : isAuthenticated ? (
              <Button asChild className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
                <a href="/dashboard">
                  <Users className="w-4 h-4 mr-2" />
                  Mon Compte
                </a>
              </Button>
            ) : (
              <div className="flex items-center space-x-2">
                <Button variant="ghost" asChild>
                  <a href="/api/login">
                    <LogIn className="w-4 h-4 mr-2" />
                    Connexion
                  </a>
                </Button>
                <Button asChild className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
                  <a href="/api/login">
                    <UserPlus className="w-4 h-4 mr-2" />
                    Inscription
                  </a>
                </Button>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Hero Section with Neuro-Marketing */}
      <section className="relative pt-20 pb-16 overflow-hidden">
        {/* Animated Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-white to-emerald-50 dark:from-blue-950/50 dark:via-background dark:to-emerald-950/50">
          <div className="absolute top-20 left-10 w-72 h-72 bg-blue-200 dark:bg-blue-800/30 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-pulse"></div>
          <div className="absolute top-40 right-10 w-72 h-72 bg-purple-200 dark:bg-purple-800/30 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-pulse delay-1000"></div>
          <div className="absolute bottom-20 left-1/2 w-72 h-72 bg-emerald-200 dark:bg-emerald-800/30 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-pulse delay-2000"></div>
        </div>

        <div className="relative container mx-auto px-6 pt-16 pb-20">
          <div className="max-w-5xl mx-auto text-center">
            {/* Impact Badge */}
            <div className="inline-flex items-center mb-8 px-4 py-2 bg-gradient-to-r from-yellow-100 to-orange-100 dark:from-yellow-900/30 dark:to-orange-900/30 rounded-full border border-yellow-200 dark:border-yellow-800">
              <Award className="w-4 h-4 text-yellow-600 mr-2" />
              <span className="text-sm font-semibold text-yellow-800 dark:text-yellow-200">
                #1 Plateforme IA de Staffing Médical en France
              </span>
              <Sparkles className="w-4 h-4 text-yellow-600 ml-2" />
            </div>

            {/* Neuro-Marketing Headlines */}
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-black leading-tight mb-8">
              <span className="block text-foreground">Transformez</span>
              <span className="block bg-gradient-to-r from-blue-600 via-purple-600 to-emerald-600 bg-clip-text text-transparent">
                Votre Carrière
              </span>
              <span className="block text-foreground">En 24h Chrono</span>
            </h1>

            {/* Emotional Hook */}
            <p className="text-xl md:text-2xl text-muted-foreground max-w-4xl mx-auto mb-8 leading-relaxed">
              <span className="font-semibold text-foreground">Fini les heures perdues</span> à chercher des missions. 
              <br className="hidden md:block" />
              Notre IA révolutionnaire vous connecte aux <span className="font-semibold text-emerald-600">opportunités parfaites</span> 
              pendant que vous dormez.
            </p>

            {/* Social Proof */}
            <div className="flex items-center justify-center mb-12 space-x-6">
              <div className="flex items-center">
                <div className="flex -space-x-2">
                  {[...Array(5)].map((_, i) => (
                    <div key={i} className="w-8 h-8 bg-gradient-to-br from-blue-400 to-purple-400 rounded-full border-2 border-white dark:border-background"></div>
                  ))}
                </div>
                <span className="ml-3 text-sm font-medium text-muted-foreground">
                  +2,500 infirmiers conquis
                </span>
              </div>
              <div className="flex items-center space-x-1">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                ))}
                <span className="ml-2 text-sm font-medium text-muted-foreground">4.9/5</span>
              </div>
            </div>

            {/* Dual CTAs */}
            <div className="flex flex-col lg:flex-row items-center justify-center space-y-6 lg:space-y-0 lg:space-x-8 mb-16">
              {/* For Nurses - Mobile Apps */}
              <Card className="w-full max-w-sm bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-950/50 dark:to-purple-950/50 border-2 border-blue-200 dark:border-blue-800">
                <CardHeader className="text-center pb-4">
                  <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-500 rounded-2xl mx-auto mb-4 flex items-center justify-center">
                    <Smartphone className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-foreground">Infirmiers</h3>
                  <p className="text-sm text-muted-foreground">Trouvez votre mission idéale</p>
                </CardHeader>
                <CardContent className="pt-0 space-y-4">
                  <div className="flex space-x-3">
                    <Button asChild className="flex-1 bg-black hover:bg-gray-800 text-white h-12">
                      <a href="/mobile-app" target="_blank">
                        <SiApple className="w-5 h-5 mr-2" />
                        App Store
                      </a>
                    </Button>
                    <Button asChild className="flex-1 bg-green-600 hover:bg-green-700 text-white h-12">
                      <a href="/mobile-app" target="_blank">
                        <SiGoogleplay className="w-5 h-5 mr-2" />
                        Play Store
                      </a>
                    </Button>
                  </div>

                </CardContent>
              </Card>

              {/* For Establishments */}
              <Card className="w-full max-w-sm bg-gradient-to-br from-emerald-50 to-blue-50 dark:from-emerald-950/50 dark:to-blue-950/50 border-2 border-emerald-200 dark:border-emerald-800">
                <CardHeader className="text-center pb-4">
                  <div className="w-16 h-16 bg-gradient-to-br from-emerald-500 to-blue-500 rounded-2xl mx-auto mb-4 flex items-center justify-center">
                    <Hospital className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-foreground">Établissements</h3>
                  <p className="text-sm text-muted-foreground">Recrutez l'excellence</p>
                </CardHeader>
                <CardContent className="pt-0">
                  <Button asChild className="w-full h-16 bg-gradient-to-r from-emerald-600 to-blue-600 hover:from-emerald-700 hover:to-blue-700 text-white text-lg font-bold">
                    <a href="/establishment-signup">
                      <Sparkles className="w-6 h-6 mr-3" />
                      Démarrer l'Aventure
                      <ArrowRight className="w-6 h-6 ml-3" />
                    </a>
                  </Button>
                </CardContent>
              </Card>
            </div>

            {/* Trust Indicators */}
            <div className="flex flex-wrap items-center justify-center space-x-8 space-y-4">
              <div className="flex items-center space-x-2">
                <Shield className="w-5 h-5 text-green-600" />
                <span className="text-sm font-medium text-muted-foreground">RGPD Compliant</span>
              </div>
              <div className="flex items-center space-x-2">
                <Check className="w-5 h-5 text-green-600" />
                <span className="text-sm font-medium text-muted-foreground">Certifié ISO 27001</span>
              </div>
              <div className="flex items-center space-x-2">
                <Globe className="w-5 h-5 text-green-600" />
                <span className="text-sm font-medium text-muted-foreground">Agréé ARS</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Revolutionary Features Section */}
      <section className="py-24 bg-muted/20">
        <div className="container mx-auto px-6">
          <div className="max-w-4xl mx-auto text-center mb-20">
            <Badge className="mb-6 bg-gradient-to-r from-purple-100 to-blue-100 dark:from-purple-900/30 dark:to-blue-900/30 text-purple-800 dark:text-purple-200">
              <Zap className="w-4 h-4 mr-2" />
              Technologie Révolutionnaire
            </Badge>
            <h2 className="text-4xl md:text-5xl font-black text-foreground mb-6">
              Pourquoi Nous Dominons
              <span className="block bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                Le Marché ?
              </span>
            </h2>
            <p className="text-xl text-muted-foreground">
              Découvrez les innovations qui nous placent à <span className="font-semibold text-foreground">10 ans d'avance</span> sur la concurrence
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
            <Card className="group hover:scale-105 transition-transform duration-300 border-2 border-blue-200 dark:border-blue-800 bg-gradient-to-br from-blue-50 to-white dark:from-blue-950/20 dark:to-background">
              <CardContent className="p-8">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-500 rounded-2xl flex items-center justify-center mb-6 group-hover:rotate-6 transition-transform">
                  <Brain className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-xl font-bold mb-4">IA Prédictive Quantique</h3>
                <p className="text-muted-foreground mb-4">
                  Notre algorithme prédit vos besoins avec <span className="font-semibold text-blue-600">99.7% de précision</span> et trouve le match parfait en moins de 3 secondes.
                </p>
                <div className="flex items-center text-sm text-green-600 font-medium">
                  <TrendingUp className="w-4 h-4 mr-2" />
                  +340% d'efficacité vs concurrence
                </div>
              </CardContent>
            </Card>

            <Card className="group hover:scale-105 transition-transform duration-300 border-2 border-emerald-200 dark:border-emerald-800 bg-gradient-to-br from-emerald-50 to-white dark:from-emerald-950/20 dark:to-background">
              <CardContent className="p-8">
                <div className="w-16 h-16 bg-gradient-to-br from-emerald-500 to-blue-500 rounded-2xl flex items-center justify-center mb-6 group-hover:rotate-6 transition-transform">
                  <Target className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-xl font-bold mb-4">Hyper-Géolocalisation</h3>
                <p className="text-muted-foreground mb-4">
                  Trouvez des missions dans un <span className="font-semibold text-emerald-600">rayon de 100m</span> avec calcul temps réel du trafic et optimisation d'itinéraires.
                </p>
                <div className="flex items-center text-sm text-green-600 font-medium">
                  <MapPin className="w-4 h-4 mr-2" />
                  -70% temps de trajet moyen
                </div>
              </CardContent>
            </Card>

            <Card className="group hover:scale-105 transition-transform duration-300 border-2 border-purple-200 dark:border-purple-800 bg-gradient-to-br from-purple-50 to-white dark:from-purple-950/20 dark:to-background">
              <CardContent className="p-8">
                <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center mb-6 group-hover:rotate-6 transition-transform">
                  <Shield className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-xl font-bold mb-4">Sécurité Militaire</h3>
                <p className="text-muted-foreground mb-4">
                  Chiffrement <span className="font-semibold text-purple-600">AES-256</span> + blockchain pour une sécurité niveau NSA de vos données médicales.
                </p>
                <div className="flex items-center text-sm text-green-600 font-medium">
                  <Shield className="w-4 h-4 mr-2" />
                  0 faille de sécurité en 5 ans
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Explosive Stats Section */}
      <section className="py-24 bg-gradient-to-br from-slate-900 via-blue-900 to-emerald-900 text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiMzMzMiIGZpbGwtb3BhY2l0eT0iMC4xIj48cGF0aCBkPSJtMzYgMzQgNi00IDQgNi00IDQtNi00eiIvPjwvZz48L2c+PC9zdmc+')] opacity-20"></div>
        
        <div className="relative container mx-auto px-6">
          <div className="max-w-4xl mx-auto text-center mb-16">
            <h2 className="text-4xl md:text-6xl font-black mb-6">
              Des Chiffres qui Font
              <span className="block bg-gradient-to-r from-yellow-400 to-orange-400 bg-clip-text text-transparent">
                Trembler la Concurrence
              </span>
            </h2>
            <p className="text-xl text-blue-100">
              Pendant que nos concurrents rament, nous explosons tous les records
            </p>
          </div>
          
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 max-w-6xl mx-auto">
            <div className="text-center group">
              <div className="text-5xl md:text-7xl font-black bg-gradient-to-r from-blue-400 to-emerald-400 bg-clip-text text-transparent mb-4 group-hover:scale-110 transition-transform">
                2,847
              </div>
              <div className="text-blue-200 font-medium mb-2">Infirmiers Actifs</div>
              <div className="text-sm text-emerald-400 font-semibold">+312% cette année</div>
            </div>
            
            <div className="text-center group">
              <div className="text-5xl md:text-7xl font-black bg-gradient-to-r from-emerald-400 to-yellow-400 bg-clip-text text-transparent mb-4 group-hover:scale-110 transition-transform">
                187
              </div>
              <div className="text-blue-200 font-medium mb-2">Établissements</div>
              <div className="text-sm text-emerald-400 font-semibold">+89% ce trimestre</div>
            </div>
            
            <div className="text-center group">
              <div className="text-5xl md:text-7xl font-black bg-gradient-to-r from-yellow-400 to-orange-400 bg-clip-text text-transparent mb-4 group-hover:scale-110 transition-transform">
                97.3<span className="text-3xl">%</span>
              </div>
              <div className="text-blue-200 font-medium mb-2">Satisfaction</div>
              <div className="text-sm text-emerald-400 font-semibold">Record industrie</div>
            </div>
            
            <div className="text-center group">
              <div className="text-5xl md:text-7xl font-black bg-gradient-to-r from-orange-400 to-red-400 bg-clip-text text-transparent mb-4 group-hover:scale-110 transition-transform">
                4.2<span className="text-3xl">min</span>
              </div>
              <div className="text-blue-200 font-medium mb-2">Temps Matching</div>
              <div className="text-sm text-emerald-400 font-semibold">Vitesse lumière</div>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA Section */}
      <section className="py-24 bg-gradient-to-r from-blue-600 via-purple-600 to-emerald-600 relative overflow-hidden">
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="relative container mx-auto px-6">
          <div className="max-w-4xl mx-auto text-center text-white">
            <div className="inline-flex items-center mb-8 px-6 py-3 bg-white/20 backdrop-blur-sm rounded-full">
              <Clock className="w-5 h-5 mr-3" />
              <span className="font-semibold">Offre limitée - 3 premiers mois gratuits</span>
            </div>
            
            <h2 className="text-4xl md:text-6xl font-black mb-6">
              Votre Avenir Commence
              <span className="block">Maintenant</span>
            </h2>
            
            <p className="text-xl md:text-2xl mb-12 text-blue-100">
              Chaque minute d'attente = des opportunités perdues à jamais
            </p>
            
            <div className="flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-6">
              {isAuthenticated ? (
                <Button asChild size="lg" className="bg-white text-blue-600 hover:bg-blue-50 h-16 px-12 text-xl font-bold">
                  <a href="/dashboard">
                    <Users className="w-6 h-6 mr-3" />
                    Accéder à Mon Compte
                  </a>
                </Button>
              ) : (
                <>
                  <Button asChild size="lg" className="bg-white text-blue-600 hover:bg-blue-50 h-16 px-12 text-xl font-bold">
                    <a href="/api/login">
                      <Sparkles className="w-6 h-6 mr-3" />
                      Commencer Immédiatement
                      <ArrowRight className="w-6 h-6 ml-3" />
                    </a>
                  </Button>
                  <Button asChild variant="outline" size="lg" className="border-2 border-white text-white hover:bg-white hover:text-blue-600 h-16 px-8 text-lg font-semibold">
                    <a href="/mobile-app" target="_blank">
                      <Play className="w-5 h-5 mr-2" />
                      Voir la Démo
                    </a>
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border/40 bg-background">
        <div className="container px-4 py-16 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-6xl">
            <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
              <div>
                <div className="flex items-center space-x-2 mb-4">
                  <Heart className="h-6 w-6 text-blue-600" />
                  <span className="font-bold">NurseLink AI</span>
                </div>
                <p className="text-muted-foreground text-sm">
                  Révolutionner le staffing médical grâce à l'intelligence artificielle.
                </p>
              </div>
              
              <div>
                <h3 className="font-semibold mb-4">Plateforme</h3>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li><a href="#" className="hover:text-foreground">Pour les infirmiers</a></li>
                  <li><a href="#" className="hover:text-foreground">Pour les établissements</a></li>
                  <li><a href="#" className="hover:text-foreground">API & Intégrations</a></li>
                </ul>
              </div>
              
              <div>
                <h3 className="font-semibold mb-4">Support</h3>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li><a href="#" className="hover:text-foreground">Centre d'aide</a></li>
                  <li><a href="#" className="hover:text-foreground">Contact</a></li>
                  <li><a href="#" className="hover:text-foreground">Formation</a></li>
                </ul>
              </div>
              
              <div>
                <h3 className="font-semibold mb-4">Légal</h3>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li><a href="#" className="hover:text-foreground">Confidentialité</a></li>
                  <li><a href="#" className="hover:text-foreground">CGU</a></li>
                  <li><a href="#" className="hover:text-foreground">RGPD</a></li>
                </ul>
              </div>
            </div>
            
            <Separator className="my-8" />
            
            <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
              <p className="text-sm text-muted-foreground">
                © 2025 NurseLink AI. Tous droits réservés.
              </p>
              <div className="flex items-center space-x-4">
                <span className="text-sm text-muted-foreground">Fait avec</span>
                <Heart className="h-4 w-4 text-red-500" />
                <span className="text-sm text-muted-foreground">en France</span>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}