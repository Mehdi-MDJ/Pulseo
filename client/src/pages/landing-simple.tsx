import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
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
  ChevronRight,
  Brain,
  Calendar,
  Smartphone,
  Zap,
  Play,
  UserPlus,
  LogIn,
  Sparkles,
  Target,
  TrendingUp,
  Award,
  Globe,
  ArrowRight,
  Stethoscope,
  Clock3,
  Zap as Lightning,
  Target as Bullseye,
  TrendingUp as ChartUp,
  Shield as Security,
  CheckCircle,
  Star as StarIcon
} from "lucide-react";
import { SiApple, SiGoogleplay } from "react-icons/si";
import { useTheme } from "@/components/theme-provider";
import { Helmet } from "react-helmet-async";

export default function LandingSimple() {
  const { theme, setTheme } = useTheme();

  return (
    <>
      {/* SEO Meta Tags */}
      <Helmet>
        <title>NurseLink AI - La Plateforme IA qui Révolutionne le Staffing Médical</title>
        <meta name="description" content="Connectez infirmiers et établissements de santé avec l'intelligence artificielle. Missions temporaires optimisées, planning intelligent, assistant IA personnel. Rejoignez 2500+ professionnels de santé." />
        <meta name="keywords" content="staffing médical, infirmiers, établissements de santé, intelligence artificielle, missions temporaires, planning infirmier, IA médicale" />
        <meta name="author" content="NurseLink AI" />
        <meta name="robots" content="index, follow" />

        {/* Open Graph */}
        <meta property="og:title" content="NurseLink AI - Révolutionnez Votre Carrière Médicale" />
        <meta property="og:description" content="L'IA qui connecte les meilleurs infirmiers aux établissements de santé. Optimisez vos missions, maximisez vos revenus." />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://nurselink-ai.com" />
        <meta property="og:image" content="/og-image.jpg" />

        {/* Twitter Card */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="NurseLink AI - L'Avenir du Staffing Médical" />
        <meta name="twitter:description" content="Rejoignez la révolution du staffing médical avec l'IA" />

        {/* Structured Data */}
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "SoftwareApplication",
            "name": "NurseLink AI",
            "description": "Plateforme IA de staffing médical",
            "applicationCategory": "MedicalApplication",
            "operatingSystem": "Web, iOS, Android",
            "offers": {
              "@type": "Offer",
              "price": "0",
              "priceCurrency": "EUR"
            }
          })}
        </script>
      </Helmet>

    <div className="min-h-screen bg-background overflow-hidden">
      {/* Header with Brand Identity */}
        <header className="fixed top-0 left-0 right-0 z-50 border-b border-border/20 bg-background/95 backdrop-blur-xl supports-[backdrop-filter]:bg-background/80" role="banner">
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
                <span className="text-xs text-muted-foreground font-medium">L'IA qui soigne votre carrière</span>
            </div>
          </div>

          {/* Navigation */}
            <nav className="flex items-center space-x-4" role="navigation" aria-label="Navigation principale">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setTheme(theme === "light" ? "dark" : "light")}
              className="rounded-full"
                aria-label={theme === "light" ? "Passer au mode sombre" : "Passer au mode clair"}
            >
              <Sun className="h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
              <Moon className="absolute h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
            </Button>

            <div className="flex items-center space-x-2">
              <Button variant="ghost" asChild>
                  <a href="/auth-page" aria-label="Se connecter">
                  <LogIn className="w-4 h-4 mr-2" />
                  Connexion
                </a>
              </Button>
              <Button asChild className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
                  <a href="/auth-page" aria-label="S'inscrire">
                  <UserPlus className="w-4 h-4 mr-2" />
                  Inscription
                </a>
              </Button>
            </div>
            </nav>
        </div>
      </header>

      {/* Hero Section with Neuro-Marketing */}
        <section className="relative pt-20 pb-16 overflow-hidden" role="banner" aria-labelledby="hero-heading">
        {/* Animated Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-white to-emerald-50 dark:from-blue-950/50 dark:via-background dark:to-emerald-950/50">
          <div className="absolute top-20 left-10 w-72 h-72 bg-blue-200 dark:bg-blue-800/30 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-pulse"></div>
          <div className="absolute top-40 right-10 w-72 h-72 bg-purple-200 dark:bg-purple-800/30 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-pulse delay-1000"></div>
          <div className="absolute bottom-20 left-1/2 w-72 h-72 bg-emerald-200 dark:bg-emerald-800/30 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-pulse delay-2000"></div>
        </div>

        <div className="relative container mx-auto px-6 pt-16 pb-20">
          <div className="max-w-5xl mx-auto text-center">
            {/* Impact Badge */}
              <div className="inline-flex items-center mb-8 px-4 py-2 bg-gradient-to-r from-yellow-100 to-orange-100 dark:from-yellow-900/30 dark:to-orange-900/30 rounded-full border border-yellow-200 dark:border-yellow-800 animate-pulse">
                <Award className="w-4 h-4 text-yellow-600 mr-2" />
                <span className="text-sm font-semibold text-yellow-800 dark:text-yellow-200">
                  #1 Plateforme IA de Staffing Médical en France
              </span>
                <Sparkles className="w-4 h-4 text-yellow-600 ml-2" />
            </div>

              {/* Professional Headlines - Slogans Ultra-Impactants */}
              <h1 id="hero-heading" className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight mb-8">
                <span className="block text-foreground">Révolutionnez votre</span>
                <span className="block bg-gradient-to-r from-blue-600 to-emerald-600 bg-clip-text text-transparent animate-pulse">
                  carrière médicale
              </span>
                <span className="block text-foreground">en 24h chrono</span>
            </h1>

              {/* Professional Hook - Ultra-Impactant */}
            <p className="text-lg md:text-xl text-muted-foreground max-w-4xl mx-auto mb-8 leading-relaxed">
                <span className="font-bold text-foreground">Fini les heures perdues</span> à chercher des missions.
                <br className="hidden md:block" />
                Notre IA révolutionnaire vous connecte aux <span className="font-bold text-emerald-600">opportunités parfaites</span>
              <br className="hidden md:block" />
                <span className="text-sm text-muted-foreground">Pendant que vous dormez, l'IA travaille pour vous</span>
            </p>

              {/* Social Proof - Plus Crédible */}
            <div className="flex items-center justify-center mb-12 space-x-8">
              <div className="flex items-center">
                <div className="flex -space-x-1">
                  {[...Array(5)].map((_, i) => (
                    <div key={i} className="w-8 h-8 bg-gradient-to-br from-blue-500 to-emerald-500 rounded-full border-2 border-white dark:border-background flex items-center justify-center">
                      <Heart className="w-3 h-3 text-white" />
                    </div>
                  ))}
                </div>
                <span className="ml-3 text-sm font-medium text-muted-foreground">
                  2,500+ soignants nous font confiance
                </span>
              </div>
              <div className="flex items-center space-x-1">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-blue-400 text-blue-400" />
                ))}
                <span className="ml-2 text-sm font-medium text-muted-foreground">4.9/5 de satisfaction</span>
              </div>
            </div>

              {/* Dual CTAs - Routes Corrigées */}
            <div className="flex flex-col lg:flex-row items-center justify-center space-y-6 lg:space-y-0 lg:space-x-8 mb-16">
              {/* For Nurses - Mobile Apps */}
                <Card className="w-full max-w-sm bg-white dark:bg-card border border-border shadow-lg hover:shadow-xl transition-all duration-300" role="article" aria-labelledby="nurse-card-title">
                <CardHeader className="text-center pb-4">
                    <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-500 rounded-lg mx-auto mb-4 flex items-center justify-center">
                    <Smartphone className="w-8 h-8 text-white" />
                  </div>
                    <h3 id="nurse-card-title" className="text-xl font-semibold text-foreground">Soignants</h3>
                    <p className="text-sm text-muted-foreground">Maximisez vos revenus en 3 clics</p>
                </CardHeader>
                <CardContent className="pt-0 space-y-4">
                  <div className="flex space-x-3">
                    <Button asChild className="flex-1 bg-black hover:bg-gray-800 text-white h-12">
                        <a href="/mobile-demo" target="_blank" rel="noopener noreferrer" aria-label="Télécharger sur l'App Store">
                        <SiApple className="w-5 h-5 mr-2" />
                        App Store
                      </a>
                    </Button>
                    <Button asChild className="flex-1 bg-green-600 hover:bg-green-700 text-white h-12">
                        <a href="/mobile-demo" target="_blank" rel="noopener noreferrer" aria-label="Télécharger sur le Play Store">
                        <SiGoogleplay className="w-5 h-5 mr-2" />
                        Play Store
                      </a>
                    </Button>
                  </div>
                  <Button asChild variant="outline" className="w-full h-12">
                      <a href="/mobile-demo" target="_blank" rel="noopener noreferrer" aria-label="Découvrir l'application mobile">
                      <Play className="w-4 h-4 mr-2" />
                      Découvrir l'application
                    </a>
                  </Button>
                </CardContent>
              </Card>

              {/* For Establishments */}
                <Card className="w-full max-w-sm bg-white dark:bg-card border border-border shadow-lg hover:shadow-xl transition-all duration-300" role="article" aria-labelledby="establishment-card-title">
                <CardHeader className="text-center pb-4">
                    <div className="w-16 h-16 bg-gradient-to-br from-emerald-500 to-blue-500 rounded-lg mx-auto mb-4 flex items-center justify-center">
                    <Hospital className="w-8 h-8 text-white" />
                  </div>
                    <h3 id="establishment-card-title" className="text-xl font-semibold text-foreground">Établissements de santé</h3>
                    <p className="text-sm text-muted-foreground">Réduisez vos coûts de 40% avec l'IA</p>
                </CardHeader>
                <CardContent className="pt-0">
                    <Button asChild className="w-full h-14 bg-gradient-to-r from-emerald-600 to-blue-600 hover:from-emerald-700 hover:to-blue-700 text-white text-lg font-medium">
                      <a href="/auth-page" aria-label="Rejoindre la plateforme en tant qu'établissement">
                      <Users className="w-5 h-5 mr-3" />
                      Rejoindre la plateforme
                      <ArrowRight className="w-5 h-5 ml-3" />
                    </a>
                  </Button>
                </CardContent>
              </Card>
            </div>

              {/* Trust Indicators - Plus Visibles */}
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

        {/* Revolutionary Features Section - Slogans Améliorés */}
        <section className="py-24 bg-muted/20" role="region" aria-labelledby="features-heading">
        <div className="container mx-auto px-6">
          <div className="max-w-4xl mx-auto text-center mb-20">
            <Badge className="mb-6 bg-blue-50 dark:bg-blue-900/20 text-blue-800 dark:text-blue-200 border border-blue-200 dark:border-blue-800">
                <Lightning className="w-4 h-4 mr-2" />
              Innovation au service du soin
            </Badge>
              <h2 id="features-heading" className="text-3xl md:text-4xl font-bold text-foreground mb-6">
              Une technologie pensée
              <span className="block bg-gradient-to-r from-blue-600 to-emerald-600 bg-clip-text text-transparent">
                pour les professionnels de santé
              </span>
            </h2>
            <p className="text-lg text-muted-foreground">
              Des outils développés en collaboration avec <span className="font-medium text-foreground">des équipes soignantes</span> pour répondre à vos besoins réels
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
              <Card className="group border border-border bg-white dark:bg-card shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-1">
              <CardContent className="p-6">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-500 rounded-lg flex items-center justify-center mb-4">
                  <Brain className="h-6 w-6 text-white" />
                </div>
                <h3 className="text-lg font-semibold mb-3">Assistant IA Personnel</h3>
                <p className="text-muted-foreground text-sm leading-relaxed mb-4">
                    Augmentez vos revenus de 30% avec un assistant qui négocie vos tarifs et trouve les meilleures missions 24h/24.
                </p>
                  <Button asChild variant="outline" size="sm" className="w-full group-hover:bg-blue-50 dark:group-hover:bg-blue-950/20">
                    <a href="/ai-assistant-demo" aria-label="Tester l'Assistant IA">
                    <Sparkles className="w-4 h-4 mr-2" />
                    Tester l'Assistant IA
                  </a>
                </Button>
              </CardContent>
            </Card>

              <Card className="group border border-border bg-white dark:bg-card shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-1">
              <CardContent className="p-6">
                  <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-blue-500 rounded-lg flex items-center justify-center mb-4">
                    <ChartUp className="h-6 w-6 text-white" />
                </div>
                <h3 className="text-lg font-semibold mb-3">Analytics Prédictives</h3>
                <p className="text-muted-foreground text-sm leading-relaxed mb-4">
                    Anticipez les besoins et réduisez vos coûts de 40% grâce à l'IA qui prédit les pics de demande.
                </p>
                  <Button asChild variant="outline" size="sm" className="w-full group-hover:bg-emerald-50 dark:group-hover:bg-emerald-950/20">
                    <a href="/analytics-demo" aria-label="Découvrir Analytics">
                    <TrendingUp className="w-4 h-4 mr-2" />
                    Découvrir Analytics
                  </a>
                </Button>
              </CardContent>
            </Card>

              <Card className="group border border-border bg-white dark:bg-card shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-1">
              <CardContent className="p-6">
                  <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg flex items-center justify-center mb-4">
                    <Security className="h-6 w-6 text-white" />
                </div>
                <h3 className="text-lg font-semibold mb-3">Sécurité des données</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">
                    Vos données sont protégées selon les standards les plus élevés du secteur médical. Conformité RGPD garantie.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

        {/* Professional Stats Section - Données Plus Crédibles */}
        <section className="py-24 bg-gradient-to-r from-blue-600 to-blue-700 text-white relative overflow-hidden" role="region" aria-labelledby="stats-heading">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-blue-700 opacity-90"></div>

        <div className="relative container mx-auto px-6">
          <div className="max-w-4xl mx-auto text-center mb-16">
              <h2 id="stats-heading" className="text-3xl md:text-4xl font-bold mb-6">
              Une communauté de soignants
              <span className="block">qui grandit chaque jour</span>
            </h2>
            <p className="text-lg text-blue-100">
              Rejoignez des milliers de professionnels qui font confiance à notre plateforme
            </p>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 max-w-5xl mx-auto">
            <div className="text-center">
              <div className="text-4xl md:text-5xl font-bold text-white mb-2">
                2,500+
              </div>
              <div className="text-blue-100 font-medium mb-1">Professionnels de santé</div>
              <div className="text-sm text-blue-200">inscrits sur la plateforme</div>
            </div>

            <div className="text-center">
              <div className="text-4xl md:text-5xl font-bold text-white mb-2">
                150+
              </div>
              <div className="text-blue-100 font-medium mb-1">Établissements</div>
              <div className="text-sm text-blue-200">partenaires de confiance</div>
            </div>

            <div className="text-center">
              <div className="text-4xl md:text-5xl font-bold text-white mb-2">
                95%
              </div>
              <div className="text-blue-100 font-medium mb-1">Taux de satisfaction</div>
              <div className="text-sm text-blue-200">des utilisateurs</div>
            </div>

            <div className="text-center">
              <div className="text-4xl md:text-5xl font-bold text-white mb-2">
                24h
              </div>
              <div className="text-blue-100 font-medium mb-1">Temps de réponse</div>
              <div className="text-sm text-blue-200">moyen pour les missions</div>
            </div>
          </div>
        </div>
      </section>

        {/* Final CTA Section - Plus Impactant */}
        <section className="py-24 bg-gradient-to-r from-emerald-600 to-blue-600 relative overflow-hidden" role="region" aria-labelledby="cta-heading">
        <div className="relative container mx-auto px-6">
          <div className="max-w-4xl mx-auto text-center text-white">
              <h2 id="cta-heading" className="text-3xl md:text-4xl font-bold mb-6">
                Prêt à multiplier vos revenus
                <span className="block">par 3 en 30 jours ?</span>
            </h2>

            <p className="text-lg md:text-xl mb-12 text-emerald-100">
                Rejoignez les 2500+ soignants qui ont déjà révolutionné leur carrière avec l'IA
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-6">
                <Button asChild size="lg" className="bg-white text-emerald-600 hover:bg-emerald-50 h-14 px-8 text-lg font-medium shadow-lg hover:shadow-xl transition-all duration-300">
                  <a href="/auth-page" aria-label="Commencer maintenant">
                  <UserPlus className="w-5 h-5 mr-2" />
                  Commencer maintenant
                </a>
              </Button>
                <Button asChild variant="outline" size="lg" className="border-white text-white hover:bg-white hover:text-emerald-600 h-14 px-8 text-lg font-medium">
                  <a href="/mobile-demo" aria-label="Voir la démo">
                    <Play className="w-5 h-5 mr-2" />
                    Voir la démo
                  </a>
                </Button>
            </div>
          </div>
        </div>
      </section>

        {/* Footer - Plus Complet */}
        <footer className="border-t border-border/40 bg-background" role="contentinfo">
        <div className="container px-4 py-16 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-6xl">
            <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
              <div>
                <div className="flex items-center space-x-2 mb-4">
                  <div className="w-8 h-8 bg-gradient-to-br from-blue-500 via-purple-500 to-emerald-500 rounded-lg flex items-center justify-center">
                    <Heart className="h-4 w-4 text-white" />
                  </div>
                  <span className="font-bold">NurseLink AI</span>
                </div>
                <p className="text-muted-foreground text-sm">
                  Révolutionner le staffing médical grâce à l'intelligence artificielle.
                </p>
              </div>

              <div>
                <h3 className="font-semibold mb-4">Plateforme</h3>
                <ul className="space-y-2 text-sm text-muted-foreground">
                    <li><a href="/mobile-demo" className="hover:text-foreground transition-colors">Pour les infirmiers</a></li>
                    <li><a href="/auth-page" className="hover:text-foreground transition-colors">Pour les établissements</a></li>
                    <li><a href="#" className="hover:text-foreground transition-colors">API & Intégrations</a></li>
                </ul>
              </div>

              <div>
                <h3 className="font-semibold mb-4">Support</h3>
                <ul className="space-y-2 text-sm text-muted-foreground">
                    <li><a href="#" className="hover:text-foreground transition-colors">Centre d'aide</a></li>
                    <li><a href="#" className="hover:text-foreground transition-colors">Contact</a></li>
                    <li><a href="#" className="hover:text-foreground transition-colors">Formation</a></li>
                </ul>
              </div>

              <div>
                <h3 className="font-semibold mb-4">Légal</h3>
                <ul className="space-y-2 text-sm text-muted-foreground">
                    <li><a href="#" className="hover:text-foreground transition-colors">Confidentialité</a></li>
                    <li><a href="#" className="hover:text-foreground transition-colors">CGU</a></li>
                    <li><a href="#" className="hover:text-foreground transition-colors">RGPD</a></li>
                </ul>
              </div>
            </div>

            <div className="mt-12 pt-8 border-t border-border/40">
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
        </div>
      </footer>
    </div>
    </>
  );
}
