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
import { Hospital, MapPin, Phone, FileText, Building } from "lucide-react";
import { insertEstablishmentProfileSchema } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { z } from "zod";

const formSchema = insertEstablishmentProfileSchema;

interface EstablishmentProfileFormProps {
  open: boolean;
  onClose: () => void;
}

export function EstablishmentProfileForm({ open, onClose }: EstablishmentProfileFormProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      type: "",
      siretNumber: "",
      address: "",
      contactPerson: "",
      contactPhone: "",
      location: {},
    },
  });

  const createProfileMutation = useMutation({
    mutationFn: async (data: any) => {
      const processedData = {
        ...data,
        location: {
          address: data.address,
          lat: 45.7640,
          lng: 4.8357, // Lyon coordinates as default - would be geocoded in real app
        },
      };

      return apiRequest("POST", "/api/establishment/profile", processedData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
      toast({
        title: "Profil créé",
        description: "Votre profil établissement a été créé avec succès !",
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

  const establishmentTypes = [
    "Hôpital public",
    "Clinique privée",
    "EHPAD",
    "Maison de retraite",
    "Centre de soins",
    "Cabinet médical",
    "Laboratoire",
    "Centre de dialyse",
    "Maison médicale",
    "Clinique spécialisée",
    "Autre",
  ];

  return (
    <Dialog open={open} onOpenChange={() => {}}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <Hospital className="w-5 h-5 action-orange" />
            <span>Créer votre profil établissement</span>
          </DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Basic Information */}
            <div className="space-y-4">
              <h3 className="font-semibold text-lg flex items-center space-x-2">
                <Building className="w-4 h-4" />
                <span>Informations générales</span>
              </h3>

              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nom de l'établissement *</FormLabel>
                    <FormControl>
                      <Input placeholder="CHU Lyon Sud" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Type d'établissement *</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Sélectionnez le type d'établissement" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {establishmentTypes.map((type) => (
                          <SelectItem key={type} value={type}>
                            {type}
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
                name="siret"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Numéro SIRET</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="12345678901234"
                        {...field}
                        onChange={e => {
                          field.onChange(e);
                          form.trigger("siret");
                        }}
                        maxLength={14}
                        inputMode="numeric"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Location Information */}
            <div className="space-y-4">
              <h3 className="font-semibold text-lg flex items-center space-x-2">
                <MapPin className="w-4 h-4" />
                <span>Localisation</span>
              </h3>

              <FormField
                control={form.control}
                name="address"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Adresse complète *</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="123 Avenue de la Santé, 69000 Lyon, France"
                        className="min-h-[80px]"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Contact Information */}
            <div className="space-y-4">
              <h3 className="font-semibold text-lg flex items-center space-x-2">
                <Phone className="w-4 h-4" />
                <span>Contact</span>
              </h3>

              <FormField
                control={form.control}
                name="contactPerson"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Personne de contact *</FormLabel>
                    <FormControl>
                      <Input placeholder="Dr. Martin Dupont" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="contactPhone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Téléphone de contact *</FormLabel>
                    <FormControl>
                      <Input placeholder="04 72 11 73 33" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Information Notice */}
            <div className="bg-orange-50 dark:bg-orange-900/20 p-4 rounded-lg">
              <h4 className="font-medium mb-2 flex items-center space-x-2">
                <FileText className="w-4 h-4" />
                <span>Prochaines étapes</span>
              </h4>
              <div className="space-y-2 text-sm text-muted-foreground">
                <p>Après création de votre profil, vous pourrez :</p>
                <ul className="list-disc list-inside space-y-1 ml-4">
                  <li>Créer vos premières missions</li>
                  <li>Accéder au dashboard avec prédictions IA</li>
                  <li>Gérer vos équipes et plannings</li>
                  <li>Consulter les rapports d'activité</li>
                  <li>Configurer les notifications automatiques</li>
                </ul>
              </div>
            </div>

            {/* Verification Notice */}
            <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
              <h4 className="font-medium mb-2">📋 Vérification des documents</h4>
              <p className="text-sm text-muted-foreground">
                Votre profil sera vérifié par notre équipe sous 24h. Vous recevrez un email de confirmation
                une fois la vérification terminée. En attendant, vous pouvez explorer l'interface et
                préparer vos premières missions.
              </p>
            </div>

            {/* Actions */}
            <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-3 pt-4">
              <Button
                type="submit"
                disabled={createProfileMutation.isPending}
                className="flex-1 bg-action-orange hover:bg-action-orange/90 text-white"
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
