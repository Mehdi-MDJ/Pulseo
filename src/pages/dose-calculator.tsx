import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";
import { Copy, Calculator, Clock, AlertTriangle, Check } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { motion, AnimatePresence } from "framer-motion";

interface CalculationResult {
  id: string;
  mode: string;
  input: any;
  result: string;
  timestamp: Date;
  warning?: string;
}

interface DoseCalculation {
  weight: number;
  dosePerKg: number;
  concentration: number;
  frequency?: number;
  duration?: number;
}

interface PerfusionCalculation {
  weight: number;
  dose: number;
  concentration: number;
  timeUnit: "hour" | "minute";
}

export default function DoseCalculator() {
  const { toast } = useToast();
  const [mode, setMode] = useState<"adult" | "pediatric" | "perfusion">("adult");
  const [history, setHistory] = useState<CalculationResult[]>([]);
  const [copied, setCopied] = useState(false);

  // Adult dosage state
  const [adultDose, setAdultDose] = useState<DoseCalculation>({
    weight: 70,
    dosePerKg: 0,
    concentration: 0,
  });

  // Pediatric dosage state
  const [pediatricDose, setPediatricDose] = useState<DoseCalculation>({
    weight: 0,
    dosePerKg: 0,
    concentration: 0,
    frequency: 1,
  });

  // Perfusion state
  const [perfusion, setPerfusion] = useState<PerfusionCalculation>({
    weight: 70,
    dose: 0,
    concentration: 0,
    timeUnit: "hour",
  });

  const [result, setResult] = useState<string>("");
  const [warning, setWarning] = useState<string>("");

  // Emergency presets
  const emergencyPresets = [
    { name: "Adrénaline (arrêt cardiaque)", dose: 0.01, unit: "mg/kg", concentration: 1 },
    { name: "Atropine (bradycardie)", dose: 0.02, unit: "mg/kg", concentration: 0.5 },
    { name: "Amiodarone (arythmie)", dose: 5, unit: "mg/kg", concentration: 50 },
    { name: "Furosémide (œdème)", dose: 1, unit: "mg/kg", concentration: 10 },
  ];

  const calculateAdultDose = () => {
    const { weight, dosePerKg, concentration } = adultDose;
    if (!weight || !dosePerKg || !concentration) return;

    const totalDose = weight * dosePerKg;
    const volume = totalDose / concentration;
    
    let warning = "";
    if (volume > 20) warning = "⚠️ Volume important - vérifier la faisabilité";
    if (totalDose > 1000) warning = "⚠️ Dose élevée - double vérification recommandée";

    const resultText = `Volume à administrer: ${volume.toFixed(2)} mL (${totalDose.toFixed(2)} mg)`;
    setResult(resultText);
    setWarning(warning);

    addToHistory("Posologie adulte", adultDose, resultText, warning);
  };

  const calculatePediatricDose = () => {
    const { weight, dosePerKg, concentration, frequency } = pediatricDose;
    if (!weight || !dosePerKg || !concentration) return;

    const singleDose = weight * dosePerKg;
    const volume = singleDose / concentration;
    const dailyDose = singleDose * (frequency || 1);
    
    let warning = "";
    if (weight < 3) warning = "⚠️ Poids très faible - dosage néonatal spécialisé requis";
    if (singleDose > weight * 100) warning = "⚠️ Dose très élevée pour un enfant - vérification nécessaire";

    const resultText = `Dose unitaire: ${volume.toFixed(2)} mL (${singleDose.toFixed(2)} mg)\nDose quotidienne: ${dailyDose.toFixed(2)} mg`;
    setResult(resultText);
    setWarning(warning);

    addToHistory("Posologie pédiatrique", pediatricDose, resultText, warning);
  };

  const calculatePerfusion = () => {
    const { weight, dose, concentration, timeUnit } = perfusion;
    if (!weight || !dose || !concentration) return;

    const totalDose = weight * dose;
    const volumePerHour = totalDose / concentration;
    const flowRate = timeUnit === "hour" ? volumePerHour : volumePerHour / 60;
    
    let warning = "";
    if (flowRate > 500) warning = "⚠️ Débit très élevé - vérifier pompe et voie d'accès";
    if (flowRate < 0.1) warning = "⚠️ Débit très faible - précision de la pompe critique";

    const resultText = `Débit: ${flowRate.toFixed(2)} mL/${timeUnit === "hour" ? "h" : "min"}\nVolume total: ${volumePerHour.toFixed(2)} mL/h`;
    setResult(resultText);
    setWarning(warning);

    addToHistory("Perfusion", perfusion, resultText, warning);
  };

  const addToHistory = (mode: string, input: any, result: string, warning?: string) => {
    const newCalculation: CalculationResult = {
      id: Date.now().toString(),
      mode,
      input,
      result,
      timestamp: new Date(),
      warning,
    };
    
    setHistory(prev => [newCalculation, ...prev.slice(0, 4)]);
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      toast({
        title: "Copié!",
        description: "Le résultat a été copié dans le presse-papier",
      });
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible de copier le texte",
        variant: "destructive",
      });
    }
  };

  const applyPreset = (preset: typeof emergencyPresets[0]) => {
    if (mode === "adult") {
      setAdultDose(prev => ({
        ...prev,
        dosePerKg: preset.dose,
        concentration: preset.concentration,
      }));
    } else if (mode === "pediatric") {
      setPediatricDose(prev => ({
        ...prev,
        dosePerKg: preset.dose,
        concentration: preset.concentration,
      }));
    }
    
    toast({
      title: "Preset appliqué",
      description: preset.name,
    });
  };

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold text-foreground flex items-center justify-center gap-2">
            <Calculator className="h-8 w-8 text-blue-600" />
            Calculateur de Doses
          </h1>
          <p className="text-muted-foreground">
            Outil de calcul sécurisé pour les professionnels de santé
          </p>
        </div>

        <Tabs value={mode} onValueChange={(value) => setMode(value as any)} className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="adult">Adulte</TabsTrigger>
            <TabsTrigger value="pediatric">Pédiatrique</TabsTrigger>
            <TabsTrigger value="perfusion">Perfusion</TabsTrigger>
          </TabsList>

          {/* Emergency Presets */}
          <Card className="mt-4">
            <CardHeader>
              <CardTitle className="text-sm flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-red-500" />
                Protocoles d'urgence
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                {emergencyPresets.map((preset) => (
                  <Button
                    key={preset.name}
                    variant="outline"
                    size="sm"
                    onClick={() => applyPreset(preset)}
                    className="text-xs h-auto p-2 text-left"
                  >
                    <div>
                      <div className="font-medium">{preset.name.split(" ")[0]}</div>
                      <div className="text-muted-foreground">{preset.dose} {preset.unit}</div>
                    </div>
                  </Button>
                ))}
              </div>
            </CardContent>
          </Card>

          <TabsContent value="adult" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Posologie Adulte</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="adult-weight">Poids (kg)</Label>
                    <Input
                      id="adult-weight"
                      type="number"
                      value={adultDose.weight}
                      onChange={(e) => setAdultDose(prev => ({ ...prev, weight: parseFloat(e.target.value) || 0 }))}
                      placeholder="70"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="adult-dose">Dose (mg/kg)</Label>
                    <Input
                      id="adult-dose"
                      type="number"
                      step="0.01"
                      value={adultDose.dosePerKg}
                      onChange={(e) => setAdultDose(prev => ({ ...prev, dosePerKg: parseFloat(e.target.value) || 0 }))}
                      placeholder="0.5"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="adult-concentration">Concentration (mg/mL)</Label>
                    <Input
                      id="adult-concentration"
                      type="number"
                      step="0.1"
                      value={adultDose.concentration}
                      onChange={(e) => setAdultDose(prev => ({ ...prev, concentration: parseFloat(e.target.value) || 0 }))}
                      placeholder="10"
                    />
                  </div>
                </div>
                <Button onClick={calculateAdultDose} className="w-full">
                  Calculer la dose
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="pediatric" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Posologie Pédiatrique</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="ped-weight">Poids (kg)</Label>
                    <Input
                      id="ped-weight"
                      type="number"
                      step="0.1"
                      value={pediatricDose.weight}
                      onChange={(e) => setPediatricDose(prev => ({ ...prev, weight: parseFloat(e.target.value) || 0 }))}
                      placeholder="15"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="ped-dose">Dose (mg/kg)</Label>
                    <Input
                      id="ped-dose"
                      type="number"
                      step="0.01"
                      value={pediatricDose.dosePerKg}
                      onChange={(e) => setPediatricDose(prev => ({ ...prev, dosePerKg: parseFloat(e.target.value) || 0 }))}
                      placeholder="0.5"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="ped-concentration">Concentration (mg/mL)</Label>
                    <Input
                      id="ped-concentration"
                      type="number"
                      step="0.1"
                      value={pediatricDose.concentration}
                      onChange={(e) => setPediatricDose(prev => ({ ...prev, concentration: parseFloat(e.target.value) || 0 }))}
                      placeholder="10"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="ped-frequency">Fréquence/jour</Label>
                    <Input
                      id="ped-frequency"
                      type="number"
                      value={pediatricDose.frequency}
                      onChange={(e) => setPediatricDose(prev => ({ ...prev, frequency: parseInt(e.target.value) || 1 }))}
                      placeholder="3"
                    />
                  </div>
                </div>
                <Button onClick={calculatePediatricDose} className="w-full">
                  Calculer la dose pédiatrique
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="perfusion" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Calcul de Perfusion</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="perf-weight">Poids (kg)</Label>
                    <Input
                      id="perf-weight"
                      type="number"
                      value={perfusion.weight}
                      onChange={(e) => setPerfusion(prev => ({ ...prev, weight: parseFloat(e.target.value) || 0 }))}
                      placeholder="70"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="perf-dose">Dose (mg/kg/h)</Label>
                    <Input
                      id="perf-dose"
                      type="number"
                      step="0.01"
                      value={perfusion.dose}
                      onChange={(e) => setPerfusion(prev => ({ ...prev, dose: parseFloat(e.target.value) || 0 }))}
                      placeholder="2"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="perf-concentration">Concentration (mg/mL)</Label>
                    <Input
                      id="perf-concentration"
                      type="number"
                      step="0.1"
                      value={perfusion.concentration}
                      onChange={(e) => setPerfusion(prev => ({ ...prev, concentration: parseFloat(e.target.value) || 0 }))}
                      placeholder="50"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="perf-unit">Unité de temps</Label>
                    <Select value={perfusion.timeUnit} onValueChange={(value) => setPerfusion(prev => ({ ...prev, timeUnit: value as any }))}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="hour">Par heure</SelectItem>
                        <SelectItem value="minute">Par minute</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <Button onClick={calculatePerfusion} className="w-full">
                  Calculer le débit
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Results */}
        <AnimatePresence>
          {result && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              <Card className="border-green-200 bg-green-50 dark:bg-green-950 dark:border-green-800">
                <CardContent className="pt-6">
                  <div className="flex items-start justify-between">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <Check className="h-5 w-5 text-green-600" />
                        <h3 className="font-semibold text-green-800 dark:text-green-200">Résultat</h3>
                      </div>
                      <pre className="text-sm font-mono whitespace-pre-wrap text-green-700 dark:text-green-300">
                        {result}
                      </pre>
                      {warning && (
                        <Alert className="mt-3">
                          <AlertTriangle className="h-4 w-4" />
                          <AlertDescription>{warning}</AlertDescription>
                        </Alert>
                      )}
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => copyToClipboard(result)}
                      className="shrink-0"
                    >
                      {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>

        {/* History */}
        {history.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Clock className="h-5 w-5" />
                Historique des calculs
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {history.map((calculation, index) => (
                  <div key={calculation.id} className="border rounded-lg p-3 space-y-2">
                    <div className="flex items-center justify-between">
                      <Badge variant="secondary">{calculation.mode}</Badge>
                      <span className="text-xs text-muted-foreground">
                        {calculation.timestamp.toLocaleTimeString()}
                      </span>
                    </div>
                    <pre className="text-sm font-mono whitespace-pre-wrap">{calculation.result}</pre>
                    {calculation.warning && (
                      <p className="text-xs text-amber-600">{calculation.warning}</p>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}