import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { 
  Popover, 
  PopoverContent, 
  PopoverTrigger 
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { 
  Bell, 
  Check, 
  X, 
  Clock, 
  User, 
  FileText,
  MapPin,
  Euro
} from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { format, formatDistanceToNow } from "date-fns";
import { fr } from "date-fns/locale";

export function NotificationCenter() {
  const [open, setOpen] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: notifications, isLoading } = useQuery({
    queryKey: ["/api/notifications"],
    refetchInterval: 30000, // Refresh every 30 seconds
  });

  const markAsReadMutation = useMutation({
    mutationFn: async (notificationId: number) => {
      return apiRequest("POST", `/api/notifications/${notificationId}/read`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/notifications"] });
    },
  });

  const markAllAsReadMutation = useMutation({
    mutationFn: async () => {
      return apiRequest("POST", "/api/notifications/mark-all-read");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/notifications"] });
      toast({
        title: "Notifications marquées comme lues",
        description: "Toutes vos notifications ont été marquées comme lues.",
      });
    },
  });

  const unreadCount = notifications?.filter((n: any) => !n.read).length || 0;

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "mission_application":
        return <User className="w-4 h-4 text-blue-500" />;
      case "mission_accepted":
        return <Check className="w-4 h-4 text-green-500" />;
      case "mission_rejected":
        return <X className="w-4 h-4 text-red-500" />;
      case "new_mission":
        return <FileText className="w-4 h-4 text-orange-500" />;
      case "payment":
        return <Euro className="w-4 h-4 text-green-500" />;
      default:
        return <Bell className="w-4 h-4 text-gray-500" />;
    }
  };

  const getNotificationColor = (type: string) => {
    switch (type) {
      case "mission_application":
        return "border-blue-200 bg-blue-50 dark:bg-blue-900/20";
      case "mission_accepted":
        return "border-green-200 bg-green-50 dark:bg-green-900/20";
      case "mission_rejected":
        return "border-red-200 bg-red-50 dark:bg-red-900/20";
      case "new_mission":
        return "border-orange-200 bg-orange-50 dark:bg-orange-900/20";
      case "payment":
        return "border-green-200 bg-green-50 dark:bg-green-900/20";
      default:
        return "border-gray-200 bg-gray-50 dark:bg-gray-900/20";
    }
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="w-4 h-4" />
          {unreadCount > 0 && (
            <Badge 
              variant="destructive" 
              className="absolute -top-1 -right-1 w-5 h-5 flex items-center justify-center text-xs p-0"
            >
              {unreadCount > 9 ? "9+" : unreadCount}
            </Badge>
          )}
        </Button>
      </PopoverTrigger>
      
      <PopoverContent className="w-80 p-0" align="end">
        <div className="p-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold">Notifications</h3>
            {unreadCount > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => markAllAsReadMutation.mutate()}
                disabled={markAllAsReadMutation.isPending}
                className="text-xs"
              >
                Tout marquer comme lu
              </Button>
            )}
          </div>

          {isLoading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="animate-pulse">
                  <div className="h-16 bg-gray-200 dark:bg-gray-700 rounded-lg"></div>
                </div>
              ))}
            </div>
          ) : notifications?.length > 0 ? (
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {notifications.map((notification: any) => (
                <Card 
                  key={notification.id} 
                  className={`cursor-pointer transition-colors ${
                    !notification.read 
                      ? getNotificationColor(notification.type)
                      : "border-gray-100 hover:bg-gray-50 dark:hover:bg-gray-800"
                  }`}
                  onClick={() => markAsReadMutation.mutate(notification.id)}
                >
                  <CardContent className="p-3">
                    <div className="flex items-start space-x-3">
                      <div className="mt-1">
                        {getNotificationIcon(notification.type)}
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm mb-1">
                          {notification.title}
                        </p>
                        <p className="text-xs text-muted-foreground mb-2 line-clamp-2">
                          {notification.message}
                        </p>
                        
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-muted-foreground">
                            {formatDistanceToNow(new Date(notification.createdAt), { 
                              addSuffix: true, 
                              locale: fr 
                            })}
                          </span>
                          
                          {!notification.read && (
                            <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                          )}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <Bell className="w-8 h-8 mx-auto mb-2 opacity-50" />
              <p className="text-sm">Aucune notification</p>
            </div>
          )}

          {notifications?.length > 5 && (
            <>
              <Separator className="my-3" />
              <Button variant="ghost" size="sm" className="w-full text-xs">
                Voir toutes les notifications
              </Button>
            </>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}