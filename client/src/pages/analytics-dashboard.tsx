import { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { 
  TrendingUp, TrendingDown, Users, DollarSign, Clock, Target, 
  Download, BarChart3, PieChart, Calendar, AlertTriangle, CheckCircle 
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { useAuth } from '@/hooks/useAuth';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';

interface AnalyticsData {
  staffingForecast: {
    nextMonth: {
      expectedDemand: number;
      availableNurses: number;
      gap: number;
      urgentNeed: boolean;
    };
    nextQuarter: {
      trends: Array<{
        period: string;
        metric: string;
        value: number;
        change: number;
      }>;
      seasonalFactors: string[];
      riskAreas: string[];
    };
  };
  costAnalysis: {
    currentCosts: {
      averageHourlyRate: number;
      totalMonthlySpend: number;
      temporaryStaffPercentage: number;
    };
    savings: {
      potentialSavings: number;
      optimizationAreas: string[];
      roi: number;
    };
    benchmarking: {
      industryAverage: number;
      competitivePosition: 'above' | 'average' | 'below';
      recommendations: string[];
    };
  };
  performanceMetrics: {
    recruitment: {
      averageTimeToFill: number;
      successRate: number;
      nurseRetentionRate: number;
    };
    quality: {
      averageNurseRating: number;
      missionCompletionRate: number;
      establishmentSatisfaction: number;
    };
    efficiency: {
      autoMatchingSuccess: number;
      contractGenerationTime: number;
      adminTimeReduction: number;
    };
  };
  recommendations: Array<{
    category: 'cost' | 'quality' | 'efficiency' | 'risk';
    priority: 'high' | 'medium' | 'low';
    title: string;
    description: string;
    expectedImpact: string;
    implementationEffort: 'low' | 'medium' | 'high';
  }>;
}

export default function AnalyticsDashboard() {
  const [selectedTimeframe, setSelectedTimeframe] = useState('month');
  const { user } = useAuth();
  const { toast } = useToast();

  // Query pour les analytics de l'établissement
  const { data: analytics, isLoading } = useQuery<{ analytics: AnalyticsData }>({
    queryKey: ['/api/analytics/establishment'],
    retry: false,
  });

  // Query pour les métriques temps réel
  const { data: realtimeMetrics } = useQuery({
    queryKey: ['/api/analytics/metrics/realtime'],
    refetchInterval: 30000, // Rafraîchir toutes les 30 secondes
  });

  // Mutation pour prédiction de demande
  const predictDemandMutation = useMutation({
    mutationFn: async (weeks: number) => {
      return await apiRequest('/api/analytics/predict-demand', 'POST', { weeks });
    },
    onSuccess: (data) => {
      toast({
        title: "Prédictions générées",
        description: `Prévisions calculées pour les ${data.timeframe}`,
      });
    }
  });

  // Mutation pour export des données
  const exportMutation = useMutation({
    mutationFn: async (format: 'json' | 'csv') => {
      const response = await fetch(`/api/analytics/export/${format}`, {
        headers: { 'Authorization': `Bearer ${user?.token}` }
      });
      return { data: await response.text(), format };
    },
    onSuccess: ({ data, format }) => {
      const blob = new Blob([data], { 
        type: format === 'csv' ? 'text/csv' : 'application/json' 
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `analytics.${format}`;
      a.click();
      URL.revokeObjectURL(url);
    }
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-8">
        <div className="container mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <Card key={i} className="animate-pulse">
                <CardHeader className="space-y-2">
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                  <div className="h-8 bg-gray-200 rounded w-1/2"></div>
                </CardHeader>
              </Card>
            ))}
          </div>
        </div>
      </div>
    );
  }

  const data = analytics?.analytics;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto px-4 py-8">
        {/* En-tête */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              Analytics Prédictives
            </h1>
            <p className="text-gray-600 dark:text-gray-300">
              Insights intelligents pour optimiser votre gestion RH
            </p>
          </div>
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              onClick={() => exportMutation.mutate('csv')}
              disabled={exportMutation.isPending}
            >
              <Download className="h-4 w-4 mr-2" />
              Export CSV
            </Button>
            <Button 
              variant="outline"
              onClick={() => exportMutation.mutate('json')}
              disabled={exportMutation.isPending}
            >
              <Download className="h-4 w-4 mr-2" />
              Export JSON
            </Button>
          </div>
        </div>

        {/* Métriques temps réel */}
        {realtimeMetrics && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Utilisateurs actifs</p>
                    <p className="text-2xl font-bold">{realtimeMetrics.metrics.activeUsers}</p>
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
                    <p className="text-2xl font-bold">{realtimeMetrics.metrics.ongoingMissions}</p>
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
                    <p className="text-2xl font-bold">{realtimeMetrics.metrics.pendingApplications}</p>
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
                    <p className="text-2xl font-bold">{realtimeMetrics.metrics.avgResponseTime}s</p>
                  </div>
                  <TrendingUp className="h-8 w-8 text-purple-600" />
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {data && (
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
                      <Badge variant="secondary">{data.performanceMetrics.recruitment.averageTimeToFill} jours</Badge>
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm">Taux de succès</span>
                        <span className="text-sm font-medium">{data.performanceMetrics.recruitment.successRate.toFixed(1)}%</span>
                      </div>
                      <Progress value={data.performanceMetrics.recruitment.successRate} />
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm">Rétention infirmiers</span>
                        <span className="text-sm font-medium">{data.performanceMetrics.recruitment.nurseRetentionRate}%</span>
                      </div>
                      <Progress value={data.performanceMetrics.recruitment.nurseRetentionRate} />
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
                      <Badge>{data.performanceMetrics.quality.averageNurseRating}/5</Badge>
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm">Taux de completion</span>
                        <span className="text-sm font-medium">{data.performanceMetrics.quality.missionCompletionRate.toFixed(1)}%</span>
                      </div>
                      <Progress value={data.performanceMetrics.quality.missionCompletionRate} />
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm">Satisfaction établissement</span>
                        <span className="text-sm font-medium">{data.performanceMetrics.quality.establishmentSatisfaction}/5</span>
                      </div>
                      <Progress value={(data.performanceMetrics.quality.establishmentSatisfaction / 5) * 100} />
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
                        <span className="text-sm font-medium">{data.performanceMetrics.efficiency.autoMatchingSuccess}%</span>
                      </div>
                      <Progress value={data.performanceMetrics.efficiency.autoMatchingSuccess} />
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Génération contrats</span>
                      <Badge variant="secondary">{data.performanceMetrics.efficiency.contractGenerationTime}h</Badge>
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm">Réduction temps admin</span>
                        <span className="text-sm font-medium">{data.performanceMetrics.efficiency.adminTimeReduction}%</span>
                      </div>
                      <Progress value={data.performanceMetrics.efficiency.adminTimeReduction} />
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
                        <p className="text-2xl font-bold text-blue-600">{data.staffingForecast.nextMonth.expectedDemand}</p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">Missions prévues</p>
                      </div>
                      <div className="text-center p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                        <p className="text-2xl font-bold text-green-600">{data.staffingForecast.nextMonth.availableNurses}</p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">Infirmiers disponibles</p>
                      </div>
                    </div>
                    
                    {data.staffingForecast.nextMonth.gap > 0 && (
                      <div className="p-4 bg-orange-50 dark:bg-orange-900/20 rounded-lg border border-orange-200">
                        <div className="flex items-center gap-2 text-orange-700 dark:text-orange-300">
                          <AlertTriangle className="h-4 w-4" />
                          <span className="font-medium">Déficit prévu : {data.staffingForecast.nextMonth.gap} postes</span>
                        </div>
                        {data.staffingForecast.nextMonth.urgentNeed && (
                          <p className="text-sm text-orange-600 dark:text-orange-400 mt-1">
                            Recrutement urgent recommandé
                          </p>
                        )}
                      </div>
                    )}

                    <Button 
                      onClick={() => predictDemandMutation.mutate(8)}
                      disabled={predictDemandMutation.isPending}
                      className="w-full"
                    >
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
                        {data.staffingForecast.nextQuarter.seasonalFactors.map((factor, index) => (
                          <Badge key={index} variant="outline">{factor}</Badge>
                        ))}
                      </div>
                    </div>
                    
                    <div>
                      <h4 className="font-medium mb-2">Zones à risque</h4>
                      <div className="space-y-2">
                        {data.staffingForecast.nextQuarter.riskAreas.map((area, index) => (
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
                        <p className="text-2xl font-bold">{data.costAnalysis.currentCosts.averageHourlyRate.toFixed(0)}€</p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">Tarif horaire moyen</p>
                      </div>
                      <div className="text-center p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                        <p className="text-2xl font-bold">{data.costAnalysis.currentCosts.totalMonthlySpend.toFixed(0)}€</p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">Dépenses mensuelles</p>
                      </div>
                    </div>
                    
                    <div className="p-4 border rounded-lg">
                      <div className="flex justify-between items-center">
                        <span>Personnel temporaire</span>
                        <Badge variant={data.costAnalysis.currentCosts.temporaryStaffPercentage > 25 ? "destructive" : "secondary"}>
                          {data.costAnalysis.currentCosts.temporaryStaffPercentage}%
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
                        {data.costAnalysis.savings.potentialSavings.toFixed(0)}€
                      </p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Économies mensuelles possibles</p>
                    </div>
                    
                    <div className="space-y-2">
                      <p className="font-medium">ROI prévu : {data.costAnalysis.savings.roi}%</p>
                      <Progress value={data.costAnalysis.savings.roi} />
                    </div>
                    
                    <div>
                      <h4 className="font-medium mb-2">Axes d'optimisation</h4>
                      <div className="space-y-1">
                        {data.costAnalysis.savings.optimizationAreas.map((area, index) => (
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
                {data.recommendations.map((rec, index) => (
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
        )}
      </div>
    </div>
  );
}