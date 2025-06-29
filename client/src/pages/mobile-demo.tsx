import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Bell, MapPin, Clock, Euro, User, Calendar, Star, Award } from 'lucide-react';

export default function MobileDemo() {
  const [activeTab, setActiveTab] = useState('missions');
  
  const missions = [
    {
      id: 1,
      title: "Infirmier de nuit - CHU Lyon",
      location: "Lyon, 69003",
      hourlyRate: 28,
      urgency: "high",
      startDate: "2025-01-15",
      description: "Mission de remplacement en service des urgences pour équipe de nuit.",
      specialization: "Urgences"
    },
    {
      id: 2,
      title: "Infirmier urgences - Villeurbanne",
      location: "Villeurbanne, 69100",
      hourlyRate: 25,
      urgency: "medium",
      startDate: "2025-01-18",
      description: "Renfort d'équipe pour service d'urgences pédiatriques.",
      specialization: "Pédiatrie"
    },
    {
      id: 3,
      title: "Infirmier réanimation - Hôpital Lyon Sud",
      location: "Pierre-Bénite, 69310",
      hourlyRate: 30,
      urgency: "high",
      startDate: "2025-01-20",
      description: "Mission en réanimation médicale, expérience requise.",
      specialization: "Réanimation"
    }
  ];

  const notifications = [
    {
      id: 1,
      title: "Candidature acceptée",
      message: "Votre candidature pour la mission CHU Lyon a été acceptée !",
      type: "success",
      time: "Il y a 2h"
    },
    {
      id: 2,
      title: "Nouvelle mission",
      message: "Une mission correspondant à votre profil est disponible à Villeurbanne",
      type: "info",
      time: "Il y a 4h"
    },
    {
      id: 3,
      title: "Rappel planning",
      message: "Votre mission commence demain à 8h00 au CHU Lyon",
      type: "warning",
      time: "Il y a 6h"
    }
  ];

  const handleApplyToMission = (mission: any) => {
    alert(`Candidature envoyée pour "${mission.title}" !`);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header Mobile */}
      <div className="bg-blue-600 text-white p-4 text-center">
        <h1 className="text-xl font-bold">NurseLink AI</h1>
        <p className="text-blue-100 text-sm">Plateforme de missions médicales</p>
      </div>

      {/* Navigation Mobile */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3 bg-white border-b">
          <TabsTrigger value="missions" className="text-sm">Missions</TabsTrigger>
          <TabsTrigger value="notifications" className="text-sm">Notifications</TabsTrigger>
          <TabsTrigger value="profile" className="text-sm">Profil</TabsTrigger>
        </TabsList>

        {/* Contenu Missions */}
        <TabsContent value="missions" className="p-4 space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-semibold">Missions disponibles</h2>
            <Badge variant="secondary">{missions.length}</Badge>
          </div>
          
          {missions.map((mission) => (
            <Card key={mission.id} className="w-full">
              <CardHeader className="pb-3">
                <div className="flex justify-between items-start">
                  <CardTitle className="text-base leading-tight">{mission.title}</CardTitle>
                  <Badge 
                    variant={mission.urgency === 'high' ? 'destructive' : 'secondary'}
                    className="text-xs"
                  >
                    {mission.urgency === 'high' ? 'Urgent' : 'Modéré'}
                  </Badge>
                </div>
              </CardHeader>
              
              <CardContent className="space-y-3">
                <div className="flex items-center text-sm text-gray-600">
                  <MapPin className="w-4 h-4 mr-2" />
                  {mission.location}
                </div>
                
                <div className="flex items-center text-lg font-bold text-green-600">
                  <Euro className="w-4 h-4 mr-1" />
                  {mission.hourlyRate}/h
                </div>
                
                <div className="flex items-center text-sm text-gray-600">
                  <Calendar className="w-4 h-4 mr-2" />
                  Début: {mission.startDate}
                </div>
                
                <div className="flex items-center text-sm">
                  <Badge variant="outline" className="text-xs">
                    {mission.specialization}
                  </Badge>
                </div>
                
                <CardDescription className="text-sm">
                  {mission.description}
                </CardDescription>
                
                <Button 
                  onClick={() => handleApplyToMission(mission)}
                  className="w-full"
                >
                  Postuler
                </Button>
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        {/* Contenu Notifications */}
        <TabsContent value="notifications" className="p-4 space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-semibold">Notifications</h2>
            <Badge variant="secondary">{notifications.length}</Badge>
          </div>
          
          {notifications.map((notification) => (
            <Card key={notification.id} className="w-full">
              <CardContent className="p-4">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-medium text-sm">{notification.title}</h3>
                  <span className="text-xs text-gray-500">{notification.time}</span>
                </div>
                <p className="text-sm text-gray-600">{notification.message}</p>
                <div className="mt-2">
                  <Badge 
                    variant={
                      notification.type === 'success' ? 'default' : 
                      notification.type === 'warning' ? 'secondary' : 'outline'
                    }
                    className="text-xs"
                  >
                    {notification.type === 'success' ? 'Succès' : 
                     notification.type === 'warning' ? 'Important' : 'Info'}
                  </Badge>
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        {/* Contenu Profil */}
        <TabsContent value="profile" className="p-4 space-y-4">
          <Card>
            <CardHeader className="text-center">
              <div className="w-20 h-20 bg-blue-100 rounded-full mx-auto flex items-center justify-center mb-4">
                <User className="w-10 h-10 text-blue-600" />
              </div>
              <CardTitle className="text-lg">Marie Dupont</CardTitle>
              <CardDescription>Infirmière Diplômée d'État</CardDescription>
            </CardHeader>
            
            <CardContent className="space-y-4">
              {/* Statistiques */}
              <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                  <div className="text-2xl font-bold text-blue-600">42</div>
                  <div className="text-xs text-gray-600">Missions</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-blue-600">4.8/5</div>
                  <div className="text-xs text-gray-600">Note</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-blue-600">5 ans</div>
                  <div className="text-xs text-gray-600">Expérience</div>
                </div>
              </div>
              
              {/* Spécialisations */}
              <div className="border-t pt-4">
                <h4 className="font-medium mb-2 text-sm">Spécialisations</h4>
                <div className="flex flex-wrap gap-2">
                  <Badge variant="outline" className="text-xs">Urgences</Badge>
                  <Badge variant="outline" className="text-xs">Réanimation</Badge>
                  <Badge variant="outline" className="text-xs">Soins intensifs</Badge>
                </div>
              </div>
              
              {/* Certifications */}
              <div className="border-t pt-4">
                <h4 className="font-medium mb-2 text-sm">Certifications</h4>
                <div className="space-y-2">
                  <div className="flex items-center text-sm">
                    <Award className="w-4 h-4 mr-2 text-green-600" />
                    Formation aux urgences vitales
                  </div>
                  <div className="flex items-center text-sm">
                    <Award className="w-4 h-4 mr-2 text-green-600" />
                    Certification réanimation adulte
                  </div>
                </div>
              </div>
              
              <Button variant="outline" className="w-full">
                Modifier le profil
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}