import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useAuth } from "../hooks/useAuth-simple";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
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
  ArrowUp,
  ArrowDown,
  Building,
  UserCheck,
  FileText,
  Bell,
  Settings,
  Loader2,
  Edit,
  Trash2,
  Eye,
  BarChart3,
  Home,
  Briefcase,
  UserPlus,
  UsersIcon,
  PieChart,
  Activity,
  LogOut,
  X,
  MessageCircle,
  Download,
  Upload,
  Send,
  Undo2,
  EyeOff
} from "lucide-react";
import { Link } from "wouter";
import { useToast } from "@/hooks/use-toast";

export default function Dashboard() {
  const { user, logout } = useAuth();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("overview");
  const [searchTerm, setSearchTerm] = useState("");
  const [serviceFilter, setServiceFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [showNotifications, setShowNotifications] = useState(false);
  const [unreadCount, setUnreadCount] = useState(3);

  // États pour la gestion UX des candidatures rejetées
  const [hideRejected, setHideRejected] = useState(false);
  const [recentlyRejected, setRecentlyRejected] = useState<Map<string, NodeJS.Timeout>>(new Map());

  // Gestion du thème depuis localStorage
  useEffect(() => {
    const savedTheme = localStorage.getItem("theme") || "light";

    // Appliquer le thème au chargement du dashboard
    if (savedTheme === "dark") {
      document.documentElement.classList.add("dark");
    } else if (savedTheme === "light") {
      document.documentElement.classList.remove("dark");
    } else if (savedTheme === "auto") {
      // Mode auto : suivre les préférences système
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      if (prefersDark) {
        document.documentElement.classList.add("dark");
      } else {
        document.documentElement.classList.remove("dark");
      }
    }
  }, []);

  // Récupération des données via API
  const { data: establishmentProfile, isLoading: profileLoading } = useQuery({
    queryKey: ['/api/establishment/profile'],
    enabled: user?.role === 'establishment',
    retry: 1
  });

  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ['/api/establishment/stats'],
    enabled: user?.role === 'establishment',
    retry: 1
  });

  const { data: missions = [], isLoading: missionsLoading } = useQuery({
    queryKey: ['/api/establishment/missions'],
    enabled: user?.role === 'establishment',
    retry: 1
  });

  // Données de missions d'exemple en attendant l'API
  const sampleMissions = [
    {
      id: 1,
      title: "Infirmier DE - Service Réanimation",
      description: "Recherche infirmier expérimenté pour service de réanimation polyvalente",
      service: "Réanimation",
      shift: "Nuit (22h-6h)",
      dates: "Du 25 Jan au 15 Fév 2025",
      salary: "28€/heure + primes",
      status: "published",
      urgent: true,
      specialization: "Réanimation",
      address: "CHU Bordeaux"
    },
    {
      id: 2,
      title: "Infirmier - Gériatrie",
      description: "Poste en service de gériatrie pour prise en charge personnes âgées",
      service: "Gériatrie",
      shift: "Jour (8h-20h)",
      dates: "Du 20 Jan au 28 Fév 2025",
      salary: "25€/heure",
      status: "published",
      urgent: false,
      specialization: "Gériatrie",
      address: "EHPAD Les Jardins"
    },
    {
      id: 3,
      title: "Infirmier Urgentiste",
      description: "Recherche infirmier pour service d'urgences, expérience souhaitée",
      service: "Urgences",
      shift: "Matin (6h-14h)",
      dates: "Du 30 Jan au 10 Mar 2025",
      salary: "30€/heure",
      status: "draft",
      urgent: false,
      specialization: "Urgences",
      address: "Hôpital Saint-André"
    }
  ];

  // Utiliser uniquement les vraies missions de l'API
  const displayMissions: any[] = Array.isArray(missions) ? missions : [];

  const { data: candidatesByMission = {} as Record<string, any[]>, isLoading: candidatesLoading, refetch: refetchCandidates } = useQuery({
    queryKey: ['/api/establishment/candidates'],
    enabled: user?.role === 'establishment',
    retry: 1,
    staleTime: 0, // Toujours considérer les données comme obsolètes
    refetchOnWindowFocus: true, // Refetch quand la fenêtre reprend le focus
  });

  // Extraction des candidatures pour les badges
  const candidatures = candidatesByMission ? Object.values(candidatesByMission as Record<string, any[]>).flat() : [];

  // Fonctions de filtrage
  const filteredMissions = (displayMissions as any[]).filter((mission: any) => {
    const matchesSearch = searchTerm === "" ||
      mission.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      mission.specialization?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      mission.description?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesService = serviceFilter === "all" ||
      mission.service === serviceFilter ||
      mission.specialization?.toLowerCase().includes(serviceFilter.toLowerCase());

    return matchesSearch && matchesService;
  });

  const filteredCandidaturesByMission = candidatesByMission ?
    Object.fromEntries(
      Object.entries(candidatesByMission as Record<string, any[]>)
        .map(([missionTitle, candidates]) => [
          missionTitle,
          candidates.filter((candidate: any) => {
            const matchesSearch = searchTerm === "" ||
              candidate.candidateName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
              candidate.specialization?.toLowerCase().includes(searchTerm.toLowerCase());

            const matchesStatus = statusFilter === "all" || candidate.status === statusFilter;

            return matchesSearch && matchesStatus;
          })
        ])
        .filter(([, candidates]) => candidates.length > 0)
    ) : {};

  const { data: templates = [], isLoading: templatesLoading } = useQuery({
    queryKey: ['/api/establishment/templates'],
    enabled: user?.role === 'establishment',
    retry: 1
  });

  // Requêtes pour les données analytiques
  const { data: analyticsData, isLoading: analyticsLoading } = useQuery({
    queryKey: ['/api/analytics/establishment'],
    enabled: user?.role === 'establishment' && activeTab === 'analytics',
    retry: 1
  });



  // Fonctions de filtrage pour les différents onglets
  const filteredTemplates = templates ? (templates as any[]).filter((template: any) => {
    return searchTerm === "" ||
      template.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      template.specialization?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (template.skills && Array.isArray(template.skills) && template.skills.some((skill: string) => skill.toLowerCase().includes(searchTerm.toLowerCase())));
  }) : [];

  // Filtrage des candidatures avec recherche et statut
  const filteredCandidatures = candidatesByMission ? Object.entries(candidatesByMission).reduce((acc, [missionTitle, candidatures]) => {
    const filtered = candidatures.filter((candidature: any) => {
      const matchesSearch = searchTerm === "" ||
        candidature.candidateName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        candidature.specialization?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        candidature.status?.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesStatus = statusFilter === "all" || candidature.status === statusFilter;

      return matchesSearch && matchesStatus;
    });

    if (filtered.length > 0) {
      (acc as any)[missionTitle] = filtered;
    }
    return acc;
  }, {} as typeof candidatesByMission) : {};

  const { data: realtimeMetrics, isLoading: realtimeLoading } = useQuery({
    queryKey: ['/api/analytics/metrics/realtime'],
    enabled: user?.role === 'establishment' && activeTab === 'analytics',
    refetchInterval: 30000, // Refresh every 30 seconds
    retry: 1
  });



  // Templates data is now loaded via API query above

  // Données des candidatures regroupées par mission (moved from API query)
  const candidaturesByMissionStatic = {
    "Infirmier DE - Service Réanimation": [
      {
        id: 1,
        candidateName: "Marie Dubois",
        appliedDate: "14 Jan 2025",
        status: "pending",
        experience: "8 ans",
        rating: 4.9,
        specialization: "Réanimation",
        cv: "cv_marie_dubois.pdf"
      },
      {
        id: 4,
        candidateName: "Pierre Dupont",
        appliedDate: "11 Jan 2025",
        status: "pending",
        experience: "10 ans",
        rating: 4.6,
        specialization: "Réanimation",
        cv: "cv_pierre_dupont.pdf"
      }
    ],
    "Aide-soignant - Service Gériatrie": [
      {
        id: 2,
        candidateName: "Thomas Martin",
        appliedDate: "13 Jan 2025",
        status: "accepted",
        experience: "5 ans",
        rating: 4.7,
        specialization: "Gériatrie",
        cv: "cv_thomas_martin.pdf"
      }
    ],
    "Infirmier DE - Urgences": [
      {
        id: 3,
        candidateName: "Sophie Laurent",
        appliedDate: "12 Jan 2025",
        status: "rejected",
        experience: "6 ans",
        rating: 4.8,
        specialization: "Urgences",
        cv: "cv_sophie_laurent.pdf"
      }
    ]
  };

  const handleCreateMission = () => {
    window.location.href = "/mission-creator";
  };

  // Mutations pour les actions API
  const publishTemplateMutation = useMutation({
    mutationFn: async (template: any) => {
      const res = await apiRequest('POST', `/api/establishment/templates/${template.id}/publish`, {
        title: template.name,
        service: template.service,
        salary: template.salary,
        duration: template.duration
      });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/establishment/missions'] });
      alert('Template publié comme nouvelle mission avec succès !');
    }
  });

  const deleteTemplateMutation = useMutation({
    mutationFn: async (templateId: string) => {
      const res = await apiRequest('DELETE', `/api/establishment/templates/${templateId}`);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/establishment/templates'] });
      alert('Template supprimé avec succès !');
    }
  });

  const handlePublishTemplate = (template: any) => {
    publishTemplateMutation.mutate(template);
  };

  const handleEditTemplate = (template: any) => {
    window.location.href = `/mission-templates?edit=${template.id}`;
  };

  const handleDeleteTemplate = (template: any) => {
    if (confirm(`Êtes-vous sûr de vouloir supprimer le template "${template.name}" ?`)) {
      deleteTemplateMutation.mutate(template.id);
    }
  };

  const acceptCandidateMutation = useMutation({
    mutationFn: async (candidateId: string) => {
      const res = await apiRequest('PUT', `/api/establishment/candidates/${candidateId}/accept`);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/establishment/candidates'] });
      alert('Candidature acceptée avec succès !');
    }
  });

  const rejectCandidateMutation = useMutation({
    mutationFn: async (candidateId: string) => {
      const res = await apiRequest('PUT', `/api/establishment/candidates/${candidateId}/reject`);
      return res.json();
    },
    onMutate: async (candidateId) => {
      // Marquer immédiatement comme rejeté avec timer pour l'animation
      const timer = setTimeout(() => {
        setRecentlyRejected(prev => {
          const newMap = new Map(prev);
          newMap.delete(candidateId);
          return newMap;
        });
      }, 10000);

      setRecentlyRejected(prev => {
        const newMap = new Map(prev);
        newMap.set(candidateId, timer);
        return newMap;
      });
    },
    onSuccess: (data, candidateId) => {
      // Forcer un rafraîchissement pour sync avec le serveur
      refetchCandidates();

      // Démarrer un timer pour l'annulation
      const timer = setTimeout(() => {
        setRecentlyRejected(prev => {
          const newSet = new Set(prev);
          newSet.delete(candidateId);
          return newSet;
        });
        refetchCandidates();
      }, 10000);

      setRejectionTimers(prev => {
        const newMap = new Map(prev);
        newMap.set(candidateId, timer);
        return newMap;
      });

      // Alerte simple et directe pour démonstration
      setTimeout(() => {
        if (confirm("Candidature rejetée ! Vous voyez l'animation rouge dans la liste ?\n\nVoulez-vous annuler ce rejet ?")) {
          handleUndoReject(candidateId);
        }
      }, 500);

      // Toast de confirmation
      toast({
        title: "Candidature rejetée",
        description: "L'animation rouge est visible dans la liste des candidats",
        variant: "destructive"
      });
    },
    onError: (error, candidateId) => {
      // En cas d'erreur, retirer le marquage de rejet
      setRecentlyRejected(prev => {
        const newSet = new Set(prev);
        newSet.delete(candidateId);
        return newSet;
      });
      // Restaurer les données originales
      refetchCandidates();
    }
  });

  const handleViewCandidates = (mission: any) => {
    setActiveTab("candidates");
  };

  const handleAcceptCandidate = (candidature: any) => {
    acceptCandidateMutation.mutate(candidature.id);
  };

  const handleRejectCandidate = (candidature: any) => {
    rejectCandidateMutation.mutate(candidature.id);
  };

  // Fonction pour annuler un rejet récent
  const handleUndoReject = (candidateId: string) => {
    // Annuler le timer
    const timer = rejectionTimers.get(candidateId);
    if (timer) {
      clearTimeout(timer);
      setRejectionTimers(prev => {
        const newMap = new Map(prev);
        newMap.delete(candidateId);
        return newMap;
      });
    }

    // Retirer de la liste des rejetés récemment
    setRecentlyRejected(prev => {
      const newSet = new Set(prev);
      newSet.delete(candidateId);
      return newSet;
    });

    toast({
      title: "Rejet annulé",
      description: "La candidature a été restaurée",
      variant: "default"
    });
  };

  const handleViewCV = (candidature: any) => {
    window.open(`/api/files/cv/${candidature.cv}`, '_blank');
  };

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
                    {(establishmentProfile as any)?.name || user.firstName || 'Établissement'}
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
                  3
                </span>
              </Button>
              <Button variant="ghost" size="sm" onClick={() => window.location.href = "/settings"} className="hover:bg-accent transition-colors">
                <Settings className="h-4 w-4 mr-2" />
                Paramètres
              </Button>
              <Button variant="outline" onClick={logout} className="hover:bg-red-50 hover:border-red-200 hover:text-red-700 dark:hover:bg-red-900/20 dark:hover:border-red-800 dark:hover:text-red-400 transition-colors">
                <LogOut className="h-4 w-4 mr-2" />
                Déconnexion
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-6 bg-muted p-1 rounded-lg">
            <TabsTrigger value="overview" className="flex items-center space-x-2 data-[state=active]:bg-background data-[state=active]:shadow-sm transition-all relative">
              <Home className="h-4 w-4" />
              <span className="hidden sm:inline">Vue d'ensemble</span>
            </TabsTrigger>
            <TabsTrigger value="missions" className="flex items-center space-x-2 data-[state=active]:bg-background data-[state=active]:shadow-sm transition-all relative">
              <Briefcase className="h-4 w-4" />
              <span className="hidden sm:inline">Missions</span>
              {((missions as any[]) || []).length > 0 && (
                <span className="absolute -top-1 -right-1 bg-blue-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                  {((missions as any[]) || []).length}
                </span>
              )}
            </TabsTrigger>
            <TabsTrigger value="candidates" className="flex items-center space-x-2 data-[state=active]:bg-background data-[state=active]:shadow-sm transition-all relative">
              <UserPlus className="h-4 w-4" />
              <span className="hidden sm:inline">Candidatures</span>
              {(candidatures as any[]).filter((c: any) => c.status === 'pending').length > 0 && (
                <span className="absolute -top-1 -right-1 bg-orange-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center animate-pulse">
                  {(candidatures as any[]).filter((c: any) => c.status === 'pending').length}
                </span>
              )}
            </TabsTrigger>
            <TabsTrigger value="team-management" className="flex items-center space-x-2 data-[state=active]:bg-background data-[state=active]:shadow-sm transition-all relative">
              <UsersIcon className="h-4 w-4" />
              <span className="hidden sm:inline">Équipe</span>
              <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
            </TabsTrigger>
            <TabsTrigger value="templates" className="flex items-center space-x-2 data-[state=active]:bg-background data-[state=active]:shadow-sm transition-all relative">
              <FileText className="h-4 w-4" />
              <span className="hidden sm:inline">Templates</span>
            </TabsTrigger>
            <TabsTrigger value="analytics" className="flex items-center space-x-2 data-[state=active]:bg-background data-[state=active]:shadow-sm transition-all relative">
              <PieChart className="h-4 w-4" />
              <span className="hidden sm:inline">Analytics</span>
              <div className="absolute -top-1 -right-1 w-2 h-2 bg-green-400 rounded-full animate-ping"></div>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview">
            <div className="space-y-6">
              {/* Stats principales */}
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
                    <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">Temps de Réponse</CardTitle>
                    <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
                      <Clock className="h-4 w-4 text-green-600 dark:text-green-400" />
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-gray-900 dark:text-white">{(stats as any)?.avgResponseTime || 0}h</div>
                    <div className="flex items-center mt-2">
                      <ArrowDown className="w-4 h-4 text-green-500 mr-1" />
                      <span className="text-sm text-green-600 dark:text-green-400 font-medium">
                        {Math.abs((stats as any)?.responseImprovement || 0)}%
                      </span>
                      <span className="text-xs text-muted-foreground ml-1">d'amélioration</span>
                    </div>
                  </CardContent>
                </Card>

                <Card className="hover:shadow-lg transition-shadow duration-300 border-l-4 border-l-yellow-500">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">Satisfaction</CardTitle>
                    <div className="p-2 bg-yellow-100 dark:bg-yellow-900/30 rounded-lg">
                      <Star className="h-4 w-4 text-yellow-600 dark:text-yellow-400" />
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center space-x-3">
                      <div className="text-2xl font-bold text-gray-900 dark:text-white">{(stats as any)?.satisfaction || 0}/5</div>
                      <div className="flex">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={`w-4 h-4 ${
                              i < Math.floor((stats as any)?.satisfaction || 0)
                                ? 'text-yellow-400 fill-current'
                                : 'text-gray-300 dark:text-gray-600'
                            }`}
                          />
                        ))}
                      </div>
                    </div>
                    <div className="flex items-center mt-2">
                      <span className="text-sm text-yellow-600 dark:text-yellow-400 font-medium">
                        {(stats as any)?.totalReviews || 0} avis
                      </span>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Actions rapides */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Button
                  onClick={handleCreateMission}
                  className="h-24 flex flex-col items-center justify-center space-y-2 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
                >
                  <div className="p-2 bg-white/20 rounded-lg">
                    <Plus className="h-6 w-6" />
                  </div>
                  <span className="font-medium">Créer une Mission</span>
                </Button>

                <Card className="group cursor-pointer hover:shadow-lg transition-all duration-300 border-2 border-transparent hover:border-orange-200 dark:hover:border-orange-800">
                  <Link href="/mission-templates">
                    <div className="h-24 flex flex-col items-center justify-center space-y-2 p-4">
                      <div className="p-2 bg-orange-100 dark:bg-orange-900/30 rounded-lg group-hover:bg-orange-200 dark:group-hover:bg-orange-900/50 transition-colors">
                        <FileText className="h-6 w-6 text-orange-600 dark:text-orange-400" />
                      </div>
                      <span className="font-medium text-gray-700 dark:text-gray-300 group-hover:text-orange-600 dark:group-hover:text-orange-400 transition-colors">Templates de Missions</span>
                    </div>
                  </Link>
                </Card>

                <Card className="group cursor-pointer hover:shadow-lg transition-all duration-300 border-2 border-transparent hover:border-green-200 dark:hover:border-green-800">
                  <Link href="/analytics">
                    <div className="h-24 flex flex-col items-center justify-center space-y-2 p-4">
                      <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg group-hover:bg-green-200 dark:group-hover:bg-green-900/50 transition-colors">
                        <BarChart3 className="h-6 w-6 text-green-600 dark:text-green-400" />
                      </div>
                      <span className="font-medium text-gray-700 dark:text-gray-300 group-hover:text-green-600 dark:group-hover:text-green-400 transition-colors">Analytiques</span>
                    </div>
                  </Link>
                </Card>
              </div>

              {/* Missions récentes */}
              <Card>
                <CardHeader>
                  <CardTitle>Missions Récentes</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {((missions as any[]) || []).slice(0, 3).map((mission: any) => (
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
          </TabsContent>

          <TabsContent value="missions">
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
                <Select value={serviceFilter} onValueChange={setServiceFilter}>
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
                {filteredMissions.map((mission) => (
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
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleViewCandidates(mission)}
                          >
                            {mission.candidates} candidats
                          </Button>
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
          </TabsContent>

          <TabsContent value="candidates">
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold">Gestion des Candidatures</h2>
                <div className="flex space-x-2">
                  <div className="flex-1">
                    <Input
                      placeholder="Rechercher un candidat..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-64"
                    />
                  </div>
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="w-48">
                      <SelectValue placeholder="Filtrer par statut" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Toutes</SelectItem>
                      <SelectItem value="pending">En attente</SelectItem>
                      <SelectItem value="accepted">Acceptées</SelectItem>
                      <SelectItem value="rejected">Rejetées</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-6">
                {Object.entries(filteredCandidatures || {}).map(([missionTitle, missionCandidatures]) => (
                  <Card key={missionTitle} className="border-l-4 border-l-blue-500">
                    <CardHeader>
                      <div className="flex justify-between items-center">
                        <h3 className="text-lg font-semibold">{missionTitle}</h3>
                        <Badge variant="outline">
                          {missionCandidatures.length} candidat{missionCandidatures.length > 1 ? 's' : ''}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {missionCandidatures.map((candidature: any) => (
                        <div key={candidature.id} className="border rounded-lg p-4 bg-muted/20">
                          <div className="flex justify-between items-start">
                            <div className="flex-1">
                              <h4 className="font-medium">{candidature.candidateName}</h4>
                              <div className="mt-2 space-y-1">
                                <p className="text-sm text-muted-foreground">
                                  <UserCheck className="inline w-4 h-4 mr-1" />
                                  {candidature.specialization} • {candidature.experience}
                                </p>
                                <p className="text-sm text-muted-foreground">
                                  <Calendar className="inline w-4 h-4 mr-1" />
                                  Candidature: {candidature.appliedDate}
                                </p>
                                <div className="flex items-center space-x-2">
                                  <Star className="w-4 h-4 text-yellow-500" />
                                  <span className="text-sm">{candidature.rating}/5</span>
                                </div>
                              </div>
                            </div>
                            <div className="flex items-center space-x-2">
                              <Badge
                                variant={
                                  candidature.status === 'accepted' ? 'default' :
                                  candidature.status === 'rejected' ? 'destructive' :
                                  'secondary'
                                }
                              >
                                {candidature.status === 'pending' ? 'En attente' :
                                 candidature.status === 'accepted' ? 'Acceptée' : 'Rejetée'}
                              </Badge>
                              <div className="flex space-x-1">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleViewCV(candidature)}
                                >
                                  <FileText className="h-4 w-4" />
                                </Button>
                                {candidature.status === 'pending' && (
                                  <>
                                    <Button
                                      variant="default"
                                      size="sm"
                                      onClick={() => handleAcceptCandidate(candidature)}
                                    >
                                      Accepter
                                    </Button>
                                    <Button
                                      variant="destructive"
                                      size="sm"
                                      onClick={() => handleRejectCandidate(candidature)}
                                    >
                                      Rejeter
                                    </Button>
                                  </>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </TabsContent>

          {/* Onglet Gestion d'équipe - Vue organisée par missions avec candidatures */}
          <TabsContent value="team-management">
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <div>
                  <h2 className="text-2xl font-bold text-foreground">Gestion d'Équipe</h2>
                  <p className="text-muted-foreground">Vue d'ensemble des missions et de leurs candidatures</p>
                </div>
                <div className="flex items-center space-x-3">
                  <Badge variant="outline" className="text-xs">
                    {((missions as any[]) || []).length} missions actives
                  </Badge>
                  <Badge variant="outline" className="text-xs">
                    {(candidatures as any[]).filter((c: any) => c.status === 'pending').length} candidatures en attente
                  </Badge>
                </div>
              </div>

              {/* Filtres et recherche */}
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1">
                  <Input
                    placeholder="Rechercher une mission ou un candidat..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full"
                  />
                </div>
                <Select value={serviceFilter} onValueChange={setServiceFilter}>
                  <SelectTrigger className="w-48">
                    <SelectValue placeholder="Filtrer par service" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tous les services</SelectItem>
                    <SelectItem value="urgences">Urgences</SelectItem>
                    <SelectItem value="chirurgie">Chirurgie</SelectItem>
                    <SelectItem value="pediatrie">Pédiatrie</SelectItem>
                    <SelectItem value="geriatrie">Gériatrie</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Liste des missions avec candidatures */}
              <div className="space-y-4">
                {filteredMissions.length === 0 ? (
                  <Card className="border-2 border-dashed border-muted-foreground/25">
                    <CardContent className="flex flex-col items-center justify-center py-12">
                      <Briefcase className="h-12 w-12 text-muted-foreground/50 mb-4" />
                      <h3 className="text-lg font-medium text-muted-foreground mb-2">Aucune mission trouvée</h3>
                      <p className="text-sm text-muted-foreground text-center max-w-sm">
                        Créez votre première mission pour commencer à recevoir des candidatures d'infirmiers qualifiés.
                      </p>
                    </CardContent>
                  </Card>
                ) : (
                  filteredMissions.map((mission: any) => {
                    const missionCandidates = (candidatesByMission as Record<string, any[]>)[mission.title] || [];
                    const pendingCandidates = missionCandidates.filter((c: any) => c.status === 'pending');
                    const acceptedCandidates = missionCandidates.filter((c: any) => c.status === 'accepted');

                    // Calcul du temps restant
                    const startDate = new Date(mission.startDate);
                    const now = new Date();
                    const daysRemaining = Math.max(0, Math.ceil((startDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)));
                    const isUrgent = daysRemaining <= 3;
                    const isStarted = daysRemaining === 0;

                    return (
                      <Card key={mission.id} className="hover:shadow-lg transition-all duration-300 border-l-4 border-l-blue-500">
                        <CardContent className="p-6">
                          {/* En-tête de la mission */}
                          <div className="flex justify-between items-start mb-4">
                            <div className="flex-1">
                              <div className="flex items-center gap-3 mb-2">
                                <h3 className="text-xl font-semibold text-foreground">{mission.title}</h3>
                                <Badge variant={mission.urgency === 'high' ? 'destructive' : mission.urgency === 'medium' ? 'default' : 'secondary'}>
                                  {mission.urgency === 'high' ? 'Urgent' : mission.urgency === 'medium' ? 'Moyen' : 'Normal'}
                                </Badge>
                                <Badge variant="outline">{mission.service}</Badge>
                              </div>
                              <div className="flex items-center gap-6 text-sm text-muted-foreground">
                                <div className="flex items-center gap-1">
                                  <Calendar className="h-4 w-4" />
                                  <span>{new Date(mission.startDate).toLocaleDateString('fr-FR')} - {new Date(mission.endDate).toLocaleDateString('fr-FR')}</span>
                                </div>
                                <div className="flex items-center gap-1">
                                  <Clock className="h-4 w-4" />
                                  <span>{mission.shift}</span>
                                </div>
                                <div className="flex items-center gap-1">
                                  <Building className="h-4 w-4" />
                                  <span>{mission.location}</span>
                                </div>
                              </div>
                            </div>

                            {/* Indicateur de temps restant */}
                            <div className="text-right">
                              <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium ${
                                isStarted ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' :
                                isUrgent ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200' :
                                'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
                              }`}>
                                <Clock className="h-4 w-4" />
                                <span>
                                  {isStarted ? 'En cours' : `${daysRemaining} jour${daysRemaining > 1 ? 's' : ''} restant${daysRemaining > 1 ? 's' : ''}`}
                                </span>
                              </div>
                            </div>
                          </div>

                          {/* Statistiques des candidatures */}
                          <div className="grid grid-cols-3 gap-4 mb-4">
                            <div className="bg-blue-50 dark:bg-blue-950 p-3 rounded-lg">
                              <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">{missionCandidates.length}</div>
                              <div className="text-xs text-blue-600 dark:text-blue-400">Total candidatures</div>
                            </div>
                            <div className="bg-orange-50 dark:bg-orange-950 p-3 rounded-lg">
                              <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">{pendingCandidates.length}</div>
                              <div className="text-xs text-orange-600 dark:text-orange-400">En attente</div>
                            </div>
                            <div className="bg-green-50 dark:bg-green-950 p-3 rounded-lg">
                              <div className="text-2xl font-bold text-green-600 dark:text-green-400">{acceptedCandidates.length}</div>
                              <div className="text-xs text-green-600 dark:text-green-400">Acceptées</div>
                            </div>
                          </div>

                          {/* Option pour masquer les candidatures rejetées */}
                          <div className="flex items-center justify-between mb-4">
                            <h4 className="font-medium text-foreground">Candidats pour cette mission :</h4>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => setHideRejected(!hideRejected)}
                              className="text-xs"
                            >
                              <EyeOff className="h-3 w-3 mr-1" />
                              {hideRejected ? 'Afficher' : 'Masquer'} rejetés
                            </Button>
                          </div>

                          {/* Liste des candidats */}
                          {missionCandidates.length > 0 ? (
                            <div className="space-y-3">
                              <div className="grid gap-3">
                                {missionCandidates.slice(0, 3)
                                  .filter((candidature: any) =>
                                    !hideRejected ||
                                    (candidature.status !== 'rejected' && !recentlyRejected.has(candidature.id))
                                  )
                                  .map((candidature: any) => {
                                    const isRecentlyRejected = recentlyRejected.has(candidature.id);
                                    const isRejected = candidature.status === 'rejected' || isRecentlyRejected;

                                    return (
                                      <div
                                        key={candidature.id}
                                        className={`flex items-center justify-between p-4 rounded-lg transition-all duration-500 ${
                                          isRejected
                                            ? 'bg-red-100 dark:bg-red-900 border-2 border-red-500 shadow-lg animate-pulse'
                                            : 'bg-muted/50 hover:bg-muted border border-transparent'
                                        }`}
                                        style={isRejected ? {
                                          background: 'linear-gradient(45deg, #fee2e2, #fecaca)',
                                          borderColor: '#ef4444',
                                          boxShadow: '0 0 20px rgba(239, 68, 68, 0.3)'
                                        } : {}}
                                      >
                                        <div className="flex items-center gap-3">
                                          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-medium">
                                            {candidature.candidateName?.charAt(0) || 'C'}
                                          </div>
                                          <div>
                                            <div className="font-medium text-foreground">{candidature.candidateName}</div>
                                            <div className="text-sm text-muted-foreground">
                                              {candidature.experience} ans d'expérience • Note: {candidature.rating}/5
                                            </div>
                                          </div>
                                        </div>
                                        <div className="flex items-center gap-2">
                                          <Badge variant={
                                            candidature.status === 'pending' ? 'secondary' :
                                            candidature.status === 'accepted' ? 'default' :
                                            'destructive'
                                          }>
                                            {candidature.status === 'pending' ? 'En attente' :
                                             candidature.status === 'accepted' ? 'Accepté' : 'Rejeté'}
                                          </Badge>
                                          {candidature.status === 'pending' && !isRecentlyRejected && (
                                            <div className="flex gap-1">
                                              <Button
                                                size="sm"
                                                variant="default"
                                                onClick={() => handleAcceptCandidate(candidature)}
                                                className="h-8 px-3"
                                              >
                                                Accepter
                                              </Button>
                                              <Button
                                                size="sm"
                                                variant="outline"
                                                onClick={() => handleRejectCandidate(candidature)}
                                                className="h-8 px-3"
                                              >
                                                Rejeter
                                              </Button>
                                            </div>
                                          )}
                                          {isRecentlyRejected && (
                                            <div className="flex gap-1 animate-bounce">
                                              <Button
                                                size="sm"
                                                variant="destructive"
                                                onClick={() => handleUndoReject(candidature.id)}
                                                className="h-10 px-4 text-sm font-bold bg-red-600 hover:bg-red-700 border-2 border-red-800 shadow-lg"
                                                style={{
                                                  background: 'linear-gradient(45deg, #dc2626, #ef4444)',
                                                  boxShadow: '0 4px 15px rgba(220, 38, 38, 0.4)'
                                                }}
                                              >
                                                <Undo2 className="h-4 w-4 mr-2" />
                                                ANNULER LE REJET
                                              </Button>
                                            </div>
                                          )}
                                        </div>
                                      </div>
                                    );
                                  })}
                              </div>
                              {missionCandidates.length > 3 && (
                                <div className="text-center">
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => setActiveTab("candidates")}
                                    className="text-blue-600 hover:text-blue-700 dark:text-blue-400"
                                  >
                                    Voir {missionCandidates.length - 3} candidature(s) supplémentaire(s)
                                  </Button>
                                </div>
                              )}
                            </div>
                          ) : (
                            <div className="text-center py-6 border-2 border-dashed border-muted-foreground/25 rounded-lg">
                              <UserPlus className="h-8 w-8 text-muted-foreground/50 mx-auto mb-2" />
                              <p className="text-sm text-muted-foreground">Aucune candidature pour cette mission</p>
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    );
                  })
                )}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="templates">
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold">Templates de Missions</h2>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Nouveau Template
                </Button>
              </div>

              <div className="grid gap-4">
                {filteredTemplates.map((template) => (
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
                              {(template.skills && Array.isArray(template.skills) ? template.skills : []).map((skill: any, index: number) => (
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
                            <Button
                              variant="default"
                              size="sm"
                              onClick={() => handlePublishTemplate(template)}
                            >
                              Publier
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleEditTemplate(template)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleDeleteTemplate(template)}
                            >
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

              {analyticsLoading || realtimeLoading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  {[...Array(8)].map((_, i) => (
                    <Card key={i} className="animate-pulse">
                      <CardContent className="p-6">
                        <div className="h-20 bg-muted rounded"></div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <>
                  {/* Métriques temps réel */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <Card>
                      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Taux de Réussite</CardTitle>
                        <TrendingUp className="h-4 w-4 text-green-500" />
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold">{((analyticsData as any)?.performance?.missionCompletionRate || 0).toFixed(1)}%</div>
                        <p className="text-xs text-muted-foreground">Missions complétées avec succès</p>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Taux de Conversion</CardTitle>
                        <Users className="h-4 w-4 text-blue-500" />
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold">{((analyticsData as any)?.recruitment?.conversionRate || 0).toFixed(1)}%</div>
                        <p className="text-xs text-muted-foreground">Candidatures acceptées</p>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Score Satisfaction</CardTitle>
                        <Star className="h-4 w-4 text-yellow-500" />
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold">{((analyticsData as any)?.performance?.clientSatisfactionScore || 0).toFixed(1)}/5</div>
                        <p className="text-xs text-muted-foreground">Note moyenne clients</p>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Revenus Mensuels</CardTitle>
                        <ArrowUp className="h-4 w-4 text-green-500" />
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold">{((analyticsData as any)?.financial?.totalRevenue || 0).toLocaleString()}€</div>
                        <p className="text-xs text-muted-foreground">+{((analyticsData as any)?.financial?.savingsVsAgency || 0).toFixed(1)}% vs agences</p>
                      </CardContent>
                    </Card>
                  </div>

                  {/* Alertes et notifications en temps réel */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center space-x-2">
                        <Bell className="h-5 w-5" />
                        <span>Alertes Intelligence Prédictive</span>
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {((realtimeMetrics as any)?.alerts || []).map((alert: any) => (
                          <div key={alert.id} className={`flex items-start space-x-3 p-3 rounded-lg ${
                            alert.priority === 'high' ? 'bg-red-50 border border-red-200' : 'bg-blue-50 border border-blue-200'
                          }`}>
                            <AlertTriangle className={`h-5 w-5 mt-0.5 ${
                              alert.priority === 'high' ? 'text-red-500' : 'text-blue-500'
                            }`} />
                            <div>
                              <p className="font-medium">{alert.message}</p>
                              <p className="text-sm text-muted-foreground">
                                {new Date(alert.timestamp).toLocaleString()}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>

                  {/* Analyse par spécialisation */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <Card>
                      <CardHeader>
                        <CardTitle>Performance par Spécialisation</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-4">
                          {((analyticsData as any)?.recruitment?.topSpecializations || []).map((spec: any) => (
                            <div key={spec.name} className="space-y-2">
                              <div className="flex justify-between items-center">
                                <span className="font-medium">{spec.name}</span>
                                <span className="text-sm text-muted-foreground">{spec.applications} candidatures</span>
                              </div>
                              <div className="w-full bg-muted rounded-full h-2">
                                <div
                                  className="bg-blue-500 h-2 rounded-full"
                                  style={{ width: `${spec.conversionRate}%` }}
                                ></div>
                              </div>
                              <div className="flex justify-between text-sm text-muted-foreground">
                                <span>Taux: {spec.conversionRate.toFixed(1)}%</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle>Prévisions IA - Prochain Mois</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-4">
                          <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                            <h4 className="font-semibold text-green-800">Demande Prévue</h4>
                            <p className="text-2xl font-bold text-green-700">
                              {((analyticsData as any)?.predictions?.nextMonthDemand?.estimatedMissions || 0)} missions
                            </p>
                            <p className="text-sm text-green-600">
                              Confiance: {((analyticsData as any)?.predictions?.nextMonthDemand?.confidenceLevel || 0).toFixed(1)}%
                            </p>
                          </div>

                          <div>
                            <h4 className="font-semibold mb-2">Actions Recommandées</h4>
                            <ul className="space-y-2">
                              {((analyticsData as any)?.predictions?.nextMonthDemand?.recommendedActions || []).map((action: string, index: number) => (
                                <li key={index} className="flex items-start space-x-2">
                                  <ArrowUp className="h-4 w-4 text-blue-500 mt-0.5" />
                                  <span className="text-sm">{action}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>

                  {/* Analyse financière détaillée */}
                  <Card>
                    <CardHeader>
                      <CardTitle>Évolution Financière - 6 Derniers Mois</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                        {((analyticsData as any)?.financial?.monthlyTrend || []).map((month: any) => (
                          <div key={month.month} className="text-center">
                            <div className="bg-blue-100 p-3 rounded-lg">
                              <p className="font-semibold text-blue-800">{month.month}</p>
                              <p className="text-lg font-bold">{month.revenue.toLocaleString()}€</p>
                              <p className="text-sm text-muted-foreground">{month.missions} missions</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>

                  {/* Métriques de matching hybride */}
                  <Card>
                    <CardHeader>
                      <CardTitle>Performance Matching Hybride</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <h4 className="font-semibold mb-4">Performance Algorithme</h4>
                          <div className="space-y-3">
                            <div className="flex justify-between">
                              <span>Score Global</span>
                              <span className="font-bold">{((analyticsData as any)?.matching?.algorithmPerformance || 0).toFixed(1)}%</span>
                            </div>
                            <div className="flex justify-between">
                              <span>Score Match Moyen</span>
                              <span className="font-bold">{((analyticsData as any)?.matching?.averageMatchScore || 0).toFixed(1)}/10</span>
                            </div>
                          </div>
                        </div>

                        <div>
                          <h4 className="font-semibold mb-4">Pondération Critères</h4>
                          <div className="space-y-2">
                            {Object.entries(((analyticsData as any)?.matching?.criteriaWeights || {})).map(([criteria, weight]) => (
                              <div key={criteria} className="flex justify-between items-center">
                                <span className="capitalize">{criteria}</span>
                                <div className="flex items-center space-x-2">
                                  <div className="w-20 bg-muted rounded-full h-2">
                                    <div
                                      className="bg-blue-500 h-2 rounded-full"
                                      style={{ width: `${(weight as number) * 3}%` }}
                                    ></div>
                                  </div>
                                  <span className="text-sm w-8">{weight as number}%</span>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>

                      <div className="mt-6">
                        <h4 className="font-semibold mb-2">Suggestions d'Amélioration</h4>
                        <ul className="space-y-2">
                          {((analyticsData as any)?.matching?.improvementSuggestions || []).map((suggestion: string, index: number) => (
                            <li key={index} className="flex items-start space-x-2">
                              <TrendingUp className="h-4 w-4 text-green-500 mt-0.5" />
                              <span className="text-sm">{suggestion}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </CardContent>
                  </Card>
                </>
              )}
            </div>
          </TabsContent>

          {/* Onglet Team - Gestion de l'équipe interne */}
          <TabsContent value="team">
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold">Gestion de l'Équipe</h2>
                <Button className="bg-blue-600 hover:bg-blue-700">
                  <UserPlus className="w-4 h-4 mr-2" />
                  Ajouter un membre
                </Button>
              </div>

              {/* Statistiques de l'équipe */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card className="border-l-4 border-l-blue-500">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm text-muted-foreground">Membres Actifs</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">12</div>
                    <p className="text-xs text-green-600">+2 ce mois</p>
                  </CardContent>
                </Card>
                <Card className="border-l-4 border-l-green-500">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm text-muted-foreground">Missions Gérées</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">47</div>
                    <p className="text-xs text-blue-600">Cette semaine</p>
                  </CardContent>
                </Card>
                <Card className="border-l-4 border-l-orange-500">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm text-muted-foreground">Taux Satisfaction</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">94%</div>
                    <p className="text-xs text-orange-600">Moyenne équipe</p>
                  </CardContent>
                </Card>
                <Card className="border-l-4 border-l-purple-500">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm text-muted-foreground">Formations</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">8</div>
                    <p className="text-xs text-purple-600">En cours</p>
                  </CardContent>
                </Card>
              </div>

              {/* Liste des membres de l'équipe */}
              <Card>
                <CardHeader>
                  <div className="flex justify-between items-center">
                    <CardTitle>Membres de l'Équipe</CardTitle>
                    <div className="flex space-x-2">
                      <Input placeholder="Rechercher un membre..." className="w-64" />
                      <Select defaultValue="all">
                        <SelectTrigger className="w-40">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">Tous les rôles</SelectItem>
                          <SelectItem value="admin">Administrateur</SelectItem>
                          <SelectItem value="manager">Manager</SelectItem>
                          <SelectItem value="recruiter">Recruteur</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {[
                      {
                        id: 1,
                        name: "Dr. Sarah Martinez",
                        role: "Directrice RH",
                        department: "Ressources Humaines",
                        email: "sarah.martinez@hopital.fr",
                        phone: "01 23 45 67 89",
                        status: "active",
                        lastActivity: "Il y a 5 min",
                        missionsManaged: 23,
                        satisfaction: 96
                      },
                      {
                        id: 2,
                        name: "Antoine Dubois",
                        role: "Manager Recrutement",
                        department: "Recrutement",
                        email: "antoine.dubois@hopital.fr",
                        phone: "01 23 45 67 90",
                        status: "active",
                        lastActivity: "Il y a 1h",
                        missionsManaged: 18,
                        satisfaction: 92
                      },
                      {
                        id: 3,
                        name: "Marie Leroy",
                        role: "Coordinatrice",
                        department: "Coordination",
                        email: "marie.leroy@hopital.fr",
                        phone: "01 23 45 67 91",
                        status: "busy",
                        lastActivity: "Il y a 30 min",
                        missionsManaged: 15,
                        satisfaction: 89
                      },
                      {
                        id: 4,
                        name: "Jean-Paul Moreau",
                        role: "Responsable Formation",
                        department: "Formation",
                        email: "jp.moreau@hopital.fr",
                        phone: "01 23 45 67 92",
                        status: "offline",
                        lastActivity: "Il y a 2h",
                        missionsManaged: 8,
                        satisfaction: 94
                      }
                    ].map((member) => (
                      <div key={member.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                        <div className="flex items-center space-x-4">
                          <div className="relative">
                            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold">
                              {member.name.split(' ').map(n => n[0]).join('')}
                            </div>
                            <div className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-white ${
                              member.status === 'active' ? 'bg-green-500' :
                              member.status === 'busy' ? 'bg-orange-500' : 'bg-gray-400'
                            }`}></div>
                          </div>
                          <div>
                            <h3 className="font-semibold">{member.name}</h3>
                            <p className="text-sm text-muted-foreground">{member.role} • {member.department}</p>
                            <div className="flex items-center space-x-4 mt-1">
                              <span className="text-xs text-muted-foreground">{member.email}</span>
                              <span className="text-xs text-muted-foreground">{member.phone}</span>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center space-x-6">
                          <div className="text-center">
                            <p className="text-sm font-medium">{member.missionsManaged}</p>
                            <p className="text-xs text-muted-foreground">Missions</p>
                          </div>
                          <div className="text-center">
                            <div className="flex items-center space-x-1">
                              <Star className="w-4 h-4 text-yellow-500 fill-current" />
                              <span className="text-sm font-medium">{member.satisfaction}%</span>
                            </div>
                            <p className="text-xs text-muted-foreground">Satisfaction</p>
                          </div>
                          <div className="text-center">
                            <p className="text-xs text-muted-foreground">{member.lastActivity}</p>
                          </div>
                          <div className="flex space-x-2">
                            <Button variant="outline" size="sm">
                              <MessageCircle className="w-4 h-4" />
                            </Button>
                            <Button variant="outline" size="sm">
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button variant="outline" size="sm">
                              <Settings className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Actions rapides pour l'équipe */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Actions Rapides</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <Button className="w-full justify-start" variant="outline">
                      <UserPlus className="w-4 h-4 mr-2" />
                      Inviter un nouveau membre
                    </Button>
                    <Button className="w-full justify-start" variant="outline">
                      <Calendar className="w-4 h-4 mr-2" />
                      Planifier une réunion équipe
                    </Button>
                    <Button className="w-full justify-start" variant="outline">
                      <Download className="w-4 h-4 mr-2" />
                      Exporter rapport équipe
                    </Button>
                    <Button className="w-full justify-start" variant="outline">
                      <Bell className="w-4 h-4 mr-2" />
                      Envoyer notification équipe
                    </Button>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Formations en Cours</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {[
                        { name: "Gestion de crise", participants: 5, progress: 75 },
                        { name: "Nouvelles réglementations", participants: 8, progress: 45 },
                        { name: "Communication client", participants: 3, progress: 90 }
                      ].map((training, index) => (
                        <div key={index} className="flex items-center justify-between">
                          <div>
                            <p className="font-medium">{training.name}</p>
                            <p className="text-sm text-muted-foreground">{training.participants} participants</p>
                          </div>
                          <div className="text-right">
                            <p className="text-sm font-medium">{training.progress}%</p>
                            <div className="w-20 bg-muted rounded-full h-2 mt-1">
                              <div
                                className="bg-blue-500 h-2 rounded-full"
                                style={{ width: `${training.progress}%` }}
                              ></div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
