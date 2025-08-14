import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowLeft, Save, Eye } from 'lucide-react';

export default function MissionCreatePage() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    specialization: '',
    hourlyRate: '',
    location: '',
    startDate: '',
    endDate: '',
    shift: '',
    urgent: false
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const response = await fetch('/api/missions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        navigate('/missions');
      } else {
        console.error('Erreur lors de la création de la mission');
      }
    } catch (error) {
      console.error('Erreur:', error);
    }
  };

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link to="/missions">
          <Button variant="outline" size="sm" className="flex items-center gap-2">
            <ArrowLeft className="h-4 w-4" />
            Retour
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Créer une Nouvelle Mission</h1>
          <p className="text-gray-600 mt-2">Remplissez les informations pour créer votre mission</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Formulaire */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Informations de la mission</CardTitle>
              <CardDescription>
                Définissez les détails de votre mission pour attirer les meilleurs candidats
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Titre */}
                <div className="space-y-2">
                  <Label htmlFor="title">Titre de la mission *</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => handleInputChange('title', e.target.value)}
                    placeholder="Ex: Infirmier DE - Service Réanimation"
                    required
                  />
                </div>

                {/* Description */}
                <div className="space-y-2">
                  <Label htmlFor="description">Description *</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => handleInputChange('description', e.target.value)}
                    placeholder="Décrivez les responsabilités, les exigences et les conditions de travail..."
                    rows={4}
                    required
                  />
                </div>

                {/* Spécialisation */}
                <div className="space-y-2">
                  <Label htmlFor="specialization">Spécialisation *</Label>
                  <Select value={formData.specialization} onValueChange={(value) => handleInputChange('specialization', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Sélectionnez une spécialisation" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Réanimation">Réanimation</SelectItem>
                      <SelectItem value="Urgences">Urgences</SelectItem>
                      <SelectItem value="Gériatrie">Gériatrie</SelectItem>
                      <SelectItem value="Pédiatrie">Pédiatrie</SelectItem>
                      <SelectItem value="Chirurgie">Chirurgie</SelectItem>
                      <SelectItem value="Médecine">Médecine</SelectItem>
                      <SelectItem value="Psychiatrie">Psychiatrie</SelectItem>
                      <SelectItem value="Autre">Autre</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Taux horaire */}
                <div className="space-y-2">
                  <Label htmlFor="hourlyRate">Taux horaire (€) *</Label>
                  <Input
                    id="hourlyRate"
                    type="number"
                    value={formData.hourlyRate}
                    onChange={(e) => handleInputChange('hourlyRate', e.target.value)}
                    placeholder="25"
                    min="0"
                    step="0.01"
                    required
                  />
                </div>

                {/* Localisation */}
                <div className="space-y-2">
                  <Label htmlFor="location">Localisation *</Label>
                  <Input
                    id="location"
                    value={formData.location}
                    onChange={(e) => handleInputChange('location', e.target.value)}
                    placeholder="Ex: CHU Bordeaux, 33000 Bordeaux"
                    required
                  />
                </div>

                {/* Horaires */}
                <div className="space-y-2">
                  <Label htmlFor="shift">Horaires de travail</Label>
                  <Select value={formData.shift} onValueChange={(value) => handleInputChange('shift', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Sélectionnez les horaires" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Jour (8h-20h)">Jour (8h-20h)</SelectItem>
                      <SelectItem value="Nuit (20h-8h)">Nuit (20h-8h)</SelectItem>
                      <SelectItem value="Matin (6h-14h)">Matin (6h-14h)</SelectItem>
                      <SelectItem value="Après-midi (14h-22h)">Après-midi (14h-22h)</SelectItem>
                      <SelectItem value="Flexible">Flexible</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Dates */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="startDate">Date de début</Label>
                    <Input
                      id="startDate"
                      type="date"
                      value={formData.startDate}
                      onChange={(e) => handleInputChange('startDate', e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="endDate">Date de fin</Label>
                    <Input
                      id="endDate"
                      type="date"
                      value={formData.endDate}
                      onChange={(e) => handleInputChange('endDate', e.target.value)}
                    />
                  </div>
                </div>

                {/* Urgent */}
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="urgent"
                    checked={formData.urgent}
                    onChange={(e) => handleInputChange('urgent', e.target.checked)}
                    className="rounded"
                  />
                  <Label htmlFor="urgent">Mission urgente</Label>
                </div>

                {/* Boutons */}
                <div className="flex gap-4 pt-4">
                  <Button type="submit" className="flex items-center gap-2">
                    <Save className="h-4 w-4" />
                    Créer la mission
                  </Button>
                  <Button type="button" variant="outline" onClick={() => navigate('/missions')}>
                    Annuler
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>

        {/* Aperçu */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Eye className="h-4 w-4" />
                Aperçu
              </CardTitle>
            </CardHeader>
            <CardContent>
              {formData.title ? (
                <div className="space-y-4">
                  <div>
                    <h3 className="font-semibold text-lg">{formData.title}</h3>
                    {formData.urgent && (
                      <span className="inline-block bg-red-100 text-red-800 text-xs px-2 py-1 rounded mt-1">
                        URGENT
                      </span>
                    )}
                  </div>
                  {formData.description && (
                    <p className="text-gray-600 text-sm">{formData.description}</p>
                  )}
                  <div className="space-y-2 text-sm">
                    {formData.specialization && (
                      <div>
                        <span className="font-medium">Spécialisation:</span> {formData.specialization}
                      </div>
                    )}
                    {formData.hourlyRate && (
                      <div>
                        <span className="font-medium">Taux horaire:</span> {formData.hourlyRate}€/h
                      </div>
                    )}
                    {formData.location && (
                      <div>
                        <span className="font-medium">Lieu:</span> {formData.location}
                      </div>
                    )}
                    {formData.shift && (
                      <div>
                        <span className="font-medium">Horaires:</span> {formData.shift}
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <p className="text-gray-500 text-sm">
                  Commencez à remplir le formulaire pour voir l'aperçu de votre mission
                </p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
