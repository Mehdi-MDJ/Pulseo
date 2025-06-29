import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { Brain, Users, Target, Clock, MapPin, Star, Award, CheckCircle, XCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface MatchingResult {
  nurseId: string;
  nurseName: string;
  specializations: string[];
  experience: number;
  rating: number;
  distance: number;
  score: number;
  factors: string[];
  recommended: boolean;
}

interface TestScenario {
  mission: any;
  nurses: any[];
  matchingResults: MatchingResult[];
  notifications: any[];
  applications: any[];
}

export default function MatchingDemo() {
  const [scenario, setScenario] = useState<TestScenario | null>(null);
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(0);
  const { toast } = useToast();

  const createScenario = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/test/create-matching-scenario', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });
      
      if (!response.ok) throw new Error('Erreur création scénario');
      
      const data = await response.json();
      setStep(1);
      toast({
        title: "Scénario créé",
        description: `${data.data.nursesCount} infirmiers et 1 mission d'urgence`,
      });
      
      // Récupérer le statut complet
      await getScenarioStatus();
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible de créer le scénario",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const triggerMatching = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/test/trigger-ai-matching', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });
      
      if (!response.ok) throw new Error('Erreur matching');
      
      const data = await response.json();
      setStep(2);
      toast({
        title: "Matching terminé",
        description: `${data.topCandidates} candidats recommandés`,
      });
      
      await getScenarioStatus();
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible d'exécuter le matching",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const simulateResponses = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/test/simulate-nurse-responses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });
      
      if (!response.ok) throw new Error('Erreur simulation');
      
      setStep(3);
      toast({
        title: "Réponses simulées",
        description: "Les infirmiers ont répondu aux notifications",
      });
      
      await getScenarioStatus();
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible de simuler les réponses",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const getScenarioStatus = async () => {
    try {
      const response = await fetch('/api/test/matching-scenario-status');
      if (!response.ok) throw new Error('Erreur statut');
      
      const data = await response.json();
      if (data.exists) {
        setScenario(data);
      }
    } catch (error) {
      console.error('Erreur récupération statut:', error);
    }
  };

  const resetScenario = () => {
    setScenario(null);
    setStep(0);
    toast({
      title: "Scénario réinitialisé",
      description: "Vous pouvez créer un nouveau scénario",
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-blue-900 p-4">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center space-y-4">
          <div className="flex items-center justify-center gap-2">
            <Brain className="h-8 w-8 text-blue-600" />
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              Démonstration Matching IA
            </h1>
          </div>
          <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            Testez notre algorithme d'intelligence artificielle qui analyse et recommande 
            automatiquement les meilleurs candidats pour chaque mission
          </p>
        </div>

        {/* Steps Progress */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5" />
              Processus de Test
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between mb-4">
              <div className={`flex items-center gap-2 ${step >= 1 ? 'text-green-600' : 'text-gray-400'}`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${step >= 1 ? 'bg-green-100 text-green-600' : 'bg-gray-100'}`}>
                  1
                </div>
                <span>Créer scénario</span>
              </div>
              <div className={`flex items-center gap-2 ${step >= 2 ? 'text-green-600' : 'text-gray-400'}`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${step >= 2 ? 'bg-green-100 text-green-600' : 'bg-gray-100'}`}>
                  2
                </div>
                <span>Lancer matching IA</span>
              </div>
              <div className={`flex items-center gap-2 ${step >= 3 ? 'text-green-600' : 'text-gray-400'}`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${step >= 3 ? 'bg-green-100 text-green-600' : 'bg-gray-100'}`}>
                  3
                </div>
                <span>Réponses infirmiers</span>
              </div>
            </div>
            <Progress value={(step / 3) * 100} className="w-full" />
          </CardContent>
        </Card>

        {/* Actions */}
        <div className="flex gap-4 justify-center">
          {step === 0 && (
            <Button 
              onClick={createScenario} 
              disabled={loading} 
              size="lg"
              className="bg-blue-600 hover:bg-blue-700"
            >
              <Users className="h-4 w-4 mr-2" />
              Créer Scénario de Test
            </Button>
          )}
          
          {step === 1 && (
            <Button 
              onClick={triggerMatching} 
              disabled={loading} 
              size="lg"
              className="bg-green-600 hover:bg-green-700"
            >
              <Brain className="h-4 w-4 mr-2" />
              Lancer Matching IA
            </Button>
          )}
          
          {step === 2 && (
            <Button 
              onClick={simulateResponses} 
              disabled={loading} 
              size="lg"
              className="bg-purple-600 hover:bg-purple-700"
            >
              <Clock className="h-4 w-4 mr-2" />
              Simuler Réponses
            </Button>
          )}
          
          {step >= 1 && (
            <Button 
              onClick={resetScenario} 
              variant="outline" 
              size="lg"
            >
              Recommencer
            </Button>
          )}
        </div>

        {/* Mission Details */}
        {scenario?.mission && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5" />
                Mission d'Urgence
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <h3 className="font-semibold text-lg mb-2">{scenario.mission.title}</h3>
                  <p className="text-gray-600 dark:text-gray-300 mb-4">{scenario.mission.description}</p>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4" />
                      <span>{scenario.mission.location}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4" />
                      <span>{scenario.mission.shift} - {scenario.mission.duration}</span>
                    </div>
                  </div>
                </div>
                <div>
                  <h4 className="font-medium mb-2">Spécialisations requises:</h4>
                  <div className="flex flex-wrap gap-2 mb-4">
                    {scenario.mission.specializations?.map((spec: string) => (
                      <Badge key={spec} variant="secondary">{spec}</Badge>
                    ))}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-300">
                    <div>Tarif: <span className="font-medium">{scenario.mission.hourlyRate}€/h</span></div>
                    <div>Urgence: <Badge variant="destructive">{scenario.mission.urgency}</Badge></div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Matching Results */}
        {scenario?.matchingResults && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Brain className="h-5 w-5" />
                Résultats du Matching IA
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {scenario.matchingResults.map((result: MatchingResult) => (
                  <div 
                    key={result.nurseId} 
                    className={`p-4 rounded-lg border-2 ${
                      result.recommended 
                        ? 'border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-900/20' 
                        : 'border-gray-200 bg-gray-50 dark:border-gray-700 dark:bg-gray-800'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <h3 className="font-semibold text-lg">{result.nurseName}</h3>
                        {result.recommended && (
                          <Badge className="bg-green-600">Recommandé</Badge>
                        )}
                      </div>
                      <div className="text-right">
                        <div className="text-2xl font-bold text-blue-600">{result.score}%</div>
                        <div className="text-sm text-gray-500">Score de compatibilité</div>
                      </div>
                    </div>
                    
                    <Progress value={result.score} className="mb-3" />
                    
                    <div className="grid md:grid-cols-3 gap-4 text-sm">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <Award className="h-4 w-4" />
                          <span className="font-medium">Spécialisations</span>
                        </div>
                        <div className="flex flex-wrap gap-1">
                          {result.specializations.map((spec: string) => (
                            <Badge key={spec} variant="outline" className="text-xs">{spec}</Badge>
                          ))}
                        </div>
                      </div>
                      
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <Star className="h-4 w-4" />
                          <span className="font-medium">Profil</span>
                        </div>
                        <div className="space-y-1">
                          <div>{result.experience} ans d'expérience</div>
                          <div className="flex items-center gap-1">
                            <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                            <span>{result.rating}/5</span>
                          </div>
                        </div>
                      </div>
                      
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <MapPin className="h-4 w-4" />
                          <span className="font-medium">Distance</span>
                        </div>
                        <div>{result.distance} km</div>
                      </div>
                    </div>
                    
                    <Separator className="my-3" />
                    
                    <div>
                      <h4 className="font-medium mb-2">Facteurs de matching:</h4>
                      <div className="flex flex-wrap gap-2">
                        {result.factors.map((factor: string, index: number) => (
                          <Badge key={index} variant="secondary" className="text-xs">
                            <CheckCircle className="h-3 w-3 mr-1" />
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
        )}

        {/* Applications Results */}
        {scenario?.applications && scenario.applications.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Réponses des Infirmiers
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {scenario.applications.map((app: any, index: number) => (
                  <div 
                    key={index}
                    className={`p-4 rounded-lg border ${
                      app.status === 'accepted' 
                        ? 'border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-900/20'
                        : 'border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-900/20'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-medium">{app.nurseName}</h3>
                      {app.status === 'accepted' ? (
                        <CheckCircle className="h-5 w-5 text-green-600" />
                      ) : (
                        <XCircle className="h-5 w-5 text-red-600" />
                      )}
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-300">
                      <div>Statut: <span className={`font-medium ${
                        app.status === 'accepted' ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {app.status === 'accepted' ? 'Accepté' : 'Refusé'}
                      </span></div>
                      <div>Temps de réponse: {app.responseTime} min</div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}