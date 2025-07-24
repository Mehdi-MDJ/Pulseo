import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Smartphone } from 'lucide-react';

export default function MobileDemo() {
  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto text-center">
        <Smartphone className="w-16 h-16 text-blue-600 mx-auto mb-4" />
        <h1 className="text-3xl font-bold text-gray-900 mb-4">Démo Application Mobile</h1>
        <p className="text-gray-600 mb-8">Présentation des fonctionnalités mobiles</p>

        <Card>
          <CardHeader>
            <CardTitle>Fonctionnalités disponibles</CardTitle>
          </CardHeader>
          <CardContent>
            <p>Démo en cours de développement...</p>
            <Button className="mt-4" asChild>
              <a href="/mobile-app">Voir l'app mobile</a>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
