import { useState, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from "@/components/ui/dialog";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import {
  Plus,
  Edit,
  Trash2,
  Clock,
  MapPin,
  Users,
  Copy,
  Save,
  Heart,
  Building,
  Search,
  Filter,
  Star,
  Loader2
} from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";

interface MissionTemplate {
  id: number;
  name: string;
  title: string;
  description?: string;
  specialization: string;
  requirements?: string;
  responsibilities?: string;
  hourlyRate?: number;
  shiftDuration?: number;
  preferredShifts?: string[];
  urgencyLevel?: string;
  minExperience?: number;
  requiredCertifications?: string[];
  preferredSpecializations?: string[];
  tags?: string[];
  estimatedDuration?: number;
  maxDistance?: number;
  category?: string;
  isActive?: boolean;
  usageCount?: number;
  lastUsedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export default function MissionTemplates() {
  const [templates, setTemplates] = useState<MissionTemplate[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<MissionTemplate | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterCategory, setFilterCategory] = useState<string>("all");
  const { toast } = useToast();

  const [newTemplate, setNewTemplate] = useState({
    name: "",
    title: "",
    description: "",
    specialization: "",
    category: "",
    hourlyRate: 0,
    shiftDuration: 8,
    urgencyLevel: "medium",
    minExperience: 0,
    requirements: "",
    responsibilities: ""
  });

  const categories = [
    { value: "urgences", label: "Urgences" },
    { value: "reanimation", label: "Réanimation" },
    { value: "geriatrie", label: "Gériatrie" },
    { value: "chirurgie", label: "Chirurgie" },
    { value: "pediatrie", label: "Pédiatrie" },
    { value: "maternite", label: "Maternité" }
  ];

  const urgencyLevels = [
    { value: "low", label: "Faible" },
    { value: "medium", label: "Moyenne" },
    { value: "high", label: "Élevée" },
    { value: "critical", label: "Critique" }
  ];

  // Charger les templates depuis l'API
  const loadTemplates = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/establishment/templates', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (!response.ok) {
        throw new Error('Erreur lors du chargement des templates');
      }

      const data = await response.json();
      setTemplates(data);
    } catch (error) {
      console.error('Erreur chargement templates:', error);
      toast({
        title: "Erreur",
        description: "Impossible de charger les templates",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadTemplates();
  }, []);

  const filteredTemplates = templates.filter(template => {
    const matchesSearch = template.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         template.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         template.specialization.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = filterCategory === "all" || template.category === filterCategory;
    return matchesSearch && matchesCategory;
  });

  const handleCreateTemplate = async () => {
    try {
      const response = await fetch('/api/establishment/templates', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          name: newTemplate.name,
          title: newTemplate.title,
          description: newTemplate.description,
          specialization: newTemplate.specialization,
          category: newTemplate.category,
          hourlyRate: newTemplate.hourlyRate,
          shiftDuration: newTemplate.shiftDuration,
          urgencyLevel: newTemplate.urgencyLevel,
          minExperience: newTemplate.minExperience,
          requirements: newTemplate.requirements,
          responsibilities: newTemplate.responsibilities
        })
      });

      if (!response.ok) {
        throw new Error('Erreur lors de la création du template');
      }

      const template = await response.json();
    setTemplates([...templates, template]);
    setNewTemplate({
      name: "",
      title: "",
      description: "",
        specialization: "",
        category: "",
      hourlyRate: 0,
        shiftDuration: 8,
        urgencyLevel: "medium",
        minExperience: 0,
        requirements: "",
        responsibilities: ""
    });
    setIsCreateDialogOpen(false);

      toast({
        title: "Succès",
        description: "Template créé avec succès"
      });
    } catch (error) {
      console.error('Erreur création template:', error);
      toast({
        title: "Erreur",
        description: "Impossible de créer le template",
        variant: "destructive"
      });
    }
  };

  const [, setLocation] = useLocation();

  const handleUseTemplate = async (template: MissionTemplate) => {
    try {
      const response = await fetch(`/api/establishment/templates/${template.id}/publish`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          startDate: new Date(),
          endDate: new Date(Date.now() + 24 * 60 * 60 * 1000) // 24h par défaut
        })
      });

      if (!response.ok) {
        throw new Error('Erreur lors de la publication du template');
      }

      const mission = await response.json();

      toast({
        title: "Succès",
        description: "Mission créée à partir du template"
      });

      // Recharger les templates pour mettre à jour les statistiques
      loadTemplates();

      // Rediriger vers le dashboard
      setLocation('/establishment-dashboard');
    } catch (error) {
      console.error('Erreur publication template:', error);
      toast({
        title: "Erreur",
        description: "Impossible de publier le template",
        variant: "destructive"
      });
    }
  };

  const handleDeleteTemplate = async (id: number) => {
    if (!confirm("Êtes-vous sûr de vouloir supprimer ce template ?")) {
      return;
    }

    try {
      const response = await fetch(`/api/establishment/templates/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (!response.ok) {
        throw new Error('Erreur lors de la suppression du template');
      }

      setTemplates(templates.filter(t => t.id !== id));

      toast({
        title: "Succès",
        description: "Template supprimé avec succès"
      });
    } catch (error) {
      console.error('Erreur suppression template:', error);
      toast({
        title: "Erreur",
        description: "Impossible de supprimer le template",
        variant: "destructive"
      });
    }
  };

  const handleUpdateTemplate = async () => {
    if (!editingTemplate) return;

    try {
      const response = await fetch(`/api/establishment/templates/${editingTemplate.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          name: editingTemplate.name,
          title: editingTemplate.title,
          description: editingTemplate.description,
          specialization: editingTemplate.specialization,
          category: editingTemplate.category,
          hourlyRate: editingTemplate.hourlyRate,
          shiftDuration: editingTemplate.shiftDuration,
          urgencyLevel: editingTemplate.urgencyLevel,
          minExperience: editingTemplate.minExperience,
          requirements: editingTemplate.requirements,
          responsibilities: editingTemplate.responsibilities
        })
      });

      if (!response.ok) {
        throw new Error('Erreur lors de la mise à jour du template');
      }

      const updatedTemplate = await response.json();
      setTemplates(templates.map(t =>
        t.id === editingTemplate.id ? updatedTemplate : t
      ));
    setEditingTemplate(null);

      toast({
        title: "Succès",
        description: "Template mis à jour avec succès"
      });
    } catch (error) {
      console.error('Erreur mise à jour template:', error);
      toast({
        title: "Erreur",
        description: "Impossible de mettre à jour le template",
        variant: "destructive"
      });
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case "urgences": return "bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400";
      case "reanimation": return "bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-400";
      case "geriatrie": return "bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400";
      case "chirurgie": return "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400";
      case "pediatrie": return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400";
      case "maternite": return "bg-pink-100 text-pink-800 dark:bg-pink-900/20 dark:text-pink-400";
      default: return "bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400";
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-background">
      {/* Navigation */}
      <nav className="bg-white dark:bg-card shadow-sm border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link href="/">
              <div className="flex items-center space-x-3 cursor-pointer">
                <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-emerald-500 rounded-lg flex items-center justify-center">
                  <Heart className="w-4 h-4 text-white" />
                </div>
                <span className="font-semibold text-xl text-foreground">NurseLink AI</span>
              </div>
            </Link>

            <div className="flex items-center space-x-4">
              <Button asChild variant="outline">
                <Link href="/establishment-dashboard-demo">
                  <Building className="w-4 h-4 mr-2" />
                  Dashboard
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* En-tête */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Templates de Missions</h1>
            <p className="text-muted-foreground mt-2">
              Créez et gérez vos templates pour accélérer la création de missions récurrentes
            </p>
          </div>

          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                Nouveau Template
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Créer un nouveau template</DialogTitle>
                <DialogDescription>
                  Définissez les informations de base pour votre template de mission
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-4">
                <div>
                  <Label htmlFor="name">Nom du template</Label>
                  <Input
                    id="name"
                    value={newTemplate.name}
                    onChange={(e) => setNewTemplate({...newTemplate, name: e.target.value})}
                    placeholder="ex: Template Urgences Standard"
                  />
                </div>

                <div>
                  <Label htmlFor="title">Titre de la mission</Label>
                  <Input
                    id="title"
                    value={newTemplate.title}
                    onChange={(e) => setNewTemplate({...newTemplate, title: e.target.value})}
                    placeholder="ex: Infirmier DE - Service Urgences"
                  />
                </div>

                <div>
                  <Label htmlFor="specialization">Spécialisation</Label>
                  <Input
                    id="specialization"
                    value={newTemplate.specialization}
                    onChange={(e) => setNewTemplate({...newTemplate, specialization: e.target.value})}
                    placeholder="ex: Infirmier DE - Service Urgences"
                  />
                </div>

                <div>
                  <Label htmlFor="category">Catégorie</Label>
                  <Select value={newTemplate.category} onValueChange={(value) =>
                    setNewTemplate({...newTemplate, category: value as MissionTemplate["category"]})
                  }>
                    <SelectTrigger>
                      <SelectValue placeholder="Sélectionner une catégorie" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map(cat => (
                        <SelectItem key={cat.value} value={cat.value}>{cat.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="shiftDuration">Durée du poste</Label>
                    <Input
                      id="shiftDuration"
                      type="number"
                      value={newTemplate.shiftDuration}
                      onChange={(e) => setNewTemplate({...newTemplate, shiftDuration: Number(e.target.value)})}
                    />
                  </div>

                  <div>
                    <Label htmlFor="hourlyRate">Tarif horaire (€)</Label>
                    <Input
                      id="hourlyRate"
                      type="number"
                      value={newTemplate.hourlyRate}
                      onChange={(e) => setNewTemplate({...newTemplate, hourlyRate: Number(e.target.value)})}
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="urgencyLevel">Niveau d'urgence</Label>
                  <Select value={newTemplate.urgencyLevel} onValueChange={(value) =>
                    setNewTemplate({...newTemplate, urgencyLevel: value as MissionTemplate["urgencyLevel"]})
                  }>
                    <SelectTrigger>
                      <SelectValue placeholder="Sélectionner un niveau d'urgence" />
                    </SelectTrigger>
                    <SelectContent>
                      {urgencyLevels.map(level => (
                        <SelectItem key={level.value} value={level.value}>{level.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="minExperience">Expérience minimale</Label>
                  <Input
                    id="minExperience"
                    type="number"
                    value={newTemplate.minExperience}
                    onChange={(e) => setNewTemplate({...newTemplate, minExperience: Number(e.target.value)})}
                  />
                </div>
              </div>

              <div className="flex justify-end space-x-2 mt-6">
                <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                  Annuler
                </Button>
                <Button onClick={handleCreateTemplate} disabled={!newTemplate.name || !newTemplate.title}>
                  <Save className="w-4 h-4 mr-2" />
                  Créer le template
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Dialog d'édition de template */}
        <Dialog open={!!editingTemplate} onOpenChange={() => setEditingTemplate(null)}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Modifier le template</DialogTitle>
              <DialogDescription>
                Modifiez les informations de votre template de mission
              </DialogDescription>
            </DialogHeader>

            {editingTemplate && (
              <div className="space-y-4">
                <div>
                  <Label htmlFor="edit-name">Nom du template</Label>
                  <Input
                    id="edit-name"
                    value={editingTemplate.name}
                    onChange={(e) => setEditingTemplate({...editingTemplate, name: e.target.value})}
                    placeholder="ex: Template Urgences Standard"
                  />
                </div>

                <div>
                  <Label htmlFor="edit-title">Titre du poste</Label>
                  <Input
                    id="edit-title"
                    value={editingTemplate.title}
                    onChange={(e) => setEditingTemplate({...editingTemplate, title: e.target.value})}
                    placeholder="ex: Infirmier DE - Service Urgences"
                  />
                </div>

                  <div>
                  <Label htmlFor="edit-specialization">Spécialisation</Label>
                    <Input
                    id="edit-specialization"
                    value={editingTemplate.specialization}
                    onChange={(e) => setEditingTemplate({...editingTemplate, specialization: e.target.value})}
                    placeholder="ex: Infirmier DE - Service Urgences"
                    />
                  </div>

                  <div>
                    <Label htmlFor="edit-category">Catégorie</Label>
                    <select
                      id="edit-category"
                      value={editingTemplate.category}
                      onChange={(e) => setEditingTemplate({...editingTemplate, category: e.target.value as MissionTemplate["category"]})}
                      className="w-full px-3 py-2 border border-input bg-background rounded-md text-sm"
                    >
                      <option value="">Sélectionner une catégorie</option>
                      {categories.map((cat) => (
                        <option key={cat.value} value={cat.value}>
                          {cat.label}
                        </option>
                      ))}
                    </select>
                </div>
              </div>
            )}

            <div className="flex justify-end space-x-2 mt-6">
              <Button variant="outline" onClick={() => setEditingTemplate(null)}>
                Annuler
              </Button>
              <Button onClick={handleUpdateTemplate} disabled={!editingTemplate?.name || !editingTemplate?.title}>
                <Save className="w-4 h-4 mr-2" />
                Sauvegarder
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* Filtres et recherche */}
        <div className="flex space-x-4 mb-6">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input
                placeholder="Rechercher un template..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          <Select value={filterCategory} onValueChange={setFilterCategory}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Toutes les catégories" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Toutes les catégories</SelectItem>
              {categories.map(cat => (
                <SelectItem key={cat.value} value={cat.value}>{cat.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Liste des templates */}
        {isLoading ? (
          <div className="flex justify-center items-center py-12">
            <div className="flex items-center space-x-2">
              <Loader2 className="w-6 h-6 animate-spin" />
              <span>Chargement des templates...</span>
            </div>
          </div>
        ) : filteredTemplates.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
              <Copy className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-foreground mb-2">Aucun template trouvé</h3>
            <p className="text-muted-foreground mb-4">
              {searchTerm || filterCategory !== "all"
                ? "Aucun template ne correspond à vos critères de recherche"
                : "Créez votre premier template pour accélérer la création de missions"
              }
            </p>
            {!searchTerm && filterCategory === "all" && (
              <Button onClick={() => setIsCreateDialogOpen(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Créer un template
              </Button>
            )}
          </div>
        ) : (
        <div className="grid gap-6">
          {filteredTemplates.map((template) => (
            <Card key={template.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <h3 className="font-semibold text-lg">{template.name}</h3>
                        {template.category && (
                      <Badge className={getCategoryColor(template.category)}>
                        {categories.find(c => c.value === template.category)?.label}
                      </Badge>
                        )}
                      <div className="flex items-center space-x-1 text-sm text-muted-foreground">
                        <Star className="w-4 h-4" />
                          <span>Utilisé {template.usageCount || 0} fois</span>
                        </div>
                    </div>

                    <h4 className="font-medium text-foreground mb-2">{template.title}</h4>
                      {template.description && (
                    <p className="text-muted-foreground mb-4">{template.description}</p>
                      )}

                    <div className="flex items-center space-x-6 text-sm text-muted-foreground">
                      <div className="flex items-center space-x-1">
                        <MapPin className="w-4 h-4" />
                          <span>{template.specialization}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Clock className="w-4 h-4" />
                          <span>{template.shiftDuration || 8}h</span>
                        </div>
                        {template.hourlyRate && (
                          <div className="flex items-center space-x-1">
                            <span className="font-medium">{template.hourlyRate}€/h</span>
                      </div>
                        )}
                        {template.urgencyLevel && (
                      <div className="flex items-center space-x-1">
                            <span className={`px-2 py-1 rounded text-xs ${
                              template.urgencyLevel === 'critical' ? 'bg-red-100 text-red-800' :
                              template.urgencyLevel === 'high' ? 'bg-orange-100 text-orange-800' :
                              template.urgencyLevel === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                              'bg-green-100 text-green-800'
                            }`}>
                              {urgencyLevels.find(u => u.value === template.urgencyLevel)?.label}
                            </span>
                          </div>
                        )}
                      </div>

                      {template.requirements && (
                        <div className="mt-4">
                          <h5 className="text-sm font-medium text-foreground mb-2">Compétences requises :</h5>
                          <p className="text-sm text-muted-foreground">{template.requirements}</p>
                        </div>
                      )}
                  </div>

                    <div className="flex items-center space-x-2 ml-4">
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleUseTemplate(template)}
                          >
                            <Copy className="w-4 h-4 mr-2" />
                              Utiliser
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                            <p>Créer une mission à partir de ce template</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>

                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setEditingTemplate(template)}
                          >
                              <Edit className="w-4 h-4" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                            <p>Modifier le template</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>

                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDeleteTemplate(template.id)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>Supprimer le template</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </div>
                </div>
              </CardContent>
            </Card>
          ))}
          </div>
        )}
      </div>
    </div>
  );
}
