import { Switch, Route } from "wouter";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./lib/queryClient";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@/components/theme-provider";
import { useAuth } from "@/hooks/useAuth";
import LandingSimple from "@/pages/landing-simple";
import AuthPage from "@/pages/auth-page";
import Home from "@/pages/home";
import Dashboard from "@/pages/dashboard";
import DashboardFixed from "@/pages/dashboard-fixed";
import MobileApp from "@/pages/mobile-app";
import MobileDemo from "@/pages/mobile-demo";
import NotFound from "@/pages/not-found";
import ProfileSelector from "@/pages/profile-selector";
import ProfileCreator from "@/pages/profile-creator";
import EstablishmentSignup from "@/pages/establishment-signup";
import EstablishmentDashboard from "@/pages/establishment-dashboard";
import EstablishmentDashboardDemo from "@/pages/establishment-dashboard-demo";
import MissionCreator from "@/pages/mission-creator";
import MissionCreatorSimple from "@/pages/mission-creator-simple";
import MissionTemplates from "@/pages/mission-templates";
import ContractsPage from "@/pages/contracts";
import ContractDemo from "@/pages/contract-demo";
import ContractTest from "@/pages/contract-test";
import AIAssistant from "@/pages/ai-assistant";
import AnalyticsDashboard from "@/pages/analytics-dashboard";
import AIAssistantDemo from "@/pages/ai-assistant-demo";
import AnalyticsDemo from "@/pages/analytics-demo";
import MatchingDemo from "@/pages/matching-demo";
import AutoMatchingDemo from "@/pages/auto-matching-demo";
import NurseNotifications from "@/pages/nurse-notifications";
import SettingsPage from "@/pages/settings";
import WorkflowExplanation from "@/pages/workflow-explanation";
import ScoringConfiguration from "@/pages/scoring-configuration";
import DoseCalculator from "@/pages/dose-calculator";
import { Suspense } from "react";
import { Skeleton } from "@/components/ui/skeleton";

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
      <Route path="/landing-simple" component={LandingSimple} />
      <Route path="/auth-page" component={AuthPage} />
      <Route path="/auth" component={AuthPage} />
      <Route path="/" component={isAuthenticated ? Home : LandingSimple} />
      <Route path="/mobile-app" component={MobileApp} />
      <Route path="/mobile-demo" component={MobileDemo} />
      <Route path="/establishment-signup" component={EstablishmentSignup} />
      <Route path="/profile-selector" component={ProfileSelector} />
      <Route path="/profile-creator" component={ProfileCreator} />
      <Route path="/contract-demo" component={ContractDemo} />
      <Route path="/contract-test" component={ContractTest} />
      <Route path="/assistant-demo" component={AIAssistantDemo} />
      <Route path="/ai-assistant-demo" component={AIAssistantDemo} />
      <Route path="/analytics-demo" component={AnalyticsDemo} />
      <Route path="/matching-demo" component={MatchingDemo} />
      <Route path="/auto-matching-demo" component={AutoMatchingDemo} />
      <Route path="/nurse-notifications" component={NurseNotifications} />
      <Route path="/workflow-explanation" component={WorkflowExplanation} />
      <Route path="/scoring-configuration" component={ScoringConfiguration} />
      <Route path="/dose-calculator" component={DoseCalculator} />
      <Route path="/assistant" component={AIAssistant} />
      <Route path="/analytics" component={AnalyticsDashboard} />
      <Route path="/establishment-dashboard-demo" component={EstablishmentDashboardDemo} />
      <Route path="/establishment-dashboard" component={EstablishmentDashboard} />
      <Route path="/mission-creator" component={MissionCreator} />
      <Route path="/mission-templates" component={MissionTemplates} />
      <Route path="/dashboard" component={Dashboard} />
      <Route path="/test-animation" component={DashboardFixed} />
      {isAuthenticated && (
        <>
          <Route path="/settings" component={SettingsPage} />
          <Route path="/contracts" component={ContractsPage} />
          <Route path="/assistant" component={AIAssistant} />
          <Route path="/analytics" component={AnalyticsDashboard} />
          <Route path="/mobile" component={MobileApp} />
        </>
      )}
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
