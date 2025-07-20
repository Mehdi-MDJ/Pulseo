import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { User, Building } from 'lucide-react';

export default function ProfileSelector() {
  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto text-center">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">Sélection du profil</h1>
        <p className="text-gray-600 mb-8">Choisissez votre type de profil</p>

        <div className="grid md:grid-cols-2 gap-8">
          <Card className="cursor-pointer hover:shadow-lg transition-shadow">
            <CardHeader>
              <User className="w-16 h-16 text-blue-600 mx-auto mb-4" />
              <CardTitle>Infirmier</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="mb-4">Accédez aux missions disponibles et gérez vos candidatures</p>
              <Button className="w-full" asChild>
                <a href="/auth">Continuer</a>
              </Button>
            </CardContent>
          </Card>

          <Card className="cursor-pointer hover:shadow-lg transition-shadow">
            <CardHeader>
              <Building className="w-16 h-16 text-green-600 mx-auto mb-4" />
              <CardTitle>Établissement</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="mb-4">Créez des missions et gérez vos équipes</p>
              <Button className="w-full" asChild>
                <a href="/establishment-signup">Continuer</a>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
