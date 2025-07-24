import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale';
import { useNavigate } from 'react-router-dom';

export default function NurseNotifications() {
  const { data: notifications, isLoading } = useQuery({
    queryKey: ["/api/notifications"],
    refetchInterval: 30000,
  });
  const navigate = useNavigate();

  const getBadge = (type: string) => {
    switch (type) {
      case 'contract_signed_nurse':
        return <Badge variant="default">Contrat signé (vous)</Badge>;
      case 'contract_signed_establishment':
        return <Badge variant="secondary">Contrat signé (établissement)</Badge>;
      case 'mission_accepted':
        return <Badge variant="default">Mission acceptée</Badge>;
      case 'mission_rejected':
        return <Badge variant="destructive">Mission refusée</Badge>;
      default:
        return <Badge variant="outline">{type}</Badge>;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-2xl mx-auto">
        <Card>
          <CardHeader>
            <CardTitle>Notifications</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div>Chargement...</div>
            ) : notifications?.length > 0 ? (
              <div className="space-y-4">
                {notifications.map((n: any) => (
                  <div key={n.id} className={`p-3 rounded border ${n.read ? 'bg-white' : 'bg-blue-50 border-blue-200'}`}>
                    <div className="flex items-center gap-2 mb-1">
                      {getBadge(n.type)}
                      <span className="text-xs text-gray-500">{formatDistanceToNow(new Date(n.createdAt), { addSuffix: true, locale: fr })}</span>
                    </div>
                    <div className="font-medium text-sm mb-1">{n.title}</div>
                    <div className="text-xs text-gray-600 mb-2">{n.message}</div>
                    {n.metadata?.contractId && (
                      <Button size="sm" variant="outline" onClick={() => navigate(`/contract-signature/${n.metadata.contractId}`)}>
                        Voir le contrat
                      </Button>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-gray-500">Aucune notification</div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
