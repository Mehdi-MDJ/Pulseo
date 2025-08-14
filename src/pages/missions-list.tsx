import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search, Plus, Filter } from 'lucide-react';

export default function MissionsListPage() {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const handleCreateMission = () => {
    console.log('Clic sur Créer une mission');
    console.log('Navigation vers /create-mission');
    try {
      navigate('/create-mission');
      console.log('Navigation réussie');
    } catch (error) {
      console.error('Erreur de navigation:', error);
    }
  };

  // Données simulées pour l'exemple
  const missions = [
    {
      id: 1,
      title: "Infirmier DE - Service Réanimation",
      description: "Recherche infirmier expérimenté pour service de réanimation polyvalente",
      service: "Réanimation",
      shift: "Nuit (22h-6h)",
      dates: "Du 25 Jan au 15 Fév 2025",
      salary: "28€/heure + primes",
      status: "published",
      urgent: true,
      specialization: "Réanimation",
      address: "CHU Bordeaux",
      candidates: 5
    },
    {
      id: 2,
      title: "Infirmier - Gériatrie",
      description: "Poste en service de gériatrie pour prise en charge personnes âgées",
      service: "Gériatrie",
      shift: "Jour (8h-20h)",
      dates: "Du 20 Jan au 28 Fév 2025",
      salary: "25€/heure",
      status: "published",
      urgent: false,
      specialization: "Gériatrie",
      address: "EHPAD Les Jardins",
      candidates: 3
    },
    {
      id: 3,
      title: "Infirmier Urgentiste",
      description: "Recherche infirmier pour service d'urgences, expérience souhaitée",
      service: "Urgences",
      shift: "Matin (6h-14h)",
      dates: "Du 30 Jan au 10 Mar 2025",
      salary: "30€/heure",
      status: "draft",
      urgent: false,
      specialization: "Urgences",
      address: "Hôpital Saint-André",
      candidates: 0
    }
  ];

  const filteredMissions = missions.filter(mission => {
    const matchesSearch = searchTerm === '' ||
      mission.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      mission.specialization.toLowerCase().includes(searchTerm.toLowerCase()) ||
      mission.description.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = statusFilter === 'all' || mission.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'published':
        return <Badge variant="default" className="bg-green-100 text-green-800">Publiée</Badge>;
      case 'draft':
        return <Badge variant="secondary">Brouillon</Badge>;
      case 'archived':
        return <Badge variant="outline">Archivée</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Missions</h1>
          <p className="text-gray-600 mt-2">Gérez vos missions et suivez les candidatures</p>
        </div>
        <Button className="flex items-center gap-2" onClick={handleCreateMission}>
          <Plus className="h-4 w-4" />
          Créer une mission
        </Button>
      </div>

      {/* Filtres */}
      <div className="flex gap-4 items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="Rechercher une mission..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Filtrer par statut" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tous les statuts</SelectItem>
            <SelectItem value="published">Publiées</SelectItem>
            <SelectItem value="draft">Brouillons</SelectItem>
            <SelectItem value="archived">Archivées</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Liste des missions */}
      <div className="grid gap-4">
        {filteredMissions.map((mission) => (
          <Card key={mission.id} className="hover:shadow-md transition-shadow">
            <CardHeader>
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <CardTitle className="text-lg">{mission.title}</CardTitle>
                    {mission.urgent && (
                      <Badge variant="destructive" className="text-xs">URGENT</Badge>
                    )}
                    {getStatusBadge(mission.status)}
                  </div>
                  <CardDescription className="text-sm text-gray-600">
                    {mission.description}
                  </CardDescription>
                </div>
                <div className="text-right">
                  <p className="text-lg font-semibold text-green-600">{mission.salary}</p>
                  <p className="text-sm text-gray-500">{mission.candidates} candidat(s)</p>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div>
                  <span className="font-medium text-gray-700">Service:</span>
                  <p className="text-gray-600">{mission.service}</p>
                </div>
                <div>
                  <span className="font-medium text-gray-700">Horaires:</span>
                  <p className="text-gray-600">{mission.shift}</p>
                </div>
                <div>
                  <span className="font-medium text-gray-700">Période:</span>
                  <p className="text-gray-600">{mission.dates}</p>
                </div>
                <div>
                  <span className="font-medium text-gray-700">Lieu:</span>
                  <p className="text-gray-600">{mission.address}</p>
                </div>
              </div>
              <div className="flex gap-2 mt-4">
                <Button variant="outline" size="sm">
                  Voir les candidats
                </Button>
                <Button variant="outline" size="sm">
                  Modifier
                </Button>
                <Button variant="outline" size="sm">
                  Archiver
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredMissions.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500 text-lg">Aucune mission trouvée</p>
          <p className="text-gray-400 mt-2">
            {searchTerm || statusFilter !== 'all'
              ? 'Essayez de modifier vos filtres'
              : 'Créez votre première mission pour commencer'
            }
          </p>
        </div>
      )}
    </div>
  );
}
