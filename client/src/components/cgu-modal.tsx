import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Shield, FileText, Users, Hospital } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface CGUModalProps {
  open: boolean;
  onAccept: () => void;
}

export function CGUModal({ open, onAccept }: CGUModalProps) {
  const [selectedRole, setSelectedRole] = useState<"nurse" | "establishment" | null>(null);
  const [cguAccepted, setCguAccepted] = useState(false);
  const [privacyAccepted, setPrivacyAccepted] = useState(false);
  const [notificationsAccepted, setNotificationsAccepted] = useState(false);
  const [hasScrolled, setHasScrolled] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const acceptCGUMutation = useMutation({
    mutationFn: async (role: string) => {
      return apiRequest("POST", "/api/auth/accept-cgu", { role });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
      toast({
        title: "CGU acceptées",
        description: "Bienvenue sur NurseLink AI !",
      });
      onAccept();
    },
    onError: (error: any) => {
      toast({
        title: "Erreur",
        description: "Impossible d'accepter les CGU. Veuillez réessayer.",
        variant: "destructive",
      });
    },
  });

  const handleScroll = (event: React.UIEvent<HTMLDivElement>) => {
    const target = event.target as HTMLDivElement;
    const scrollPercentage = (target.scrollTop / (target.scrollHeight - target.clientHeight)) * 100;
    if (scrollPercentage > 80) {
      setHasScrolled(true);
    }
  };

  const canAccept = selectedRole && cguAccepted && privacyAccepted && hasScrolled;

  const handleAccept = () => {
    if (!canAccept) return;
    acceptCGUMutation.mutate(selectedRole);
  };

  return (
    <Dialog open={open} modal>
      <DialogContent className="max-w-4xl max-h-[90vh] p-0">
        <DialogHeader className="bg-nurse-blue text-white p-6">
          <DialogTitle className="flex items-center space-x-3 text-xl">
            <Shield className="w-6 h-6" />
            <span>Conditions Générales d'Utilisation</span>
          </DialogTitle>
          <div className="flex items-center space-x-2 text-sm opacity-90">
            <FileText className="w-4 h-4" />
            <span>Version 2.1 - Novembre 2024</span>
            <Badge variant="secondary" className="bg-white/20 text-white border-0">
              RGPD Conforme
            </Badge>
          </div>
        </DialogHeader>

        <div className="p-6 space-y-6">
          {/* Role Selection */}
          <div className="space-y-4">
            <h3 className="font-semibold text-lg">Sélectionnez votre profil</h3>
            <div className="grid md:grid-cols-2 gap-4">
              <button
                onClick={() => setSelectedRole("nurse")}
                className={`p-4 border-2 rounded-lg transition-all text-left ${
                  selectedRole === "nurse"
                    ? "border-nurse-blue bg-blue-50 dark:bg-blue-900/20"
                    : "border-border hover:border-nurse-blue/50"
                }`}
              >
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-nurse-blue/20 rounded-lg flex items-center justify-center">
                    <Users className="w-6 h-6 nurse-blue" />
                  </div>
                  <div>
                    <h4 className="font-medium">Infirmier(e)</h4>
                    <p className="text-sm text-muted-foreground">
                      Trouvez des missions adaptées à votre profil
                    </p>
                  </div>
                </div>
              </button>

              <button
                onClick={() => setSelectedRole("establishment")}
                className={`p-4 border-2 rounded-lg transition-all text-left ${
                  selectedRole === "establishment"
                    ? "border-action-orange bg-orange-50 dark:bg-orange-900/20"
                    : "border-border hover:border-action-orange/50"
                }`}
              >
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-action-orange/20 rounded-lg flex items-center justify-center">
                    <Hospital className="w-6 h-6 action-orange" />
                  </div>
                  <div>
                    <h4 className="font-medium">Établissement</h4>
                    <p className="text-sm text-muted-foreground">
                      Trouvez rapidement du personnel qualifié
                    </p>
                  </div>
                </div>
              </button>
            </div>
          </div>

          {/* CGU Content */}
          <div className="space-y-4">
            <h3 className="font-semibold text-lg">Conditions d'utilisation</h3>
            <ScrollArea 
              className="h-64 border rounded-lg p-4 bg-muted/50"
              onScroll={handleScroll}
            >
              <div className="space-y-4 text-sm">
                <div>
                  <h4 className="font-semibold mb-2">Article 1 - Objet</h4>
                  <p className="text-muted-foreground">
                    Les présentes Conditions Générales d'Utilisation (CGU) ont pour objet de définir les modalités et conditions d'utilisation de la plateforme NurseLink AI, service de mise en relation entre professionnels de santé et établissements de soins.
                  </p>
                </div>

                <div>
                  <h4 className="font-semibold mb-2">Article 2 - Protection des données personnelles</h4>
                  <p className="text-muted-foreground">
                    Conformément au Règlement Général sur la Protection des Données (RGPD), nous nous engageons à protéger vos données personnelles. Toutes les informations collectées sont traitées dans le respect de la réglementation en vigueur et ne sont utilisées qu'aux fins de mise en relation professionnelle.
                  </p>
                  <ul className="mt-2 space-y-1 text-muted-foreground">
                    <li>• Chiffrement end-to-end de toutes les données sensibles</li>
                    <li>• Hébergement certifié HDS (Hébergeur de Données de Santé)</li>
                    <li>• Droit à l'effacement et à la portabilité des données</li>
                    <li>• Audit de sécurité régulier par des tiers certifiés</li>
                  </ul>
                </div>

                <div>
                  <h4 className="font-semibold mb-2">Article 3 - Responsabilités des utilisateurs</h4>
                  <p className="text-muted-foreground">
                    L'utilisateur s'engage à utiliser la plateforme de manière responsable et conforme aux bonnes pratiques professionnelles. Pour les infirmiers, cela inclut la vérification de leurs diplômes et autorisations d'exercer. Pour les établissements, cela inclut le respect du droit du travail et des conventions collectives.
                  </p>
                </div>

                <div>
                  <h4 className="font-semibold mb-2">Article 4 - Utilisation de l'Intelligence Artificielle</h4>
                  <p className="text-muted-foreground">
                    Notre plateforme utilise des algorithmes d'intelligence artificielle pour optimiser les mises en relation. Ces systèmes sont conçus pour être équitables et non-discriminatoires. Les décisions finales restent toujours sous contrôle humain.
                  </p>
                </div>

                <div>
                  <h4 className="font-semibold mb-2">Article 5 - Paiements et facturation</h4>
                  <p className="text-muted-foreground">
                    Les paiements sont sécurisés et transitent par des prestataires certifiés PCI-DSS. La plateforme prélève une commission uniquement sur les missions réussies. Aucun frais caché ou abonnement n'est appliqué.
                  </p>
                </div>

                <div>
                  <h4 className="font-semibold mb-2">Article 6 - Support et assistance</h4>
                  <p className="text-muted-foreground">
                    Un support technique et métier est disponible 24h/7j pour tous les utilisateurs. En cas de litige, une procédure de médiation est mise en place avant tout recours judiciaire.
                  </p>
                </div>

                <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg">
                  <p className="text-sm font-medium">
                    📋 Important : Vous devez faire défiler tout le contenu pour pouvoir accepter les conditions.
                  </p>
                </div>
              </div>
            </ScrollArea>
          </div>

          {/* Checkboxes */}
          <div className="space-y-4">
            <div className="flex items-start space-x-3">
              <Checkbox
                id="cgu"
                checked={cguAccepted}
                onCheckedChange={(checked) => setCguAccepted(checked as boolean)}
                disabled={!hasScrolled}
              />
              <label htmlFor="cgu" className="text-sm leading-relaxed">
                J'ai lu et j'accepte les{" "}
                <span className="nurse-blue font-medium">Conditions Générales d'Utilisation</span> et la{" "}
                <span className="nurse-blue font-medium">Politique de Confidentialité</span> de NurseLink AI
              </label>
            </div>

            <div className="flex items-start space-x-3">
              <Checkbox
                id="privacy"
                checked={privacyAccepted}
                onCheckedChange={(checked) => setPrivacyAccepted(checked as boolean)}
                disabled={!hasScrolled}
              />
              <label htmlFor="privacy" className="text-sm leading-relaxed">
                J'accepte le traitement de mes données personnelles conformément au RGPD pour les besoins de mise en relation professionnelle
              </label>
            </div>

            <div className="flex items-start space-x-3">
              <Checkbox
                id="notifications"
                checked={notificationsAccepted}
                onCheckedChange={(checked) => setNotificationsAccepted(checked as boolean)}
              />
              <label htmlFor="notifications" className="text-sm leading-relaxed text-muted-foreground">
                J'accepte de recevoir des notifications par email concernant les missions et actualités de la plateforme (optionnel)
              </label>
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-3 pt-4 border-t">
            <Button
              onClick={handleAccept}
              disabled={!canAccept || acceptCGUMutation.isPending}
              className="flex-1 bg-success-green hover:bg-success-green/90 text-white"
            >
              {acceptCGUMutation.isPending ? "Traitement..." : "Accepter et Continuer"}
            </Button>
            <Button variant="outline" disabled className="flex-1">
              Refuser (ferme l'application)
            </Button>
          </div>

          <p className="text-xs text-muted-foreground text-center">
            * L'acceptation des CGU est obligatoire pour accéder à la plateforme
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
