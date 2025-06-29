import { useState } from 'react';
import { 
  TrendingUp, TrendingDown, Users, DollarSign, Clock, Target, 
  Download, BarChart3, PieChart, Calendar, AlertTriangle, CheckCircle 
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Link } from 'wouter';

export default function AnalyticsDemo() {
  const [selectedTimeframe, setSelectedTimeframe] = useState('month');

  // Données de démonstration réalistes
  const demoData = {
    staffingForecast: {
      nextMonth: {
        expectedDemand: 85,
        availableNurses: 72,
        gap: 13,
        urgentNeed: true
      },
      nextQuarter: {
        trends: [
          { period: "Décembre", metric: "Demande", value: 95, change: 12 },
          { period: "Janvier", metric: "Demande", value: 78, change: -8 },
          { period: "Février", metric: "Demande", value: 88, change: 15 }
        ],
        seasonalFactors: ["Pic hivernal", "Congés de fin d'année", "Épidémie saisonnière"],
        riskAreas: ["Service réanimation", "Urgences pédiatriques", "Soins intensifs"]
      }
    },
    costAnalysis: {
      currentCosts: {
        averageHourlyRate: 27.5,
        totalMonthlySpend: 45820,
        temporaryStaffPercentage: 32
      },
      savings: {
        potentialSavings: 7850,
        roi: 23,
        optimizationAreas: [
          "Réduction du recours aux agences externes",
          "Optimisation des plannings avec l'IA",
          "Négociation groupée des tarifs",
          "Fidélisation des profils qualifiés"
        ]
      },
      benchmarking: {
        industryAverage: 29.2,
        competitivePosition: "above" as const,
        recommendations: [
          "Maintenir l'avantage tarifaire actuel",
          "Investir dans la formation continue",
          "Développer les partenariats long terme"
        ]
      }
    },
    performanceMetrics: {
      recruitment: {
        averageTimeToFill: 4.2,
        successRate: 87.3,
        nurseRetentionRate: 91
      },
      quality: {
        averageNurseRating: 4.6,
        missionCompletionRate: 96.8,
        establishmentSatisfaction: 4.4
      },
      efficiency: {
        autoMatchingSuccess: 84,
        contractGenerationTime: 2.1,
        adminTimeReduction: 67
      }
    },
    recommendations: [
      {
        category: 'cost' as const,
        priority: 'high' as const,
        title: 'Optimisation des coûts de recrutement',
        description: 'Réduire la dépendance aux agences externes en développant un vivier de talents qualifiés via NurseLink AI.',
        expectedImpact: 'Économies de 15-20% sur les coûts de personnel temporaire',
        implementationEffort: 'medium' as const
      },
      {
        category: 'efficiency' as const,
        priority: 'high' as const,
        title: 'Amélioration du matching automatique',
        description: 'Affiner les algorithmes d\'IA pour augmenter la précision des recommandations de 84% à 90%+.',
        expectedImpact: 'Réduction de 25% du temps de sélection',
        implementationEffort: 'low' as const
      },
      {
        category: 'quality' as const,
        priority: 'medium' as const,
        title: 'Programme de fidélisation infirmiers',
        description: 'Mettre en place un système de bonus et avantages pour les infirmiers les mieux notés.',
        expectedImpact: 'Augmentation de 15% de la rétention',
        implementationEffort: 'medium' as const
      },
      {
        category: 'risk' as const,
        priority: 'medium' as const,
        title: 'Anticipation des pics saisonniers',
        description: 'Utiliser les prévisions IA pour constituer des équipes de réserve avant les périodes critiques.',
        expectedImpact: 'Réduction de 40% des pénuries critiques',
        implementationEffort: 'high' as const
      }
    ]
  };

  const realtimeMetrics = {
    activeUsers: 247,
    ongoingMissions: 58,
    pendingApplications: 23,
    avgResponseTime: 1.2
  };

  const handleExport = (format: 'csv' | 'json') => {
    const dataToExport = format === 'json' ? 
      JSON.stringify(demoData, null, 2) :
      'Métrique,Valeur\nTaux de succès matching,84%\nTemps moyen recrutement,4.2 jours\nÉconomies potentielles,7850€';
    
    const blob = new Blob([dataToExport], { 
      type: format === 'csv' ? 'text/csv' : 'application/json' 
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `analytics-demo.${format}`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Navigation */}
      <nav className="bg-white dark:bg-gray-800 border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link href="/">
              <div className="flex items-center space-x-3 cursor-pointer">
                <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                  <BarChart3 className="w-4 h-4 text-white" />
                </div>
                <span className="font-semibold text-xl text-blue-600">NurseLink AI</span>
              </div>
            </Link>
            <div className="flex items-center space-x-4">
              <Link href="/assistant-demo">
                <Button variant="outline">Assistant IA Démo</Button>
              </Link>
              <Link href="/">
                <Button variant="ghost">Retour Accueil</Button>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      <div className="container mx-auto px-4 py-8">
        {/* En-tête */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              Analytics Prédictives - Démo
            </h1>
            <p className="text-gray-600 dark:text-gray-300">
              Découvrez les insights intelligents pour optimiser votre gestion RH
            </p>
          </div>
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              onClick={() => handleExport('csv')}
            >
              <Download className="h-4 w-4 mr-2" />
              Export CSV
            </Button>
            <Button 
              variant="outline"
              onClick={() => handleExport('json')}
            >
              <Download className="h-4 w-4 mr-2" />
              Export JSON
            </Button>
          </div>
        </div>

        {/* Métriques temps réel */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Utilisateurs actifs</p>
                  <p className="text-2xl font-bold">{realtimeMetrics.activeUsers}</p>
                </div>
                <Users className="h-8 w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Missions en cours</p>
                  <p className="text-2xl font-bold">{realtimeMetrics.ongoingMissions}</p>
                </div>
                <Target className="h-8 w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Candidatures en attente</p>
                  <p className="text-2xl font-bold">{realtimeMetrics.pendingApplications}</p>
                </div>
                <Clock className="h-8 w-8 text-orange-600" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Temps de réponse</p>
                  <p className="text-2xl font-bold">{realtimeMetrics.avgResponseTime}s</p>
                </div>
                <TrendingUp className="h-8 w-8 text-purple-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Vue d'ensemble</TabsTrigger>
            <TabsTrigger value="forecasting">Prévisions</TabsTrigger>
            <TabsTrigger value="costs">Analyse coûts</TabsTrigger>
            <TabsTrigger value="recommendations">Recommandations</TabsTrigger>
          </TabsList>

          {/* Vue d'ensemble */}
          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Performance de recrutement */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="h-5 w-5" />
                    Recrutement
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Temps moyen de recrutement</span>
                    <Badge variant="secondary">{demoData.performanceMetrics.recruitment.averageTimeToFill} jours</Badge>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm">Taux de succès</span>
                      <span className="text-sm font-medium">{demoData.performanceMetrics.recruitment.successRate}%</span>
                    </div>
                    <Progress value={demoData.performanceMetrics.recruitment.successRate} />
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm">Rétention infirmiers</span>
                      <span className="text-sm font-medium">{demoData.performanceMetrics.recruitment.nurseRetentionRate}%</span>
                    </div>
                    <Progress value={demoData.performanceMetrics.recruitment.nurseRetentionRate} />
                  </div>
                </CardContent>
              </Card>

              {/* Qualité */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CheckCircle className="h-5 w-5" />
                    Qualité
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Note moyenne infirmiers</span>
                    <Badge>{demoData.performanceMetrics.quality.averageNurseRating}/5</Badge>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm">Taux de completion</span>
                      <span className="text-sm font-medium">{demoData.performanceMetrics.quality.missionCompletionRate}%</span>
                    </div>
                    <Progress value={demoData.performanceMetrics.quality.missionCompletionRate} />
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm">Satisfaction établissement</span>
                      <span className="text-sm font-medium">{demoData.performanceMetrics.quality.establishmentSatisfaction}/5</span>
                    </div>
                    <Progress value={(demoData.performanceMetrics.quality.establishmentSatisfaction / 5) * 100} />
                  </div>
                </CardContent>
              </Card>

              {/* Efficacité */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5" />
                    Efficacité
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm">Matching automatique</span>
                      <span className="text-sm font-medium">{demoData.performanceMetrics.efficiency.autoMatchingSuccess}%</span>
                    </div>
                    <Progress value={demoData.performanceMetrics.efficiency.autoMatchingSuccess} />
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Génération contrats</span>
                    <Badge variant="secondary">{demoData.performanceMetrics.efficiency.contractGenerationTime}h</Badge>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm">Réduction temps admin</span>
                      <span className="text-sm font-medium">{demoData.performanceMetrics.efficiency.adminTimeReduction}%</span>
                    </div>
                    <Progress value={demoData.performanceMetrics.efficiency.adminTimeReduction} />
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Prévisions */}
          <TabsContent value="forecasting" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Calendar className="h-5 w-5" />
                    Prévisions mois prochain
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                      <p className="text-2xl font-bold text-blue-600">{demoData.staffingForecast.nextMonth.expectedDemand}</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Missions prévues</p>
                    </div>
                    <div className="text-center p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                      <p className="text-2xl font-bold text-green-600">{demoData.staffingForecast.nextMonth.availableNurses}</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Infirmiers disponibles</p>
                    </div>
                  </div>
                  
                  {demoData.staffingForecast.nextMonth.gap > 0 && (
                    <div className="p-4 bg-orange-50 dark:bg-orange-900/20 rounded-lg border border-orange-200">
                      <div className="flex items-center gap-2 text-orange-700 dark:text-orange-300">
                        <AlertTriangle className="h-4 w-4" />
                        <span className="font-medium">Déficit prévu : {demoData.staffingForecast.nextMonth.gap} postes</span>
                      </div>
                      {demoData.staffingForecast.nextMonth.urgentNeed && (
                        <p className="text-sm text-orange-600 dark:text-orange-400 mt-1">
                          Recrutement urgent recommandé
                        </p>
                      )}
                    </div>
                  )}

                  <Button className="w-full">
                    <BarChart3 className="h-4 w-4 mr-2" />
                    Générer prévisions 8 semaines
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Facteurs saisonniers</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <h4 className="font-medium mb-2">Tendances identifiées</h4>
                    <div className="space-y-2">
                      {demoData.staffingForecast.nextQuarter.seasonalFactors.map((factor, index) => (
                        <Badge key={index} variant="outline">{factor}</Badge>
                      ))}
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="font-medium mb-2">Zones à risque</h4>
                    <div className="space-y-2">
                      {demoData.staffingForecast.nextQuarter.riskAreas.map((area, index) => (
                        <div key={index} className="flex items-center gap-2">
                          <AlertTriangle className="h-4 w-4 text-red-500" />
                          <span className="text-sm">{area}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Analyse coûts */}
          <TabsContent value="costs" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <DollarSign className="h-5 w-5" />
                    Coûts actuels
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                      <p className="text-2xl font-bold">{demoData.costAnalysis.currentCosts.averageHourlyRate}€</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Tarif horaire moyen</p>
                    </div>
                    <div className="text-center p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                      <p className="text-2xl font-bold">{demoData.costAnalysis.currentCosts.totalMonthlySpend.toLocaleString()}€</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Dépenses mensuelles</p>
                    </div>
                  </div>
                  
                  <div className="p-4 border rounded-lg">
                    <div className="flex justify-between items-center">
                      <span>Personnel temporaire</span>
                      <Badge variant={demoData.costAnalysis.currentCosts.temporaryStaffPercentage > 25 ? "destructive" : "secondary"}>
                        {demoData.costAnalysis.currentCosts.temporaryStaffPercentage}%
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingDown className="h-5 w-5" />
                    Économies potentielles
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="text-center p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                    <p className="text-2xl font-bold text-green-600">
                      {demoData.costAnalysis.savings.potentialSavings.toLocaleString()}€
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Économies mensuelles possibles</p>
                  </div>
                  
                  <div className="space-y-2">
                    <p className="font-medium">ROI prévu : {demoData.costAnalysis.savings.roi}%</p>
                    <Progress value={demoData.costAnalysis.savings.roi} />
                  </div>
                  
                  <div>
                    <h4 className="font-medium mb-2">Axes d'optimisation</h4>
                    <div className="space-y-1">
                      {demoData.costAnalysis.savings.optimizationAreas.map((area, index) => (
                        <div key={index} className="text-sm p-2 bg-blue-50 dark:bg-blue-900/20 rounded">
                          {area}
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Recommandations */}
          <TabsContent value="recommendations" className="space-y-6">
            <div className="grid gap-4">
              {demoData.recommendations.map((rec, index) => (
                <Card key={index}>
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <Badge variant={rec.priority === 'high' ? 'destructive' : rec.priority === 'medium' ? 'default' : 'secondary'}>
                            {rec.priority === 'high' ? 'Priorité haute' : 
                             rec.priority === 'medium' ? 'Priorité moyenne' : 'Priorité basse'}
                          </Badge>
                          <Badge variant="outline">{rec.category}</Badge>
                        </div>
                        <h3 className="text-lg font-semibold mb-2">{rec.title}</h3>
                        <p className="text-gray-600 dark:text-gray-400 mb-3">{rec.description}</p>
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <span className="font-medium">Impact attendu :</span> {rec.expectedImpact}
                          </div>
                          <div>
                            <span className="font-medium">Effort d'implémentation :</span> 
                            <Badge variant="outline" className="ml-2">
                              {rec.implementationEffort === 'low' ? 'Faible' : 
                               rec.implementationEffort === 'medium' ? 'Moyen' : 'Élevé'}
                            </Badge>
                          </div>
                        </div>
                      </div>
                      <Button variant="outline" size="sm">
                        Implémenter
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}