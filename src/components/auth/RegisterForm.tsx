import React, { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2 } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';

export function RegisterForm() {
  const { register, isRegisterLoading } = useAuth();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    firstName: '',
    lastName: '',
    role: 'NURSE' as 'NURSE' | 'ESTABLISHMENT'
  });
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!formData.email || !formData.password || !formData.firstName || !formData.lastName) {
      setError('Veuillez remplir tous les champs obligatoires');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError('Les mots de passe ne correspondent pas');
      return;
    }

    if (formData.password.length < 6) {
      setError('Le mot de passe doit contenir au moins 6 caractères');
      return;
    }

    const result = await register({
      email: formData.email,
      password: formData.password,
      firstName: formData.firstName,
      lastName: formData.lastName,
      role: formData.role
    });

    if (!result.success) {
      setError(result.error || 'Erreur d\'inscription');
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const getRoleDescription = (role: string) => {
    switch (role) {
      case 'NURSE':
        return {
          title: 'Infirmier(e)',
          description: 'Accédez aux missions, gérez votre planning et connectez-vous avec les établissements.',
          features: ['Missions disponibles', 'Planning flexible', 'Notifications en temps réel']
        };
      case 'ESTABLISHMENT':
        return {
          title: 'Établissement de santé',
          description: 'Publiez des missions, gérez vos équipes et trouvez des infirmiers qualifiés.',
          features: ['Publication de missions', 'Gestion d\'équipe', 'Suivi des performances']
        };
      default:
        return { title: '', description: '', features: [] };
    }
  };

  const roleInfo = getRoleDescription(formData.role);

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle>Inscription</CardTitle>
        <CardDescription>
          Créez votre compte NurseLink AI
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="firstName">Prénom</Label>
              <Input
                id="firstName"
                name="firstName"
                value={formData.firstName}
                onChange={(e) => handleInputChange('firstName', e.target.value)}
                placeholder="Prénom"
                autoComplete="given-name"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="lastName">Nom</Label>
              <Input
                id="lastName"
                name="lastName"
                value={formData.lastName}
                onChange={(e) => handleInputChange('lastName', e.target.value)}
                placeholder="Nom"
                autoComplete="family-name"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              name="email"
              type="email"
              value={formData.email}
              onChange={(e) => handleInputChange('email', e.target.value)}
              placeholder="votre@email.com"
              autoComplete="email"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Mot de passe</Label>
            <Input
              id="password"
              name="password"
              type="password"
              value={formData.password}
              onChange={(e) => handleInputChange('password', e.target.value)}
              placeholder="••••••••"
              autoComplete="new-password"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="confirmPassword">Confirmer le mot de passe</Label>
            <Input
              id="confirmPassword"
              name="confirmPassword"
              type="password"
              value={formData.confirmPassword}
              onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
              placeholder="••••••••"
              autoComplete="new-password"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="role">Rôle</Label>
            <Select
              value={formData.role}
              onValueChange={(value) => handleInputChange('role', value)}
            >
              <SelectTrigger id="role" name="role">
                <SelectValue placeholder="Sélectionnez votre rôle" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="NURSE">Infirmier(e)</SelectItem>
                <SelectItem value="ESTABLISHMENT">Établissement de santé</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Informations contextuelles sur le rôle sélectionné */}
          {formData.role && (
            <div className="p-4 bg-muted rounded-lg space-y-3">
              <div className="flex items-center gap-2">
                <Badge variant="secondary">{roleInfo.title}</Badge>
              </div>
              <p className="text-sm text-muted-foreground">{roleInfo.description}</p>
              <div className="space-y-1">
                <p className="text-xs font-medium text-muted-foreground">Fonctionnalités incluses :</p>
                <ul className="text-xs text-muted-foreground space-y-1">
                  {roleInfo.features.map((feature, index) => (
                    <li key={index} className="flex items-center gap-2">
                      <span className="w-1 h-1 bg-primary rounded-full"></span>
                      {feature}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}

          <Button
            type="submit"
            className="w-full"
            disabled={isRegisterLoading}
          >
            {isRegisterLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Inscription...
              </>
            ) : (
              'S\'inscrire'
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
