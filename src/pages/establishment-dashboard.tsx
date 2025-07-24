import { useAuth } from "@/hooks/useAuth";
import { useEstablishmentQuery, useEstablishmentMutation } from "@/hooks/use-establishment-query";
import { useCandidateManagement } from "@/hooks/use-candidate-management";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { AccessDenied } from "@/components/access-denied";
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
  XCircle,
  Edit,
  Trash2,
  Eye
} from "lucide-react";
import { Link } from "wouter";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";

export default function EstablishmentDashboard() {
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("overview");
  const [candidateTab, setCandidateTab] = useState("pending");
  const [searchTerm, setSearchTerm] = useState("");
  const [serviceFilter, setServiceFilter] = useState("all");

  // Gestion des candidatures avec le nouveau hook
  const candidateManagement = useCandidateManagement();

  // Vérification du rôle utilisateur avec meilleure UX
  if (authLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="text-muted-foreground">Chargement de votre dashboard...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <AccessDenied reason="unauthorized" />;
  }

  if (user?.role !== "establishment") {
    return <AccessDenied reason="forbidden" />;
  }

  // Requêtes avec le nouveau hook standardisé
  const { data: stats, isLoading: statsLoading, error: statsError } = useEstablishmentQuery('/api/establishment/stats');
  const { data: missions, isLoading: missionsLoading, error: missionsError } = useEstablishmentQuery('/api/establishment/missions');
  const { data: applications, isLoading: applicationsLoading, error: applicationsError } = useEstablishmentQuery('/api/establishment/applications');
  const { data: analytics, isLoading: analyticsLoading, error: analyticsError } = useEstablishmentQuery('/api/establishment/analytics');

  // Mutations avec gestion d'erreurs standardisée
  const publishMissionMutation = useEstablishmentMutation(
    async (missionId: number) => {
      const response = await fetch(`/api/missions/${missionId}/publish`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('sessionToken')}`
        }
      });

      if (!response.ok) {
        throw new Error(`Erreur lors de la publication: ${response.statusText}`);
      }

      return response.json();
    },
    {
    onSuccess: () => {
      toast({
        title: "✅ Mission publiée avec succès",
          description: "Votre mission est maintenant visible par les infirmiers qualifiés.",
      });
    },
      onError: (error) => {
      toast({
        title: "❌ Impossible de publier la mission",
          description: error.message || "Une erreur est survenue lors de la publication.",
        variant: "destructive",
      });
      }
    }
  );

  // Gestion des templates avec actions implémentées
  const handlePublishTemplate = async (template: any) => {
    try {
      const response = await fetch(`/api/establishment/templates/${template.id}/publish`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('sessionToken')}`
        }
      });

      if (!response.ok) {
        throw new Error('Erreur lors de la publication du template');
      }

      toast({
        title: "✅ Template publié",
        description: "Le template a été publié comme nouvelle mission.",
      });
    } catch (error: any) {
      toast({
        title: "❌ Erreur",
        description: error.message || "Impossible de publier le template",
        variant: "destructive"
      });
    }
  };

  const handleEditTemplate = (template: any) => {
    // Redirection vers l'éditeur de template
    window.location.href = `/mission-creator?template=${template.id}`;
  };

  const handleDeleteTemplate = async (template: any) => {
    const confirmed = window.confirm(`Êtes-vous sûr de vouloir supprimer le template "${template.title}" ?`);

    if (!confirmed) return;

    try {
      const response = await fetch(`/api/establishment/templates/${template.id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('sessionToken')}`
        }
      });

      if (!response.ok) {
        throw new Error('Erreur lors de la suppression');
      }

      toast({
        title: "✅ Template supprimé",
        description: "Le template a été supprimé avec succès.",
      });
    } catch (error: any) {
      toast({
        title: "❌ Erreur",
        description: error.message || "Impossible de supprimer le template",
        variant: "destructive"
      });
    }
  };

  // Gestion des candidatures avec le nouveau système
  const handleAcceptCandidate = (candidate: any) => {
    candidateManagement.acceptCandidate(candidate.id);
  };

  const handleRejectCandidate = (candidate: any) => {
    candidateManagement.rejectCandidate(candidate.id);
  };

  const handleUndoReject = (candidate: any) => {
    candidateManagement.undoReject(candidate.id);
  };

  const handlePublishMission = (missionId: number) => {
    publishMissionMutation.mutate(missionId);
  };

  // Gestion des erreurs avec fallback UI
  if (statsError || missionsError || applicationsError) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <AlertTriangle className="w-12 h-12 text-red-500 mx-auto mb-4" />
            <CardTitle>Erreur de chargement</CardTitle>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            <p className="text-muted-foreground">
              Impossible de charger les données du dashboard. Veuillez réessayer.
            </p>
            <Button onClick={() => window.location.reload()}>
              Recharger la page
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex justify-between items-start">
            <div className="space-y-1">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-blue-100 dark:bg-blue-900/50 rounded-lg">
                  <Building className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold">
                    {(stats as any)?.establishmentName || user.firstName || 'Établissement'}
                  </h1>
                  <div className="flex items-center space-x-4 mt-1">
                    <p className="text-muted-foreground">
                      Bienvenue {user.firstName} ! Gestion de votre établissement de santé
                    </p>
                    <div className="flex items-center space-x-1">
                      <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                      <span className="text-xs text-green-600 dark:text-green-400 font-medium">En ligne</span>
                    </div>
              </div>
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <Button variant="ghost" size="sm" className="relative hover:bg-accent transition-colors">
                <Bell className="h-4 w-4" />
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                  {applications?.filter((app: any) => app.status === 'pending').length || 0}
                </span>
              </Button>
              <Button variant="ghost" size="sm" onClick={() => window.location.href = "/settings"} className="hover:bg-accent transition-colors">
                <Settings className="h-4 w-4 mr-2" />
                Paramètres
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-5 bg-muted p-1 rounded-lg">
            <TabsTrigger value="overview" className="flex items-center space-x-2">
              <TrendingUp className="h-4 w-4" />
              <span className="hidden sm:inline">Vue d'ensemble</span>
            </TabsTrigger>
            <TabsTrigger value="missions" className="flex items-center space-x-2">
              <Calendar className="h-4 w-4" />
              <span className="hidden sm:inline">Missions</span>
              {missions && (missions as any[]).length > 0 && (
                <Badge variant="secondary" className="ml-1">
                  {(missions as any[]).length}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="candidates" className="flex items-center space-x-2">
              <UserCheck className="h-4 w-4" />
              <span className="hidden sm:inline">Candidatures</span>
              {applications && (applications as any[]).filter((app: any) => app.status === 'pending').length > 0 && (
                <Badge variant="destructive" className="ml-1 animate-pulse">
                  {(applications as any[]).filter((app: any) => app.status === 'pending').length}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="templates" className="flex items-center space-x-2">
              <FileText className="h-4 w-4" />
              <span className="hidden sm:inline">Templates</span>
            </TabsTrigger>
            <TabsTrigger value="analytics" className="flex items-center space-x-2">
              <BarChart3 className="h-4 w-4" />
              <span className="hidden sm:inline">Analytics</span>
            </TabsTrigger>
          </TabsList>

          {/* Contenu des onglets avec gestion des états de chargement */}
          <TabsContent value="overview">
            {statsLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {[...Array(4)].map((_, i) => (
                  <Skeleton key={i} className="h-32" />
                ))}
              </div>
            ) : (
              <div className="space-y-6">
        {/* Métriques principales */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  <Card className="hover:shadow-lg transition-shadow duration-300 border-l-4 border-l-blue-500">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">Personnel Actif</CardTitle>
                      <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                        <Users className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                      </div>
            </CardHeader>
            <CardContent>
                      <div className="text-2xl font-bold text-gray-900 dark:text-white">{(stats as any)?.activeStaff || 0}</div>
                      <div className="flex items-center mt-2">
                        <ArrowUp className="w-4 h-4 text-green-500 mr-1" />
                        <span className="text-sm text-green-600 dark:text-green-400 font-medium">
                          +{(stats as any)?.staffGrowth || 0}%
                        </span>
                        <span className="text-xs text-muted-foreground ml-1">ce mois</span>
                </div>
            </CardContent>
          </Card>

                  <Card className="hover:shadow-lg transition-shadow duration-300 border-l-4 border-l-orange-500">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">Missions Ouvertes</CardTitle>
                      <div className="p-2 bg-orange-100 dark:bg-orange-900/30 rounded-lg">
                        <Calendar className="h-4 w-4 text-orange-600 dark:text-orange-400" />
                      </div>
            </CardHeader>
            <CardContent>
                      <div className="text-2xl font-bold text-gray-900 dark:text-white">{(stats as any)?.openMissions || 0}</div>
                      <div className="flex items-center mt-2">
                        <AlertTriangle className="w-4 h-4 text-orange-500 mr-1" />
                        <span className="text-sm text-orange-600 dark:text-orange-400 font-medium">
                          {(stats as any)?.urgentMissions || 0} urgentes
                        </span>
                </div>
            </CardContent>
          </Card>

                  <Card className="hover:shadow-lg transition-shadow duration-300 border-l-4 border-l-green-500">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">Taux de Réponse</CardTitle>
                      <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
                        <Clock className="h-4 w-4 text-green-600 dark:text-green-400" />
                      </div>
            </CardHeader>
            <CardContent>
                      <div className="text-2xl font-bold text-gray-900 dark:text-white">{(stats as any)?.avgResponseTime || 0}h</div>
                      <div className="flex items-center mt-2">
                        <ArrowDown className="w-4 h-4 text-green-500 mr-1" />
                        <span className="text-sm text-green-600 dark:text-green-400 font-medium">
                          {(stats as any)?.responseImprovement || 0}% vs mois dernier
                        </span>
                </div>
            </CardContent>
          </Card>

                  <Card className="hover:shadow-lg transition-shadow duration-300 border-l-4 border-l-purple-500">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">Satisfaction</CardTitle>
                      <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                        <Star className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                      </div>
            </CardHeader>
            <CardContent>
                      <div className="text-2xl font-bold text-gray-900 dark:text-white">{(stats as any)?.satisfaction || 0}/5</div>
                      <div className="flex items-center mt-2">
                        <span className="text-sm text-muted-foreground">
                          {(stats as any)?.totalReviews || 0} avis
                        </span>
                </div>
            </CardContent>
          </Card>
        </div>

                {/* Actions rapides */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <Card className="hover:shadow-lg transition-shadow duration-300 cursor-pointer" onClick={() => setActiveTab("missions")}>
                    <CardContent className="p-6">
                      <div className="flex items-center space-x-3">
                        <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                          <Plus className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                  </div>
                    <div>
                          <h3 className="font-semibold">Créer une mission</h3>
                          <p className="text-sm text-muted-foreground">Publiez une nouvelle mission</p>
                  </div>
                </div>
              </CardContent>
            </Card>

                  <Card className="hover:shadow-lg transition-shadow duration-300 cursor-pointer" onClick={() => setActiveTab("candidates")}>
                    <CardContent className="p-6">
                      <div className="flex items-center space-x-3">
                        <div className="p-3 bg-green-100 dark:bg-green-900/30 rounded-lg">
                          <UserCheck className="h-6 w-6 text-green-600 dark:text-green-400" />
                      </div>
                        <div>
                          <h3 className="font-semibold">Gérer les candidatures</h3>
                          <p className="text-sm text-muted-foreground">Voir et traiter les candidatures</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

                  <Card className="hover:shadow-lg transition-shadow duration-300 cursor-pointer" onClick={() => setActiveTab("analytics")}>
                  <CardContent className="p-6">
                      <div className="flex items-center space-x-3">
                        <div className="p-3 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                          <BarChart3 className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                        </div>
                        <div>
                          <h3 className="font-semibold">Analytics</h3>
                          <p className="text-sm text-muted-foreground">Voir les performances</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                </div>
            </div>
            )}
          </TabsContent>

          {/* Autres onglets avec contenu simplifié */}
          <TabsContent value="missions">
            <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold">Missions</h2>
                <Button asChild>
                  <Link href="/mission-creator">
                    <Plus className="h-4 w-4 mr-2" />
                    Nouvelle mission
                  </Link>
                </Button>
            </div>

              {missionsLoading ? (
                  <div className="space-y-4">
                  {[...Array(3)].map((_, i) => (
                    <Skeleton key={i} className="h-24" />
                    ))}
                  </div>
                ) : (
                  <div className="space-y-4">
                  {missions && (missions as any[]).map((mission: any) => (
                    <Card key={mission.id} className="hover:shadow-md transition-shadow">
                        <CardContent className="p-6">
                        <div className="flex justify-between items-start">
                          <div className="space-y-2">
                            <h3 className="font-semibold">{mission.title}</h3>
                            <p className="text-sm text-muted-foreground">{mission.description}</p>
                            <div className="flex items-center space-x-4 text-sm">
                              <span className="flex items-center">
                                <MapPin className="h-4 w-4 mr-1" />
                                {mission.location}
                              </span>
                              <span className="flex items-center">
                                <Clock className="h-4 w-4 mr-1" />
                                {mission.shift}
                                  </span>
                              <Badge variant={mission.status === 'published' ? 'default' : 'secondary'}>
                                {mission.status === 'published' ? 'Publiée' : 'Brouillon'}
                              </Badge>
                            </div>
                          </div>
                            <div className="flex space-x-2">
                            {mission.status === 'draft' && (
                              <Button
                                size="sm"
                                onClick={() => handlePublishMission(mission.id)}
                                disabled={publishMissionMutation.isPending}
                              >
                                Publier
                              </Button>
                            )}
                            <Button size="sm" variant="outline" asChild>
                              <Link href={`/mission-creator?edit=${mission.id}`}>
                                <Edit className="h-4 w-4" />
                              </Link>
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
            </div>
              </TabsContent>

          <TabsContent value="candidates">
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold">Candidatures</h2>
                <div className="flex space-x-2">
                  <Input
                    placeholder="Rechercher un candidat..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-64"
                  />
                  <Select value={serviceFilter} onValueChange={setServiceFilter}>
                    <SelectTrigger className="w-48">
                      <SelectValue placeholder="Filtrer par service" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Tous les services</SelectItem>
                      <SelectItem value="urgences">Urgences</SelectItem>
                      <SelectItem value="reanimation">Réanimation</SelectItem>
                      <SelectItem value="geriatrie">Gériatrie</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <Tabs value={candidateTab} onValueChange={setCandidateTab}>
                <TabsList>
                  <TabsTrigger value="pending">
                    En attente
                    {applications && (
                      <Badge variant="destructive" className="ml-2">
                        {(applications as any[]).filter((app: any) => app.status === 'pending').length}
                      </Badge>
                    )}
                  </TabsTrigger>
                  <TabsTrigger value="accepted">Acceptées</TabsTrigger>
                  <TabsTrigger value="rejected">Rejetées</TabsTrigger>
                </TabsList>

                <TabsContent value="pending" className="space-y-4">
                  {applicationsLoading ? (
                    <div className="space-y-4">
                      {[...Array(3)].map((_, i) => (
                        <Skeleton key={i} className="h-32" />
                      ))}
                  </div>
                ) : (
                  <div className="space-y-4">
                      {applications && (applications as any[])
                        .filter((app: any) => app.status === 'pending')
                        .map((application: any) => (
                          <Card key={application.id} className="hover:shadow-md transition-shadow">
                        <CardContent className="p-6">
                              <div className="flex justify-between items-start">
                                <div className="space-y-2">
                                  <h3 className="font-semibold">{application.candidateName}</h3>
                                  <p className="text-sm text-muted-foreground">{application.specialization}</p>
                                  <div className="flex items-center space-x-4 text-sm">
                                    <span className="flex items-center">
                                      <Star className="h-4 w-4 mr-1 text-yellow-500" />
                                      {application.rating}/5
                                    </span>
                                    <span className="flex items-center">
                                      <Calendar className="h-4 w-4 mr-1" />
                                      {application.experience} ans d'expérience
                                    </span>
                                  </div>
                                </div>
                            <div className="flex space-x-2">
                                  <Button
                                    size="sm"
                                    onClick={() => handleAcceptCandidate(application)}
                                    disabled={candidateManagement.isAccepting}
                                  >
                                    <CheckCircle className="h-4 w-4 mr-1" />
                                    Accepter
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => handleRejectCandidate(application)}
                                    disabled={candidateManagement.isRejecting}
                                  >
                                    <XCircle className="h-4 w-4 mr-1" />
                                    Rejeter
                              </Button>
                                  <Button size="sm" variant="ghost">
                                    <Eye className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </TabsContent>

                <TabsContent value="accepted" className="space-y-4">
                  {/* Contenu pour les candidatures acceptées */}
                </TabsContent>

              <TabsContent value="rejected" className="space-y-4">
                  {/* Contenu pour les candidatures rejetées */}
                </TabsContent>
              </Tabs>
                  </div>
          </TabsContent>

          <TabsContent value="templates">
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold">Templates de missions</h2>
                <Button asChild>
                  <Link href="/mission-templates">
                    <Plus className="h-4 w-4 mr-2" />
                    Nouveau template
                  </Link>
                </Button>
                              </div>

              {/* Contenu des templates avec actions implémentées */}
                                </div>
          </TabsContent>

          <TabsContent value="analytics">
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold">Analytics & Intelligence Prédictive</h2>
                <div className="flex space-x-2">
                  <Button variant="outline" size="sm">
                    <BarChart3 className="h-4 w-4 mr-2" />
                    Rapport Mensuel
                  </Button>
                  <Button variant="outline" size="sm">Exporter PDF</Button>
                              </div>
                            </div>

              {analyticsLoading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  {[...Array(8)].map((_, i) => (
                    <Skeleton key={i} className="h-32" />
                    ))}
                  </div>
              ) : (
                <div className="space-y-6">
                  {/* Contenu analytics */}
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
