import { useReducer, useCallback, useRef } from 'react';
import { useToast } from './use-toast';
import { useEstablishmentMutation } from './use-establishment-query';

interface Candidate {
  id: string;
  name: string;
  status: 'pending' | 'accepted' | 'rejected';
  missionId: string;
}

interface CandidateState {
  candidates: Candidate[];
  recentlyRejected: Set<string>;
  rejectionTimers: Map<string, NodeJS.Timeout>;
}

type CandidateAction =
  | { type: 'SET_CANDIDATES'; payload: Candidate[] }
  | { type: 'ACCEPT_CANDIDATE'; payload: string }
  | { type: 'REJECT_CANDIDATE'; payload: { id: string; timer: NodeJS.Timeout } }
  | { type: 'UNDO_REJECT'; payload: string }
  | { type: 'CLEAR_REJECTION_TIMER'; payload: string };

const candidateReducer = (state: CandidateState, action: CandidateAction): CandidateState => {
  switch (action.type) {
    case 'SET_CANDIDATES':
      return {
        ...state,
        candidates: action.payload
      };

    case 'ACCEPT_CANDIDATE':
      return {
        ...state,
        candidates: state.candidates.map(candidate =>
          candidate.id === action.payload
            ? { ...candidate, status: 'accepted' }
            : candidate
        )
      };

    case 'REJECT_CANDIDATE':
      return {
        ...state,
        candidates: state.candidates.map(candidate =>
          candidate.id === action.payload.id
            ? { ...candidate, status: 'rejected' }
            : candidate
        ),
        recentlyRejected: new Set([...state.recentlyRejected, action.payload.id]),
        rejectionTimers: new Map([...state.rejectionTimers, [action.payload.id, action.payload.timer]])
      };

    case 'UNDO_REJECT':
      // Nettoyer le timer
      const timer = state.rejectionTimers.get(action.payload);
      if (timer) {
        clearTimeout(timer);
      }

      return {
        ...state,
        candidates: state.candidates.map(candidate =>
          candidate.id === action.payload
            ? { ...candidate, status: 'pending' }
            : candidate
        ),
        recentlyRejected: new Set([...state.recentlyRejected].filter(id => id !== action.payload)),
        rejectionTimers: new Map([...state.rejectionTimers].filter(([id]) => id !== action.payload))
      };

    case 'CLEAR_REJECTION_TIMER':
      const timerToClear = state.rejectionTimers.get(action.payload);
      if (timerToClear) {
        clearTimeout(timerToClear);
      }

      return {
        ...state,
        recentlyRejected: new Set([...state.recentlyRejected].filter(id => id !== action.payload)),
        rejectionTimers: new Map([...state.rejectionTimers].filter(([id]) => id !== action.payload))
      };

    default:
      return state;
  }
};

const initialState: CandidateState = {
  candidates: [],
  recentlyRejected: new Set(),
  rejectionTimers: new Map()
};

/**
 * Hook pour gérer les candidatures avec état simplifié
 */
export function useCandidateManagement() {
  const [state, dispatch] = useReducer(candidateReducer, initialState);
  const { toast } = useToast();
  const undoTimeoutRef = useRef(30000); // 30 secondes par défaut

  // Mutation pour accepter une candidature
  const acceptCandidateMutation = useEstablishmentMutation(
    async (candidateId: string) => {
      const response = await fetch(`/api/establishment/candidates/${candidateId}/accept`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('sessionToken')}`
        }
      });

      if (!response.ok) {
        throw new Error(`Erreur lors de l'acceptation: ${response.statusText}`);
      }

      return response.json();
    },
    {
      onSuccess: (data, candidateId) => {
        dispatch({ type: 'ACCEPT_CANDIDATE', payload: candidateId });
        toast({
          title: "✅ Candidature acceptée",
          description: "Le candidat a été ajouté à votre équipe.",
        });
      },
      onError: (error) => {
        toast({
          title: "❌ Erreur",
          description: error.message || "Impossible d'accepter la candidature",
          variant: "destructive"
        });
      }
    }
  );

  // Mutation pour rejeter une candidature
  const rejectCandidateMutation = useEstablishmentMutation(
    async (candidateId: string) => {
      const response = await fetch(`/api/establishment/candidates/${candidateId}/reject`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('sessionToken')}`
        }
      });

      if (!response.ok) {
        throw new Error(`Erreur lors du rejet: ${response.statusText}`);
      }

      return response.json();
    },
    {
      onSuccess: (data, candidateId) => {
        // Créer un timer pour l'annulation automatique
        const timer = setTimeout(() => {
          dispatch({ type: 'CLEAR_REJECTION_TIMER', payload: candidateId });
          toast({
            title: "⏰ Délai expiré",
            description: "Le délai d'annulation du rejet a expiré.",
          });
        }, undoTimeoutRef.current);

        dispatch({
          type: 'REJECT_CANDIDATE',
          payload: { id: candidateId, timer }
        });

        toast({
          title: "❌ Candidature rejetée",
          description: `Vous pouvez annuler cette action dans ${undoTimeoutRef.current / 1000} secondes.`,
        });
      },
      onError: (error) => {
        toast({
          title: "❌ Erreur",
          description: error.message || "Impossible de rejeter la candidature",
          variant: "destructive"
        });
      }
    }
  );

  // Mutation pour annuler un rejet
  const undoRejectMutation = useEstablishmentMutation(
    async (candidateId: string) => {
      const response = await fetch(`/api/establishment/candidates/${candidateId}/undo_reject`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('sessionToken')}`
        }
      });

      if (!response.ok) {
        throw new Error(`Erreur lors de l'annulation: ${response.statusText}`);
      }

      return response.json();
    },
    {
      onSuccess: (data, candidateId) => {
        dispatch({ type: 'UNDO_REJECT', payload: candidateId });
        toast({
          title: "✅ Rejet annulé",
          description: "La candidature a été restaurée.",
        });
      },
      onError: (error) => {
        toast({
          title: "❌ Erreur",
          description: error.message || "Impossible d'annuler le rejet",
          variant: "destructive"
        });
      }
    }
  );

  // Actions
  const setCandidates = useCallback((candidates: Candidate[]) => {
    dispatch({ type: 'SET_CANDIDATES', payload: candidates });
  }, []);

  const acceptCandidate = useCallback((candidateId: string) => {
    acceptCandidateMutation.mutate(candidateId);
  }, [acceptCandidateMutation]);

  const rejectCandidate = useCallback((candidateId: string) => {
    rejectCandidateMutation.mutate(candidateId);
  }, [rejectCandidateMutation]);

  const undoReject = useCallback((candidateId: string) => {
    undoRejectMutation.mutate(candidateId);
  }, [undoRejectMutation]);

  const setUndoTimeout = useCallback((timeout: number) => {
    undoTimeoutRef.current = timeout;
  }, []);

  // Getters
  const getPendingCandidates = useCallback(() => {
    return state.candidates.filter(c => c.status === 'pending');
  }, [state.candidates]);

  const getAcceptedCandidates = useCallback(() => {
    return state.candidates.filter(c => c.status === 'accepted');
  }, [state.candidates]);

  const getRejectedCandidates = useCallback(() => {
    return state.candidates.filter(c => c.status === 'rejected');
  }, [state.candidates]);

  const isRecentlyRejected = useCallback((candidateId: string) => {
    return state.recentlyRejected.has(candidateId);
  }, [state.recentlyRejected]);

  const getRemainingTime = useCallback((candidateId: string) => {
    // Cette fonction pourrait être implémentée pour afficher le temps restant
    // Nécessiterait de stocker le timestamp de rejet
    return undoTimeoutRef.current;
  }, []);

  return {
    // État
    candidates: state.candidates,
    recentlyRejected: state.recentlyRejected,

    // Actions
    setCandidates,
    acceptCandidate,
    rejectCandidate,
    undoReject,
    setUndoTimeout,

    // Getters
    getPendingCandidates,
    getAcceptedCandidates,
    getRejectedCandidates,
    isRecentlyRejected,
    getRemainingTime,

    // États de chargement
    isAccepting: acceptCandidateMutation.isPending,
    isRejecting: rejectCandidateMutation.isPending,
    isUndoing: undoRejectMutation.isPending
  };
}
