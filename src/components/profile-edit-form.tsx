import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";

interface ProfileEditFormProps {
  open: boolean;
  onClose: () => void;
}

export function ProfileEditForm({ open, onClose }: ProfileEditFormProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [formData, setFormData] = useState({
    firstName: (user as any)?.firstName || "",
    lastName: (user as any)?.lastName || "",
    email: (user as any)?.email || "",
    phone: (user as any)?.profile?.phone || "",
    specialization: (user as any)?.profile?.specialization || "",
    experience: (user as any)?.profile?.experience?.toString() || "",
    location: (user as any)?.profile?.location?.city || "",
    hourlyRate: (user as any)?.profile?.hourlyRate || "",
    bio: (user as any)?.profile?.bio || "",
    certifications: (user as any)?.profile?.certifications?.join(", ") || "",
    availability: (user as any)?.profile?.availability || ""
  });

  const updateProfileMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await fetch('/api/update-profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Profil mis à jour",
        description: "Vos informations ont été sauvegardées avec succès.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
      onClose();
    },
    onError: (error) => {
      toast({
        title: "Erreur",
        description: "Impossible de mettre à jour le profil.",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateProfileMutation.mutate(formData);
  };

  if ((user as any)?.role === 'nurse') {
    return (
      <Dialog open={open} onOpenChange={onClose}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold text-nurse-blue">
              Modifier mon profil infirmier
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="firstName">Prénom</Label>
                <Input
                  id="firstName"
                  value={formData.firstName}
                  onChange={(e) => setFormData({...formData, firstName: e.target.value})}
                />
              </div>
              <div>
                <Label htmlFor="lastName">Nom</Label>
                <Input
                  id="lastName"
                  value={formData.lastName}
                  onChange={(e) => setFormData({...formData, lastName: e.target.value})}
                />
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                />
              </div>
              <div>
                <Label htmlFor="phone">Téléphone</Label>
                <Input
                  id="phone"
                  value={formData.phone}
                  onChange={(e) => setFormData({...formData, phone: e.target.value})}
                />
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="specialization">Spécialisation</Label>
                <Select value={formData.specialization} onValueChange={(value) => setFormData({...formData, specialization: value})}>
                  <SelectTrigger>
                    <SelectValue placeholder="Choisir une spécialisation" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="general">Soins généraux</SelectItem>
                    <SelectItem value="emergency">Urgences</SelectItem>
                    <SelectItem value="intensive">Soins intensifs</SelectItem>
                    <SelectItem value="pediatric">Pédiatrie</SelectItem>
                    <SelectItem value="geriatric">Gériatrie</SelectItem>
                    <SelectItem value="psychiatric">Psychiatrie</SelectItem>
                    <SelectItem value="surgical">Bloc opératoire</SelectItem>
                    <SelectItem value="anesthesia">Anesthésie</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="hourlyRate">Tarif horaire (€)</Label>
                <Input
                  id="hourlyRate"
                  type="number"
                  value={formData.hourlyRate}
                  onChange={(e) => setFormData({...formData, hourlyRate: e.target.value})}
                />
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="location">Ville</Label>
                <Input
                  id="location"
                  value={formData.location}
                  onChange={(e) => setFormData({...formData, location: e.target.value})}
                />
              </div>
              <div>
                <Label htmlFor="availability">Disponibilités</Label>
                <Select value={formData.availability} onValueChange={(value) => setFormData({...formData, availability: value})}>
                  <SelectTrigger>
                    <SelectValue placeholder="Choisir vos disponibilités" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="full-time">Temps plein</SelectItem>
                    <SelectItem value="part-time">Temps partiel</SelectItem>
                    <SelectItem value="nights">Nuits uniquement</SelectItem>
                    <SelectItem value="weekends">Week-ends uniquement</SelectItem>
                    <SelectItem value="flexible">Flexible</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div>
              <Label htmlFor="bio">Présentation personnelle</Label>
              <Textarea
                id="bio"
                value={formData.bio}
                onChange={(e) => setFormData({...formData, bio: e.target.value})}
                rows={3}
              />
            </div>
            
            <div>
              <Label htmlFor="certifications">Certifications</Label>
              <Textarea
                id="certifications"
                value={formData.certifications}
                onChange={(e) => setFormData({...formData, certifications: e.target.value})}
                placeholder="Séparez par des virgules"
                rows={2}
              />
            </div>
            
            <div className="flex space-x-3 pt-4">
              <Button type="button" variant="outline" onClick={onClose} className="flex-1">
                Annuler
              </Button>
              <Button 
                type="submit" 
                className="flex-1 bg-nurse-blue hover:bg-nurse-blue/90 text-white"
                disabled={updateProfileMutation.isPending}
              >
                {updateProfileMutation.isPending ? "Sauvegarde..." : "Sauvegarder"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    );
  }

  // Formulaire pour établissement
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-action-orange">
            Modifier mon profil établissement
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="establishmentName">Nom de l'établissement</Label>
            <Input
              id="establishmentName"
              value={formData.firstName}
              onChange={(e) => setFormData({...formData, firstName: e.target.value})}
            />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="contactEmail">Email de contact</Label>
              <Input
                id="contactEmail"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({...formData, email: e.target.value})}
              />
            </div>
            <div>
              <Label htmlFor="contactPhone">Téléphone</Label>
              <Input
                id="contactPhone"
                value={formData.phone}
                onChange={(e) => setFormData({...formData, phone: e.target.value})}
              />
            </div>
          </div>
          
          <div>
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.bio}
              onChange={(e) => setFormData({...formData, bio: e.target.value})}
              rows={3}
            />
          </div>
          
          <div className="flex space-x-3 pt-4">
            <Button type="button" variant="outline" onClick={onClose} className="flex-1">
              Annuler
            </Button>
            <Button 
              type="submit" 
              className="flex-1 bg-action-orange hover:bg-action-orange/90 text-white"
              disabled={updateProfileMutation.isPending}
            >
              {updateProfileMutation.isPending ? "Sauvegarde..." : "Sauvegarder"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}