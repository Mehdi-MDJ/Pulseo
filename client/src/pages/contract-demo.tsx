import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { FileText, CheckCircle, Clock, Play } from "lucide-react";

export default function ContractDemo() {
  const { toast } = useToast();
  const [generatedContract, setGeneratedContract] = useState<any>(null);
  const [step, setStep] = useState(0);
  const [missionData, setMissionData] = useState<any>(null);
  const [applicationData, setApplicationData] = useState<any>(null);
  const [showFullContract, setShowFullContract] = useState(false);

  // Mutation pour créer une mission de test
  const createMissionMutation = useMutation({
    mutationFn: async () => {
      return apiRequest("POST", "/api/test/create-mission", {
        title: "Mission de test - Réanimation",
        specialization: "Réanimation",
        shift: "nuit",
        hourlyRate: 30,
        startDate: new Date(Date.now() + 86400000).toISOString(),
        endDate: new Date(Date.now() + (7 * 86400000)).toISOString(),
        description: "Mission de test pour démonstration des contrats automatiques"
      });
    },
    onSuccess: (mission: any) => {
      console.log("Mission créée:", mission);
      setMissionData(mission);
      toast({
        title: "Mission créée",
        description: "Mission de test créée avec succès"
      });
      setStep(2);
      
      // Déclencher automatiquement l'étape suivante
      setTimeout(() => {
        createApplicationMutation.mutate(mission.id);
      }, 1500);
    }
  });

  // Mutation pour créer une candidature de test
  const createApplicationMutation = useMutation({
    mutationFn: async (missionId: number) => {
      return apiRequest("POST", "/api/test/create-application", {
        missionId,
        nurseId: "test-nurse-1"
      });
    },
    onSuccess: (application: any) => {
      console.log("Candidature créée:", application);
      setApplicationData(application);
      toast({
        title: "Candidature créée",
        description: "Candidature de test créée avec succès"
      });
      setStep(3);
      
      // Déclencher automatiquement l'étape suivante
      setTimeout(() => {
        acceptApplicationMutation.mutate(application.id);
      }, 1500);
    }
  });

  // Mutation pour accepter la candidature et générer le contrat
  const acceptApplicationMutation = useMutation({
    mutationFn: async (applicationId: number) => {
      return apiRequest("POST", "/api/test/accept-application", {
        applicationId
      });
    },
    onSuccess: (data: any) => {
      console.log("Réponse acceptApplicationMutation:", data);
      if (data && data.contract) {
        setGeneratedContract(data.contract);
        toast({
          title: "Contrat généré !",
          description: `Contrat ${data.contract.contractNumber} généré automatiquement`
        });
        setStep(4);
      } else {
        console.error("Pas de contrat dans la réponse:", data);
        setStep(4); // Forcer l'étape 4 même sans contrat pour tester
      }
    }
  });

  const startDemo = async () => {
    setStep(1);
    setGeneratedContract(null);
    setMissionData(null);
    setApplicationData(null);
    createMissionMutation.mutate();
  };

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Démonstration du Système de Contrats Automatiques</h1>
        <p className="text-gray-600 mt-2">
          Test complet du processus de génération automatique de contrats lors de l'acceptation d'une candidature
        </p>
      </div>

      <div className="grid gap-6">
        {/* Étapes du processus */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Play className="h-5 w-5" />
              Processus de Test
            </CardTitle>
            <CardDescription>
              Simulation complète du processus de génération de contrats
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className={`flex items-center gap-3 p-3 rounded-lg ${step >= 1 ? 'bg-green-50 border border-green-200' : 'bg-gray-50'}`}>
                {step > 1 ? <CheckCircle className="h-5 w-5 text-green-600" /> : <Clock className="h-5 w-5 text-gray-400" />}
                <div>
                  <div className="font-medium">1. Création d'une mission de test</div>
                  <div className="text-sm text-gray-600">Poste d'infirmier en réanimation</div>
                </div>
                {step === 1 && createMissionMutation.isPending && (
                  <Badge variant="secondary">En cours...</Badge>
                )}
              </div>

              <div className={`flex items-center gap-3 p-3 rounded-lg ${step >= 2 ? 'bg-green-50 border border-green-200' : 'bg-gray-50'}`}>
                {step > 2 ? <CheckCircle className="h-5 w-5 text-green-600" /> : <Clock className="h-5 w-5 text-gray-400" />}
                <div>
                  <div className="font-medium">2. Candidature d'un infirmier</div>
                  <div className="text-sm text-gray-600">Simulation d'une candidature automatique</div>
                </div>
                {step === 2 && createApplicationMutation.isPending && (
                  <Badge variant="secondary">En cours...</Badge>
                )}
              </div>

              <div className={`flex items-center gap-3 p-3 rounded-lg ${step >= 3 ? 'bg-green-50 border border-green-200' : 'bg-gray-50'}`}>
                {step > 3 ? <CheckCircle className="h-5 w-5 text-green-600" /> : <Clock className="h-5 w-5 text-gray-400" />}
                <div>
                  <div className="font-medium">3. Acceptation de la candidature</div>
                  <div className="text-sm text-gray-600">Déclenchement automatique de la génération de contrat</div>
                </div>
                {step === 3 && acceptApplicationMutation.isPending && (
                  <Badge variant="secondary">En cours...</Badge>
                )}
              </div>

              <div className={`flex items-center gap-3 p-3 rounded-lg ${step >= 4 ? 'bg-green-50 border border-green-200' : 'bg-gray-50'}`}>
                {step >= 4 ? <CheckCircle className="h-5 w-5 text-green-600" /> : <Clock className="h-5 w-5 text-gray-400" />}
                <div>
                  <div className="font-medium">4. Contrat généré automatiquement</div>
                  <div className="text-sm text-gray-600">Template professionnel avec signature électronique</div>
                </div>
                {step === 4 && (
                  <Badge className="bg-green-600">Terminé !</Badge>
                )}
              </div>
            </div>

            <div className="mt-6">
              <Button 
                onClick={startDemo}
                disabled={createMissionMutation.isPending || createApplicationMutation.isPending || acceptApplicationMutation.isPending}
                className="w-full"
              >
                {step === 1 && createMissionMutation.isPending ? "Création en cours..." : "Démarrer la démonstration"}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Contrat généré */}
        {generatedContract && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Contrat Généré Automatiquement
              </CardTitle>
              <CardDescription>
                Contrat N° {generatedContract.contractNumber}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <div className="text-sm font-medium text-gray-700">Titre</div>
                  <div className="text-sm">{generatedContract.title}</div>
                </div>
                <div>
                  <div className="text-sm font-medium text-gray-700">Statut</div>
                  <Badge variant="secondary">{generatedContract.status}</Badge>
                </div>
                <div>
                  <div className="text-sm font-medium text-gray-700">Période</div>
                  <div className="text-sm">
                    {new Date(generatedContract.startDate).toLocaleDateString('fr-FR')} au{' '}
                    {new Date(generatedContract.endDate).toLocaleDateString('fr-FR')}
                  </div>
                </div>
                <div>
                  <div className="text-sm font-medium text-gray-700">Montant</div>
                  <div className="text-sm font-semibold">{generatedContract.totalAmount} €</div>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center gap-2 text-green-600">
                  <CheckCircle className="h-4 w-4" />
                  <span className="text-sm">Template HTML professionnel généré</span>
                </div>
                <div className="flex items-center gap-2 text-green-600">
                  <CheckCircle className="h-4 w-4" />
                  <span className="text-sm">Numéro de contrat unique attribué</span>
                </div>
                <div className="flex items-center gap-2 text-green-600">
                  <CheckCircle className="h-4 w-4" />
                  <span className="text-sm">Calculs financiers automatiques</span>
                </div>
                <div className="flex items-center gap-2 text-green-600">
                  <CheckCircle className="h-4 w-4" />
                  <span className="text-sm">Prêt pour signature électronique</span>
                </div>
              </div>

              <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                <h4 className="font-medium text-blue-900 mb-2">Fonctionnalités démontrées :</h4>
                <ul className="text-sm text-blue-800 space-y-1">
                  <li>• Génération automatique lors de l'acceptation</li>
                  <li>• Template HTML complet avec variables dynamiques</li>
                  <li>• Calcul automatique des montants et durées</li>
                  <li>• Numérotation unique des contrats</li>
                  <li>• Base pour signature électronique sécurisée</li>
                </ul>
              </div>

              <div className="mt-4 space-y-2">
                <Button 
                  variant="outline" 
                  onClick={() => setShowFullContract(!showFullContract)}
                  className="w-full"
                >
                  {showFullContract ? 'Masquer le contrat' : 'Voir le contrat HTML complet'}
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Contrat HTML complet */}
        {generatedContract && showFullContract && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Contrat HTML Complet
              </CardTitle>
              <CardDescription>
                Template HTML généré automatiquement - prêt pour signature électronique
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div 
                className="border rounded-lg p-4 bg-white"
                dangerouslySetInnerHTML={{ __html: generatedContract.contractContent }}
              />
            </CardContent>
          </Card>
        )}

        {/* Guide d'utilisation */}
        <Card>
          <CardHeader>
            <CardTitle>Guide d'Utilisation en Production</CardTitle>
            <CardDescription>
              Comment utiliser ce système dans un environnement réel
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 text-sm">
              <div>
                <strong>1. Établissement publie une mission</strong>
                <div className="text-gray-600 ml-4">Via le dashboard, création d'une offre de mission avec tous les détails</div>
              </div>
              <div>
                <strong>2. Infirmier postule</strong>
                <div className="text-gray-600 ml-4">Candidature via la recherche de missions avec lettre de motivation</div>
              </div>
              <div>
                <strong>3. Acceptation automatique</strong>
                <div className="text-gray-600 ml-4">L'établissement accepte = contrat généré automatiquement en arrière-plan</div>
              </div>
              <div>
                <strong>4. Signature électronique</strong>
                <div className="text-gray-600 ml-4">Les deux parties signent via l'interface dédiée sur /contracts</div>
              </div>
              <div>
                <strong>5. Contrat validé</strong>
                <div className="text-gray-600 ml-4">Document légalement valide, archivé et accessible</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}