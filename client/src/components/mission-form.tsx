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
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon, Plus, MapPin, Clock, Euro } from "lucide-react";
import { insertMissionSchema, CONTRACT_TYPES } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { z } from "zod";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { cn } from "@/lib/utils";

const formSchema = z.object({
  title: z.string().min(1, "Titre requis"),
  specialization: z.string().min(1, "Spécialisation requise"),
  description: z.string().min(1, "Description requise"),
  hourlyRate: z.string().min(1, "Tarif horaire requis"),
  contractType: z.enum(["cdi", "cdd", "liberal"]).default("cdd"),
  startDate: z.date({ required_error: "Date de début requise" }),
  endDate: z.date({ required_error: "Date de fin requise" }),
  shift: z.enum(["matin", "apres-midi", "nuit", "jour"]).optional(),
  urgency: z.enum(["low", "medium", "high"]).default("medium"),
});

interface MissionFormProps {
  open: boolean;
  onClose: () => void;
  mission?: any;
}

export function MissionForm({ open, onClose, mission }: MissionFormProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const isEditing = !!mission;

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: mission?.title || "",
      specialization: mission?.specialization || "",
      description: mission?.description || "",
      hourlyRate: mission?.hourlyRate?.toString() || "",
      contractType: mission?.contractType || "cdd",
      startDate: mission?.startDate ? new Date(mission.startDate) : undefined,
      endDate: mission?.endDate ? new Date(mission.endDate) : undefined,
      shift: mission?.shift || undefined,
      urgency: mission?.urgency || "medium",
    },
  });

  const createMissionMutation = useMutation({
    mutationFn: async (data: any) => {
      const processedData = {
        ...data,
        hourlyRate: parseFloat(data.hourlyRate),
        location: {
          address: "À définir", // Sera géolocalisé plus tard
          city: "Lyon",
          coordinates: [45.7640, 4.8357]
        },
        status: "open"
      };

      if (isEditing) {
        return apiRequest("PUT", `/api/missions/${mission.id}`, processedData);
      } else {
        return apiRequest("POST", "/api/demo/missions", processedData);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/missions"] });
      toast({
        title: isEditing ? "Mission modifiée" : "Mission créée",
        description: isEditing 
          ? "La mission a été modifiée avec succès !"
          : "Votre mission a été créée et publiée !",
      });
      onClose();
    },
    onError: (error: any) => {
      toast({
        title: "Erreur",
        description: "Impossible de sauvegarder la mission. Veuillez réessayer.",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: z.infer<typeof formSchema>) => {
    console.log("Form submitted with data:", data);
    createMissionMutation.mutate(data);
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
            <Plus className="w-5 h-5 text-orange-500" />
            <span>{isEditing ? "Modifier la mission" : "Créer une nouvelle mission"}</span>
          </DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Basic Information */}
            <div className="space-y-4">
              <h3 className="font-semibold text-lg flex items-center space-x-2">
                <MapPin className="w-4 h-4" />
                <span>Informations générales</span>
              </h3>

              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Titre de la mission</FormLabel>
                    <FormControl>
                      <Input placeholder="Ex: Infirmière de nuit - Service de réanimation" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="specialization"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Spécialisation requise</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Sélectionnez la spécialisation" />
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
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description de la mission</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Décrivez les tâches, l'environnement de travail, les horaires..."
                        className="min-h-[100px]"
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Dates and Rate */}
            <div className="space-y-4">
              <h3 className="font-semibold text-lg flex items-center space-x-2">
                <Clock className="w-4 h-4" />
                <span>Planning et rémunération</span>
              </h3>

              <div className="grid md:grid-cols-3 gap-4">
                <FormField
                  control={form.control}
                  name="contractType"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Type de contrat</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Sélectionner le type" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="cdd">CDD - Contrat à Durée Déterminée</SelectItem>
                          <SelectItem value="cdi">CDI - Contrat à Durée Indéterminée</SelectItem>
                          <SelectItem value="liberal">Libéral - Auto-entrepreneur</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="startDate"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel>Date de début</FormLabel>
                      <Popover>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button
                              variant={"outline"}
                              className={cn(
                                "pl-3 text-left font-normal",
                                !field.value && "text-muted-foreground"
                              )}
                            >
                              {field.value ? (
                                format(field.value, "PPP", { locale: fr })
                              ) : (
                                <span>Sélectionner une date</span>
                              )}
                              <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                            </Button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            mode="single"
                            selected={field.value}
                            onSelect={field.onChange}
                            disabled={(date) =>
                              date < new Date() || date < new Date("1900-01-01")
                            }
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="endDate"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel>Date de fin</FormLabel>
                      <Popover>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button
                              variant={"outline"}
                              className={cn(
                                "pl-3 text-left font-normal",
                                !field.value && "text-muted-foreground"
                              )}
                            >
                              {field.value ? (
                                format(field.value, "PPP", { locale: fr })
                              ) : (
                                <span>Sélectionner une date</span>
                              )}
                              <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                            </Button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            mode="single"
                            selected={field.value}
                            onSelect={field.onChange}
                            disabled={(date) =>
                              date < new Date() || date < new Date("1900-01-01")
                            }
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="hourlyRate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tarif horaire proposé (€)</FormLabel>
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
            </div>

            {/* Information Notice */}
            <div className="bg-orange-50 dark:bg-orange-900/20 p-4 rounded-lg">
              <h4 className="font-medium mb-2 flex items-center space-x-2">
                <Euro className="w-4 h-4" />
                <span>Informations importantes</span>
              </h4>
              <div className="space-y-2 text-sm text-muted-foreground">
                <p>Après publication de votre mission :</p>
                <ul className="list-disc list-inside space-y-1 ml-4">
                  <li>L'IA analysera automatiquement les profils compatibles</li>
                  <li>Les infirmières qualifiées recevront une notification</li>
                  <li>Vous pourrez consulter les candidatures dans votre dashboard</li>
                  <li>Le matching intelligent optimise la sélection</li>
                </ul>
              </div>
            </div>

            {/* Actions */}
            <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-3 pt-4">
              <Button
                type="submit"
                disabled={createMissionMutation.isPending}
                className="flex-1 bg-orange-500 hover:bg-orange-600 text-white"
                onClick={(e) => {
                  console.log("Button clicked!", e);
                  console.log("Form errors:", form.formState.errors);
                }}
              >
                {createMissionMutation.isPending 
                  ? (isEditing ? "Modification..." : "Création...") 
                  : (isEditing ? "Modifier la mission" : "Publier la mission")
                }
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                disabled={createMissionMutation.isPending}
                className="flex-1"
              >
                Annuler
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}