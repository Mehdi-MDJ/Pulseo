import { useState } from 'react';
import { Calendar, MapPin, Clock, Star, DollarSign, Users, Briefcase, Home, User, Filter, Search, Heart, Hospital, Bell, TrendingUp, Brain, Plus, Settings, LogOut, Moon, Sun, Edit, ChevronRight, X, Calculator, Stethoscope, AlertTriangle, Copy, Check } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";

export default function MobileApp() {
  const [activeTab, setActiveTab] = useState('missions');
  const [showDoseCalculator, setShowDoseCalculator] = useState(false);
  const [doseMode, setDoseMode] = useState<'adult' | 'pediatric' | 'perfusion'>('adult');
  const [doseData, setDoseData] = useState({
    weight: 70,
    dosePerKg: 0,
    concentration: 0,
    frequency: 1
  });
  const [doseResult, setDoseResult] = useState('');
  const [doseWarning, setDoseWarning] = useState('');
  const [copied, setCopied] = useState(false);
  const [selectedMission, setSelectedMission] = useState<any>(null);
  const [showMissionDetails, setShowMissionDetails] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [appliedMissions, setAppliedMissions] = useState<any[]>([]);
  const [unavailableDates, setUnavailableDates] = useState<string[]>(['2025-01-18', '2025-01-25']);
  const [currentMonth, setCurrentMonth] = useState(new Date(2025, 0, 1)); // Janvier 2025
  const [showProfileEdit, setShowProfileEdit] = useState(false);
  const [showPreferences, setShowPreferences] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    specialties: [] as string[],
    establishmentTypes: [] as string[],
    maxDistance: 50,
    minRate: 20,
    urgencyOnly: false
  });

  // Missions matchées automatiquement pour cet infirmier
  const matchedMissions = [
    {
      id: 909,
      title: 'Infirmier DE - Service Urgences',
      hospital: 'CHU Lyon Sud',
      establishmentType: 'CHU',
      rate: 32,
      duration: '12h',
      distance: '2.3 km',
      distanceKm: 2.3,
      start: '2025-06-12T19:00:00',
      specialty: 'Urgences',
      shift: 'Nuit',
      urgency: 'urgent',
      matchScore: 92,
      isMatched: true,
      notificationTime: 'Il y a 5 min',
      status: 'new',
      description: 'Mission de remplacement en service des urgences pour équipe de nuit. Recherche infirmier expérimenté pour gérer les cas d\'urgence.',
      requirements: ['Diplôme IDE', '2 ans d\'expérience minimum', 'Formation aux urgences'],
      matchingFactors: ['Spécialisation correspondante', 'Expérience suffisante', 'Note excellente']
    },
    {
      id: 847,
      title: 'Infirmier DE - Cardiologie',
      hospital: 'Clinique Saint-Joseph',
      establishmentType: 'Clinique Privée',
      rate: 28,
      duration: '8h',
      distance: '5.1 km',
      distanceKm: 5.1,
      start: '2025-06-13T07:00:00',
      specialty: 'Cardiologie',
      shift: 'Jour',
      urgency: 'medium',
      matchScore: 87,
      isMatched: true,
      notificationTime: 'Il y a 15 min',
      status: 'new',
      description: 'Remplacement en service de cardiologie pour congé maladie. Équipe dynamique et bienveillante.',
      requirements: ['Diplôme IDE', 'Formation cardiologie', 'Aptitude au travail en équipe'],
      matchingFactors: ['Spécialisation correspondante', 'Certification BLS', 'À proximité']
    }
  ];

  // Données des missions disponibles avec différentes spécialisations et établissements
  const allMissions = [
    ...matchedMissions,
    {
      id: 1,
      title: 'Infirmier DE - Service Chirurgie',
      hospital: 'CHU Bordeaux',
      establishmentType: 'CHU',
      rate: 28,
      duration: '12h',
      distance: '2.3 km',
      distanceKm: 2.3,
      start: '2025-01-16T07:00:00',
      specialty: 'Chirurgie',
      shift: 'Jour',
      urgency: 'urgent',
      matchScore: 85,
      isMatched: false,
      status: 'viewed',
      description: 'Mission en service de chirurgie orthopédique pour remplacement congé maladie.',
      requirements: ['Diplôme IDE', '2 ans d\'expérience minimum', 'Formation en chirurgie']
    },
    {
      id: 2,
      title: 'Infirmier DE - Urgences',
      hospital: 'Hôpital Saint-André',
      establishmentType: 'Hôpital Public',
      rate: 32,
      duration: '10h',
      distance: '5.1 km',
      distanceKm: 5.1,
      start: '2025-01-17T19:00:00',
      specialty: 'Urgences',
      shift: 'Nuit',
      urgency: 'normal',
      matchScore: 87,
      isMatched: false,
      status: 'viewed',
      description: 'Poste aux urgences en équipe de nuit, expérience en soins critiques appréciée.',
      requirements: ['Diplôme IDE', 'Formation aux urgences', 'Aptitude travail de nuit']
    },
    {
      id: 3,
      title: 'Infirmier DE - Réanimation',
      hospital: 'Clinique Bordeaux Nord',
      establishmentType: 'Clinique Privée',
      rate: 35,
      duration: '12h',
      distance: '8.2 km',
      distanceKm: 8.2,
      start: '2025-01-18T07:00:00',
      specialty: 'Réanimation',
      shift: 'Jour',
      urgency: 'urgent',
      matchScore: 85,
      isMatched: false,
      status: 'viewed',
      description: 'Poste en réanimation pour patient COVID, équipement de protection fourni.',
      requirements: ['Diplôme IDE', 'Expérience réanimation', 'Formation COVID']
    },
    {
      id: 4,
      title: 'Infirmier DE - Pédiatrie',
      hospital: 'Hôpital Pellegrin',
      establishmentType: 'Hôpital Public',
      rate: 30,
      duration: '8h',
      distance: '3.7 km',
      distanceKm: 3.7,
      start: '2025-01-19T14:00:00',
      specialty: 'Pédiatrie',
      shift: 'Après-midi',
      urgency: 'normal',
      matchScore: 78,
      isMatched: false,
      status: 'viewed',
      description: 'Service pédiatrie générale, enfants de 0 à 18 ans.',
      requirements: ['Diplôme IDE', 'Formation pédiatrie', 'Patience avec enfants']
    },
    {
      id: 5,
      title: 'Infirmier DE - Gériatrie',
      hospital: 'EHPAD Les Jardins',
      establishmentType: 'EHPAD',
      rate: 26,
      duration: '12h',
      distance: '12.5 km',
      distanceKm: 12.5,
      start: '2025-01-20T07:00:00',
      specialty: 'Gériatrie',
      urgency: 'normal',
      matchScore: 72,
      description: 'Soins aux personnes âgées, administration médicaments.',
      requirements: ['Diplôme IDE', 'Expérience gériatrie', 'Empathie']
    },
    {
      id: 6,
      title: 'Infirmier DE - Psychiatrie',
      hospital: 'Centre Hospitalier Cadillac',
      establishmentType: 'Hôpital Spécialisé',
      rate: 29,
      duration: '10h',
      distance: '25.8 km',
      distanceKm: 25.8,
      start: '2025-01-21T08:00:00',
      specialty: 'Psychiatrie',
      urgency: 'normal',
      matchScore: 68,
      description: 'Service psychiatrie adulte, suivi thérapeutique.',
      requirements: ['Diplôme IDE', 'Formation psychiatrie', 'Stabilité émotionnelle']
    }
  ];

  // Listes des options de filtrage
  const specialtyOptions = ['Chirurgie', 'Urgences', 'Réanimation', 'Pédiatrie', 'Gériatrie', 'Psychiatrie', 'Cardiologie', 'Oncologie'];
  const establishmentTypeOptions = ['CHU', 'Hôpital Public', 'Clinique Privée', 'EHPAD', 'Hôpital Spécialisé', 'Centre de Soins'];

  // Fonction de filtrage des missions
  const getFilteredMissions = () => {
    let filtered = allMissions.filter(mission => 
      !appliedMissions.some(applied => applied.id === mission.id)
    );

    // Filtre par texte de recherche
    if (searchText.trim()) {
      const search = searchText.toLowerCase();
      filtered = filtered.filter(mission =>
        mission.title.toLowerCase().includes(search) ||
        mission.hospital.toLowerCase().includes(search) ||
        mission.specialty.toLowerCase().includes(search) ||
        mission.establishmentType.toLowerCase().includes(search)
      );
    }

    // Filtre par spécialités
    if (filters.specialties.length > 0) {
      filtered = filtered.filter(mission =>
        filters.specialties.includes(mission.specialty)
      );
    }

    // Filtre par types d'établissement
    if (filters.establishmentTypes.length > 0) {
      filtered = filtered.filter(mission =>
        filters.establishmentTypes.includes(mission.establishmentType)
      );
    }

    // Filtre par distance
    filtered = filtered.filter(mission => mission.distanceKm <= filters.maxDistance);

    // Filtre par taux minimum
    filtered = filtered.filter(mission => mission.rate >= filters.minRate);

    // Filtre urgence uniquement
    if (filters.urgencyOnly) {
      filtered = filtered.filter(mission => mission.urgency === 'urgent');
    }

    return filtered;
  };

  const availableMissions = getFilteredMissions();

  // Fonctions pour le calculateur de doses
  const calculateDose = () => {
    const { weight, dosePerKg, concentration, frequency } = doseData;
    if (!weight || !dosePerKg || !concentration) return;

    let result = '';
    let warning = '';

    if (doseMode === 'adult' || doseMode === 'pediatric') {
      const totalDose = weight * dosePerKg;
      const volume = totalDose / concentration;
      
      if (doseMode === 'pediatric') {
        const dailyDose = totalDose * frequency;
        result = `Dose unitaire: ${volume.toFixed(2)} mL (${totalDose.toFixed(2)} mg)\nDose quotidienne: ${dailyDose.toFixed(2)} mg`;
        if (weight < 3) warning = "⚠️ Poids très faible - dosage néonatal spécialisé requis";
      } else {
        result = `Volume à administrer: ${volume.toFixed(2)} mL (${totalDose.toFixed(2)} mg)`;
        if (volume > 20) warning = "⚠️ Volume important - vérifier la faisabilité";
      }
      
      if (totalDose > weight * 100) warning = "⚠️ Dose très élevée - vérification nécessaire";
    } else if (doseMode === 'perfusion') {
      const totalDose = weight * dosePerKg;
      const volumePerHour = totalDose / concentration;
      result = `Débit: ${volumePerHour.toFixed(2)} mL/h\nVolume total: ${volumePerHour.toFixed(2)} mL/h`;
      
      if (volumePerHour > 500) warning = "⚠️ Débit très élevé - vérifier pompe et voie d'accès";
      if (volumePerHour < 0.1) warning = "⚠️ Débit très faible - précision de la pompe critique";
    }

    setDoseResult(result);
    setDoseWarning(warning);
  };

  const copyDoseResult = async () => {
    try {
      await navigator.clipboard.writeText(doseResult);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Failed to copy:', error);
    }
  };

  const emergencyPresets = [
    { name: "Adrénaline", dose: 0.01, unit: "mg/kg", concentration: 1 },
    { name: "Atropine", dose: 0.02, unit: "mg/kg", concentration: 0.5 },
    { name: "Amiodarone", dose: 5, unit: "mg/kg", concentration: 50 },
    { name: "Furosémide", dose: 1, unit: "mg/kg", concentration: 10 },
  ];

  const applyPreset = (preset: typeof emergencyPresets[0]) => {
    setDoseData(prev => ({
      ...prev,
      dosePerKg: preset.dose,
      concentration: preset.concentration,
    }));
  };

  const applyToMission = (mission: any) => {
    if (confirm(`Postuler pour ${mission.title} à ${mission.hospital} ?\n\nTaux: ${mission.rate}€/h\nDurée: ${mission.duration}`)) {
      // Déplacer la mission vers les missions postulées
      setAppliedMissions(prev => [...prev, { ...mission, appliedDate: new Date().toISOString() }]);
      alert('Candidature envoyée avec succès ! Vous recevrez une notification dès validation.');
    }
  };

  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode);
    document.documentElement.classList.toggle('dark', !isDarkMode);
  };

  const openMissionDetails = (mission: any) => {
    setSelectedMission(mission);
    setShowMissionDetails(true);
  };

  const previousMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1));
  };

  const nextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1));
  };

  const formatMonth = (date: Date) => {
    return date.toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' });
  };

  const getDaysInMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  };

  const getFirstDayOfWeek = (date: Date) => {
    const firstDay = new Date(date.getFullYear(), date.getMonth(), 1).getDay();
    return firstDay === 0 ? 6 : firstDay - 1; // Convertir dimanche (0) en 6
  };

  return (
    <div className={`max-w-sm mx-auto min-h-screen bg-background relative ${isDarkMode ? 'dark' : ''}`}>
      {/* Header - Style web adapté */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white px-4 py-6 pt-12">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
              <Heart className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-xl font-bold">NurseLink AI</h1>
              <p className="text-blue-100 text-sm">Marie Dupont</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Button variant="ghost" size="sm" className="text-white hover:bg-white/10">
              <Bell className="w-5 h-5" />
            </Button>
            <Button 
              variant="ghost" 
              size="sm" 
              className="text-white hover:bg-white/10"
              onClick={() => setShowSettings(true)}
            >
              <Settings className="w-5 h-5" />
            </Button>
          </div>
        </div>

        {/* Stats Cards - Style web */}
        <div className="grid grid-cols-3 gap-3">
          <Card className="bg-white/10 border-white/20 text-white">
            <CardContent className="p-3 text-center">
              <DollarSign className="w-5 h-5 mx-auto mb-1" />
              <div className="text-lg font-bold">1,247€</div>
              <div className="text-xs opacity-80">Ce mois</div>
            </CardContent>
          </Card>
          <Card className="bg-white/10 border-white/20 text-white">
            <CardContent className="p-3 text-center">
              <Star className="w-5 h-5 mx-auto mb-1" />
              <div className="text-lg font-bold">4.9</div>
              <div className="text-xs opacity-80">Note</div>
            </CardContent>
          </Card>
          <Card className="bg-white/10 border-white/20 text-white">
            <CardContent className="p-3 text-center">
              <Briefcase className="w-5 h-5 mx-auto mb-1" />
              <div className="text-lg font-bold">12</div>
              <div className="text-xs opacity-80">Missions</div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Content Area */}
      <div className="flex-1 px-4 py-6 pb-20">
        
        {/* Missions Tab */}
        {activeTab === 'missions' && (
          <div className="space-y-6">
            {/* Section Title */}
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-foreground">Missions disponibles</h2>
              <Badge variant="secondary">{availableMissions.length}</Badge>
            </div>

            {/* Search Bar with Filters */}
            <div className="space-y-3">
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                  <input
                    type="text"
                    placeholder="Rechercher par nom, hôpital, spécialité..."
                    value={searchText}
                    onChange={(e) => setSearchText(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 bg-card rounded-lg border border-border focus:ring-2 focus:ring-primary focus:outline-none"
                  />
                </div>
                <Button 
                  variant="outline" 
                  size="icon"
                  onClick={() => setShowFilters(true)}
                  className={`h-12 w-12 ${
                    filters.specialties.length > 0 || 
                    filters.establishmentTypes.length > 0 || 
                    filters.urgencyOnly ? 'bg-primary text-primary-foreground' : ''
                  }`}
                >
                  <Filter className="w-4 h-4" />
                </Button>
              </div>
              
              {/* Active Filters Display */}
              {(filters.specialties.length > 0 || filters.establishmentTypes.length > 0 || filters.urgencyOnly) && (
                <div className="flex flex-wrap gap-2">
                  {filters.specialties.map((specialty) => (
                    <Badge key={specialty} variant="secondary" className="text-xs">
                      {specialty}
                      <Button
                        variant="ghost"
                        size="sm"
                        className="ml-1 h-auto p-0 text-muted-foreground hover:text-foreground"
                        onClick={() => setFilters(prev => ({
                          ...prev,
                          specialties: prev.specialties.filter(s => s !== specialty)
                        }))}
                      >
                        <X className="w-3 h-3" />
                      </Button>
                    </Badge>
                  ))}
                  {filters.establishmentTypes.map((type) => (
                    <Badge key={type} variant="secondary" className="text-xs">
                      {type}
                      <Button
                        variant="ghost"
                        size="sm"
                        className="ml-1 h-auto p-0 text-muted-foreground hover:text-foreground"
                        onClick={() => setFilters(prev => ({
                          ...prev,
                          establishmentTypes: prev.establishmentTypes.filter(t => t !== type)
                        }))}
                      >
                        <X className="w-3 h-3" />
                      </Button>
                    </Badge>
                  ))}
                  {filters.urgencyOnly && (
                    <Badge variant="destructive" className="text-xs">
                      Urgent uniquement
                      <Button
                        variant="ghost"
                        size="sm"
                        className="ml-1 h-auto p-0 text-white hover:text-gray-200"
                        onClick={() => setFilters(prev => ({ ...prev, urgencyOnly: false }))}
                      >
                        <X className="w-3 h-3" />
                      </Button>
                    </Badge>
                  )}
                </div>
              )}
            </div>

            {/* Map Section */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center text-lg">
                  <MapPin className="w-5 h-5 mr-2 text-primary" />
                  Carte des missions
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="bg-muted rounded-lg h-32 flex items-center justify-center">
                  <div className="text-center text-muted-foreground">
                    <MapPin className="w-8 h-8 mx-auto mb-2" />
                    <p className="text-sm">{availableMissions.length} missions dans votre zone</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Mission Cards */}
            <div className="space-y-4">
              {availableMissions.map((mission) => (
                <Card key={mission.id} className={`overflow-hidden ${mission.isMatched ? 'border-l-4 border-l-blue-500 bg-blue-50/50' : ''}`}>
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <CardTitle className="text-lg">{mission.title}</CardTitle>
                          {mission.isMatched && (
                            <div className="flex items-center gap-1">
                              <Brain className="w-4 h-4 text-blue-600" />
                              <Badge className="bg-blue-600 text-white text-xs">IA Match</Badge>
                            </div>
                          )}
                          {mission.status === 'new' && (
                            <Badge className="bg-red-600 text-white text-xs animate-pulse">Nouveau</Badge>
                          )}
                        </div>
                        <p className="text-muted-foreground">{mission.hospital}</p>
                        {mission.isMatched && (mission as any).notificationTime && (
                          <p className="text-xs text-blue-600 font-medium">{(mission as any).notificationTime}</p>
                        )}
                      </div>
                      <div className="flex flex-col items-end space-y-2">
                        <Badge variant={mission.urgency === 'urgent' ? 'destructive' : 'secondary'}>
                          {mission.urgency === 'urgent' ? 'Urgent' : 'Modéré'}
                        </Badge>
                        <Badge variant="outline" className={`${mission.matchScore >= 90 ? 'bg-green-50 text-green-700 border-green-200' : mission.matchScore >= 80 ? 'bg-blue-50 text-blue-700 border-blue-200' : 'bg-gray-50 text-gray-700 border-gray-200'}`}>
                          {mission.matchScore}% match
                        </Badge>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-3 text-sm">
                      <div className="flex items-center">
                        <DollarSign className="w-4 h-4 mr-1 text-green-600" />
                        <span className="font-semibold text-green-600">{mission.rate}€/h</span>
                      </div>
                      <div className="flex items-center text-muted-foreground">
                        <Clock className="w-4 h-4 mr-1" />
                        {mission.duration}
                      </div>
                      <div className="flex items-center text-muted-foreground">
                        <MapPin className="w-4 h-4 mr-1" />
                        {mission.distance}
                      </div>
                      <div className="flex items-center text-muted-foreground">
                        <Calendar className="w-4 h-4 mr-1" />
                        {new Date(mission.start).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })}
                      </div>
                    </div>
                    
                    <div className="bg-muted rounded-lg p-3">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">Spécialité</span>
                        <Badge variant="secondary">{mission.specialty}</Badge>
                      </div>
                    </div>

                    {/* Matching Factors for AI-matched missions */}
                    {mission.isMatched && (mission as any).matchingFactors && (
                      <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                        <div className="flex items-center gap-2 mb-2">
                          <Brain className="w-4 h-4 text-blue-600" />
                          <span className="text-sm font-medium text-blue-900">Pourquoi cette mission vous correspond</span>
                        </div>
                        <div className="flex flex-wrap gap-1">
                          {(mission as any).matchingFactors.map((factor: string, index: number) => (
                            <Badge key={index} variant="outline" className="text-xs bg-white text-blue-700 border-blue-300">
                              {factor}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}

                    <div className="flex gap-3">
                      <Button
                        variant="outline"
                        className="flex-1"
                        onClick={() => openMissionDetails(mission)}
                      >
                        Détails
                      </Button>
                      <Button
                        className="flex-1"
                        onClick={() => applyToMission(mission)}
                      >
                        Postuler
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Tools Tab - Calculateur de doses */}
        {activeTab === 'tools' && (
          <div className="space-y-6">
            {/* Section Title */}
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-foreground flex items-center">
                <Stethoscope className="w-7 h-7 mr-3 text-blue-600" />
                Outils Professionnels
              </h2>
            </div>

            {/* Dose Calculator */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Calculator className="w-5 h-5 mr-2 text-primary" />
                  Calculateur de Doses
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Mode Selection */}
                <div className="flex gap-2">
                  {[
                    { id: 'adult', label: 'Adulte' },
                    { id: 'pediatric', label: 'Pédiatrique' },
                    { id: 'perfusion', label: 'Perfusion' }
                  ].map((mode) => (
                    <Button
                      key={mode.id}
                      variant={doseMode === mode.id ? "default" : "outline"}
                      size="sm"
                      className="flex-1"
                      onClick={() => setDoseMode(mode.id as any)}
                    >
                      {mode.label}
                    </Button>
                  ))}
                </div>

                {/* Emergency Presets */}
                <div>
                  <label className="text-sm font-medium mb-2 block flex items-center">
                    <AlertTriangle className="w-4 h-4 mr-1 text-red-500" />
                    Protocoles d'urgence
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {emergencyPresets.map((preset) => (
                      <Button
                        key={preset.name}
                        variant="outline"
                        size="sm"
                        className="text-xs h-auto p-2"
                        onClick={() => applyPreset(preset)}
                      >
                        <div className="text-left">
                          <div className="font-medium">{preset.name}</div>
                          <div className="text-muted-foreground">{preset.dose} {preset.unit}</div>
                        </div>
                      </Button>
                    ))}
                  </div>
                </div>

                {/* Input Fields */}
                <div className="space-y-3">
                  <div>
                    <label className="text-sm font-medium mb-1 block">Poids (kg)</label>
                    <input
                      type="number"
                      value={doseData.weight}
                      onChange={(e) => setDoseData(prev => ({ ...prev, weight: parseFloat(e.target.value) || 0 }))}
                      className="w-full px-3 py-2 border rounded-lg text-sm"
                      placeholder="70"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-1 block">
                      Dose ({doseMode === 'perfusion' ? 'mg/kg/h' : 'mg/kg'})
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      value={doseData.dosePerKg}
                      onChange={(e) => setDoseData(prev => ({ ...prev, dosePerKg: parseFloat(e.target.value) || 0 }))}
                      className="w-full px-3 py-2 border rounded-lg text-sm"
                      placeholder="0.5"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-1 block">Concentration (mg/mL)</label>
                    <input
                      type="number"
                      step="0.1"
                      value={doseData.concentration}
                      onChange={(e) => setDoseData(prev => ({ ...prev, concentration: parseFloat(e.target.value) || 0 }))}
                      className="w-full px-3 py-2 border rounded-lg text-sm"
                      placeholder="10"
                    />
                  </div>
                  {doseMode === 'pediatric' && (
                    <div>
                      <label className="text-sm font-medium mb-1 block">Fréquence/jour</label>
                      <input
                        type="number"
                        value={doseData.frequency}
                        onChange={(e) => setDoseData(prev => ({ ...prev, frequency: parseInt(e.target.value) || 1 }))}
                        className="w-full px-3 py-2 border rounded-lg text-sm"
                        placeholder="3"
                      />
                    </div>
                  )}
                </div>

                {/* Calculate Button */}
                <Button onClick={calculateDose} className="w-full">
                  <Calculator className="w-4 h-4 mr-2" />
                  Calculer
                </Button>

                {/* Results */}
                {doseResult && (
                  <div className="border rounded-lg p-3 bg-green-50 dark:bg-green-950">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center">
                        <Check className="w-4 h-4 text-green-600 mr-2" />
                        <span className="text-sm font-medium text-green-800 dark:text-green-200">Résultat</span>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={copyDoseResult}
                        className="h-6 px-2"
                      >
                        {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                      </Button>
                    </div>
                    <pre className="text-xs font-mono whitespace-pre-wrap text-green-700 dark:text-green-300">
                      {doseResult}
                    </pre>
                    {doseWarning && (
                      <div className="mt-2 p-2 bg-amber-50 dark:bg-amber-950 rounded border border-amber-200 dark:border-amber-800">
                        <p className="text-xs text-amber-700 dark:text-amber-300">{doseWarning}</p>
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Other Tools (Coming Soon) */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center text-muted-foreground">
                  <Stethoscope className="w-5 h-5 mr-2" />
                  Autres Outils
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button variant="outline" className="w-full justify-start" disabled>
                  <Heart className="w-4 h-4 mr-3" />
                  <div className="text-left">
                    <div className="font-medium text-muted-foreground">Protocoles cliniques</div>
                    <div className="text-xs text-muted-foreground">Bientôt disponible</div>
                  </div>
                </Button>
                <Button variant="outline" className="w-full justify-start" disabled>
                  <Bell className="w-4 h-4 mr-3" />
                  <div className="text-left">
                    <div className="font-medium text-muted-foreground">Rappels & tâches</div>
                    <div className="text-xs text-muted-foreground">Bientôt disponible</div>
                  </div>
                </Button>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Planning Tab - Calendrier d'indisponibilités */}
        {activeTab === 'planning' && (
          <div className="space-y-6">
            {/* Section Title */}
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-foreground">Mes indisponibilités</h2>
              <Button variant="outline" size="sm">
                <Plus className="w-4 h-4 mr-2" />
                Ajouter
              </Button>
            </div>

            {/* Calendar Card */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center">
                    <Calendar className="w-5 h-5 mr-2 text-primary" />
                    {formatMonth(currentMonth)}
                  </CardTitle>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={previousMonth}>←</Button>
                    <Button variant="outline" size="sm" onClick={nextMonth}>→</Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {/* Mini calendrier */}
                <div className="grid grid-cols-7 gap-1 mb-4">
                  {['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'].map((day) => (
                    <div key={day} className="text-center text-xs font-medium text-muted-foreground p-2">
                      {day}
                    </div>
                  ))}
                  
                  {/* Cases vides pour aligner le premier jour du mois */}
                  {Array.from({ length: getFirstDayOfWeek(currentMonth) }, (_, i) => (
                    <div key={`empty-${i}`} className="h-8 w-8"></div>
                  ))}
                  
                  {/* Jours du mois */}
                  {Array.from({ length: getDaysInMonth(currentMonth) }, (_, i) => {
                    const date = i + 1;
                    const dateStr = `${currentMonth.getFullYear()}-${(currentMonth.getMonth() + 1).toString().padStart(2, '0')}-${date.toString().padStart(2, '0')}`;
                    const isUnavailable = unavailableDates.includes(dateStr);
                    const today = new Date();
                    const isToday = currentMonth.getFullYear() === today.getFullYear() && 
                                   currentMonth.getMonth() === today.getMonth() && 
                                   date === today.getDate();
                    
                    return (
                      <Button
                        key={date}
                        variant={isUnavailable ? "destructive" : isToday ? "default" : "ghost"}
                        size="sm"
                        className={`h-8 w-8 p-0 text-xs ${
                          isUnavailable ? 'bg-red-500 hover:bg-red-600' : 
                          isToday ? 'bg-primary' : ''
                        }`}
                        onClick={() => {
                          if (isUnavailable) {
                            setUnavailableDates(prev => prev.filter(d => d !== dateStr));
                          } else {
                            setUnavailableDates(prev => [...prev, dateStr]);
                          }
                        }}
                      >
                        {date}
                      </Button>
                    );
                  })}
                </div>

                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm">
                    <div className="w-3 h-3 bg-red-500 rounded"></div>
                    <span>Indisponible</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <div className="w-3 h-3 bg-primary rounded"></div>
                    <span>Aujourd'hui</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Indisponibilités à venir */}
            <Card>
              <CardHeader>
                <CardTitle>Prochaines indisponibilités</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {unavailableDates.map((date) => (
                  <div key={date} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                    <div>
                      <div className="font-medium">
                        {new Date(date).toLocaleDateString('fr-FR', { 
                          weekday: 'long', 
                          day: 'numeric', 
                          month: 'long' 
                        })}
                      </div>
                      <div className="text-sm text-muted-foreground">Toute la journée</div>
                    </div>
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => setUnavailableDates(prev => prev.filter(d => d !== date))}
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
                {unavailableDates.length === 0 && (
                  <div className="text-center text-muted-foreground py-4">
                    Aucune indisponibilité planifiée
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        )}

        {/* Profile Tab */}
        {activeTab === 'profile' && (
          <div className="space-y-6">
            {/* Profile Header */}
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center mb-6">
                  <div className="w-16 h-16 bg-blue-500 rounded-full flex items-center justify-center mr-4">
                    <span className="text-white text-xl font-bold">MD</span>
                  </div>
                  <div className="flex-1">
                    <h3 className="font-bold text-xl">Marie Dupont</h3>
                    <p className="text-muted-foreground">Infirmière DE</p>
                    <div className="flex items-center mt-1">
                      <Star className="w-4 h-4 text-yellow-500 mr-1 fill-current" />
                      <span className="text-sm font-medium">4.9 (127 avis)</span>
                    </div>
                  </div>
                  <Button variant="outline" size="sm">
                    <Edit className="w-4 h-4" />
                  </Button>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div className="text-center p-3 bg-muted rounded-lg">
                    <div className="text-lg font-bold text-primary">127</div>
                    <div className="text-xs text-muted-foreground">Missions</div>
                  </div>
                  <div className="text-center p-3 bg-muted rounded-lg">
                    <div className="text-lg font-bold text-green-600">4.9</div>
                    <div className="text-xs text-muted-foreground">Note</div>
                  </div>
                  <div className="text-center p-3 bg-muted rounded-lg">
                    <div className="text-lg font-bold text-purple-600">2,547€</div>
                    <div className="text-xs text-muted-foreground">Gains</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Missions postulées */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  Missions postulées
                  <Badge variant="secondary">{appliedMissions.length}</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {appliedMissions.length > 0 ? (
                  appliedMissions.map((mission) => (
                    <div key={mission.id} className="p-3 bg-muted rounded-lg">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <div className="font-medium">{mission.title}</div>
                          <div className="text-sm text-muted-foreground">{mission.hospital}</div>
                        </div>
                        <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">
                          En attente
                        </Badge>
                      </div>
                      <div className="text-xs text-muted-foreground">
                        Postulé le {new Date(mission.appliedDate).toLocaleDateString('fr-FR')}
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center text-muted-foreground py-4">
                    Aucune candidature en cours
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Profile Actions */}
            <Card>
              <CardContent className="p-4 space-y-3">
                <Button variant="ghost" className="w-full justify-between h-12">
                  <div className="flex items-center">
                    <User className="w-5 h-5 mr-3" />
                    <span>Profil personnel</span>
                  </div>
                  <ChevronRight className="w-4 h-4" />
                </Button>
                
                <Button variant="ghost" className="w-full justify-between h-12">
                  <div className="flex items-center">
                    <Briefcase className="w-5 h-5 mr-3" />
                    <span>Expériences</span>
                  </div>
                  <ChevronRight className="w-4 h-4" />
                </Button>

                <Button variant="ghost" className="w-full justify-between h-12">
                  <div className="flex items-center">
                    <Star className="w-5 h-5 mr-3" />
                    <span>Certifications</span>
                  </div>
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </CardContent>
            </Card>
          </div>
        )}
      </div>

      {/* Mission Details Modal */}
      {showMissionDetails && selectedMission && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-background rounded-lg w-full max-w-sm max-h-[80vh] overflow-hidden">
            <div className="flex items-center justify-between p-4 border-b">
              <h2 className="text-xl font-bold">{selectedMission.title}</h2>
              <Button variant="ghost" size="sm" onClick={() => setShowMissionDetails(false)}>
                <X className="w-4 h-4" />
              </Button>
            </div>
            
            <div className="p-4 space-y-4">
              <div className="bg-muted rounded-lg p-4">
                <h3 className="font-semibold mb-2">Détails de la mission</h3>
                <p className="text-muted-foreground">{selectedMission.description}</p>
              </div>
              
              <div className="bg-muted rounded-lg p-4">
                <h3 className="font-semibold mb-2">Exigences</h3>
                <ul className="space-y-1">
                  {selectedMission.requirements.map((req: string, index: number) => (
                    <li key={index} className="text-muted-foreground text-sm">• {req}</li>
                  ))}
                </ul>
              </div>
              
              <Button
                onClick={() => {
                  applyToMission(selectedMission);
                  setShowMissionDetails(false);
                }}
                className="w-full"
              >
                Postuler maintenant
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Settings Modal */}
      {showSettings && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-background rounded-lg w-full max-w-sm max-h-[80vh] overflow-hidden">
            <div className="flex items-center justify-between p-4 border-b">
              <h2 className="text-lg font-semibold">Paramètres</h2>
              <Button variant="ghost" size="sm" onClick={() => setShowSettings(false)}>
                <X className="w-4 h-4" />
              </Button>
            </div>
            
            <div className="p-4 space-y-4 max-h-96 overflow-y-auto">
              {/* Mode sombre/clair */}
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  {isDarkMode ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
                  <span className="font-medium">Mode sombre</span>
                </div>
                <Switch checked={isDarkMode} onCheckedChange={toggleDarkMode} />
              </div>
              
              {/* Modifier le profil */}
              <Button 
                variant="ghost" 
                className="w-full justify-start h-12"
                onClick={() => setShowProfileEdit(true)}
              >
                <Edit className="w-5 h-5 mr-3" />
                <span>Modifier mon profil</span>
              </Button>
              
              {/* Notifications */}
              <Button variant="ghost" className="w-full justify-start h-12">
                <Bell className="w-5 h-5 mr-3" />
                <span>Notifications</span>
              </Button>
              
              {/* Préférences */}
              <Button 
                variant="ghost" 
                className="w-full justify-start h-12"
                onClick={() => setShowPreferences(true)}
              >
                <Settings className="w-5 h-5 mr-3" />
                <span>Préférences de mission</span>
              </Button>
              
              {/* Aide */}
              <Button variant="ghost" className="w-full justify-start h-12">
                <Heart className="w-5 h-5 mr-3" />
                <span>Aide et support</span>
              </Button>
              
              {/* Déconnexion */}
              <Button variant="ghost" className="w-full justify-start h-12 text-destructive">
                <LogOut className="w-5 h-5 mr-3" />
                <span>Se déconnecter</span>
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Profile Edit Modal */}
      {showProfileEdit && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-background rounded-lg w-full max-w-sm max-h-[80vh] overflow-hidden">
            <div className="flex items-center justify-between p-4 border-b">
              <h2 className="text-lg font-semibold">Modifier le profil</h2>
              <Button variant="ghost" size="sm" onClick={() => setShowProfileEdit(false)}>
                <X className="w-4 h-4" />
              </Button>
            </div>
            
            <div className="p-4 space-y-4 max-h-96 overflow-y-auto">
              <div className="space-y-3">
                <div>
                  <label className="text-sm font-medium">Nom complet</label>
                  <input 
                    type="text" 
                    defaultValue="Marie Dupont"
                    className="w-full mt-1 px-3 py-2 border rounded-lg"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Téléphone</label>
                  <input 
                    type="tel" 
                    defaultValue="06 12 34 56 78"
                    className="w-full mt-1 px-3 py-2 border rounded-lg"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Adresse</label>
                  <input 
                    type="text" 
                    defaultValue="Bordeaux, France"
                    className="w-full mt-1 px-3 py-2 border rounded-lg"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Spécialisations</label>
                  <input 
                    type="text" 
                    defaultValue="Chirurgie, Urgences"
                    className="w-full mt-1 px-3 py-2 border rounded-lg"
                  />
                </div>
              </div>
              
              <div className="flex gap-3 pt-4">
                <Button variant="outline" className="flex-1" onClick={() => setShowProfileEdit(false)}>
                  Annuler
                </Button>
                <Button className="flex-1" onClick={() => {
                  setShowProfileEdit(false);
                  alert('Profil mis à jour avec succès !');
                }}>
                  Sauvegarder
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Mission Preferences Modal */}
      {showPreferences && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-background rounded-lg w-full max-w-sm max-h-[80vh] overflow-hidden">
            <div className="flex items-center justify-between p-4 border-b">
              <h2 className="text-lg font-semibold">Préférences de mission</h2>
              <Button variant="ghost" size="sm" onClick={() => setShowPreferences(false)}>
                <X className="w-4 h-4" />
              </Button>
            </div>
            
            <div className="p-4 space-y-4 max-h-96 overflow-y-auto">
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">Distance maximale</label>
                  <select className="w-full px-3 py-2 border rounded-lg">
                    <option>5 km</option>
                    <option>10 km</option>
                    <option>20 km</option>
                    <option>50 km</option>
                  </select>
                </div>
                
                <div>
                  <label className="text-sm font-medium mb-2 block">Taux horaire minimum</label>
                  <input 
                    type="number" 
                    defaultValue="25"
                    className="w-full px-3 py-2 border rounded-lg"
                    placeholder="€/heure"
                  />
                </div>
                
                <div>
                  <label className="text-sm font-medium mb-2 block">Créneaux préférés</label>
                  <div className="space-y-2">
                    <label className="flex items-center">
                      <input type="checkbox" defaultChecked className="mr-2" />
                      <span className="text-sm">Jour (7h-19h)</span>
                    </label>
                    <label className="flex items-center">
                      <input type="checkbox" className="mr-2" />
                      <span className="text-sm">Nuit (19h-7h)</span>
                    </label>
                    <label className="flex items-center">
                      <input type="checkbox" defaultChecked className="mr-2" />
                      <span className="text-sm">Week-end</span>
                    </label>
                  </div>
                </div>
                
                <div>
                  <label className="text-sm font-medium mb-2 block">Notifications</label>
                  <div className="space-y-2">
                    <label className="flex items-center justify-between">
                      <span className="text-sm">Nouvelles missions</span>
                      <Switch defaultChecked />
                    </label>
                    <label className="flex items-center justify-between">
                      <span className="text-sm">Réponses établissements</span>
                      <Switch defaultChecked />
                    </label>
                  </div>
                </div>
              </div>
              
              <div className="flex gap-3 pt-4">
                <Button variant="outline" className="flex-1" onClick={() => setShowPreferences(false)}>
                  Annuler
                </Button>
                <Button className="flex-1" onClick={() => {
                  setShowPreferences(false);
                  alert('Préférences sauvegardées !');
                }}>
                  Sauvegarder
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Advanced Filters Modal */}
      {showFilters && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-background rounded-lg w-full max-w-sm max-h-[80vh] overflow-hidden">
            <div className="flex items-center justify-between p-4 border-b">
              <h2 className="text-lg font-semibold">Filtres de recherche</h2>
              <Button variant="ghost" size="sm" onClick={() => setShowFilters(false)}>
                <X className="w-4 h-4" />
              </Button>
            </div>
            
            <div className="p-4 space-y-6 max-h-96 overflow-y-auto">
              {/* Distance */}
              <div>
                <label className="text-sm font-medium mb-3 block">Distance maximale: {filters.maxDistance} km</label>
                <input
                  type="range"
                  min="5"
                  max="100"
                  step="5"
                  value={filters.maxDistance}
                  onChange={(e) => setFilters(prev => ({ ...prev, maxDistance: parseInt(e.target.value) }))}
                  className="w-full h-2 bg-muted rounded-lg appearance-none cursor-pointer"
                />
                <div className="flex justify-between text-xs text-muted-foreground mt-1">
                  <span>5 km</span>
                  <span>100 km</span>
                </div>
              </div>

              {/* Taux horaire */}
              <div>
                <label className="text-sm font-medium mb-3 block">Taux minimum: {filters.minRate}€/h</label>
                <input
                  type="range"
                  min="20"
                  max="50"
                  step="2"
                  value={filters.minRate}
                  onChange={(e) => setFilters(prev => ({ ...prev, minRate: parseInt(e.target.value) }))}
                  className="w-full h-2 bg-muted rounded-lg appearance-none cursor-pointer"
                />
                <div className="flex justify-between text-xs text-muted-foreground mt-1">
                  <span>20€</span>
                  <span>50€</span>
                </div>
              </div>

              {/* Spécialisations */}
              <div>
                <label className="text-sm font-medium mb-3 block">Spécialisations</label>
                <div className="grid grid-cols-2 gap-2">
                  {specialtyOptions.map((specialty) => (
                    <label key={specialty} className="flex items-center space-x-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={filters.specialties.includes(specialty)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setFilters(prev => ({
                              ...prev,
                              specialties: [...prev.specialties, specialty]
                            }));
                          } else {
                            setFilters(prev => ({
                              ...prev,
                              specialties: prev.specialties.filter(s => s !== specialty)
                            }));
                          }
                        }}
                        className="rounded border-gray-300"
                      />
                      <span className="text-sm">{specialty}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Types d'établissement */}
              <div>
                <label className="text-sm font-medium mb-3 block">Types d'établissement</label>
                <div className="space-y-2">
                  {establishmentTypeOptions.map((type) => (
                    <label key={type} className="flex items-center space-x-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={filters.establishmentTypes.includes(type)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setFilters(prev => ({
                              ...prev,
                              establishmentTypes: [...prev.establishmentTypes, type]
                            }));
                          } else {
                            setFilters(prev => ({
                              ...prev,
                              establishmentTypes: prev.establishmentTypes.filter(t => t !== type)
                            }));
                          }
                        }}
                        className="rounded border-gray-300"
                      />
                      <span className="text-sm">{type}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Options avancées */}
              <div>
                <label className="text-sm font-medium mb-3 block">Options</label>
                <div className="space-y-2">
                  <label className="flex items-center justify-between cursor-pointer">
                    <span className="text-sm">Missions urgentes uniquement</span>
                    <Switch
                      checked={filters.urgencyOnly}
                      onCheckedChange={(checked) => setFilters(prev => ({ ...prev, urgencyOnly: checked }))}
                    />
                  </label>
                </div>
              </div>
            </div>

            <div className="flex gap-3 p-4 border-t">
              <Button 
                variant="outline" 
                className="flex-1"
                onClick={() => {
                  setFilters({
                    specialties: [],
                    establishmentTypes: [],
                    maxDistance: 50,
                    minRate: 20,
                    urgencyOnly: false
                  });
                }}
              >
                Réinitialiser
              </Button>
              <Button className="flex-1" onClick={() => setShowFilters(false)}>
                Appliquer ({availableMissions.length})
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Bottom Navigation */}
      <div className="fixed bottom-0 left-1/2 transform -translate-x-1/2 w-full max-w-sm bg-background/95 backdrop-blur-md border-t">
        <div className="flex justify-around py-2">
          {[
            { id: 'missions', icon: MapPin, label: 'Missions' },
            { id: 'tools', icon: Calculator, label: 'Outils' },
            { id: 'planning', icon: Calendar, label: 'Planning' },
            { id: 'profile', icon: User, label: 'Profil' }
          ].map((tab) => {
            const newMatchedCount = tab.id === 'missions' ? matchedMissions.filter(m => m.status === 'new').length : 0;
            
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`relative flex flex-col items-center py-3 px-4 rounded-2xl transition-all ${
                  activeTab === tab.id
                    ? 'bg-primary text-primary-foreground shadow-lg'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                <tab.icon className={`w-5 h-5 ${activeTab === tab.id ? 'mb-1' : 'mb-0'}`} />
                {activeTab === tab.id && (
                  <span className="text-xs font-medium">{tab.label}</span>
                )}
                {newMatchedCount > 0 && (
                  <div className="absolute -top-1 -right-1 bg-red-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center animate-pulse">
                    {newMatchedCount}
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}