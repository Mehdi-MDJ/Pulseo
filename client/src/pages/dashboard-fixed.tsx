import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Undo2 } from "lucide-react";

export default function DashboardFixed() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [rejectedCandidates, setRejectedCandidates] = useState<Set<string>>(new Set());

  // Données des candidatures
  const { data: candidatesByMission, refetch: refetchCandidates } = useQuery({
    queryKey: ['/api/establishment/candidates'],
    enabled: true,
  });

  // Mutation pour rejeter un candidat
  const rejectMutation = useMutation({
    mutationFn: async (candidateId: string) => {
      await apiRequest('PUT', `/api/establishment/candidates/${candidateId}/reject`);
    },
    onSuccess: (_, candidateId) => {
      // Marquer comme rejeté localement pour l'animation
      setRejectedCandidates(prev => new Set(prev).add(candidateId));
      
      // Forcer le rechargement des données
      refetchCandidates();
      
      // Timer pour retirer l'animation après 10 secondes
      setTimeout(() => {
        setRejectedCandidates(prev => {
          const newSet = new Set(prev);
          newSet.delete(candidateId);
          return newSet;
        });
      }, 10000);
      
      // Notification claire
      alert("🔴 CANDIDATURE REJETÉE !\n\nL'animation rouge est maintenant visible dans la liste ci-dessous.");
    }
  });

  const handleReject = (candidateId: string) => {
    rejectMutation.mutate(candidateId);
  };

  const handleUndoReject = (candidateId: string) => {
    setRejectedCandidates(prev => {
      const newSet = new Set(prev);
      newSet.delete(candidateId);
      return newSet;
    });
    toast({
      title: "Rejet annulé",
      description: "La candidature a été restaurée"
    });
  };

  // Candidatures pour la mission "Mission Urgences Nuit"
  const missionCandidates = (candidatesByMission as any)?.["Mission Urgences Nuit"] || [];

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-8">Test Animation Rouge - Gestion Candidatures</h1>
      
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-lg">
        <h2 className="text-xl font-semibold mb-4">Mission Urgences Nuit - Candidats</h2>
        
        {missionCandidates.length === 0 ? (
          <p className="text-gray-500">Aucun candidat disponible</p>
        ) : (
          <div className="space-y-4">
            {missionCandidates.map((candidate: any) => {
              const isRejected = rejectedCandidates.has(candidate.id);
              
              return (
                <div
                  key={candidate.id}
                  className={`p-4 rounded-lg border-2 transition-all duration-500 ${
                    isRejected
                      ? 'bg-red-100 border-red-500 animate-pulse shadow-xl'
                      : 'bg-gray-50 border-gray-200'
                  }`}
                  style={isRejected ? {
                    background: 'linear-gradient(45deg, #fee2e2, #fecaca)',
                    boxShadow: '0 0 30px rgba(239, 68, 68, 0.5)'
                  } : {}}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center text-white font-bold text-lg">
                        {candidate.candidateName?.charAt(0) || 'C'}
                      </div>
                      <div>
                        <h3 className="font-medium text-lg">{candidate.candidateName}</h3>
                        <p className="text-sm text-gray-600">
                          {candidate.experience} d'expérience • Note: {candidate.rating}/5
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-3">
                      <Badge variant={candidate.status === 'pending' ? 'secondary' : 
                                   candidate.status === 'accepted' ? 'default' : 'destructive'}>
                        {candidate.status === 'pending' ? 'En attente' :
                         candidate.status === 'accepted' ? 'Accepté' : 'Rejeté'}
                      </Badge>
                      
                      {candidate.status === 'pending' && !isRejected && (
                        <Button
                          onClick={() => handleReject(candidate.id)}
                          variant="outline"
                          className="border-red-500 text-red-600 hover:bg-red-50"
                        >
                          Rejeter
                        </Button>
                      )}
                      
                      {isRejected && (
                        <Button
                          onClick={() => handleUndoReject(candidate.id)}
                          variant="destructive"
                          className="animate-bounce bg-red-600 hover:bg-red-700 font-bold"
                          style={{
                            background: 'linear-gradient(45deg, #dc2626, #ef4444)',
                            boxShadow: '0 4px 15px rgba(220, 38, 38, 0.4)'
                          }}
                        >
                          <Undo2 className="h-4 w-4 mr-2" />
                          ANNULER LE REJET
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
      
      <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
        <h3 className="font-medium text-yellow-800 mb-2">Instructions de test :</h3>
        <ol className="text-sm text-yellow-700 space-y-1">
          <li>1. Cliquez sur "Rejeter" pour un candidat</li>
          <li>2. L'animation rouge avec pulsation doit apparaître immédiatement</li>
          <li>3. Le bouton "ANNULER LE REJET" rouge qui rebondit doit être visible</li>
          <li>4. L'animation disparaît automatiquement après 10 secondes</li>
        </ol>
      </div>
    </div>
  );
}