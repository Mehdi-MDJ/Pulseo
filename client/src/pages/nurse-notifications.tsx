import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Bell, MapPin, Clock, Star, Euro, CheckCircle, X, Heart, Hospital, Calendar, User } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface MissionOffer {
  id: number;
  title: string;
  establishmentName: string;
  description: string;
  specialization: string;
  urgency: 'low' | 'medium' | 'high';
  hourlyRate: number;
  duration: string;
  shift: string;
  startDate: string;
  location: string;
  distance: number;
  matchScore: number;
  matchingFactors: string[];
  requirements: string[];
  notificationTime: string;
  status: 'new' | 'viewed' | 'applied' | 'declined';
}

export default function NurseNotifications() {
  const [offers, setOffers] = useState<MissionOffer[]>([]);
  const [selectedOffer, setSelectedOffer] = useState<MissionOffer | null>(null);
  const [filter, setFilter] = useState<'all' | 'new' | 'high_match'>('all');
  const { toast } = useToast();

  useEffect(() => {
    loadOffers();
  }, []);

  const loadOffers = () => {
    // Simulation des offres reçues via le système de matching
    const mockOffers: MissionOffer[] = [
      {
        id: 909,
        title: "Infirmier DE - Service Urgences",
        establishmentName: "CHU Lyon Sud",
        description: "Mission de remplacement en service des urgences pour équipe de nuit. Recherche infirmier expérimenté pour gérer les cas d'urgence.",
        specialization: "urgences",
        urgency: "high",
        hourlyRate: 32,
        duration: "12h",
        shift: "nuit",
        startDate: "2025-06-12T19:00:00",
        location: "Lyon, 69310 Pierre-Bénite",
        distance: 2.3,
        matchScore: 92,
        matchingFactors: ["Spécialisation correspondante", "Expérience suffisante", "Note excellente"],
        requirements: ["Diplôme IDE", "2 ans d'expérience minimum", "Formation aux urgences"],
        notificationTime: "Il y a 5 minutes",
        status: "new"
      },
      {
        id: 847,
        title: "Infirmier DE - Cardiologie",
        establishmentName: "Clinique Saint-Joseph",
        description: "Remplacement en service de cardiologie pour congé maladie. Équipe dynamique et bienveillante.",
        specialization: "cardiologie",
        urgency: "medium",
        hourlyRate: 28,
        duration: "8h",
        shift: "jour",
        startDate: "2025-06-13T07:00:00",
        location: "Lyon, 69008",
        distance: 5.1,
        matchScore: 87,
        matchingFactors: ["Spécialisation correspondante", "Certification BLS", "À proximité"],
        requirements: ["Diplôme IDE", "Formation cardiologie", "Aptitude au travail en équipe"],
        notificationTime: "Il y a 15 minutes",
        status: "new"
      },
      {
        id: 756,
        title: "Infirmier DE - Réanimation",
        establishmentName: "Hôpital Édouard Herriot",
        description: "Mission en réanimation médicale, patients en soins intensifs. Formation complémentaire assurée si nécessaire.",
        specialization: "reanimation",
        urgency: "high",
        hourlyRate: 35,
        duration: "12h",
        shift: "jour",
        startDate: "2025-06-14T07:00:00",
        location: "Lyon, 69003",
        distance: 3.7,
        matchScore: 84,
        matchingFactors: ["Expérience élevée", "Note excellente", "Certifications multiples"],
        requirements: ["Diplôme IDE", "Expérience réanimation", "Formation aux soins intensifs"],
        notificationTime: "Il y a 1 heure",
        status: "viewed"
      },
      {
        id: 623,
        title: "Infirmier DE - Pédiatrie",
        establishmentName: "Hôpital Femme Mère Enfant",
        description: "Service pédiatrie générale, enfants de 0 à 18 ans. Ambiance familiale et équipe soudée.",
        specialization: "pediatrie",
        urgency: "low",
        hourlyRate: 26,
        duration: "10h",
        shift: "matin",
        startDate: "2025-06-15T07:00:00",
        location: "Bron, 69500",
        distance: 8.2,
        matchScore: 76,
        matchingFactors: ["Disponible immédiatement", "Bonne évaluation"],
        requirements: ["Diplôme IDE", "Expérience pédiatrique appréciée", "Patience avec enfants"],
        notificationTime: "Il y a 2 heures",
        status: "viewed"
      }
    ];

    setOffers(mockOffers);
  };

  const filteredOffers = offers.filter(offer => {
    if (filter === 'new') return offer.status === 'new';
    if (filter === 'high_match') return offer.matchScore >= 85;
    return true;
  });

  const handleApply = (offerId: number) => {
    setOffers(offers.map(offer => 
      offer.id === offerId 
        ? { ...offer, status: 'applied' as const }
        : offer
    ));
    
    toast({
      title: "Candidature envoyée",
      description: "Votre candidature a été transmise à l'établissement",
    });
  };

  const handleDecline = (offerId: number) => {
    setOffers(offers.map(offer => 
      offer.id === offerId 
        ? { ...offer, status: 'declined' as const }
        : offer
    ));
    
    toast({
      title: "Offre déclinée",
      description: "L'offre a été marquée comme non intéressante",
    });
  };

  const markAsViewed = (offer: MissionOffer) => {
    if (offer.status === 'new') {
      setOffers(offers.map(o => 
        o.id === offer.id 
          ? { ...o, status: 'viewed' as const }
          : o
      ));
    }
    setSelectedOffer(offer);
  };

  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case 'high': return 'bg-red-100 text-red-800 border-red-200';
      case 'medium': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'low': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'new': return 'bg-blue-100 text-blue-800';
      case 'applied': return 'bg-green-100 text-green-800';
      case 'declined': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const newOffersCount = offers.filter(o => o.status === 'new').length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-blue-900 p-4">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center space-y-4">
          <div className="flex items-center justify-center gap-2">
            <Bell className="h-8 w-8 text-blue-600" />
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              Mes Offres de Missions
            </h1>
            {newOffersCount > 0 && (
              <Badge className="bg-red-600 text-white">
                {newOffersCount} nouvelle{newOffersCount > 1 ? 's' : ''}
              </Badge>
            )}
          </div>
          <p className="text-lg text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
            Découvrez les missions qui correspondent parfaitement à votre profil, 
            sélectionnées automatiquement par notre algorithme intelligent
          </p>
        </div>

        {/* Filters */}
        <Card>
          <CardContent className="p-4">
            <div className="flex gap-4 items-center">
              <span className="font-medium">Filtrer par :</span>
              <div className="flex gap-2">
                <Button 
                  variant={filter === 'all' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setFilter('all')}
                >
                  Toutes ({offers.length})
                </Button>
                <Button 
                  variant={filter === 'new' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setFilter('new')}
                >
                  Nouvelles ({newOffersCount})
                </Button>
                <Button 
                  variant={filter === 'high_match' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setFilter('high_match')}
                >
                  Très compatible (≥85%)
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="grid lg:grid-cols-2 gap-6">
          {/* List of Offers */}
          <div className="space-y-4">
            <h2 className="text-xl font-semibold">Offres disponibles ({filteredOffers.length})</h2>
            
            {filteredOffers.map((offer) => (
              <Card 
                key={offer.id}
                className={`cursor-pointer transition-all hover:shadow-lg ${
                  selectedOffer?.id === offer.id ? 'ring-2 ring-blue-500' : ''
                } ${offer.status === 'new' ? 'border-l-4 border-l-blue-500' : ''}`}
                onClick={() => markAsViewed(offer)}
              >
                <CardContent className="p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold text-lg">{offer.title}</h3>
                        {offer.status === 'new' && (
                          <Badge className="bg-blue-600 text-white text-xs">Nouveau</Badge>
                        )}
                      </div>
                      <p className="text-gray-600 text-sm">{offer.establishmentName}</p>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-green-600">{offer.matchScore}%</div>
                      <div className="text-xs text-gray-500">Compatibilité</div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 text-sm mb-3">
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4" />
                      <span>{offer.distance} km</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Euro className="h-4 w-4" />
                      <span>{offer.hourlyRate}€/h</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4" />
                      <span>{offer.duration} - {offer.shift}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4" />
                      <span>{new Date(offer.startDate).toLocaleDateString()}</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex gap-2">
                      <Badge className={getUrgencyColor(offer.urgency)}>
                        {offer.urgency === 'high' ? 'Urgent' : offer.urgency === 'medium' ? 'Modéré' : 'Normal'}
                      </Badge>
                      <Badge variant="outline">{offer.specialization}</Badge>
                    </div>
                    <div className="text-xs text-gray-500">{offer.notificationTime}</div>
                  </div>

                  {offer.status !== 'new' && offer.status !== 'viewed' && (
                    <div className="mt-3 pt-3 border-t">
                      <Badge className={getStatusColor(offer.status)}>
                        {offer.status === 'applied' ? 'Candidature envoyée' : 'Déclinée'}
                      </Badge>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}

            {filteredOffers.length === 0 && (
              <Card>
                <CardContent className="p-8 text-center">
                  <Bell className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Aucune offre trouvée</h3>
                  <p className="text-gray-500">
                    {filter === 'new' ? 'Aucune nouvelle offre pour le moment' : 
                     filter === 'high_match' ? 'Aucune offre très compatible trouvée' :
                     'Aucune offre disponible actuellement'}
                  </p>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Offer Details */}
          <div className="lg:sticky lg:top-4">
            {selectedOffer ? (
              <Card>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-xl">{selectedOffer.title}</CardTitle>
                      <p className="text-gray-600">{selectedOffer.establishmentName}</p>
                    </div>
                    <div className="text-center">
                      <div className="text-3xl font-bold text-blue-600">{selectedOffer.matchScore}%</div>
                      <div className="text-sm text-gray-500">Match</div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div>
                    <h4 className="font-medium mb-2">Description</h4>
                    <p className="text-gray-700 leading-relaxed">{selectedOffer.description}</p>
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-3">
                      <div className="flex items-center gap-2">
                        <Hospital className="h-4 w-4 text-blue-600" />
                        <span className="font-medium">Établissement</span>
                      </div>
                      <p className="text-sm pl-6">{selectedOffer.establishmentName}</p>
                      
                      <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4 text-blue-600" />
                        <span className="font-medium">Localisation</span>
                      </div>
                      <p className="text-sm pl-6">{selectedOffer.location} ({selectedOffer.distance} km)</p>
                    </div>

                    <div className="space-y-3">
                      <div className="flex items-center gap-2">
                        <Euro className="h-4 w-4 text-green-600" />
                        <span className="font-medium">Rémunération</span>
                      </div>
                      <p className="text-sm pl-6">{selectedOffer.hourlyRate}€/heure</p>

                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-purple-600" />
                        <span className="font-medium">Horaires</span>
                      </div>
                      <p className="text-sm pl-6">{selectedOffer.shift} - {selectedOffer.duration}</p>
                    </div>
                  </div>

                  <Separator />

                  <div>
                    <h4 className="font-medium mb-3">Pourquoi cette mission vous correspond</h4>
                    <div className="flex flex-wrap gap-2">
                      {selectedOffer.matchingFactors.map((factor, index) => (
                        <Badge key={index} variant="secondary" className="text-xs">
                          <CheckCircle className="h-3 w-3 mr-1" />
                          {factor}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h4 className="font-medium mb-3">Exigences</h4>
                    <ul className="space-y-1">
                      {selectedOffer.requirements.map((req, index) => (
                        <li key={index} className="text-sm flex items-center gap-2">
                          <CheckCircle className="h-3 w-3 text-green-600" />
                          {req}
                        </li>
                      ))}
                    </ul>
                  </div>

                  {selectedOffer.status === 'new' || selectedOffer.status === 'viewed' ? (
                    <div className="flex gap-3 pt-4">
                      <Button 
                        onClick={() => handleApply(selectedOffer.id)}
                        className="flex-1 bg-green-600 hover:bg-green-700"
                      >
                        <CheckCircle className="h-4 w-4 mr-2" />
                        Postuler à cette mission
                      </Button>
                      <Button 
                        onClick={() => handleDecline(selectedOffer.id)}
                        variant="outline"
                        className="flex-1"
                      >
                        <X className="h-4 w-4 mr-2" />
                        Pas intéressé
                      </Button>
                    </div>
                  ) : (
                    <div className="pt-4">
                      <Badge className={getStatusColor(selectedOffer.status)} variant="secondary">
                        {selectedOffer.status === 'applied' ? 'Candidature envoyée' : 'Offre déclinée'}
                      </Badge>
                    </div>
                  )}
                </CardContent>
              </Card>
            ) : (
              <Card>
                <CardContent className="p-8 text-center">
                  <User className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Sélectionnez une offre</h3>
                  <p className="text-gray-500">
                    Cliquez sur une offre à gauche pour voir tous les détails
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}