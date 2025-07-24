import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { FileText, Download, Eye, CheckCircle, Clock, AlertCircle, Plus, Trash2 } from 'lucide-react';

export default function ContractTestPage() {
  const [contracts, setContracts] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [selectedContract, setSelectedContract] = useState<any>(null);

  // Test data
  const testContracts = [
    {
      id: "CTR-001",
      nurse: "Marie Dubois",
      mission: "Soins cardiologie",
      status: "signed",
      date: "2024-01-15",
      amount: "2,500€",
      terms: {
        hourlyRate: 26,
        startDate: "2024-01-15",
        endDate: "2024-01-20",
        location: "Paris"
      }
    },
    {
      id: "CTR-002",
      nurse: "Thomas Martin",
      mission: "Urgences pédiatriques",
      status: "pending",
      date: "2024-01-14",
      amount: "1,800€",
      terms: {
        hourlyRate: 24,
        startDate: "2024-01-14",
        endDate: "2024-01-19",
        location: "Lyon"
      }
    }
  ];

    const testCreateContract = async () => {
    setLoading(true);
    setMessage(null);

    try {
      const response = await fetch('/api/contracts/test-create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      const data = await response.json();

      if (data.success) {
        setMessage({ type: 'success', text: 'Contrat de test créé avec succès !' });
        setContracts(prev => [...prev, data.contract]);
      } else {
        setMessage({ type: 'error', text: data.message || 'Erreur lors de la création' });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Erreur de connexion au serveur' });
    } finally {
      setLoading(false);
    }
  };

    const testGetContracts = async () => {
    setLoading(true);
    setMessage(null);

    try {
      const response = await fetch('/api/contracts/test-list');

      const data = await response.json();

      if (data.success) {
        setContracts(data.contracts || []);
        setMessage({ type: 'success', text: `${data.contracts?.length || 0} contrats récupérés` });
      } else {
        setMessage({ type: 'error', text: data.message || 'Erreur lors de la récupération' });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Erreur de connexion au serveur' });
    } finally {
      setLoading(false);
    }
  };

    const testSignContract = async (contractId: string) => {
    setLoading(true);
    setMessage(null);

    try {
      // Pour le test, on simule juste la signature sans appeler l'API
      setMessage({ type: 'success', text: 'Signature simulée avec succès !' });
      // Mettre à jour le statut dans la liste
      setContracts(prev => prev.map(c =>
        c.id === contractId ? { ...c, status: 'signed_nurse' } : c
      ));
      setLoading(false);
      return;

      // TODO: Implémenter la vraie signature quand l'authentification sera configurée
      /*
      const response = await fetch(`/api/contracts/${contractId}/sign`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer test-token'
        },
        body: JSON.stringify({
          consent: true,
          userAgent: navigator.userAgent,
          ip: '127.0.0.1'
        })
      });
      */

      const data = await response.json();

      if (data.success) {
        setMessage({ type: 'success', text: 'Contrat signé avec succès !' });
        // Mettre à jour le statut dans la liste
        setContracts(prev => prev.map(c =>
          c.id === contractId ? { ...c, status: 'signed_nurse' } : c
        ));
      } else {
        setMessage({ type: 'error', text: data.message || 'Erreur lors de la signature' });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Erreur de connexion au serveur' });
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'signed':
      case 'signed_nurse':
        return <Badge variant="default" className="bg-green-100 text-green-800">Signé</Badge>;
      case 'pending':
        return <Badge variant="secondary">En attente</Badge>;
      case 'draft':
        return <Badge variant="outline">Brouillon</Badge>;
      case 'cancelled':
        return <Badge variant="destructive">Annulé</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'signed':
      case 'signed_nurse':
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'pending':
        return <Clock className="w-4 h-4 text-yellow-600" />;
      case 'draft':
        return <AlertCircle className="w-4 h-4 text-gray-600" />;
      case 'cancelled':
        return <Trash2 className="w-4 h-4 text-red-600" />;
      default:
        return <Clock className="w-4 h-4" />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">🧪 Test des Contrats</h1>
          <p className="text-gray-600">Page de test pour valider le fonctionnement du système de contrats</p>
        </div>

        {/* Message d'alerte */}
        {message && (
          <Alert className={`mb-6 ${message.type === 'success' ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'}`}>
            <AlertDescription className={message.type === 'success' ? 'text-green-800' : 'text-red-800'}>
              {message.text}
            </AlertDescription>
          </Alert>
        )}

        {/* Actions de test */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Actions de Test</CardTitle>
            <CardDescription>
              Testez les différentes fonctionnalités du système de contrats
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-4 flex-wrap">
              <Button
                onClick={testCreateContract}
                disabled={loading}
                className="flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                Créer un contrat de test
              </Button>

              <Button
                onClick={testGetContracts}
                disabled={loading}
                variant="outline"
                className="flex items-center gap-2"
              >
                <Eye className="w-4 h-4" />
                Récupérer les contrats
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Contrats de test statiques */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Contrats de Test (Statiques)</CardTitle>
            <CardDescription>
              Données de test pour visualiser l'interface
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {testContracts.map((contract) => (
                <div key={contract.id} className="border rounded-lg p-4 flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    {getStatusIcon(contract.status)}
                    <div>
                      <h3 className="font-medium">{contract.id}</h3>
                      <p className="text-sm text-gray-600">{contract.nurse} - {contract.mission}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    {getStatusBadge(contract.status)}
                    <span className="text-sm text-gray-600">{contract.amount}</span>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => testSignContract(contract.id)}
                      disabled={contract.status === 'signed'}
                    >
                      Signer
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Contrats dynamiques */}
        {contracts.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Contrats Dynamiques (API)</CardTitle>
              <CardDescription>
                Contrats récupérés depuis l'API
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {contracts.map((contract) => (
                  <div key={contract.id} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-medium">{contract.contractNumber || contract.id}</h3>
                      {getStatusBadge(contract.status)}
                    </div>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="font-medium">Mission ID:</span> {contract.missionId}
                      </div>
                      <div>
                        <span className="font-medium">Infirmier ID:</span> {contract.nurseId}
                      </div>
                      {contract.terms && (
                        <>
                          <div>
                            <span className="font-medium">Taux horaire:</span> {contract.terms.hourlyRate}€
                          </div>
                          <div>
                            <span className="font-medium">Localisation:</span> {contract.terms.location}
                          </div>
                        </>
                      )}
                    </div>
                    <div className="mt-4 flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => testSignContract(contract.id)}
                        disabled={contract.status === 'signed_nurse'}
                      >
                        Signer
                      </Button>
                      <Button size="sm" variant="outline">
                        <Download className="w-4 h-4" />
                        PDF
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Informations de test */}
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Informations de Test</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 text-sm">
              <p><strong>URL API:</strong> http://localhost:3000/api/contracts</p>
              <p><strong>Endpoints disponibles:</strong></p>
              <ul className="list-disc list-inside ml-4 space-y-1">
                <li>POST /test-create - Créer un contrat de test</li>
                <li>GET /establishment - Lister les contrats d'un établissement</li>
                <li>GET /nurse - Lister les contrats d'un infirmier</li>
                <li>GET /:id - Détails d'un contrat</li>
                <li>POST /:id/sign - Signer un contrat</li>
                <li>POST /:id/cancel - Annuler un contrat</li>
                <li>GET /:id/pdf - Télécharger le PDF</li>
              </ul>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
