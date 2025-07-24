import React, { Component, ErrorInfo, ReactNode } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertTriangle, RefreshCw, Home, ArrowLeft } from 'lucide-react';
import { Link } from 'wouter';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
}

interface State {
  hasError: boolean;
  error?: Error;
  errorInfo?: ErrorInfo;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);

    this.setState({
      error,
      errorInfo
    });

    // Appeler le callback personnalisé si fourni
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }

    // En production, vous pourriez envoyer l'erreur à un service de monitoring
    // comme Sentry, LogRocket, etc.
    if (process.env.NODE_ENV === 'production') {
      // Exemple d'envoi à un service de monitoring
      // this.logErrorToService(error, errorInfo);
    }
  }

  private logErrorToService = (error: Error, errorInfo: ErrorInfo) => {
    // Implémentation pour envoyer l'erreur à un service externe
    try {
      fetch('/api/errors', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          error: error.message,
          stack: error.stack,
          componentStack: errorInfo.componentStack,
          timestamp: new Date().toISOString(),
          userAgent: navigator.userAgent,
          url: window.location.href,
        }),
      }).catch(console.error);
    } catch (e) {
      console.error('Failed to log error to service:', e);
    }
  };

  private handleReset = () => {
    this.setState({ hasError: false, error: undefined, errorInfo: undefined });
  };

  private handleReload = () => {
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      // Si un fallback personnalisé est fourni, l'utiliser
      if (this.props.fallback) {
        return this.props.fallback;
      }

      // UI par défaut pour les erreurs
      return (
        <div className="min-h-screen bg-background flex items-center justify-center p-4">
          <Card className="w-full max-w-md">
            <CardHeader className="text-center">
              <div className="w-16 h-16 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <AlertTriangle className="w-8 h-8 text-red-600" />
              </div>
              <CardTitle className="text-xl font-semibold text-foreground">
                Oups ! Quelque chose s'est mal passé
              </CardTitle>
            </CardHeader>
            <CardContent className="text-center space-y-6">
              <p className="text-muted-foreground">
                Une erreur inattendue s'est produite. Notre équipe a été notifiée et travaille à la résolution.
              </p>

              {process.env.NODE_ENV === 'development' && this.state.error && (
                <details className="text-left">
                  <summary className="cursor-pointer text-sm font-medium text-muted-foreground hover:text-foreground">
                    Détails techniques (développement)
                  </summary>
                  <div className="mt-2 p-3 bg-muted rounded-lg text-xs font-mono overflow-auto max-h-32">
                    <div className="text-red-600 font-semibold mb-1">
                      {this.state.error.name}: {this.state.error.message}
                    </div>
                    <div className="text-muted-foreground whitespace-pre-wrap">
                      {this.state.error.stack}
                    </div>
                    {this.state.errorInfo && (
                      <div className="mt-2 text-muted-foreground">
                        <div className="font-semibold">Component Stack:</div>
                        <div className="whitespace-pre-wrap">
                          {this.state.errorInfo.componentStack}
                        </div>
                      </div>
                    )}
                  </div>
                </details>
              )}

              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Button onClick={this.handleReset} variant="outline">
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Réessayer
                </Button>
                <Button onClick={this.handleReload}>
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Recharger la page
                </Button>
              </div>

              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Button variant="ghost" asChild>
                  <Link href="/">
                    <Home className="w-4 h-4 mr-2" />
                    Accueil
                  </Link>
                </Button>
                <Button variant="ghost" onClick={() => window.history.back()}>
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Retour
                </Button>
              </div>

              <div className="text-xs text-muted-foreground">
                <p>Si le problème persiste, contactez notre support :</p>
                <p className="font-medium">support@nurselink-ai.com</p>
              </div>
            </CardContent>
          </Card>
        </div>
      );
    }

    return this.props.children;
  }
}

// Hook pour utiliser l'ErrorBoundary dans les composants fonctionnels
export function useErrorHandler() {
  const [error, setError] = React.useState<Error | null>(null);

  const handleError = React.useCallback((error: Error) => {
    console.error('Error caught by useErrorHandler:', error);
    setError(error);
  }, []);

  const clearError = React.useCallback(() => {
    setError(null);
  }, []);

  return { error, handleError, clearError };
}

// Composant pour afficher les erreurs dans les composants fonctionnels
interface ErrorDisplayProps {
  error: Error | null;
  onRetry?: () => void;
  onClear?: () => void;
}

export function ErrorDisplay({ error, onRetry, onClear }: ErrorDisplayProps) {
  if (!error) return null;

  return (
    <Card className="border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-950/20">
      <CardContent className="p-4">
        <div className="flex items-start space-x-3">
          <AlertTriangle className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
          <div className="flex-1">
            <h4 className="font-medium text-red-900 dark:text-red-100">
              Une erreur s'est produite
            </h4>
            <p className="text-sm text-red-700 dark:text-red-200 mt-1">
              {error.message}
            </p>
            <div className="flex space-x-2 mt-3">
              {onRetry && (
                <Button size="sm" variant="outline" onClick={onRetry}>
                  <RefreshCw className="w-4 h-4 mr-1" />
                  Réessayer
                </Button>
              )}
              {onClear && (
                <Button size="sm" variant="ghost" onClick={onClear}>
                  Fermer
                </Button>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
