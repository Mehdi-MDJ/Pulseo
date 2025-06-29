import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, Clock, Plus, Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface ScheduleManagerProps {
  open: boolean;
  onClose: () => void;
}

interface TimeSlot {
  id: string;
  dayOfWeek: number;
  startTime: string;
  endTime: string;
  type: 'available' | 'unavailable';
}

export function ScheduleManager({ open, onClose }: ScheduleManagerProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [newSlot, setNewSlot] = useState({
    dayOfWeek: 1,
    startTime: "09:00",
    endTime: "17:00",
    type: "available" as const
  });

  const { data: schedule } = useQuery({
    queryKey: ["/api/schedule"],
    enabled: open,
  });

  const addSlotMutation = useMutation({
    mutationFn: async (slot: Omit<TimeSlot, 'id'>) => {
      const response = await fetch('/api/schedule', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(slot),
      });
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Créneau ajouté",
        description: "Votre planning a été mis à jour.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/schedule"] });
      setNewSlot({
        dayOfWeek: 1,
        startTime: "09:00",
        endTime: "17:00",
        type: "available"
      });
    },
  });

  const deleteSlotMutation = useMutation({
    mutationFn: async (slotId: string) => {
      const response = await fetch(`/api/schedule/${slotId}`, {
        method: 'DELETE',
      });
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Créneau supprimé",
        description: "Votre planning a été mis à jour.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/schedule"] });
    },
  });

  const days = [
    { value: 1, label: "Lundi" },
    { value: 2, label: "Mardi" },
    { value: 3, label: "Mercredi" },
    { value: 4, label: "Jeudi" },
    { value: 5, label: "Vendredi" },
    { value: 6, label: "Samedi" },
    { value: 0, label: "Dimanche" }
  ];

  const handleAddSlot = () => {
    if (newSlot.startTime >= newSlot.endTime) {
      toast({
        title: "Erreur",
        description: "L'heure de fin doit être après l'heure de début.",
        variant: "destructive",
      });
      return;
    }
    addSlotMutation.mutate(newSlot);
  };

  const groupedSchedule = (schedule as any)?.reduce((acc: any, slot: TimeSlot) => {
    if (!acc[slot.dayOfWeek]) {
      acc[slot.dayOfWeek] = [];
    }
    acc[slot.dayOfWeek].push(slot);
    return acc;
  }, {}) || {};

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-nurse-blue flex items-center">
            <Calendar className="w-6 h-6 mr-2" />
            Gestion du planning
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Ajouter un nouveau créneau */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center">
                <Plus className="w-5 h-5 mr-2" />
                Ajouter un créneau
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-4 gap-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">Jour</label>
                  <Select 
                    value={newSlot.dayOfWeek.toString()} 
                    onValueChange={(value) => setNewSlot({...newSlot, dayOfWeek: parseInt(value)})}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {days.map((day) => (
                        <SelectItem key={day.value} value={day.value.toString()}>
                          {day.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <label className="text-sm font-medium mb-2 block">Début</label>
                  <input
                    type="time"
                    value={newSlot.startTime}
                    onChange={(e) => setNewSlot({...newSlot, startTime: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-nurse-blue"
                  />
                </div>
                
                <div>
                  <label className="text-sm font-medium mb-2 block">Fin</label>
                  <input
                    type="time"
                    value={newSlot.endTime}
                    onChange={(e) => setNewSlot({...newSlot, endTime: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-nurse-blue"
                  />
                </div>
                
                <div>
                  <label className="text-sm font-medium mb-2 block">Type</label>
                  <Select 
                    value={newSlot.type} 
                    onValueChange={(value) => setNewSlot({...newSlot, type: value as 'available' | 'unavailable'})}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="available">Disponible</SelectItem>
                      <SelectItem value="unavailable">Indisponible</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <Button 
                onClick={handleAddSlot}
                className="mt-4 bg-nurse-blue hover:bg-nurse-blue/90 text-white"
                disabled={addSlotMutation.isPending}
              >
                <Plus className="w-4 h-4 mr-2" />
                Ajouter le créneau
              </Button>
            </CardContent>
          </Card>

          {/* Planning actuel */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Planning actuel</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {days.map((day) => (
                  <div key={day.value} className="border-b pb-3 last:border-b-0">
                    <h4 className="font-medium mb-2">{day.label}</h4>
                    <div className="flex flex-wrap gap-2">
                      {groupedSchedule[day.value]?.length ? (
                        groupedSchedule[day.value].map((slot: TimeSlot) => (
                          <div key={slot.id} className="flex items-center gap-2">
                            <Badge 
                              variant={slot.type === 'available' ? 'default' : 'secondary'}
                              className={slot.type === 'available' ? 'bg-success-green text-white' : 'bg-gray-200 text-gray-700'}
                            >
                              <Clock className="w-3 h-3 mr-1" />
                              {slot.startTime} - {slot.endTime}
                            </Badge>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => deleteSlotMutation.mutate(slot.id)}
                              className="h-6 w-6 p-0 text-red-500 hover:text-red-700"
                            >
                              <Trash2 className="w-3 h-3" />
                            </Button>
                          </div>
                        ))
                      ) : (
                        <span className="text-gray-500 text-sm">Aucun créneau défini</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Plannings prédéfinis */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Plannings prédéfinis</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-3">
                <Button 
                  variant="outline" 
                  onClick={() => {
                    // Ajouter planning semaine standard
                    for (let day = 1; day <= 5; day++) {
                      addSlotMutation.mutate({
                        dayOfWeek: day,
                        startTime: "08:00",
                        endTime: "16:00",
                        type: "available"
                      });
                    }
                  }}
                  className="justify-start"
                >
                  📅 Semaine standard (8h-16h)
                </Button>
                
                <Button 
                  variant="outline" 
                  onClick={() => {
                    // Ajouter planning nuits
                    for (let day = 1; day <= 5; day++) {
                      addSlotMutation.mutate({
                        dayOfWeek: day,
                        startTime: "20:00",
                        endTime: "06:00",
                        type: "available"
                      });
                    }
                  }}
                  className="justify-start"
                >
                  🌙 Nuits (20h-6h)
                </Button>
                
                <Button 
                  variant="outline" 
                  onClick={() => {
                    // Ajouter planning week-ends
                    [0, 6].forEach(day => {
                      addSlotMutation.mutate({
                        dayOfWeek: day,
                        startTime: "09:00",
                        endTime: "17:00",
                        type: "available"
                      });
                    });
                  }}
                  className="justify-start"
                >
                  🎯 Week-ends uniquement
                </Button>
                
                <Button 
                  variant="outline" 
                  onClick={() => {
                    // Ajouter planning flexible
                    for (let day = 0; day <= 6; day++) {
                      addSlotMutation.mutate({
                        dayOfWeek: day,
                        startTime: "06:00",
                        endTime: "22:00",
                        type: "available"
                      });
                    }
                  }}
                  className="justify-start"
                >
                  🔄 Flexible (6h-22h tous les jours)
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
        
        <div className="flex justify-end pt-4">
          <Button onClick={onClose} variant="outline">
            Fermer
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}