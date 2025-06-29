import { useState, useEffect } from "react";
import { useAuth } from "../hooks/useAuth-simple";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  Settings, 
  Building, 
  Bell,
  Shield,
  Users,
  CreditCard,
  Globe,
  Smartphone,
  Mail,
  Phone,
  MapPin,
  Save,
  Eye,
  EyeOff,
  Download,
  Upload,
  Trash2,
  AlertTriangle
} from "lucide-react";
import { Separator } from "@/components/ui/separator";

export default function SettingsPage() {
  const { user } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [theme, setTheme] = useState("light");

  // Charger le thème depuis localStorage
  useEffect(() => {
    const savedTheme = localStorage.getItem("theme") || "light";
    setTheme(savedTheme);
    // Appliquer le thème
    if (savedTheme === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, []);

  const handleThemeChange = (newTheme: string) => {
    setTheme(newTheme);
    localStorage.setItem("theme", newTheme);
    
    // Appliquer le thème immédiatement
    if (newTheme === "dark") {
      document.documentElement.classList.add("dark");
    } else if (newTheme === "light") {
      document.documentElement.classList.remove("dark");
    } else if (newTheme === "auto") {
      // Mode auto : suivre les préférences système
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      if (prefersDark) {
        document.documentElement.classList.add("dark");
      } else {
        document.documentElement.classList.remove("dark");
      }
    }
  };
  
  // États pour les différentes sections
  const [establishmentInfo, setEstablishmentInfo] = useState({
    name: "Hôpital Saint-Vincent",
    siret: "12345678901234",
    address: "123 Avenue des Soins",
    city: "Paris",
    postalCode: "75001",
    phone: "01 23 45 67 89",
    email: "contact@hopital-saint-vincent.fr",
    website: "https://hopital-saint-vincent.fr",
    description: "Établissement de santé moderne avec 300 lits, spécialisé en cardiologie et chirurgie."
  });

  const [notifications, setNotifications] = useState({
    emailNewApplications: true,
    emailContractSigned: true,
    emailMissionReminders: true,
    smsUrgentAlerts: true,
    smsStaffAbsence: false,
    pushNewCandidates: true,
    pushMissionUpdates: true,
    weeklyReports: true,
    monthlyAnalytics: true
  });

  const [matching, setMatching] = useState({
    autoMatching: true,
    minRating: 4.0,
    maxDistance: 50,
    prioritizeExperience: true,
    prioritizeAvailability: true,
    excludeBlacklisted: true,
    requireCertifications: false
  });

  const [security, setSecurity] = useState({
    twoFactorAuth: false,
    sessionTimeout: 30,
    passwordExpiry: 90,
    loginAlerts: true,
    ipWhitelist: false,
    dataEncryption: true
  });

  const [billing, setBilling] = useState({
    plan: "professional",
    autoRenewal: true,
    invoiceEmail: "facturation@hopital-saint-vincent.fr",
    paymentMethod: "card",
    billingAddress: "123 Avenue des Soins, 75001 Paris"
  });

  const handleSave = (section: string) => {
    alert(`Paramètres de ${section} sauvegardés avec succès !`);
    // TODO: Appeler l'API pour sauvegarder
  };

  const handleExportData = () => {
    alert("Export des données en cours...");
    // TODO: Générer et télécharger un fichier d'export
  };

  const handleDeleteAccount = () => {
    if (confirm("Êtes-vous sûr de vouloir supprimer votre compte ? Cette action est irréversible.")) {
      alert("Suppression du compte annulée (sécurité)");
      // TODO: Processus de suppression sécurisé
    }
  };

  if (!user) {
    return <div>Chargement...</div>;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <header className="bg-white border-b border-gray-200 shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-3">
              <Settings className="h-8 w-8 text-blue-600" />
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Paramètres</h1>
                <p className="text-sm text-gray-600">Gérez les paramètres de votre établissement</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Button variant="outline" onClick={handleExportData}>
                <Download className="h-4 w-4 mr-2" />
                Exporter les données
              </Button>
              <Button onClick={() => window.location.href = "/dashboard"}>
                Retour au Dashboard
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <Tabs defaultValue="establishment" className="space-y-6">
          <TabsList className="grid w-full grid-cols-7">
            <TabsTrigger value="establishment">Établissement</TabsTrigger>
            <TabsTrigger value="appearance">Apparence</TabsTrigger>
            <TabsTrigger value="notifications">Notifications</TabsTrigger>
            <TabsTrigger value="matching">Matching IA</TabsTrigger>
            <TabsTrigger value="security">Sécurité</TabsTrigger>
            <TabsTrigger value="billing">Facturation</TabsTrigger>
            <TabsTrigger value="advanced">Avancé</TabsTrigger>
          </TabsList>

          {/* Paramètres Établissement */}
          <TabsContent value="establishment">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Building className="h-5 w-5" />
                  <span>Informations Établissement</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="name">Nom de l'établissement</Label>
                    <Input
                      id="name"
                      value={establishmentInfo.name}
                      onChange={(e) => setEstablishmentInfo({...establishmentInfo, name: e.target.value})}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="siret">SIRET</Label>
                    <Input
                      id="siret"
                      value={establishmentInfo.siret}
                      onChange={(e) => setEstablishmentInfo({...establishmentInfo, siret: e.target.value})}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={establishmentInfo.description}
                    onChange={(e) => setEstablishmentInfo({...establishmentInfo, description: e.target.value})}
                    rows={3}
                  />
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="address">Adresse</Label>
                    <Input
                      id="address"
                      value={establishmentInfo.address}
                      onChange={(e) => setEstablishmentInfo({...establishmentInfo, address: e.target.value})}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="city">Ville</Label>
                    <Input
                      id="city"
                      value={establishmentInfo.city}
                      onChange={(e) => setEstablishmentInfo({...establishmentInfo, city: e.target.value})}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="postal">Code postal</Label>
                    <Input
                      id="postal"
                      value={establishmentInfo.postalCode}
                      onChange={(e) => setEstablishmentInfo({...establishmentInfo, postalCode: e.target.value})}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="phone">Téléphone</Label>
                    <Input
                      id="phone"
                      value={establishmentInfo.phone}
                      onChange={(e) => setEstablishmentInfo({...establishmentInfo, phone: e.target.value})}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      value={establishmentInfo.email}
                      onChange={(e) => setEstablishmentInfo({...establishmentInfo, email: e.target.value})}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="website">Site web</Label>
                    <Input
                      id="website"
                      value={establishmentInfo.website}
                      onChange={(e) => setEstablishmentInfo({...establishmentInfo, website: e.target.value})}
                    />
                  </div>
                </div>

                <Button onClick={() => handleSave("établissement")}>
                  <Save className="h-4 w-4 mr-2" />
                  Sauvegarder les informations
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Paramètres Apparence */}
          <TabsContent value="appearance">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Globe className="h-5 w-5" />
                  <span>Apparence</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <h3 className="font-semibold">Thème</h3>
                  
                  <div className="grid grid-cols-3 gap-4">
                    <Card 
                      className={`p-4 cursor-pointer border-2 ${theme === 'light' ? 'border-blue-500 bg-blue-50' : 'border-gray-200'}`}
                      onClick={() => handleThemeChange('light')}
                    >
                      <div className="flex flex-col items-center space-y-2">
                        <div className="w-8 h-8 bg-white border border-gray-300 rounded"></div>
                        <span className="text-sm font-medium">Clair</span>
                        {theme === 'light' && <Badge>Actuel</Badge>}
                      </div>
                    </Card>

                    <Card 
                      className={`p-4 cursor-pointer border-2 ${theme === 'dark' ? 'border-blue-500 bg-blue-50' : 'border-gray-200'}`}
                      onClick={() => handleThemeChange('dark')}
                    >
                      <div className="flex flex-col items-center space-y-2">
                        <div className="w-8 h-8 bg-gray-800 border border-gray-600 rounded"></div>
                        <span className="text-sm font-medium">Sombre</span>
                        {theme === 'dark' && <Badge>Actuel</Badge>}
                      </div>
                    </Card>

                    <Card 
                      className={`p-4 cursor-pointer border-2 ${theme === 'auto' ? 'border-blue-500 bg-blue-50' : 'border-gray-200'}`}
                      onClick={() => handleThemeChange('auto')}
                    >
                      <div className="flex flex-col items-center space-y-2">
                        <div className="w-8 h-8 bg-gradient-to-r from-white to-gray-800 border border-gray-300 rounded"></div>
                        <span className="text-sm font-medium">Auto</span>
                        {theme === 'auto' && <Badge>Actuel</Badge>}
                      </div>
                    </Card>
                  </div>

                  <p className="text-sm text-muted-foreground">
                    {theme === 'light' && "Thème clair toujours activé"}
                    {theme === 'dark' && "Thème sombre toujours activé"}
                    {theme === 'auto' && "Suit les préférences système de votre appareil"}
                  </p>
                </div>

                <Separator />

                <div className="space-y-4">
                  <h3 className="font-semibold">Affichage</h3>
                  
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label>Mode compact</Label>
                        <p className="text-sm text-muted-foreground">Réduire l'espacement pour afficher plus d'informations</p>
                      </div>
                      <Switch />
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label>Animations</Label>
                        <p className="text-sm text-muted-foreground">Activer les transitions et animations</p>
                      </div>
                      <Switch defaultChecked />
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label>Sidebar réduite</Label>
                        <p className="text-sm text-muted-foreground">Masquer les textes de la barre latérale</p>
                      </div>
                      <Switch />
                    </div>
                  </div>
                </div>

                <Button onClick={() => handleSave("apparence")}>
                  <Save className="h-4 w-4 mr-2" />
                  Sauvegarder l'apparence
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Paramètres Notifications */}
          <TabsContent value="notifications">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Bell className="h-5 w-5" />
                  <span>Notifications</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <h3 className="font-semibold flex items-center space-x-2">
                    <Mail className="h-4 w-4" />
                    <span>Notifications Email</span>
                  </h3>
                  
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label>Nouvelles candidatures</Label>
                        <p className="text-sm text-muted-foreground">Recevoir un email à chaque nouvelle candidature</p>
                      </div>
                      <Switch
                        checked={notifications.emailNewApplications}
                        onCheckedChange={(checked) => setNotifications({...notifications, emailNewApplications: checked})}
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label>Contrats signés</Label>
                        <p className="text-sm text-muted-foreground">Notification lorsqu'un contrat est signé</p>
                      </div>
                      <Switch
                        checked={notifications.emailContractSigned}
                        onCheckedChange={(checked) => setNotifications({...notifications, emailContractSigned: checked})}
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label>Rappels de mission</Label>
                        <p className="text-sm text-muted-foreground">Rappels avant le début des missions</p>
                      </div>
                      <Switch
                        checked={notifications.emailMissionReminders}
                        onCheckedChange={(checked) => setNotifications({...notifications, emailMissionReminders: checked})}
                      />
                    </div>
                  </div>
                </div>

                <Separator />

                <div className="space-y-4">
                  <h3 className="font-semibold flex items-center space-x-2">
                    <Smartphone className="h-4 w-4" />
                    <span>Notifications SMS</span>
                  </h3>
                  
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label>Alertes urgentes</Label>
                        <p className="text-sm text-muted-foreground">SMS pour les situations urgentes</p>
                      </div>
                      <Switch
                        checked={notifications.smsUrgentAlerts}
                        onCheckedChange={(checked) => setNotifications({...notifications, smsUrgentAlerts: checked})}
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label>Absences personnel</Label>
                        <p className="text-sm text-muted-foreground">SMS en cas d'absence de dernière minute</p>
                      </div>
                      <Switch
                        checked={notifications.smsStaffAbsence}
                        onCheckedChange={(checked) => setNotifications({...notifications, smsStaffAbsence: checked})}
                      />
                    </div>
                  </div>
                </div>

                <Button onClick={() => handleSave("notifications")}>
                  <Save className="h-4 w-4 mr-2" />
                  Sauvegarder les préférences
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Paramètres Matching IA Hybride */}
          <TabsContent value="matching">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Users className="h-5 w-5" />
                  <span>Algorithme de Matching Hybride</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                  <h3 className="font-semibold text-blue-800 mb-2">Système Hybride Déterministe</h3>
                  <p className="text-sm text-blue-600">
                    Algorithme 8-critères totalement transparent et explicable, sans IA externe. 
                    Matching basé sur des règles métier précises et pondérations configurables.
                  </p>
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Matching automatique</Label>
                    <p className="text-sm text-muted-foreground">Activer le matching automatique des candidats</p>
                  </div>
                  <Switch
                    checked={matching.autoMatching}
                    onCheckedChange={(checked) => setMatching({...matching, autoMatching: checked})}
                  />
                </div>

                <div className="space-y-6">
                  <div className="space-y-4">
                    <h3 className="font-semibold">Critères Obligatoires (70% - Non modifiables)</h3>
                    <div className="bg-gray-50 p-4 rounded-lg border">
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div className="flex justify-between">
                          <span>1. Correspondance spécialisation</span>
                          <span className="font-medium">30%</span>
                        </div>
                        <div className="flex justify-between">
                          <span>2. Expérience requise</span>
                          <span className="font-medium">20%</span>
                        </div>
                        <div className="flex justify-between">
                          <span>3. Proximité géographique</span>
                          <span className="font-medium">15%</span>
                        </div>
                        <div className="flex justify-between">
                          <span>4. Note évaluations</span>
                          <span className="font-medium">5%</span>
                        </div>
                      </div>
                      <p className="text-xs text-muted-foreground mt-2">
                        Ces pondérations sont fixes pour garantir la cohérence du matching.
                      </p>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h3 className="font-semibold">Critères Personnalisables (30% - À votre choix)</h3>
                    <p className="text-sm text-muted-foreground">
                      Répartissez les 30% restants selon vos priorités d'établissement :
                    </p>
                    
                    <div className="grid grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <Label>5. Disponibilité horaire</Label>
                        <Select defaultValue="15">
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="5">5%</SelectItem>
                            <SelectItem value="10">10%</SelectItem>
                            <SelectItem value="15">15%</SelectItem>
                            <SelectItem value="20">20%</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label>6. Certifications supplémentaires</Label>
                        <Select defaultValue="8">
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="3">3%</SelectItem>
                            <SelectItem value="5">5%</SelectItem>
                            <SelectItem value="8">8%</SelectItem>
                            <SelectItem value="12">12%</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label>7. Historique collaborations</Label>
                        <Select defaultValue="5">
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="2">2%</SelectItem>
                            <SelectItem value="5">5%</SelectItem>
                            <SelectItem value="8">8%</SelectItem>
                            <SelectItem value="10">10%</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label>8. Préférences linguistiques</Label>
                        <Select defaultValue="2">
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="1">1%</SelectItem>
                            <SelectItem value="2">2%</SelectItem>
                            <SelectItem value="3">3%</SelectItem>
                            <SelectItem value="5">5%</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="bg-blue-50 p-3 rounded-lg border border-blue-200">
                      <p className="text-sm text-blue-700">
                        <strong>Total personnalisable :</strong> 30% (15% + 8% + 5% + 2% = 30%)
                      </p>
                      <p className="text-xs text-blue-600 mt-1">
                        Assurez-vous que la somme des critères personnalisables = 30%
                      </p>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="font-semibold">Seuils de Filtrage</h3>
                  
                  <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="minScore">Score minimum requis</Label>
                      <Select value="70">
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="60">60% (Permissif)</SelectItem>
                          <SelectItem value="70">70% (Standard)</SelectItem>
                          <SelectItem value="80">80% (Strict)</SelectItem>
                          <SelectItem value="90">90% (Très strict)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="maxDistance">Distance maximale (km)</Label>
                      <Select value={matching.maxDistance.toString()} onValueChange={(value) => setMatching({...matching, maxDistance: parseInt(value)})}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="25">25 km</SelectItem>
                          <SelectItem value="50">50 km</SelectItem>
                          <SelectItem value="100">100 km</SelectItem>
                          <SelectItem value="200">200 km</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <h3 className="font-semibold">Options Avancées</h3>
                  
                  <div className="flex items-center justify-between">
                    <Label>Exclure les candidats indisponibles</Label>
                    <Switch
                      checked={matching.prioritizeAvailability}
                      onCheckedChange={(checked) => setMatching({...matching, prioritizeAvailability: checked})}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <Label>Bonus pour collaborations passées</Label>
                    <Switch
                      checked={matching.prioritizeExperience}
                      onCheckedChange={(checked) => setMatching({...matching, prioritizeExperience: checked})}
                    />
                  </div>
                </div>

                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="font-medium mb-2">Aperçu Configuration</h4>
                  <p className="text-sm text-muted-foreground">
                    <strong>Critères fixes (70%) :</strong> Spécialisation 30%, Expérience 20%, Géographie 15%, Notes 5%
                    <br />
                    <strong>Critères personnalisables (30%) :</strong> Disponibilité 15%, Certifications 8%, Historique 5%, Langue 2%
                    <br />
                    <strong>Seuils :</strong> Score minimum 70%, Distance max {matching.maxDistance}km
                  </p>
                </div>

                <Button onClick={() => handleSave("matching")}>
                  <Save className="h-4 w-4 mr-2" />
                  Sauvegarder la configuration hybride
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Paramètres Sécurité */}
          <TabsContent value="security">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Shield className="h-5 w-5" />
                  <span>Sécurité</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Authentification à deux facteurs</Label>
                    <p className="text-sm text-muted-foreground">Sécurité renforcée avec code SMS</p>
                  </div>
                  <Switch
                    checked={security.twoFactorAuth}
                    onCheckedChange={(checked) => setSecurity({...security, twoFactorAuth: checked})}
                  />
                </div>

                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="sessionTimeout">Expiration de session (minutes)</Label>
                    <Select value={security.sessionTimeout.toString()} onValueChange={(value) => setSecurity({...security, sessionTimeout: parseInt(value)})}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="15">15 minutes</SelectItem>
                        <SelectItem value="30">30 minutes</SelectItem>
                        <SelectItem value="60">1 heure</SelectItem>
                        <SelectItem value="120">2 heures</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="passwordExpiry">Expiration mot de passe (jours)</Label>
                    <Select value={security.passwordExpiry.toString()} onValueChange={(value) => setSecurity({...security, passwordExpiry: parseInt(value)})}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="30">30 jours</SelectItem>
                        <SelectItem value="60">60 jours</SelectItem>
                        <SelectItem value="90">90 jours</SelectItem>
                        <SelectItem value="180">180 jours</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Label>Alertes de connexion</Label>
                    <Switch
                      checked={security.loginAlerts}
                      onCheckedChange={(checked) => setSecurity({...security, loginAlerts: checked})}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <Label>Chiffrement des données</Label>
                    <Switch
                      checked={security.dataEncryption}
                      onCheckedChange={(checked) => setSecurity({...security, dataEncryption: checked})}
                    />
                  </div>
                </div>

                <Button onClick={() => handleSave("sécurité")}>
                  <Save className="h-4 w-4 mr-2" />
                  Sauvegarder la sécurité
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Paramètres Facturation */}
          <TabsContent value="billing">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <CreditCard className="h-5 w-5" />
                  <span>Facturation</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="bg-blue-50 p-4 rounded-lg">
                  <div className="flex justify-between items-center">
                    <div>
                      <h3 className="font-semibold">Plan Professional</h3>
                      <p className="text-sm text-muted-foreground">50 missions par mois • Support prioritaire • IA avancée</p>
                    </div>
                    <Badge variant="default">Actuel</Badge>
                  </div>
                  <div className="mt-2">
                    <span className="text-2xl font-bold">299€</span>
                    <span className="text-muted-foreground">/mois</span>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="invoiceEmail">Email de facturation</Label>
                    <Input
                      id="invoiceEmail"
                      type="email"
                      value={billing.invoiceEmail}
                      onChange={(e) => setBilling({...billing, invoiceEmail: e.target.value})}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="billingAddress">Adresse de facturation</Label>
                    <Textarea
                      id="billingAddress"
                      value={billing.billingAddress}
                      onChange={(e) => setBilling({...billing, billingAddress: e.target.value})}
                      rows={2}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <Label>Renouvellement automatique</Label>
                    <Switch
                      checked={billing.autoRenewal}
                      onCheckedChange={(checked) => setBilling({...billing, autoRenewal: checked})}
                    />
                  </div>
                </div>

                <div className="flex space-x-4">
                  <Button onClick={() => handleSave("facturation")}>
                    <Save className="h-4 w-4 mr-2" />
                    Sauvegarder
                  </Button>
                  <Button variant="outline">
                    <Download className="h-4 w-4 mr-2" />
                    Télécharger factures
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Paramètres Avancés */}
          <TabsContent value="advanced">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Settings className="h-5 w-5" />
                  <span>Paramètres Avancés</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <h3 className="font-semibold">Gestion des données</h3>
                  
                  <div className="flex space-x-4">
                    <Button variant="outline" onClick={handleExportData}>
                      <Download className="h-4 w-4 mr-2" />
                      Exporter toutes les données
                    </Button>
                    <Button variant="outline">
                      <Upload className="h-4 w-4 mr-2" />
                      Importer des données
                    </Button>
                  </div>
                </div>

                <Separator />

                <div className="space-y-4">
                  <h3 className="font-semibold">Intégrations</h3>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <Card className="p-4">
                      <div className="flex justify-between items-center">
                        <div>
                          <h4 className="font-medium">API REST</h4>
                          <p className="text-sm text-muted-foreground">Intégration avec vos systèmes</p>
                        </div>
                        <Badge variant="secondary">Configuré</Badge>
                      </div>
                    </Card>
                    
                    <Card className="p-4">
                      <div className="flex justify-between items-center">
                        <div>
                          <h4 className="font-medium">Webhook</h4>
                          <p className="text-sm text-muted-foreground">Notifications en temps réel</p>
                        </div>
                        <Badge variant="outline">Non configuré</Badge>
                      </div>
                    </Card>
                  </div>
                </div>

                <Separator />

                <div className="space-y-4">
                  <h3 className="font-semibold text-red-600 flex items-center space-x-2">
                    <AlertTriangle className="h-4 w-4" />
                    <span>Zone dangereuse</span>
                  </h3>
                  
                  <div className="bg-red-50 p-4 rounded-lg border border-red-200">
                    <div className="space-y-2">
                      <h4 className="font-medium text-red-800">Supprimer le compte</h4>
                      <p className="text-sm text-red-600">
                        Cette action supprimera définitivement votre compte et toutes les données associées.
                        Cette action est irréversible.
                      </p>
                      <Button 
                        variant="destructive" 
                        onClick={handleDeleteAccount}
                        className="mt-2"
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Supprimer le compte
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}