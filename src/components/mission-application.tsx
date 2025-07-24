import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Clock, MapPin, Euro, User, Send, CheckCircle } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

interface MissionApplicationProps {
  open: boolean;
  onClose: () => void;
  mission: any;
  userProfile: any;
}

export function MissionApplication({ open, onClose, mission, userProfile }: MissionApplicationProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [coverLetter, setCoverLetter] = useState("");
  
  const applyMutation = useMutation({
    mutationFn: async () => {
      return apiRequest("POST", "/api/missions/apply", {
        missionId: mission.id,
        coverLetter: coverLetter.trim()
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/missions"] });
      toast({
        title: "Candidature envoyée",
        description: "Votre candidature a été transmise à l'établissement !",
      });
      onClose();
    },
    onError: (error: any) => {
      toast({
        title: "Erreur",
        description: "Impossible d'envoyer la candidature. Veuillez réessayer.",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = () => {
    if (coverLetter.trim().length < 50) {
      toast({
        title: "Message trop court",
        description: "Veuillez écrire au moins quelques lignes de motivation.",
        variant: "destructive",
      });
      return;
    }
    applyMutation.mutate();
  };

  const isCompatible = userProfile?.specialization === mission.specialization;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <Send className="w-5 h-5 text-blue-500" />
            <span>Candidater à cette mission</span>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Mission Summary */}
          <Card>
            <CardContent className="p-4">
              <div className="space-y-3">
                <h3 className="font-semibold text-lg">{mission.title}</h3>
                
                <div className="flex flex-wrap gap-2">
                  <Badge variant={isCompatible ? "default" : "secondary"}>
                    {mission.specialization}
                  </Badge>
                  <Badge variant="outline" className="flex items-center space-x-1">
                    <Euro className="w-3 h-3" />
                    <span>{mission.hourlyRate}€/h</span>
                  </Badge>
                </div>

                <div className="grid md:grid-cols-2 gap-4 text-sm">
                  <div className="flex items-center space-x-2">
                    <Clock className="w-4 h-4 text-muted-foreground" />
                    <span>
                      Du {format(new Date(mission.startDate), "dd MMM", { locale: fr })} 
                      au {format(new Date(mission.endDate), "dd MMM yyyy", { locale: fr })}
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <MapPin className="w-4 h-4 text-muted-foreground" />
                    <span>{mission.location?.city || "Ville non spécifiée"}</span>
                  </div>
                </div>

                <p className="text-sm text-muted-foreground">{mission.description}</p>
              </div>
            </CardContent>
          </Card>

          {/* Compatibility Check */}
          <Card className={isCompatible ? "border-green-200 bg-green-50 dark:bg-green-900/20" : "border-orange-200 bg-orange-50 dark:bg-orange-900/20"}>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2 mb-2">
                {isCompatible ? (
                  <CheckCircle className="w-4 h-4 text-green-600" />
                ) : (
                  <User className="w-4 h-4 text-orange-600" />
                )}
                <span className="font-medium">
                  {isCompatible ? "Profil compatible" : "Attention"}
                </span>
              </div>
              <p className="text-sm text-muted-foreground">
                {isCompatible 
                  ? `Votre spécialisation "${userProfile.specialization}" correspond parfaitement aux exigences de cette mission.`
                  : `Cette mission requiert une spécialisation en "${mission.specialization}" alors que votre profil indique "${userProfile.specialization}". Vous pouvez tout de même candidater si vous avez les compétences requises.`
                }
              </p>
            </CardContent>
          </Card>

          {/* Profile Summary */}
          <Card>
            <CardContent className="p-4">
              <h4 className="font-medium mb-3">Votre profil</h4>
              <div className="grid md:grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="font-medium">Spécialisation :</span>
                  <p className="text-muted-foreground">{userProfile.specialization}</p>
                </div>
                <div>
                  <span className="font-medium">Expérience :</span>
                  <p className="text-muted-foreground">{userProfile.experience} années</p>
                </div>
                <div>
                  <span className="font-medium">Tarif souhaité :</span>
                  <p className="text-muted-foreground">{userProfile.hourlyRate}€/h</p>
                </div>
                <div>
                  <span className="font-medium">Disponibilité :</span>
                  <p className="text-muted-foreground">
                    {userProfile.available ? "Disponible" : "Non disponible"}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Cover Letter */}
          <div className="space-y-3">
            <label className="font-medium">Lettre de motivation</label>
            <Textarea
              placeholder="Expliquez pourquoi vous souhaitez cette mission, votre expérience pertinente, et ce que vous pouvez apporter à l'équipe..."
              value={coverLetter}
              onChange={(e) => setCoverLetter(e.target.value)}
              className="min-h-[120px]"
            />
            <p className="text-xs text-muted-foreground">
              {coverLetter.length} caractères (minimum 50 recommandé)
            </p>
          </div>

          {/* Information Notice */}
          <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
            <h4 className="font-medium mb-2">Processus de candidature</h4>
            <div className="space-y-1 text-sm text-muted-foreground">
              <p>• Votre candidature sera immédiatement transmise à l'établissement</p>
              <p>• L'IA analysera la compatibilité de votre profil</p>
              <p>• Vous recevrez une notification dès qu'il y aura une réponse</p>
              <p>• En cas d'acceptation, les détails de contact seront partagés</p>
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-3 pt-4">
            <Button
              onClick={handleSubmit}
              disabled={applyMutation.isPending || coverLetter.trim().length < 10}
              className="flex-1 bg-blue-500 hover:bg-blue-600 text-white"
            >
              {applyMutation.isPending ? "Envoi..." : "Envoyer la candidature"}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={applyMutation.isPending}
              className="flex-1"
            >
              Annuler
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}