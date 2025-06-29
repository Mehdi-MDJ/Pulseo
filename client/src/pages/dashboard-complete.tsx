import { useAuth } from "../hooks/useAuth-simple";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
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
  BookOpen,
  Edit,
  Trash2,
  Eye
} from "lucide-react";
import { Link } from "wouter";
import { useState } from "react";

export default function Dashboard() {
  const { user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState("overview");
  const [searchTerm, setSearchTerm] = useState("");

  // Données complètes pour le dashboard
  const stats = {
    activeStaff: 247,
    staffGrowth: 12,
    openMissions: 18,
    urgentMissions: 6,
    avgResponseTime: 2.4,
    responseImprovement: -15,
    satisfaction: 4.8,
    totalReviews: 156,
    completedMissions: 89,
    totalEarnings: 156780
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
      status: "published",
      salary: "28€/h"
    },
    {
      id: 2,
      title: "Aide-soignant - Service Gériatrie",
      service: "Gériatrie", 
      dates: "20-27 Jan 2025",
      shift: "Jour (8h-20h)",
      candidates: 7,
      urgent: false,
      status: "published",
      salary: "22€/h"
    },
    {
      id: 3,
      title: "Infirmier DE - Urgences",
      service: "Urgences",
      dates: "22-29 Jan 2025", 
      shift: "Après-midi (14h-22h)",
      candidates: 2,
      urgent: false,
      status: "draft",
      salary: "26€/h"
    }
  ];

  const teamMembers = [
    {
      id: 1,
      name: "Marie Dubois",
      role: "Infirmière DE",
      service: "Réanimation",
      experience: "8 ans",
      rating: 4.9,
      missions: 156,
      status: "active",
      lastMission: "12 Jan 2025"
    },
    {
      id: 2,
      name: "Thomas Martin", 
      role: "Aide-soignant",
      service: "Gériatrie",
      experience: "5 ans",
      rating: 4.7,
      missions: 98,
      status: "active",
      lastMission: "10 Jan 2025"
    },
    {
      id: 3,
      name: "Sophie Laurent",
      role: "Infirmière DE",
      service: "Urgences",
      experience: "6 ans",
      rating: 4.8,
      missions: 127,
      status: "inactive",
      lastMission: "28 Déc 2024"
    }
  ];

  const templates = [
    {
      id: 1,
      name: "Infirmier DE - Réanimation",
      service: "Réanimation",
      duration: "7 jours",
      salary: "28€/h",
      skills: ["Surveillance patient", "Soins intensifs", "Urgences"],
      usedCount: 12
    },
    {
      id: 2,
      name: "Aide-soignant - Gériatrie",
      service: "Gériatrie",
      duration: "7 jours", 
      salary: "22€/h",
      skills: ["Soins de confort", "Aide à la mobilité", "Communication"],
      usedCount: 8
    },
    {
      id: 3,
      name: "Infirmier DE - Urgences",
      service: "Urgences",
      duration: "5 jours",
      salary: "26€/h", 
      skills: ["Triage", "Soins d'urgence", "Gestes techniques"],
      usedCount: 15
    }
  ];

  const handleCreateMission = () => {
    window.location.href = "/mission-creator";
  };

  const renderOverview = () => (
    <div className="space-y-6">
      {/* Stats principales */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Personnel Actif</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.activeStaff}</div>
            <p className="text-xs text-muted-foreground">
              <ArrowUp className="inline w-3 h-3 text-green-500" />
              +{stats.staffGrowth}% ce mois
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Missions Ouvertes</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.openMissions}</div>
            <p className="text-xs text-muted-foreground">
              <AlertTriangle className="inline w-3 h-3 text-orange-500" />
              {stats.urgentMissions} urgentes
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Temps de Réponse</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.avgResponseTime}h</div>
            <p className="text-xs text-muted-foreground">
              <ArrowDown className="inline w-3 h-3 text-green-500" />
              {Math.abs(stats.responseImprovement)}% d'amélioration
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
              {stats.totalReviews} avis
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Actions rapides */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Button onClick={handleCreateMission} className="h-24 flex flex-col items-center justify-center space-y-2">
          <Plus className="h-6 w-6" />
          <span>Créer une Mission</span>
        </Button>
        
        <Link href="/mission-templates">
          <Button variant="outline" className="h-24 w-full flex flex-col items-center justify-center space-y-2">
            <FileText className="h-6 w-6" />
            <span>Templates de Missions</span>
          </Button>
        </Link>

        <Link href="/analytics">
          <Button variant="outline" className="h-24 w-full flex flex-col items-center justify-center space-y-2">
            <BarChart3 className="h-6 w-6" />
            <span>Analytiques</span>
          </Button>
        </Link>
      </div>

      {/* Missions récentes */}
      <Card>
        <CardHeader>
          <CardTitle>Missions Récentes</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {missions.slice(0, 3).map((mission) => (
              <div key={mission.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex-1">
                  <h3 className="font-medium">{mission.title}</h3>
                  <p className="text-sm text-muted-foreground">{mission.dates} • {mission.shift}</p>
                </div>
                <div className="flex items-center space-x-2">
                  {mission.urgent && (
                    <Badge variant="destructive">Urgent</Badge>
                  )}
                  <Badge variant={mission.status === 'published' ? 'default' : 'secondary'}>
                    {mission.status === 'published' ? 'Publiée' : 'Brouillon'}
                  </Badge>
                  <span className="text-sm text-muted-foreground">{mission.candidates} candidats</span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderMissions = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Gestion des Missions</h2>
        <Button onClick={handleCreateMission}>
          <Plus className="h-4 w-4 mr-2" />
          Nouvelle Mission
        </Button>
      </div>

      <div className="flex space-x-4">
        <div className="flex-1">
          <Input
            placeholder="Rechercher une mission..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full"
          />
        </div>
        <Select>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Filtrer par service" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tous les services</SelectItem>
            <SelectItem value="reanimation">Réanimation</SelectItem>
            <SelectItem value="geriatrie">Gériatrie</SelectItem>
            <SelectItem value="urgences">Urgences</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="grid gap-4">
        {missions.map((mission) => (
          <Card key={mission.id}>
            <CardContent className="p-6">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <h3 className="text-lg font-semibold">{mission.title}</h3>
                  <div className="mt-2 space-y-1">
                    <p className="text-sm text-muted-foreground">
                      <Building className="inline w-4 h-4 mr-1" />
                      {mission.service}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      <Calendar className="inline w-4 h-4 mr-1" />
                      {mission.dates}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      <Clock className="inline w-4 h-4 mr-1" />
                      {mission.shift}
                    </p>
                    <p className="text-sm font-medium text-green-600">
                      {mission.salary}
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  {mission.urgent && (
                    <Badge variant="destructive">Urgent</Badge>
                  )}
                  <Badge variant={mission.status === 'published' ? 'default' : 'secondary'}>
                    {mission.status === 'published' ? 'Publiée' : 'Brouillon'}
                  </Badge>
                  <span className="text-sm text-muted-foreground">{mission.candidates} candidats</span>
                  <div className="flex space-x-1">
                    <Button variant="outline" size="sm">
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button variant="outline" size="sm">
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button variant="outline" size="sm">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );

  const renderTeam = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Gestion d'Équipe</h2>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Ajouter un Membre
        </Button>
      </div>

      <div className="flex space-x-4">
        <div className="flex-1">
          <Input
            placeholder="Rechercher un membre..."
            className="w-full"
          />
        </div>
        <Select>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Filtrer par statut" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tous</SelectItem>
            <SelectItem value="active">Actifs</SelectItem>
            <SelectItem value="inactive">Inactifs</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="grid gap-4">
        {teamMembers.map((member) => (
          <Card key={member.id}>
            <CardContent className="p-6">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <h3 className="text-lg font-semibold">{member.name}</h3>
                  <div className="mt-2 space-y-1">
                    <p className="text-sm text-muted-foreground">
                      <UserCheck className="inline w-4 h-4 mr-1" />
                      {member.role} • {member.experience}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      <Building className="inline w-4 h-4 mr-1" />
                      {member.service}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      <Calendar className="inline w-4 h-4 mr-1" />
                      Dernière mission: {member.lastMission}
                    </p>
                    <div className="flex items-center space-x-2">
                      <Star className="w-4 h-4 text-yellow-500" />
                      <span className="text-sm">{member.rating}/5</span>
                      <span className="text-sm text-muted-foreground">({member.missions} missions)</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Badge variant={member.status === 'active' ? 'default' : 'secondary'}>
                    {member.status === 'active' ? 'Actif' : 'Inactif'}
                  </Badge>
                  <div className="flex space-x-1">
                    <Button variant="outline" size="sm">
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button variant="outline" size="sm">
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button variant="outline" size="sm">
                      <Settings className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );

  const renderTemplates = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Templates de Missions</h2>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Nouveau Template
        </Button>
      </div>

      <div className="grid gap-4">
        {templates.map((template) => (
          <Card key={template.id}>
            <CardContent className="p-6">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <h3 className="text-lg font-semibold">{template.name}</h3>
                  <div className="mt-2 space-y-1">
                    <p className="text-sm text-muted-foreground">
                      <Building className="inline w-4 h-4 mr-1" />
                      {template.service} • {template.duration}
                    </p>
                    <p className="text-sm font-medium text-green-600">
                      {template.salary}
                    </p>
                    <div className="flex flex-wrap gap-1 mt-2">
                      {template.skills.map((skill, index) => (
                        <Badge key={index} variant="outline" className="text-xs">
                          {skill}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-muted-foreground">
                    Utilisé {template.usedCount} fois
                  </span>
                  <div className="flex space-x-1">
                    <Button variant="outline" size="sm" onClick={handleCreateMission}>
                      Utiliser
                    </Button>
                    <Button variant="outline" size="sm">
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button variant="outline" size="sm">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );

  if (!user) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6 text-center">
            <h1 className="text-2xl font-bold mb-2">Accès Restreint</h1>
            <p className="text-muted-foreground mb-4">
              Vous devez être connecté pour accéder au dashboard.
            </p>
            <Link href="/auth">
              <Button>Se connecter</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold">Dashboard - {user.firstName} {user.lastName}</h1>
              <p className="text-muted-foreground">
                {user.role === 'establishment' ? 'Gestion Établissement' : 'Tableau de bord'}
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <Button variant="outline" size="sm">
                <Bell className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="sm">
                <Settings className="h-4 w-4" />
              </Button>
              <Button variant="outline" onClick={logout}>
                Déconnexion
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Vue d'ensemble</TabsTrigger>
            <TabsTrigger value="missions">Missions</TabsTrigger>
            <TabsTrigger value="team">Équipe</TabsTrigger>
            <TabsTrigger value="templates">Templates</TabsTrigger>
          </TabsList>

          <TabsContent value="overview">
            {renderOverview()}
          </TabsContent>

          <TabsContent value="missions">
            {renderMissions()}
          </TabsContent>

          <TabsContent value="team">
            {renderTeam()}
          </TabsContent>

          <TabsContent value="templates">
            {renderTemplates()}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}