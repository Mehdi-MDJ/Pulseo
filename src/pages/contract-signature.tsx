import React, { useState, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Checkbox } from '@/components/ui/checkbox';
import { useParams } from 'react-router-dom';
import SignatureCanvas from 'react-signature-canvas';
import { Worker, Viewer, SpecialZoomLevel } from '@react-pdf-viewer/core';
import '@react-pdf-viewer/core/lib/styles/index.css';
import '@react-pdf-viewer/default-layout/lib/styles/index.css';

export default function ContractSignaturePage() {
  const { contractId } = useParams<{ contractId: string }>();
  const [loading, setLoading] = useState(false);
  const [consent, setConsent] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [contract, setContract] = useState<any>(null);
  const sigCanvasRef = useRef<any>(null);
  const [signatureData, setSignatureData] = useState<string | null>(null);
  const [showPdf, setShowPdf] = useState(false);
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);

  // Récupérer le contrat à afficher
  React.useEffect(() => {
    if (!contractId) return;
    fetch(`/api/contracts/${contractId}`)
      .then(res => res.json())
      .then(data => setContract(data.contract))
      .catch(() => setMessage({ type: 'error', text: 'Erreur lors du chargement du contrat.' }));
  }, [contractId]);

  const handleSign = async () => {
    setLoading(true);
    setMessage(null);
    try {
      let signature = signatureData;
      // Si pas déjà capturé, capturer la signature actuelle
      if (!signature && sigCanvasRef.current && !sigCanvasRef.current.isEmpty()) {
        signature = sigCanvasRef.current.getTrimmedCanvas().toDataURL('image/png');
      }
      const response = await fetch(`/api/contracts/${contractId}/sign`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ consent: true, signature })
      });
      const data = await response.json();
      if (data.success) {
        setMessage({ type: 'success', text: 'Contrat signé avec succès !' });
        setContract(data.contract);
      } else {
        setMessage({ type: 'error', text: data.message || 'Erreur lors de la signature.' });
      }
    } catch (e) {
      setMessage({ type: 'error', text: 'Erreur de connexion au serveur.' });
    } finally {
      setLoading(false);
    }
  };

  const handleShowPdf = async () => {
    if (!contractId) return;
    setShowPdf(true);
    // Récupérer le PDF depuis l'API
    const res = await fetch(`/api/contracts/${contractId}/pdf`);
    const blob = await res.blob();
    setPdfUrl(URL.createObjectURL(blob));
  };

  if (!contract) {
    return <div className="p-8 text-center text-gray-500">Chargement du contrat...</div>;
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <Card className="max-w-2xl w-full">
        <CardHeader>
          <CardTitle>Signature électronique du contrat</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="mb-4">
            <h2 className="font-semibold text-lg mb-2">Contrat #{contract.contractNumber || contract.id}</h2>
            <div className="text-sm text-gray-600 mb-2">Mission : {contract.title || contract.missionTitle}</div>
            <div className="text-sm text-gray-600 mb-2">Période : {contract.startDate} - {contract.endDate}</div>
            <div className="text-sm text-gray-600 mb-2">Taux horaire : {contract.hourlyRate} €/h</div>
          </div>
          <div className="mb-4 p-3 bg-gray-100 rounded text-sm">
            <strong>Résumé :</strong> <br />
            {contract.contractContent ? contract.contractContent.substring(0, 300) + '...' : 'Aperçu du contrat.'}
          </div>
          <Button variant="outline" className="mb-4" onClick={handleShowPdf}>
            Voir le PDF du contrat
          </Button>
          {showPdf && pdfUrl && (
            <div className="mb-4 border rounded bg-white" style={{ height: 600 }}>
              <Worker workerUrl="https://unpkg.com/pdfjs-dist@3.11.174/build/pdf.worker.min.js">
                <Viewer fileUrl={pdfUrl} defaultScale={SpecialZoomLevel.PageFit} />
              </Worker>
              <Button variant="ghost" className="mt-2" onClick={() => setShowPdf(false)}>Fermer le PDF</Button>
            </div>
          )}
          <div className="mb-4">
            <label className="block mb-2 font-medium">Signature manuscrite :</label>
            <div className="border rounded bg-white" style={{ width: 350, height: 120 }}>
              <SignatureCanvas
                ref={sigCanvasRef}
                penColor="black"
                canvasProps={{ width: 350, height: 120, className: 'sigCanvas' }}
                onEnd={() => setSignatureData(sigCanvasRef.current.getTrimmedCanvas().toDataURL('image/png'))}
              />
            </div>
            <div className="flex gap-2 mt-2">
              <Button type="button" variant="outline" size="sm" onClick={() => { sigCanvasRef.current.clear(); setSignatureData(null); }}>Effacer</Button>
              {signatureData && (
                <img src={signatureData} alt="Aperçu signature" style={{ height: 40, border: '1px solid #ccc', background: '#fff' }} />
              )}
            </div>
          </div>
          <div className="flex items-center mb-4">
            <Checkbox id="consent" checked={consent} onCheckedChange={setConsent} />
            <label htmlFor="consent" className="ml-2 text-sm">
              J'ai lu et j'accepte les termes du contrat et je consens à la signature électronique.
            </label>
          </div>
          <Button onClick={handleSign} disabled={!consent || loading || contract.status === 'signed_nurse' || contract.status === 'signed_establishment' || !signatureData}>
            {loading ? 'Signature en cours...' : 'Signer le contrat'}
          </Button>
          {message && (
            <Alert className={`mt-4 ${message.type === 'success' ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'}`}>
              <AlertDescription className={message.type === 'success' ? 'text-green-800' : 'text-red-800'}>
                {message.text}
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
