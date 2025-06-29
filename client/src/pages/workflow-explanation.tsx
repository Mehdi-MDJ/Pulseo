import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowRight, ArrowDown, Hospital, Brain, Users, CheckCircle, Clock, Bell, FileText, Star } from 'lucide-react';

export default function WorkflowExplanation() {
  const [activeStep, setActiveStep] = useState(0);

  const workflowSteps = [
    {
      id: 1,
      title: "Publication de Mission",
      actor: "Établissement de Santé",
      icon: Hospital,
      color: "bg-blue-500",
      description: "L'établissement crée et publie une mission avec les critères requis",
      details: [
        "Définition du poste et spécialisation",
        "Critères d'expérience et certifications",
        "Horaires et rémunération",
        "Paramètres de matching (distance max, nb candidats)"
      ],
      action: "Mission publiée automatiquement"
    },
    {
      id: 2,
      title: "Matching Automatique IA",
      actor: "Système NurseLink AI",
      icon: Brain,
      color: "bg-purple-500",
      description: "L'IA analyse et score tous les profils infirmiers compatibles",
      details: [
        "Analyse de la spécialisation (40 points)",
        "Évaluation de l'expérience (25 points)",
        "Vérification des notes/évaluations (20 points)",
        "Calcul de la proximité géographique (15 points)",
        "Seuil minimum : 60% de compatibilité"
      ],
      action: "Candidats identifiés et notifiés instantanément"
    },
    {
      id: 3,
      title: "Notification Infirmiers",
      actor: "Infirmiers Qualifiés",
      icon: Bell,
      color: "bg-green-500",
      description: "Les infirmiers reçoivent les offres personnalisées en temps réel",
      details: [
        "Notification push mobile immédiate",
        "Score de compatibilité affiché",
        "Facteurs de correspondance détaillés",
        "Informations complètes de la mission"
      ],
      action: "Infirmier consulte l'offre"
    },
    {
      id: 4,
      title: "Décision Infirmier",
      actor: "Infirmier",
      icon: Users,
      color: "bg-orange-500",
      description: "L'infirmier évalue l'offre et prend sa décision",
      details: [
        "Consultation des détails de mission",
        "Vérification de la compatibilité",
        "Analyse des conditions proposées",
        "Choix : Postuler ou Décliner"
      ],
      action: "Candidature envoyée OU Offre déclinée"
    },
    {
      id: 5,
      title: "Réception Candidatures",
      actor: "Établissement de Santé",
      icon: FileText,
      color: "bg-teal-500",
      description: "L'établissement reçoit UNIQUEMENT les candidatures acceptées",
      details: [
        "Profil complet de l'infirmier",
        "Score de compatibilité IA",
        "Certifications et expériences",
        "Disponibilités confirmées"
      ],
      action: "Sélection du candidat final"
    },
    {
      id: 6,
      title: "Validation & Contrat",
      actor: "Établissement + Infirmier",
      icon: CheckCircle,
      color: "bg-emerald-500",
      description: "Finalisation de l'embauche et génération du contrat",
      details: [
        "Validation mutuelle de la mission",
        "Génération automatique du contrat",
        "Signature électronique",
        "Mission confirmée et planifiée"
      ],
      action: "Mission active - Matching terminé"
    }
  ];

  const keyPoints = [
    {
      title: "L'établissement ne reçoit QUE les candidatures volontaires",
      description: "Les infirmiers doivent explicitement postuler. Aucune donnée n'est transmise sans leur consentement.",
      icon: CheckCircle,
      color: "text-green-600"
    },
    {
      title: "Matching bidirectionnel intelligent",
      description: "Le système respecte les préférences des deux parties et optimise la compatibilité.",
      icon: Brain,
      color: "text-purple-600"
    },
    {
      title: "Transparence totale du processus",
      description: "Chaque acteur voit son score de compatibilité et les facteurs de correspondance.",
      icon: Star,
      color: "text-blue-600"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-blue-900 p-4">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white">
            Workflow du Matching Automatique
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
            Découvrez comment NurseLink AI connecte intelligemment les établissements de santé 
            et les infirmiers qualifiés
          </p>
        </div>

        {/* Interactive Workflow */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Brain className="h-6 w-6 text-purple-600" />
              Workflow Interactif - Cliquez sur chaque étape
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-3 lg:grid-cols-6 gap-4">
              {workflowSteps.map((step, index) => (
                <div key={step.id} className="flex flex-col items-center">
                  <Button
                    variant={activeStep === index ? "default" : "outline"}
                    size="lg"
                    className={`w-20 h-20 rounded-full mb-3 ${
                      activeStep === index ? step.color + ' text-white' : ''
                    }`}
                    onClick={() => setActiveStep(index)}
                  >
                    <step.icon className="h-8 w-8" />
                  </Button>
                  <h3 className="text-sm font-medium text-center mb-2">{step.title}</h3>
                  <Badge variant="outline" className="text-xs">
                    {step.actor}
                  </Badge>
                  {index < workflowSteps.length - 1 && (
                    <ArrowRight className="h-4 w-4 text-gray-400 mt-4 hidden md:block" />
                  )}
                  {index < workflowSteps.length - 1 && (
                    <ArrowDown className="h-4 w-4 text-gray-400 mt-4 md:hidden" />
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Step Details */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className={`w-12 h-12 rounded-full ${workflowSteps[activeStep].color} flex items-center justify-center`}>
                {(() => {
                  const IconComponent = workflowSteps[activeStep].icon;
                  return <IconComponent className="h-6 w-6 text-white" />;
                })()}
              </div>
              <div>
                <CardTitle className="text-2xl">{workflowSteps[activeStep].title}</CardTitle>
                <p className="text-gray-600">Acteur : {workflowSteps[activeStep].actor}</p>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <p className="text-lg text-gray-700 dark:text-gray-300">
              {workflowSteps[activeStep].description}
            </p>
            
            <div>
              <h4 className="font-semibold mb-3">Détails de cette étape :</h4>
              <ul className="space-y-2">
                {workflowSteps[activeStep].details.map((detail, index) => (
                  <li key={index} className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <span>{detail}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-center gap-2">
                <Clock className="h-5 w-5 text-blue-600" />
                <span className="font-medium text-blue-900">Résultat :</span>
              </div>
              <p className="text-blue-800 mt-1">{workflowSteps[activeStep].action}</p>
            </div>
          </CardContent>
        </Card>

        {/* Key Points */}
        <div className="grid md:grid-cols-3 gap-6">
          {keyPoints.map((point, index) => (
            <Card key={index}>
              <CardContent className="p-6">
                <div className="flex items-start gap-3">
                  <point.icon className={`h-6 w-6 ${point.color} mt-1`} />
                  <div>
                    <h3 className="font-semibold mb-2">{point.title}</h3>
                    <p className="text-gray-600 text-sm">{point.description}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Privacy & Consent Section */}
        <Card className="border-green-200 bg-green-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-green-800">
              <CheckCircle className="h-6 w-6" />
              Confidentialité & Consentement
            </CardTitle>
          </CardHeader>
          <CardContent className="text-green-700">
            <div className="space-y-3">
              <p className="font-medium">
                🔒 L'établissement ne reçoit JAMAIS de données d'infirmiers sans leur consentement explicite
              </p>
              <p>
                ✅ Les infirmiers gardent le contrôle total : ils choisissent de postuler ou non
              </p>
              <p>
                ✅ Seules les candidatures volontaires sont transmises à l'établissement
              </p>
              <p>
                ✅ Les données de matching restent privées jusqu'à la candidature
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Test Buttons */}
        <div className="flex justify-center gap-4">
          <Button size="lg" onClick={() => window.open('/auto-matching-demo', '_blank')}>
            Tester le Matching Établissement
          </Button>
          <Button size="lg" variant="outline" onClick={() => window.open('/mobile-app', '_blank')}>
            Voir Interface Infirmier
          </Button>
          <Button size="lg" variant="outline" onClick={() => window.open('/nurse-notifications', '_blank')}>
            Voir Notifications Reçues
          </Button>
        </div>
      </div>
    </div>
  );
}