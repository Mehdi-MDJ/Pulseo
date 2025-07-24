import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

export default function ProfileCreator() {
  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">Création de profil</h1>
        <p className="text-gray-600 mb-8">Complétez votre profil</p>

        <Card>
          <CardHeader>
            <CardTitle>Informations personnelles</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="firstName">Prénom</Label>
              <Input id="firstName" />
            </div>
            <div>
              <Label htmlFor="lastName">Nom</Label>
              <Input id="lastName" />
            </div>
            <div>
              <Label htmlFor="phone">Téléphone</Label>
              <Input id="phone" />
            </div>
            <div>
              <Label htmlFor="address">Adresse</Label>
              <Textarea id="address" />
            </div>
            <Button className="w-full">Créer le profil</Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
