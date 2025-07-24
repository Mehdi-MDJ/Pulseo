import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Hospital,
  ArrowLeft,
  Sparkles,
  Shield,
  Users,
  Clock,
  Star,
  Check,
  Building,
  Phone,
  Mail,
  MapPin,
  FileText,
  CreditCard,
  Eye,
  EyeOff,
  RefreshCw
} from "lucide-react";
import { useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Link } from "wouter";
import { establishmentSignupSchema, generateSecurePassword } from "@/lib/validation";
import { useToast } from "@/hooks/use-toast";

type EstablishmentSignupForm = z.infer<typeof establishmentSignupSchema>;

export default function EstablishmentSignup() {
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [generatedPassword, setGeneratedPassword] = useState("");
  const { toast } = useToast();

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
    control,
    reset
  } = useForm<EstablishmentSignupForm>({
    resolver: zodResolver(establishmentSignupSchema),
    defaultValues: {
      acceptTerms: false,
      acceptRgpd: false
    }
  });

  const generateNewPassword = () => {
    const newPassword = generateSecurePassword();
    setGeneratedPassword(newPassword);
    setValue("password", newPassword);
    toast({
      title: "🔐 Mot de passe généré",
      description: "Un nouveau mot de passe sécurisé a été généré.",
    });
  };

  const onSubmit = async (data: EstablishmentSignupForm) => {
    setIsSubmitting(true);
    try {
      // Utiliser le mot de passe généré ou celui saisi
      const password = generatedPassword || data.password || generateSecurePassword();

      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: data.contactEmail,
          password: password,
          firstName: data.contactFirstName,
          lastName: data.contactLastName,
          role: "establishment",
          establishmentName: data.establishmentName,
          establishmentType: data.establishmentType,
          siretNumber: data.siretNumber,
          address: data.address,
          city: data.city,
          postalCode: data.postalCode,
          contactPhone: data.contactPhone,
          contactPosition: data.contactPosition,
          description: data.description
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        let errorMessage = "Erreur lors de l'inscription. Veuillez réessayer.";

        if (errorData.code === "EMAIL_ALREADY_EXISTS") {
          errorMessage = "Un compte avec cet email existe déjà.";
        } else if (errorData.code === "SIRET_ALREADY_EXISTS") {
          errorMessage = "Un établissement avec ce numéro SIRET existe déjà.";
        } else if (errorData.code === "VALIDATION_ERROR") {
          errorMessage = "Veuillez vérifier les informations saisies.";
        }

        throw new Error(errorMessage);
      }

      const result = await response.json();

      // Stocker le token de session
      if (result.sessionToken) {
        localStorage.setItem('sessionToken', result.sessionToken);
      }

      toast({
        title: "✅ Inscription réussie !",
        description: "Votre compte établissement a été créé avec succès. Redirection vers votre dashboard...",
      });

      // Redirection vers le dashboard établissement
      setTimeout(() => {
        window.location.href = "/establishment-dashboard";
      }, 2000);
    } catch (error: any) {
      toast({
        title: "❌ Erreur d'inscription",
        description: error.message || "Une erreur est survenue lors de l'inscription.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const establishmentTypes = [
    "CHU",
    "Hôpital Public",
    "Clinique Privée",
    "EHPAD",
    "Hôpital Spécialisé",
    "Centre de Soins",
    "Maison de Santé",
    "Centre de Rééducation"
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-blue-50 dark:from-emerald-950/20 dark:via-background dark:to-blue-950/20">
      {/* Header */}
      <header className="border-b border-border/20 bg-background/95 backdrop-blur-xl">
        <div className="container flex h-16 max-w-7xl items-center justify-between px-6">
          <Link href="/">
            <Button variant="ghost" className="p-0">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Retour à l'accueil
            </Button>
          </Link>

          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-blue-500 rounded-xl flex items-center justify-center">
              <Hospital className="h-5 w-5 text-white" />
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-emerald-600 to-blue-600 bg-clip-text text-transparent">
              NurseLink AI
            </span>
          </div>
        </div>
      </header>

      <div className="container max-w-4xl mx-auto px-6 py-12">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center mb-6 px-4 py-2 bg-gradient-to-r from-emerald-100 to-blue-100 dark:from-emerald-900/30 dark:to-blue-900/30 rounded-full">
            <Sparkles className="w-4 h-4 text-emerald-600 mr-2" />
            <span className="text-sm font-semibold text-emerald-800 dark:text-emerald-200">
              Démarrez Votre Aventure
            </span>
          </div>

          <h1 className="text-4xl md:text-5xl font-black text-foreground mb-6">
            Rejoignez l'Élite du
            <span className="block bg-gradient-to-r from-emerald-600 to-blue-600 bg-clip-text text-transparent">
              Staffing Médical
            </span>
          </h1>

          <p className="text-xl text-muted-foreground max-w-3xl mx-auto mb-8">
            Plus de <span className="font-semibold text-emerald-600">150 établissements</span> nous font confiance
            pour recruter les meilleurs talents. À votre tour de révolutionner votre recrutement.
          </p>

          {/* Benefits */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
            <div className="flex items-center justify-center space-x-2">
              <Clock className="w-5 h-5 text-emerald-600" />
              <span className="text-sm font-medium">Recrutement en 24h</span>
            </div>
            <div className="flex items-center justify-center space-x-2">
              <Users className="w-5 h-5 text-emerald-600" />
              <span className="text-sm font-medium">+2,500 infirmiers qualifiés</span>
            </div>
            <div className="flex items-center justify-center space-x-2">
              <Star className="w-5 h-5 text-emerald-600" />
              <span className="text-sm font-medium">Matching IA à 95%</span>
            </div>
          </div>
        </div>

        {/* Signup Form */}
        <Card className="w-full max-w-2xl mx-auto">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl font-bold">Inscription Établissement</CardTitle>
            <p className="text-muted-foreground">
              Créez votre compte établissement en quelques étapes simples
            </p>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              {/* Step 1: Establishment Info */}
              {step === 1 && (
                <div className="space-y-6">
                  <div className="flex items-center space-x-2 mb-6">
                    <Building className="w-5 h-5 text-emerald-600" />
                    <h3 className="text-lg font-semibold">Informations de l'établissement</h3>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <Label htmlFor="establishmentName">Nom de l'établissement *</Label>
                      <Input
                        id="establishmentName"
                        {...register("establishmentName")}
                        placeholder="CHU de Bordeaux"
                        className="mt-1"
                      />
                      {errors.establishmentName && (
                        <p className="text-sm text-red-600 mt-1">{errors.establishmentName.message}</p>
                      )}
                    </div>

                    <div>
                      <Label htmlFor="establishmentType">Type d'établissement *</Label>
                      <Select onValueChange={(value) => setValue("establishmentType", value)}>
                        <SelectTrigger className="mt-1">
                          <SelectValue placeholder="Sélectionnez le type" />
                        </SelectTrigger>
                        <SelectContent>
                          {establishmentTypes.map((type) => (
                            <SelectItem key={type} value={type}>
                              {type}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      {errors.establishmentType && (
                        <p className="text-sm text-red-600 mt-1">{errors.establishmentType.message}</p>
                      )}
                    </div>

                    <div>
                      <Label htmlFor="siretNumber">Numéro SIRET *</Label>
                      <Input
                        id="siretNumber"
                        {...register("siretNumber")}
                        placeholder="12345678901234"
                        className="mt-1"
                        maxLength={14}
                        inputMode="numeric"
                      />
                      {errors.siretNumber && (
                        <p className="text-sm text-red-600 mt-1">{errors.siretNumber.message}</p>
                      )}
                    </div>

                    <div>
                      <Label htmlFor="address">Adresse *</Label>
                      <Input
                        id="address"
                        {...register("address")}
                        placeholder="123 Rue de l'Hôpital"
                        className="mt-1"
                      />
                      {errors.address && (
                        <p className="text-sm text-red-600 mt-1">{errors.address.message}</p>
                      )}
                    </div>

                    <div>
                      <Label htmlFor="city">Ville *</Label>
                      <Input
                        id="city"
                        {...register("city")}
                        placeholder="Bordeaux"
                        className="mt-1"
                      />
                      {errors.city && (
                        <p className="text-sm text-red-600 mt-1">{errors.city.message}</p>
                      )}
                    </div>

                    <div>
                      <Label htmlFor="postalCode">Code postal *</Label>
                      <Input
                        id="postalCode"
                        {...register("postalCode")}
                        placeholder="33000"
                        className="mt-1"
                        maxLength={5}
                        inputMode="numeric"
                      />
                      {errors.postalCode && (
                        <p className="text-sm text-red-600 mt-1">{errors.postalCode.message}</p>
                      )}
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="description">Description de l'établissement</Label>
                    <Textarea
                      id="description"
                      {...register("description")}
                      placeholder="Décrivez votre établissement, ses spécialités, sa mission..."
                      className="mt-1"
                      rows={3}
                    />
                    {errors.description && (
                      <p className="text-sm text-red-600 mt-1">{errors.description.message}</p>
                    )}
                  </div>

                  <div className="flex justify-end">
                    <Button type="button" onClick={() => setStep(2)}>
                      Suivant
                    </Button>
                  </div>
                </div>
              )}

              {/* Step 2: Contact Info */}
              {step === 2 && (
                <div className="space-y-6">
                  <div className="flex items-center space-x-2 mb-6">
                    <Users className="w-5 h-5 text-emerald-600" />
                    <h3 className="text-lg font-semibold">Personne de contact</h3>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <Label htmlFor="contactFirstName">Prénom *</Label>
                      <Input
                        id="contactFirstName"
                        {...register("contactFirstName")}
                        placeholder="Marie"
                        className="mt-1"
                      />
                      {errors.contactFirstName && (
                        <p className="text-sm text-red-600 mt-1">{errors.contactFirstName.message}</p>
                      )}
                    </div>

                    <div>
                      <Label htmlFor="contactLastName">Nom *</Label>
                      <Input
                        id="contactLastName"
                        {...register("contactLastName")}
                        placeholder="Dupont"
                        className="mt-1"
                      />
                      {errors.contactLastName && (
                        <p className="text-sm text-red-600 mt-1">{errors.contactLastName.message}</p>
                      )}
                    </div>

                    <div>
                      <Label htmlFor="contactEmail">Email professionnel *</Label>
                      <Input
                        id="contactEmail"
                        type="email"
                        {...register("contactEmail")}
                        placeholder="marie.dupont@chu-bordeaux.fr"
                        className="mt-1"
                      />
                      {errors.contactEmail && (
                        <p className="text-sm text-red-600 mt-1">{errors.contactEmail.message}</p>
                      )}
                    </div>

                    <div>
                      <Label htmlFor="contactPhone">Téléphone *</Label>
                      <Input
                        id="contactPhone"
                        {...register("contactPhone")}
                        placeholder="05 56 12 34 56"
                        className="mt-1"
                      />
                      {errors.contactPhone && (
                        <p className="text-sm text-red-600 mt-1">{errors.contactPhone.message}</p>
                      )}
                    </div>

                    <div className="md:col-span-2">
                      <Label htmlFor="contactPosition">Poste occupé *</Label>
                      <Input
                        id="contactPosition"
                        {...register("contactPosition")}
                        placeholder="Directeur des Ressources Humaines"
                        className="mt-1"
                      />
                      {errors.contactPosition && (
                        <p className="text-sm text-red-600 mt-1">{errors.contactPosition.message}</p>
                      )}
                    </div>
                  </div>

                  {/* Mot de passe sécurisé */}
                  <div>
                    <Label htmlFor="password">Mot de passe *</Label>
                    <div className="relative mt-1">
                      <Input
                        id="password"
                        type={showPassword ? "text" : "password"}
                        {...register("password")}
                        placeholder="Mot de passe sécurisé"
                        className="pr-20"
                        value={generatedPassword || watch("password") || ""}
                        onChange={(e) => setValue("password", e.target.value)}
                      />
                      <div className="absolute right-2 top-1/2 transform -translate-y-1/2 flex space-x-1">
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => setShowPassword(!showPassword)}
                          className="h-8 w-8 p-0"
                        >
                          {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </Button>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={generateNewPassword}
                          className="h-8 w-8 p-0"
                          title="Générer un mot de passe sécurisé"
                        >
                          <RefreshCw className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                    {errors.password && (
                      <p className="text-sm text-red-600 mt-1">{errors.password.message}</p>
                    )}
                    <p className="text-xs text-muted-foreground mt-1">
                      Utilisez le bouton de génération pour créer un mot de passe sécurisé automatiquement.
                    </p>
                  </div>

                  <div className="flex justify-between">
                    <Button type="button" variant="outline" onClick={() => setStep(1)}>
                      Précédent
                    </Button>
                    <Button type="button" onClick={() => setStep(3)}>
                      Suivant
                    </Button>
                  </div>
                </div>
              )}

              {/* Step 3: Terms and Submit */}
              {step === 3 && (
                <div className="space-y-6">
                  <div className="flex items-center space-x-2 mb-6">
                    <Shield className="w-5 h-5 text-emerald-600" />
                    <h3 className="text-lg font-semibold">Conditions et finalisation</h3>
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-start space-x-3">
                      <Checkbox
                        id="acceptTerms"
                        {...register("acceptTerms")}
                      />
                      <div className="space-y-1">
                        <Label htmlFor="acceptTerms" className="text-sm font-medium">
                          J'accepte les conditions d'utilisation *
                        </Label>
                        <p className="text-xs text-muted-foreground">
                          En cochant cette case, vous acceptez nos conditions d'utilisation et notre politique de confidentialité.
                        </p>
                      </div>
                    </div>
                    {errors.acceptTerms && (
                      <p className="text-sm text-red-600">{errors.acceptTerms.message}</p>
                    )}

                    <div className="flex items-start space-x-3">
                      <Checkbox
                        id="acceptRgpd"
                        {...register("acceptRgpd")}
                      />
                      <div className="space-y-1">
                        <Label htmlFor="acceptRgpd" className="text-sm font-medium">
                          J'accepte la politique de confidentialité *
                        </Label>
                        <p className="text-xs text-muted-foreground">
                          Vos données personnelles seront traitées conformément au RGPD.
                        </p>
                      </div>
                    </div>
                    {errors.acceptRgpd && (
                      <p className="text-sm text-red-600">{errors.acceptRgpd.message}</p>
                    )}
                  </div>

                  <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
                    <h4 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">
                      🔐 Sécurité renforcée
                    </h4>
                    <ul className="text-sm text-blue-800 dark:text-blue-200 space-y-1">
                      <li>• Validation SIRET avec algorithme de Luhn</li>
                      <li>• Email professionnel requis</li>
                      <li>• Mot de passe sécurisé généré automatiquement</li>
                      <li>• Conformité RGPD</li>
                    </ul>
                  </div>

                  <div className="flex justify-between">
                    <Button type="button" variant="outline" onClick={() => setStep(2)}>
                      Précédent
                    </Button>
                    <Button type="submit" disabled={isSubmitting}>
                      {isSubmitting ? "Création en cours..." : "Créer mon compte"}
                    </Button>
                  </div>
                </div>
              )}
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
