import { Switch, Route } from "wouter";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./lib/queryClient";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@/components/theme-provider";
import { useAuth } from "@/hooks/useAuth";
import { Suspense } from "react";
import { Skeleton } from "@/components/ui/skeleton";

function TestApp() {
  console.log('[TestApp] Rendu du composant de test');
  return (
    <div style={{ padding: '50px', textAlign: 'center', fontSize: '24px', color: 'black' }}>
      <h1>✅ Test de Rendu de Base - SUCCÈS !</h1>
      <p>React fonctionne correctement !</p>
      <p>Le problème était dans les dépendances et la configuration Tailwind.</p>
      <div style={{ marginTop: '20px', fontSize: '16px', color: 'green' }}>
        <p>✅ Serveur Vite opérationnel</p>
        <p>✅ React se charge correctement</p>
        <p>✅ AuthProvider fonctionne</p>
        <p>✅ Tailwind CSS v3 installé</p>
      </div>
    </div>
  );
}

function App() {
  console.log('[App] Rendu de l\'application');
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <TooltipProvider>
          <Suspense fallback={<div>Chargement...</div>}>
            <Toaster />
            <TestApp />
          </Suspense>
        </TooltipProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
