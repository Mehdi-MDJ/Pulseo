import { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, Sparkles, TrendingUp, DollarSign, Calendar, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Link } from 'wouter';

interface ConversationMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  suggestions?: string[];
  actions?: RecommendedAction[];
}

interface RecommendedAction {
  type: string;
  label: string;
  url?: string;
}

export default function AIAssistantDemo() {
  const [messages, setMessages] = useState<ConversationMessage[]>([
    {
      role: 'assistant',
      content: 'Bonjour ! Je suis votre assistant IA personnel NurseLink. Je peux vous aider avec vos missions, négocier des tarifs, planifier votre carrière ou optimiser votre profil. Comment puis-je vous accompagner aujourd\'hui ?',
      timestamp: new Date(),
      suggestions: [
        'Trouve-moi des missions adaptées',
        'Comment améliorer mon profil ?',
        'Planifie ma carrière',
        'Aide-moi à négocier un tarif'
      ]
    }
  ]);
  const [currentMessage, setCurrentMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(scrollToBottom, [messages]);

  // Données de démonstration pour les recommandations
  const demoRecommendations = {
    missions: [
      {
        title: "Infirmier de nuit - Réanimation",
        hourlyRate: 28,
        specialization: "Réanimation",
        establishment: "CHU Lyon Sud"
      },
      {
        title: "Infirmier Urgences",
        hourlyRate: 25,
        specialization: "Urgences", 
        establishment: "Clinique Saint-Joseph"
      },
      {
        title: "Infirmier Pédiatrie",
        hourlyRate: 26,
        specialization: "Pédiatrie",
        establishment: "Hôpital des Enfants"
      }
    ]
  };

  const generateDemoResponse = (userMessage: string): ConversationMessage => {
    const lowerMessage = userMessage.toLowerCase();
    
    if (lowerMessage.includes('mission') || lowerMessage.includes('trouve')) {
      return {
        role: 'assistant',
        content: `J'ai analysé votre profil et trouvé 3 missions parfaitement adaptées à vos compétences en réanimation. Voici mes recommandations basées sur votre expérience de 5 ans et votre spécialisation :

🏥 **Mission prioritaire :** Infirmier de nuit en Réanimation au CHU Lyon Sud
• Tarif : 28€/h (excellent pour votre profil)
• Compatibilité : 94% avec vos compétences
• Urgence : Haute - Besoin immédiat

Les deux autres missions sont également très intéressantes avec des taux de compatibilité de 87% et 82%.`,
        timestamp: new Date(),
        suggestions: [
          'Postule à cette mission',
          'Vois les autres missions',
          'Négocie le tarif',
          'Prépare mon CV'
        ],
        actions: [
          { type: 'apply', label: '💼 Postuler à la mission prioritaire', url: '/contract-demo' },
          { type: 'view', label: '👀 Voir toutes les missions' },
          { type: 'negotiate', label: '💰 Négocier le tarif' }
        ]
      };
    }
    
    if (lowerMessage.includes('profil') || lowerMessage.includes('améliorer')) {
      return {
        role: 'assistant',
        content: `Analyse de votre profil terminée ! Voici mes recommandations pour optimiser votre attractivité :

✅ **Points forts :**
• Expérience solide en réanimation (5 ans)
• Certifications à jour (BLS, ACLS)
• Disponibilité flexible (matin/nuit)

🎯 **Améliorations suggérées :**
• Ajouter une spécialisation en soins intensifs (+15% de missions)
• Mettre à jour votre photo de profil
• Compléter la section "Références professionnelles"

Ces optimisations pourraient augmenter vos chances de sélection de 23% !`,
        timestamp: new Date(),
        suggestions: [
          'Comment ajouter une spécialisation ?',
          'Aide pour les références',
          'Optimise ma photo',
          'Calcule mon nouveau score'
        ],
        actions: [
          { type: 'profile', label: '✏️ Modifier mon profil', url: '/profile-creator' },
          { type: 'certification', label: '🎓 Voir les formations disponibles' }
        ]
      };
    }
    
    if (lowerMessage.includes('carrière') || lowerMessage.includes('planifie')) {
      return {
        role: 'assistant',
        content: `Plan de carrière personnalisé basé sur votre profil et les tendances du marché :

📈 **Évolution recommandée (12-18 mois) :**
1. **Spécialisation avancée** : Formation en soins intensifs
2. **Leadership** : Référent d'équipe sur missions longues
3. **Expertise technique** : Certification en nouvelles technologies médicales

💰 **Projection salariale :**
• Actuel : 25-28€/h
• Objectif 12 mois : 30-35€/h (+20%)
• Objectif 18 mois : 35-40€/h (+40%)

🎯 **Prochaines étapes immédiates :**
• Accepter 2-3 missions en réanimation pour renforcer l'expertise
• Commencer la formation soins intensifs (3 mois)`,
        timestamp: new Date(),
        suggestions: [
          'Trouve des formations',
          'Calcule mon potentiel',
          'Vois les tendances marché',
          'Planifie mes missions'
        ],
        actions: [
          { type: 'training', label: '🎓 Formations recommandées' },
          { type: 'analytics', label: '📊 Voir les analytics de carrière', url: '/analytics-demo' }
        ]
      };
    }
    
    if (lowerMessage.includes('tarif') || lowerMessage.includes('négoci')) {
      return {
        role: 'assistant',
        content: `Analyse de négociation pour votre profil en réanimation :

💡 **Stratégie recommandée :**
Votre expérience de 5 ans et vos certifications vous donnent un excellent levier de négociation.

📊 **Données du marché :**
• Tarif moyen réanimation : 26€/h
• Votre profil justifie : 28-32€/h
• Prime de nuit possible : +3-5€/h

🎯 **Script de négociation :**
"Mon expérience de 5 ans en réanimation et mes certifications BLS/ACLS me permettent d'assurer une qualité de soins optimale. Le tarif de 30€/h refléterait mieux la valeur que j'apporte."

✅ **Taux de réussite estimé : 78%**`,
        timestamp: new Date(),
        suggestions: [
          'Prépare ma négociation',
          'Vois d\'autres arguments',
          'Calcule ma valeur marché',
          'Simule la discussion'
        ],
        actions: [
          { type: 'negotiate', label: '💬 Simuler la négociation' },
          { type: 'market', label: '📈 Analyse détaillée du marché' }
        ]
      };
    }

    // Réponse générique
    return {
      role: 'assistant',
      content: `Je comprends votre question. En tant qu'assistant IA spécialisé dans les carrières d'infirmiers, je peux vous aider avec :

🎯 **Mes spécialités :**
• Recherche de missions adaptées à votre profil
• Optimisation de votre profil professionnel  
• Négociation de tarifs et conditions
• Planification de carrière personnalisée
• Conseils pour formations et certifications

Comment puis-je vous accompagner plus spécifiquement ?`,
      timestamp: new Date(),
      suggestions: [
        'Trouve-moi des missions',
        'Améliore mon profil',
        'Planifie ma carrière',
        'Négocie mes tarifs'
      ]
    };
  };

  const handleSendMessage = () => {
    if (!currentMessage.trim()) return;

    const userMessage: ConversationMessage = {
      role: 'user',
      content: currentMessage,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setCurrentMessage('');
    setIsTyping(true);

    // Simuler un délai de réponse
    setTimeout(() => {
      const response = generateDemoResponse(currentMessage);
      setMessages(prev => [...prev, response]);
      setIsTyping(false);
    }, 1500);
  };

  const handleSuggestionClick = (suggestion: string) => {
    setCurrentMessage(suggestion);
  };

  const handleActionClick = (action: RecommendedAction) => {
    if (action.url) {
      window.location.href = action.url;
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Navigation */}
      <nav className="bg-white dark:bg-gray-800 border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link href="/">
              <div className="flex items-center space-x-3 cursor-pointer">
                <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                  <Bot className="w-4 h-4 text-white" />
                </div>
                <span className="font-semibold text-xl text-blue-600">NurseLink AI</span>
              </div>
            </Link>
            <div className="flex items-center space-x-4">
              <Link href="/analytics-demo">
                <Button variant="outline">Analytics Démo</Button>
              </Link>
              <Link href="/">
                <Button variant="ghost">Retour Accueil</Button>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      <div className="container mx-auto px-4 py-8">
        {/* En-tête */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 bg-blue-600 rounded-lg">
              <Bot className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                Assistant IA Personnel - Démo
              </h1>
              <p className="text-gray-600 dark:text-gray-300">
                Découvrez votre compagnon intelligent pour optimiser votre carrière
              </p>
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-4 gap-6">
          {/* Panneau latéral avec informations */}
          <div className="lg:col-span-1 space-y-6">
            {/* Actions rapides */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-blue-600" />
                  Actions rapides
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button 
                  variant="outline" 
                  className="w-full justify-start"
                  onClick={() => handleSuggestionClick('Trouve-moi des missions adaptées')}
                >
                  <TrendingUp className="h-4 w-4 mr-2" />
                  Missions recommandées
                </Button>
                <Button 
                  variant="outline" 
                  className="w-full justify-start"
                  onClick={() => handleSuggestionClick('Aide-moi à négocier un tarif')}
                >
                  <DollarSign className="h-4 w-4 mr-2" />
                  Négociation tarifs
                </Button>
                <Button 
                  variant="outline" 
                  className="w-full justify-start"
                  onClick={() => handleSuggestionClick('Planifie ma carrière')}
                >
                  <Calendar className="h-4 w-4 mr-2" />
                  Plan de carrière
                </Button>
                <Button 
                  variant="outline" 
                  className="w-full justify-start"
                  onClick={() => handleSuggestionClick('Comment améliorer mon profil ?')}
                >
                  <FileText className="h-4 w-4 mr-2" />
                  Optimiser profil
                </Button>
              </CardContent>
            </Card>

            {/* Missions recommandées */}
            <Card>
              <CardHeader>
                <CardTitle>Missions pour vous</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {demoRecommendations.missions.slice(0, 3).map((mission, index) => (
                    <div key={index} className="p-3 border rounded-lg">
                      <h4 className="font-medium text-sm">{mission.title}</h4>
                      <p className="text-xs text-gray-600 dark:text-gray-400">
                        {mission.hourlyRate}€/h • {mission.specialization}
                      </p>
                      <p className="text-xs text-gray-500">{mission.establishment}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Profil utilisateur démo */}
            <Card>
              <CardHeader>
                <CardTitle>Votre profil</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Spécialisation:</span>
                    <Badge variant="secondary">Réanimation</Badge>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Expérience:</span>
                    <span>5 ans</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Score profil:</span>
                    <Badge className="bg-green-600">92/100</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Zone de conversation principale */}
          <div className="lg:col-span-3">
            <Card className="h-[600px] flex flex-col">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Bot className="h-5 w-5" />
                  Conversation avec l'assistant IA
                  <Badge variant="outline" className="ml-auto">Mode Démo</Badge>
                </CardTitle>
              </CardHeader>
              
              <CardContent className="flex-1 flex flex-col">
                {/* Messages */}
                <ScrollArea className="flex-1 mb-4">
                  <div className="space-y-4 pr-4">
                    {messages.map((message, index) => (
                      <div key={index} className={`flex gap-3 ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                        {message.role === 'assistant' && (
                          <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-full">
                            <Bot className="h-4 w-4 text-blue-600" />
                          </div>
                        )}
                        
                        <div className={`max-w-[80%] ${message.role === 'user' ? 'order-first' : ''}`}>
                          <div className={`p-3 rounded-lg ${
                            message.role === 'user' 
                              ? 'bg-blue-600 text-white ml-auto' 
                              : 'bg-gray-100 dark:bg-gray-800'
                          }`}>
                            <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                          </div>
                          
                          {/* Suggestions */}
                          {message.suggestions && message.suggestions.length > 0 && (
                            <div className="mt-2 flex flex-wrap gap-1">
                              {message.suggestions.map((suggestion, idx) => (
                                <Button
                                  key={idx}
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleSuggestionClick(suggestion)}
                                  className="text-xs"
                                >
                                  {suggestion}
                                </Button>
                              ))}
                            </div>
                          )}
                          
                          {/* Actions recommandées */}
                          {message.actions && message.actions.length > 0 && (
                            <div className="mt-2 space-y-1">
                              {message.actions.map((action, idx) => (
                                <Button
                                  key={idx}
                                  variant="secondary"
                                  size="sm"
                                  onClick={() => handleActionClick(action)}
                                  className="text-xs w-full justify-start"
                                >
                                  {action.label}
                                </Button>
                              ))}
                            </div>
                          )}
                          
                          <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                            {message.timestamp.toLocaleTimeString()}
                          </div>
                        </div>
                        
                        {message.role === 'user' && (
                          <div className="p-2 bg-blue-600 rounded-full">
                            <User className="h-4 w-4 text-white" />
                          </div>
                        )}
                      </div>
                    ))}
                    
                    {/* Indicateur de frappe */}
                    {isTyping && (
                      <div className="flex gap-3">
                        <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-full">
                          <Bot className="h-4 w-4 text-blue-600" />
                        </div>
                        <div className="bg-gray-100 dark:bg-gray-800 p-3 rounded-lg">
                          <div className="flex space-x-1">
                            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" />
                            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }} />
                            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
                          </div>
                        </div>
                      </div>
                    )}
                    
                    <div ref={messagesEndRef} />
                  </div>
                </ScrollArea>

                {/* Zone de saisie */}
                <div className="flex gap-2">
                  <Input
                    value={currentMessage}
                    onChange={(e) => setCurrentMessage(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="Tapez votre message... (Mode démo - IA simulée)"
                    className="flex-1"
                    disabled={isTyping}
                  />
                  <Button 
                    onClick={handleSendMessage}
                    disabled={!currentMessage.trim() || isTyping}
                  >
                    <Send className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}