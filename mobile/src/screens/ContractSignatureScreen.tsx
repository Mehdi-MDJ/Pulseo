import React, { useRef, useState } from 'react';
import { View, Text, ScrollView, ActivityIndicator, StyleSheet, TouchableOpacity, Image, Alert } from 'react-native';
import Signature from 'react-native-signature-canvas';
import Checkbox from '@react-native-community/checkbox';
import { useRoute, useNavigation } from '@react-navigation/native';

export default function ContractSignatureScreen() {
  const route = useRoute();
  const navigation = useNavigation();
  const { contractId } = route.params as { contractId: string };
  const [contract, setContract] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [consent, setConsent] = useState(false);
  const [signature, setSignature] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const sigRef = useRef<any>(null);

  React.useEffect(() => {
    if (!contractId) return;
    setLoading(true);
    fetch(`https://your-backend-url/api/contracts/${contractId}`)
      .then(res => res.json())
      .then(data => setContract(data.contract))
      .catch(() => setMessage('Erreur lors du chargement du contrat.'))
      .finally(() => setLoading(false));
  }, [contractId]);

  const handleOK = (sig: string) => {
    setSignature(sig);
  };

  const handleClear = () => {
    sigRef.current?.clearSignature();
    setSignature(null);
  };

  const handleSign = async () => {
    setLoading(true);
    setMessage(null);
    try {
      const response = await fetch(`https://your-backend-url/api/contracts/${contractId}/sign`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ consent: true, signature })
      });
      const data = await response.json();
      if (data.success) {
        setMessage('Contrat signé avec succès !');
        setContract(data.contract);
      } else {
        setMessage(data.message || 'Erreur lors de la signature.');
      }
    } catch (e) {
      setMessage('Erreur de connexion au serveur.');
    } finally {
      setLoading(false);
    }
  };

  if (loading && !contract) {
    return <View style={styles.center}><ActivityIndicator size="large" /></View>;
  }
  if (!contract) {
    return <View style={styles.center}><Text>Chargement du contrat...</Text></View>;
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Signature électronique du contrat</Text>
      <View style={styles.card}>
        <Text style={styles.subtitle}>Contrat #{contract.contractNumber || contract.id}</Text>
        <Text style={styles.label}>Mission : {contract.title || contract.missionTitle}</Text>
        <Text style={styles.label}>Période : {contract.startDate} - {contract.endDate}</Text>
        <Text style={styles.label}>Taux horaire : {contract.hourlyRate} €/h</Text>
        <Text style={styles.summary}>
          <Text style={{ fontWeight: 'bold' }}>Résumé : </Text>
          {contract.contractContent ? contract.contractContent.substring(0, 300) + '...' : 'Aperçu du contrat.'}
        </Text>
        <Text style={{ fontWeight: 'bold', marginTop: 16, marginBottom: 8 }}>Signez dans la zone ci-dessous :</Text>
        <View style={styles.signatureBox}>
          <Signature
            ref={sigRef}
            onOK={handleOK}
            onClear={handleClear}
            descriptionText="Signez ici"
            clearText="Effacer"
            confirmText="Valider la signature"
            webStyle={
              `.m-signature-pad--footer {display: none; margin: 0px;}`
            }
            autoClear={false}
            backgroundColor="#fff"
            penColor="#111"
          />
        </View>
        {signature && (
          <View style={{ alignItems: 'center', marginVertical: 8 }}>
            <Text style={{ fontSize: 13, color: '#666', marginBottom: 4 }}>Aperçu de votre signature :</Text>
            <Image source={{ uri: signature }} style={{ width: 180, height: 60, borderWidth: 1, borderColor: '#ccc', backgroundColor: '#fff' }} />
            <TouchableOpacity style={styles.clearBtn} onPress={handleClear}>
              <Text style={styles.clearBtnText}>Effacer</Text>
            </TouchableOpacity>
          </View>
        )}
        <View style={styles.checkboxRow}>
          <Checkbox value={consent} onValueChange={setConsent} />
          <Text style={styles.checkboxLabel}>Je certifie que cette signature est la mienne et j’accepte les termes du contrat.</Text>
        </View>
        <TouchableOpacity
          style={[styles.button, (!consent || !signature || contract.status === 'signed_nurse' || contract.status === 'signed_establishment') && styles.buttonDisabled]}
          onPress={handleSign}
          disabled={!consent || !signature || contract.status === 'signed_nurse' || contract.status === 'signed_establishment' || loading}
        >
          <Text style={styles.buttonText}>{loading ? 'Signature en cours...' : 'Signer le contrat'}</Text>
        </TouchableOpacity>
        {message && <Text style={message.includes('succès') ? styles.success : styles.error}>{message}</Text>}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flexGrow: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#f9fafb', padding: 16 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  card: { backgroundColor: '#fff', borderRadius: 12, padding: 20, width: '100%', maxWidth: 400, elevation: 2, marginTop: 24 },
  title: { fontSize: 22, fontWeight: 'bold', marginTop: 32, textAlign: 'center' },
  subtitle: { fontSize: 18, fontWeight: '600', marginBottom: 8 },
  label: { fontSize: 14, color: '#444', marginBottom: 2 },
  summary: { fontSize: 13, color: '#666', marginVertical: 10 },
  signatureBox: { borderWidth: 1, borderColor: '#bbb', borderRadius: 8, backgroundColor: '#fff', width: 320, height: 120, alignSelf: 'center', marginBottom: 8 },
  checkboxRow: { flexDirection: 'row', alignItems: 'center', marginVertical: 12 },
  checkboxLabel: { marginLeft: 8, fontSize: 13, color: '#333', flex: 1 },
  button: { backgroundColor: '#2563eb', paddingVertical: 12, borderRadius: 8, alignItems: 'center', marginTop: 8 },
  buttonDisabled: { backgroundColor: '#a5b4fc' },
  buttonText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
  clearBtn: { marginTop: 4, paddingHorizontal: 12, paddingVertical: 4, backgroundColor: '#eee', borderRadius: 6 },
  clearBtnText: { color: '#333', fontSize: 13 },
  success: { color: 'green', marginTop: 10, textAlign: 'center' },
  error: { color: 'red', marginTop: 10, textAlign: 'center' },
});
