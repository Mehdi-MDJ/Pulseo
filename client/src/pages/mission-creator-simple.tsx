import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, Save, Send } from "lucide-react";
import { useState } from "react";
import { Link, useLocation } from "wouter";
import { useToast } from "@/hooks/use-toast";

export default function MissionCreatorSimple() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    service: "",
    shift: "",
    startDate: "",
    endDate: "",
    hourlyRate: "",
    address: "",
    contactInfo: ""
  });

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSaveDraft = async () => {
    setIsLoading(true);
    try {
      // Simulation de sauvegarde
      await new Promise(resolve => setTimeout(resolve, 1000));
      toast({ 
        title: "Brouillon sauvegardé", 
        description: "Votre mission a été sauvegardée avec succès." 
      });
    } catch (error) {
      toast({ 
        title: "Erreur", 
        description: "Impossible de sauvegarder le brouillon.", 
        variant: "destructive" 
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handlePublish = async () => {
    if (!formData.title || !formData.description || !formData.service) {
      toast({ 
        title: "Champs manquants", 
        description: "Veuillez remplir tous les champs obligatoires.", 
        variant: "destructive" 
      });
      return;
    }

    setIsLoading(true);
    try {
      // Simulation de publication
      await new Promise(resolve => setTimeout(resolve, 1500));
      toast({ 
        title: "Mission publiée", 
        description: "Votre mission est maintenant visible par les infirmiers." 
      });
      setLocation("/dashboard");
    } catch (error) {
      toast({ 
        title: "Erreur", 
        description: "Impossible de publier la mission.", 
        variant: "destructive" 
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <div className="max-w-4xl mx-auto p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Link href="/dashboard">
              <Button variant="ghost" size="sm" className="gap-2">
                <ArrowLeft className="h-4 w-4" />
                Retour au dashboard
              </Button>
            </Link>
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                Créer une mission
              </h1>
              <p className="text-gray-600 dark:text-gray-300 mt-1">
                Publiez une nouvelle mission pour recruter des infirmiers qualifiés
              </p>
            </div>
          </div>
        </div>

        {/* Formulaire principal */}
        <Card className="shadow-lg">
          <CardHeader className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white">
            <CardTitle className="text-xl">Informations de la mission</CardTitle>
          </CardHeader>
          <CardContent className="p-6 space-y-6">
            {/* Titre */}
            <div className="space-y-2">
              <Label htmlFor="title" className="text-sm font-medium">
                Titre de la mission *
              </Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => handleInputChange("title", e.target.value)}
                placeholder="Ex: Infirmier de nuit en urgences"
                className="w-full"
              />
            </div>

            {/* Description */}
            <div className="space-y-2">
              <Label htmlFor="description" className="text-sm font-medium">
                Description *
              </Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => handleInputChange("description", e.target.value)}
                placeholder="Décrivez les missions, responsabilités et exigences du poste..."
                rows={4}
                className="w-full"
              />
            </div>

            {/* Service et créneaux */}
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="service" className="text-sm font-medium">
                  Service *
                </Label>
                <Select value={formData.service} onValueChange={(value) => handleInputChange("service", value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionner un service" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="urgences">🚨 Urgences</SelectItem>
                    <SelectItem value="cardiologie">❤️ Cardiologie</SelectItem>
                    <SelectItem value="pediatrie">👶 Pédiatrie</SelectItem>
                    <SelectItem value="chirurgie">🔬 Chirurgie</SelectItem>
                    <SelectItem value="psychiatrie">🧠 Psychiatrie</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="shift" className="text-sm font-medium">
                  Créneau
                </Label>
                <Select value={formData.shift} onValueChange={(value) => handleInputChange("shift", value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionner un créneau" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="matin">🌅 Matin (6h-14h)</SelectItem>
                    <SelectItem value="apres-midi">☀️ Après-midi (14h-22h)</SelectItem>
                    <SelectItem value="nuit">🌙 Nuit (22h-6h)</SelectItem>
                    <SelectItem value="jour">📅 Jour (8h-20h)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Dates */}
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="startDate" className="text-sm font-medium">
                  Date de début
                </Label>
                <Input
                  id="startDate"
                  type="date"
                  value={formData.startDate}
                  onChange={(e) => handleInputChange("startDate", e.target.value)}
                  className="w-full"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="endDate" className="text-sm font-medium">
                  Date de fin
                </Label>
                <Input
                  id="endDate"
                  type="date"
                  value={formData.endDate}
                  onChange={(e) => handleInputChange("endDate", e.target.value)}
                  className="w-full"
                />
              </div>
            </div>

            {/* Tarif et adresse */}
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="hourlyRate" className="text-sm font-medium">
                  Tarif horaire (€)
                </Label>
                <Input
                  id="hourlyRate"
                  type="number"
                  value={formData.hourlyRate}
                  onChange={(e) => handleInputChange("hourlyRate", e.target.value)}
                  placeholder="Ex: 25"
                  className="w-full"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="address" className="text-sm font-medium">
                  Adresse
                </Label>
                <Input
                  id="address"
                  value={formData.address}
                  onChange={(e) => handleInputChange("address", e.target.value)}
                  placeholder="Adresse de l'établissement"
                  className="w-full"
                />
              </div>
            </div>

            {/* Contact */}
            <div className="space-y-2">
              <Label htmlFor="contactInfo" className="text-sm font-medium">
                Informations de contact
              </Label>
              <Input
                id="contactInfo"
                value={formData.contactInfo}
                onChange={(e) => handleInputChange("contactInfo", e.target.value)}
                placeholder="Email ou téléphone de contact"
                className="w-full"
              />
            </div>

            {/* Boutons d'action */}
            <div className="flex justify-end gap-3 pt-6 border-t">
              <Button
                variant="outline"
                onClick={handleSaveDraft}
                disabled={isLoading}
                className="gap-2"
              >
                <Save className="h-4 w-4" />
                {isLoading ? "Sauvegarde..." : "Sauver brouillon"}
              </Button>
              
              <Button
                onClick={handlePublish}
                disabled={isLoading}
                className="gap-2 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700"
              >
                <Send className="h-4 w-4" />
                {isLoading ? "Publication..." : "Publier la mission"}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}