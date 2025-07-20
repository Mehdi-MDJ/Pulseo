import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowRight, Users, Calendar, Shield, Zap } from 'lucide-react';

export default function LandingSimple() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <header className="container mx-auto px-4 py-6">
        <nav className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">NL</span>
            </div>
            <span className="text-xl font-bold text-gray-900">NurseLink AI</span>
          </div>
          <div className="flex items-center space-x-4">
            <Button variant="ghost" asChild>
              <a href="/auth">Connexion</a>
            </Button>
            <Button asChild>
              <a href="/establishment-signup">Inscription</a>
            </Button>
          </div>
        </nav>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-16">
        <div className="text-center max-w-4xl mx-auto">
          <Badge variant="secondary" className="mb-4">
            <Zap className="w-4 h-4 mr-2" />
            IA Avancée
          </Badge>
          <h1 className="text-5xl font-bold text-gray-900 mb-6">
            La plateforme intelligente pour
            <span className="text-blue-600"> les soins infirmiers</span>
          </h1>
          <p className="text-xl text-gray-600 mb-8">
            Connectez les établissements de santé avec des infirmiers qualifiés grâce à l'intelligence artificielle.
            Optimisez vos missions, gérez vos contrats et améliorez la qualité des soins.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" asChild>
              <a href="/establishment-signup">
                Commencer maintenant
                <ArrowRight className="w-4 h-4 ml-2" />
              </a>
            </Button>
            <Button size="lg" variant="outline" asChild>
              <a href="/auth">Voir la démo</a>
            </Button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="container mx-auto px-4 py-16">
        <div className="grid md:grid-cols-3 gap-8">
          <Card>
            <CardHeader>
              <Users className="w-12 h-12 text-blue-600 mb-4" />
              <CardTitle>Matching Intelligent</CardTitle>
              <CardDescription>
                Notre IA analyse les compétences, l'expérience et les préférences pour créer des correspondances parfaites.
              </CardDescription>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader>
              <Calendar className="w-12 h-12 text-green-600 mb-4" />
              <CardTitle>Gestion Simplifiée</CardTitle>
              <CardDescription>
                Planifiez les missions, gérez les plannings et suivez les performances en temps réel.
              </CardDescription>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader>
              <Shield className="w-12 h-12 text-purple-600 mb-4" />
              <CardTitle>Contrats Sécurisés</CardTitle>
              <CardDescription>
                Génération automatique de contrats conformes avec signature électronique intégrée.
              </CardDescription>
            </CardHeader>
          </Card>
        </div>
      </section>

      {/* Stats Section */}
      <section className="container mx-auto px-4 py-16">
        <div className="bg-white rounded-2xl p-8 shadow-lg">
          <div className="grid md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-3xl font-bold text-blue-600 mb-2">500+</div>
              <div className="text-gray-600">Établissements</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-green-600 mb-2">2000+</div>
              <div className="text-gray-600">Infirmiers</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-purple-600 mb-2">5000+</div>
              <div className="text-gray-600">Missions</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-orange-600 mb-2">98%</div>
              <div className="text-gray-600">Satisfaction</div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="container mx-auto px-4 py-8 border-t">
        <div className="text-center text-gray-600">
          <p>&copy; 2024 NurseLink AI. Tous droits réservés.</p>
        </div>
      </footer>
    </div>
  );
}
