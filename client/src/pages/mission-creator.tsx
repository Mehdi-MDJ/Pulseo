import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { Progress } from "@/components/ui/progress";
import {
  ArrowLeft,
  ArrowRight,
  Calendar,
  Clock,
  MapPin,
  Users,
  Star,
  AlertTriangle,
  Save,
  Send,
  Eye,
  Plus,
  X,
  BookOpen,
  Heart,
  Building2,
  Euro,
  Shield,
  CheckCircle2,
  Sparkles,
  FileText,
  Settings,
  Briefcase,
  Zap,
  Target,
  Award
} from "lucide-react";
import { useState, useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Link, useLocation } from "wouter";
import { useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

const missionSchema = z.object({
  title: z.string().min(5, "Le titre doit contenir au moins 5 caractères et être descriptif"),
  description: z.string().min(20, "La description doit contenir au moins 20 caractères et expliquer clairement la mission"),
  service: z.string().min(1, "Veuillez sélectionner un service médical"),
  specializations: z.array(z.string()).min(1, "Sélectionnez au moins une spécialisation requise"),
  startDate: z.string().min(1, "Date de début requise pour planifier la mission"),
  endDate: z.string().min(1, "Date de fin requise pour définir la durée"),
  shift: z.string().min(1, "Veuillez sélectionner un créneau horaire"),
  urgencyLevel: z.enum(["low", "medium", "high"]),
  hourlyRate: z.number().min(20, "Le taux horaire minimum est de 20€ pour respecter les conventions"),
  address: z.string().min(5, "Adresse complète requise pour la localisation"),
  positionsCount: z.number().min(1, "Au moins 1 poste requis pour la mission"),
  requirements: z.array(z.string()),
  benefits: z.array(z.string()),
  contactInfo: z.string().min(5, "Informations de contact requises pour les candidats")
}).refine((data) => {
  // Validation personnalisée : date de fin après date de début
  const startDate = new Date(data.startDate);
  const endDate = new Date(data.endDate);
  return endDate > startDate;
}, {
  message: "La date de fin doit être postérieure à la date de début",
  path: ["endDate"]
});

type MissionFormData = z.infer<typeof missionSchema>;

const STEPS = [
  { id: 1, title: "Informations générales", icon: FileText, description: "Titre, service et description" },
  { id: 2, title: "Planification", icon: Calendar, description: "Dates, horaires et urgence" },
  { id: 3, title: "Exigences", icon: Target, description: "Compétences et qualifications" },
  { id: 4, title: "Conditions", icon: Euro, description: "Rémunération et avantages" },
  { id: 5, title: "Finalisation", icon: CheckCircle2, description: "Vérification et publication" }
];

const SERVICES = [
  { value: "urgences", label: "Urgences", icon: "🚨" },
  { value: "chirurgie", label: "Chirurgie", icon: "🏥" },
  { value: "pediatrie", label: "Pédiatrie", icon: "👶" },
  { value: "geriatrie", label: "Gériatrie", icon: "👴" },
  { value: "psychiatrie", label: "Psychiatrie", icon: "🧠" },
  { value: "reanimation", label: "Réanimation", icon: "💊" },
  { value: "cardiologie", label: "Cardiologie", icon: "❤️" },
  { value: "oncologie", label: "Oncologie", icon: "🎗️" }
];

const SPECIALIZATIONS = [
  "Soins intensifs", "Anesthésie", "Bloc opératoire", "Dialyse",
  "Néonatologie", "Cardiologie", "Neurologie", "Oncologie",
  "Psychiatrie", "Gériatrie", "Pédiatrie", "Urgences"
];

const SHIFTS = [
  { value: "matin", label: "Matin (6h-14h)", icon: "🌅" },
  { value: "apres-midi", label: "Après-midi (14h-22h)", icon: "☀️" },
  { value: "nuit", label: "Nuit (22h-6h)", icon: "🌙" },
  { value: "jour", label: "Jour (8h-20h)", icon: "🌞" }
];

const REQUIREMENTS_OPTIONS = [
  "Diplôme d'État infirmier", "5 ans d'expérience minimum", "Formation spécialisée",
  "Maîtrise des protocoles d'urgence", "Expérience en équipe", "Autonomie",
  "Résistance au stress", "Flexibilité horaire", "Permis de conduire"
];

const BENEFITS_OPTIONS = [
  "Tickets restaurant", "Mutuelle d'entreprise", "13ème mois", "Primes de performance",
  "Formation continue", "Horaires flexibles", "Télétravail partiel", "Congés supplémentaires",
  "Transport pris en charge", "Logement temporaire", "Prime de nuit", "Prime weekend"
];

export default function MissionCreator() {
  const [step, setStep] = useState(1);
  const [showSaveTemplateDialog, setShowSaveTemplateDialog] = useState(false);
  const [templateName, setTemplateName] = useState("");
  const [location, setLocation] = useLocation();
  const { toast } = useToast();

  // Gestion du thème depuis localStorage
  useEffect(() => {
    const savedTheme = localStorage.getItem("theme") || "light";

    // Appliquer le thème au chargement de la page
    if (savedTheme === "dark") {
      document.documentElement.classList.add("dark");
    } else if (savedTheme === "light") {
      document.documentElement.classList.remove("dark");
    } else if (savedTheme === "auto") {
      // Mode auto : suivre les préférences système
      const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
      if (prefersDark) {
        document.documentElement.classList.add("dark");
      } else {
        document.documentElement.classList.remove("dark");
      }
    }
  }, []);

  const form = useForm<MissionFormData>({
    resolver: zodResolver(missionSchema),
    defaultValues: {
      title: "",
      description: "",
      service: "",
      specializations: [],
      startDate: "",
      endDate: "",
      shift: "",
      urgencyLevel: "medium",
      hourlyRate: 25,
      address: "",
      positionsCount: 1,
      requirements: [],
      benefits: [],
      contactInfo: ""
    }
  });

  // Mutations pour sauvegarder et publier
  const saveDraftMutation = useMutation({
    mutationFn: async (data: MissionFormData) => {
      console.log("Sauvegarde brouillon:", data);
      // Mapping standardisé des données du formulaire vers le format API
      const apiData = {
        title: data.title,
        description: data.description,
        service: data.service, // Garder le nom original
        location: {
          address: data.address,
          city: data.address.split(',').pop()?.trim() || '',
          postalCode: data.address.match(/\d{5}/)?.[0] || ''
        },
        startDate: data.startDate,
        endDate: data.endDate,
        shift: data.shift, // Garder le nom original
        hourlyRate: data.hourlyRate,
        urgency: data.urgencyLevel,
        requiredSkills: data.specializations,
        additionalRequirements: data.requirements,
        benefits: data.benefits,
        contactInfo: data.contactInfo,
        positionsCount: data.positionsCount,
        status: "draft"
      };
      const response = await apiRequest("POST", "/api/missions", apiData);
      return response;
    },
    onSuccess: () => {
      toast({ title: "Brouillon sauvegardé", description: "Votre mission a été sauvegardée." });
      queryClient.invalidateQueries({ queryKey: ["/api/missions"] });
    },
    onError: (error) => {
      console.error("Erreur sauvegarde:", error);
      toast({ title: "Erreur", description: "Impossible de sauvegarder le brouillon.", variant: "destructive" });
    }
  });

  const publishMissionMutation = useMutation({
    mutationFn: async (data: MissionFormData) => {
      console.log("Publication mission:", data);
      // Mapping standardisé des données du formulaire vers le format API
      const apiData = {
        title: data.title,
        description: data.description,
        service: data.service, // Garder le nom original
        location: {
          address: data.address,
          city: data.address.split(',').pop()?.trim() || '',
          postalCode: data.address.match(/\d{5}/)?.[0] || ''
        },
        startDate: data.startDate,
        endDate: data.endDate,
        shift: data.shift, // Garder le nom original
        hourlyRate: data.hourlyRate,
        urgency: data.urgencyLevel,
        requiredSkills: data.specializations,
        additionalRequirements: data.requirements,
        benefits: data.benefits,
        contactInfo: data.contactInfo,
        positionsCount: data.positionsCount,
        status: "published"
      };
      const response = await apiRequest("/api/establishment/missions", {
        method: "POST",
        body: apiData
      });
      return response;
    },
    onSuccess: () => {
      toast({ title: "Mission publiée", description: "Votre mission est maintenant visible par les infirmiers." });
      // Invalider le cache des missions pour actualiser la liste
      queryClient.invalidateQueries({ queryKey: ["/api/establishment/missions"] });
      queryClient.invalidateQueries({ queryKey: ["/api/establishment/stats"] });
      // Redirection vers le dashboard
      setTimeout(() => {
        setLocation("/dashboard");
      }, 1000);
    },
    onError: (error) => {
      console.error("Erreur publication:", error);
      toast({ title: "Erreur", description: "Impossible de publier la mission.", variant: "destructive" });
    }
  });

  const onSaveDraft = async () => {
    const formData = form.getValues();
    console.log("Sauvegarde brouillon:", formData);
    saveDraftMutation.mutate(formData);
  };

  const onPublish = async () => {
    const isValid = await form.trigger();
    if (!isValid) {
      toast({
        title: "Formulaire incomplet",
        description: "Veuillez remplir tous les champs obligatoires.",
        variant: "destructive"
      });
      return;
    }

    const formData = form.getValues();
    console.log("Publication mission:", formData);
    publishMissionMutation.mutate(formData);
  };

  const handleSaveAsTemplate = () => {
    if (!templateName.trim()) return;
    // Logique de sauvegarde du template
    toast({ title: "Template sauvegardé", description: `Template "${templateName}" créé avec succès.` });
    setShowSaveTemplateDialog(false);
    setTemplateName("");
  };

  const nextStep = () => {
    if (step < STEPS.length) setStep(step + 1);
  };

  const prevStep = () => {
    if (step > 1) setStep(step - 1);
  };

  const toggleRequirement = (requirement: string) => {
    const current = form.getValues("requirements");
    const updated = current.includes(requirement)
      ? current.filter(r => r !== requirement)
      : [...current, requirement];
    form.setValue("requirements", updated);
  };

  const toggleBenefit = (benefit: string) => {
    const current = form.getValues("benefits");
    const updated = current.includes(benefit)
      ? current.filter(b => b !== benefit)
      : [...current, benefit];
    form.setValue("benefits", updated);
  };

  const toggleSpecialization = (spec: string) => {
    const current = form.getValues("specializations");
    const updated = current.includes(spec)
      ? current.filter(s => s !== spec)
      : [...current, spec];
    form.setValue("specializations", updated);
  };

  const progressPercentage = (step / STEPS.length) * 100;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      {/* Header moderne avec progression */}
      <div className="sticky top-0 z-50 bg-white/95 dark:bg-gray-900/95 backdrop-blur-sm border-b shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-4">
              <Link href="/dashboard">
                <Button variant="ghost" size="sm" className="hover:bg-blue-50 dark:hover:bg-blue-900">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Retour
                </Button>
              </Link>
              <div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                  <Sparkles className="h-6 w-6 text-blue-600" />
                  Créer une mission
                </h1>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Trouvez l'infirmier parfait pour votre établissement
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Badge variant="outline" className="text-xs">
                Étape {step}/{STEPS.length}
              </Badge>
            </div>
          </div>

          {/* Barre de progression */}
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 mb-4">
            <div
              className="bg-gradient-to-r from-blue-600 to-purple-600 h-2 rounded-full transition-all duration-500 ease-out"
              style={{ width: `${progressPercentage}%` }}
            />
          </div>

          {/* Navigation étapes */}
          <div className="flex items-center justify-between">
            {STEPS.map((stepInfo, index) => {
              const StepIcon = stepInfo.icon;
              const isActive = step === stepInfo.id;
              const isCompleted = step > stepInfo.id;

              return (
                <div key={stepInfo.id} className="flex items-center">
                  <div
                    className={`flex flex-col items-center cursor-pointer transition-all duration-300 ${
                      isActive ? 'scale-110' : ''
                    }`}
                    onClick={() => setStep(stepInfo.id)}
                  >
                    <div className={`
                      w-12 h-12 rounded-full flex items-center justify-center border-2 transition-all duration-300
                      ${isActive
                        ? 'bg-blue-600 border-blue-600 text-white shadow-lg shadow-blue-600/30'
                        : isCompleted
                        ? 'bg-green-500 border-green-500 text-white'
                        : 'bg-gray-100 border-gray-300 text-gray-500 dark:bg-gray-700 dark:border-gray-600'
                      }
                    `}>
                      {isCompleted ? (
                        <CheckCircle2 className="h-5 w-5" />
                      ) : (
                        <StepIcon className="h-5 w-5" />
                      )}
                    </div>
                    <div className="text-center mt-2 hidden sm:block">
                      <p className={`text-xs font-medium ${
                        isActive ? 'text-blue-600 dark:text-blue-400' : 'text-gray-600 dark:text-gray-400'
                      }`}>
                        {stepInfo.title}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-500">
                        {stepInfo.description}
                      </p>
                    </div>
                  </div>
                  {index < STEPS.length - 1 && (
                    <div className={`
                      flex-1 h-0.5 mx-4 transition-all duration-300
                      ${step > stepInfo.id ? 'bg-green-500' : 'bg-gray-300 dark:bg-gray-600'}
                    `} />
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Contenu principal */}
      <div className="container mx-auto px-4 py-8">
        <form onSubmit={form.handleSubmit(() => {})} className="max-w-4xl mx-auto">

          {/* Étape 1: Informations générales */}
          {step === 1 && (
            <Card className="shadow-lg border-0 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm">
              <CardHeader className="bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-t-lg">
                <CardTitle className="flex items-center gap-3">
                  <FileText className="h-6 w-6" />
                  Informations générales
                </CardTitle>
              </CardHeader>
              <CardContent className="p-8 space-y-6">
                {/* Titre */}
                <div className="space-y-2">
                  <Label htmlFor="title" className="text-base font-medium flex items-center gap-2">
                    <Briefcase className="h-4 w-4" />
                    Titre de la mission *
                  </Label>
                  <Input
                    id="title"
                    {...form.register("title")}
                    placeholder="Ex: Infirmier DE - Service d'urgences - Garde de nuit"
                    className="text-lg py-3"
                  />
                  {form.formState.errors.title && (
                    <p className="text-red-500 text-sm">{form.formState.errors.title.message}</p>
                  )}
                </div>

                {/* Service */}
                <div className="space-y-2">
                  <Label className="text-base font-medium flex items-center gap-2">
                    <Building2 className="h-4 w-4" />
                    Service *
                  </Label>
                  <Controller
                    name="service"
                    control={form.control}
                    render={({ field }) => (
                      <Select onValueChange={field.onChange} value={field.value}>
                        <SelectTrigger className="text-lg py-3">
                          <SelectValue placeholder="Sélectionnez un service" />
                        </SelectTrigger>
                        <SelectContent>
                          {SERVICES.map((service) => (
                            <SelectItem key={service.value} value={service.value}>
                              <span className="flex items-center gap-2">
                                <span>{service.icon}</span>
                                {service.label}
                              </span>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}
                  />
                  {form.formState.errors.service && (
                    <p className="text-red-500 text-sm">{form.formState.errors.service.message}</p>
                  )}
                </div>

                {/* Description */}
                <div className="space-y-2">
                  <Label htmlFor="description" className="text-base font-medium flex items-center gap-2">
                    <FileText className="h-4 w-4" />
                    Description détaillée *
                  </Label>
                  <Textarea
                    id="description"
                    {...form.register("description")}
                    placeholder="Décrivez les missions, l'environnement de travail, les responsabilités..."
                    className="min-h-32 text-base"
                  />
                  {form.formState.errors.description && (
                    <p className="text-red-500 text-sm">{form.formState.errors.description.message}</p>
                  )}
                </div>

                {/* Adresse */}
                <div className="space-y-2">
                  <Label htmlFor="address" className="text-base font-medium flex items-center gap-2">
                    <MapPin className="h-4 w-4" />
                    Adresse de la mission *
                  </Label>
                  <Input
                    id="address"
                    {...form.register("address")}
                    placeholder="Adresse complète de l'établissement"
                    className="text-base py-3"
                  />
                  {form.formState.errors.address && (
                    <p className="text-red-500 text-sm">{form.formState.errors.address.message}</p>
                  )}
                </div>

                <div className="flex justify-end">
                  <Button onClick={nextStep} className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
                    Suivant
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Étape 2: Planification */}
          {step === 2 && (
            <Card className="shadow-lg border-0 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm">
              <CardHeader className="bg-gradient-to-r from-green-600 to-blue-600 text-white rounded-t-lg">
                <CardTitle className="flex items-center gap-3">
                  <Calendar className="h-6 w-6" />
                  Planification
                </CardTitle>
              </CardHeader>
              <CardContent className="p-8 space-y-6">
                {/* Dates */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="startDate" className="text-base font-medium flex items-center gap-2">
                      <Calendar className="h-4 w-4" />
                      Date de début *
                    </Label>
                    <Input
                      id="startDate"
                      type="date"
                      {...form.register("startDate")}
                      className="text-base py-3"
                    />
                    {form.formState.errors.startDate && (
                      <p className="text-red-500 text-sm">{form.formState.errors.startDate.message}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="endDate" className="text-base font-medium flex items-center gap-2">
                      <Calendar className="h-4 w-4" />
                      Date de fin *
                    </Label>
                    <Input
                      id="endDate"
                      type="date"
                      {...form.register("endDate")}
                      className="text-base py-3"
                    />
                    {form.formState.errors.endDate && (
                      <p className="text-red-500 text-sm">{form.formState.errors.endDate.message}</p>
                    )}
                  </div>
                </div>

                {/* Créneau */}
                <div className="space-y-2">
                  <Label className="text-base font-medium flex items-center gap-2">
                    <Clock className="h-4 w-4" />
                    Créneau horaire *
                  </Label>
                  <Controller
                    name="shift"
                    control={form.control}
                    render={({ field }) => (
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                        {SHIFTS.map((shift) => (
                          <div
                            key={shift.value}
                            onClick={() => field.onChange(shift.value)}
                            className={`
                              p-4 rounded-lg border-2 cursor-pointer transition-all duration-200 hover:scale-105
                              ${field.value === shift.value
                                ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                                : 'border-gray-200 hover:border-gray-300 dark:border-gray-600'
                              }
                            `}
                          >
                            <div className="text-center">
                              <div className="text-2xl mb-2">{shift.icon}</div>
                              <div className="font-medium text-sm">{shift.label}</div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  />
                  {form.formState.errors.shift && (
                    <p className="text-red-500 text-sm">{form.formState.errors.shift.message}</p>
                  )}
                </div>

                {/* Urgence et nombre de postes */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label className="text-base font-medium flex items-center gap-2">
                      <AlertTriangle className="h-4 w-4" />
                      Niveau d'urgence
                    </Label>
                    <Controller
                      name="urgencyLevel"
                      control={form.control}
                      render={({ field }) => (
                        <Select onValueChange={field.onChange} value={field.value}>
                          <SelectTrigger className="text-base py-3">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="low">🟢 Faible</SelectItem>
                            <SelectItem value="medium">🟡 Moyen</SelectItem>
                            <SelectItem value="high">🔴 Urgent</SelectItem>
                          </SelectContent>
                        </Select>
                      )}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="positionsCount" className="text-base font-medium flex items-center gap-2">
                      <Users className="h-4 w-4" />
                      Nombre de postes *
                    </Label>
                    <Input
                      id="positionsCount"
                      type="number"
                      {...form.register("positionsCount", { valueAsNumber: true })}
                      min="1"
                      className="text-base py-3"
                    />
                    {form.formState.errors.positionsCount && (
                      <p className="text-red-500 text-sm">{form.formState.errors.positionsCount.message}</p>
                    )}
                  </div>
                </div>

                <div className="flex justify-between">
                  <Button variant="outline" onClick={prevStep}>
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Précédent
                  </Button>
                  <Button onClick={nextStep} className="bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700">
                    Suivant
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Étape 3: Exigences */}
          {step === 3 && (
            <Card className="shadow-lg border-0 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm">
              <CardHeader className="bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-t-lg">
                <CardTitle className="flex items-center gap-3">
                  <Target className="h-6 w-6" />
                  Exigences et compétences
                </CardTitle>
              </CardHeader>
              <CardContent className="p-8 space-y-6">
                {/* Spécialisations */}
                <div className="space-y-2">
                  <Label className="text-base font-medium flex items-center gap-2">
                    <Award className="h-4 w-4" />
                    Spécialisations requises *
                  </Label>
                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                    {SPECIALIZATIONS.map((spec) => (
                      <div
                        key={spec}
                        onClick={() => toggleSpecialization(spec)}
                        className={`
                          p-3 rounded-lg border cursor-pointer transition-all duration-200 hover:scale-105
                          ${form.watch("specializations").includes(spec)
                            ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/20'
                            : 'border-gray-200 hover:border-gray-300 dark:border-gray-600'
                          }
                        `}
                      >
                        <div className="text-center text-sm font-medium">{spec}</div>
                      </div>
                    ))}
                  </div>
                  {form.formState.errors.specializations && (
                    <p className="text-red-500 text-sm">{form.formState.errors.specializations.message}</p>
                  )}
                </div>

                {/* Exigences */}
                <div className="space-y-2">
                  <Label className="text-base font-medium flex items-center gap-2">
                    <Shield className="h-4 w-4" />
                    Exigences particulières
                  </Label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {REQUIREMENTS_OPTIONS.map((requirement) => (
                      <div
                        key={requirement}
                        onClick={() => toggleRequirement(requirement)}
                        className={`
                          p-3 rounded-lg border cursor-pointer transition-all duration-200 hover:scale-105
                          ${form.watch("requirements").includes(requirement)
                            ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                            : 'border-gray-200 hover:border-gray-300 dark:border-gray-600'
                          }
                        `}
                      >
                        <div className="text-sm">{requirement}</div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex justify-between">
                  <Button variant="outline" onClick={prevStep}>
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Précédent
                  </Button>
                  <Button onClick={nextStep} className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700">
                    Suivant
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Étape 4: Conditions */}
          {step === 4 && (
            <Card className="shadow-lg border-0 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm">
              <CardHeader className="bg-gradient-to-r from-orange-600 to-red-600 text-white rounded-t-lg">
                <CardTitle className="flex items-center gap-3">
                  <Euro className="h-6 w-6" />
                  Rémunération et avantages
                </CardTitle>
              </CardHeader>
              <CardContent className="p-8 space-y-6">
                {/* Taux horaire */}
                <div className="space-y-2">
                  <Label htmlFor="hourlyRate" className="text-base font-medium flex items-center gap-2">
                    <Euro className="h-4 w-4" />
                    Taux horaire *
                  </Label>
                  <div className="relative">
                    <Input
                      id="hourlyRate"
                      type="number"
                      {...form.register("hourlyRate", { valueAsNumber: true })}
                      min="20"
                      step="0.5"
                      className="text-lg py-3 pl-4 pr-12"
                    />
                    <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500">€/h</span>
                  </div>
                  {form.formState.errors.hourlyRate && (
                    <p className="text-red-500 text-sm">{form.formState.errors.hourlyRate.message}</p>
                  )}
                </div>

                {/* Avantages */}
                <div className="space-y-2">
                  <Label className="text-base font-medium flex items-center gap-2">
                    <Star className="h-4 w-4" />
                    Avantages proposés
                  </Label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {BENEFITS_OPTIONS.map((benefit) => (
                      <div
                        key={benefit}
                        onClick={() => toggleBenefit(benefit)}
                        className={`
                          p-3 rounded-lg border cursor-pointer transition-all duration-200 hover:scale-105
                          ${form.watch("benefits").includes(benefit)
                            ? 'border-orange-500 bg-orange-50 dark:bg-orange-900/20'
                            : 'border-gray-200 hover:border-gray-300 dark:border-gray-600'
                          }
                        `}
                      >
                        <div className="text-sm">{benefit}</div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Contact */}
                <div className="space-y-2">
                  <Label htmlFor="contactInfo" className="text-base font-medium flex items-center gap-2">
                    <Users className="h-4 w-4" />
                    Informations de contact *
                  </Label>
                  <Textarea
                    id="contactInfo"
                    {...form.register("contactInfo")}
                    placeholder="Personne à contacter, téléphone, email..."
                    className="min-h-24 text-base"
                  />
                  {form.formState.errors.contactInfo && (
                    <p className="text-red-500 text-sm">{form.formState.errors.contactInfo.message}</p>
                  )}
                </div>

                <div className="flex justify-between">
                  <Button variant="outline" onClick={prevStep}>
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Précédent
                  </Button>
                  <Button onClick={nextStep} className="bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700">
                    Suivant
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Étape 5: Finalisation */}
          {step === 5 && (
            <Card className="shadow-lg border-0 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm">
              <CardHeader className="bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-t-lg">
                <CardTitle className="flex items-center gap-3">
                  <CheckCircle2 className="h-6 w-6" />
                  Vérification et publication
                </CardTitle>
              </CardHeader>
              <CardContent className="p-8 space-y-6">
                {/* Aperçu de la mission */}
                <div className="bg-gradient-to-br from-blue-50 to-purple-50 dark:from-gray-700 dark:to-gray-600 p-6 rounded-lg">
                  <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                    <Eye className="h-5 w-5" />
                    Aperçu de votre mission
                  </h3>

                  <div className="space-y-4">
                    <div>
                      <h4 className="font-semibold text-lg">{form.watch("title") || "Titre de la mission"}</h4>
                      <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600 dark:text-gray-300 mt-2">
                        <div className="flex items-center gap-1">
                          <Building2 className="h-4 w-4" />
                          <span>{form.watch("service")}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Calendar className="h-4 w-4" />
                          <span>{form.watch("startDate")} - {form.watch("endDate")}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Clock className="h-4 w-4" />
                          <span>{form.watch("shift")}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Users className="h-4 w-4" />
                          <span>{form.watch("positionsCount")} poste(s)</span>
                        </div>
                      </div>
                    </div>

                    <p className="text-sm">{form.watch("description")}</p>

                    <div className="flex items-center justify-between">
                      <div className="flex flex-wrap gap-2">
                        {form.watch("specializations").map((spec: string) => (
                          <Badge key={spec} variant="secondary">{spec}</Badge>
                        ))}
                      </div>
                      <div className="text-lg font-bold text-green-600 flex items-center gap-1">
                        <Euro className="h-4 w-4" />
                        {form.watch("hourlyRate")}€/h
                      </div>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex flex-col sm:flex-row gap-4 justify-between">
                  <div className="flex gap-2">
                    <Button variant="outline" onClick={prevStep}>
                      <ArrowLeft className="h-4 w-4 mr-2" />
                      Précédent
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => setShowSaveTemplateDialog(true)}
                      className="border-purple-200 text-purple-700 hover:bg-purple-50"
                    >
                      <Heart className="h-4 w-4 mr-2" />
                      Sauver template
                    </Button>
                  </div>

                  <div className="flex gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={onSaveDraft}
                      disabled={saveDraftMutation.isPending}
                      className="border-orange-200 text-orange-700 hover:bg-orange-50"
                    >
                      {saveDraftMutation.isPending ? (
                        <div className="flex items-center">
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-orange-700 mr-2"></div>
                          Sauvegarde...
                        </div>
                      ) : (
                        <div className="flex items-center">
                          <Save className="h-4 w-4 mr-2" />
                          Sauver brouillon
                        </div>
                      )}
                    </Button>

                    <Button
                      type="button"
                      onClick={onPublish}
                      disabled={publishMissionMutation.isPending}
                      className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 shadow-lg"
                    >
                      {publishMissionMutation.isPending ? (
                        <div className="flex items-center">
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                          Publication...
                        </div>
                      ) : (
                        <div className="flex items-center">
                          <Send className="h-4 w-4 mr-2" />
                          Publier la mission
                        </div>
                      )}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </form>

        {/* Dialog pour template */}
        <Dialog open={showSaveTemplateDialog} onOpenChange={setShowSaveTemplateDialog}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Heart className="h-5 w-5 text-purple-600" />
                Sauvegarder comme template
              </DialogTitle>
              <DialogDescription>
                Donnez un nom à ce template pour le réutiliser facilement.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="templateName">Nom du template</Label>
                <Input
                  id="templateName"
                  value={templateName}
                  onChange={(e) => setTemplateName(e.target.value)}
                  placeholder="Ex: Garde de nuit urgences"
                  className="mt-1"
                />
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setShowSaveTemplateDialog(false)}>
                  Annuler
                </Button>
                <Button
                  onClick={handleSaveAsTemplate}
                  disabled={!templateName.trim()}
                  className="bg-purple-600 hover:bg-purple-700"
                >
                  <Heart className="h-4 w-4 mr-2" />
                  Sauvegarder
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
