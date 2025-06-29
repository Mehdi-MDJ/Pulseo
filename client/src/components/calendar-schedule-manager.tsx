import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, Clock, Plus, Trash2, Sun, Moon, Sunrise, Sunset, ChevronLeft, ChevronRight, X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { format, startOfWeek, addDays, isSameDay, getDay, addWeeks, subWeeks } from "date-fns";
import { fr } from "date-fns/locale";

interface CalendarScheduleManagerProps {
  open: boolean;
  onClose: () => void;
}

interface TimeSlot {
  id: string;
  date: string;
  startTime: string;
  endTime: string;
  shift: 'matin' | 'apres-midi' | 'nuit' | 'jour';
  available: boolean;
}

interface ScheduleEvent {
  date: string;
  slots: TimeSlot[];
}

const SHIFT_CONFIGS = {
  matin: { 
    icon: Sunrise, 
    color: 'bg-orange-100 text-orange-800 border-orange-200', 
    label: 'Matin',
    defaultStart: '06:00',
    defaultEnd: '14:00'
  },
  'apres-midi': { 
    icon: Sun, 
    color: 'bg-yellow-100 text-yellow-800 border-yellow-200', 
    label: 'Après-midi',
    defaultStart: '14:00',
    defaultEnd: '22:00'
  },
  nuit: { 
    icon: Moon, 
    color: 'bg-blue-100 text-blue-800 border-blue-200', 
    label: 'Nuit',
    defaultStart: '22:00',
    defaultEnd: '06:00'
  },
  jour: { 
    icon: Sun, 
    color: 'bg-green-100 text-green-800 border-green-200', 
    label: 'Journée',
    defaultStart: '08:00',
    defaultEnd: '20:00'
  }
};

export function CalendarScheduleManager({ open, onClose }: CalendarScheduleManagerProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [currentWeek, setCurrentWeek] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [showAddSlot, setShowAddSlot] = useState(false);
  const [newSlot, setNewSlot] = useState({
    shift: 'matin' as keyof typeof SHIFT_CONFIGS,
    startTime: '06:00',
    endTime: '14:00',
    available: true
  });

  // Récupérer les données du planning
  const { data: schedule = [] } = useQuery({
    queryKey: ['/api/schedule'],
    enabled: open,
  });

  const weekStart = startOfWeek(currentWeek, { weekStartsOn: 1 });
  const weekDays = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));

  // Mutations pour gérer le planning
  const addSlotMutation = useMutation({
    mutationFn: async (slot: Omit<TimeSlot, 'id'>) => {
      const response = await fetch('/api/schedule', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(slot),
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/schedule'] });
      toast({
        title: "Créneau ajouté",
        description: "Votre disponibilité a été enregistrée.",
      });
      setShowAddSlot(false);
      setSelectedDate(null);
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
      queryClient.invalidateQueries({ queryKey: ['/api/schedule'] });
      toast({
        title: "Créneau supprimé",
        description: "Votre planning a été mis à jour.",
      });
    },
  });

  const getScheduleForDate = (date: Date): TimeSlot[] => {
    const dateStr = format(date, 'yyyy-MM-dd');
    return (schedule as any)?.filter((slot: TimeSlot) => slot.date === dateStr) || [];
  };

  const handleAddSlot = () => {
    if (!selectedDate) return;

    const config = SHIFT_CONFIGS[newSlot.shift];
    const slot = {
      date: format(selectedDate, 'yyyy-MM-dd'),
      startTime: newSlot.startTime || config.defaultStart,
      endTime: newSlot.endTime || config.defaultEnd,
      shift: newSlot.shift,
      available: newSlot.available
    };

    addSlotMutation.mutate(slot);
  };

  const handleDateClick = (date: Date) => {
    setSelectedDate(date);
    setShowAddSlot(true);
    // Réinitialiser le nouveau slot avec les valeurs par défaut
    const config = SHIFT_CONFIGS[newSlot.shift];
    setNewSlot({
      ...newSlot,
      startTime: config.defaultStart,
      endTime: config.defaultEnd
    });
  };

  const handleShiftChange = (shift: keyof typeof SHIFT_CONFIGS) => {
    const config = SHIFT_CONFIGS[shift];
    setNewSlot({
      ...newSlot,
      shift,
      startTime: config.defaultStart,
      endTime: config.defaultEnd
    });
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <Calendar className="w-5 h-5" />
            <span>Gérer mes disponibilités</span>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Navigation semaine */}
          <div className="flex items-center justify-between bg-gray-50 p-4 rounded-lg">
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => setCurrentWeek(subWeeks(currentWeek, 1))}
            >
              <ChevronLeft className="w-4 h-4" />
            </Button>
            
            <h3 className="font-semibold text-lg">
              Semaine du {format(weekStart, 'dd MMMM yyyy', { locale: fr })}
            </h3>
            
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => setCurrentWeek(addWeeks(currentWeek, 1))}
            >
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>

          {/* Calendrier mobile-friendly */}
          <div className="grid grid-cols-1 gap-3">
            {weekDays.map((date, index) => {
              const daySlots = getScheduleForDate(date);
              const isToday = isSameDay(date, new Date());
              
              return (
                <Card 
                  key={index} 
                  className={`cursor-pointer transition-all hover:shadow-md touch-manipulation ${
                    isToday ? 'ring-2 ring-blue-500 bg-blue-50' : ''
                  }`}
                  onClick={() => handleDateClick(date)}
                >
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-lg font-semibold">
                          {format(date, 'EEEE dd MMMM', { locale: fr })}
                        </p>
                        {isToday && (
                          <Badge className="bg-blue-500 text-white text-xs mt-1">Aujourd'hui</Badge>
                        )}
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        className="p-2 h-8 w-8"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDateClick(date);
                        }}
                      >
                        <Plus className="w-4 h-4" />
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <div className="space-y-3">
                      {daySlots.length > 0 ? (
                        daySlots.map((slot: TimeSlot) => {
                          const config = SHIFT_CONFIGS[slot.shift];
                          const Icon = config.icon;
                          
                          return (
                            <div 
                              key={slot.id}
                              className={`p-3 rounded-lg border-2 ${config.color} touch-manipulation`}
                              onClick={(e) => e.stopPropagation()}
                            >
                              <div className="flex items-center justify-between mb-2">
                                <div className="flex items-center space-x-2">
                                  <Icon className="w-5 h-5" />
                                  <span className="font-semibold text-base">{config.label}</span>
                                </div>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="h-8 w-8 p-0 text-red-600 hover:text-red-800 hover:bg-red-100"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    deleteSlotMutation.mutate(slot.id);
                                  }}
                                >
                                  <Trash2 className="w-4 h-4" />
                                </Button>
                              </div>
                              <div className="flex items-center justify-between">
                                <div className="flex items-center space-x-2">
                                  <Clock className="w-4 h-4" />
                                  <span className="text-sm font-medium">{slot.startTime} - {slot.endTime}</span>
                                </div>
                                <Badge 
                                  variant={slot.available ? "default" : "secondary"}
                                  className="text-xs"
                                >
                                  {slot.available ? "Disponible" : "Indisponible"}
                                </Badge>
                              </div>
                            </div>
                          );
                        })
                      ) : (
                        <div className="text-center py-6 text-gray-500 border-2 border-dashed border-gray-300 rounded-lg">
                          <Plus className="w-8 h-8 mx-auto mb-2" />
                          <p className="text-sm">Cliquez pour ajouter vos disponibilités</p>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {/* Modal d'ajout de créneau optimisée mobile */}
          {showAddSlot && selectedDate && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-end sm:items-center justify-center p-0 sm:p-4 z-50">
              <Card className="w-full sm:max-w-md rounded-t-2xl sm:rounded-lg border-0 sm:border">
                <CardHeader className="pb-4">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-xl">
                      Nouveau créneau
                    </CardTitle>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setShowAddSlot(false)}
                      className="h-8 w-8 p-0"
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                  <p className="text-sm text-gray-600">
                    {format(selectedDate, 'EEEE dd MMMM yyyy', { locale: fr })}
                  </p>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Type de service avec boutons tactiles */}
                  <div>
                    <label className="text-base font-medium mb-3 block">Type de service</label>
                    <div className="grid grid-cols-1 gap-3">
                      {Object.entries(SHIFT_CONFIGS).map(([key, config]) => {
                        const Icon = config.icon;
                        return (
                          <button
                            key={key}
                            onClick={() => setNewSlot({...newSlot, shift: key as any})}
                            className={`p-4 rounded-lg border-2 flex items-center space-x-3 transition-all touch-manipulation ${
                              newSlot.shift === key
                                ? 'border-blue-500 bg-blue-50 shadow-md'
                                : 'border-gray-200 hover:border-gray-300'
                            }`}
                          >
                            <Icon className="w-6 h-6" />
                            <div className="text-left">
                              <span className="font-medium text-base block">{config.label}</span>
                              <span className="text-sm text-gray-500">{config.defaultStart} - {config.defaultEnd}</span>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Horaires avec inputs plus grands */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-base font-medium mb-2 block">Début</label>
                      <input
                        type="time"
                        value={newSlot.startTime}
                        onChange={(e) => setNewSlot({...newSlot, startTime: e.target.value})}
                        className="w-full p-4 border-2 rounded-lg text-base focus:border-blue-500 focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="text-base font-medium mb-2 block">Fin</label>
                      <input
                        type="time"
                        value={newSlot.endTime}
                        onChange={(e) => setNewSlot({...newSlot, endTime: e.target.value})}
                        className="w-full p-4 border-2 rounded-lg text-base focus:border-blue-500 focus:outline-none"
                      />
                    </div>
                  </div>

                  {/* Disponibilité avec toggle */}
                  <div>
                    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                      <div>
                        <span className="text-base font-medium">Disponible pour des missions</span>
                        <p className="text-sm text-gray-600 mt-1">
                          Les établissements pourront vous proposer des missions
                        </p>
                      </div>
                      <button
                        onClick={() => setNewSlot({...newSlot, available: !newSlot.available})}
                        className={`w-12 h-6 rounded-full transition-colors ${
                          newSlot.available ? 'bg-blue-500' : 'bg-gray-300'
                        }`}
                      >
                        <div className={`w-5 h-5 bg-white rounded-full transition-transform ${
                          newSlot.available ? 'translate-x-6' : 'translate-x-1'
                        }`} />
                      </button>
                    </div>
                  </div>

                  {/* Boutons plus grands */}
                  <div className="flex flex-col sm:flex-row gap-3 pt-4">
                    <Button
                      variant="outline"
                      onClick={() => setShowAddSlot(false)}
                      className="flex-1 h-12 text-base"
                    >
                      Annuler
                    </Button>
                    <Button 
                      onClick={handleAddSlot}
                      disabled={!newSlot.startTime || !newSlot.endTime || addSlotMutation.isPending}
                      className="flex-1 h-12 text-base bg-blue-600 hover:bg-blue-700"
                    >
                      {addSlotMutation.isPending ? "Ajout..." : "Confirmer"}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Légende */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Types de services</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {Object.entries(SHIFT_CONFIGS).map(([key, config]) => {
                  const Icon = config.icon;
                  return (
                    <div key={key} className={`p-2 rounded-md ${config.color} text-center`}>
                      <Icon className="w-4 h-4 mx-auto mb-1" />
                      <p className="text-xs font-medium">{config.label}</p>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  );
}