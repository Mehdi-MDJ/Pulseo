import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar, Clock, MapPin, Euro, User, Hospital, Send, Edit } from "lucide-react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";
import { MissionApplication } from "./mission-application";
import { MissionForm } from "./mission-form";
import { useAuth } from "@/hooks/useAuth";

interface MissionCardProps {
  mission: any;
  userRole?: "nurse" | "establishment";
  mobileView?: boolean;
}

export function MissionCard({ mission, userRole, mobileView = false }: MissionCardProps) {
  const [isApplying, setIsApplying] = useState(false);
  const [showApplicationModal, setShowApplicationModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();
  
  const { data: nurseProfile } = useQuery({
    queryKey: ["/api/nurse-profile"],
    enabled: userRole === "nurse"
  });
  const queryClient = useQueryClient();

  const applyToMissionMutation = useMutation({
    mutationFn: async (missionId: number) => {
      return apiRequest("POST", `/api/missions/${missionId}/apply`);
    },
    onSuccess: () => {
      toast({
        title: "Candidature envoyée",
        description: "Votre candidature a été transmise à l'établissement.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/missions"] });
    },
    onError: (error: any) => {
      toast({
        title: "Erreur",
        description: "Impossible d'envoyer la candidature. Veuillez réessayer.",
        variant: "destructive",
      });
    },
  });

  const getStatusBadge = (status: string) => {
    const statusMap = {
      open: { label: "Ouvert", variant: "default" as const, className: "bg-nurse-blue text-white" },
      pending: { label: "En attente", variant: "secondary" as const, className: "bg-yellow-500 text-white" },
      accepted: { label: "Accepté", variant: "default" as const, className: "bg-success-green text-white" },
      in_progress: { label: "En cours", variant: "default" as const, className: "bg-success-green text-white" },
      completed: { label: "Terminé", variant: "secondary" as const, className: "bg-gray-500 text-white" },
      cancelled: { label: "Annulé", variant: "destructive" as const, className: "bg-alert-red text-white" },
    };
    
    const statusInfo = statusMap[status as keyof typeof statusMap] || statusMap.open;
    return (
      <Badge variant={statusInfo.variant} className={statusInfo.className}>
        {statusInfo.label}
      </Badge>
    );
  };

  const getPriorityBadge = (priority: string) => {
    const priorityMap = {
      low: { label: "Faible", className: "bg-gray-500 text-white" },
      medium: { label: "Normale", className: "bg-blue-500 text-white" },
      high: { label: "Élevée", className: "bg-orange-500 text-white" },
      urgent: { label: "Urgente", className: "bg-alert-red text-white" },
    };
    
    const priorityInfo = priorityMap[priority as keyof typeof priorityMap] || priorityMap.medium;
    return (
      <Badge className={priorityInfo.className}>
        {priorityInfo.label}
      </Badge>
    );
  };

  const formatDate = (date: string | Date) => {
    return format(new Date(date), "dd MMM yyyy", { locale: fr });
  };

  const formatTime = (date: string | Date) => {
    return format(new Date(date), "HH:mm");
  };

  const calculateDuration = () => {
    const start = new Date(mission.startDate);
    const end = new Date(mission.endDate);
    const hours = Math.round((end.getTime() - start.getTime()) / (1000 * 60 * 60));
    return `${hours}h`;
  };

  const handleApply = () => {
    setIsApplying(true);
    applyToMissionMutation.mutate(mission.id);
  };

  const cardSize = mobileView ? "p-3" : "p-4";
  const spacing = mobileView ? "space-y-2" : "space-y-3";

  return (
    <Card className={`hover:shadow-md transition-shadow ${mobileView ? 'shadow-sm' : ''}`}>
      <CardContent className={cardSize}>
        <div className={`${spacing}`}>
          {/* Header */}
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center space-x-2 mb-1">
                <Hospital className="w-4 h-4 text-muted-foreground" />
                <h3 className={`font-semibold ${mobileView ? 'text-sm' : 'text-base'}`}>
                  {mission.establishment?.name || "Établissement"}
                </h3>
              </div>
              <p className={`text-muted-foreground ${mobileView ? 'text-xs' : 'text-sm'}`}>
                {mission.title || mission.specialization}
              </p>
            </div>
            <div className="flex flex-col items-end space-y-1">
              {getStatusBadge(mission.status)}
              {mission.priority !== "medium" && getPriorityBadge(mission.priority)}
            </div>
          </div>

          {/* Mission Details */}
          <div className={`grid grid-cols-2 gap-2 ${mobileView ? 'text-xs' : 'text-sm'} text-muted-foreground`}>
            <div className="flex items-center space-x-1">
              <Calendar className="w-3 h-3" />
              <span>{formatDate(mission.startDate)}</span>
            </div>
            <div className="flex items-center space-x-1">
              <Clock className="w-3 h-3" />
              <span>{formatTime(mission.startDate)} - {formatTime(mission.endDate)}</span>
            </div>
            <div className="flex items-center space-x-1">
              <Clock className="w-3 h-3" />
              <span>Durée: {calculateDuration()}</span>
            </div>
            <div className="flex items-center space-x-1">
              <Euro className="w-3 h-3" />
              <span>{mission.hourlyRate}€/h</span>
            </div>
          </div>

          {/* Location */}
          {mission.location && (
            <div className={`flex items-center space-x-1 ${mobileView ? 'text-xs' : 'text-sm'} text-muted-foreground`}>
              <MapPin className="w-3 h-3" />
              <span>{mission.location.address || "Localisation disponible"}</span>
            </div>
          )}

          {/* Description */}
          {mission.description && (
            <p className={`${mobileView ? 'text-xs' : 'text-sm'} text-muted-foreground line-clamp-2`}>
              {mission.description}
            </p>
          )}

          {/* Requirements */}
          {mission.requirements && Array.isArray(mission.requirements) && mission.requirements.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {mission.requirements.slice(0, 3).map((req: string, index: number) => (
                <Badge key={index} variant="outline" className={mobileView ? "text-xs" : "text-sm"}>
                  {req}
                </Badge>
              ))}
              {mission.requirements.length > 3 && (
                <Badge variant="outline" className={mobileView ? "text-xs" : "text-sm"}>
                  +{mission.requirements.length - 3}
                </Badge>
              )}
            </div>
          )}

          {/* AI Match Score */}
          {mission.aiMatchScore && userRole === "nurse" && (
            <div className="flex items-center space-x-2">
              <span className={`${mobileView ? 'text-xs' : 'text-sm'} text-muted-foreground`}>
                Compatibilité IA:
              </span>
              <Badge className="bg-nurse-blue/20 text-nurse-blue border-nurse-blue">
                {Math.round(parseFloat(mission.aiMatchScore))}%
              </Badge>
            </div>
          )}

          {/* Actions */}
          {userRole === "nurse" && mission.status === "open" && (
            <div className={`flex ${mobileView ? 'space-x-2' : 'space-x-3'} pt-2`}>
              <Button
                onClick={() => setShowApplicationModal(true)}
                disabled={isApplying || applyToMissionMutation.isPending}
                size={mobileView ? "sm" : "default"}
                className="flex-1 bg-blue-500 hover:bg-blue-600 text-white"
              >
                <Send className="w-3 h-3 mr-1" />
                <span className={mobileView ? "text-xs" : "text-sm"}>
                  Candidater
                </span>
              </Button>
            </div>
          )}

          {userRole === "establishment" && (
            <div className="flex justify-between items-center pt-2">
              <div className={`flex items-center space-x-1 ${mobileView ? 'text-xs' : 'text-sm'} text-muted-foreground`}>
                <User className="w-3 h-3" />
                <span>
                  {mission.applications ? `${mission.applications} candidatures` : "En recherche"}
                </span>
              </div>
              <Button 
                variant="outline" 
                size={mobileView ? "sm" : "default"}
                onClick={() => setShowEditModal(true)}
              >
                <Edit className="w-3 h-3 mr-1" />
                <span className={mobileView ? "text-xs" : "text-sm"}>Modifier</span>
              </Button>
            </div>
          )}
        </div>
      </CardContent>


    </Card>
  );
}
