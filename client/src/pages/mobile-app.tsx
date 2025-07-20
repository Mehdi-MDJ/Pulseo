import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Smartphone, Download, QrCode } from 'lucide-react';

export default function MobileApp() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <Smartphone className="w-16 h-16 text-blue-600 mx-auto mb-4" />
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Application Mobile NurseLink AI</h1>
          <p className="text-xl text-gray-600">
            Accédez à vos missions et contrats depuis votre smartphone
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Download className="w-5 h-5" />
                Télécharger l'app
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button className="w-full" size="lg">
                <QrCode className="w-4 h-4 mr-2" />
                Scanner le QR Code
              </Button>
              <div className="text-center">
                <p className="text-sm text-gray-500 mb-2">Ou téléchargez directement :</p>
                <div className="space-y-2">
                  <Button variant="outline" className="w-full">
                    App Store (iOS)
                  </Button>
                  <Button variant="outline" className="w-full">
                    Google Play (Android)
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Fonctionnalités mobiles</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[
                  "Consulter vos missions en cours",
                  "Accepter/refuser des candidatures",
                  "Signer des contrats électroniquement",
                  "Recevoir des notifications en temps réel",
                  "Gérer votre profil et disponibilités"
                ].map((feature, index) => (
                  <div key={index} className="flex items-center gap-3">
                    <Badge variant="secondary" className="w-6 h-6 p-0 flex items-center justify-center">
                      ✓
                    </Badge>
                    <span>{feature}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="mt-12 text-center">
          <Button variant="outline" asChild>
            <a href="/">Retour à l'accueil</a>
          </Button>
        </div>
      </div>
    </div>
  );
}
