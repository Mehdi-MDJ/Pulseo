import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { User, Building, Plus, LogIn } from "lucide-react";

export default function ProfileSelector() {
  const [savedProfiles, setSavedProfiles] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchProfiles();
  }, []);

  const fetchProfiles = async () => {
    try {
      const response = await fetch('/api/saved-profiles');
      if (response.ok) {
        const profiles = await response.json();
        setSavedProfiles(profiles);
      }
    } catch (error) {
      console.error('Erreur lors du chargement des profils:', error);
    }
  };

  const selectProfile = async (profile: any) => {
    setLoading(true);
    try {
      const response = await fetch('/api/select-profile', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ profileId: profile.id }),
      });

      if (response.ok) {
        window.location.href = '/';
      }
    } catch (error) {
      console.error('Erreur lors de la sélection du profil:', error);
    }
    setLoading(false);
  };

  const createDemoNurse = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/create-demo-nurse', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        window.location.href = '/';
      }
    } catch (error) {
      console.error('Erreur lors de la création du profil démo:', error);
    }
    setLoading(false);
  };

  const loginAsDefault = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/login-default');
      if (response.ok) {
        window.location.href = '/';
      }
    } catch (error) {
      console.error('Erreur lors de la connexion par défaut:', error);
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-light-bg dark:bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-4xl">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-nurse-blue mb-2">
            Choisir un profil
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Sélectionnez un profil existant ou créez-en un nouveau
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {savedProfiles.map((profile, index) => (
            <Card key={profile.id} className="cursor-pointer hover:shadow-lg transition-shadow">
              <CardHeader>
                <CardTitle className="flex items-center text-lg">
                  {profile.role === 'nurse' ? (
                    <User className="w-5 h-5 mr-2 text-nurse-blue" />
                  ) : (
                    <Building className="w-5 h-5 mr-2 text-action-orange" />
                  )}
                  {profile.firstName} {profile.lastName}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <Badge 
                    variant="secondary" 
                    className={profile.role === 'nurse' ? 'bg-nurse-blue/10 text-nurse-blue' : 'bg-action-orange/10 text-action-orange'}
                  >
                    {profile.role === 'nurse' ? 'Infirmier(ère)' : 'Établissement'}
                  </Badge>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {profile.email}
                  </p>
                  {profile.role === 'nurse' && profile.profile?.specialization && (
                    <p className="text-sm">
                      <strong>Spécialisation:</strong> {profile.profile.specialization}
                    </p>
                  )}
                  {profile.role === 'establishment' && profile.profile?.name && (
                    <p className="text-sm">
                      <strong>Établissement:</strong> {profile.profile.name}
                    </p>
                  )}
                </div>
                <Button 
                  onClick={() => selectProfile(profile)}
                  disabled={loading}
                  className="w-full mt-4"
                  variant={profile.role === 'nurse' ? 'default' : 'secondary'}
                >
                  <LogIn className="w-4 h-4 mr-2" />
                  Sélectionner
                </Button>
              </CardContent>
            </Card>
          ))}

          {/* Carte pour créer un nouveau profil */}
          <Card className="cursor-pointer hover:shadow-lg transition-shadow border-dashed border-2">
            <CardHeader>
              <CardTitle className="flex items-center text-lg text-gray-600">
                <Plus className="w-5 h-5 mr-2" />
                Nouveau profil
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-500 mb-4">
                Créer un nouveau profil infirmier ou établissement
              </p>
              <Button 
                onClick={() => window.location.href = '/'}
                variant="outline"
                className="w-full"
                disabled={loading}
              >
                <Plus className="w-4 h-4 mr-2" />
                Créer
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Options de démonstration */}
        <div className="text-center">
          <div className="border-t pt-6">
            <p className="text-sm text-gray-500 mb-4">
              Ou utilisez un profil de démonstration
            </p>
            <div className="flex gap-4 justify-center">
              <Button 
                onClick={createDemoNurse}
                variant="outline"
                disabled={loading}
                className="text-nurse-blue border-nurse-blue hover:bg-nurse-blue hover:text-white"
              >
                <User className="w-4 h-4 mr-2" />
                Démo Infirmier
              </Button>
              <Button 
                onClick={loginAsDefault}
                variant="outline"
                disabled={loading}
                className="text-action-orange border-action-orange hover:bg-action-orange hover:text-white"
              >
                <Building className="w-4 h-4 mr-2" />
                Démo Établissement
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}