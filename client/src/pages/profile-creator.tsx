import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { User, Building, Plus, Trash2, Stethoscope } from "lucide-react";
import { z } from "zod";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

// Schemas pour les formulaires
const nurseProfileSchema = z.object({
  firstName: z.string().min(2, "Prénom requis"),
  lastName: z.string().min(2, "Nom requis"), 
  email: z.string().email("Email invalide"),
  specialization: z.string().min(1, "Spécialisation requise"),
  experience: z.number().min(0, "Expérience doit être positive"),
  certifications: z.array(z.string()).optional(),
  availableShifts: z.array(z.string()).optional(),
  hourlyRate: z.number().min(10, "Tarif horaire minimum 10€"),
  location: z.string().min(2, "Localisation requise"),
  phone: z.string().min(10, "Téléphone requis"),
});

const establishmentProfileSchema = z.object({
  name: z.string().min(2, "Nom établissement requis"),
  email: z.string().email("Email invalide"),
  type: z.string().min(1, "Type d'établissement requis"),
  address: z.string().min(5, "Adresse complète requise"),
  siret: z.string().length(14, "SIRET doit contenir 14 chiffres"),
  phone: z.string().min(10, "Téléphone requis"),
  contactPerson: z.string().min(2, "Personne de contact requise"),
  description: z.string().optional(),
});

const specializations = [
  "Médecine générale", "Cardiologie", "Urgences", "Réanimation", 
  "Pédiatrie", "Chirurgie", "Psychiatrie", "Gériatrie", 
  "Oncologie", "Bloc opératoire", "Soins intensifs"
];

const certifications = [
  "BLS", "ACLS", "PALS", "ATLS", "NRP", "CCRN", 
  "CEN", "TNCC", "ENPC", "Prise en charge douleur"
];

const shifts = [
  "Matin (6h-14h)", "Après-midi (14h-22h)", "Nuit (22h-6h)", 
  "Jour (8h-20h)", "Week-end", "Garde 24h"
];

const establishmentTypes = [
  "Hôpital public", "Clinique privée", "EHPAD", "Centre de soins", 
  "Hôpital universitaire", "Maison de retraite", "HAD"
];

export default function ProfileCreator() {
  const [selectedCertifications, setSelectedCertifications] = useState<string[]>([]);
  const [selectedShifts, setSelectedShifts] = useState<string[]>([]);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Formulaire infirmier
  const nurseForm = useForm<z.infer<typeof nurseProfileSchema>>({
    resolver: zodResolver(nurseProfileSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      specialization: "",
      experience: 0,
      certifications: [],
      availableShifts: [],
      hourlyRate: 25,
      location: "",
      phone: "",
    },
  });

  // Formulaire établissement
  const establishmentForm = useForm<z.infer<typeof establishmentProfileSchema>>({
    resolver: zodResolver(establishmentProfileSchema),
    defaultValues: {
      name: "",
      email: "",
      type: "",
      address: "",
      siret: "",
      phone: "",
      contactPerson: "",
      description: "",
    },
  });

  // Mutation pour créer un profil infirmier
  const createNurseMutation = useMutation({
    mutationFn: async (data: z.infer<typeof nurseProfileSchema>) => {
      return apiRequest('POST', '/api/profiles/nurse', data);
    },
    onSuccess: () => {
      toast({
        title: "Profil infirmier créé",
        description: "Le profil a été sauvegardé en base de données",
      });
      nurseForm.reset();
      setSelectedCertifications([]);
      setSelectedShifts([]);
      queryClient.invalidateQueries({ queryKey: ['/api/profiles'] });
    },
    onError: () => {
      toast({
        title: "Erreur",
        description: "Impossible de créer le profil infirmier",
        variant: "destructive",
      });
    },
  });

  // Mutation pour créer un profil établissement
  const createEstablishmentMutation = useMutation({
    mutationFn: async (data: z.infer<typeof establishmentProfileSchema>) => {
      return apiRequest('POST', '/api/profiles/establishment', data);
    },
    onSuccess: () => {
      toast({
        title: "Profil établissement créé",
        description: "Le profil a été sauvegardé en base de données",
      });
      establishmentForm.reset();
      queryClient.invalidateQueries({ queryKey: ['/api/profiles'] });
    },
    onError: () => {
      toast({
        title: "Erreur", 
        description: "Impossible de créer le profil établissement",
        variant: "destructive",
      });
    },
  });

  // Récupérer les profils existants
  const { data: profiles } = useQuery({
    queryKey: ['/api/profiles'],
    retry: false,
  });

  const onSubmitNurse = (data: z.infer<typeof nurseProfileSchema>) => {
    console.log("Form data:", data);
    console.log("Selected certifications:", selectedCertifications);
    console.log("Selected shifts:", selectedShifts);
    console.log("Form errors:", nurseForm.formState.errors);
    
    if (selectedCertifications.length === 0) {
      toast({
        title: "Certifications manquantes",
        description: "Veuillez sélectionner au moins une certification",
        variant: "destructive",
      });
      return;
    }
    
    if (selectedShifts.length === 0) {
      toast({
        title: "Disponibilités manquantes", 
        description: "Veuillez sélectionner au moins une disponibilité",
        variant: "destructive",
      });
      return;
    }
    
    const formData = {
      ...data,
      certifications: selectedCertifications,
      availableShifts: selectedShifts,
    };
    
    console.log("Submitting form data:", formData);
    createNurseMutation.mutate(formData);
  };

  const onSubmitEstablishment = (data: z.infer<typeof establishmentProfileSchema>) => {
    createEstablishmentMutation.mutate(data);
  };

  const addCertification = (cert: string) => {
    if (!selectedCertifications.includes(cert)) {
      setSelectedCertifications([...selectedCertifications, cert]);
    }
  };

  const removeCertification = (cert: string) => {
    setSelectedCertifications(selectedCertifications.filter(c => c !== cert));
  };

  const addShift = (shift: string) => {
    if (!selectedShifts.includes(shift)) {
      setSelectedShifts([...selectedShifts, shift]);
    }
  };

  const removeShift = (shift: string) => {
    setSelectedShifts(selectedShifts.filter(s => s !== shift));
  };

  return (
    <div className="container mx-auto p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-nurse-blue mb-2">
          Créateur de Profils - Base de Données
        </h1>
        <p className="text-muted-foreground">
          Créez des profils d'infirmiers et d'établissements sauvegardés en PostgreSQL
        </p>
      </div>

      <Tabs defaultValue="nurse" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="nurse">Profil Infirmier</TabsTrigger>
          <TabsTrigger value="establishment">Profil Établissement</TabsTrigger>
          <TabsTrigger value="list">Profils Créés</TabsTrigger>
        </TabsList>

        {/* Formulaire Infirmier */}
        <TabsContent value="nurse">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center text-nurse-green">
                <Stethoscope className="w-5 h-5 mr-2" />
                Nouveau Profil Infirmier
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Form {...nurseForm}>
                <form onSubmit={nurseForm.handleSubmit(onSubmitNurse)} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={nurseForm.control}
                      name="firstName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Prénom</FormLabel>
                          <FormControl>
                            <Input placeholder="Sophie" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={nurseForm.control}
                      name="lastName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Nom</FormLabel>
                          <FormControl>
                            <Input placeholder="Martin" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={nurseForm.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Email</FormLabel>
                          <FormControl>
                            <Input type="email" placeholder="sophie.martin@infirmiere.fr" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={nurseForm.control}
                      name="phone"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Téléphone</FormLabel>
                          <FormControl>
                            <Input placeholder="0123456789" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={nurseForm.control}
                      name="specialization"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Spécialisation</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Choisir une spécialisation" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {specializations.map(spec => (
                                <SelectItem key={spec} value={spec}>{spec}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={nurseForm.control}
                      name="experience"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Années d'expérience</FormLabel>
                          <FormControl>
                            <Input 
                              type="number" 
                              placeholder="5" 
                              {...field} 
                              onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={nurseForm.control}
                      name="hourlyRate"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Tarif horaire (€)</FormLabel>
                          <FormControl>
                            <Input 
                              type="number" 
                              placeholder="25" 
                              {...field} 
                              onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={nurseForm.control}
                      name="location"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Localisation</FormLabel>
                          <FormControl>
                            <Input placeholder="Lyon, France" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  {/* Certifications */}
                  <div>
                    <label className="text-sm font-medium">Certifications</label>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mt-2">
                      {certifications.map(cert => (
                        <Button
                          key={cert}
                          type="button"
                          variant={selectedCertifications.includes(cert) ? "default" : "outline"}
                          size="sm"
                          onClick={() => selectedCertifications.includes(cert) ? removeCertification(cert) : addCertification(cert)}
                        >
                          {cert}
                        </Button>
                      ))}
                    </div>
                    {selectedCertifications.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-2">
                        {selectedCertifications.map(cert => (
                          <Badge key={cert} variant="secondary" className="cursor-pointer" onClick={() => removeCertification(cert)}>
                            {cert} <Trash2 className="w-3 h-3 ml-1" />
                          </Badge>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Disponibilités */}
                  <div>
                    <label className="text-sm font-medium">Disponibilités</label>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-2 mt-2">
                      {shifts.map(shift => (
                        <Button
                          key={shift}
                          type="button"
                          variant={selectedShifts.includes(shift) ? "default" : "outline"}
                          size="sm"
                          onClick={() => selectedShifts.includes(shift) ? removeShift(shift) : addShift(shift)}
                        >
                          {shift}
                        </Button>
                      ))}
                    </div>
                    {selectedShifts.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-2">
                        {selectedShifts.map(shift => (
                          <Badge key={shift} variant="secondary" className="cursor-pointer" onClick={() => removeShift(shift)}>
                            {shift} <Trash2 className="w-3 h-3 ml-1" />
                          </Badge>
                        ))}
                      </div>
                    )}
                  </div>

                  <Button 
                    type="submit" 
                    className="w-full bg-nurse-green hover:bg-nurse-green/90"
                    disabled={createNurseMutation.isPending}
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    {createNurseMutation.isPending ? "Création..." : "Créer Profil Infirmier"}
                  </Button>
                </form>
              </Form>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Formulaire Établissement */}
        <TabsContent value="establishment">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center text-nurse-purple">
                <Building className="w-5 h-5 mr-2" />
                Nouveau Profil Établissement
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Form {...establishmentForm}>
                <form onSubmit={establishmentForm.handleSubmit(onSubmitEstablishment)} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={establishmentForm.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Nom de l'établissement</FormLabel>
                          <FormControl>
                            <Input placeholder="CHU Lyon Sud" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={establishmentForm.control}
                      name="type"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Type d'établissement</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Choisir un type" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {establishmentTypes.map(type => (
                                <SelectItem key={type} value={type}>{type}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={establishmentForm.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Email</FormLabel>
                          <FormControl>
                            <Input type="email" placeholder="contact@chu-lyon.fr" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={establishmentForm.control}
                      name="phone"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Téléphone</FormLabel>
                          <FormControl>
                            <Input placeholder="0472345678" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={establishmentForm.control}
                      name="siret"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>SIRET</FormLabel>
                          <FormControl>
                            <Input placeholder="12345678901234" maxLength={14} {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={establishmentForm.control}
                      name="contactPerson"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Personne de contact</FormLabel>
                          <FormControl>
                            <Input placeholder="Dr. Marie Dupont" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={establishmentForm.control}
                    name="address"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Adresse complète</FormLabel>
                        <FormControl>
                          <Input placeholder="165 Chemin du Grand Revoyet, 69495 Pierre-Bénite" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={establishmentForm.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Description (optionnel)</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="Centre hospitalier universitaire spécialisé en cardiologie et urgences..." 
                            {...field} 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <Button 
                    type="submit" 
                    className="w-full bg-nurse-purple hover:bg-nurse-purple/90"
                    disabled={createEstablishmentMutation.isPending}
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    {createEstablishmentMutation.isPending ? "Création..." : "Créer Profil Établissement"}
                  </Button>
                </form>
              </Form>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Liste des profils créés */}
        <TabsContent value="list">
          <Card>
            <CardHeader>
              <CardTitle>Profils sauvegardés en base de données</CardTitle>
            </CardHeader>
            <CardContent>
              {profiles ? (
                <div className="space-y-4">
                  <p className="text-sm text-muted-foreground">
                    {profiles.nurses?.length || 0} infirmier(s) et {profiles.establishments?.length || 0} établissement(s) créés
                  </p>
                  
                  {profiles.nurses?.length > 0 && (
                    <div>
                      <h3 className="font-semibold text-nurse-green mb-2">Infirmiers</h3>
                      <div className="grid gap-2">
                        {profiles.nurses.map((nurse: any) => (
                          <div key={nurse.id} className="border rounded-lg p-3">
                            <div className="font-medium">{nurse.firstName} {nurse.lastName}</div>
                            <div className="text-sm text-muted-foreground">
                              {nurse.specialization} • {nurse.experience} ans • {nurse.location}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {profiles.establishments?.length > 0 && (
                    <div>
                      <h3 className="font-semibold text-nurse-purple mb-2">Établissements</h3>
                      <div className="grid gap-2">
                        {profiles.establishments.map((establishment: any) => (
                          <div key={establishment.id} className="border rounded-lg p-3">
                            <div className="font-medium">{establishment.name}</div>
                            <div className="text-sm text-muted-foreground">
                              {establishment.type} • {establishment.contactPerson}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <p className="text-muted-foreground">Aucun profil créé pour le moment</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}