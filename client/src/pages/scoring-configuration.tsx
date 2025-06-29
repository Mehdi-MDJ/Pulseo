import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';
import { Settings, Brain, Users, Target, CheckCircle, AlertCircle, Info } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const AVAILABLE_CRITERIA = {
  advanced_certifications: {
    name: "Certifications Avancées",
    description: "BLS, ACLS, PALS selon spécialité",
    icon: "🏆",
    impact: "Garantit expertise technique"
  },
  night_experience: {
    name: "Expérience Équipes de Nuit", 
    description: "Adaptation aux horaires nocturnes",
    icon: "🌙",
    impact: "Essentiel pour missions nocturnes"
  },
  languages: {
    name: "Langues Étrangères",
    description: "Communication patients internationaux",
    icon: "🌍",
    impact: "Améliore prise en charge multiculturelle"
  },
  enhanced_mobility: {
    name: "Mobilité Renforcée",
    description: "Véhicule personnel, flexibilité déplacements",
    icon: "🚗",
    impact: "Réactivité pour urgences"
  },
  specialized_experience: {
    name: "Expérience Spécialisée",
    description: "COVID, pédiatrie, gériatrie selon besoin",
    icon: "⚕️",
    impact: "Adaptation pathologies spécifiques"
  },
  mission_history: {
    name: "Historique Collaborations",
    description: "Missions réussies avec votre établissement",
    icon: "📈",
    impact: "Fiabilité et intégration prouvées"
  }
};

export default function ScoringConfiguration() {
  const [config, setConfig] = useState({
    customScoringEnabled: false,
    selectedCriteria: [] as string[],
    specificCriterion: "",
    specificCriterionWeight: 10
  });
  
  const [previewScores, setPreviewScores] = useState([
    { name: "Sophie Martin", baseScore: 65, modularScore: 18, specificScore: 10, total: 93 },
    { name: "Pierre Dubois", baseScore: 58, modularScore: 15, specificScore: 0, total: 73 },
    { name: "Marie Leroy", baseScore: 70, modularScore: 12, specificScore: 10, total: 92 }
  ]);
  
  const { toast } = useToast();

  const handleCriteriaToggle = (criterion: string) => {
    setConfig(prev => ({
      ...prev,
      selectedCriteria: prev.selectedCriteria.includes(criterion)
        ? prev.selectedCriteria.filter(c => c !== criterion)
        : [...prev.selectedCriteria, criterion]
    }));
  };

  const handleSave = () => {
    // Validation
    if (config.customScoringEnabled && config.selectedCriteria.length < 2) {
      toast({
        title: "Configuration invalide",
        description: "Minimum 2 critères modulaires requis",
        variant: "destructive"
      });
      return;
    }

    toast({
      title: "Configuration sauvegardée",
      description: "Votre système de scoring personnalisé est actif",
    });
  };

  const getScoreColor = (score: number) => {
    if (score >= 85) return "text-green-600";
    if (score >= 70) return "text-blue-600";
    if (score >= 60) return "text-orange-600";
    return "text-red-600";
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-blue-900 p-4">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center space-y-4">
          <div className="flex items-center justify-center gap-2">
            <Settings className="h-8 w-8 text-blue-600" />
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              Configuration du Scoring
            </h1>
          </div>
          <p className="text-lg text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
            Personnalisez les critères de matching pour attirer les profils les plus adaptés à vos besoins
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Configuration Panel */}
          <div className="space-y-6">
            {/* Base Score Info */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="h-5 w-5 text-green-600" />
                  Score de Base (70% - Obligatoire)
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <h4 className="font-medium text-green-900 mb-2">Critères d'équité garantis</h4>
                  <ul className="space-y-2 text-sm text-green-800">
                    <li className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4" />
                      Spécialisation (30 points)
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4" />
                      Expérience (25 points)
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4" />
                      Proximité géographique (15 points)
                    </li>
                  </ul>
                </div>
              </CardContent>
            </Card>

            {/* Custom Scoring Toggle */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Brain className="h-5 w-5 text-purple-600" />
                  Scoring Personnalisé (30%)
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium">Activer la personnalisation</h4>
                    <p className="text-sm text-gray-600">Ajoutez vos critères spécifiques</p>
                  </div>
                  <Switch
                    checked={config.customScoringEnabled}
                    onCheckedChange={(checked) => setConfig(prev => ({ ...prev, customScoringEnabled: checked }))}
                  />
                </div>

                {config.customScoringEnabled && (
                  <>
                    <Separator />
                    
                    {/* Modular Criteria Selection */}
                    <div>
                      <h4 className="font-medium mb-4">Critères Modulaires (20 points)</h4>
                      <p className="text-sm text-gray-600 mb-4">Choisissez 2 à 5 critères selon vos priorités</p>
                      
                      <div className="grid gap-4">
                        {Object.entries(AVAILABLE_CRITERIA).map(([key, criterion]) => (
                          <Card 
                            key={key}
                            className={`cursor-pointer transition-all ${
                              config.selectedCriteria.includes(key) 
                                ? 'border-blue-500 bg-blue-50' 
                                : 'hover:border-gray-300'
                            }`}
                            onClick={() => handleCriteriaToggle(key)}
                          >
                            <CardContent className="p-4">
                              <div className="flex items-start justify-between">
                                <div className="flex-1">
                                  <div className="flex items-center gap-2 mb-1">
                                    <span className="text-lg">{criterion.icon}</span>
                                    <h5 className="font-medium">{criterion.name}</h5>
                                    {config.selectedCriteria.includes(key) && (
                                      <CheckCircle className="h-4 w-4 text-blue-600" />
                                    )}
                                  </div>
                                  <p className="text-sm text-gray-600 mb-2">{criterion.description}</p>
                                  <Badge variant="outline" className="text-xs">
                                    Impact: {criterion.impact}
                                  </Badge>
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                      
                      <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                        <p className="text-sm text-blue-800">
                          <Info className="h-4 w-4 inline mr-1" />
                          Sélectionnés: {config.selectedCriteria.length}/5 critères
                          {config.selectedCriteria.length > 0 && (
                            <span className="block mt-1">
                              Points par critère: {Math.round(20 / config.selectedCriteria.length)}
                            </span>
                          )}
                        </p>
                      </div>
                    </div>

                    <Separator />

                    {/* Specific Criterion */}
                    <div>
                      <h4 className="font-medium mb-4">Critère Spécifique (jusqu'à 15 points)</h4>
                      <p className="text-sm text-gray-600 mb-4">Définissez un critère unique à votre établissement</p>
                      
                      <div className="space-y-4">
                        <div>
                          <label className="text-sm font-medium block mb-2">Description du critère</label>
                          <Textarea
                            placeholder="Ex: Expérience avec patients COVID, Certification en soins palliatifs..."
                            value={config.specificCriterion}
                            onChange={(e) => setConfig(prev => ({ ...prev, specificCriterion: e.target.value }))}
                            className="resize-none"
                          />
                        </div>
                        
                        <div>
                          <label className="text-sm font-medium block mb-2">
                            Poids du critère: {config.specificCriterionWeight} points
                          </label>
                          <Slider
                            value={[config.specificCriterionWeight]}
                            onValueChange={(value) => setConfig(prev => ({ ...prev, specificCriterionWeight: value[0] }))}
                            max={15}
                            min={5}
                            step={1}
                            className="w-full"
                          />
                          <div className="flex justify-between text-xs text-gray-500 mt-1">
                            <span>5 points</span>
                            <span>15 points</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>

            {/* Save Button */}
            <Button onClick={handleSave} size="lg" className="w-full">
              Sauvegarder la Configuration
            </Button>
          </div>

          {/* Preview Panel */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5 text-blue-600" />
                  Aperçu des Scores
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {previewScores.map((nurse, index) => (
                    <div key={index} className="border rounded-lg p-4">
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="font-medium">{nurse.name}</h4>
                        <div className={`text-2xl font-bold ${getScoreColor(nurse.total)}`}>
                          {nurse.total}%
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-sm">
                          <span>Score de base</span>
                          <span className="font-medium">{nurse.baseScore} pts</span>
                        </div>
                        
                        {config.customScoringEnabled && (
                          <>
                            <div className="flex items-center justify-between text-sm">
                              <span>Critères modulaires</span>
                              <span className="font-medium">{nurse.modularScore} pts</span>
                            </div>
                            
                            {config.specificCriterion && (
                              <div className="flex items-center justify-between text-sm">
                                <span>Critère spécifique</span>
                                <span className="font-medium">{nurse.specificScore} pts</span>
                              </div>
                            )}
                          </>
                        )}
                      </div>
                      
                      <div className="mt-3 flex items-center gap-2">
                        {nurse.total >= 60 ? (
                          <Badge className="bg-green-600 text-white">Qualifié</Badge>
                        ) : (
                          <Badge variant="destructive">Non qualifié</Badge>
                        )}
                        {nurse.total >= 85 && (
                          <Badge variant="outline">Excellent match</Badge>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Impact Summary */}
            <Card>
              <CardHeader>
                <CardTitle>Impact de votre Configuration</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4 text-center">
                  <div className="p-4 bg-green-50 rounded-lg">
                    <div className="text-2xl font-bold text-green-600">
                      {previewScores.filter(n => n.total >= 60).length}
                    </div>
                    <div className="text-sm text-green-800">Candidats qualifiés</div>
                  </div>
                  
                  <div className="p-4 bg-blue-50 rounded-lg">
                    <div className="text-2xl font-bold text-blue-600">
                      {previewScores.filter(n => n.total >= 85).length}
                    </div>
                    <div className="text-sm text-blue-800">Matches excellents</div>
                  </div>
                </div>
                
                <div className="p-4 bg-gray-50 rounded-lg">
                  <h5 className="font-medium mb-2">Recommandations</h5>
                  <ul className="text-sm space-y-1 text-gray-700">
                    {config.customScoringEnabled ? (
                      <>
                        <li>• Configuration personnalisée active</li>
                        <li>• {config.selectedCriteria.length} critères modulaires sélectionnés</li>
                        {config.specificCriterion && <li>• Critère spécifique défini</li>}
                      </>
                    ) : (
                      <li>• Utilisation du scoring standard (équitable pour tous)</li>
                    )}
                  </ul>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}