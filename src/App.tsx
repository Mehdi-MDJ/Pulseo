import { Switch, Route } from "wouter";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./lib/queryClient";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@/components/theme-provider";
import { useAuth } from "@/hooks/useAuth";
import { Suspense } from "react";
import { Skeleton } from "@/components/ui/skeleton";

// Pages principales
import LandingSimple from "@/pages/landing-simple";
import AuthPage from "@/pages/auth-page";
import Home from "@/pages/home";
import Dashboard from "@/pages/dashboard";
import NotFound from "@/pages/not-found";

// Pages métier
import EstablishmentDashboard from "@/pages/establishment-dashboard";
import MissionCreator from "@/pages/mission-creator";
import ContractsPage from "@/pages/contracts";
import SettingsPage from "@/pages/settings";
import EstablishmentSignup from "@/pages/establishment-signup";

function LoadingSkeleton() {
  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-7xl mx-auto space-y-6">
        <Skeleton className="h-16 w-full" />
        <div className="grid lg:grid-cols-2 gap-6">
          <div className="space-y-4">
            <Skeleton className="h-8 w-3/4" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-2/3" />
            <Skeleton className="h-10 w-32" />
          </div>
          <Skeleton className="h-80 w-full" />
        </div>
      </div>
    </div>
  );
}

function Router() {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return <LoadingSkeleton />;
  }

  return (
    <Switch>
      {/* Routes publiques */}
      <Route path="/landing-simple" component={LandingSimple} />
      <Route path="/auth-page" component={AuthPage} />
      <Route path="/auth" component={AuthPage} />
      <Route path="/establishment-signup" component={EstablishmentSignup} />
      <Route path="/" component={isAuthenticated ? Home : LandingSimple} />

      {/* Routes protégées */}
      {isAuthenticated && (
        <>
          <Route path="/dashboard" component={Dashboard} />
          <Route path="/establishment-dashboard" component={EstablishmentDashboard} />
          <Route path="/mission-creator" component={MissionCreator} />
          <Route path="/contracts" component={ContractsPage} />
          <Route path="/settings" component={SettingsPage} />
        </>
      )}

      {/* Route 404 */}
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <TooltipProvider>
          <Suspense fallback={<LoadingSkeleton />}>
            <Toaster />
            <Router />
          </Suspense>
        </TooltipProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
