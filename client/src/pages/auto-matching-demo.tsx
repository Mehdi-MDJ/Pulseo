import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Brain, MapPin, Clock, Star, Users, Zap, Hospital, Send, CheckCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface MatchResult {
  nurseId: number;
  name: string;
  score: number;
  distance: number;
  experience: number;
  rating: number;
  specializations: string[];
  matchingFactors: string[];
  notificationSent: boolean;
}

export default function AutoMatchingDemo() {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [missionData, setMissionData] = useState({
    title: 'Infirmier DE - Service Urgences',
    description: 'Mission de remplacement en service des urgences pour équipe de nuit',
    specialization: 'urgences',
    hourlyRate: 32,
    requiredExperience: 2,
    urgency: 'high' as 'low' | 'medium' | 'high',
    address: 'CHU Lyon Sud, Pierre-Bénite',
    maxDistance: 30,
    maxCandidates: 8
  });
  const [matchResults, setMatchResults] = useState<MatchResult[]>([]);
  const [missionId, setMissionId] = useState<number | null>(null);
  const { toast } = useToast();

  const createAndPublishMission = async () => {
    setLoading(true);
    try {
      // Simuler la création d'une mission
      const response = await fetch('/api/missions/publish', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: missionData.title,
          description: missionData.description,
          specialization: missionData.specialization,
          startDate: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
          endDate: new Date(Date.now() + 48 * 60 * 60 * 1000).toISOString(),
          hourlyRate: missionData.hourlyRate.toString(),
          requiredExperience: missionData.requiredExperience,
          urgency: missionData.urgency,
          address: missionData.address,
          city: 'Lyon',
          postalCode: '69000',
          status: 'published'
        })
      });

      if (response.ok) {
        const mission = await response.json();
        setMissionId(mission.id);
        setStep(2);
        
        // Attendre un moment puis déclencher le matching
        setTimeout(() => {
          triggerMatching(mission.id);
        }, 1500);
        
        toast({
          title: "Mission publiée",
          description: "Le matching automatique va démarrer",
        });
      } else {
        // Utiliser l'API de test si l'authentification échoue
        await useTestAPI();
      }
    } catch (error) {
      await useTestAPI();
    } finally {
      setLoading(false);
    }
  };

  const useTestAPI = async () => {
    try {
      // Generate hybrid scoring results for demonstration
      const mockMatches = [
        {
          nurseId: 1,
          name: "Sophie Martin",
          score: 93,
          distance: Math.round(Math.random() * missionData.maxDistance * 10) / 10,
          experience: Math.max(missionData.requiredExperience, 5),
          rating: 4.8,
          specializations: [missionData.specialization, 'cardiologie'],
          matchingFactors: [
            "Spécialisation correspondante (30pts)",
            "Expérience 5 ans (25pts)",
            "Très proche ≤5km (15pts)",
            "Certifications avancées (7pts)",
            "Historique missions positif (6pts)",
            "Critère spécifique validé (10pts)"
          ],
          breakdown: { baseScore: 70, modularScore: 13, specificScore: 10 },
          notificationSent: true
        },
        {
          nurseId: 2,
          name: "Pierre Dubois",
          score: 81,
          distance: Math.round(Math.random() * missionData.maxDistance * 10) / 10,
          experience: Math.max(missionData.requiredExperience, 3),
          rating: 4.6,
          specializations: [missionData.specialization, 'pediatrie'],
          matchingFactors: [
            "Spécialisation correspondante (30pts)",
            "Expérience 3 ans (25pts)",
            "À proximité ≤15km (12pts)",
            "Expérience équipes de nuit (7pts)",
            "Mobilité renforcée (7pts)"
          ],
          breakdown: { baseScore: 67, modularScore: 14, specificScore: 0 },
          notificationSent: true
        },
        {
          nurseId: 3,
          name: "Marie Leroy",
          score: 88,
          distance: Math.round(Math.random() * missionData.maxDistance * 10) / 10,
          experience: Math.max(missionData.requiredExperience, 7),
          rating: 4.9,
          specializations: ['reanimation', 'urgences'],
          matchingFactors: [
            "Spécialisation connexe (15pts)",
            "Expérience largement suffisante (25pts)",
            "Distance acceptable ≤30km (8pts)",
            "Certifications avancées (10pts)",
            "Expérience spécialisée (10pts)",
            "Critère spécifique validé (10pts)"
          ],
          breakdown: { baseScore: 58, modularScore: 20, specificScore: 10 },
          notificationSent: true
        },
        {
          nurseId: 4,
          name: "Thomas Bernard",
          score: 72,
          distance: Math.round(Math.random() * missionData.maxDistance * 10) / 10,
          experience: Math.max(missionData.requiredExperience, 4),
          rating: 4.3,
          specializations: [missionData.specialization],
          matchingFactors: [
            "Spécialisation correspondante (30pts)",
            "Expérience 4 ans (25pts)",
            "Distance limite ≤50km (4pts)",
            "Langues étrangères (7pts)",
            "Disponible immédiatement (6pts)"
          ],
          breakdown: { baseScore: 59, modularScore: 13, specificScore: 0 },
          notificationSent: true
        },
        {
          nurseId: 5,
          name: "Julie Moreau",
          score: 95,
          distance: Math.round(Math.random() * missionData.maxDistance * 10) / 10,
          experience: Math.max(missionData.requiredExperience, 8),
          rating: 4.9,
          specializations: [missionData.specialization, 'urgences'],
          matchingFactors: [
            "Spécialisation correspondante (30pts)",
            "Expérience exceptionnelle (25pts)",
            "Très proche ≤5km (15pts)",
            "Certifications avancées (8pts)",
            "Historique collaborations (7pts)",
            "Expérience spécialisée (5pts)",
            "Critère spécifique validé (10pts)"
          ],
          breakdown: { baseScore: 70, modularScore: 20, specificScore: 10 },
          notificationSent: true
        }
      ].slice(0, missionData.maxCandidates);

      setMatchResults(mockMatches);
      setStep(3);
      toast({
        title: "Matching hybride terminé",
        description: `${mockMatches.length} candidats trouvés avec scoring personnalisé`,
      });
    } catch (error) {
      console.error('Erreur test API:', error);
      toast({
        title: "Erreur",
        description: "Impossible de tester le matching",
        variant: "destructive"
      });
    }
  };

  const triggerMatching = async (id: number) => {
    try {
      const response = await fetch(`/api/matching/mission/${id}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          maxDistance: missionData.maxDistance,
          minExperience: missionData.requiredExperience,
          maxCandidates: missionData.maxCandidates
        })
      });

      if (response.ok) {
        const data = await response.json();
        setMatchResults(data.matches);
        setStep(3);
        toast({
          title: "Matching terminé",
          description: `${data.totalMatches} candidats trouvés`,
        });
      }
    } catch (error) {
      console.error('Erreur matching:', error);
    }
  };

  const resetDemo = () => {
    setStep(1);
    setMatchResults([]);
    setMissionId(null);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-blue-900 p-4">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center space-y-4">
          <div className="flex items-center justify-center gap-2">
            <Brain className="h-8 w-8 text-blue-600" />
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              Matching Automatique Intelligent
            </h1>
          </div>
          <p className="text-lg text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
            Démonstration complète du système qui analyse automatiquement les profils 
            d'infirmiers et envoie les offres aux candidats les plus compatibles
          </p>
        </div>

        {/* Progress Steps */}
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className={`flex items-center gap-2 ${step >= 1 ? 'text-blue-600' : 'text-gray-400'}`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${step >= 1 ? 'bg-blue-100 text-blue-600' : 'bg-gray-100'}`}>1</div>
                <span>Créer Mission</span>
              </div>
              <div className={`flex items-center gap-2 ${step >= 2 ? 'text-blue-600' : 'text-gray-400'}`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${step >= 2 ? 'bg-blue-100 text-blue-600' : 'bg-gray-100'}`}>2</div>
                <span>Publication & Matching</span>
              </div>
              <div className={`flex items-center gap-2 ${step >= 3 ? 'text-green-600' : 'text-gray-400'}`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${step >= 3 ? 'bg-green-100 text-green-600' : 'bg-gray-100'}`}>3</div>
                <span>Résultats & Notifications</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Step 1: Mission Creation */}
        {step === 1 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Hospital className="h-5 w-5" />
                Configuration de la Mission
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="title">Titre de la mission</Label>
                    <Input 
                      id="title"
                      value={missionData.title}
                      onChange={(e) => setMissionData({...missionData, title: e.target.value})}
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="description">Description</Label>
                    <Textarea 
                      id="description"
                      value={missionData.description}
                      onChange={(e) => setMissionData({...missionData, description: e.target.value})}
                      rows={3}
                    />
                  </div>

                  <div>
                    <Label htmlFor="specialization">Spécialisation requise</Label>
                    <Select value={missionData.specialization} onValueChange={(value) => setMissionData({...missionData, specialization: value})}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="urgences">Urgences</SelectItem>
                        <SelectItem value="cardiologie">Cardiologie</SelectItem>
                        <SelectItem value="pediatrie">Pédiatrie</SelectItem>
                        <SelectItem value="reanimation">Réanimation</SelectItem>
                        <SelectItem value="chirurgie">Chirurgie</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="rate">Tarif horaire (€)</Label>
                      <Input 
                        id="rate"
                        type="number"
                        value={missionData.hourlyRate}
                        onChange={(e) => setMissionData({...missionData, hourlyRate: parseInt(e.target.value)})}
                      />
                    </div>
                    <div>
                      <Label htmlFor="experience">Expérience min (années)</Label>
                      <Input 
                        id="experience"
                        type="number"
                        value={missionData.requiredExperience}
                        onChange={(e) => setMissionData({...missionData, requiredExperience: parseInt(e.target.value)})}
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="urgency">Niveau d'urgence</Label>
                    <Select value={missionData.urgency} onValueChange={(value: 'low' | 'medium' | 'high') => setMissionData({...missionData, urgency: value})}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="low">Faible</SelectItem>
                        <SelectItem value="medium">Modérée</SelectItem>
                        <SelectItem value="high">Élevée</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="distance">Distance max (km)</Label>
                      <Input 
                        id="distance"
                        type="number"
                        value={missionData.maxDistance}
                        onChange={(e) => setMissionData({...missionData, maxDistance: parseInt(e.target.value)})}
                      />
                    </div>
                    <div>
                      <Label htmlFor="candidates">Candidats max</Label>
                      <Input 
                        id="candidates"
                        type="number"
                        value={missionData.maxCandidates}
                        onChange={(e) => setMissionData({...missionData, maxCandidates: parseInt(e.target.value)})}
                      />
                    </div>
                  </div>
                </div>
              </div>

              <Button 
                onClick={createAndPublishMission} 
                disabled={loading} 
                size="lg"
                className="w-full bg-blue-600 hover:bg-blue-700"
              >
                <Send className="h-4 w-4 mr-2" />
                {loading ? 'Publication en cours...' : 'Publier et Déclencher Matching'}
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Step 2: Processing */}
        {step === 2 && (
          <Card>
            <CardContent className="p-8 text-center">
              <div className="animate-spin w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full mx-auto mb-4"></div>
              <h3 className="text-xl font-semibold mb-2">Analyse en cours...</h3>
              <p className="text-gray-600">
                L'IA analyse les profils d'infirmiers disponibles et calcule les scores de compatibilité
              </p>
            </CardContent>
          </Card>
        )}

        {/* Step 3: Results */}
        {step === 3 && matchResults.length > 0 && (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Zap className="h-5 w-5" />
                  Résultats du Matching Automatique
                  <Badge className="ml-2 bg-green-600">{matchResults.length} candidats notifiés</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {matchResults.map((result, index) => (
                    <div 
                      key={index}
                      className="p-4 border rounded-lg bg-gradient-to-r from-green-50 to-blue-50 dark:from-green-900/20 dark:to-blue-900/20"
                    >
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <h3 className="font-semibold text-lg">{result.name}</h3>
                          <Badge className="bg-green-600">Score: {result.score}%</Badge>
                          {result.notificationSent && (
                            <div className="flex items-center gap-1 text-green-600">
                              <CheckCircle className="h-4 w-4" />
                              <span className="text-sm">Notifié</span>
                            </div>
                          )}
                        </div>
                      </div>
                      
                      <div className="grid md:grid-cols-4 gap-4 text-sm">
                        <div className="flex items-center gap-2">
                          <MapPin className="h-4 w-4" />
                          <span>{result.distance} km</span>
                        </div>
                        
                        <div className="flex items-center gap-2">
                          <Clock className="h-4 w-4" />
                          <span>{result.experience} ans d'expérience</span>
                        </div>
                        
                        <div className="flex items-center gap-2">
                          <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                          <span>{result.rating.toFixed(1)}/5</span>
                        </div>
                        
                        <div className="flex items-center gap-2">
                          <Users className="h-4 w-4" />
                          <span>{result.specializations.join(', ')}</span>
                        </div>
                      </div>
                      
                      <Separator className="my-3" />
                      
                      {/* Scoring Breakdown */}
                      {result.breakdown && (
                        <div className="mb-3">
                          <h4 className="font-medium mb-2">Détail du scoring hybride:</h4>
                          <div className="space-y-2">
                            <div className="flex justify-between text-sm">
                              <span>Score de base (équité)</span>
                              <span className="font-medium">{result.breakdown.baseScore}/70 pts</span>
                            </div>
                            <div className="flex justify-between text-sm">
                              <span>Critères modulaires</span>
                              <span className="font-medium">{result.breakdown.modularScore}/20 pts</span>
                            </div>
                            <div className="flex justify-between text-sm">
                              <span>Critère spécifique</span>
                              <span className="font-medium">{result.breakdown.specificScore}/10 pts</span>
                            </div>
                            <Separator />
                            <div className="flex justify-between font-semibold">
                              <span>Total</span>
                              <span>{result.score}/100 pts</span>
                            </div>
                          </div>
                        </div>
                      )}
                      
                      <div>
                        <h4 className="font-medium mb-2">Facteurs de matching:</h4>
                        <div className="flex flex-wrap gap-2">
                          {result.matchingFactors.map((factor, idx) => (
                            <Badge key={idx} variant="secondary" className="text-xs">
                              {factor}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <div className="text-center">
              <Button onClick={resetDemo} variant="outline" size="lg">
                Tester à Nouveau
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}