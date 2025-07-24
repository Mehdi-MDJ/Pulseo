import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertTriangle, Shield, ArrowLeft, LogIn } from "lucide-react";
import { Link } from "wouter";

interface AccessDeniedProps {
  title?: string;
  message?: string;
  reason?: 'unauthorized' | 'forbidden' | 'not_found' | 'expired';
  showBackButton?: boolean;
  showLoginButton?: boolean;
  backUrl?: string;
  loginUrl?: string;
}

export function AccessDenied({
  title = "Accès non autorisé",
  message = "Vous n'avez pas les permissions nécessaires pour accéder à cette page.",
  reason = 'forbidden',
  showBackButton = true,
  showLoginButton = true,
  backUrl = "/",
  loginUrl = "/auth"
}: AccessDeniedProps) {

  const getIcon = () => {
    switch (reason) {
      case 'unauthorized':
        return <LogIn className="w-8 h-8 text-orange-600" />;
      case 'forbidden':
        return <Shield className="w-8 h-8 text-red-600" />;
      case 'not_found':
        return <AlertTriangle className="w-8 h-8 text-yellow-600" />;
      case 'expired':
        return <AlertTriangle className="w-8 h-8 text-orange-600" />;
      default:
        return <AlertTriangle className="w-8 h-8 text-red-600" />;
    }
  };

  const getBackgroundColor = () => {
    switch (reason) {
      case 'unauthorized':
        return 'bg-orange-50 border-orange-200 dark:bg-orange-900/20 dark:border-orange-800';
      case 'forbidden':
        return 'bg-red-50 border-red-200 dark:bg-red-900/20 dark:border-red-800';
      case 'not_found':
        return 'bg-yellow-50 border-yellow-200 dark:bg-yellow-900/20 dark:border-yellow-800';
      case 'expired':
        return 'bg-orange-50 border-orange-200 dark:bg-orange-900/20 dark:border-orange-800';
      default:
        return 'bg-red-50 border-red-200 dark:bg-red-900/20 dark:border-red-800';
    }
  };

  const getReasonMessage = () => {
    switch (reason) {
      case 'unauthorized':
        return "Vous devez être connecté pour accéder à cette page.";
      case 'forbidden':
        return "Cette page est réservée aux établissements de santé.";
      case 'not_found':
        return "La page demandée n'existe pas ou a été déplacée.";
      case 'expired':
        return "Votre session a expiré. Veuillez vous reconnecter.";
      default:
        return message;
    }
  };

  const getActions = () => {
    const actions = [];

    if (showBackButton) {
      actions.push(
        <Button key="back" variant="outline" asChild>
          <Link href={backUrl}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Retour
          </Link>
        </Button>
      );
    }

    if (showLoginButton && reason === 'unauthorized') {
      actions.push(
        <Button key="login" asChild>
          <Link href={loginUrl}>
            <LogIn className="w-4 h-4 mr-2" />
            Se connecter
          </Link>
        </Button>
      );
    }

    if (showLoginButton && reason === 'expired') {
      actions.push(
        <Button key="login" asChild>
          <Link href={loginUrl}>
            <LogIn className="w-4 h-4 mr-2" />
            Se reconnecter
          </Link>
        </Button>
      );
    }

    return actions;
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className={`w-full max-w-md ${getBackgroundColor()}`}>
        <CardHeader className="text-center pb-4">
          <div className="w-16 h-16 bg-background rounded-full flex items-center justify-center mx-auto mb-4">
            {getIcon()}
          </div>
          <CardTitle className="text-xl font-semibold text-foreground">
            {title}
          </CardTitle>
        </CardHeader>
        <CardContent className="text-center space-y-6">
          <p className="text-muted-foreground">
            {getReasonMessage()}
          </p>

          {reason === 'forbidden' && (
            <div className="bg-background/50 p-4 rounded-lg">
              <h4 className="font-medium text-sm mb-2">Pages accessibles :</h4>
              <ul className="text-xs text-muted-foreground space-y-1">
                <li>• <Link href="/" className="text-primary hover:underline">Accueil</Link></li>
                <li>• <Link href="/auth" className="text-primary hover:underline">Connexion</Link></li>
                <li>• <Link href="/establishment-signup" className="text-primary hover:underline">Inscription établissement</Link></li>
              </ul>
            </div>
          )}

          {reason === 'expired' && (
            <div className="bg-background/50 p-4 rounded-lg">
              <h4 className="font-medium text-sm mb-2">Votre session a expiré</h4>
              <p className="text-xs text-muted-foreground">
                Pour des raisons de sécurité, votre session a expiré. Veuillez vous reconnecter pour continuer.
              </p>
            </div>
          )}

          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            {getActions()}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
