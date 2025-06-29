import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  TrendingUp, 
  Users, 
  Calendar, 
  Clock, 
  Star, 
  Plus,
  AlertTriangle,
  CheckCircle,
  Heart,
  Brain,
  BarChart3,
  ArrowUp,
  ArrowDown,
  MapPin,
  Building,
  UserCheck,
  FileText,
  Search,
  Filter,
  Bell,
  Settings,
  BookOpen
} from "lucide-react";
import { Link } from "wouter";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useState } from "react";

export default function EstablishmentDashboardDemo() {
  const [activeTab, setActiveTab] = useState("overview");

  // Données de démonstration
  const stats = {
    activeStaff: 247,
    staffGrowth: 12,
    openMissions: 18,
    urgentMissions: 6,
    avgResponseTime: 2.4,
    responseImprovement: -15,
    satisfaction: 4.8,
    totalReviews: 156
  };

  const missions = [
    {
      id: 1,
      title: "Infirmier DE - Service Réanimation",
      service: "Réanimation",
      dates: "15-22 Jan 2025",
      shift: "Nuit (20h-8h)",
      candidates: 3,
      urgent: true,
      status: "published"
    },
    {
      id: 2,
      title: "Aide-soignant - Service Gériatrie",
      service: "Gériatrie",
      dates: "20-27 Jan 2025",
      shift: "Jour (8h-20h)",
      candidates: 7,
      urgent: false,
      status: "published"
    },
    {
      id: 3,
      title: "Infirmier DE - Urgences",
      service: "Urgences",
      dates: "22-29 Jan 2025",
      shift: "Après-midi (14h-22h)",
      candidates: 2,
      urgent: false,
      status: "draft"
    }
  ];

  const candidates = [
    {
      id: 1,
      name: "Marie Dubois",
      specialty: "Infirmière DE",
      experience: "8 ans d'expérience",
      service: "Réanimation",
      rating: 4.9,
      missions: 156,
      available: true
    },
    {
      id: 2,
      name: "Thomas Martin",
      specialty: "Aide-soignant",
      experience: "5 ans d'expérience",
      service: "Gériatrie",
      rating: 4.7,
      missions: 89,
      available: true
    },
    {
      id: 3,
      name: "Sophie Leroy",
      specialty: "Infirmière DE",
      experience: "12 ans d'expérience",
      service: "Urgences",
      rating: 4.8,
      missions: 203,
      available: false
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-background">
      {/* Navigation */}
      <nav className="bg-white dark:bg-card shadow-sm border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link href="/">
              <div className="flex items-center space-x-3 cursor-pointer">
                <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-emerald-500 rounded-lg flex items-center justify-center">
                  <Heart className="w-4 h-4 text-white" />
                </div>
                <span className="font-semibold text-xl text-foreground">NurseLink AI</span>
              </div>
            </Link>
            
            <div className="flex items-center space-x-4">
              <Button variant="ghost" size="icon">
                <Bell className="w-4 h-4" />
              </Button>
              <Button variant="ghost" size="icon">
                <Settings className="w-4 h-4" />
              </Button>
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                  <Building className="w-4 h-4 text-white" />
                </div>
                <span className="font-medium">CHU Exemple</span>
              </div>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* En-tête du dashboard */}
        <div className="bg-gradient-to-r from-blue-600 to-emerald-600 rounded-2xl p-6 text-white mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold mb-2">Dashboard Établissement</h1>
              <p className="text-blue-100">Gérez vos équipes et optimisez vos plannings</p>
            </div>
            <div className="flex space-x-3">
              <Button 
                asChild 
                className="bg-white text-blue-600 hover:bg-blue-50"
              >
                <Link href="/analytics-demo">
                  <BarChart3 className="w-4 h-4 mr-2" />
                  Analytics
                </Link>
              </Button>
              <Button 
                asChild 
                className="bg-white text-blue-600 hover:bg-blue-50"
              >
                <Link href="/assistant-demo">
                  <Brain className="w-4 h-4 mr-2" />
                  Assistant IA
                </Link>
              </Button>
            </div>
          </div>
        </div>

        {/* Métriques principales */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Personnel actif</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.activeStaff}</div>
              <p className="text-xs text-muted-foreground">
                <span className="text-green-600">+{stats.staffGrowth}%</span> vs mois dernier
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Missions ouvertes</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.openMissions}</div>
              <p className="text-xs text-muted-foreground">
                {stats.urgentMissions} urgentes
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Temps de réponse moyen</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.avgResponseTime}h</div>
              <p className="text-xs text-muted-foreground">
                <span className="text-green-600">{stats.responseImprovement}%</span> amélioration
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Satisfaction</CardTitle>
              <Star className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.satisfaction}/5</div>
              <p className="text-xs text-muted-foreground">
                Basé sur {stats.totalReviews} évaluations
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Onglets principaux */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Vue d'ensemble</TabsTrigger>
            <TabsTrigger value="missions">Missions</TabsTrigger>
            <TabsTrigger value="candidates">Candidatures</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            {/* Prévisions IA */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Brain className="w-5 h-5" />
                  <span>Prévisions IA - Prochaines 2 semaines</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <p className="font-medium">Pic d'absences prévu</p>
                      <p className="text-sm text-muted-foreground">Semaine du 15-22 janvier</p>
                    </div>
                    <Badge variant="destructive">Haute probabilité</Badge>
                  </div>
                  
                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <p className="font-medium">Besoin renforcé en réanimation</p>
                      <p className="text-sm text-muted-foreground">+15% par rapport à la normale</p>
                    </div>
                    <Badge variant="outline">Recommandation</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Actions rapides */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Actions rapides</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Button asChild className="w-full justify-start" variant="outline">
                    <Link href="/mission-creator">
                      <Plus className="w-4 h-4 mr-2" />
                      Créer une mission
                    </Link>
                  </Button>
                  <Button asChild className="w-full justify-start" variant="outline">
                    <Link href="/mission-templates">
                      <BookOpen className="w-4 h-4 mr-2" />
                      Gérer les templates
                    </Link>
                  </Button>
                  <Button className="w-full justify-start" variant="outline">
                    <Search className="w-4 h-4 mr-2" />
                    Rechercher un profil
                  </Button>
                  <Button className="w-full justify-start" variant="outline">
                    <FileText className="w-4 h-4 mr-2" />
                    Générer un rapport
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Alertes prioritaires</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center space-x-3 p-3 bg-red-50 dark:bg-red-900/20 rounded-lg">
                      <AlertTriangle className="w-4 h-4 text-red-500" />
                      <div className="text-sm">
                        <p className="font-medium">Mission urgente non pourvue</p>
                        <p className="text-muted-foreground">Réanimation - Nuit</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-3 p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
                      <Clock className="w-4 h-4 text-yellow-500" />
                      <div className="text-sm">
                        <p className="font-medium">Planification à valider</p>
                        <p className="text-muted-foreground">3 missions en attente</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Performance ce mois</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span>Taux de couverture</span>
                        <span>94%</span>
                      </div>
                      <Progress value={94} className="h-2" />
                    </div>
                    
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span>Satisfaction équipes</span>
                        <span>4.8/5</span>
                      </div>
                      <Progress value={96} className="h-2" />
                    </div>
                    
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span>Respect des budgets</span>
                        <span>87%</span>
                      </div>
                      <Progress value={87} className="h-2" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="missions" className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold">Gestion des missions</h2>
              <Button asChild>
                <Link href="/mission-creator">
                  <Plus className="w-4 h-4 mr-2" />
                  Nouvelle mission
                </Link>
              </Button>
            </div>

            {/* Filtres */}
            <div className="flex space-x-4">
              <Select defaultValue="all">
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Statut" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tous les statuts</SelectItem>
                  <SelectItem value="draft">Brouillon</SelectItem>
                  <SelectItem value="published">Publiée</SelectItem>
                  <SelectItem value="in_progress">En cours</SelectItem>
                </SelectContent>
              </Select>

              <Select defaultValue="all">
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Service" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tous les services</SelectItem>
                  <SelectItem value="icu">Réanimation</SelectItem>
                  <SelectItem value="surgery">Chirurgie</SelectItem>
                  <SelectItem value="emergency">Urgences</SelectItem>
                </SelectContent>
              </Select>

              <Input 
                placeholder="Rechercher..." 
                className="w-64"
              />
            </div>

            {/* Liste des missions */}
            <div className="space-y-4">
              {missions.map((mission) => (
                <Card key={mission.id}>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <h3 className="font-semibold">{mission.title}</h3>
                          {mission.urgent && (
                            <Badge variant="destructive">Urgent</Badge>
                          )}
                          <Badge variant={mission.status === "published" ? "default" : "secondary"}>
                            {mission.status === "published" ? "Publiée" : "Brouillon"}
                          </Badge>
                        </div>
                        
                        <div className="flex items-center space-x-6 text-sm text-muted-foreground">
                          <div className="flex items-center space-x-1">
                            <MapPin className="w-4 h-4" />
                            <span>{mission.service}</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <Calendar className="w-4 h-4" />
                            <span>{mission.dates}</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <Clock className="w-4 h-4" />
                            <span>{mission.shift}</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <Users className="w-4 h-4" />
                            <span>{mission.candidates} candidature{mission.candidates > 1 ? 's' : ''}</span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex space-x-2">
                        <Button variant="outline" size="sm">
                          Voir les candidats
                        </Button>
                        <Button size="sm">
                          Modifier
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="candidates" className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold">Candidatures reçues</h2>
              <div className="flex space-x-2">
                <Button variant="outline">
                  <Filter className="w-4 h-4 mr-2" />
                  Filtrer
                </Button>
              </div>
            </div>

            {/* Liste des candidatures */}
            <div className="space-y-4">
              {candidates.map((candidate) => (
                <Card key={candidate.id}>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center">
                          <UserCheck className="w-6 h-6 text-white" />
                        </div>
                        
                        <div>
                          <h3 className="font-semibold">{candidate.name}</h3>
                          <p className="text-sm text-muted-foreground">
                            {candidate.specialty} • {candidate.experience} • {candidate.service}
                          </p>
                          <div className="flex items-center space-x-4 mt-1">
                            <div className="flex items-center space-x-1">
                              <Star className="w-4 h-4 text-yellow-400" />
                              <span className="text-sm">{candidate.rating}/5</span>
                            </div>
                            <span className="text-sm text-muted-foreground">{candidate.missions} missions</span>
                            <Badge variant={candidate.available ? "outline" : "secondary"}>
                              {candidate.available ? "Disponible immédiatement" : "Non disponible"}
                            </Badge>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex space-x-2">
                        <Button variant="outline" size="sm">
                          Voir le profil
                        </Button>
                        <Button 
                          size="sm"
                          disabled={!candidate.available}
                        >
                          Accepter
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="analytics" className="space-y-6">
            <div className="text-center py-12">
              <BarChart3 className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-xl font-semibold mb-2">Analytics avancées</h3>
              <p className="text-muted-foreground mb-6">
                Découvrez nos outils d'analyse prédictive pour optimiser votre gestion RH
              </p>
              <Button asChild size="lg">
                <Link href="/analytics-demo">
                  <TrendingUp className="w-4 h-4 mr-2" />
                  Accéder aux Analytics
                </Link>
              </Button>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}