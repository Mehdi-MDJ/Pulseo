import { useAuth } from "@/hooks/useAuth";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { CGUModal } from "@/components/cgu-modal";
import { NurseProfileForm } from "@/components/nurse-profile-form";
import { EstablishmentProfileForm } from "@/components/establishment-profile-form";
import { MissionCard } from "@/components/mission-card";
import { MissionForm } from "@/components/mission-form";
import { ProfileEditForm } from "@/components/profile-edit-form";
import { CalendarScheduleManager } from "@/components/calendar-schedule-manager";
import { useToast } from "@/hooks/use-toast";
import {
  Heart,
  Users,
  Hospital,
  Settings,
  LogOut,
  Plus,
  Calendar,
  MapPin,
  Bell,
  TrendingUp,
  Clock,
  Star,
  Brain,
  DollarSign,
  Edit,
  Menu,
  X,
  Calculator,
  Stethoscope,
  ClipboardList,
  Smartphone,
  Loader2
} from "lucide-react";
import { Link, useLocation } from "wouter";
import { useState, useEffect } from "react";
import { Skeleton } from "@/components/ui/skeleton";

export default function Home() {
  const { user, isLoading } = useAuth();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [, setLocation] = useLocation();

  const [showCGU, setShowCGU] = useState(false);
  const [showProfileForm, setShowProfileForm] = useState(false);
  const [showProfileEdit, setShowProfileEdit] = useState(false);
  const [showScheduleManager, setShowScheduleManager] = useState(false);
  const [showMissionForm, setShowMissionForm] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isCreatingMission, setIsCreatingMission] = useState(false);

  // Redirection si non connecté
  useEffect(() => {
    if (!isLoading && !user) {
      setLocation('/landing-simple');
    }
  }, [user, isLoading, setLocation]);

  const handleProfileEditClick = () => {
    setShowProfileEdit(true);
  };

  const handleScheduleClick = () => {
    setShowScheduleManager(true);
  };

  const handleCreateMissionClick = async () => {
    setIsCreatingMission(true);
    try {
      // Créer une mission de test directement
      const missionData = {
        title: "Infirmier/ère de nuit - Service Urgences",
        specialization: "Urgences",
        description: "Recherche infirmier/ère expérimenté(e) pour service d'urgences de nuit. Poste en CDI, équipe dynamique.",
        hourlyRate: 28.50,
        startDate: new Date().toISOString(),
        endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 jours
        requirements: ["BLS", "Expérience urgences"],
        location: {
          address: "CHU Lyon Sud, Pierre-Bénite",
          city: "Lyon",
          coordinates: [45.7640, 4.8357]
        },
        status: "open"
      };

      // Simuler la création de mission
      toast({
        title: "Mission créée avec succès !",
        description: "L'IA va maintenant sélectionner les meilleurs candidats.",
        variant: "default",
      });
    } catch (error) {
      toast({
        title: "Erreur lors de la création",
        description: "Impossible de créer la mission pour le moment.",
        variant: "destructive",
      });
    } finally {
      setIsCreatingMission(false);
    }
  };

  const handleLogout = async () => {
    try {
      // Déconnexion côté client
      setLocation('/landing-simple');
    } catch (error) {
      setLocation('/landing-simple');
    }
  };

  // Données simulées pour les missions
  const mockMissions = [
    {
      id: "1",
      title: "Infirmier(ère) de nuit - Urgences",
      description: "Recherche infirmier(ère) expérimenté(e) pour service d'urgences de nuit.",
      hourlyRate: 28.50,
      location: "CHU Lyon Sud",
      status: "OPEN",
      createdAt: new Date().toISOString()
    },
    {
      id: "2",
      title: "Infirmier(ère) pédiatrie - Jour",
      description: "Infirmier(ère) pédiatrie pour remplacement en CDD.",
      hourlyRate: 25.00,
      location: "Clinique Lyon Nord",
      status: "OPEN",
      createdAt: new Date().toISOString()
    }
  ];

  // Données simulées pour les stats
  const mockStats = {
    completedMissions: 12,
    totalEarnings: 2840,
    rating: 4.8,
    availableMissions: 5,
    activeStaff: 8,
    openMissions: 3,
    avgResponseTime: 2,
    satisfaction: 4.9
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="max-w-7xl mx-auto p-6 space-y-6">
          <Skeleton className="h-16 w-full" />
          <div className="grid lg:grid-cols-3 gap-6">
            <Skeleton className="h-80" />
            <Skeleton className="h-80" />
            <Skeleton className="h-80" />
          </div>
        </div>
      </div>
    );
  }

  // Si pas d'utilisateur, afficher un loader pendant la redirection
  if (!user) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex items-center space-x-2">
          <Loader2 className="h-6 w-6 animate-spin" />
          <span>Redirection...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-light-bg dark:bg-background">
      {/* Navigation */}
      <nav className="bg-white dark:bg-card shadow-sm border-b border-border" role="navigation" aria-label="Navigation principale">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link href="/">
              <div className="flex items-center space-x-3 cursor-pointer" role="button" tabIndex={0} aria-label="Retour à l'accueil">
                <div className="w-8 h-8 bg-nurse-blue rounded-lg flex items-center justify-center">
                  <Heart className="w-4 h-4 text-white" />
                </div>
                <span className="font-semibold text-xl nurse-blue">NurseLink AI</span>
              </div>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-4">
              <Button variant="ghost" size="icon" aria-label="Notifications">
                <Bell className="w-4 h-4" />
              </Button>

              {user?.role === 'ESTABLISHMENT' && (
                <Link href="/dashboard">
                  <Button variant="ghost">
                    <TrendingUp className="w-4 h-4 mr-2" />
                    Dashboard
                  </Button>
                </Link>
              )}

              <Link href="/ai-test">
                <Button variant="ghost" className="text-nurse-purple">
                  <Brain className="w-4 h-4 mr-2" />
                  Test IA
                </Button>
              </Link>

              <Button
                variant="ghost"
                size="icon"
                onClick={handleProfileEditClick}
                aria-label="Modifier mon profil"
              >
                <Edit className="w-4 h-4" />
              </Button>

              {user?.role === 'NURSE' && (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleScheduleClick}
                  aria-label="Gérer mon planning"
                >
                  <Calendar className="w-4 h-4" />
                </Button>
              )}

              <Button variant="ghost" size="icon" aria-label="Paramètres">
                <Settings className="w-4 h-4" />
              </Button>

              <Button
                variant="ghost"
                size="icon"
                onClick={handleLogout}
                aria-label="Se déconnecter"
              >
                <LogOut className="w-4 h-4" />
              </Button>

              <div className="flex items-center space-x-2">
                <img
                  src={`https://ui-avatars.com/api/?name=${user?.name || user?.email}`}
                  alt={`Photo de profil de ${user?.name || user?.email}`}
                  className="w-8 h-8 rounded-full"
                />
                <span className="font-medium">{user?.name || user?.email}</span>
              </div>
            </div>

            {/* Mobile Menu Button */}
            <div className="md:hidden">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="p-2 touch-manipulation"
                aria-label={isMobileMenuOpen ? "Fermer le menu" : "Ouvrir le menu"}
                aria-expanded={isMobileMenuOpen}
              >
                {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </Button>
            </div>
          </div>
        </div>

        {/* Mobile Menu Overlay */}
        {isMobileMenuOpen && (
          <div className="md:hidden absolute top-16 left-0 right-0 bg-white dark:bg-card shadow-lg border-b border-border z-50" role="menu">
            <div className="px-4 py-2 space-y-2">
              <Button
                variant="ghost"
                className="w-full justify-start h-12 text-base"
                onClick={() => {
                  setIsMobileMenuOpen(false);
                }}
                role="menuitem"
              >
                <Bell className="w-5 h-5 mr-3" />
                Notifications
              </Button>

              {user?.role === 'ESTABLISHMENT' && (
                <Link href="/dashboard">
                  <Button
                    variant="ghost"
                    className="w-full justify-start h-12 text-base"
                    onClick={() => setIsMobileMenuOpen(false)}
                    role="menuitem"
                  >
                    <TrendingUp className="w-5 h-5 mr-3" />
                    Dashboard
                  </Button>
                </Link>
              )}

              <Button
                variant="ghost"
                className="w-full justify-start h-12 text-base"
                onClick={() => {
                  handleProfileEditClick();
                  setIsMobileMenuOpen(false);
                }}
                role="menuitem"
              >
                <Edit className="w-5 h-5 mr-3" />
                Modifier mon profil
              </Button>

              {user?.role === 'NURSE' && (
                <>
                  <Button
                    variant="ghost"
                    className="w-full justify-start h-12 text-base"
                    onClick={() => {
                      handleScheduleClick();
                      setIsMobileMenuOpen(false);
                    }}
                    role="menuitem"
                  >
                    <Calendar className="w-5 h-5 mr-3" />
                    Gérer mon planning
                  </Button>

                  <Link href="/dose-calculator">
                    <Button
                      variant="ghost"
                      className="w-full justify-start h-12 text-base"
                      onClick={() => setIsMobileMenuOpen(false)}
                      role="menuitem"
                    >
                      <Calculator className="w-5 h-5 mr-3" />
                      Calculateur de doses
                    </Button>
                  </Link>
                </>
              )}

              <Button
                variant="ghost"
                className="w-full justify-start h-12 text-base"
                onClick={() => {
                  setIsMobileMenuOpen(false);
                }}
                role="menuitem"
              >
                <Settings className="w-5 h-5 mr-3" />
                Paramètres
              </Button>

              <div className="border-t pt-2">
                <div className="flex items-center px-3 py-2">
                  <img
                    src={`https://ui-avatars.com/api/?name=${user?.name || user?.email}`}
                    alt={`Photo de profil de ${user?.name || user?.email}`}
                    className="w-10 h-10 rounded-full mr-3"
                  />
                  <div>
                    <p className="font-medium">{user?.name || user?.email}</p>
                    <p className="text-sm text-gray-500">{user?.email}</p>
                  </div>
                </div>

                <Button
                  variant="ghost"
                  className="w-full justify-start h-12 text-base text-red-600 hover:text-red-700 hover:bg-red-50"
                  onClick={() => {
                    handleLogout();
                    setIsMobileMenuOpen(false);
                  }}
                  role="menuitem"
                >
                  <LogOut className="w-5 h-5 mr-3" />
                  Se déconnecter
                </Button>
              </div>
            </div>
          </div>
        )}
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">
            Bonjour, {user?.name || user?.email} !
          </h1>
          <p className="text-muted-foreground">
            {user?.role === 'NURSE'
              ? "Découvrez les missions disponibles près de chez vous"
              : "Gérez vos besoins en personnel et créez de nouvelles missions"
            }
          </p>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {user?.role === 'NURSE' ? (
            <>
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center space-x-2">
                    <Calendar className="w-4 h-4 text-muted-foreground" />
                    <div>
                      <div className="font-semibold">{mockStats.completedMissions}</div>
                      <div className="text-sm text-muted-foreground">Missions terminées</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center space-x-2">
                    <DollarSign className="w-4 h-4 text-muted-foreground" />
                    <div>
                      <div className="font-semibold">{mockStats.totalEarnings}€</div>
                      <div className="text-sm text-muted-foreground">Gains totaux</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center space-x-2">
                    <Star className="w-4 h-4 text-muted-foreground" />
                    <div>
                      <div className="font-semibold">{mockStats.rating}/5</div>
                      <div className="text-sm text-muted-foreground">Note moyenne</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center space-x-2">
                    <MapPin className="w-4 h-4 text-muted-foreground" />
                    <div>
                      <div className="font-semibold">{mockStats.availableMissions}</div>
                      <div className="text-sm text-muted-foreground">Missions proches</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </>
          ) : (
            <>
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center space-x-2">
                    <Users className="w-4 h-4 text-muted-foreground" />
                    <div>
                      <div className="font-semibold">{mockStats.activeStaff}</div>
                      <div className="text-sm text-muted-foreground">Personnel actif</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center space-x-2">
                    <Calendar className="w-4 h-4 text-muted-foreground" />
                    <div>
                      <div className="font-semibold">{mockStats.openMissions}</div>
                      <div className="text-sm text-muted-foreground">Missions ouvertes</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center space-x-2">
                    <Clock className="w-4 h-4 text-muted-foreground" />
                    <div>
                      <div className="font-semibold">{mockStats.avgResponseTime}h</div>
                      <div className="text-sm text-muted-foreground">Temps réponse</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center space-x-2">
                    <Star className="w-4 h-4 text-muted-foreground" />
                    <div>
                      <div className="font-semibold">{mockStats.satisfaction}/5</div>
                      <div className="text-sm text-muted-foreground">Satisfaction</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </>
          )}
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-semibold">
                {user?.role === 'NURSE' ? "Missions Disponibles" : "Missions Récentes"}
              </h2>
              {user?.role === 'ESTABLISHMENT' && (
                <Button
                  className="bg-action-orange hover:bg-action-orange/90 text-white"
                  onClick={handleCreateMissionClick}
                  disabled={isCreatingMission}
                >
                  {isCreatingMission ? (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    <Plus className="w-4 h-4 mr-2" />
                  )}
                  {isCreatingMission ? "Création..." : "Créer une mission"}
                </Button>
              )}
            </div>

            <div className="space-y-4">
              {mockMissions.length > 0 ? (
                mockMissions.map((mission: any) => (
                  <MissionCard key={mission.id} mission={mission} userRole={user?.role} />
                ))
              ) : (
                <Card>
                  <CardContent className="p-8 text-center">
                    <div className="text-muted-foreground mb-2">
                      {user?.role === 'NURSE'
                        ? "Aucune mission disponible pour le moment"
                        : "Aucune mission créée"
                      }
                    </div>
                    {user?.role === 'ESTABLISHMENT' && (
                      <Button
                        variant="outline"
                        onClick={handleCreateMissionClick}
                        disabled={isCreatingMission}
                      >
                        {isCreatingMission ? (
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        ) : (
                          <Plus className="w-4 h-4 mr-2" />
                        )}
                        {isCreatingMission ? "Création..." : "Créer votre première mission"}
                      </Button>
                    )}
                  </CardContent>
                </Card>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Professional Tools for Nurses */}
            {user?.role === 'NURSE' && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Stethoscope className="w-4 h-4" />
                    <span>Outils Professionnels</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Link href="/dose-calculator">
                    <Button variant="outline" className="w-full justify-start h-12">
                      <Calculator className="w-5 h-5 mr-3" />
                      <div className="text-left">
                        <div className="font-medium">Calculateur de doses</div>
                        <div className="text-xs text-muted-foreground">Posologie & perfusions</div>
                      </div>
                    </Button>
                  </Link>

                  <Button variant="outline" className="w-full justify-start h-12" disabled>
                    <ClipboardList className="w-5 h-5 mr-3" />
                    <div className="text-left">
                      <div className="font-medium">Protocoles cliniques</div>
                      <div className="text-xs text-muted-foreground">Bientôt disponible</div>
                    </div>
                  </Button>

                  <Button variant="outline" className="w-full justify-start h-12" disabled>
                    <Bell className="w-5 h-5 mr-3" />
                    <div className="text-left">
                      <div className="font-medium">Rappels & tâches</div>
                      <div className="text-xs text-muted-foreground">Bientôt disponible</div>
                    </div>
                  </Button>
                </CardContent>
              </Card>
            )}

            {/* Profile Card */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  {user?.role === 'NURSE' ? (
                    <Users className="w-4 h-4" />
                  ) : (
                    <Hospital className="w-4 h-4" />
                  )}
                  <span>Mon Profil</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Statut</span>
                    <Badge variant="default">
                      Actif
                    </Badge>
                  </div>

                  <div>
                    <span className="text-sm font-medium">Rôle</span>
                    <p className="text-sm text-muted-foreground">
                      {user?.role === 'NURSE' ? 'Infirmier(ère)' : 'Établissement'}
                    </p>
                  </div>

                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full"
                    onClick={handleProfileEditClick}
                  >
                    Modifier le profil
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Actions Rapides</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {user?.role === 'NURSE' ? (
                  <>
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full justify-start"
                      onClick={handleScheduleClick}
                    >
                      <Calendar className="w-4 h-4 mr-2" />
                      Gérer mes disponibilités
                    </Button>
                    <Button variant="outline" size="sm" className="w-full justify-start">
                      <MapPin className="w-4 h-4 mr-2" />
                      Missions près de moi
                    </Button>
                    <Link href="/mobile">
                      <Button variant="outline" size="sm" className="w-full justify-start">
                        📱 Version mobile
                      </Button>
                    </Link>
                  </>
                ) : (
                  <>
                    <Link href="/dashboard">
                      <Button variant="outline" size="sm" className="w-full justify-start">
                        <TrendingUp className="w-4 h-4 mr-2" />
                        Dashboard complet
                      </Button>
                    </Link>
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full justify-start"
                      onClick={handleCreateMissionClick}
                      disabled={isCreatingMission}
                    >
                      {isCreatingMission ? (
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      ) : (
                        <Plus className="w-4 h-4 mr-2" />
                      )}
                      {isCreatingMission ? "Création..." : "Créer une mission"}
                    </Button>
                    <Button variant="outline" size="sm" className="w-full justify-start">
                      <Users className="w-4 h-4 mr-2" />
                      Gérer les équipes
                    </Button>
                  </>
                )}
              </CardContent>
            </Card>

            {/* Help & Support */}
            <Card>
              <CardHeader>
                <CardTitle>Aide & Support</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button variant="ghost" size="sm" className="w-full justify-start">
                  📚 Centre d'aide
                </Button>
                <Button variant="ghost" size="sm" className="w-full justify-start">
                  💬 Chat support
                </Button>
                <Button variant="ghost" size="sm" className="w-full justify-start">
                  📞 Contact
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Profile Form Modal */}
      {showProfileForm && user && (
        user.role === 'NURSE' ? (
          <NurseProfileForm
            open={showProfileForm}
            onClose={() => setShowProfileForm(false)}
          />
        ) : (
          <EstablishmentProfileForm
            open={showProfileForm}
            onClose={() => setShowProfileForm(false)}
          />
        )
      )}

      {/* Profile Edit Modal */}
      {showProfileEdit && (
        <ProfileEditForm
          open={showProfileEdit}
          onClose={() => setShowProfileEdit(false)}
        />
      )}

      {/* Schedule Manager Modal */}
      {showScheduleManager && (
        <CalendarScheduleManager
          open={showScheduleManager}
          onClose={() => setShowScheduleManager(false)}
        />
      )}

      {/* Mission Form Modal */}
      {showMissionForm && (
        <MissionForm
          open={showMissionForm}
          onClose={() => setShowMissionForm(false)}
        />
      )}

      {/* CGU Modal */}
      <CGUModal
        open={showCGU}
        onAccept={() => setShowCGU(false)}
      />
    </div>
  );
}
