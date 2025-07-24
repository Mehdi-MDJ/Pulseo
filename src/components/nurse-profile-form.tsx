import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Badge } from "@/components/ui/badge";
import { Users, MapPin, Euro, Clock, FileText } from "lucide-react";
import { insertNurseProfileSchema } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { z } from "zod";

const formSchema = insertNurseProfileSchema.extend({
  hourlyRate: z.string().min(1, "Tarif horaire requis"),
  experience: z.string().min(1, "Expérience requise"),
});

interface NurseProfileFormProps {
  open: boolean;
  onClose: () => void;
}

export function NurseProfileForm({ open, onClose }: NurseProfileFormProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      rppsNumber: "",
      adeliNumber: "",
      specialization: "",
      experience: "",
      iban: "",
      hourlyRate: "",
      availability: {},
      location: {},
    },
  });

  const createProfileMutation = useMutation({
    mutationFn: async (data: any) => {
      const processedData = {
        ...data,
        hourlyRate: parseFloat(data.hourlyRate),
        experience: parseInt(data.experience),
        availability: {
          // Default availability - user can modify later
          monday: { available: true, morning: true, afternoon: true, night: true },
          tuesday: { available: true, morning: true, afternoon: true, night: true },
          wednesday: { available: true, morning: true, afternoon: true, night: true },
          thursday: { available: true, morning: true, afternoon: true, night: true },
          friday: { available: true, morning: true, afternoon: true, night: true },
          saturday: { available: false, morning: false, afternoon: false, night: false },
          sunday: { available: false, morning: false, afternoon: false, night: false },
        },
        location: {
          // This would be filled by geolocation or address input
          address: "À définir",
          lat: 45.7640,
          lng: 4.8357, // Lyon coordinates as default
        },
      };

      return apiRequest("POST", "/api/nurse/profile", processedData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
      toast({
        title: "Profil créé",
        description: "Votre profil infirmier a été créé avec succès !",
      });
      onClose();
    },
    onError: (error: any) => {
      toast({
        title: "Erreur",
        description: "Impossible de créer le profil. Veuillez réessayer.",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: z.infer<typeof formSchema>) => {
    createProfileMutation.mutate(data);
  };

  const specializations = [
    "Médecine générale",
    "Cardiologie",
    "Urgences",
    "Réanimation",
    "Pédiatrie",
    "Chirurgie",
    "Gériatrie",
    "Psychiatrie",
    "Oncologie",
    "Maternité",
    "Bloc opératoire",
    "Soins palliatifs",
    "Dialyse",
    "Pneumologie",
    "Neurologie",
    "Autre",
  ];

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <Users className="w-5 h-5 nurse-blue" />
            <span>Créer votre profil infirmier</span>
          </DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Professional Information */}
            <div className="space-y-4">
              <h3 className="font-semibold text-lg flex items-center space-x-2">
                <FileText className="w-4 h-4" />
                <span>Informations professionnelles</span>
              </h3>

              <div className="grid md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="rppsNumber"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Numéro RPPS</FormLabel>
                      <FormControl>
                        <Input placeholder="1234567890" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="adeliNumber"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Numéro ADELI (optionnel)</FormLabel>
                      <FormControl>
                        <Input placeholder="123456789" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="specialization"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Spécialisation principale</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Sélectionnez votre spécialisation" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {specializations.map((spec) => (
                          <SelectItem key={spec} value={spec}>
                            {spec}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="experience"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Années d'expérience</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Sélectionnez votre expérience" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="0">Débutant (0-1 an)</SelectItem>
                        <SelectItem value="2">2-3 ans</SelectItem>
                        <SelectItem value="5">5-7 ans</SelectItem>
                        <SelectItem value="10">10+ ans</SelectItem>
                        <SelectItem value="15">15+ ans</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Financial Information */}
            <div className="space-y-4">
              <h3 className="font-semibold text-lg flex items-center space-x-2">
                <Euro className="w-4 h-4" />
                <span>Informations financières</span>
              </h3>

              <FormField
                control={form.control}
                name="hourlyRate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tarif horaire souhaité (€)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        placeholder="28"
                        step="0.5"
                        min="15"
                        max="50"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="iban"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>IBAN (pour les virements)</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="FR76 1234 5678 9012 3456 7890 123"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Information Notice */}
            <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
              <h4 className="font-medium mb-2 flex items-center space-x-2">
                <MapPin className="w-4 h-4" />
                <span>Prochaines étapes</span>
              </h4>
              <div className="space-y-2 text-sm text-muted-foreground">
                <p>Après création de votre profil, vous pourrez :</p>
                <ul className="list-disc list-inside space-y-1 ml-4">
                  <li>Définir votre zone de recherche géographique</li>
                  <li>Configurer vos créneaux de disponibilité</li>
                  <li>Télécharger vos documents professionnels</li>
                  <li>Commencer à recevoir des propositions de missions</li>
                </ul>
              </div>
            </div>

            {/* Actions */}
            <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-3 pt-4">
              <Button
                type="submit"
                disabled={createProfileMutation.isPending}
                className="flex-1 bg-nurse-blue hover:bg-nurse-blue/90 text-white"
              >
                {createProfileMutation.isPending ? "Création..." : "Créer mon profil"}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                disabled={createProfileMutation.isPending}
                className="flex-1"
              >
                Plus tard
              </Button>
            </div>

            <p className="text-xs text-muted-foreground text-center">
              Toutes vos informations sont protégées et conformes au RGPD. Vous pourrez les modifier à tout moment.
            </p>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
