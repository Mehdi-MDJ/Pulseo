import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { FileText, Clock, CheckCircle, XCircle, Pen, Download, AlertCircle } from "lucide-react";

interface Contract {
  id: number;
  contractNumber: string;
  title: string;
  status: string;
  startDate: string;
  endDate: string;
  hourlyRate: string;
  totalHours: string;
  totalAmount: string;
  contractContent: string;
  nurseSignature?: any;
  establishmentSignature?: any;
  sentToNurseAt?: string;
  generatedAt: string;
}

export default function ContractsPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedContract, setSelectedContract] = useState<Contract | null>(null);
  const [showSignatureDialog, setShowSignatureDialog] = useState(false);
  const [signatureDrawing, setSignatureDrawing] = useState("");

  // Récupération des contrats
  const { data: contracts = [], isLoading } = useQuery({
    queryKey: ["/api/contracts/my-contracts"],
    enabled: !!user
  });

  // Mutation pour signer un contrat
  const signatureMutation = useMutation({
    mutationFn: async (data: { contractId: number; signature: string }) => {
      return apiRequest("POST", `/api/contracts/${data.contractId}/sign`, {
        signature: data.signature,
        userAgent: navigator.userAgent
      });
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["/api/contracts/my-contracts"] });
      toast({
        title: "Contrat signé",
        description: data.isFullySigned ? 
          "Le contrat est maintenant entièrement signé et valide." :
          "Votre signature a été enregistrée. En attente de la signature de l'autre partie."
      });
      setShowSignatureDialog(false);
      setSelectedContract(null);
      setSignatureDrawing("");
    },
    onError: (error: any) => {
      toast({
        title: "Erreur",
        description: error.message || "Erreur lors de la signature du contrat",
        variant: "destructive"
      });
    }
  });

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      generated: { color: "bg-gray-500", label: "Généré" },
      sent: { color: "bg-blue-500", label: "Envoyé" },
      signed_nurse: { color: "bg-orange-500", label: "Signé infirmier" },
      signed_establishment: { color: "bg-purple-500", label: "Signé établissement" },
      completed: { color: "bg-green-500", label: "Complété" },
      cancelled: { color: "bg-red-500", label: "Annulé" }
    };

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.generated;
    return <Badge className={`${config.color} text-white`}>{config.label}</Badge>;
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed": return <CheckCircle className="h-5 w-5 text-green-500" />;
      case "cancelled": return <XCircle className="h-5 w-5 text-red-500" />;
      case "sent": return <Clock className="h-5 w-5 text-blue-500" />;
      default: return <FileText className="h-5 w-5 text-gray-500" />;
    }
  };

  const canSign = (contract: Contract) => {
    if (contract.status === "completed" || contract.status === "cancelled") return false;
    
    // Déterminer si l'utilisateur peut signer
    const isNurse = user?.role === "nurse";
    const isEstablishment = user?.role === "establishment";
    
    if (isNurse && !contract.nurseSignature) return true;
    if (isEstablishment && !contract.establishmentSignature) return true;
    
    return false;
  };

  const handleSignContract = (contract: Contract) => {
    setSelectedContract(contract);
    setShowSignatureDialog(true);
  };

  const submitSignature = () => {
    if (!selectedContract || !signatureDrawing) {
      toast({
        title: "Signature requise",
        description: "Veuillez dessiner votre signature avant de valider",
        variant: "destructive"
      });
      return;
    }

    signatureMutation.mutate({
      contractId: selectedContract.id,
      signature: signatureDrawing
    });
  };

  if (isLoading) {
    return (
      <div className="container mx-auto p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="space-y-3">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-24 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold">Mes Contrats</h1>
          <p className="text-gray-600 mt-1">
            Gérez vos contrats de mission et signatures électroniques
          </p>
        </div>
        <div className="text-sm text-gray-500">
          {contracts.length} contrat{contracts.length > 1 ? 's' : ''}
        </div>
      </div>

      {contracts.length === 0 ? (
        <Card className="text-center py-12">
          <CardContent>
            <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Aucun contrat</h3>
            <p className="text-gray-500">
              Vos contrats de mission apparaîtront ici une fois qu'une candidature sera acceptée.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {contracts.map((contract: Contract) => (
            <Card key={contract.id} className="hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      {getStatusIcon(contract.status)}
                      <CardTitle className="text-lg">{contract.title}</CardTitle>
                      {getStatusBadge(contract.status)}
                    </div>
                    <CardDescription className="text-sm">
                      Contrat N° {contract.contractNumber}
                    </CardDescription>
                  </div>
                  <div className="text-right text-sm text-gray-500">
                    <div>Généré le {new Date(contract.generatedAt).toLocaleDateString('fr-FR')}</div>
                  </div>
                </div>
              </CardHeader>
              
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                  <div>
                    <div className="text-sm font-medium text-gray-700">Période</div>
                    <div className="text-sm">
                      {new Date(contract.startDate).toLocaleDateString('fr-FR')} au{' '}
                      {new Date(contract.endDate).toLocaleDateString('fr-FR')}
                    </div>
                  </div>
                  <div>
                    <div className="text-sm font-medium text-gray-700">Taux horaire</div>
                    <div className="text-sm">{contract.hourlyRate} € / heure</div>
                  </div>
                  <div>
                    <div className="text-sm font-medium text-gray-700">Montant total</div>
                    <div className="text-sm font-semibold">{contract.totalAmount} €</div>
                  </div>
                </div>

                <Separator className="my-4" />

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    {contract.nurseSignature && (
                      <div className="flex items-center gap-1 text-green-600">
                        <CheckCircle className="h-4 w-4" />
                        <span className="text-sm">Signé infirmier</span>
                      </div>
                    )}
                    {contract.establishmentSignature && (
                      <div className="flex items-center gap-1 text-green-600">
                        <CheckCircle className="h-4 w-4" />
                        <span className="text-sm">Signé établissement</span>
                      </div>
                    )}
                    {contract.status === "completed" && (
                      <div className="flex items-center gap-1 text-green-600">
                        <CheckCircle className="h-4 w-4" />
                        <span className="text-sm font-medium">Contrat validé</span>
                      </div>
                    )}
                  </div>
                  
                  <div className="flex gap-2">
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => setSelectedContract(contract)}
                    >
                      <FileText className="h-4 w-4 mr-1" />
                      Voir
                    </Button>
                    
                    {canSign(contract) && (
                      <Button 
                        size="sm"
                        onClick={() => handleSignContract(contract)}
                        className="bg-blue-600 hover:bg-blue-700"
                      >
                        <Pen className="h-4 w-4 mr-1" />
                        Signer
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Dialog pour visualiser le contrat */}
      <Dialog open={!!selectedContract && !showSignatureDialog} onOpenChange={() => setSelectedContract(null)}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {selectedContract?.title}
            </DialogTitle>
            <DialogDescription>
              Contrat N° {selectedContract?.contractNumber}
            </DialogDescription>
          </DialogHeader>
          
          {selectedContract && (
            <div className="mt-4">
              <div 
                className="prose max-w-none"
                dangerouslySetInnerHTML={{ __html: selectedContract.contractContent }}
              />
              
              <div className="mt-6 pt-4 border-t">
                <div className="flex justify-between items-center">
                  <div className="text-sm text-gray-500">
                    Statut: {getStatusBadge(selectedContract.status)}
                  </div>
                  
                  <div className="flex gap-2">
                    {canSign(selectedContract) && (
                      <Button 
                        onClick={() => handleSignContract(selectedContract)}
                        className="bg-blue-600 hover:bg-blue-700"
                      >
                        <Pen className="h-4 w-4 mr-1" />
                        Signer ce contrat
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Dialog pour la signature électronique */}
      <Dialog open={showSignatureDialog} onOpenChange={setShowSignatureDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Signature électronique</DialogTitle>
            <DialogDescription>
              Dessinez votre signature dans l'espace ci-dessous
            </DialogDescription>
          </DialogHeader>
          
          <div className="mt-4">
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 h-32 flex items-center justify-center mb-4">
              <div className="text-center text-gray-500">
                <Pen className="h-6 w-6 mx-auto mb-2" />
                <div className="text-sm">Zone de signature</div>
                <div className="text-xs">(Cliquez et maintenez pour dessiner)</div>
              </div>
            </div>
            
            <textarea
              className="w-full h-20 p-3 border rounded-md text-sm resize-none"
              placeholder="Ou tapez votre nom complet comme signature..."
              value={signatureDrawing}
              onChange={(e) => setSignatureDrawing(e.target.value)}
            />
            
            <div className="flex items-start gap-2 mt-3 p-3 bg-amber-50 rounded-md">
              <AlertCircle className="h-4 w-4 text-amber-600 mt-0.5 flex-shrink-0" />
              <div className="text-xs text-amber-800">
                <strong>Important :</strong> En signant ce contrat, vous acceptez tous les termes et conditions. 
                Cette signature a la même valeur légale qu'une signature manuscrite.
              </div>
            </div>
          </div>
          
          <div className="flex justify-end gap-2 mt-6">
            <Button variant="outline" onClick={() => setShowSignatureDialog(false)}>
              Annuler
            </Button>
            <Button 
              onClick={submitSignature}
              disabled={signatureMutation.isPending || !signatureDrawing}
              className="bg-green-600 hover:bg-green-700"
            >
              {signatureMutation.isPending ? "Signature..." : "Valider la signature"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}